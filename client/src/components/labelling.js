import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import { getRawFileName } from '../App'
import { getLabels, getLabelFieldName } from '../utils'

function Labelling() {
  const params = useParams()
  const fileName = params.fileName

  const [entries, setEntries] = useState([])
  

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/sendEntriesForLabelling/' + getRawFileName(fileName).concat(".json"));
        setEntries(response.data)
      } catch (error) {
        console.error(error)
      }
    };

    fetchEntries();
  }, []);

  const [entryIndex, setEntryIndex] = useState(0)

  const labels = getLabels(fileName)

  const nextEntry = (label) => {
    try {

      let updatedEntries = [...entries]
      updatedEntries[entryIndex][1][getLabelFieldName(fileName)] = label
      setEntryIndex(entryIndex + 1)
      setEntries(updatedEntries)
    } catch (error) {
      console.error(error)
    }
  }

  const finishLabelling = async () => {
      try {
        localStorage.removeItem(fileName.concat("-labelChunk"))
        await axios.post('http://127.0.0.1:5000/updateRecords/' + getRawFileName(fileName), { entries });
        
        alert('Labelled entries sent to backend');
      } catch (error) {
        console.error('Error sending entries:', error);
      }
  }

  const getSelectedHeaders = async () => {
    let selectedHeaders = []
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i).startsWith(`${fileName}-selectedHeader`)) {
        if (localStorage.getItem(localStorage.key(i)) == 'true') {
          selectedHeaders.push(localStorage.key(i).split('-').at(-1))
        }
      }
    }
    return selectedHeaders
    
  }

  const [selectedHeaders, setSelectedHeaders] = useState([]);

  useEffect(() => {
    const fetchHeaders = async () => {
      const headers = await getSelectedHeaders()
      setSelectedHeaders(headers);
    };

    fetchHeaders();
  }, []);

  // initialize them all to something from local storage in the previous page to avoid inconsistencies



  return (
    <div className='labelling'>

    <div className='labelling-box'>
    {entries.length > 0 && entries[entryIndex] && (
      <>
      {selectedHeaders.map((header, index) => (
      <pre key={index}>
        {header}: {JSON.stringify(entries[entryIndex][1][header], null, 2)}
      </pre>
      ))}
    </>
  )}


    
    {labels.map((label, index) => (
                <button className='submit' onClick={() => nextEntry(label)} key={index}>{label}</button>
            ))}
    
    {/* <pre>{JSON.stringify(entries, null, 2)}</pre> */}

    <Link to={'/labelSetup/'.concat(fileName)}>
      <button className='submit' onClick={finishLabelling}>Label some more</button>
    </Link>

    <Link to={'/dashboard'}>
      <button className='submit' onClick={finishLabelling}>Back to Dashboard</button>
    </Link>
    </div>


    </div>
  )
}

// [
//   [
//     0,
//     {
//       "name": "John Doe",
//       "age": "29",
//       "city": "New York",
//       "g": ""
//     }
//   ],
//   [
//     1,
//     {
//       "name": "Jane Smith",
//       "age": "34",
//       "city": "Los Angeles",
//       "g": ""
//     }
//   ]
// ]

export default Labelling