FROM node:14.21.3 as builder
WORKDIR /usr/local/src/
COPY . .

RUN npm ci && npm run init && npm run build

FROM nginx:latest

COPY --from=builder /usr/local/src/packages/jsonforms-vuetify-webcomponent/dist /usr/share/nginx/html

EXPOSE 80
