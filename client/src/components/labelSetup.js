import { React, useRef, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { numUnlabelledEntries } from '../utils'
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
                <button>labelll</button>
              </Link>) : (
              <h1 style={{fontWeight:"100", fontSize:"30px"}}>Enter a valid chunk size</h1>
              ))
              
            }
          </div>


          <div>
            <input ref={chunkSize}></input>
            <button onClick={confirmLabelChunk} className='submit'>Submit</button>
          </div>


          
          <div className='buttons'>
            <div>
              <Link to={'/dashboard'}>
                  <button onClick={resetParameters} className='submit'>Restart</button> {/* add an are you sure */}
              </Link>
            </div>

            <div>
              <Link to={'/dashboard'}>
                  <button className='submit'>Back to Dashboard</button>
              </Link>
            </div> 
          </div>
          
          
          {/* inv others, assign chunks*/}
          
      </div>
    </div>
  )
}

export default LabelSetup