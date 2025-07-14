import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Server, CheckCircle, Info } from "lucide-react";
import { postMethod } from "../../../library/api";

const ClusterSetupStep = ({
  onComplete,
  stepData,
  isLoading,
  error,
  setError,
}) => {
  // Debug log to verify organization ID is being passed
  console.log("ClusterSetupStep - Received stepData:", stepData);
  console.log("ClusterSetupStep - Organization ID:", stepData.organizationId);
  const [formData, setFormData] = useState({
    name: stepData.name || "",
    endpoint: stepData.endpoint || "",
    authMethod: stepData.authMethod || "kubeconfig",
    bearerToken: stepData.bearerToken || "",
    kubeconfig: stepData.kubeconfig || null,
  });
  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError("");
    setValidationStatus(null);
  };

  const handleKubeconfigUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const base64Content = btoa(event.target.result);
          setFormData((prev) => ({ ...prev, kubeconfig: base64Content }));
        } catch (error) {
          console.error("Error encoding kubeconfig to base64:", error);
          setError("Failed to process kubeconfig file. Please try again.");
        }
      };
      reader.onerror = () => {
        setError("Failed to read kubeconfig file. Please try again.");
      };
      reader.readAsText(file);
    }
    setValidationStatus(null);
    if (error) setError("");
  };

  const handleValidateConnection = async () => {
    if (!formData.endpoint.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.authMethod === "bearer" && !formData.bearerToken.trim()) {
      setError("Please provide a bearer token");
      return;
    }
    if (formData.authMethod === "kubeconfig" && !formData.kubeconfig) {
      setError("Please upload a kubeconfig file");
      return;
    }
    if (!stepData.organizationId) {
      setError("Organization ID is missing. Please complete the organization setup first.");
      return;
    }
    try {
      setValidationStatus("validating");
      setError("");
      let payload = {
        name: formData.name.trim(),
        endpoint: formData.endpoint.trim(),
        auth_method: formData.authMethod,
        organization_id: stepData.organizationId,
      };
      if (formData.authMethod === "bearer") {
        payload.bearer_token = formData.bearerToken.trim();
      } else if (formData.authMethod === "kubeconfig") {
        payload.kubeconfig = formData.kubeconfig;
      }
      console.log("ClusterSetupStep - Validation payload:", payload);
      const response = await postMethod("clusters/validate", payload);
      if (response.data?.success) {
        setValidationStatus("success");
      } else {
        throw new Error(
          response.data?.message || "Connection validation failed"
        );
      }
    } catch (error) {
      console.error("Cluster validation failed:", error);
      setValidationStatus("error");
      setError(
        error.response?.data?.message || "Failed to validate cluster connection"
      );
    }
  };

  const handleAddCluster = async () => {
    if (validationStatus !== "success") {
      setError("Please validate the connection first");
      return;
    }
    if (!stepData.organizationId) {
      setError("Organization ID is missing. Please complete the organization setup first.");
      return;
    }
    try {
      setLoading(true);
      let payload = {
        name: formData.name.trim(),
        endpoint: formData.endpoint.trim(),
        auth_method: formData.authMethod,
        organization_id: stepData.organizationId,
      };
      if (formData.authMethod === "bearer") {
        payload.bearer_token = formData.bearerToken.trim();
      } else if (formData.authMethod === "kubeconfig") {
        payload.kubeconfig = formData.kubeconfig;
      }
      console.log("ClusterSetupStep - Add cluster payload:", payload);
      const response = await postMethod("clusters", payload);
      console.log("ClusterSetupStep - Cluster creation response:", response.data);
      console.log("ClusterSetupStep - Cluster ID:", response.data.cluster.id);
      
      onComplete("cluster", {
        ...formData,
        clusterId: response.data.cluster.id,
        clusterName: response.data.cluster.name,
        clusterEndpoint: response.data.cluster.endpoint,
      });
    } catch (error) {
      console.error("Failed to add cluster:", error);
      setError(error.response?.data?.message || "Failed to add cluster");
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
              <Server className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Add Kubernetes Cluster
            </h2>
            <p className="text-gray-600">
              Connect your cluster to deploy applications
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Cluster Name */}
            <div className="space-y-2">
              <Label
                htmlFor="clusterName"
                className="text-sm font-medium text-gray-700"
              >
                Cluster Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clusterName"
                type="text"
                placeholder="production-cluster"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-11 text-sm border-gray-300 focus:border-gray-400 focus:ring-0"
                disabled={loading || isLoading}
                required
              />
            </div>

            {/* API Endpoint */}
            <div className="space-y-2">
              <Label
                htmlFor="endpoint"
                className="text-sm font-medium text-gray-700"
              >
                API Endpoint <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endpoint"
                type="url"
                placeholder="https://your-cluster-api.example.com"
                value={formData.endpoint}
                onChange={(e) => handleInputChange("endpoint", e.target.value)}
                className="h-11 text-sm border-gray-300 focus:border-gray-400 focus:ring-0"
                disabled={loading || isLoading}
                required
              />
            </div>

            {/* Authentication Method */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Authentication Method
              </Label>
              <RadioGroup
                value={formData.authMethod}
                onValueChange={(value) =>
                  handleInputChange("authMethod", value)
                }
                className="flex gap-4"
              >
                <label
                  htmlFor="kubeconfig"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-colors ${formData.authMethod === "kubeconfig" ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:border-gray-400"}`}
                >
                  <RadioGroupItem value="kubeconfig" id="kubeconfig" />
                  <span className="text-sm">Kubeconfig Upload</span>
                </label>
                <label
                  htmlFor="bearer"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-colors ${formData.authMethod === "bearer" ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:border-gray-400"}`}
                >
                  <RadioGroupItem value="bearer" id="bearer" />
                  <span className="text-sm">Bearer Token</span>
                </label>
              </RadioGroup>
            </div>

            {/* Kubeconfig Upload */}
            {formData.authMethod === "kubeconfig" && (
              <div className="space-y-2">
                <Label
                  htmlFor="kubeconfigUpload"
                  className="text-sm font-medium text-gray-700"
                >
                  Kubeconfig File <span className="text-red-500">*</span>
                </Label>
                <input
                  id="kubeconfigUpload"
                  type="file"
                  accept=".yaml,.yml,.txt,application/yaml,application/x-yaml,text/yaml,text/x-yaml"
                  onChange={handleKubeconfigUpload}
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  disabled={loading || isLoading}
                />
                {formData.kubeconfig && (
                  <div className="text-green-700 text-sm mt-1">
                    Kubeconfig file loaded.
                  </div>
                )}
              </div>
            )}

            {/* Bearer Token */}
            {formData.authMethod === "bearer" && (
              <div className="space-y-2">
                <Label
                  htmlFor="bearerToken"
                  className="text-sm font-medium text-gray-700"
                >
                  Bearer Token <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="bearerToken"
                  placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6IlNJbIstmpZCI6Il..."
                  value={formData.bearerToken}
                  onChange={(e) =>
                    handleInputChange("bearerToken", e.target.value)
                  }
                  className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:border-gray-400 font-mono"
                  disabled={loading || isLoading}
                  required
                />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Success Display */}
            {validationStatus === "success" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-700 text-sm">
                  Connection validated successfully!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleValidateConnection}
                disabled={
                  loading ||
                  isLoading ||
                  validationStatus === "validating" ||
                  !formData.endpoint.trim() ||
                  (formData.authMethod === "bearer"
                    ? !formData.bearerToken.trim()
                    : formData.authMethod === "kubeconfig"
                      ? !formData.kubeconfig
                      : false)
                }
                className="flex-1 h-11 text-sm border-gray-300 hover:border-gray-400"
              >
                {validationStatus === "validating" ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2" />
                    Validating...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validate Connection
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleAddCluster}
                disabled={
                  loading || isLoading || validationStatus !== "success"
                }
                className="flex-1 h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md"
              >
                {loading || isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Adding Cluster...
                  </div>
                ) : (
                  "Add Cluster"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClusterSetupStep;
