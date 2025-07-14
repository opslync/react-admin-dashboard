import React, { useState, useEffect } from 'react';
import { MetricsGrid } from '../../components/dashboard/MetricsGrid';
import { CPUMemoryCharts } from '../../components/dashboard/CPUMemoryCharts';
import { RecentDeployments } from '../../components/dashboard/RecentDeployments';
import { ClusterHealth } from '../../components/dashboard/ClusterHealth';
import { OnboardingBanner } from '../../components/dashboard/OnboardingBanner';
import { getMethod } from '../../library/api';
import CreateProjectForm from '../../components/CreateProjectForm';
import { DeploymentModal } from '../../components/dashboard/DeploymentModal';

const Overview = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [clusterHealth, setClusterHealth] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [availableResources, setAvailableResources] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);

  // Get userId from localStorage (assumes user object is stored as JSON with id or userId)
  let userId = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userId = user?.id || user?.userId || null;
  } catch (e) {
    userId = null;
  }
  const onboardingKey = userId ? `hasSeenOnboarding_${userId}` : 'hasSeenOnboarding';

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(onboardingKey);
    if (!hasSeenOnboarding) {
      setShowOnboardingBanner(true);
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [summaryRes, trendsRes, perfRes, deploymentsRes, clusterHealthRes, clustersRes] = await Promise.all([
          getMethod('dashboard/summary'),
          getMethod('metrics/trends'),
          getMethod('metrics/performance'),
          getMethod('deployments/recent?limit=10'),
          getMethod('cluster/health'),
          getMethod('clusters'),
        ]);
        setSummary(summaryRes.data);
        setTrends(trendsRes.data);
        const perfData = perfRes.data;
        let chartData = [];
        if (perfData && perfData.cpu && perfData.memory) {
          const cpuMap = new Map(perfData.cpu.map(item => [item.time, item.value]));
          const memoryMap = new Map(perfData.memory.map(item => [item.time, item.value]));
          const allTimes = Array.from(new Set([
            ...perfData.cpu.map(item => item.time),
            ...perfData.memory.map(item => item.time)
          ])).sort();
          // Get the 5 most recent time points
          const last5Times = allTimes.slice(-5);
          chartData = last5Times.map(time => {
            const date = new Date(time);
            const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            return {
              time: formattedTime,
              cpu: cpuMap.has(time) ? Math.round(cpuMap.get(time)) : null,
              memory: memoryMap.has(time) ? Math.round(memoryMap.get(time)) : null
            };
          });
        }
        setPerformance(chartData);
        setDeployments(deploymentsRes.data);
        setClusterHealth(clusterHealthRes.data);
        setClusters(Array.isArray(clustersRes.data) ? clustersRes.data : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Refresh only performance data every 5 minutes
  React.useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const perfRes = await getMethod('metrics/performance');
        const perfData = perfRes.data;
        let chartData = [];
        if (perfData && perfData.cpu && perfData.memory) {
          const cpuMap = new Map(perfData.cpu.map(item => [item.time, item.value]));
          const memoryMap = new Map(perfData.memory.map(item => [item.time, item.value]));
          const allTimes = Array.from(new Set([
            ...perfData.cpu.map(item => item.time),
            ...perfData.memory.map(item => item.time)
          ])).sort();
          // Get the 5 most recent time points
          const last5Times = allTimes.slice(-5);
          chartData = last5Times.map(time => {
            const date = new Date(time);
            const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            return {
              time: formattedTime,
              cpu: cpuMap.has(time) ? Math.round(cpuMap.get(time)) : null,
              memory: memoryMap.has(time) ? Math.round(memoryMap.get(time)) : null
            };
          });
        }
        setPerformance(chartData);
      } catch (error) {
        console.error('Error refreshing performance data:', error);
      }
    };
    const interval = setInterval(fetchPerformance, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
    setShowOnboardingBanner(false);
    localStorage.setItem(onboardingKey, 'true');
  };

  const handleDismissBanner = () => {
    setShowOnboardingBanner(false);
    localStorage.setItem(onboardingKey, 'true');
  };

  // Handler for project creation (replace with real API call if needed)
  const handleCreateProject = async (projectData) => {
    // TODO: Implement actual project creation logic (API call)
    // For now, just close the modal
    setShowCreateProjectModal(false);
    // Optionally, refresh dashboard data here
  };

  if (loading || !summary || !trends || !performance || !clusterHealth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
              <p className="text-gray-600">Monitor your projects and deployments</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back!</p>
                <p className="font-medium text-gray-900">{summary.organizationName}</p>
              </div>
              <button
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center focus:outline-none hover:ring-2 hover:ring-blue-400 transition"
                aria-label="Open user profile"
                onClick={() => { window.location.href = '/user-profile'; }}
                title="Open profile"
                type="button"
              >
                <span className="text-white font-semibold text-sm">
                  {summary.organizationName.charAt(0)}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Onboarding Banner */}
        {showOnboardingBanner && (
          <OnboardingBanner
            onStartOnboarding={handleStartOnboarding}
            onDismiss={handleDismissBanner}
          />
        )}

        {/* Metrics Grid */}
        <div className="mb-8">
          <MetricsGrid
            totalProjects={summary.totalProjects}
            totalApps={summary.totalApps}
            activeUsers={summary.activeUsers}
            organizationName={summary.organizationName}
            trends={trends}
          />
        </div>

        {/* Performance Charts */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">System Performance</h2>
            <p className="text-gray-600">Real-time CPU and memory usage across your infrastructure</p>
          </div>
          <CPUMemoryCharts data={performance} />
        </div>

        {/* Bottom Section - Deployments and Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentDeployments deployments={deployments || []} />
          </div>
          <div>
            <ClusterHealth health={clusterHealth} />
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              onClick={async () => {
                setShowCreateProjectModal(true);
                try {
                  // Fetch onboarding status
                  const onboardingRes = await getMethod('onboarding/status');
                  const onboardingData = onboardingRes.data?.data || {};
                  // Extract organizationId
                  let orgId = null;
                  if (onboardingData.organization && onboardingData.organization.id) {
                    orgId = onboardingData.organization.id;
                  } else if (onboardingData.cluster && onboardingData.cluster.organizationId) {
                    orgId = onboardingData.cluster.organizationId;
                  }
                  setOrganizationId(orgId);
                  // Extract clusters (support single or array)
                  let clustersArr = [];
                  if (Array.isArray(onboardingData.clusters)) {
                    clustersArr = onboardingData.clusters;
                  } else if (onboardingData.cluster && onboardingData.cluster.id) {
                    clustersArr = [onboardingData.cluster];
                  }
                  setClusters(clustersArr);
                  // Fetch available resources for the first cluster (if any)
                  if (clustersArr.length > 0) {
                    const res = await getMethod('cluster/available-resources');
                    setAvailableResources(res.data.availableResources);
                  } else {
                    setAvailableResources(null);
                  }
                } catch (err) {
                  setAvailableResources(null);
                  setOrganizationId(null);
                  setClusters([]);
                }
              }}
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">+</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">New Project</p>
                <p className="text-sm text-gray-600">Create a new project</p>
              </div>
            </button>
            
            <button
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              onClick={() => setShowDeploymentModal(true)}
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">↗</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Deploy App</p>
                <p className="text-sm text-gray-600">Deploy to Environment</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              onClick={() => { window.location.href = 'http://localhost:3000/settings/git-account'; }}
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">⚙</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-600">Manage preferences</p>
              </div>
            </button>
          </div>
        </div>
        {/* Create Project Modal */}
        {showCreateProjectModal && (
          <CreateProjectForm
            onSubmit={handleCreateProject}
            onClose={() => setShowCreateProjectModal(false)}
            availableResources={availableResources}
            organizationId={organizationId}
            clusters={clusters}
          />
        )}
        {/* Deployment Modal */}
        {showDeploymentModal && (
          <DeploymentModal isOpen={showDeploymentModal} onClose={() => setShowDeploymentModal(false)} />
        )}
      </div>
    </div>
  );
};

export default Overview;