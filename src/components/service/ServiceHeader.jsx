import React from 'react';
import { Button } from "../ui/button";
import { PlusIcon } from '@radix-ui/react-icons';

export const ServiceHeader = ({ onCreateService }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Services</h1>
        <p className="text-muted-foreground">Manage your microservices and applications</p>
      </div>
      <Button onClick={onCreateService}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Create Service
      </Button>
    </div>
  );
};