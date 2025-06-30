import React, { useState, useEffect } from 'react';

const CreateProjectForm = ({ onSubmit, onClose }) => {
  const [name, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [resources, setResources] = useState({
    enabled: true,
    cpu: '0.5',
    memory: '256Mi',
    storage: '100Mi'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  let isMounted = true;

  useEffect(() => {
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onSubmit({ name, description, resources });
      if (isMounted) {
        onClose();
      }
    } catch (err) {
      if (isMounted) {
        // Handle specific error cases
        let errorMessage = 'Failed to create project. Please try again.';
        
        if (err.response) {
          const { status, data: responseData } = err.response;
          
          if (status === 500 && responseData?.message) {
            if (responseData.message.toLowerCase().includes('namespace') && 
                responseData.message.toLowerCase().includes('already exists')) {
              errorMessage = `Project name "${name}" is already taken. Please choose a different name.`;
            } else if (responseData.message.toLowerCase().includes('namespace')) {
              errorMessage = `Namespace error: ${responseData.message}`;
            } else {
              errorMessage = responseData.message;
            }
          } else if (status === 400 && responseData?.message) {
            errorMessage = responseData.message;
          } else if (status === 409) {
            errorMessage = `Project name "${name}" already exists. Please choose a different name.`;
          }
        }
        
        setError(errorMessage);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-8 rounded shadow-lg">
        <h2 className="text-xl mb-4">Create Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          
          {/* Resource Configuration */}
          <div className="mb-4 border-t pt-4">
            <div className="flex items-center mb-3">
              <label className="block text-gray-700 mr-3">Enable Resource Limits</label>
              <input
                type="checkbox"
                checked={resources.enabled}
                onChange={(e) => setResources(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            
            {resources.enabled && (
              <div className="grid grid-cols-3 gap-3 ml-4">
                <div>
                  <label className="block text-sm text-gray-600">CPU Limit</label>
                  <input
                    type="text"
                    value={resources.cpu}
                    onChange={(e) => setResources(prev => ({ ...prev, cpu: e.target.value }))}
                    placeholder="0.5"
                    className="mt-1 p-2 border border-gray-300 rounded w-full text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Cores (e.g., 0.5, 1, 2)</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600">Memory Limit</label>
                  <input
                    type="text"
                    value={resources.memory}
                    onChange={(e) => setResources(prev => ({ ...prev, memory: e.target.value }))}
                    placeholder="256Mi"
                    className="mt-1 p-2 border border-gray-300 rounded w-full text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">MB/GB (e.g., 256Mi, 1Gi)</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600">Storage Limit</label>
                  <input
                    type="text"
                    value={resources.storage}
                    onChange={(e) => setResources(prev => ({ ...prev, storage: e.target.value }))}
                    placeholder="100Mi"
                    className="mt-1 p-2 border border-gray-300 rounded w-full text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">MB/GB (e.g., 100Mi, 1Gi)</p>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mt-2">
              {resources.enabled 
                ? 'Resource limits help control application usage'
                : 'Resource limits are disabled - applications can use unlimited resources'
              }
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <svg className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectForm;
