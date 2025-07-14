import { baseUrl } from "./constant";
import axios from "axios";
import { getToken } from "./helper";
import Cookies from 'js-cookie';
import { useHistory } from 'react-router-dom';

const handleUnauthorized = () => {
  localStorage.clear();
  window.location.href = '/login';
};

// api calls
export const getMethod = async (url) => {
  const token = getToken() || "";
  try {
    const response = await axios.get(baseUrl + url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Response from getMethod:", response); // Log the response data debug
    return response; // Return the response data
  } catch (error) {
    console.log(error);
    if (error.response && error.response.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};

export const postMethod = async (url, data) => {
  console.log("postMethod trriggered", url, data);
  const token = getToken() || "";
  try {
    const response = await axios.post(baseUrl + url, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Response from postMethod:", response); // Log the response data debug
    return response; // Return the response data
  } catch (error) {
    console.error("Error in postMethod:", error); // Log any errors during the request
    if (error.response && error.response.status === 401) {
      handleUnauthorized();
    }
    throw error; // Throw the error to be handled by the caller
  }
};

export const putMethod = async (url, data) => {
  const token = getToken() || "";
  try {
    const response = await axios.put(baseUrl + url, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Response from putMethod:", response); // Log the response data debug
    return response; // Return the response data
  } catch (error) {
    console.error("Error in putMethod:", error); // Log any errors during the request
    if (error.response && error.response.status === 401) {
      handleUnauthorized();
    }
    throw error; // Throw the error to be handled by the caller
  }
};

export const deleteMethod = async (url) => {
  const token = getToken() || "";
  try {
    const response = await axios.delete(baseUrl + url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Response from deleteMethod:", response); // Log the response data debug
    return response; // Return the response data
  } catch (error) {
    console.log(error);
    if (error.response && error.response.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};
