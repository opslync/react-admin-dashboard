# base
# Use an official Node.js runtime as the base image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json, package-lock.json and patches to the container
COPY package*.json ./
COPY patches ./patches

# Install dependencies (postinstall applies patch-package patches)
RUN npm ci

# Copy the rest of the application code to the container
COPY . .

# Build the React app
RUN npm run build

# Set the command to run the production build of the React app
CMD ["npm", "start"]