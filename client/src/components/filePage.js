import React, { useRef, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { getLabels } from '../utils'

import { Button, ButtonGroup } from '@mui/material';
import { getRawFileName } from '../App';
import { useUserEmail } from '../utils';



let numLabels = 0
export const FilePage = () => {
	const params = useParams()
	const fileName = params.fileName // get fileindex from this later, easier to use

	const label = useRef()
	const labelFieldName = useRef()

	const [renderedLabels, setRenderedLabels] = useState([])

	const addLabels = () => {

		if (label.current.value.trim().length === 0) { // decline string if only whitespace/empty
			alert("Please enter a valid string.") // make this display the error next to the labels!
			return 0
		}

		let uniqueLabel = true
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const key = localStorage.key(i)
			const keyCopy = key
			if (keyCopy.split('-')[0] === fileName) {
				if (localStorage.getItem(key) === label.current.value) {
					uniqueLabel = false
					break
				}
			} 
		}

		if (uniqueLabel === true) {
			numLabels++
			localStorage.setItem(fileName.concat("-isLabel-".concat(numLabels)), label.current.value)
			setRenderedLabels([...renderedLabels, label.current.value])
		}
		}
	




	const clearLabels = () => {
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const key = localStorage.key(i)
			const keyCopy = key
			if (keyCopy.split('-')[0] === fileName) {
				localStorage.removeItem(key)
			}
		}
		setRenderedLabels([])
		numLabels = 0
	}
	const [labelFieldValue, setLabelFieldValue] = useState('');

	const addLabelFieldName = async () => {
		
		try {
			if (labelFieldName.current.value.trim().length === 0) { // decline string if only whitespace/empty
				alert("Please enter a valid string.") // make this display the error next to the labels!
				return 0
			}
			localStorage.setItem(fileName.concat('-LabelFieldName'), labelFieldName.current.value)
			setLabelFieldValue(labelFieldName.current.value)
			
		} catch (error) {
			console.error("bro")
			setLabelFieldValue("k")
		}
	}

	const sendLFNtoServer = async () => {
		if (labelFieldName.current.value.trim().length === 0) {
			return 0
		}
		const response = await fetch(`http://127.0.0.1:5000/getLabelFieldName/${userEmail}/${fileName}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ data: labelFieldName.current.value }),
		});
		const data = await response.json();
	}

	const handleLFNClick = () => {
		sendLFNtoServer()
		addLabelFieldName()
		console.log("lfn from frontend "+labelFieldName.current.value)
	}

	const proceedToLabelling = async () => {
		try {
			const response = await axios.post(`http://127.0.0.1:5000/addEmptyLabels/${userEmail}/${fileName}`)
			localStorage.setItem(fileName.concat("-jsonCreated"), true)
			console.log(response.data)
		} catch (error) {
			console.error(error)
		}
	}

	const sendMissingParametersAlert = () => {
		let labels = getLabels(fileName)

		if (labels.length === 0) {
			alert("Please ensure the labels are defined.") // make this check from local storage
		}

		if (labelFieldValue.length === 0) {
			alert("Please ensure the label field name is defined.")
		}
	}
	
	const confirmSelections = () => {
		proceedToLabelling()
		sendMissingParametersAlert()
		// have something to prevent user from proceeding if the above alert is sent

		
	}


	const [headers, setHeaders] = useState([]);
    const [selectedHeaders, setSelectedHeaders] = useState([]);
	const userEmail = useUserEmail()
	console.log(userEmail)
    useEffect(() => {
        const fetchHeaders = async () => {
			if (!userEmail) return 
            try {
                const response = await axios.get(`http://127.0.0.1:5000/headers/${userEmail}/${fileName.slice(0, -4)}`);
                setHeaders(response.data.headers);
            } catch (error) {
                console.error("Error fetching headers:", error);
            }
        };

        fetchHeaders();
    }, [fileName, userEmail]);

    const toggleHeader = (index) => {
        const headerToToggle = headers[index];
        
        setSelectedHeaders(prevSelectedHeaders => {
            if (prevSelectedHeaders.includes(headerToToggle)) {
				localStorage.setItem(`${fileName}-selectedHeader-${headerToToggle}`, false)
                return prevSelectedHeaders.filter(item => item !== headerToToggle);
            } else {
				localStorage.setItem(`${fileName}-selectedHeader-${headerToToggle}`, true)
                return [...prevSelectedHeaders, headerToToggle]
				
            }
        })
	}

	useEffect(() => {
        console.log(selectedHeaders);
    }, [selectedHeaders]);


	
	return (
		
		<div>
			<Link to={'/dashboard'}>Back to dashboard</Link>
			<h1 style={{textAlign:"center"}}>Currently editing: {fileName}</h1>
			<div style={{display:"flex", flexDirection:"column", marginLeft:"10%", paddingTop:"5%"}}>
				
				<p >What are all the possible labels you'd like to give your data?</p>
				<input ref={label}></input>
				<div style={{display:"flex", flexDirection:"row"}}>
				<Button onClick={addLabels} variant='outlined' sx={{ margin: '5px'}}>Add</Button>
				<Button onClick={clearLabels} variant="outlined" color='error' sx={{ margin: '5px'}}>Clear</Button>
				</div>

				<p>Current labels:</p>
				<ul>
					{getLabels(fileName).map((label, index) => (
						<p key={index}>· {label}</p>
					))}
				</ul>
				<p>What would you like to name the column you'll be labelling?</p>
				<input ref={labelFieldName}></input>
				<Button onClick={handleLFNClick} variant='outlined' sx={{ width:'100px', margin : '5px' }}>Confirm</Button>
				<p>{labelFieldValue}</p>
				

				<p>Which columns from your data would you like to see to decide each label?</p>
				<div style={{display:"flex", flexDirection:"row"}}>
					<ButtonGroup variant="text" aria-label="Basic button group">
						{headers.map((item, index) => (
							<Button sx={{ width:'100px', marginBottom : '50px',  }} key={index} onClick={() => toggleHeader(index)}>
								{selectedHeaders.includes(item) ? <p className='text-green-800'>{item}</p> : <p className='text-red-800'>{item}
									</p>}</Button>
						))}
					</ButtonGroup>
				</div>

				
				<Link to={`/labelSetup/${fileName}`}>
					<Button variant="contained" onClick={confirmSelections}>Confirm Options</Button>
				</Link>

					
			</div>
			



		</div>
		
	)
}

export default FilePage