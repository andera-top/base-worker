FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE ${PORT}
USER node

CMD ["node", "dist/app.js"]
