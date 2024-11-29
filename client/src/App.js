import React from 'react'
import './App.css'
import Dashboard from './components/dashboard'
import FilePage from './components/filePage'
import LabelSetup from './components/labelSetup'
import Labelling from './components/labelling'
import Home from './components/home'
import Register from './components/auth/register'
import Login from './components/auth/login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/authContexts'

export const getRawFileName = (fileName) => {
  try {
    return fileName.split(".")[0];
  } catch (error) {
    return fileName;
  }
};

function App() {
  return (
    <AuthProvider>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/dashboard/filePage/:fileName' element={<FilePage />} />
            <Route path='/labelSetup/:fileName' element={<LabelSetup />} />
            <Route path='/labelling/:fileName' element={<Labelling />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
