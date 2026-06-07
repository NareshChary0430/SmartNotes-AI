import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Auth from './pages/Auth.jsx'
import Home from './pages/Home.jsx'

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
