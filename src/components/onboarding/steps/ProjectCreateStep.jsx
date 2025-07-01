import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { FolderPlus, Info, Settings } from "lucide-react";
import { getMethod, postMethod } from "../../../library/api";

const ProjectCreateStep = ({
  onComplete,
  stepData,
  isLoading,
  error,
  setError,
}) => {
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

  useEffect(() => {
    // fetchClusters();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }

    if (!formData.clusterId) {
      setError("Please select a target cluster");
      return;
    }

    try {
      setLoading(true);

      // Create project
      const response = await postMethod("projects", {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        cluster_id: formData.clusterId,
        resources: formData.resources.enabled
          ? {
              cpu: formData.resources.cpu,
              memory: formData.resources.memory,
              storage: formData.resources.storage,
            }
          : null,
      });

      // Complete this step and finish onboarding
      onComplete("project", {
        ...formData,
        projectId: response.data.id,
      });
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
              <Select
                value={formData.clusterId}
                onValueChange={(value) => handleInputChange("clusterId", value)}
                disabled={loading || isLoading || loadingClusters}
              >
                <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-gray-400 focus:ring-0">
                  <SelectValue placeholder="Select a cluster" />
                </SelectTrigger>
                <SelectContent>
                  {loadingClusters ? (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      Loading clusters...
                    </div>
                  ) : clusters.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      No clusters available
                    </div>
                  ) : (
                    Array.isArray(clusters) &&
                    clusters.map((cluster) => (
                      <SelectItem key={cluster.id} value={cluster.id}>
                        {cluster.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Resource Limits Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Resource Limits
              </Label>

              <div className="border border-gray-200 rounded-md p-4 space-y-4">
                {/* CPU Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label
                        htmlFor="cpu"
                        className="text-sm font-medium text-gray-700"
                      >
                        CPU Limit
                      </Label>
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="cpu"
                      value={formData.resources.cpu}
                      onChange={(e) =>
                        handleInputChange("resources.cpu", e.target.value)
                      }
                      placeholder="1"
                      className="h-11 text-sm border-gray-300 focus:border-gray-400 focus:ring-0"
                    />
                  </div>

                  {/* Memory Limit */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label
                        htmlFor="memory"
                        className="text-sm font-medium text-gray-700"
                      >
                        Memory Limit
                      </Label>
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="memory"
                      value={formData.resources.memory}
                      onChange={(e) =>
                        handleInputChange("resources.memory", e.target.value)
                      }
                      placeholder="512Mi"
                      className="h-11 text-sm border-gray-300 focus:border-gray-400 focus:ring-0"
                    />
                  </div>
                </div>

                {/* Storage Limit */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label
                      htmlFor="storage"
                      className="text-sm font-medium text-gray-700"
                    >
                      Storage Limit
                    </Label>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="storage"
                    value={formData.resources.storage}
                    onChange={(e) =>
                      handleInputChange("resources.storage", e.target.value)
                    }
                    placeholder="1Gi"
                    className="h-11 text-sm border-gray-300 focus:border-gray-400 focus:ring-0"
                  />
                </div>
              </div>
            </div>

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
};

export default ProjectCreateStep;
