import React, { useState, useEffect } from 'react';

const CreateProjectForm = ({ onSubmit, onClose, availableResources, organizationId, clusters }) => {
  const [name, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [resources, setResources] = useState({
    enabled: true,
    cpu: '0.5',
    memory: '256Mi',
    storage: '100Mi'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clusterId, setClusterId] = useState(clusters && clusters.length > 0 ? clusters[0].id : '');
  let isMounted = true;

  useEffect(() => {
    if (clusters && clusters.length > 0) {
      setClusterId(clusters[0].id);
    }
  }, [clusters]);

  useEffect(() => {
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to parse resource values (CPU as float, memory/storage as Mi/Gi/GB)
  function parseResource(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      if (value.toLowerCase().endsWith('gi')) {
        return parseFloat(value) * 1024;
      } else if (value.toLowerCase().endsWith('gb')) {
        return parseFloat(value) * 1024;
      } else if (value.toLowerCase().endsWith('mi')) {
        return parseFloat(value);
      } else {
        return parseFloat(value);
      }
    }
    return 0;
  }

  function parseCPU(value) {
    return parseFloat(value);
  }

  // Resource step and min values
  const minCPU = 0.1;
  const cpuStep = 0.1;
  const minMemory = 128; // Mi
  const memoryStep = 128; // Mi
  const minStorage = 128; // Mi
  const storageStep = 128; // Mi

  // Helpers to get numeric values for comparison
  const currentCPU = parseCPU(resources.cpu);
  const currentMemory = parseResource(resources.memory);
  const currentStorage = parseResource(resources.storage);
  const maxCPU = availableResources ? parseCPU(availableResources.cpu) : 100;
  const maxMemory = availableResources ? parseResource(availableResources.memory) : 102400;
  const maxStorage = availableResources ? parseResource(availableResources.storage) : 102400;

  // Handlers for increment/decrement
  const handleResourceChange = (type, direction) => {
    setResources(prev => {
      let value;
      if (type === 'cpu') {
        value = parseFloat(prev.cpu);
        value = direction === 'inc' ? Math.min(value + cpuStep, maxCPU) : Math.max(value - cpuStep, minCPU);
        return { ...prev, cpu: value.toFixed(2).replace(/\.00$/, '') };
      } else if (type === 'memory') {
        value = parseResource(prev.memory);
        value = direction === 'inc' ? Math.min(value + memoryStep, maxMemory) : Math.max(value - memoryStep, minMemory);
        return { ...prev, memory: value + 'Mi' };
      } else if (type === 'storage') {
        value = parseResource(prev.storage);
        value = direction === 'inc' ? Math.min(value + storageStep, maxStorage) : Math.max(value - storageStep, minStorage);
        return { ...prev, storage: value + 'Mi' };
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError('');
    setDescriptionError('');
    setError(null);
    let hasError = false;
    if (!name.trim()) {
      setNameError('Project Name is required');
      hasError = true;
    }
    if (!description.trim()) {
      setDescriptionError('Description is required');
      hasError = true;
    }
    if (hasError) return;
    setLoading(true);
    // Resource validation
    if (resources.enabled && availableResources) {
      const reqCPU = parseCPU(resources.cpu);
      const reqMem = parseResource(resources.memory);
      const reqStorage = parseResource(resources.storage);
      const availCPU = parseCPU(availableResources.cpu);
      const availMem = parseResource(availableResources.memory);
      const availStorage = parseResource(availableResources.storage);
      if (reqCPU > availCPU) {
        setError(`Requested CPU (${reqCPU}) exceeds available (${availCPU})`);
        setLoading(false);
        return;
      }
      if (reqMem > availMem) {
        setError(`Requested Memory (${resources.memory}) exceeds available (${availableResources.memory})`);
        setLoading(false);
        return;
      }
      if (reqStorage > availStorage) {
        setError(`Requested Storage (${resources.storage}) exceeds available (${availableResources.storage})`);
        setLoading(false);
        return;
      }
    }
    try {
      await onSubmit({
        name,
        description,
        organizationId,
        clusterId,
        resources
      });
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

  // Show available resources if provided
  const renderAvailableResources = () => {
    if (!availableResources) return null;
    return (
      <div className="mb-2 text-xs text-gray-500">
        <div>Available: CPU: {availableResources.cpu}, Memory: {availableResources.memory}, Storage: {availableResources.storage}</div>
      </div>
    );
  };

  // Cluster selection dropdown
  const renderClusterSelect = () => {
    if (!clusters || clusters.length === 0) return null;
    return (
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Select Cluster</label>
        <select
          value={clusterId}
          onChange={e => setClusterId(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded w-full"
        >
          {clusters.map(cluster => (
            <option key={cluster.id} value={cluster.id}>{cluster.name || `Cluster ${cluster.id}`}</option>
          ))}
        </select>
      </div>
    );
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
              className={`mt-1 p-2 border rounded w-full ${nameError ? 'border-red-500' : 'border-gray-300'}`}
            />
            {nameError && <div className="text-xs text-red-500 mt-1">{nameError}</div>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-1 p-2 border rounded w-full ${descriptionError ? 'border-red-500' : 'border-gray-300'}`}
            />
            {descriptionError && <div className="text-xs text-red-500 mt-1">{descriptionError}</div>}
          </div>
          {renderClusterSelect()}
          
          {/* Resource Configuration */}
          <div className="mb-4 border-t pt-4">
            {renderAvailableResources()}
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
                {/* CPU Limit */}
                <div>
                  <label className="block text-sm text-gray-600">CPU Limit</label>
                  <div className="flex items-center mt-1">
                    <button type="button" className="px-2 py-1 border rounded-l bg-gray-100" onClick={() => handleResourceChange('cpu', 'dec')} disabled={currentCPU <= minCPU}>-</button>
                    <div className="px-3 py-1 border-t border-b w-16 text-sm text-center">{resources.cpu}</div>
                    <button type="button" className="px-2 py-1 border rounded-r bg-gray-100" onClick={() => handleResourceChange('cpu', 'inc')} disabled={currentCPU >= maxCPU}>+</button>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-1">Cores</p>
                </div>
                {/* Memory Limit */}
                <div>
                  <label className="block text-sm text-gray-600">Memory Limit</label>
                  <div className="flex items-center mt-1">
                    <button type="button" className="px-2 py-1 border rounded-l bg-gray-100" onClick={() => handleResourceChange('memory', 'dec')} disabled={currentMemory <= minMemory}>-</button>
                    <div className=" py-1 border-t border-b w-16 text-sm text-center">{resources.memory}</div>
                    <button type="button" className="px-2 py-1 border rounded-r bg-gray-100" onClick={() => handleResourceChange('memory', 'inc')} disabled={currentMemory >= maxMemory}>+</button>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-1">MB</p>
                </div>
                {/* Storage Limit */}
                <div>
                  <label className="block text-sm text-gray-600">Storage Limit</label>
                  <div className="flex items-center mt-1">
                    <button type="button" className="px-2 py-1 border rounded-l bg-gray-100" onClick={() => handleResourceChange('storage', 'dec')} disabled={currentStorage <= minStorage}>-</button>
                    <div className=" py-1 border-t border-b w-16 text-sm text-center">{resources.storage}</div>
                    <button type="button" className="px-2 py-1 border rounded-r bg-gray-100" onClick={() => handleResourceChange('storage', 'inc')} disabled={currentStorage >= maxStorage}>+</button>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-1">MB</p>
                </div>
              </div>
            )}
            
            <p className="text-xs pt-2 pb-4 text-yellow-500 text-gray-600 mt-2">
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
