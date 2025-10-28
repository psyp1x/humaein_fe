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

# Install nginx and gettext for envsubst
RUN apk add --no-cache nginx gettext

# Create nginx html dir
RUN mkdir -p /usr/share/nginx/html/

# Copy built files to nginx html dir
RUN cp -r dist/* /usr/share/nginx/html/

# Copy nginx config template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Expose port
EXPOSE 8080

# Ensure runtime also has the API base (vite build embeds it)
ENV VITE_API_BASE=${VITE_API_BASE}
CMD ["sh", "-c", "envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
