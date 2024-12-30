import axios from 'axios'
import { getRawFileName } from './App'
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

export const serverURL = process.env.REACT_APP_SERVER_URL

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


export const useUserEmail = () => {
    const [userEmail, setUserEmail] = useState(null)
  
    useEffect(() => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        setUserEmail(user.email)
      }
    }, [])
  
    return userEmail
  }
  
  export const numUnlabelledEntries = async (fileName, userEmail) => {
    
    const response = await axios.get(`${serverURL}/getNumUnlabelledEntries/${userEmail}/${getRawFileName(fileName)}`)
    return response.data.length
  }

