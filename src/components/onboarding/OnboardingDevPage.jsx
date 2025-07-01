import React, { useState } from "react";
import OnboardingFlow from "./OnboardingFlow";

const OnboardingDevPage = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    // Redirect to login page when closed
    window.location.href = "/";
  };

  const handleComplete = () => {
    console.log("Onboarding completed!");
    setIsOpen(false);
    // Redirect to login page when completed
    window.location.href = "/";
  };

  return (
    <OnboardingFlow
      open={isOpen}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
};

export default OnboardingDevPage;
