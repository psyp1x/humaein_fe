FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .

# Build with the provided VITE_ env
RUN VITE_API_BASE=$VITE_API_BASE npm run build

# Install nginx and gettext for envsubst
RUN apk add --no-cache nginx gettext

# Create nginx html dir
RUN mkdir -p /usr/share/nginx/html/

# Copy built files to nginx html dir
RUN cp -r dist/* /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 5173

# Ensure runtime also has the API base (vite build embeds it)
# ENV VITE_API_BASE=${VITE_API_BASE}
CMD ["nginx", "-g", "daemon off;"]
