import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  SESSION_TIMEOUT,
  WARNING_TIME,
  clearSessionStorage,
  getLastActivityTime,
  setLastActivityTime,
  checkSessionTimeout,
  getTimeUntilTimeout,
} from '../../utils/sessionTimeout';

const SessionTimeout = () => {
  const history = useHistory();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleUserActivity = () => {
    setLastActivityTime();
  };

  const handleStayLoggedIn = () => {
    setLastActivityTime();
    setShowWarning(false);
  };

  const handleLogout = () => {
    clearSessionStorage();
    history.push('/login');
  };

  useEffect(() => {
    // Add event listeners for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    // Check session status every minute
    const checkInterval = setInterval(() => {
      const timeUntilTimeout = getTimeUntilTimeout();
      
      if (checkSessionTimeout()) {
        handleLogout();
      } else if (timeUntilTimeout <= WARNING_TIME) {
        setShowWarning(true);
        setTimeLeft(Math.ceil(timeUntilTimeout / 1000)); // Convert to seconds
      }
    }, 60000); // Check every minute

    // Update countdown timer when warning is shown
    let countdownInterval;
    if (showWarning) {
      countdownInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearInterval(checkInterval);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showWarning]);

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="z-9999 bg-white">
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Your session will expire in {Math.ceil(timeLeft / 60)} minutes.</p>
          <p>Would you like to stay logged in?</p>
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
          <Button onClick={handleStayLoggedIn}>
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeout; 
