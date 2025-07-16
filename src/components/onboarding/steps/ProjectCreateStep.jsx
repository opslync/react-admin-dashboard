import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { FolderPlus, Info, Settings } from "lucide-react";
import { getMethod, postMethod } from "../../../library/api";
import onboardingManager from "../../../utils/onboardingManager";
import { toast } from "react-toastify";

const ProjectCreateStep = forwardRef(({
  onComplete,
  stepData,
  isLoading,
  error,
  setError,
}, ref) => {
  // Debug log to verify cluster data is being passed
  console.log("ProjectCreateStep - Received stepData:", stepData);
  console.log("ProjectCreateStep - Organization ID:", stepData.organizationId);
  console.log("ProjectCreateStep - Cluster ID:", stepData.clusterId);
  console.log("ProjectCreateStep - Cluster Name:", stepData.clusterName);
  const [formData, setFormData] = useState({
    name: stepData.name || "",
    description: stepData.description || "",
    clusterId: stepData.clusterId || "",
    resources: stepData.resources || {
      enabled: true,
      cpu: "1",
      memory: "512Mi",
      storage: "1Gi",
    },
  });
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [loadingClusters, setLoadingClusters] = useState(true);
  const [selectOpen, setSelectOpen] = useState(false);
  const [clusterResources, setClusterResources] = useState(null);

  // Helpers for resource parsing/formatting
  const parseResource = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      if (value.toLowerCase().endsWith('gi')) {
        return parseFloat(value) * 1024;
      } else if (value.toLowerCase().endsWith('gb')) {
        return parseFloat(value) * 1024;
      } else if (value.toLowerCase().endsWith('mi')) {
        return parseFloat(value);
      } else {
        return parseFloat(value);
      }
    }
    return 0;
  };
  // Helper to extract numeric value from a string like '5.78 GB' or '2'
  const extractNumber = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const match = value.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };
  // Helper to extract unit (e.g., 'GB') from a string like '5.78 GB'
  const extractUnit = (value) => {
    if (!value) return '';
    const match = value.match(/[a-zA-Z]+/g);
    return match ? match.join(' ') : '';
  };

  // Helper to convert memory/storage to 'Gi' format (no space)
  const toGiFormat = (value) => {
    if (!value) return '1Gi';
    if (typeof value === 'number') return `${value}Gi`;
    if (typeof value === 'string') {
      let num = extractNumber(value);
      let unit = extractUnit(value).toLowerCase();
      if (unit === 'gi') return `${num}Gi`;
      if (unit === 'gb') return `${num}Gi`;
      if (unit === 'mi') return `${(num / 1024).toFixed(2).replace(/\.00$/, '')}Gi`;
      return `${num}Gi`;
    }
    return '1Gi';
  };

  const minCPU = 0.1;
  const cpuStep = 0.1;
  const minMemory = 0.1; // GB
  const memoryStep = 0.1; // GB
  const minStorage = 1; // GB
  const storageStep = 1; // GB

  const currentCPU = extractNumber(formData.resources.cpu);
  const currentMemory = extractNumber(formData.resources.memory);
  const currentStorage = extractNumber(formData.resources.storage);
  const maxCPU = clusterResources?.total?.total_cpu ? extractNumber(clusterResources.total.total_cpu) : 100;
  const maxMemory = clusterResources?.total?.total_memory ? extractNumber(clusterResources.total.total_memory) : 1000;
  const maxStorage = clusterResources?.total?.total_storage ? extractNumber(clusterResources.total.total_storage) : 1000;
  const memoryUnit = clusterResources?.total?.total_memory ? extractUnit(clusterResources.total.total_memory) : 'GB';
  const storageUnit = clusterResources?.total?.total_storage ? extractUnit(clusterResources.total.total_storage) : 'GB';

  // Expose closeSelect to parent via ref
  useImperativeHandle(ref, () => ({
    closeSelect: () => setSelectOpen(false),
  }));

  // Ensure dropdown is closed before unmounting
  useEffect(() => {
    return () => setSelectOpen(false);
  }, []);

  // Restore fetchClusters for loading clusters if not present in stepData
  const fetchClusters = async () => {
    try {
      setLoadingClusters(true);
      const response = await getMethod("clusters");
      setClusters(Array.isArray(response.data) ? response.data : []);
      // Auto-select first cluster if only one exists
      if (Array.isArray(response.data) && response.data.length === 1) {
        setFormData((prev) => ({
          ...prev,
          clusterId: response.data[0].id,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch clusters:", error);
      setError("Failed to load clusters. Please refresh and try again.");
    } finally {
      setLoadingClusters(false);
    }
  };

  useEffect(() => {
    console.log("ProjectCreateStep - useEffect triggered with stepData:", stepData);
    // Prefer clusters array from stepData if available
    if (Array.isArray(stepData.clusters) && stepData.clusters.length > 0) {
      setClusters(stepData.clusters);
      setLoadingClusters(false);
      // Auto-select if only one cluster
      if (stepData.clusters.length === 1) {
        setFormData(prev => ({
          ...prev,
          clusterId: stepData.clusters[0].id || stepData.clusters[0].clusterId
        }));
      }
    } else if (stepData.clusterId && stepData.clusterName) {
      setFormData(prev => ({
        ...prev,
        clusterId: stepData.clusterId
      }));
      setClusters([{
        id: stepData.clusterId,
        name: stepData.clusterName,
        endpoint: stepData.clusterEndpoint
      }]);
      setLoadingClusters(false);
    } else {
      fetchClusters();
    }
  }, [stepData]);

  useEffect(() => {
    if (
      formData.clusterId &&
      clusters.length > 0 &&
      !clusters.some(c => (c.id || c.clusterId) === formData.clusterId)
    ) {
      setFormData(prev => ({ ...prev, clusterId: "" }));
    }
    // Close the dropdown if clusters change
    if (selectOpen) setSelectOpen(false);
  }, [clusters, formData.clusterId]);

  // Fetch cluster resources when clusterId changes
  useEffect(() => {
    const fetchClusterResources = async () => {
      if (!formData.clusterId) {
        setClusterResources(null);
        return;
      }
      try {
        const response = await getMethod(`cluster/resources?clusterId=${formData.clusterId}`);
        setClusterResources(response.data);
      } catch (err) {
        setClusterResources(null);
      }
    };
    fetchClusterResources();
  }, [formData.clusterId]);

  // When cluster resources are loaded, ensure memory/storage are in 'GB' format and default to '1 GB' if not
  useEffect(() => {
    if (!clusterResources?.total) return;
    setFormData(prev => {
      let newResources = { ...prev.resources };
      // If memory is not in GB, set to '1 GB'
      if (!/GB$/.test(newResources.memory)) {
        newResources.memory = '1 GB';
      }
      // If storage is not in GB, set to '1 GB'
      if (!/GB$/.test(newResources.storage)) {
        newResources.storage = '1 GB';
      }
      return { ...prev, resources: newResources };
    });
  }, [clusterResources?.total]);

  const handleInputChange = (field, value) => {
    if (field.startsWith("resources.")) {
      const resourceField = field.replace("resources.", "");
      setFormData((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          [resourceField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleResourceChange = (type, direction) => {
    setFormData((prev) => {
      let value, unit, newValue;
      if (type === 'cpu') {
        value = extractNumber(prev.resources.cpu);
        newValue = direction === 'inc' ? Math.min(value + cpuStep, maxCPU) : Math.max(value - cpuStep, minCPU);
        return { ...prev, resources: { ...prev.resources, cpu: newValue.toFixed(2).replace(/\.00$/, '') } };
      } else if (type === 'memory') {
        value = extractNumber(prev.resources.memory);
        unit = memoryUnit;
        newValue = direction === 'inc' ? Math.min(value + memoryStep, maxMemory) : Math.max(value - memoryStep, minMemory);
        return { ...prev, resources: { ...prev.resources, memory: `${newValue.toFixed(2).replace(/\.00$/, '')} ${unit}` } };
      } else if (type === 'storage') {
        value = extractNumber(prev.resources.storage);
        unit = storageUnit;
        newValue = direction === 'inc' ? Math.min(value + storageStep, maxStorage) : Math.max(value - storageStep, minStorage);
        newValue = Math.round(newValue); // Always integer for storage
        return { ...prev, resources: { ...prev.resources, storage: `${newValue} ${unit}` } };
      }
      return prev;
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }

    if (!formData.clusterId) {
      setError("Please select a target cluster. You need to complete the cluster setup first.");
      return;
    }

    if (!stepData.organizationId) {
      setError("Organization ID is missing. Please complete the organization setup first.");
      return;
    }

    try {
      setLoading(true);

      // Create project payload in required format
      const projectPayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        organizationId: stepData.organizationId,
        clusterId: formData.clusterId,
        resources: formData.resources.enabled
          ? {
              enabled: true,
              cpu: formData.resources.cpu,
              memory: toGiFormat(formData.resources.memory),
              storage: toGiFormat(formData.resources.storage),
            }
          : null,
      };
      
      console.log("ProjectCreateStep - Project creation payload:", projectPayload);
      const response = await postMethod("projects", projectPayload);
      console.log("ProjectCreateStep - Project creation response:", response.data);
      console.log("ProjectCreateStep - Calling onComplete with project data");
      
      // Complete this step and finish onboarding
      onComplete("project", {
        ...formData,
        projectId: response.data.project?.id || response.data.id,
      });
      
      // Redirect and refresh the page after project creation
      window.location.href = "/dashboard";
      
      console.log("ProjectCreateStep - onComplete called successfully");
      
      // Check onboarding status after project creation to confirm completion
      try {
        const onboardingStatus = await onboardingManager.checkOnboardingStatus();
        console.log("ProjectCreateStep - Onboarding status after project creation:", onboardingStatus);
        
        if (!onboardingStatus.needsOnboarding) {
          // All steps completed, show success message and redirect
          console.log("ProjectCreateStep - All onboarding steps completed!");
          
          // Show success toast for project creation
          toast.success("✅ Project created successfully! Completing your setup...", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // The redirect will be handled by the OnboardingFlow handleComplete
        } else {
          console.log("ProjectCreateStep - Onboarding still incomplete:", onboardingStatus);
        }
      } catch (error) {
        console.error("ProjectCreateStep - Failed to check onboarding status:", error);
      }
    } catch (error) {
      console.error("Failed to create project:", error);

      // Handle specific error cases
      let errorMessage = "Failed to create project. Please try again.";

      if (error.response?.data) {
        const responseData = error.response.data;
        const errorText =
          responseData.message ||
          responseData.error ||
          responseData.detail ||
          "";

        if (errorText) {
          const lowerErrorText = errorText.toLowerCase();
          if (
            (lowerErrorText.includes("project") &&
              lowerErrorText.includes("already exists")) ||
            lowerErrorText.includes("duplicate") ||
            lowerErrorText.includes("conflict")
          ) {
            errorMessage = `Project name "${formData.name}" is already taken. Please choose a different name.`;
          } else {
            errorMessage = errorText;
          }
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border border-gray-200 rounded-lg shadow-sm bg-white">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-xl mb-4">
              <FolderPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Create Project
            </h2>
            <p className="text-gray-600">
              Set up your first project to organize your applications
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label
                  htmlFor="projectName"
                  className="text-sm font-medium text-gray-700"
                >
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="projectName"
                type="text"
                placeholder="my-web-app"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-11 text-sm border-gray-300 focus:border-gray-400 focus:ring-0"
                disabled={loading || isLoading}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label
                  htmlFor="projectDescription"
                  className="text-sm font-medium text-gray-700"
                >
                  Description<span className="text-gray-400">(Optional)</span>
                </Label>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                id="projectDescription"
                placeholder="Brief description of your project"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:border-gray-400"
                disabled={loading || isLoading}
              />
            </div>

            {/* Target Cluster */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label
                  htmlFor="targetCluster"
                  className="text-sm font-medium text-gray-700"
                >
                  Target Cluster <span className="text-red-500">*</span>
                </Label>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="targetCluster"
                value={formData.clusterId}
                onChange={e => handleInputChange("clusterId", e.target.value)}
                className="h-11 text-sm border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md w-full"
                disabled={loading || isLoading || loadingClusters}
                required
              >
                <option value="" disabled>
                  {loadingClusters ? "Loading clusters..." : "Select a cluster"}
                </option>
                {clusters.length === 0 && !loadingClusters ? (
                  <option value="" disabled>No clusters available</option>
                ) : (
                  clusters.map(cluster => (
                    <option key={cluster.id || cluster.clusterId} value={cluster.id || cluster.clusterId}>
                      {cluster.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Resource Limits Enable Switch */}
            <div className="flex items-center gap-3 mb-2">
              <Switch
                id="enableResourceLimits"
                checked={formData.resources.enabled}
                onCheckedChange={(checked) => handleInputChange("resources.enabled", checked)}
                disabled={loading || isLoading}
              />
              <Label htmlFor="enableResourceLimits" className="text-sm font-medium text-gray-700">
                Enable Resource Limits
              </Label>
            </div>

            {/* Resource Limits Section */}
            {formData.resources.enabled && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Resource Limits
                </Label>
                {clusterResources?.total && (
                  <div className="mb-2 text-xs text-gray-500">
                    Available: CPU: {clusterResources.total.total_cpu}, Memory: {clusterResources.total.total_memory}, Storage: {clusterResources.total.total_storage}
                  </div>
                )}
                <div className="border border-gray-200 rounded-md p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* CPU Limit */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="cpu" className="text-sm font-medium text-gray-700">CPU Limit</Label>
                        <Info className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center mt-1">
                        <button type="button" className="px-2 py-1 border rounded-l bg-gray-100" onClick={() => handleResourceChange('cpu', 'dec')} disabled={currentCPU <= minCPU}>-</button>
                        <div className="px-3 py-1 border-t border-b w-16 text-sm text-center">{formData.resources.cpu}</div>
                        <button type="button" className="px-2 py-1 border rounded-r bg-gray-100" onClick={() => handleResourceChange('cpu', 'inc')} disabled={currentCPU >= maxCPU}>+</button>
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-1">Cores</p>
                    </div>
                    {/* Memory Limit */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="memory" className="text-sm font-medium text-gray-700">Memory Limit</Label>
                        <Info className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center mt-1">
                        <button type="button" className="px-2 py-1 border rounded-l bg-gray-100" onClick={() => handleResourceChange('memory', 'dec')} disabled={currentMemory <= minMemory}>-</button>
                        <div className="py-1 border-t border-b w-16 text-sm text-center">{formData.resources.memory}</div>
                        <button type="button" className="px-2 py-1 border rounded-r bg-gray-100" onClick={() => handleResourceChange('memory', 'inc')} disabled={currentMemory >= maxMemory}>+</button>
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-1">{memoryUnit}</p>
                    </div>
                    {/* Storage Limit */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="storage" className="text-sm font-medium text-gray-700">Storage Limit</Label>
                        <Info className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center mt-1">
                        <button type="button" className="px-2 py-1 border rounded-l bg-gray-100" onClick={() => handleResourceChange('storage', 'dec')} disabled={currentStorage <= minStorage}>-</button>
                        <div className="py-1 border-t border-b w-16 text-sm text-center">{formData.resources.storage}</div>
                        <button type="button" className="px-2 py-1 border rounded-r bg-gray-100" onClick={() => handleResourceChange('storage', 'inc')} disabled={currentStorage >= maxStorage}>+</button>
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-1">{storageUnit}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-namespace info */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Auto-namespace creation
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    A dedicated namespace will be automatically created for this
                    project in the selected cluster. The namespace will be named
                    after your project.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md"
                disabled={
                  loading ||
                  isLoading ||
                  !formData.name.trim() ||
                  !formData.clusterId
                }
              >
                {loading || isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating Project...
                  </div>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

export default ProjectCreateStep;
