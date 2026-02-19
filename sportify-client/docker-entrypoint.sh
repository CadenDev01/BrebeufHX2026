#!/bin/sh
set -e

# Default API_URL for local development if not set
export API_URL=${API_URL:-http://localhost:3000}

echo "Configuring nginx with API_URL: $API_URL"

# Substitute environment variable and create the actual config
envsubst '${API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Starting nginx..."
exec nginx -g "daemon off;"
