import React, { useState, useEffect } from 'react';
import { getMethod, postMethod } from "../library/api";
import SetupAppForm from '../components/SetupAppForm'; // Adjust the import path as needed
import { appCreate, listApps } from '../library/constant';

const AppPage = () => {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [setupErrorMessage, setSetupErrorMessage] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the list of apps from the API
    const fetchApps = async () => {
      try {
        const response = await getMethod(listApps);
        console.log('App Setup:', response);
        setApps(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch apps. Please try again.');
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  const handleOpenSetupModal = () => {
    setIsSetupModalOpen(true);
  };

  const handleCloseSetupModal = () => {
    setIsSetupModalOpen(false);
  };

  const handleSetupApp = async (data) => {
    console.log('App Data to Save:', data);
    try {
      const response = await postMethod(appCreate, data);
      setApps([...apps, response]);
      console.log('App Setup:', response);
      handleCloseSetupModal();
    } catch (error) {
      console.error('Failed to setup app:', error);
      setError('Failed to setup app. Please try again.');
    }
  };

//   return (
//     <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen">
//       <h1 className="text-2xl mb-4"></h1>
//       <button
//         onClick={handleOpenSetupModal}
//         className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-md"
//       >
//         Setup App
//       </button>
      
//       {isSetupModalOpen && (
//         <SetupAppForm onSubmit={handleSetupApp} onClose={handleCloseSetupModal} />
//       )}
//     </div>
//   );
// };
return (
    <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen">
      <h1 className="text-2xl mb-4">Apps</h1>
      <button
        onClick={handleOpenSetupModal}
        className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-md"
      >
        + Setup App
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div key={app.id} className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
              <p>{app.description}</p>
            </div>
          ))}
        </div>
      )}

      {isSetupModalOpen && (
        <SetupAppForm onSubmit={handleSetupApp} onClose={handleCloseSetupModal} />
      )}
    </div>
  );
};


export default AppPage;
