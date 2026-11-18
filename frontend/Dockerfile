# ---- Stage 1: build the static files with Node ----
FROM node:24-alpine AS build
WORKDIR /app

# Install dependencies first (cached until package.json / package-lock.json change)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Where the browser should send API calls. Baked into the JavaScript at build time.
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Stage 2: serve dist/ with nginx (no Node.js in the final image) ----
FROM nginx:1.28-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80