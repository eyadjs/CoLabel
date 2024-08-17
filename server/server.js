const express = require('express')
const app = express() 
const cors = require('cors')
const upload = require('./upload')
const { clear, fileNames, getRecords, addEmptyLabels, recordsToTempJSON, readJSON, writeJSON, tempJSONtoCSV } = require('./modifyFiles')
const { getUnlabelledEntries, extractJSON } = require('./label')
const csv = require('csvtojson')

const bodyParser = require('body-parser')
const axios = require('axios')

app.use(bodyParser.json())
app.use(cors())

// SCRAP THIS
app.post('/upload-single', upload.single('file'), (req, res) => {
    res.json(req.file)
})

app.post('/upload-multiple', upload.array('files', 10), (req, res) => {
  res.json(req.files)
})

app.get('/clear-uploads', async (req, res) => {
  try {
      await clear();
      res.send('Uploads directory cleared!');
  } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred while clearing the uploads directory.');
  }
});


app.get('/files', async(req, res) => {
  try {
    const files = await fileNames()
    res.json(files)
    
    
  } 
  catch (err) {
    console.error(err)
    res.status(500).send('An error occurred while clearing the uploads directory.');
  }
})

app.get('/:fileName', (req, res) => { // write the js code to be run from this route <3
  res.send(`<h1>${req.params.fileName}</h1>`)
})


let labelFieldName = null
app.post('/getLabelFieldName', async (req, res) => { // MAKE THIS FILE SPECIFIC, CURRENTLY IT JUST RETURNS WHATEVER's label field name
  labelFieldName = req.body.data

  res.send({})
  console.log("LFN is "+labelFieldName)
})

let chunkSize = null
app.post('/getChunkSize/:fileName', (req, res) => {
  chunkSize = req.body.data
  res.json("getChunkSize")
  console.log("consoling")
  console.log(chunkSize)
})

app.post('/addEmptyLabels/:fileName', async (req, res) => { // AKA CONFIRM SELECTIONS, START LABELLING
  try {

    const records = await getRecords(req.params.fileName)
    await addEmptyLabels(records, labelFieldName)
    await recordsToTempJSON(records, req.params.fileName)
    res.send(records) // Stored in JSON with same filename
    /*
    Records look like:
    [
      {
          "name": "John Doe",
          "age": "29",
          "city": "New York"
      },
      {
      ...
      }
    ]
    */
    
  } catch (error) {
    res.status(500).send(error)
    console.log(error);
  }
})

app.get('/sendEntriesForLabelling/:fileName', async (req, res) => {
  try {
    const fileNameRaw = req.params.fileName
    const unlabelledEntry = await getUnlabelledEntries(fileNameRaw, chunkSize, labelFieldName)
    res.send(unlabelledEntry)
  } catch {
    res.status(500).send(error)
    console.error(error)
  }
})

app.post('/updateRecords/:rawFileName',  async (req, res) => {
  try {
    const labelledEntries = req.body.entries
    const fileName = req.params.rawFileName.concat('.json')
    let records = await extractJSON(fileName)

    for (let i = 0; i < labelledEntries.length; i++) {
      records[labelledEntries[i][0]] = labelledEntries[i][1]
    }

    await writeJSON(fileName, records)

  } catch {
    console.error(error)
  }
})

app.get('/getNumUnlabelledEntries/:rawFileName', async (req, res) => {
  try {
    const fileName = req.params.rawFileName.concat('.json')
    let records = await extractJSON(fileName)
    
    let numUnlabelledEntries = 0
    for (let i = 0; i < records.length; i++) {
      if (records[i][labelFieldName] === "") {
        numUnlabelledEntries++
      }
    }

    res.json({ length: numUnlabelledEntries })
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });

  }
})

app.get('/getNumEntries/:rawFileName', async (req, res) => {
  try {
    const fileName = req.params.rawFileName.concat('.json')
    const records = await extractJSON(fileName)

    res.json({ length: records.length })

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// file downloads

app.get('/download/:rawFileName', (req, res) => {
  const rawFileName = req.params.rawFileName
  tempJSONtoCSV(rawFileName.concat('.json'))
  const filePath = `./results/${rawFileName}.csv`

  res.download(filePath, (err) => {
    if (err) {
      console.error(err)
      res.status(500).send("Error downloading this file.")
    }
  })
})

app.get('/headers/:rawFileName', async (req, res) => {

  try {
  const rawFileName = req.params.rawFileName
  const fileName = rawFileName.concat('.csv')
  const csvData = await csv().fromFile(`./uploads/${fileName}`)
  let headers = Object.keys(csvData[0])
  res.json({headers: headers})
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Listening at port ` + port)
})
