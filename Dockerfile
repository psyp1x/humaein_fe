FROM node:20-alpine
WORKDIR /app

# Accept API base at build time for Vite
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}

COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .

# Build with the provided VITE_ env
RUN npm run build

# Cloud Run sets PORT (default 8080)
ENV PORT=8080
EXPOSE 8080

# Ensure runtime also has the API base (vite preview only uses built assets, but env kept for clarity)
ENV VITE_API_BASE=${VITE_API_BASE}
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port ${PORT}"]
