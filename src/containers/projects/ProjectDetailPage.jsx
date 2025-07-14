import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMethod } from '../../library/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ChevronLeft, Cpu, MemoryStick, HardDrive, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { AppCreationDialog } from '../../components/app/AppCreationDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { parseCPU, parseMemory, formatCPUDisplay, formatMemoryDisplay } from '../../utils/formatters';

class CustomWebSocket extends WebSocket {
  constructor(url, token) {
    // Create a URL object to modify the query parameters
    const wsUrl = new URL(url);
    // Add the token as a query parameter
    wsUrl.searchParams.append('token', token);
    super(wsUrl.toString());
  }
}

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    cpu: { used: 0, total: 1, percentage: 0 },
    ram: { used: 0, total: 1, percentage: 0 },
    storage: { used: 0, total: 1, percentage: 0 }
  });
  const wsRef = useRef(null);
  const appsRef = useRef(apps);

  // Keep appsRef.current in sync with apps state
  useEffect(() => {
    appsRef.current = apps;
  }, [apps]);

  useEffect(() => {
    const connectWebSocket = () => {
      const token = localStorage.getItem('token');
      const ws = new CustomWebSocket(`ws://localhost:8080/api/projects/${projectId}/metrics`, token);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          console.log('ProjectDetailPage - Received WebSocket data:', data);
          
          // Check if we have the required data structure
          if (!data.resourceQuota) {
            console.error('Invalid data format received: missing resourceQuota', data);
            return;
          }
          
          // If usage data is not available, use default values or calculate from resourceQuota
          const usage = data.usage || {
            cpu: '0',
            memory: '0',
            storage: '0'
          };
          
          // Validate resourceQuota structure
          if (!data.resourceQuota.cpu || !data.resourceQuota.memory || !data.resourceQuota.storage) {
            console.warn('ProjectDetailPage - Incomplete resourceQuota data:', data.resourceQuota);
            // Use default values for missing quota data
            const defaultQuota = {
              cpu: data.resourceQuota.cpu || '1',
              memory: data.resourceQuota.memory || '1Gi',
              storage: data.resourceQuota.storage || '1Gi'
            };
            data.resourceQuota = { ...data.resourceQuota, ...defaultQuota };
          }

          // Use new formatters for CPU, memory, and storage
          const cpuTotal = parseCPU(data.resourceQuota.cpu);
          const cpuUsed = parseCPU(usage.cpu);

          const memTotalMi = parseMemory(data.resourceQuota.memory);
          const memUsedMi = parseMemory(usage.memory);
          const memTotalDisplay = formatMemoryDisplay(data.resourceQuota.memory);
          const memUsedDisplay = formatMemoryDisplay(usage.memory);

          const storageTotalMi = parseMemory(data.resourceQuota.storage);
          const storageUsedMi = parseMemory(usage.storage);
          const storageTotalDisplay = formatMemoryDisplay(data.resourceQuota.storage);
          const storageUsedDisplay = formatMemoryDisplay(usage.storage);
          
          console.log('ProjectDetailPage - Parsed metrics:', {
            cpu: { total: cpuTotal, used: cpuUsed },
            memory: { total: memTotalMi, used: memUsedMi },
            storage: { total: storageTotalMi, used: storageUsedMi }
          });

          setMetrics({
            cpu: {
              used: cpuUsed,
              total: cpuTotal || 1,
              percentage: Math.round((cpuUsed / (cpuTotal || 1)) * 100) || 0,
              allocated: `${formatCPUDisplay(cpuUsed)}/${formatCPUDisplay(cpuTotal)} Cores`
            },
            ram: {
              used: memUsedMi,
              total: memTotalMi || 1,
              percentage: Math.round((memUsedMi / (memTotalMi || 1)) * 100) || 0,
              allocated: `${memUsedDisplay.value}/${memTotalDisplay.value} ${memTotalDisplay.unit}`
            },
            storage: {
              used: storageUsedMi,
              total: storageTotalMi || 1,
              percentage: Math.round((storageUsedMi / (storageTotalMi || 1)) * 100) || 0,
              allocated: `${storageUsedDisplay.value}/${storageTotalDisplay.value} ${storageTotalDisplay.unit}`
            }
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          console.log('Raw message:', event.data);
          
          // Set default metrics if parsing fails
          setMetrics({
            cpu: {
              used: 0,
              total: 1,
              percentage: 0,
              allocated: '0.00/1.00 Cores'
            },
            ram: {
              used: 0,
              total: 1,
              percentage: 0,
              allocated: '0.00/1.00 MiB'
            },
            storage: {
              used: 0,
              total: 1,
              percentage: 0,
              allocated: '0.00/1.00 MiB'
            }
          });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const projectResponse = await getMethod(`project/${projectId}/apps`);
        setProject(projectResponse.data);
        // Initialize apps with Unknown status
        const initialApps = projectResponse.data.map(app => ({
          ...app,
          status: 'Unknown'
        }));
        setApps(initialApps);
        setLoading(false);
        // Fetch pod statuses separately
        fetchPodStatuses(initialApps);
      } catch (err) {
        setError('Failed to fetch project details. Please try again.');
        setLoading(false);
      }
    };

    fetchProjectDetails();

    // Set up interval to refresh pod status using latest apps
    const statusInterval = setInterval(() => fetchPodStatuses(appsRef.current), 10000);
    return () => {
      clearInterval(statusInterval);
    };
  }, [projectId]);

  const fetchPodStatuses = async (currentApps) => {
    // Fetch pod status for each app in parallel
    const statusPromises = currentApps.map(async (app) => {
      try {
        const podResponse = await getMethod(`app/${app.ID}/pod/list`);
        let status = 'Unknown';
        if (podResponse.data && podResponse.data.length > 0) {
          status = podResponse.data[0].status || 'Unknown';
        }
        return { ...app, status };
      } catch (err) {
        console.error(`Failed to fetch pod status for app ${app.ID}:`, err);
        return { ...app, status: 'Unknown' };
      }
    });
    // Wait for all status updates to complete
    const updatedApps = await Promise.all(statusPromises);
    setApps(updatedApps);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const ResourceCard = ({ title, icon: Icon, used, total, percentage, allocated }) => (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
            <span className="text-sm text-gray-500">allocated</span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  percentage > 80 ? 'bg-red-500' : 
                  percentage > 60 ? 'bg-yellow-500' : 
                  'bg-blue-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-sm text-gray-500">
              {allocated}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleAppCreated = async () => {
    try {
      const appsResponse = await getMethod(`project/${projectId}/apps`);
      setApps(appsResponse.data);
      handleCloseCreateModal();
    } catch (err) {
      console.error('Failed to refresh apps:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-gray-600 hover:text-gray-900"
          >
            <Link to="/project">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Projects
            </Link>
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {project?.name || 'Project Overview'}
            </h1>
            <p className="text-gray-500 mt-1">
              Resource usage and applications
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Application
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsCreateModalOpen(true)}>
                From GitHub
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                From Docker Image
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Resource Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ResourceCard
            title="CPU"
            icon={Cpu}
            {...metrics.cpu}
          />
          <ResourceCard
            title="RAM"
            icon={MemoryStick}
            {...metrics.ram}
          />
          <ResourceCard
            title="Storage"
            icon={HardDrive}
            {...metrics.storage}
          />
        </div>

        {/* Applications Grid */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Applications</h2>
              <span className="text-sm text-gray-500">{apps.length} total</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {apps.length > 0 ? (
              apps.map((app) => (
                <div key={app.ID} className="p-4 hover:bg-gray-50">
                  <Link 
                    to={`/app/${app.ID}/details`}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      {app.status && app.status !== 'Unknown' && (
                        <Badge className={`${getStatusColor(app.status)} px-2 py-0.5 text-xs font-medium`}>
                          {app.status}
                        </Badge>
                      )}
                      <span className="font-medium text-gray-900">{app.name}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No applications found in this project.</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Application
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setIsCreateModalOpen(true)}>
                      From GitHub
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      From Docker Image
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Creation Modal */}
      <AppCreationDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onAppCreated={handleAppCreated}
      />
    </div>
  );
};

export default ProjectDetailPage;
