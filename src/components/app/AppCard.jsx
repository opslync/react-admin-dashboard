import React from 'react';
import { Trash2, Github } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function AppCard({ app, onViewDetails, LinkComponent, onDeleteClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <Badge className={getStatusColor(app.status)}>
              {app.status}
            </Badge>
            <Button
              onClick={() => onDeleteClick(app)}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.name}</h3>
          <div className="flex items-center gap-2 mb-4">
            <a 
              href={app.repository} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <Github className="h-4 w-4" />
            </a>
            <span className="text-sm text-gray-500">
              {app.project}
            </span>
          </div>

          <LinkComponent 
            to={onViewDetails(app.id)} 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Manage →
          </LinkComponent>
        </div>
      </div>
    </div>
  );
} 