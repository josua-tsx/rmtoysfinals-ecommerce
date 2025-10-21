import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api" ,// import.meta.env.VITE_API_URL

    withCredentials: true, // Correct
    headers: {
      "Content-Type": "application/json",
    }
  });

export default axiosInstance