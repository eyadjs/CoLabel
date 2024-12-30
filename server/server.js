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
const { v4: uuidv4 } = require('uuid')
const os = require('os');

const { bucket } = require('./upload');



app.use(bodyParser.json())
app.use(express.json())
app.use(cors())





// SCRAP THIS
// app.post('/upload-single', upload.single('file'), (req, res) => {
//     res.json(req.file)
// })

// app.post('/upload-multiple', upload.array('files', 10), (req, res) => {
//   res.json(req.files)
// })

// FIREBASE VERSION - works only for single file uploads.
app.post('/upload', upload.single('file'), (req, res) => {

  const userEmail = req.body.userEmail
  uploadFileToFirebase(userEmail, req, res)

  res.status(200).send('File uploaded successfully to Firebase.');
});


// FIX OR SCRAP OR CHANGE TO CLEAR 1 FILE AT A TIME - USELESS!
// SHOULD ALSO REMOVE LFN FROM LFN.JSON WHEN FILE IS REMOVED - ADD THIS SOON! (but do we rly need it? no bugs)
app.get('/clear-uploads', async (req, res) => {
  try {
      await clear();
      res.send('Uploads directory cleared!');
  } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred while clearing the uploads directory.');
  }
});

app.post('/files', async(req, res) => {
  try {
    const userEmail = req.body.userEmail
    const files = await fileNames(userEmail)
    res.json(files)
    
  } 
  catch (err) {
    console.error(err)
    res.status(500).send('An error occurred while clearing the uploads directory.');
  }
})

app.get('/:fileName', (req, res) => {
  res.send(`<h1>${req.params.fileName}</h1>`)
})

labelFieldNames = {}

const loadLabelFieldNames = async (userEmail) => {
  const tempFilePath = path.join(os.tmpdir(), `${userEmail}_labelFieldNames.json`) // (?)
  try {
    const file = bucket.file(`${userEmail}/labelFieldNames.json`)

    await file.download({destination: tempFilePath })
    return JSON.parse(fs.readFileSync(tempFilePath, 'utf-8'))

  } catch (error) {
    console.error("error loading label field names from firebase")
    return {}
    
  }
}
const saveLabelFieldNames = async (LFNs, userEmail) => {
  const tempFilePath = path.join(os.tmpdir(), `${userEmail}_labelFieldNames.json`) // (?)
  try {
    fs.writeFileSync(tempFilePath, JSON.stringify(LFNs, null, 2))
    await bucket.upload(tempFilePath, {destination: `${userEmail}/labelFieldNames.json`})
  } catch (err) {
    console.error("error saving label field names to firebase")
  }
}


app.post('/getLabelFieldName/:userEmail/:fileName', async (req, res) => { // MAKE THIS FILE SPECIFIC, CURRENTLY IT JUST RETURNS WHATEVER's label field name
  const { fileName } = req.params
  const userEmail = req.params.userEmail
  const { data } = req.body
  console.log("setting lfn " + data)
  
  labelFieldNames[`${userEmail}/${fileName}`] = data
  await saveLabelFieldNames(labelFieldNames, userEmail)

  res.send({})
})

let chunkSize = null
app.post('/getChunkSize/:fileName', (req, res) => {
  chunkSize = req.body.data
  res.json("getChunkSize")
})

app.post('/addEmptyLabels/:userEmail/:fileName', async (req, res) => { // AKA CONFIRM SELECTIONS, START LABELLING
  try {

    const records = await getRecords(req.params.fileName, req.params.userEmail)
    await addEmptyLabels(records, labelFieldNames[`${req.params.userEmail}/${req.params.fileName}`])
    await recordsToTempJSON(records, req.params.fileName, req.params.userEmail)
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

app.get('/sendEntriesForLabelling/:userEmail/:fileName', async (req, res) => {
  try {
    const fileNameJSON = req.params.fileName
    const userEmail = req.params.userEmail
    const fileNameCSV = fileNameJSON.slice(0,-5).concat(".csv")
    const unlabelledEntry = await getUnlabelledEntries(fileNameJSON, chunkSize, labelFieldNames[`${userEmail}/${fileNameCSV}`], userEmail)
    console.log("sent success")
    res.send(unlabelledEntry)
  } catch (error) {
    res.status(500).send(error)
    console.log("sorry")
  }
})

app.post('/updateRecords/:userEmail/:rawFileName',  async (req, res) => {
  try {
    const labelledEntries = req.body.entries
    const userEmail = req.params.userEmail
    const fileName = req.params.rawFileName.concat('.json')
    let records = await extractJSON(fileName, userEmail)

    for (let i = 0; i < labelledEntries.length; i++) {
      records[labelledEntries[i][0]] = labelledEntries[i][1]
    }

    await writeJSON(fileName, records, userEmail)

  } catch {
    console.error(error)
  }
})

app.get('/getNumUnlabelledEntries/:userEmail/:rawFileName', async (req, res) => {
  try {
    const fileName = req.params.rawFileName.concat('.json')
    const fileNameCSV = req.params.rawFileName.concat('.csv')
    const userEmail = req.params.userEmail
    let records = await extractJSON(fileName, userEmail)
    
    let numUnlabelledEntries = 0
    labelFieldNames = await loadLabelFieldNames(userEmail)
    // console.log("from backend, lfn: "+ labelFieldNames[fileNameCSV])
    for (let i = 0; i < records.length; i++) {
      if (records[i][labelFieldNames[`${userEmail}/${fileNameCSV}`]] === "") {
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

app.get('/getNumEntries/:userEmail/:rawFileName', async (req, res) => {
  try {
    const fileName = req.params.rawFileName.concat('.json')
    const userEmail = req.params.userEmail
    const records = await extractJSON(fileName, userEmail)

    res.json({ length: records.length })

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// file downloads
app.get('/download/:userEmail/:rawFileName', async (req, res) => {

  const rawFileName = req.params.rawFileName;
  const userEmail = req.params.userEmail
  
  await tempJSONtoCSV(rawFileName.concat('.json'), userEmail) //  TESTING THIS HERE, IF BUGGY MOVE TO ANOTHER ROUTE

  const filePath = bucket.file(`${userEmail}/results/${rawFileName}.csv`);

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


app.get('/headers/:userEmail/:rawFileName', async (req, res) => {

  try {
  const rawFileName = req.params.rawFileName
  const userEmail = req.params.userEmail
  const fileName = rawFileName.concat('.csv')

  // getting file from firebase instead
  const file = bucket.file(`${userEmail}/uploads/${fileName}`)
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