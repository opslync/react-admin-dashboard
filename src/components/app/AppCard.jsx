import React from 'react';
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { useHistory } from 'react-router-dom';

export const AppCard = ({ app }) => {
  const history = useHistory();

  const handleManageClick = () => {
    history.push(`/app/${app.id}/details`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{app.name}</h3>
            <p className="text-sm text-muted-foreground">{app.repository}</p>
          </div>
          <Badge variant={app.status === 'running' ? 'success' : 'secondary'}>
            {app.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <GitHubLogoIcon className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">18</span>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleManageClick}
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 