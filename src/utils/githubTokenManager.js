import { getMethod } from '../library/api';

class GitHubTokenManager {
  constructor() {
    this.refreshInterval = null;
    this.isRefreshing = false;
    this.REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.apps = new Map(); // Store app details for token refresh
    this.isInitialized = false;
    this.initializationPromise = null;
    this.eventListeners = new Map(); // For event handling
  }

  // Event system for token updates
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Initialize the token manager with immediate token fetch
  async initialize() {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  async _doInitialize() {
    console.log('🚀 Initializing GitHub Token Manager...');
    
    try {
      // Get all GitHub apps for the user
      await this.loadGitHubApps();
      
      // If we have apps, immediately fetch a token and start auto-refresh
      if (this.hasInstalledApps()) {
        console.log(`✅ Found ${this.apps.size} GitHub app(s) with installations`);
        
        // Immediately fetch token for the first app
        const firstApp = Array.from(this.apps.values())[0];
        const token = await this.refreshTokenForApp(firstApp.app_id);
        
        if (token) {
          console.log('🎉 GitHub token fetched immediately on initialization');
          this.emit('tokenReady', { token, immediate: true });
        }
        
        // Start the auto-refresh cycle
        this.startAutoRefresh();
      } else {
        console.log('ℹ️  No GitHub apps with installations found');
        // Clear any stale token
        localStorage.removeItem('github_token');
        this.emit('noApps', {});
      }
      
      this.isInitialized = true;
      this.emit('initialized', { hasApps: this.hasInstalledApps(), appsCount: this.apps.size });
      
      return {
        success: true,
        hasApps: this.hasInstalledApps(),
        appsCount: this.apps.size,
        tokenAvailable: !!localStorage.getItem('github_token')
      };
    } catch (error) {
      console.error('❌ GitHub Token Manager initialization failed:', error);
      this.emit('initializationFailed', { error });
      throw error;
    }
  }

  // Load all GitHub apps for the current user
  async loadGitHubApps() {
    try {
      const response = await getMethod('user/github/apps');
      if (response.data && response.data.success && response.data.data) {
        const apps = response.data.data;
        
        // Clear existing apps
        this.apps.clear();
        
        // Store apps with installation_id
        apps.forEach(app => {
          if (app.installation_id) {
            this.apps.set(app.app_id, {
              app_id: app.app_id,
              installation_id: app.installation_id,
              name: app.name
            });
          }
        });
        
        console.log(`📦 Loaded ${this.apps.size} GitHub apps with installations`);
      } else {
        console.log('📭 No GitHub apps data received from API');
        this.apps.clear();
      }
    } catch (error) {
      console.error('Error loading GitHub apps:', error);
      this.apps.clear();
      throw error;
    }
  }

  // Check if there are any installed apps
  hasInstalledApps() {
    return this.apps.size > 0;
  }

  // Start the auto-refresh mechanism
  startAutoRefresh() {
    if (this.refreshInterval) {
      console.log('Auto-refresh already running');
      return;
    }

    console.log(`🔄 Starting GitHub token auto-refresh every ${this.REFRESH_INTERVAL / 60000} minutes`);
    
    // Set up interval (don't do initial refresh here since we already did it in initialize)
    this.refreshInterval = setInterval(() => {
      console.log('⏰ GitHub token refresh interval triggered');
      this.refreshAllTokens();
    }, this.REFRESH_INTERVAL);
  }

  // Stop the auto-refresh mechanism
  stopAutoRefresh() {
    if (this.refreshInterval) {
      console.log('⏹️  Stopping GitHub token auto-refresh');
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Refresh tokens for all installed apps
  async refreshAllTokens() {
    if (this.isRefreshing) {
      console.log('Token refresh already in progress, skipping...');
      return;
    }

    if (!this.hasInstalledApps()) {
      console.log('No GitHub apps with installations found');
      return;
    }

    this.isRefreshing = true;
    console.log(`🔄 Refreshing tokens for ${this.apps.size} GitHub apps...`);

    try {
      const refreshPromises = Array.from(this.apps.values()).map(app => 
        this.refreshTokenForApp(app.app_id)
      );

      const results = await Promise.allSettled(refreshPromises);
      const successfulRefresh = results.some(result => result.status === 'fulfilled' && result.value);
      
      if (successfulRefresh) {
        this.emit('tokenRefreshed', { 
          timestamp: new Date(),
          appsCount: this.apps.size 
        });
      }
      
      console.log('✅ GitHub token refresh cycle completed');
    } catch (error) {
      console.error('Error during token refresh cycle:', error);
      this.emit('refreshError', { error });
    } finally {
      this.isRefreshing = false;
    }
  }

  // Refresh token for a specific app
  async refreshTokenForApp(appId) {
    try {
      console.log(`🔄 Refreshing token for GitHub app: ${appId}`);
      
      const response = await getMethod(`user/github/token?app_id=${appId}`);
      
      if (response.data && response.data.token) {
        localStorage.setItem('github_token', response.data.token);
        console.log(`✅ GitHub token refreshed successfully for app: ${appId}`);
        return response.data.token;
      } else {
        console.error(`❌ No token received for app: ${appId}`, response);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error refreshing token for app ${appId}:`, error);
      
      // Handle 400 errors gracefully (app might not be configured)
      if (error.response && error.response.status === 400) {
        console.log(`⚠️  GitHub app ${appId} not properly configured (400 error)`);
      }
      return null;
    }
  }

  // Add a new app to the manager
  addApp(appData) {
    if (appData.installation_id) {
      this.apps.set(appData.app_id, {
        app_id: appData.app_id,
        installation_id: appData.installation_id,
        name: appData.name
      });
      
      console.log(`➕ Added GitHub app to token manager: ${appData.name}`);
      
      // Start auto-refresh if this is the first app
      if (this.apps.size === 1 && !this.refreshInterval) {
        this.startAutoRefresh();
      }
      
      this.emit('appAdded', { app: appData });
    }
  }

  // Remove an app from the manager
  removeApp(appId) {
    const removed = this.apps.delete(appId);
    if (removed) {
      console.log(`➖ Removed GitHub app from token manager: ${appId}`);
      
      // Stop auto-refresh if no apps left
      if (this.apps.size === 0) {
        this.stopAutoRefresh();
        localStorage.removeItem('github_token');
      }
      
      this.emit('appRemoved', { appId });
    }
  }

  // Get current token from localStorage
  getCurrentToken() {
    return localStorage.getItem('github_token');
  }

  // Wait for token to be available (with timeout)
  async waitForToken(timeoutMs = 5000) {
    const existingToken = this.getCurrentToken();
    if (existingToken) {
      return existingToken;
    }

    // If no token exists, wait for it to be fetched
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeEventListener('tokenReady', onTokenReady);
        this.removeEventListener('noApps', onNoApps);
        reject(new Error('Timeout waiting for GitHub token'));
      }, timeoutMs);

      const onTokenReady = ({ token }) => {
        clearTimeout(timeout);
        this.removeEventListener('tokenReady', onTokenReady);
        this.removeEventListener('noApps', onNoApps);
        resolve(token);
      };

      const onNoApps = () => {
        clearTimeout(timeout);
        this.removeEventListener('tokenReady', onTokenReady);
        this.removeEventListener('noApps', onNoApps);
        resolve(null); // No apps means no token needed
      };

      this.addEventListener('tokenReady', onTokenReady);
      this.addEventListener('noApps', onNoApps);
    });
  }

  // Manual token refresh (for immediate needs)
  async forceRefresh() {
    console.log('💪 Forcing GitHub token refresh...');
    
    if (!this.hasInstalledApps()) {
      console.log('Cannot force refresh: No GitHub apps with installations');
      return { success: false, message: 'No GitHub apps configured' };
    }
    
    await this.refreshAllTokens();
    return { 
      success: true, 
      message: 'Token refresh completed',
      token: this.getCurrentToken()
    };
  }

  // Cleanup method
  destroy() {
    this.stopAutoRefresh();
    this.apps.clear();
    this.eventListeners.clear();
    this.isInitialized = false;
    this.initializationPromise = null;
    console.log('🧹 GitHub Token Manager destroyed');
  }
}

// Create a singleton instance
const githubTokenManager = new GitHubTokenManager();

export default githubTokenManager; 