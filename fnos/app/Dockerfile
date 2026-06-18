FROM nginx:alpine
RUN apk add --no-cache nodejs
WORKDIR /app
COPY ui/ ./
COPY server.js ./
EXPOSE 80
CMD ["node", "server.js"]
