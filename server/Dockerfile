FROM node:20-slim AS builder

WORKDIR /app

# Install curl for healthcheck and other dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create models directory for Transformers.js caching
RUN mkdir -p /app/models

# Set environment variables for Transformers.js
ENV NODE_ENV=production
ENV EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2

# Add healthcheck for the new embedding service
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/pdf/health || exit 1

# Use port from environment variable
EXPOSE $PORT

CMD ["npm", "start"]