import React from 'react';
import './App.css';
import Dashboard from './components/dashboard';
import FilePage from './components/filePage';
import LabelSetup from './components/labelSetup';
import Labelling from './components/labelling';
import Home from './components/home';
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
    

      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
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
