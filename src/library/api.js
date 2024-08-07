import { baseUrl } from "./constant";
import axios from "axios";
import { getToken } from "./helper";
import { Password } from "primereact/password";
import Cookies from 'js-cookie';

// axios.defaults.withCredentials = true;

// export const api = axios.create({
//   baseURL: 'http://localhost:8080/api', // Update with your backend API URL
//   withCredentials: true,
// });

// api calls
export const getMethod = async (url) => {
  const token = getToken() || "";
  try {
    const response = await axios.get(baseUrl + url, {
      // },  {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Response from getMethod:", response); // Log the response data debug
    return response; // Return the response data
  }
  catch (error) {
    console.log(error);
    throw error;
  }
};


export const postMethod = async (url, data) => {
  const token = getToken() || "";
  try {
    const response = await axios.post(baseUrl + url, data, {
      // },  {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Response from postMethod:", response); // Log the response data debug
    return response; // Return the response data
  } catch (error) {
    console.error("Error in postMethod:", error); // Log any errors during the request
    throw error; // Throw the error to be handled by the caller
    // return response;
  }
};

export const putMethod = async (url, data) => {
  const token = getToken() || "";
  try {
    const response = await axios.put(baseUrl + url, data, {
      // },  {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Response from putMethod:", response); // Log the response data debug
    return response; // Return the response data
  } catch (error) {
    console.error("Error in putMethod:", error); // Log any errors during the request
    throw error; // Throw the error to be handled by the caller
    // return response;
  }
};

export const deleteMethod = async (url) => {
  const token = getToken() || "";
  try {
    const response = await axios.delete(baseUrl + url, {
      // },  {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Response from DeleteMethod:", response); // Log the response data debug
    return response; // Return the response data
  } catch (error) {
    console.log(error);
    return error;
  }
};