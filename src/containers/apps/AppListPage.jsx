import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../../components/app/AppHeader';
import { AppFilters } from '../../components/app/AppFilters';
import { AppGrid } from '../../components/app/AppGrid';
import { AppCreationDialog } from '../../components/app/AppCreationDialog';
import { getMethod } from '../../library/api';
import { listApps } from '../../library/constant';

const AppListPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    project: 'all'
  });

  const fetchApps = async () => {
    try {
      const response = await getMethod(listApps);
      const mappedApps = response.data.map(app => ({
        id: app.ID,
        name: app.name,
        repository: app.repoUrl,
        status: app.status || 'unknown',
        project: app.projectId || 'Development'
      }));
      setApps(mappedApps);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch apps:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
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
    const matchesStatus = filters.status === 'all' || app.status === filters.status;
    const matchesProject = filters.project === 'all' || app.project.toLowerCase() === filters.project.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  const handleViewDetails = (appId) => {
    return `/app/${appId}/details`;
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
        />
        
        {isCreateDialogOpen && (
          <AppCreationDialog 
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onAppCreated={fetchApps}
          />
        )}
      </div>
    </div>
  );
};

export default AppListPage;
