import React, { useState } from 'react';

const GitDetailsForm = ({ onSubmit, onClose, errorMessage }) => {
  const [username, setGitUsername] = useState('');
  const [githubToken, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onSubmit({ username, githubToken })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl mb-4">Save Git Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Git Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setGitUsername(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Token</label>
            <input
              type="text"
              value={githubToken}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>
          {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-3 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-2 rounded"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GitDetailsForm;