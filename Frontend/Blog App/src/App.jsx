import React, { useEffect,useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Create from "./components/Create";
import Contact from "./components/Contact";
import Register from "./components/Register";
import Login from "./components/Login";
import { createContext } from "react";
import axios from "axios";
import Post from "./components/Post";
import EditPost from './components/EditPost'

export const userContext = createContext();

function App() {
  const [user, setUser] = useState({
    username: null,
    email: null
  })
  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios.get('http://localhost:3000/')
    .then(user => {
      setUser(user.data)
    })
    .catch(err => console.log(err))
  }, [])

  return (
    <userContext.Provider value={user}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/create" element={<Create />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/post/:id" element={<Post/>}></Route>
          <Route path="/editpost/:id" element={<EditPost />}></Route>
        </Routes>
      </BrowserRouter>
    </userContext.Provider>
  );
}

export default App;
