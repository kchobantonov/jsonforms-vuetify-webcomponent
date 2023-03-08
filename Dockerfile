FROM node:14.17.5 as builder
WORKDIR /usr/local/src/
COPY . .

RUN npm i && npm run init && npm run build

FROM nginx:latest

COPY --from=builder /usr/local/src/packages/jsonforms-vuetify-webcomponent/dist /usr/share/nginx/html

EXPOSE 80
