export const mockBuildHistory = [
  {
    id: 'build-5',
    commitHash: '8f34c9d',
    commitMessage: 'Update deployment configuration for production',
    status: 'running',
    startTime: '2024-03-10 15:30:00',
    duration: '2m 30s',
    branch: 'main'
  },
  {
    id: 'build-4',
    commitHash: '3a1b5e2',
    commitMessage: 'Fix responsive layout issues in dashboard',
    status: 'success',
    startTime: '2024-03-10 14:20:00',
    endTime: '2024-03-10 14:23:00',
    duration: '3m',
    branch: 'main'
  },
  {
    id: 'build-3',
    commitHash: '9c4d2f1',
    commitMessage: 'Add user authentication middleware',
    status: 'failed',
    startTime: '2024-03-09 16:25:00',
    endTime: '2024-03-09 16:28:00',
    duration: '3m',
    branch: 'main'
  }
];

export const mockBuildLogs = [
  {
    id: '1',
    timestamp: '15:30:02',
    message: 'Starting build process...',
    level: 'info'
  },
  {
    id: '2',
    timestamp: '15:30:05',
    message: 'Installing dependencies...',
    level: 'info'
  },
  {
    id: '3',
    timestamp: '15:30:15',
    message: 'npm WARN deprecated core-js@2.6.12',
    level: 'warning'
  },
  {
    id: '4',
    timestamp: '15:30:30',
    message: 'Dependencies installed successfully',
    level: 'info'
  },
  {
    id: '5',
    timestamp: '15:30:35',
    message: 'Running tests...',
    level: 'info'
  }
]; 