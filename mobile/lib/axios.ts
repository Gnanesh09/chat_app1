import axios from "axios";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";


const API_URL = "https://chat-app1-2oj4.onrender.com/api";


const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});


export const useApi = () => {
    const {getToken} = useAuth()
    useEffect(()=>{
        const requestInterceptor = api.interceptors.request.use(async(config)=>{
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }

            return config
        })

        return()=> {
            api.interceptors.request.eject(requestInterceptor)
        }


    }, [getToken])
    return api

}
