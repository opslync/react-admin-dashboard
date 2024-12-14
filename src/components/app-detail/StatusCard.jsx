import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

export const StatusCard = ({ chartData }) => (
    <Card>
        <CardContent>
            <Typography variant="h6" gutterBottom>Application Status</Typography>
            <Grid container spacing={2}>
                {chartData.map((data, index) => (
                    <Grid item key={index}>
                        <Typography variant="body2" color="textSecondary">
                            {data.name}: {data.value}
                        </Typography>
                    </Grid>
                ))}
            </Grid>
        </CardContent>
    </Card>
);