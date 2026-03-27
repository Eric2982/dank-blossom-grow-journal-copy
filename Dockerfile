# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
# If an NPM_TOKEN build secret is provided, write a temporary .npmrc so that
# npm ci can authenticate.  The secret is mounted only for this RUN layer and
# is never baked into the final image.
RUN --mount=type=secret,id=npm_token,required=false \
    if [ -f /run/secrets/npm_token ] && [ -s /run/secrets/npm_token ]; then \
      printf '//registry.npmjs.org/:_authToken=%s\n' "$(cat /run/secrets/npm_token)" > .npmrc; \
    fi && \
    npm ci && \
    rm -f .npmrc

COPY . .
RUN npm run build

# Serve stage
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
