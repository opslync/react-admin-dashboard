import { GitBranch, Package, Upload } from 'lucide-react';

export const initialSteps = [
  {
    id: 'source',
    type: 'source',
    title: 'Source',
    description: 'Git repository configuration',
    icon: 'git',
    config: {
      repository: 'https://github.com/user/repo',
      branch: 'main',
      credentials: '********'
    }
  },
  {
    id: 'build',
    type: 'build',
    title: 'Build',
    description: 'Build configuration and settings',
    icon: 'build',
    config: {
      dockerfile: 'Dockerfile',
      buildArgs: ['NODE_ENV=production'],
      cache: true
    }
  },
  {
    id: 'deploy',
    type: 'deploy',
    title: 'Deploy',
    description: 'Deployment configuration',
    icon: 'deploy',
    config: {
      environment: 'production',
      replicas: 3,
      resources: {
        cpu: '1',
        memory: '2Gi'
      }
    }
  }
];

export const initialConnections = [
  {
    from: 'source',
    to: 'build'
  },
  {
    from: 'build',
    to: 'deploy'
  }
]; 