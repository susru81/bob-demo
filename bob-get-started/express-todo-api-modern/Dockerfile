# Stage 1: Build React Client
FROM node:22-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm install

# Copy client source
COPY client/ ./

# Build React app (outputs to ../dist/public)
RUN npm run build

# Stage 2: Build Server
FROM node:22-alpine AS server-builder

WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy server source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Stage 3: Production Image
FROM node:22-alpine

WORKDIR /app

# Copy server dependencies and built code
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/dist ./dist
COPY --from=server-builder /app/package.json ./

# Copy built React app
COPY --from=client-builder /app/dist/public ./dist/public

# Expose port
EXPOSE 3000

# Set environment
ENV PORT=3000
ENV NODE_ENV=production

# Start server
CMD ["npm", "start"]

# Made with Bob
