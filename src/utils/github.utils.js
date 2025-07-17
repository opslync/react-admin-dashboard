import { GITHUB_BASE_URL, API_ENDPOINTS } from '../config/github.config';

function generateRandomName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Opslync-${suffix}`;
}

export const createGitHubManifest = () => ({
  name: generateRandomName(),
  url: GITHUB_BASE_URL,
  hook_attributes: {
    url: API_ENDPOINTS.WEBHOOK,
    active: true
  },
  redirect_url: API_ENDPOINTS.SETUP,
  callback_urls: [GITHUB_BASE_URL],
  public: false,
  request_oauth_on_install: false,
  setup_url: `${GITHUB_BASE_URL}/github-source`,
  setup_on_update: true,
  default_permissions: {
    contents: "read",
    metadata: "read",
    emails: "read",
    administration: "read",
    pull_requests: "write"
  },
  default_events: ["pull_request", "push"]
}); 