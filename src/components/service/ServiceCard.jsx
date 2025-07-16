import React from 'react';
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { GitHubLogoIcon } from '@radix-ui/react-icons';

export const ServiceCard = ({ service }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{service.name}</h3>
            <p className="text-sm text-muted-foreground">{service.repository}</p>
          </div>
          <Badge variant={service.status === 'running' ? 'success' : 'secondary'}>
            {service.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <GitHubLogoIcon className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">{service.project}</span>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">View Details</Button>
          <Button variant="outline" size="sm">Manage</Button>
        </div>
      </CardContent>
    </Card>
  );
};