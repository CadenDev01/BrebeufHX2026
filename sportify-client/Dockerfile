FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY sportify-client/nginx.conf /etc/nginx/conf.d/default.conf.template
COPY sportify-client/docker-entrypoint.sh /docker-entrypoint.sh

# Install gettext for envsubst
RUN apk add --no-cache gettext && chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
