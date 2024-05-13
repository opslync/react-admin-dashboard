import { baseUrl } from "./constant";
import axios from "axios";
import { getToken } from "./helper";
import { Password } from "primereact/password";

// api calls

export const getMethod = async (url) => {
  const token = getToken() || "";
  try {
    axios
      .get(baseUrl + url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
  } catch (error) {
    console.log(error);
    return error;
  }
};


export const postMethod = async (url, data) => {
  const token = getToken() || "";
  // try {
  //   axios
  //     .post(baseUrl + url, data,{
  //       // headers: {
  //       //   "Content-Type": "application/json",
  //       //   Authorization: `Token ${token}`,
  //       // }
  //     },  {
  //       headers: {
  //         'Authorization': `Token ${token}` 
  //       }
        
  //     })
  //     .then(function (response) {
  //       console.log("Update User Action Payload:", response.data.token);
  //       return response;
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //       return error;
  //     });
  // } catch (error) {
  //   console.log(error);
  //   return error;
  // }
  try {
    const response = await axios.post(baseUrl + url, data, {
    },  {
      headers: {
        'Authorization': `Token ${token}` 
      }
    });
    console.log("Response from postMethod:", response); // Log the response data debug
    return response; // Return the response data
  } catch (error) {
    console.error("Error in postMethod:", error); // Log any errors during the request
    throw error; // Throw the error to be handled by the caller
  }
};

export const putMethod = async (url) => {
  const token = getToken() || "";
  try {
    axios
      .put(baseUrl + url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteMethod = async (url, data) => {
  const token = getToken() || "";
  try {
    axios
      .delete(baseUrl + url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        data,
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
  } catch (error) {
    console.log(error);
    return error;
  }
};