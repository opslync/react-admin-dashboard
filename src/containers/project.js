import React, { useState, useEffect } from 'react';
import { postMethod, getMethod } from "../library/api";
import CreateProjectForm from '../components/CreateProjectForm'; // Adjust the import path as needed
import { listProject, projectCreate } from '../library/constant';

const ProjectPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      console.log('Project Created:', response);
      setProjects([...projects, response]);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project. Please try again.');
    }
  };

//   return (
//     <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen">
//       <h1 className="text-2xl mb-4"></h1>
//       <button
//         onClick={handleOpenModal}
//         className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-sm"
//       >
//         + Create Project
//       </button>
      
//       {isModalOpen && (
//         <CreateProjectForm onSubmit={handleCreateProject} onClose={handleCloseModal} />
//       )}
//     </div>
//   );
// };
return (
  <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen">
    <h1 className="text-2xl mb-4">Projects</h1>
    <button
      onClick={handleOpenModal}
      className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-sm"
    >
      Create Project
    </button>

    {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
              <p>{project.description}</p>
            </div>
          ))}
        </div>
      )}

    {isModalOpen && (
      <CreateProjectForm onSubmit={handleCreateProject} onClose={handleCloseModal} />
    )}
  </div>
);
};

export default ProjectPage;
