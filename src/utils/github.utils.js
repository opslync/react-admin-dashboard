import { APP_BASE_URL, API_ENDPOINTS } from '../config/github.config';

export const createGitHubManifest = () => ({
  name: "amitoo73",
  url: APP_BASE_URL,
  hook_attributes: {
    url: API_ENDPOINTS.WEBHOOK,
    active: true
  },
  redirect_url: API_ENDPOINTS.SETUP,
  callback_urls: [APP_BASE_URL],
  public: false,
  request_oauth_on_install: false,
  setup_url: `${APP_BASE_URL}/github-source`,
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