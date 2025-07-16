import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Badge,
} from '@mui/material';
import { Check, X } from 'lucide-react';

export const ClusterGrid = ({ nodes }) => {
  if (!nodes || nodes.length === 0) return null;

  return (
    <TableContainer component={Paper} sx={{ mt: 4, boxShadow: 'sm' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Node Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Version</TableCell>
            <TableCell>CPU</TableCell>
            <TableCell>Memory</TableCell>
            <TableCell>Storage</TableCell>
            <TableCell>Internal IP</TableCell>
            <TableCell>External IP</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nodes.map((node) => (
            <TableRow key={node.name}>
              <TableCell className="font-medium">{node.name}</TableCell>
              <TableCell>
                {node.ready ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span>Ready</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <X className="h-4 w-4" />
                    <span>Not Ready</span>
                  </div>
                )}
              </TableCell>
              <TableCell>{node.version}</TableCell>
              <TableCell>{node.cpu} cores</TableCell>
              <TableCell>{node.memory}</TableCell>
              <TableCell>{node.storage}</TableCell>
              <TableCell>{node.internal_ip}</TableCell>
              <TableCell>{node.external_ip || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 