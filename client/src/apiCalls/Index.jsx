import axios from 'axios';

export const url = "https://chat-app-1-wz1x.onrender.com";

export const axiosInstance = axios.create({
    headers: {
        authorization : `Bearer ${localStorage.getItem('token')}`
    }
});