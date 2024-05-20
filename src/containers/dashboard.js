// import React from "react";
// import { Link } from "react-router-dom";

// export default function DashboardPage() {
//   // let x = Array.from(Array(220).keys());
//   return (
//     <h1 className="text-3xl font-bold underline">
//       Hello world!
//     </h1>
    
//   );
// }
import { postMethod } from "../library/api";
import React, { useState } from 'react';
import GitDetailsForm from '../components/GitDetailsForm'; // Import the new component
import { githubuser } from '../library/constant';

const DashboardPage = () => {
  const [isGitModalOpen, setIsGitModalOpen] = useState(false); // State for Git details modal
  const [gitErrorMessage, setGitErrorMessage] = useState(''); 


  const handleOpenGitModal = () => {
    setIsGitModalOpen(true);
  };

  const handleCloseGitModal = () => {
    setIsGitModalOpen(false);
  };

  const handleSaveGitDetails = async (data) => {
    console.log('Git Details to Save:', data);
    try {
      const response = await postMethod(githubuser, data);
      console.log('Git Details Saved:', response);
      handleCloseGitModal();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setGitErrorMessage('User already exists');
      } else {
        setGitErrorMessage('Failed to save Git details. Please try again.');
      }
      console.error('Failed to save Git details:', error);
    }
  };

  return (
    <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen">
      <h1 className="text-2xl mb-4"></h1>
      <button
        onClick={handleOpenGitModal}
        className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-md"
      >
        Git Connect
      </button>
      
      {isGitModalOpen && (
        <GitDetailsForm onSubmit={handleSaveGitDetails} onClose={handleCloseGitModal} />
      )}
    </div>
  );
};

export default DashboardPage;
