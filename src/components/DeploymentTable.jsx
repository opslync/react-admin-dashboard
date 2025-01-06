import React from 'react';
import moment from 'moment';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from '@mui/material';

export const DeploymentTable = ({
  deployments,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>App Name</TableCell>
          <TableCell>CommitId</TableCell>
          <TableCell>When</TableCell>
          <TableCell>User</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {deployments
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((deployment) => (
            <TableRow key={deployment.ID}>
              <TableCell>{deployment.appName}</TableCell>
              <TableCell>{deployment.tag}</TableCell>
              <TableCell>
                {moment(deployment.CreatedAt).format('MMMM Do YYYY, h:mm:ss a')}
              </TableCell>
              <TableCell>{deployment.username}</TableCell>
              <TableCell>{deployment.status}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
    <TablePagination
      rowsPerPageOptions={[8, 16, 24]}
      component="div"
      count={deployments.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  </TableContainer>
);