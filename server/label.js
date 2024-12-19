// const { getRecords } = require('./modifyFiles')
const fs = require('fs')
const { bucket } = require('./upload');


async function extractJSON(fileName, userEmail) {
    const file = bucket.file(`${userEmail}/uploads/${fileName}`);
    const [fileContent] = await file.download()
    // console.log("hi")
    const jsonData = JSON.parse(fileContent.toString('utf8'))

    return jsonData
}

async function getUnlabelledEntries(fileName, chunkSize, labelFieldName, userEmail) { // fileName MUST BE JSON, make a check for this and other functions
    // const fileName = fileNameRaw.concat(".json")
    const records = await extractJSON(fileName, userEmail)
    let unlabelledEntries = []
    let numEntriesCollected = 0
    for (let i = 0; i < records.length; i++) {
        if ((records[i][labelFieldName] === "") && (numEntriesCollected < chunkSize)) { // make the loop exit if the 2nd condition is not satisfied
            unlabelledEntries.push([i, records[i]])
            numEntriesCollected++
            // once this feature works with the frontend, see if returning 'i' in the first index is important
        }
    }
    return unlabelledEntries
}

module.exports = { getUnlabelledEntries, extractJSON }
