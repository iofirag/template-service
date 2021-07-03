FROM bitnami/etcd:latest
COPY . /var/etcd
RUN ls /bin
WORKDIR /var/etcd
CMD sh ./load-default-values.sh initial-values-local.properties