import axios from "axios";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";
import * as Sentry from "@sentry/react-native";

const API_URL = "https://chat-app1-2oj4.onrender.com/api";



const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor registered once
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      Sentry.logger.error(
        Sentry.logger
          .fmt`API request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        { status: error.response.status, endpoint: error.config?.url, method: error.config?.method }
      );
    } else if (error.request) {
      Sentry.logger.warn("API request failed - no response", {
        endpoint: error.config?.url,
        method: error.config?.method,
      });
    }
    return Promise.reject(error);
  }
);


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
