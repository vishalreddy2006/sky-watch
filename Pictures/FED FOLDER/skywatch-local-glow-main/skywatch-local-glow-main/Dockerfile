FROM node:18-alpine AS builder
WORKDIR /app

# install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

# copy source and build
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

# copy built static files
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Use npx serve to serve the static build and respect Render's $PORT
CMD ["sh", "-c", "npx serve -s dist -l ${PORT:-3000}"]
