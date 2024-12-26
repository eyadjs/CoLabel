import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import RowSkeleton from './rowSkeleton';
import { doSignOut } from '../firebase/auth';
import { getStorage, ref, deleteObject } from 'firebase/storage'
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore"
import { storage, db } from '../firebase/firebase'
import generateUniqueId from 'generate-unique-id'
import { useAuth } from '../contexts/authContexts'
import { onAuthStateChanged, getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { useUserEmail } from '../utils';
import { useLocation } from 'react-router-dom';


const Dashboard = () => {

  const userEmail = useUserEmail()


  const fileChangeHandler = (e) => {
    setFileData(e.target.files);
  };

  const [fileData, setFileData] = useState([]);
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const data = new FormData();

    for (let i = 0; i < fileData.length; i++) {
      data.append('file', fileData[i])
      data.append('userEmail', userEmail)
      const uploadDate = new Date()
      const justDate = uploadDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      localStorage.setItem(fileData[i].name.concat("-uploadDate"), justDate)
      console.log(fileData[i])
    }

    

    const fileID = generateUniqueId()
    await setDoc(doc(db, "files", fileID), {
      fileName: fileData[0].name,
      access: {
        owner: [userEmail],
        contributers: []
      }
    })


    // using firebase upload
    fetch('http://127.0.0.1:5000/upload', {
      method: 'POST',
      body: data,
    })
      .then((result) => {
        console.log('Files Sent Successful');
      })
      .catch((err) => {
        console.log(err.message);
      });
    
    const numFiles = localStorage.getItem("numFiles")
    if (numFiles === null) {
      localStorage.setItem("numFiles", 1)
    } else {
      localStorage.setItem("numFiles", parseInt(numFiles, 10) + 1)
    }
      // problematic for debugging
    window.location.reload()
  };
  
  const [isFetchingFiles, setIsFetchingFiles] = useState(true);
  const [filesInfo, setFilesInfo] = useState([]);

  useEffect(() => {
    setIsFetchingFiles(true)
  
    const timeout = setTimeout(() => {
      fetch('http://localhost:5000/files', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ userEmail: userEmail }),
      })
        .then((res) => res.json())
        .then((data) => {
          setFilesInfo(data)
        })
        .finally(() => {
          setIsFetchingFiles(false) 
        })
    }, 1500)
  
    return () => clearTimeout(timeout)
  }, [userEmail])


  filesInfo.map(file => {
    file.uploadDate = localStorage.getItem(file.filename.concat("-uploadDate")) || "-"
    file.lastModified = localStorage.getItem(file.filename.concat("-lastModified")) || "Never"
  })


  const allParamsExist = (fileName) => {
    
    if (localStorage.getItem(fileName.concat("-LabelFieldName")) === null) {
      return false
    }

    if (localStorage.getItem(fileName.concat("-jsonCreated")) === null) {
      return false
    }

    let numLabels = 0

    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i).startsWith(fileName.concat("-isLabel-"))) {
        numLabels++
      }
    }

    if (numLabels < 2) {
      return false
    }
    return true
  }

  const downloadCSV = (fileName) => {
    // fix this, still opens new tab sometimes
    const rawFileName = fileName.slice(0,-4)
    const url = `http://localhost:5000/download/${userEmail}/${rawFileName}`
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
  
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const signOut = () => {
    doSignOut().then(window.location.pathname = '/login'
    )
  }

  const deleteFile = async (fileName) => {
    try {
      const fileNameJSON = fileName.slice(0,-4).concat('.json')
      const results = ref(storage, `/${userEmail}/results/${fileName}`)
      const uploadsCSV = ref(storage, `/${userEmail}/uploads/${fileName}`)
      const uploadsJSON = ref(storage, `/${userEmail}/uploads/${fileNameJSON}`)
      
      const filesRef = collection(db, "files")
      const q = query(filesRef, where("fileName", "==", fileName), where("access.owner", "array-contains", userEmail))
      
      const fileID = await getDocs(q)
      if (!fileID.empty) {
        const doc = fileID.docs[0]
        await deleteDoc(doc.ref)
      } else {
        console.log("No file found in db to delete.")
      }

      await Promise.all([
        deleteObject(results).catch(() => {}),
        deleteObject(uploadsCSV).catch(() => {}),
        deleteObject(uploadsJSON).catch(() => {})
      ])

      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.split('-')[0] === fileName) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      const numFiles = parseInt(localStorage.getItem("numFiles"),10)
      localStorage.setItem("numFiles", numFiles - 1)
      window.location.reload()

    }
   catch (error) {
     console.error("error deleting file: ", error)
   }
 }

 const [numFilesState, setNumFilesState] = useState(0);

 useEffect(() => {
   const data = localStorage.getItem('numFiles');
   setNumFilesState(parseInt(data,10)); 
 }, []);

 console.log(numFilesState)

  return (

    
      <div className='dashboard-page'>
          <header>
            <Link to="/">
              <a href='#title'>
                  <img className='logo-black' src="logo-black.png"/>
              </a>
            </Link>
            <nav>
                
                <ul className="navlinks">
                  
                  <Link to={"/"}>
                    <li><a>{userEmail}</a></li>
                  </Link>
                  <Link to="/login">
                    <li><a><button onClick={signOut} style={{all: 'unset'}}>Sign out</button></a></li>
                  </Link>
                  
                </ul>
            </nav>
            
          </header>
          

        
                


        <div className='dashboard'>
          <div className='file-table'>
          <div className='file-rows'>

            <div className='column'>
              <h2 className="text-[25px] font-light">File</h2>
              {isFetchingFiles && <RowSkeleton rows={numFilesState}/>}
              {/* STORE NUMBER OF files LOCALLY SO IT CAN BE USED TO RENDER CORRECT NUMBER OF SKELETONS */}
              {filesInfo.map((file) => (
                <p key={file.filename}>
                  <button className='bg-transparent border-none p-0 text-black focus:outline-none focus:ring-0 text-[15px] hover:cursor-pointer' onClick={() => deleteFile(file.filename)}>🗑️</button> 
                  <button onClick={() => downloadCSV(file.filename)} className="bg-transparent border-none p-0 text-black focus:outline-none focus:ring-0 hover:cursor-pointer">📥</button> 
                  <Link to={allParamsExist(file.filename) ?  `/labelSetup/${file.filename}` : `filePage/${file.filename}`} className='filename'>{file?.filename  || <Skeleton></Skeleton>}</Link>
                </p>
                

              ))}
              
            </div>

            
            <div className='column'>
              
            <h2 className="text-[25px] font-light">Label Progress</h2>

            {isFetchingFiles && <RowSkeleton rows={numFilesState}/>}
              {filesInfo.map((file) => (
                <p key={file.filename}>{file?.labelled}%</p>
              ))}

            </div>

            <div className='column'>
              
            <h2 className="text-[25px] font-light">Last Modified</h2>
            {isFetchingFiles && <RowSkeleton rows={numFilesState}/>}
              {filesInfo.map((file) => (
                <p key={file.filename}>{file?.lastModified  || <Skeleton></Skeleton>}</p>
              ))}
            </div>

            <div className='column'>
            <h2 className="text-[25px] font-light">Upload date</h2>
            {isFetchingFiles && <RowSkeleton rows={numFilesState}/>}
              {filesInfo.map((file) => (
                <p key={file.filename}>{file?.uploadDate  || <Skeleton></Skeleton>}</p>
              ))}
            </div>


          </div>
          <div className='file-upload'>
          
          <div>
            <form onSubmit={onSubmitHandler} className='file-upload'>
              <label className="choose-files">
                <button type="button" className="custom-file-button">Choose File</button>
                <input type="file" multiple onChange={fileChangeHandler} />
              </label>
              {fileData.length !== 0 && <p>File selected: {fileData[0].name}</p>}
              {fileData.length !== 0 && <button type="submit" className="">Submit</button>}
            </form>
          </div>




          </div>
          </div>
      </div>

        {/* <div className='dashboard-squares'>
          <div className='square-4'></div>
          <div className='square-5'></div>
          <div className='square-6'></div>
          <div className='square-7'></div>
        </div> */}

      </div>
  );
};

export default Dashboard;
