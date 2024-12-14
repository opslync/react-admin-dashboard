import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export const CommitCard = ({ deployment }) => (
    <Card>
        <CardContent>
            <Typography variant="h6" gutterBottom>Deployed Commit</Typography>
            <Typography variant="body2" color="textSecondary">
                {deployment?.tag || 'No commit found'}
            </Typography>
        </CardContent>
    </Card>
);