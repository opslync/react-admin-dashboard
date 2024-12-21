import React from 'react';
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const ServiceFilters = ({ onFilterChange }) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search services..."
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>
      <Select onValueChange={(value) => onFilterChange('status', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="running">Running</SelectItem>
          <SelectItem value="stopped">Stopped</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => onFilterChange('project', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          <SelectItem value="dev">Development</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
          <SelectItem value="prod">Production</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};