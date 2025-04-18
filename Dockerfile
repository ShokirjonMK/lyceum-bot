# Use the official Node.js LTS image as the base
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (if applicable)
# EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
