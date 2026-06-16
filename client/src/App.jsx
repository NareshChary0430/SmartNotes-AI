import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Auth from './pages/Auth.jsx'
import Home from './pages/Home.jsx'

export const serverUrl = "http://localhost:8000"


const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </>
  )
}

export default App
