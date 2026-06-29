
import {Route, Routes,Navigate} from 'react-router-dom'
import Auth from './pages/Auth.jsx'
import Home from './pages/Home.jsx'

import {useDispatch , useSelector } from 'react-redux';

import {useEffect} from 'react'
import { getCurrentUser } from './services/api.js'

import History from './pages/History.jsx'
import Notes from './pages/Notes.jsx'
import Pricing from './pages/Pricing.jsx'




export const serverUrl = "http://localhost:8000"


const App = () => {

  const dispatch = useDispatch()

  useEffect(()=>{
    getCurrentUser(dispatch)
  },[dispatch])

  const {userData} = useSelector((state)=>state.user)

  return (
    <>
      <Routes>
         <Route path='/' element={userData? <Home/> : <Navigate to="/auth" replace/>}/>
      <Route path='/auth' element={userData ? <Navigate to="/" replace/> : <Auth/>}/>
    

      <Route path='/history' element={userData? <History/> : <Navigate to="/auth" replace/>}/>
      <Route path='/notes' element={userData? <Notes/> : <Navigate to="/auth" replace/>}/>
      <Route path='/pricing' element={userData? <Pricing/> : <Navigate to="/auth" replace/>}/>

        </Routes>
    </>
  )
}

export default App
