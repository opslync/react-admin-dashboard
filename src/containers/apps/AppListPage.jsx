import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../../components/app/AppHeader';
import { AppFilters } from '../../components/app/AppFilters';
import { AppGrid } from '../../components/app/AppGrid';
import { AppCreationDialog } from '../../components/app/AppCreationDialog';
import { getMethod, deleteMethod } from '../../library/api';
import { listApps, listProject } from '../../library/constant';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const DeleteConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  appToDelete, 
  onConfirm, 
  isDeleting, 
  error 
}) => {
  const [confirmName, setConfirmName] = useState('');

  // Reset confirm name when dialog opens
  useEffect(() => {
    if (open) {
      setConfirmName('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Delete Application</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 font-medium">Warning: This action cannot be undone</p>
            <p className="text-sm text-red-700 mt-1">
              This will permanently delete the application "{appToDelete?.name}" and all associated resources:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 mt-2">
              <li>All deployments and configurations</li>
              <li>Build history and logs</li>
              <li>Environment variables</li>
              <li>Associated infrastructure resources</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="font-mono text-gray-800">{appToDelete?.name}</span> to confirm:
              </label>
              <Input
                type="text"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                className="w-full"
                placeholder={`Enter ${appToDelete?.name}`}
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 border-t pt-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(confirmName)}
            disabled={isDeleting || confirmName !== appToDelete?.name}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AppListPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    project: 'all'
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const response = await getMethod(listProject);
      setProjects(response.data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjects([]);
    }
  };

  const fetchApps = async () => {
    try {
      const response = await getMethod(listApps);
      // First set the apps with initial status
      const initialApps = response.data.map(app => ({
        id: app.ID,
        name: app.name,
        repository: app.repoUrl,
        status: 'Not Deployed',
        project: app.project?.name || 'Default',
        projectId: app.project?.id
      }));
      setApps(initialApps);
      setLoading(false);

      // Then update status for each app
      const updatedApps = [...initialApps];
      for (const app of response.data) {
        try {
          const podResponse = await getMethod(`app/${app.ID}/pod/list`);
          if (podResponse.data && podResponse.data.length > 0) {
            const pod = podResponse.data[0];
            const index = updatedApps.findIndex(a => a.id === app.ID);
            if (index !== -1) {
              updatedApps[index] = {
                ...updatedApps[index],
                status: pod.status || 'Not Deployed'
              };
              setApps([...updatedApps]); // Update state with each status change
            }
          }
        } catch (err) {
          console.error(`Failed to fetch pod status for app ${app.ID}:`, err);
        }
      }
    } catch (err) {
      console.error('Failed to fetch apps:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    fetchProjects();
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         app.repository.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || app.status.toLowerCase() === filters.status.toLowerCase();
    const matchesProject = filters.project === 'all' || 
                          (app.projectId && app.projectId.toString() === filters.project.toString());
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  const getStatusOptions = () => {
    return [
      { label: 'All Status', value: 'all' },
      { label: 'Running', value: 'running' },
      { label: 'Not Deployed', value: 'not deployed' },
      { label: 'Failed', value: 'failed' },
      { label: 'Pending', value: 'pending' }
    ];
  };

  const getProjectOptions = () => {
    return [
      { label: 'All Projects', value: 'all' },
      ...projects.map(project => ({
        label: project.name || 'Unnamed Project',
        value: project.id.toString()
      }))
    ];
  };

  const handleViewDetails = (appId) => {
    return `/app/${appId}/details`;
  };

  const handleDeleteClick = (app) => {
    setAppToDelete(app);
    setDeleteError('');
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async (confirmName) => {
    if (confirmName !== appToDelete.name) {
      setDeleteError('App name does not match');
      return;
    }
    setIsDeleting(true);
    try {
      await deleteMethod(`app/${appToDelete.id}`);
      setShowDeleteDialog(false);
      window.location.reload();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete app. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="ml-64 flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <AppHeader onCreateApp={() => setIsCreateDialogOpen(true)} />
        <AppFilters 
          onFilterChange={handleFilterChange} 
          filters={filters}
          loading={loading}
        />
        <AppGrid 
          apps={filteredApps} 
          loading={loading}
          onViewDetails={handleViewDetails}
          LinkComponent={Link}
          onDeleteClick={handleDeleteClick}
        />
        
        {isCreateDialogOpen && (
          <AppCreationDialog 
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onAppCreated={fetchApps}
          />
        )}
        <DeleteConfirmationDialog 
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          appToDelete={appToDelete}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
          error={deleteError}
        />
      </div>
    </div>
  );
};

export default AppListPage;
