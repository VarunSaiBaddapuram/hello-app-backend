# Use the official Node.js 18 Alpine image as a base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker's cache for dependencies
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
# Using 'npm ci' for a clean, reproducible install in production
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (matching your PORT env var default)
EXPOSE 4040

# Define the command to start the application
CMD ["npm", "start"]
