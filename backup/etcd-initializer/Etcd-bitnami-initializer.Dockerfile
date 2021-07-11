FROM bitnami/etcd:latest
COPY . /var/etcd
WORKDIR /var/etcd
CMD sh ./load-default-values.sh initial-values-local.properties