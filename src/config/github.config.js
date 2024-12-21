export const APP_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://8bd3-122-161-242-25.ngrok-free.app';

export const GITHUB_APP_CREATION_URL = 'https://github.com/settings/apps/new';

export const GITHUB_STATE_PARAM = 'setup_action';

export const API_ENDPOINTS = {
  WEBHOOK: `${API_BASE_URL}/api/user/github/ws`,
  SETUP: `${APP_BASE_URL}/github-callback`,
}; 