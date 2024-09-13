import React, { useRef, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { getLabels } from '../utils'

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
		const response = await fetch('http://127.0.0.1:5000/getLabelFieldName', {
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
		console.log(labelFieldName.current.value)
	}




	const proceedToLabelling = async () => {
		try {
			const response = await axios.post('http://127.0.0.1:5000/addEmptyLabels/' + fileName)
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

    useEffect(() => {
        const fetchHeaders = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/headers/${fileName.slice(0, -4)}`);
                setHeaders(response.data.headers);
            } catch (error) {
                console.error("Error fetching headers:", error);
            }
        };

        fetchHeaders();
    }, [fileName]);

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
				
				<p className='normal'>Add all possible labels you'd like to give your data.</p>
				<input ref={label}></input>
				<div style={{display:"flex", flexDirection:"row"}}>
				<button onClick={addLabels} className='submit'>Add</button>
				<button onClick={clearLabels} className='submit'>Clear</button>
				</div>

				<h1 className='normal'>Current labels:</h1>
				<ul>
					{getLabels(fileName).map((label, index) => (
						<li key={index}>- {label}</li>
					))}
				</ul>
				<h1 className='normal'>Choose your label field name.</h1>
				<input ref={labelFieldName}></input>
				<button onClick={handleLFNClick} className='submit'>Confirm</button>
				<h3>{labelFieldValue}</h3>
				

				<h1 className='normal'>Choose the fields to label your data upon.</h1>
				<div style={{display:"flex", flexDirection:"row"}}>
					{headers.map((item, index) => (
						<button key={index} className='submit' onClick={() => toggleHeader(index)}>{selectedHeaders.includes(item) ? <p>{item}</p> : <p>{item}</p>}</button>
					))}
				</div>

				
				<Link to={`/labelSetup/${fileName}`}>
					<button onClick={confirmSelections} className='submit'>Start Labeling</button>
				</Link>
			
			</div>




		</div>
		
	)
}

export default FilePage