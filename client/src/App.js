import React from 'react';
import './App.css';
import Dashboard from './components/dashboard';
import FilePage from './components/filePage';
import LabelSetup from './components/labelSetup';
import Labelling from './components/labelling';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

export const getRawFileName = (fileName) => {
  try {
    return fileName.split(".")[0]
  } catch (error) {
    return fileName
  }
  
}

function App() {

  return (
    <div>
      <div className='navbar'>
          <img className='logo-black' src="logo-black.png"/>
      </div>
      
      <div className='title-section'>
        <div className='left'>
          <div className='title'>
            <p>CoLabel</p>
          </div>
          <div className='subtitle'>
            <p>Collaborate on labelling training datasets</p>
          </div>
          <div className='description'>
            <p>Expedite the boring, agonizing part of developing AI models</p>
          </div>
          <div className='get-started'>
            <button>Get Started</button>
          </div>
        </div>
        <div className='right'>
          <div className='square-1'></div>
          <div className='square-2'></div>
          <div className='square-3'></div>
          <div className='square-4'></div>
        </div>
      </div>














      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Link to={'/dashboard'}><h1>Dashboard</h1></Link>} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/dashboard/filePage/:fileName' element={<FilePage />} />
          <Route path='/labelSetup/:fileName' element={<LabelSetup />}></Route>
          <Route path='/labelling/:fileName' element={<Labelling />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
