const { readdir, rm } = require('fs/promises')
const { parse } = require('csv-parse')
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
  const filePath = `./uploads/${fileName}`;
  return new Promise((resolve, reject) => {
    const parser = parse({ columns: true }, (err, records) => {
      if (err) {
        return reject(err);
      }
      resolve(records);
    });
    fs.createReadStream(filePath).pipe(parser);
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
          filename : files[i],
          labelled : ((numEntries - numUnlabelledEntries) / numEntries) * 100
        })
      } catch {

        fileInfo.push({
          filename : file.name,
          labelled : 0
        })
      }
    }
  }

  return fileInfo
}

async function recordsToTempJSON(records, fileName) {
  
  const newFileDir = './uploads/' + fileName.slice(0, -3) + 'json'
  fs.writeFile(newFileDir, JSON.stringify(records, null, 4), (err) => {
    if (err) throw err
    console.log("Records have been converted to json.")
  })
}

async function readJSON(fileName) {
  try {
    const data = await fs.readFile('./uploads/' + fileName, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON file:', err);
    throw err; // Re-throw the error to be caught by the caller
  }
}


async function writeJSON(fileName, updatedRecords) {
  try {
    await fs.writeFileSync('./uploads/' + fileName, JSON.stringify(updatedRecords, null, 2));
    console.log('written to JSON file');
  } catch (err) {
    console.error(err);
  }
}

async function tempJSONtoCSV(fileName) {
  try {
    const records = await extractJSON(fileName)
    let headers = Object.keys(records[0])
    let fields = []
    fields.push(headers)
    for (let i = 0; i < records.length; i++) {
      fields.push(Object.values(records[i]))
    }

    const newCSV = convertArrayToCSV(fields, {
      headers,
      separator: ','
    }) 

    if (!fs.existsSync('./results')) {
      fs.mkdirSync('./results', { recursive: true });
    }

    const newFileName = fileName.slice(0,-5).concat('.csv')
    fs.writeFile(`./results/${newFileName}`, newCSV, (err) => {
      if (err) {
        console.error('Error writing to CSV file', err);
      } else {
        console.log('CSV file saved successfully to /results');
      }
    });
  } catch (err) {
    console.error(err)
  }
}


module.exports = { clear, fileNames, getRecords, addEmptyLabels, recordsToTempJSON, readJSON, writeJSON, tempJSONtoCSV }
