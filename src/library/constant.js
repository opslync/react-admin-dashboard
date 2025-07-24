// Load environment variables from .env file
// import dotenv from 'dotenv';
// dotenv.config();

// Export base URL from environment variable, defaulting to a system environment variable or hardcoded value if not set
export const baseUrl = process.env.REACT_APP_BASE_URL || process.env.BASE_URL || "http://localhost:8080/api/";
export const API_BASE_URL = process.env.REACT_APP_BASE_URL || process.env.BASE_URL || "http://localhost:8080";
export const GITHUB_BASE_URL = process.env.REACT_APP_GITHUB_BASE_URL || "http://localhost:3000";

export const wsbaseUrl = process.env.REACT_APP_WS_BASE_URL || "ws://localhost:8080/api/";

export const loginUrl = process.env.REACT_APP_LOGIN_URL || process.env.LOGIN_URL || "http://localhost:8080/api/users/signin"; 
export const RegisterUrl = "users/signup"
export const githubuser = "githubuser"
export const projectCreate = "projects/create"
export const appCreate = "app/create"
export const listProject = "projects"
export const listApps = "apps"
export const containerRegistry = 'container/account'; 