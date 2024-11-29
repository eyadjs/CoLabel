const express = require('express')
const app = express() 
const cors = require('cors')
// const upload = require('./upload')
const { upload, uploadFileToFirebase } = require('./upload');
const { clear, fileNames, getRecords, addEmptyLabels, recordsToTempJSON, readJSON, writeJSON, tempJSONtoCSV } = require('./modifyFiles')
const { getUnlabelledEntries, extractJSON } = require('./label')
const csv = require('csvtojson')
const bodyParser = require('body-parser')
const axios = require('axios')
const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

const os = require('os');

const { bucket } = require('./upload');



app.use(bodyParser.json())
app.use(cors())





// SCRAP THIS
// app.post('/upload-single', upload.single('file'), (req, res) => {
//     res.json(req.file)
// })

// app.post('/upload-multiple', upload.array('files', 10), (req, res) => {
//   res.json(req.files)
// })

// FIREBASE VERSION - works only for single file uploads.
app.post('/upload', upload.single('file'), uploadFileToFirebase, (req, res) => {
  console.log("we loggin")
  res.status(200).send('File uploaded successfully to Firebase.');
});


// FIX OR SCRAP OR CHANGE TO CLEAR 1 FILE AT A TIME - USELESS!
// SHOULD ALSO REMOVE LFN FROM LFN.JSON WHEN FILE IS REMOVED - ADD THIS SOON!
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




labelFieldNames = {};
const tempFilePath = path.join(os.tmpdir(), 'labelFieldNames.json');

const loadLabelFieldNames = async () => {
  try {
    const file = bucket.file('labelFieldNames.json')

    await file.download({destination: tempFilePath })
    return JSON.parse(fs.readFileSync(tempFilePath, 'utf-8'))

  } catch (error) {
    console.error("error loading label field names from firebase")
    return {}
    
  }
}
const saveLabelFieldNames = async (LFNs) => {
  try {
    fs.writeFileSync(tempFilePath, JSON.stringify(LFNs, null, 2))
    await bucket.upload(tempFilePath, {destination: 'labelFieldNames.json'})
  } catch (err) {
    console.error("error saving label field names to firebase")
  }
}


app.post('/getLabelFieldName/:fileName', async (req, res) => { // MAKE THIS FILE SPECIFIC, CURRENTLY IT JUST RETURNS WHATEVER's label field name
  const { fileName } = req.params
  const { data } = req.body
  console.log("setting lfn " + data)
  
  labelFieldNames[fileName] = data
  await saveLabelFieldNames(labelFieldNames)

  res.send({})
  // console.log("LFN is "+labelFieldName)
})

let chunkSize = null
app.post('/getChunkSize/:fileName', (req, res) => {
  chunkSize = req.body.data
  res.json("getChunkSize")
})

app.post('/addEmptyLabels/:fileName', async (req, res) => { // AKA CONFIRM SELECTIONS, START LABELLING
  try {

    const records = await getRecords(req.params.fileName)
    await addEmptyLabels(records, labelFieldNames[req.params.fileName])
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
    const fileNameJSON = req.params.fileName
    const fileNameCSV = fileNameJSON.slice(0,-5).concat(".csv")
    const unlabelledEntry = await getUnlabelledEntries(fileNameJSON, chunkSize, labelFieldNames[fileNameCSV])
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
    const fileNameCSV = req.params.rawFileName.concat('.csv')
    let records = await extractJSON(fileName)
    
    let numUnlabelledEntries = 0
    labelFieldNames = await loadLabelFieldNames()
    console.log("from backend, lfn: "+ labelFieldNames[fileNameCSV])
    for (let i = 0; i < records.length; i++) {
      if (records[i][labelFieldNames[fileNameCSV]] === "") {
        numUnlabelledEntries++
      }
    }

    res.json({ length: numUnlabelledEntries })
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });

  }
})



// STRICTLY FOR TESTING FUNCTIONS, CHANGE IN ANY WAY
app.get('/test/:rawFileName', async (req, res) => {
  try {
    const fileName = req.params.rawFileName
    let records = await tempJSONtoCSV(fileName)
    res.json( {1 : 1} )
  } catch (error) {
    res.status(500).json({ error: 'test not workin brev' })
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
app.get('/download/:rawFileName', async (req, res) => {

  const rawFileName = req.params.rawFileName;
  
  await tempJSONtoCSV(rawFileName.concat('.json')) //  TESTING THIS HERE, IF BUGGY MOVE TO ANOTHER ROUTE

  const filePath = bucket.file(`results/${rawFileName}.csv`);

  // Attempt to read the file from Firebase
  filePath.createReadStream()
    .on('error', (err) => {
      console.error(err);
      res.status(500).send("Error downloading the file from Firebase.");
    })
    .on('finish', () => {
      console.log("File download completed.");
    })
    .pipe(res);  // Pipe the file content to the response

  // Set headers for the file download
  res.setHeader('Content-Type', 'application/octet-stream');  // Appropriate MIME type
  res.setHeader('Content-Disposition', `attachment; filename=${rawFileName}.csv`);  // Set filename for the download
});


app.get('/headers/:rawFileName', async (req, res) => {

  try {
  const rawFileName = req.params.rawFileName
  const fileName = rawFileName.concat('.csv')

  // getting file from firebase instead
  const file = bucket.file(`uploads/${fileName}`)
  const [fileData] = await file.download()
  const csvData = await csv().fromString(fileData.toString());

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