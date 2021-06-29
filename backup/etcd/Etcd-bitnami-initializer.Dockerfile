FROM bitnami/etcd:latest
COPY . /var/etcd
CMD /bin/sh -c "cd /var/etcd && ./load-default-values.sh initial-values-local.properties"