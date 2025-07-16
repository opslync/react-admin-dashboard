import React from 'react';
import { TextField, Select, MenuItem } from '@mui/material';

export const AppFilters = ({ filters, onFilterChange, loading }) => (
  <div className="flex gap-4 mb-6">
    <TextField
      placeholder="Search apps..."
      variant="outlined"
      size="small"
      className="flex-grow bg-white"
      value={filters.search}
      onChange={(e) => onFilterChange('search', e.target.value)}
      disabled={loading}
    />
    <Select
      value={filters.status}
      onChange={(e) => onFilterChange('status', e.target.value)}
      size="small"
      className="min-w-[200px] bg-white"
      displayEmpty
      disabled={loading}
    >
      <MenuItem value="all">Status</MenuItem>
      <MenuItem value="running">Running</MenuItem>
      <MenuItem value="stopped">Stopped</MenuItem>
    </Select>
    <Select
      value={filters.project}
      onChange={(e) => onFilterChange('project', e.target.value)}
      size="small"
      className="min-w-[200px] bg-white"
      displayEmpty
      disabled={loading}
    >
      <MenuItem value="all">Project</MenuItem>
      <MenuItem value="development">Development</MenuItem>
      <MenuItem value="staging">Staging</MenuItem>
    </Select>
  </div>
);
