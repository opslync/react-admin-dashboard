import React from 'react';
import { Card, CardContent } from './ui/Card';
import { FolderOpen, Users, Cloud, Building2 } from 'lucide-react';

const MetricCard = ({ title, value, unit, icon, trend }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="font-semibold text-gray-700">{title}</h3>
          </div>
          {trend && (
            <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricsGrid = ({
  totalProjects,
  totalApps,
  activeUsers,
  organizationName,
  trends = {}
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Projects"
        value={totalProjects}
        unit="projects"
        icon={<FolderOpen className="w-6 h-6 text-blue-500" />}
        trend={trends.projects}
      />
      <MetricCard
        title="Active Developers"
        // value={activeUsers}
        value="1"
        unit="users"
        icon={<Users className="w-6 h-6 text-green-500" />}
        trend={trends.users}
      />
      <MetricCard
        title="Total Apps"
        value={totalApps}
        unit="apps"
        icon={<Cloud className="w-6 h-6 text-purple-500" />}
        trend={trends.apps}
      />
      <MetricCard
        title="Organization"
        value={organizationName}
        unit=""
        icon={<Building2 className="w-6 h-6 text-orange-500" />}
      />
    </div>
  );
};