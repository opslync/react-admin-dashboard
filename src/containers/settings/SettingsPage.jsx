import React from 'react';
import { Card } from 'primereact/card';
import { useHistory } from 'react-router-dom';

const SettingsPage = () => {
  const history = useHistory();

  const settingsOptions = [
    {
      title: 'Git Account',
      description: 'Configure your Git account settings',
      path: '/settings/git-account'
    },
    {
      title: 'Container Registry',
      description: 'Manage container registry configurations',
      path: '/settings/container-oci-registry'
    },
    {
      title: 'GitHub Integration',
      description: 'Set up GitHub application integration',
      path: '/github-source'
    }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsOptions.map((option, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => history.push(option.path)}
          >
            <h2 className="text-xl font-semibold mb-2">{option.title}</h2>
            <p className="text-gray-600">{option.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage; 