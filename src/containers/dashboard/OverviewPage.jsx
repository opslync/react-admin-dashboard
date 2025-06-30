import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeployments } from '../../hooks/useDeployments';
import { useClusterMetrics } from '../../hooks/useClusterMetrics';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ChevronRight, Server, Users, Cloud, Activity, Rocket, X } from 'lucide-react';
import { getMethod } from '../../library/api';
import onboardingManager from '../../utils/onboardingManager';
import OnboardingFlow from '../../components/onboarding/OnboardingFlow';

const OverviewPage = () => {
  const { deployments, loading: deploymentsLoading } = useDeployments();
  const { clusterMetrics } = useClusterMetrics();
  const [totalNodes, setTotalNodes] = useState(sessionStorage.getItem('totalNodes') || 0);
  const [totalApps, setTotalApps] = useState(sessionStorage.getItem('totalApps') || 0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState(null);

  useEffect(() => {
    const fetchClusterResources = async () => {
      try {
        const response = await getMethod('cluster/resources');
        if (response.data && response.data.total) {
          const { total_nodes } = response.data.total;
          setTotalNodes(total_nodes);
          sessionStorage.setItem('totalNodes', total_nodes);
        }
      } catch (error) {
        console.error('Error fetching cluster resources:', error);
      }
    };

    const fetchTotalApps = async () => {
      try {
        const response = await getMethod('apps');
        if (response.data) {
          const appsCount = response.data.length;
          setTotalApps(appsCount);
          sessionStorage.setItem('totalApps', appsCount);
        }
      } catch (error) {
        console.error('Error fetching total apps:', error);
      }
    };

    const checkOnboardingStatus = async () => {
      try {
        const status = await onboardingManager.checkOnboardingStatus();
        setOnboardingStatus(status);
        // Don't automatically show banner - onboarding is only for new signups
        // Banner can be shown manually if needed
        const bannerDismissed = localStorage.getItem('onboarding-banner-dismissed');
        if (status.needsOnboarding && totalApps == 0 && !bannerDismissed) {
          // Only show if user explicitly hasn't dismissed it
          setShowOnboardingBanner(false); // Disabled auto-show
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    fetchClusterResources();
    fetchTotalApps();
    checkOnboardingStatus();
  }, [totalApps]);

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
    setShowOnboardingBanner(false);
  };

  const handleOnboardingComplete = () => {
    onboardingManager.markCompleted();
    setShowOnboarding(false);
    setShowOnboardingBanner(false);
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  const handleDismissBanner = () => {
    setShowOnboardingBanner(false);
    localStorage.setItem('onboarding-banner-dismissed', 'true');
  };

  if (deploymentsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:ml-64 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Overview</h1>

      {/* Onboarding Banner */}
      {showOnboardingBanner && (
        <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <Rocket className="h-5 w-5 text-blue-600" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div>
              <p className="font-semibold text-blue-900 mb-1">Welcome to Opslync! 🎉</p>
              <p className="text-blue-700">
                Get started quickly by setting up your GitHub integration, connecting a cluster, and creating your first project.
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                onClick={handleStartOnboarding}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
              >
                Start Setup Guide
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismissBanner}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-gray-600">Total Nodes</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{totalNodes}</span>
                <span className="text-sm text-gray-500">nodes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-500" />
                <h3 className="font-medium text-gray-600">Active Developers</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">24</span>
                <span className="text-sm text-gray-500">users</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-5 h-5 text-purple-500" />
                <h3 className="font-medium text-gray-600">Total Apps</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{totalApps}</span>
                <span className="text-sm text-gray-500">apps</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-gray-600">Cluster Load</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">67%</span>
                <span className="text-sm text-gray-500">utilization</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deployments */}
      <Card>
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Deployments</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {deployments?.slice(0, 3).map((deployment) => (
            <div key={deployment.id} className="p-4 hover:bg-gray-50">
              <Link to={`/deployment/${deployment.id}`} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    deployment.status === 'Deployed' ? 'bg-green-100 text-green-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {deployment.status}
                  </div>
                  <span className="font-medium text-gray-900">{deployment.name}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Onboarding Flow */}
      <OnboardingFlow
        open={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default OverviewPage;