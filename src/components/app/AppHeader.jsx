import React from 'react';
import { Button } from '@mui/material';

export const AppHeader = ({ onCreateApp }) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl font-bold mb-1">Apps</h1>
      <p className="text-gray-600">Manage your microservices and applications</p>
    </div>
    <Button
      variant="contained"
      color="primary"
      className="bg-blue-600 hover:bg-blue-700"
      onClick={onCreateApp}
    >
      + Create App
    </Button>
  </div>
);
