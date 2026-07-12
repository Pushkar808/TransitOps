FROM node:20-alpine

WORKDIR /app

# Install dependencies (leverages layer caching)
COPY package*.json ./
RUN npm install

# Copy source and generate Prisma client
COPY . .
RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 4000

# Entry script runs migrations + seed, then starts the server
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
