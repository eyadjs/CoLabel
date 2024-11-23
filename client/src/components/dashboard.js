import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

const Dashboard = () => {

  const fileChangeHandler = (e) => {
    setFileData(e.target.files);
  };


  const [fileData, setFileData] = useState([]);
  const onSubmitHandler = (e) => {
    e.preventDefault();

    const data = new FormData();

    for (let i = 0; i < fileData.length; i++) {
      data.append('file', fileData[i]);
    }

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

      // problematic for debugging
    // window.location.reload()
  };
  

  const [filesInfo, setFilesInfo] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/files')
      .then((res) => res.json())
      .then((data) => {
        setFilesInfo(data);
      });
  }, []);


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
    const rawFileName = fileName.slice(0,-4)
    const url = `http://localhost:5000/download/${rawFileName}`
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
  
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (

    
      <div className='dashboard-page'>
        <div className='top'>
          

          <p className='text-xl'>Manage your projects</p>
        </div>
                


        <div className='dashboard'>
          {/* <p className='text-xl mr-10' style={{left:"20%", bottomMargin:"0%"}}> Dashboard</p> */}
          {/* <p className='text-xl mr-10'>Manage your projects</p> */}
          <div className='file-table'>
          <div className='file-rows'>

            <div className='column'>
              <h2 className="text-[25px] font-light">File</h2>
              {filesInfo.map((file) => (
                <p key={file.filename}>
                  <button className='bg-transparent border-none p-0 text-black focus:outline-none focus:ring-0 text-[15px] hover:cursor-pointer' >🗑️</button> 
                  <button onClick={() => downloadCSV(file.filename)} className="bg-transparent border-none p-0 text-black focus:outline-none focus:ring-0 hover:cursor-pointer">📥</button> 
                  <Link to={allParamsExist(file.filename) ?  `/labelSetup/${file.filename}` : `filePage/${file.filename}`} className='filename'>{file.filename}</Link>
                  {/* <button className='download-button' onClick={() => downloadCSV(file.filename)}>
                    <img src='download-button.png' className='download-logo'></img>
                  </button> */}
                </p>
                

              ))}
              
            </div>

            
            <div className='column'>
            <h2 className="text-[25px] font-light">Label Progress</h2>
              {filesInfo.map((file) => (
                <p key={file.filename}>{file.labelled}%</p>
              ))}
            </div>


          </div>
          <div className='file-upload'>
            <form onSubmit={onSubmitHandler}>
              <label className='choose-files'>
                <input type="file" multiple onChange={fileChangeHandler}></input>
              </label>
              <button type="submit" className='submit'>Submit</button>
            </form>
          </div>
          </div>
      </div>

        <div className='dashboard-squares'>
          <div className='square-4'></div>
          <div className='square-5'></div>
          <div className='square-6'></div>
          <div className='square-7'></div>
        </div>

      </div>
  );
};

export default Dashboard;
