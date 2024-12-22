import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ServiceHeader } from '../components/service/ServiceHeader';
import { ServiceFilters } from '../components/service/ServiceFilters';
import { ServiceGrid } from '../components/service/ServiceGrid';
import { ServiceCreationDialog } from '../components/service/ServiceCreationDialog';
import { getMethod } from '../library/api';
import { listApps } from '../library/constant';

export const ServicesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    project: 'all'
  });

  const fetchServices = async () => {
    try {
      const response = await getMethod(listApps);
      const mappedServices = response.data.map(app => ({
        id: app.ID,
        name: app.name,
        repository: app.repoUrl,
        status: app.status || 'unknown',
        project: app.projectId || 'Development'
      }));
      setServices(mappedServices);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         service.repository.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || service.status === filters.status;
    const matchesProject = filters.project === 'all' || service.project.toLowerCase() === filters.project.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  const handleViewDetails = (serviceId) => {
    return `/app/${serviceId}/details`;
  };

  return (
    <div className="ml-64 flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <ServiceHeader onCreateService={() => setIsCreateDialogOpen(true)} />
        <ServiceFilters 
          onFilterChange={handleFilterChange} 
          filters={filters}
          loading={loading}
        />
        <ServiceGrid 
          services={filteredServices} 
          loading={loading}
          onViewDetails={handleViewDetails}
          LinkComponent={Link}
        />
        
        <ServiceCreationDialog 
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onServiceCreated={fetchServices}
        />
      </div>
    </div>
  );
};