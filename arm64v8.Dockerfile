FROM ubuntu as builder
RUN apt-get update \
	&& apt-get install -qq --no-install-recommends qemu qemu-user-static qemu-user binfmt-support

FROM arm64v8/node:12-alpine
COPY --from=builder /usr/bin/qemu-aarch64-static /usr/bin/qemu-aarch64-static
WORKDIR /usr/src/app
COPY . .
RUN apk add --update openssl && \
    rm -rf /var/cache/apk/*
RUN npm install --only=production

ENV PORT 3001
ENV DOCPORT 4001
ENV PROTOCOL https
ENV EXECMODE production

EXPOSE 3001
EXPOSE 4001

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]