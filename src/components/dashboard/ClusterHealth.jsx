import React from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const getStatusIcon = (status) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'critical':
    case 'error':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <CheckCircle className="w-4 h-4 text-gray-500" />;
  }
};

// Accept health as a prop
export const ClusterHealth = ({ health }) => {
  // Map API data to UI metrics
  const metrics = [
    {
      name: 'API Server', 
      status: health?.apiServer?.status || 'healthy',
      value: health?.apiServer?.value || '99.9%',
      description: health?.apiServer?.description || 'Uptime',
    },
    {
      name: 'Database',
      status: health?.database?.status || 'healthy',
      value: health?.database?.value || '2.3ms',
      description: health?.database?.description || 'Avg Response Time',
    },
    {
      name: 'Storage',
      status: health?.storage?.status || 'warning',
      value: health?.storage?.value || '78%',
      description: health?.storage?.description || 'Used',
    },
    {
      name: 'Network',
      status: health?.network?.status || 'healthy',
      value: health?.network?.value || '1.2GB/s',
      description: health?.network?.description || 'Throughput',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900">Cluster Health</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="flex-col items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(metric.status)}
                <div>
                  <p className="font-medium text-gray-900">{metric.name}</p>
                </div>
              </div>
              <div className="text-sm w-full text-center pt-2">
                <p className=" text-gray-900">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};