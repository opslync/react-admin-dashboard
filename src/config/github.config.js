import { API_BASE_URL } from '../library/constant';

export const APP_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

export const GITHUB_APP_CREATION_URL = 'https://github.com/settings/apps/new';

export const GITHUB_STATE_PARAM = 'github_app_creation';

export const API_ENDPOINTS = {
  WEBHOOK: 'https://3dc06cb7b6ab.ngrok-free.app/api/user/github/ws',
  SETUP: `${APP_BASE_URL}/github-callback`,
  GITHUB_SETUP: `${API_BASE_URL}/api/user/github-setup`,
}; 