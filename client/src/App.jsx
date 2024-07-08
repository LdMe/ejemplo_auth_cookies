import { useState } from 'react'
import './App.css'
const API_URL = "http://localhost:3010"

const fetchData = async(route,method,inputData=null)=>{
    const url = new URL(API_URL + route);
    const fetchOptions = {
        method:method,
        headers:{
            "Content-Type": "application/json",
        },
        credentials: "include",
    }
    if(inputData){
        if(method === "get"){
            Object.keys(inputData).forEach(key=>{
                url.searchParams.append(key,inputData[key]);
            })
        }
        else if(method === "post" || method === "put" || method === "patch"){
            fetchOptions.body = JSON.stringify(inputData);
        }
    }
    try {
        const result = await fetch(url.toString(),fetchOptions);
        const data  = await result.json();
        return data;
    } catch (error) {
        console.error(error);
        return ({error:error.message})
    }
}

function login(username,password){
    return fetchData("/login","post",{username:username,password:password});
}

function  logout(){
    return fetchData("/logout","post");
}

function getProtected(){
    return fetchData("/protected","get");
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const  [data,setData] = useState(null);

  const handleLogin = async()=>{
    const result = await login("admin","password")
    if(result.error){
      alert(result.error)
    }else{
      setIsLoggedIn(true)
    }
  }

  const handleLogout = async()=>{
    const result = await logout()
    if(result.error){
      alert(result.error)
    }else{
      setIsLoggedIn(false)
    }
  }

  const handleProtected = async()=>{
    const result = await getProtected()
    if(result.error){
      alert(result.error)
    }else{
      setData(result)
    }
  }
  return (
    <>
      <div className="App">
        <h1>Simple backend</h1>
        {!isLoggedIn && <button onClick={handleLogin}>Login</button>}
        {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
        <button onClick={handleProtected}>Get protected data</button>
      </div>
      {data && <p>{JSON.stringify(data)}</p>}
    </>
  )
}

export default App
