import React, { useState } from 'react';
import { ServiceHeader } from '../components/service/ServiceHeader';
import { ServiceFilters } from '../components/service/ServiceFilters';
import { ServiceGrid } from '../components/service/ServiceGrid';
import { ServiceCreationDialog } from '../components/service/ServiceCreationDialog';

// Mock data - replace with actual API call
const mockServices = [
  {
    id: 1,
    name: 'User Service',
    repository: 'github.com/org/user-service',
    status: 'running',
    project: 'Development'
  },
  {
    id: 2,
    name: 'Payment API',
    repository: 'github.com/org/payment-api',
    status: 'stopped',
    project: 'Staging'
  },
  // Add more mock services as needed
];

export const ServicesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    project: 'all'
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         service.repository.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || service.status === filters.status;
    const matchesProject = filters.project === 'all' || service.project.toLowerCase() === filters.project.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  return (
    <div className="ml-64 flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <ServiceHeader onCreateService={() => setIsCreateDialogOpen(true)} />
        <ServiceFilters onFilterChange={handleFilterChange} />
        <ServiceGrid services={filteredServices} />
        
        <ServiceCreationDialog 
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </div>
  );
};