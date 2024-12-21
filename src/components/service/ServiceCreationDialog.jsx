import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ServiceCreationForm } from './ServiceCreationForm';

export const ServiceCreationDialog = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] bg-[#FFFFFF]" // Add the background color here
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a service</DialogTitle>
          <DialogDescription className="text-base">
            Define the general settings of your service. You can review additional settings afterwards before your service is deployed.
          </DialogDescription>
        </DialogHeader>
        <ServiceCreationForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};