# Use Node.js as base image
FROM node:18.16.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to work directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Run the Next.js app
CMD ["npm", "start"]
