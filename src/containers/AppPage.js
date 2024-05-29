import React, { useState, useEffect } from 'react';
import { getMethod, postMethod, deleteMethod } from "../library/api";
import SetupAppForm from '../components/SetupAppForm'; // Adjust the import path as needed
import ConfirmModal from '../components/ConfirmModal';
import { appCreate, listApps } from '../library/constant';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const AppPage = () => {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [setupErrorMessage, setSetupErrorMessage] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appIdToDelete, setAppIdToDelete] = useState(null);

  useEffect(() => {
    // Fetch the list of apps from the API
    const fetchApps = async () => {
      try {
        const response = await getMethod(listApps);
        const mappedApps = response.data.map(app => ({
          id: app.ID,
          name: app.name,
          description: app.description,
          repoUrl: app.repoUrl,
          projectId: app.projectId,
          createdAt: app.CreatedAt,
          updatedAt: app.UpdatedAt,
          deletedAt: app.DeletedAt
        }));
        console.log('App Setup:', response);
        setApps(mappedApps);
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
      const newApp = {
        id: response.ID,
        name: response.name,
        description: response.description,
        repoUrl: response.repoUrl,
        projectId: response.projectId,
        createdAt: response.CreatedAt,
        updatedAt: response.UpdatedAt,
        deletedAt: response.DeletedAt
      };
      setApps([...apps, newApp]);
      console.log('App Setup:', response);
      handleCloseSetupModal();
    } catch (error) {
      console.error('Failed to setup app:', error);
      setError('Failed to setup app. Please try again.');
    }
  };
  const handleOpenConfirmModal = (appId) => {
    console.log('Opening confirm modal for app ID:', appId); // Debugging step
    setAppIdToDelete(appId);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setAppIdToDelete(null);
  };
  const handleDeleteApp = async () => {
    try {
      if (appIdToDelete) {
      await deleteMethod(`app/${appIdToDelete}`);
      setApps(apps.filter(app => app.id !== appIdToDelete)); // Remove the app from the list
      handleCloseConfirmModal();
    } else {
      console.error('No app ID to delete.');
    }
    } catch (error) {
      console.error('Failed to delete app:', error);
      setError('Failed to delete app. Please try again.');
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
            <div key={app.id} className="bg-white p-4 rounded shadow-md flex flex-col relative">
              <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
              <p>{app.description}</p>
              <button
                onClick={() => handleOpenConfirmModal(app.id)}
                className="absolute top-2 right-2 text-red-500"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isSetupModalOpen && (
        <SetupAppForm onSubmit={handleSetupApp} onClose={handleCloseSetupModal} />
      )}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleDeleteApp}
        message="Are you sure you want to delete this app?"
      />
    </div>
  );
};


export default AppPage;