import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getMethod } from '../../library/api';

const PodEventsModal = ({ open, onClose, appId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [eventsData, setEventsData] = useState(null);

  useEffect(() => {
    if (!open || !appId) return;
    setLoading(true);
    setError('');
    getMethod(`app/${appId}/pod/events`)
      .then(res => {
        setEventsData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch pod events');
        setLoading(false);
      });
  }, [open, appId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Pod Events
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <CircularProgress />
          </div>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && eventsData && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              App: <b>{eventsData.app_name}</b> | Project: <b>{eventsData.namespace}</b> | Total Events: <b>{eventsData.total_events}</b>
            </Typography>
            {eventsData.pods && eventsData.pods.map((pod, idx) => (
              <Paper key={pod.name} sx={{ mb: 3, p: 2 }}>
                <Typography variant="h6">Pod: {pod.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Status: <b>{pod.status}</b> | Uptime: <b>{pod.uptime}</b> | Restarts: <b>{pod.restart_count}</b>
                </Typography>
                {pod.issues && pod.issues.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
                    {pod.issues.map((issue, i) => <div key={i}>{issue}</div>)}
                  </Alert>
                )}
                {/* Events Table */}
                {pod.events && pod.events.length > 0 ? (
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Message</TableCell>
                          <TableCell>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pod.events.map((event, i) => (
                          <TableRow key={i}>
                            <TableCell>{event.type}</TableCell>
                            <TableCell>{event.reason}</TableCell>
                            <TableCell>{event.message}</TableCell>
                            <TableCell>{event.lastTimestamp || event.eventTime || ''}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    No events found for this pod.
                  </Typography>
                )}
              </Paper>
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PodEventsModal; 