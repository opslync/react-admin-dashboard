import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postMethod, getMethod , deleteMethod} from "../library/api";
import CreateProjectForm from '../components/CreateProjectForm';
import ConfirmModal from '../components/ConfirmModal'; //  // Adjust the import path as needed
import { listProject, projectCreate } from '../library/constant';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Card, CardContent, Typography, IconButton } from '@mui/material';

const ProjectPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectIdToDelete, setProjectIdToDelete] = useState(null);

  useEffect(() => {
    // Fetch the list of projects from the API
    const fetchProjects = async () => {
      try {
        const response = await getMethod(listProject);
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects. Please try again.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateProject = async (data) => {
    console.log('Project Data to Save:', data);
    try {
      const response = await postMethod(projectCreate, data);
      // console.log('Project Created:', response);
      setProjects([...projects, response]);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project. Please try again.');
    }
  };

  const handleOpenConfirmModal = (projectId) => {
    setProjectIdToDelete(projectId);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setProjectIdToDelete(null);
  };
  const handleDeleteProject = async () => {
    try {
      const response = await deleteMethod(`project/${projectIdToDelete}`);
      console.log('Project Deleted:', response);
      setProjects(projects.filter(project => project.id !== projectIdToDelete)); // Remove the project from the list
      handleCloseConfirmModal();
    } catch (error) {
      console.error('Failed to delete project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };
// return (
//   <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen">
//     <h1 className="text-2xl mb-4">Projects</h1>
//     <button
//       onClick={handleOpenModal}
//       className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-sm"
//     >
//       Create Project
//     </button>

//     {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p className="text-red-500">{error}</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {projects.map((project) => (
//             <div key={project.id} className="bg-white p-4 rounded shadow-md flex flex-col relative">
//               <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
//               <p>{project.description}</p>
//               <button
//                 onClick={() =>handleOpenConfirmModal(project.id)}
//                 className="absolute top-2 right-2 text-red-500"
//               >
//                 <FontAwesomeIcon icon={faTrash} />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//     {isModalOpen && (
//       <CreateProjectForm onSubmit={handleCreateProject} onClose={handleCloseModal} />
//     )}
//     <ConfirmModal
//         isOpen={isConfirmModalOpen}
//         onClose={handleCloseConfirmModal}
//         onConfirm={handleDeleteProject}
//         message="Are you sure you want to delete this project?"
//       />
//   </div>
// );
return (
  <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen bg-gray-100">
    <div className="flex justify-between items-center mb-4">
      <Typography variant="h4">Projects</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        size="small"
        onClick={handleOpenModal}
      >
        Create Project
      </Button>
    </div>

    {loading ? (
      <Typography>Loading...</Typography>
    ) : error ? (
      <Typography color="error">{error}</Typography>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="relative">
            <CardContent>
              <Typography variant="h6" className="mb-2">{project.name}</Typography>
              <Typography className="mb-4">{project.description}</Typography>
              <Button 
                component={Link} 
                to={`/project/${project.id}/apps`} 
                variant="contained" 
                color="secondary"
              >
                View Apps
              </Button>
              <IconButton
                onClick={() => handleOpenConfirmModal(project.id)}
                className="absolute top-1 right-1 text-red-500 hover:text-red-600"
              >
                <FontAwesomeIcon icon={faTrash} />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </div>
    )}

    {isModalOpen && (
      <CreateProjectForm onSubmit={handleCreateProject} onClose={handleCloseModal} />
    )}
    <ConfirmModal
      isOpen={isConfirmModalOpen}
      onClose={handleCloseConfirmModal}
      onConfirm={handleDeleteProject}
      message="Are you sure you want to delete this project?"
    />
  </div>
);
};

export default ProjectPage;
