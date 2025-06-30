import { getMethod } from '../library/api';

class OnboardingManager {
  constructor() {
    this.onboardingStatus = null;
    this.listeners = new Set();
  }

  // Add listener for onboarding status changes
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of status change
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.onboardingStatus));
  }

  // Check if user needs onboarding
  async checkOnboardingStatus() {
    try {
      const response = await getMethod('onboarding/status');
      const status = response.data;
      
      this.onboardingStatus = {
        needsOnboarding: !status.completed,
        currentStep: status.current_step || 0,
        completedSteps: status.completed_steps || [],
        data: status.data || {},
        lastUpdated: Date.now(),
        isNewUser: status.is_new_user || false
      };
      
      this.notifyListeners();
      return this.onboardingStatus;
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
      // If API fails, don't assume onboarding is needed
      this.onboardingStatus = {
        needsOnboarding: false,
        currentStep: 0,
        completedSteps: [],
        data: {},
        lastUpdated: Date.now(),
        isNewUser: false
      };
      this.notifyListeners();
      return this.onboardingStatus;
    }
  }

  // Check if onboarding should be shown (only for new users during registration)
  shouldShowOnboarding() {
    return this.onboardingStatus?.needsOnboarding === true && this.onboardingStatus?.isNewUser === true;
  }

  // Get current onboarding status
  getStatus() {
    return this.onboardingStatus;
  }

  // Mark onboarding as completed
  markCompleted() {
    if (this.onboardingStatus) {
      this.onboardingStatus.needsOnboarding = false;
      this.onboardingStatus.currentStep = 5; // All steps completed
      this.onboardingStatus.isNewUser = false;
      this.notifyListeners();
    }
  }

  // Mark user as new user (for registration flow)
  markAsNewUser() {
    if (this.onboardingStatus) {
      this.onboardingStatus.isNewUser = true;
      this.onboardingStatus.needsOnboarding = true;
      this.notifyListeners();
    }
  }

  // Reset onboarding status (for testing/admin purposes)
  reset() {
    this.onboardingStatus = null;
  }

  // This method is now replaced by the one above

  // Get onboarding progress percentage
  getProgress() {
    if (!this.onboardingStatus) return 0;
    const totalSteps = 5;
    return (this.onboardingStatus.completedSteps.length / totalSteps) * 100;
  }
}

// Create singleton instance
const onboardingManager = new OnboardingManager();

export default onboardingManager; 