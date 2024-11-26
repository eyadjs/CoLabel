const path = require('path')
const os = require('os');

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

  const saveLabelFieldNames = async (labelFieldNames) => {
    try {
      fs.writeFileSync(tempFilePath, JSON.stringify(labelFieldNames, null, 2))
      await bucket.upload(tempFilePath, {destination: 'labelFieldNames.json'})
    } catch (err) {
      console.error("error saving label field names to firebase")
    }
  }

  module.exports = {loadLabelFieldNames, saveLabelFieldNames}