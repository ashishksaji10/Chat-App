import axios from 'axios';

export const url = import.meta.env.VITE_URL;

export const axiosInstance = axios.create({
    headers: {
        authorization : `Bearer ${localStorage.getItem('token')}`
    }
});