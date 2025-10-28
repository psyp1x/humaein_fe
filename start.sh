#!/bin/sh

# Set default PORT if not set
export PORT=${PORT:-8080}

echo "PORT is set to $PORT"

# Substitute PORT in nginx config
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "nginx config generated"

# Start nginx
nginx -g 'daemon off;'