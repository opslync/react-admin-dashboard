# Onboarding System

This directory contains the comprehensive onboarding system for Opslync, designed to guide new users through the initial setup process.

## Components

### Main Components

- **`OnboardingFlow.jsx`** - Main onboarding wizard component with step navigation
- **`onboardingManager.js`** - Singleton manager for onboarding state and API calls

### Step Components

- **`WelcomeStep.jsx`** - Welcome screen with feature overview
- **`GitHubSetupStep.jsx`** - GitHub integration setup
- **`ClusterSetupStep.jsx`** - Kubernetes cluster connection
- **`ProjectCreateStep.jsx`** - First project creation
- **`CompletionStep.jsx`** - Success screen with next steps

## API Integration

The onboarding system integrates with the following backend endpoints:

- `GET /api/onboarding/status` - Get current onboarding status
- `POST /api/onboarding/start` - Start onboarding process
- `POST /api/onboarding/github/setup` - Setup GitHub integration
- `POST /api/onboarding/cluster/setup` - Setup Kubernetes cluster
- `POST /api/onboarding/project/create` - Create first project
- `POST /api/onboarding/complete-step` - Mark step as completed

## Features

### Smart State Management
- Persistent onboarding state across sessions
- Step completion tracking
- Resume from where user left off

### Professional UI/UX
- Modern step-by-step wizard interface
- Progress tracking with visual indicators
- Skip options for each step
- Error handling with retry mechanisms

### Integration Points
- **App.jsx** - Main onboarding trigger after login
- **OverviewPage.jsx** - Welcome banner for new users
- **SettingsPage.jsx** - Manual onboarding trigger

### Responsive Design
- Mobile-friendly interface
- Accessible components
- Clean, modern styling

## Usage

### Triggering Onboarding

1. **Automatic** - Shows automatically for new users after login
2. **Manual** - Can be triggered from Settings page
3. **Banner** - Welcome banner on Overview page for new users

### Customization

Each step component accepts these props:
- `onNext` - Navigate to next step
- `onPrevious` - Navigate to previous step  
- `onComplete` - Complete current step
- `onFinish` - Finish entire onboarding
- `stepData` - Data from previous steps
- `isLoading` - Global loading state
- `error` - Error message
- `setError` - Error setter

### State Flow

1. User logs in → Check onboarding status
2. If needs onboarding → Show OnboardingFlow
3. User completes steps → Update backend state
4. On completion → Mark as completed, redirect to dashboard

## Error Handling

- Network errors with retry options
- Form validation with helpful messages
- Graceful fallbacks for optional steps
- Skip options to prevent blocking

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast design
- Focus management

## Future Enhancements

- Video tutorials integration
- Interactive product tours
- Team onboarding flows
- Custom onboarding paths based on user role 