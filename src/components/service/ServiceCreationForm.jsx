import React, { useState } from 'react';
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { GitHubLogoIcon, GitlabLogoIcon } from '@radix-ui/react-icons';

export const ServiceCreationForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    repository: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">Name your service</Label>
        <Input
          id="name"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-gray-800 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="project" className="text-gray-300">Project</Label>
        <Select
          value={formData.project}
          onValueChange={(value) => setFormData({ ...formData, project: value })}
          className="bg-gray-800 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
        >
          <SelectTrigger className="bg-gray-800 text-gray-200">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-gray-200">
            <SelectItem value="dev" className="hover:bg-gray-700">Development</SelectItem>
            <SelectItem value="staging" className="hover:bg-gray-700">Staging</SelectItem>
            <SelectItem value="prod" className="hover:bg-gray-700">Production</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="repository" className="text-gray-300">Repository</Label>
        <Select
          value={formData.repository}
          onValueChange={(value) => setFormData({ ...formData, repository: value })}
          className="bg-gray-800 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
        >
          <SelectTrigger className="bg-gray-800 text-gray-200">
            <SelectValue placeholder="Select repository" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-gray-200">
            <SelectItem value="repo1" className="hover:bg-gray-500">Repository 1</SelectItem>
            <SelectItem value="repo2" className="hover:bg-gray-500">Repository 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-gray-300">Select the git account that you want to connect with your project</Label>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start space-x-2 bg-gray-800 text-gray-200 hover:bg-gray-700"
            onClick={() => window.location.href = '/auth/github'}
          >
            <GitHubLogoIcon className="h-5 w-5" />
            <span>Continue with GitHub</span>
          </Button>
          {/* <Button 
            variant="outline" 
            className="w-full justify-start space-x-2 bg-gray-800 text-blue-500 hover:bg-blue-100"
            onClick={() => window.location.href = '/auth/gitlab'}
          >
            <GitlabLogoIcon className="h-5 w-5" />
            <span>Continue with GitLab</span>
          </Button> */}
          <Button 
            variant="outline" 
            className="w-full justify-start bg-gray-800 text-gray-200 hover:bg-gray-700"
            onClick={() => window.location.href = '/auth/token'}
          >
            Continue with Access token
          </Button>
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose} className="bg-gray-800 text-gray-200 hover:bg-gray-700">
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
          Create
        </Button>
      </div>
    </form>
  );
};