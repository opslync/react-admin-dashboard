import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { ChevronRight, GitBranch, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader as ModalHeader,
  DialogTitle,
  DialogClose,
} from '../ui/dialog';

const getStatusIcon = (status) => {
  switch (status) {
    case 'Success':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'Failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'Running':
      return <AlertCircle className="w-4 h-4 text-blue-500" />;
    case 'Pending':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Success':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Running':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const RecentDeployments = ({ deployments = [] }) => {
  const [open, setOpen] = useState(false);
  const limitedDeployments = deployments.slice(0, 3);

  const renderDeploymentList = (list) => (
    <div className="divide-y divide-gray-100">
      {list.map((deployment) => (
        <div key={deployment.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(deployment.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deployment.status)}`}>
                  {deployment.status}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{deployment.name}</span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <GitBranch className="w-3 h-3" />
                  <span>{deployment.branch}</span>
                  <span>•</span>
                  <span>{deployment.author}</span>
                  {deployment.duration && (
                    <>
                      <span>•</span>
                      <span>{deployment.duration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{deployment.timestamp}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Deployments</h2>
            <button
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => setOpen(true)}
              type="button"
            >
              View all
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {renderDeploymentList(limitedDeployments)}
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-white">
          <ModalHeader>
            <DialogTitle>All Deployments</DialogTitle>
            {/* Removed custom close button to avoid overlap; DialogContent already provides a close button */}
          </ModalHeader>
          <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {renderDeploymentList(deployments)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};