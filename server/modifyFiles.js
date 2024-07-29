const { readdir, rm } = require('fs/promises')
const { parse } = require('csv-parse')
const fs = require('fs')
const axios = require('axios')

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
  const dir = './uploads'
  const files = await readdir(dir)
  let fileInfo = []

  for (let i = 0; i < files.length; i++) {
    if (files[i].slice(-4) === '.csv') {

      try {
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
          filename : files[i],
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


module.exports = { clear, fileNames, getRecords, addEmptyLabels, recordsToTempJSON, readJSON, writeJSON }
