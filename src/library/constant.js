// Load environment variables from .env file
// import dotenv from 'dotenv';
// dotenv.config();

// Export base URL from environment variable, defaulting to a system environment variable or hardcoded value if not set
export const baseUrl = process.env.REACT_APP_BASE_URL || process.env.BASE_URL || "http://localhost:8080/api/";

export const WsbaseUrl = process.env.REACT_APP_WS_BASE_URL || "ws://localhost:8080/api/";

export const loginUrl = "signin";
export const RegisterUrl = "signup"
export const githubuser = "githubuser"
export const projectCreate = "project/create"
export const appCreate = "app/create"
export const listProject = "projects"
export const listApps = "apps"
export const containerRegistry = 'container/account'; 