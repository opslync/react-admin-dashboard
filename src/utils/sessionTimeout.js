// Time values in milliseconds
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export const clearSessionStorage = () => {
  localStorage.removeItem('github_token');
  // Add any other session-related items to clear
  sessionStorage.clear();
};

export const getLastActivityTime = () => {
  return parseInt(localStorage.getItem('lastActivityTime') || Date.now().toString());
};

export const setLastActivityTime = () => {
  localStorage.setItem('lastActivityTime', Date.now().toString());
};

export const checkSessionTimeout = () => {
  const currentTime = Date.now();
  const lastActivityTime = getLastActivityTime();
  
  return currentTime - lastActivityTime >= SESSION_TIMEOUT;
};

export const getTimeUntilTimeout = () => {
  const currentTime = Date.now();
  const lastActivityTime = getLastActivityTime();
  
  return Math.max(0, SESSION_TIMEOUT - (currentTime - lastActivityTime));
}; 