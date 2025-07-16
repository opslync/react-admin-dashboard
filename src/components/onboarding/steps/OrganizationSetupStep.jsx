import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Building2 } from "lucide-react";
import { postMethod } from "../../../library/api";

const OrganizationSetupStep = ({
  onNext,
  onComplete,
  stepData,
  isLoading,
  error,
  setError,
}) => {
  const [formData, setFormData] = useState({
    name: stepData.name || "",
    description: stepData.description || "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Organization name is required");
      return;
    }

    try {
      setLoading(true);

      // Create organization
      const response = await postMethod("organizations", {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      });

      console.log("OrganizationSetupStep - API Response:", response.data);
      console.log("OrganizationSetupStep - Organization ID:", response.data.organization.id);

      // Complete this step and move to next
      onComplete("organization", {
        ...formData,
        organizationId: response.data.organization.id,
      });
    } catch (error) {
      console.error("Failed to create organization:", error);
      setError(
        error.response?.data?.message || "Failed to create organization"
      );
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
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Create Organization
            </h2>
            <p className="text-gray-600">
              Set up your organization to get started with OpsLync
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label
                htmlFor="orgName"
                className="text-sm font-medium text-gray-700"
              >
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="orgName"
                type="text"
                placeholder="Enter organization name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-11 text-sm border-gray-300 focus:border-gray-400 focus:ring-0"
                disabled={loading || isLoading}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="orgDescription"
                className="text-sm font-medium text-gray-700"
              >
                Description <span className="text-gray-400">(Optional)</span>
              </Label>
              <textarea
                id="orgDescription"
                placeholder="Brief description of your organization"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:border-gray-400"
                disabled={loading || isLoading}
              />
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
                disabled={loading || isLoading || !formData.name.trim()}
              >
                {loading || isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating Organization...
                  </div>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSetupStep;
