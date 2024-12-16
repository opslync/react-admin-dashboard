import React from 'react';
import { Box, Button, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const DashboardPage = () => {
  return (
    <Box sx={{ p: 2, flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom>
        Git Repositories
      </Typography>
      <Divider />
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary">
          + Add Git Repository
        </Button>
      </Box>
      <List sx={{ mt: 2 }}>
        <ListItem>
          <ListItemIcon>
            <GitHubIcon />
          </ListItemIcon>
          <ListItemText
            primary="sample-go-app"
            secondary="https://github.com/devtron-labs/sample-go-app"
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default DashboardPage;
