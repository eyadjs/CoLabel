import React, { useRef, useState } from 'react'
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


	return (
		
		<div>
			<Link to={'/dashboard'}>Back to dashboard</Link>
			<p>{fileName}</p>

			<input ref={label}></input>
			<button onClick={addLabels}>Add</button>
			<button onClick={clearLabels}>Clear</button>
			<h1>Current labels</h1>
			<ul>
				{getLabels(fileName).map((label, index) => (
					<li key={index}>{label}</li>
				))}
			</ul>
			<h1>Choose your label field name</h1>
			<input ref={labelFieldName}></input>
			<button onClick={handleLFNClick}>Confirm</button>
			<h3>{labelFieldValue}</h3>
			
			
			<Link to={`/labelSetup/${fileName}`}>
				<button onClick={confirmSelections}>Start Labeling</button>
			</Link>

		</div>
		
	)
}

export default FilePage