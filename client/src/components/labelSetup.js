import { React, useRef, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { numUnlabelledEntries } from '../utils'
import { Button, ButtonGroup } from '@mui/material';

import axios from 'axios'


function LabelSetup() {

  

  const chunkSize = useRef()
  const params = useParams()
  const fileName = params.fileName

  // localStorage.setItem(fileName.concat("-labelChunk"), -1)

  const addLabelChunk = () => {
    localStorage.setItem(fileName.concat("-labelChunk"), chunkSize.current.value)
    setChunkSizeState(chunkSize.current.value)
  }

  const [chunkSizeState, setChunkSizeState] = useState(-1) 
  const getChunkSize = () => {
    return localStorage.getItem(fileName.concat("-labelChunk"))
  }
  

	const sendLCtoServer = async () => {
		const chunkSize = getChunkSize()
		const response = await fetch('http://127.0.0.1:5000/getChunkSize/'.concat(fileName), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ data: chunkSize }),
		});
		const data = await response.json();
	}

  const confirmLabelChunk = async () => {
    addLabelChunk()
    sendLCtoServer()
    console.log(getChunkSize())
    console.log(await numUnlabelledEntries(fileName))
  }

  const resetParameters = async () => {
    const keysToRemove = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.split('-')[0] === fileName) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // const checkChunkSize = async (fileName) => {
  //   const chunkSize = getChunkSize()
  //   const unlabelledEntries = await numUnlabelledEntries(fileName)
  //   if (chunkSize !== null) {
  //     return (unlabelledEntries < chunkSize)
  //   }
  //   return false
  // }

  const [chunkValidity, setChunkValidity] = useState()
  const [numUnlabelledEntriesState, setNumUnlabelledEntriesState] = useState()

  useEffect(() => {
    const checkChunkSize = async () => {
      try {
        const chunkSize = chunkSizeState
        const unlabelledEntries = await numUnlabelledEntries(fileName)
        console.log("unlabelled entries"+unlabelledEntries)
        setNumUnlabelledEntriesState(unlabelledEntries)

        // if (chunkSizeState === null) {
        //   localStorage.setItem(fileName.concat("-labelChunk"), -1)
        //   // SAFETY NET, THIS CODE SHOULD NOT EVER EXECUTE SINCE CHUNKSIZE IS INITIALIZED TO -1
        // }

        // if (chunkSizeState === -1) {
        //   setChunkValidity(true)
        //   return
        // }

        setChunkValidity(numUnlabelledEntriesState >= chunkSize)
      } catch (error) {
        console.error(error)
      }
    };

    

    checkChunkSize();
  }, [chunkSizeState]);

  return (
    <div className='chunkPage'>
        <div className='selectChunkSize'>

        <div>
            { (numUnlabelledEntriesState === 0) ? 
                (<h1 style={{fontWeight:"100", fontSize:"30px"}}>All labelled!</h1>) : (
            chunkValidity ?
              (<Link to={`/labelling/${fileName}`}>
                <Button>labelll</Button>
              </Link>) : (
              <p>How many entries would you like to label in one go?</p>
              ))
              
            }
          </div>


          <div>
            <input ref={chunkSize}></input>
            <Button variant="outlined" onClick={confirmLabelChunk} className='submit'>Submit</Button>
          </div>


          
          <div className='buttons'>
            <div>
              <Link to={'/dashboard'}>
                  <Button variant='outlined' color='error' onClick={resetParameters}>Restart</Button> {/* add an are you sure */}
              </Link>
            </div>

            <div>
              <Link to={'/dashboard'}>
                  <Button variant='outlined'>Back to Dashboard</Button>
              </Link>
            </div> 
          </div>
          
          
          {/* inv others, assign chunks*/}
          
      </div>
    </div>
  )
}

export default LabelSetup