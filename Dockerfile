FROM node:18-alpine
WORKDIR /usr/src/app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY server/src/ ./src/

# Create necessary directories
RUN mkdir -p /var/log/tedecom /var/lib/tedecom

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Run the server directly with Node.js
CMD ["node", "src/index.js"]
