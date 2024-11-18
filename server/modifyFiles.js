const { readdir, rm } = require('fs/promises')
const { parse } = require('csv-parse')
const { Readable } = require('stream');
const fs = require('fs')
const axios = require('axios')
const { extractJSON } = require('./label')
const { convertArrayToCSV } = require('convert-array-to-csv')
const { uploadFileToFirebase } = require('./upload')

const { bucket } = require('./upload')


async function clear() {
  const dir = './uploads'
  const files = await readdir(dir)

  await Promise.all(files.map(f => rm(`${dir}/${f}`)))
}

async function getRecords(fileName) {
  const file = bucket.file(`uploads/${fileName}`);
  const [fileData] = await file.download();

  return new Promise((resolve, reject) => {
    const parser = parse({ columns: true }, (err, records) => {
      if (err) {
        return reject(err);
      }
      resolve(records);
    });

    // Create a readable stream from the buffer and pipe it to the parser
    Readable.from(fileData).pipe(parser);
  });
}

async function addEmptyLabels(records, userChosenLabelName) {
  records.forEach(record => {
    record[userChosenLabelName] = ''
  })
}

async function fileNames() {
  const dir = 'uploads/'

  // each file is a big ol object
  const [files] = await bucket.getFiles( { prefix: dir} )

  // files.forEach(file => {
  //   console.log(file.name)
  // })


  let fileInfo = []

  for (const file of files) {

    // Do only for .csv files
    if (file.name.slice(-4) === '.csv') {

      try {
        // can make all this work when json is set up
        const numEntriesResponse = await axios.get('http://127.0.0.1:5000/getNumEntries/'.concat(files[i].slice(0,-4)))
        const numEntries = parseInt(numEntriesResponse.data.length, 10)

        const numUnlabelledEntriesResponse = await axios.get('http://127.0.0.1:5000/getNumUnlabelledEntries/'.concat(files[i].slice(0,-4)))
        const numUnlabelledEntries = parseInt(numUnlabelledEntriesResponse.data.length, 10)
        fileInfo.push({
          filename : file.name.slice(dir.length),
          labelled : ((numEntries - numUnlabelledEntries) / numEntries) * 100
        })
      } catch {

        fileInfo.push({
          filename : file.name.slice(dir.length),
          labelled : 0
        })
      }
    }
  }

  return fileInfo
}

async function recordsToTempJSON(records, fileName) {
  try {
    const jsonString = JSON.stringify(records, null, 4);
    const file = bucket.file(`uploads/${fileName.slice(0, -3)}json`); 

    const stream = file.createWriteStream({
      metadata: {
        contentType: 'application/json', 
      },
    });

    stream.on('error', (err) => {
      console.error('Error uploading JSON to Firebase:', err);
    });

    stream.on('finish', () => {
      console.log('Records have been converted to JSON and uploaded to Firebase.');
    });

    stream.end(jsonString);
  } catch (err) {
    console.error('Error in converting records to JSON:', err);
  }
}

async function readJSON(fileName) {
  try {
    const data = await fs.readFile('./uploads/' + fileName, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON file:', err);
    throw err; 
  }
}


async function writeJSON(fileName, jsonData) {
  try {
    // Create a mock req.file object to pass to uploadFileToFirebase
    const buffer = Buffer.from(JSON.stringify(jsonData, null, 2)); // Convert JSON to a buffer
    const req = {
      file: {
        originalname: fileName,
        mimetype: 'application/json',
        buffer: buffer,
      },
    };

    // Use uploadFileToFirebase to upload the JSON buffer to Firebase Storage
    await new Promise((resolve, reject) => {
      uploadFileToFirebase(req, null, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    console.log('JSON file uploaded successfully to Firebase:', fileName);
  } catch (err) {
    console.error('Error uploading JSON file:', err);
  }
}

const tempJSONtoCSV = async (fileName) => {
  try {
    const records = await extractJSON(fileName);
    let headers = Object.keys(records[0]);
    let fields = [];
    fields.push(headers);
    for (let i = 0; i < records.length; i++) {
      fields.push(Object.values(records[i]));
    }

    const newCSV = convertArrayToCSV(fields, {
      headers,
      separator: ','
    });

    // Upload CSV to Firebase
    const blob = bucket.file(`results/${fileName.slice(0, -5)}.csv`);  // Firebase storage path
    const stream = blob.createWriteStream({
      metadata: {
        contentType: 'text/csv',
      },
    });

    stream.on('error', (err) => {
      console.error('Error uploading CSV to Firebase:', err);
    });

    stream.on('finish', () => {
      console.log('CSV file successfully uploaded to Firebase');
    });

    stream.end(newCSV); // Upload the CSV content to Firebase
  } catch (err) {
    console.error('Error during JSON to CSV conversion:', err);
  }
};



module.exports = { clear, fileNames, getRecords, addEmptyLabels, recordsToTempJSON, readJSON, writeJSON, tempJSONtoCSV }