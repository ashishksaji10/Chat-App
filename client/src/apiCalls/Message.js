import { axiosInstance } from "./Index";

export const createNewMessage = async( message ) => {
    try {
        const response = await axiosInstance.post('api/message/new-message', message);
        return response.data;
    } catch (error) {
        return error;
    }
}