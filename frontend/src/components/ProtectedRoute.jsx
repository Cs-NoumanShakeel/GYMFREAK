import {data, Navigate} from "react-router-dom"
import {jwtDecode} from "jwt-decode"
import api from "../api"
import { REFRESH_TOKEN,ACCESS_TOKEN } from "../constants"
import { useEffect, useState } from "react"

export default function protectedRoute({children}){
   const [isauthorized,setisauthorized] = useState(null)

   useEffect(()=>{
    auth().catch(()=>setisauthorized(false))
   },[])


const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN)
    try {
        const res = await api.post('api/token/refresh/',{
            refresh:refreshToken
        })
        if (res.status===200){
            localStorage.setItem(ACCESS_TOKEN,res.data.access)
            setisauthorized(true)
        }
        else{
            setisauthorized(false)
        }
    } catch(error){
         console.log(error)
         setisauthorized(false)
    }
}

const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN)
    if (!token){
        setisauthorized(false)
        return
    }
    const decoded = jwtDecode(token)
    const expirationDate = decoded.exp
    const now = Date.now() / 1000

    if (expirationDate<now){
        await refreshToken()
    }
    else{
        setisauthorized(true)
    }
}

if (isauthorized === null){
    return <div>loading...</div>
}
return isauthorized? children: <Navigate to = "/login"/>
}