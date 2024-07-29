import axios from 'axios'
import { getRawFileName } from './App'


export const getLabels = (fileName) => {
    let labels = []
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key.split('-')[0] === fileName) {
            if (key.split('-')[1] === 'isLabel') {
                labels.push(localStorage.getItem(key))
            }
        }
    }
    return labels
}

export const getLabelFieldName = (fileName) => {
    return localStorage.getItem(fileName.concat("-LabelFieldName"))
}

export const numUnlabelledEntries = async (fileName) => {
    const response = await axios.get('http://127.0.0.1:5000/getNumUnlabelledEntries/' + getRawFileName(fileName))
    return response.data.length
  }