import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [fileData, setFileData] = useState([]);

  const fileChangeHandler = (e) => {
    setFileData(e.target.files);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();

    const data = new FormData();

    for (let i = 0; i < fileData.length; i++) {
      data.append('files', fileData[i]);
    }

    fetch('http://localhost:5000/upload-multiple', {
      method: 'POST',
      body: data,
    })
      .then((result) => {
        console.log('Files Sent Successful');
      })
      .catch((err) => {
        console.log(err.message);
      });
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
    const rawFileName = fileName.slice() // chatgpt gave
  }

  return (
    <div>
      <div className='App'>
        <h1>Label</h1>
        <form onSubmit={onSubmitHandler}>
          <input type="file" multiple onChange={fileChangeHandler} />
          <button type="submit">Submit files</button>
        </form>
        <div className='file-table'>
          <div className='column'>
            <h2>File Name</h2>
            {filesInfo.map((file) => (
              <p key={file.filename}>
                <Link to={allParamsExist(file.filename) ?  `/labelSetup/${file.filename}` : `filePage/${file.filename}`}>{file.filename}</Link>
                <button>Download File</button>
              </p>
              

            ))}
          </div>
          <div className='column'>
            <h2>Label Completion</h2>
            {filesInfo.map((file) => (
              <p key={file.filename}>{file.labelled}%</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
