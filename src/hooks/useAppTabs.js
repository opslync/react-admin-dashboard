import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { APP_TABS } from '../constants/routes';

export const useAppTabs = (appId) => {
  const [tabValue, setTabValue] = useState(0);
  const history = useHistory();
  const location = useLocation();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const paths = APP_TABS.map(tab => `/app/${appId}/${tab.path}`);
    history.push(paths[newValue]);
  };

  useEffect(() => {
    const paths = APP_TABS.map(tab => `/app/${appId}/${tab.path}`);
    const activeTab = paths.indexOf(location.pathname);
    if (activeTab !== -1) {
      setTabValue(activeTab);
    }
  }, [location.pathname, appId]);

  return { tabValue, handleTabChange };
}; 