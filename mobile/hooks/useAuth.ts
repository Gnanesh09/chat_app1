 import { useApi } from "../lib/axios";
// import { User } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";


export const useAuthCallback = () => {
    const api = useApi()
    return useMutation({
        mutationFn:async()=>{
           const { data } = await  api.post("/auth/callback" );
      return data;
        }
    })
   
}