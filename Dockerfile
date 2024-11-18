FROM node:18.19.0 as builder
WORKDIR /usr/local/src/
COPY . .

RUN npm install -g pnpm@8
RUN pnpm i --frozen-lockfile && pnpm build

FROM nginx:latest

COPY --from=builder /usr/local/src/packages/jsonforms-vuetify-webcomponent/dist /usr/share/nginx/html

EXPOSE 80
