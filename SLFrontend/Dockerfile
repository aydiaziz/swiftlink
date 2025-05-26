FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps 
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/slfrontend/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./www.swift-helpers.com.* /app
