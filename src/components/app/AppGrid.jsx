import React from 'react';
import { CircularProgress } from '@mui/material';
import { AppCard } from './AppCard';

export const AppGrid = ({ apps, loading, onViewDetails, LinkComponent, onDeleteClick }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          onViewDetails={onViewDetails}
          LinkComponent={LinkComponent}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
};
