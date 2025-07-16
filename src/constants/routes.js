export const APP_ROUTES = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    CHANGE_PASSWORD: '/change-password'
  },
  APP: {
    DASHBOARD: '/dashboard',
    OVERVIEW: '/overview',
    PROJECTS: '/project',
    APPS: '/apps',
    CLUSTER: '/cluster',
    APP_DETAIL: '/app/:appId'
  },
  SETTINGS: {
    ROOT: '/settings',
    GIT_ACCOUNT: '/settings/git-account',
    CONTAINER_REGISTRY: '/settings/container-oci-registry'
  }
};

export const APP_TABS = [
  { label: 'App Details', path: 'details' },
  { label: 'Build & Deploy', path: 'build-deploy' },
  { label: 'Build History', path: 'build-history' },
  { label: 'Deployment History', path: 'deployment-history' },
  { label: 'Metrics', path: 'metrics' },
  { label: 'App Configuration', path: 'app-configuration' }
]; 