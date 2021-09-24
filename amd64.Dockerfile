FROM node:12-alpine
WORKDIR /usr/src/app
COPY . .
RUN apk add --update openssl tini && \
    rm -rf /var/cache/apk/*
RUN npm install --only=production

ENV PORT 3001
ENV DOCPORT 4001
ENV PROTOCOL https
ENV EXECMODE production

EXPOSE 3001
EXPOSE 4001

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["/sbin/tini", "-g", "--", "./docker-entrypoint.sh"]