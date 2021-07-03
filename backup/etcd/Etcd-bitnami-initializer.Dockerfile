FROM bitnami/etcd:latest
COPY . /var/etcd
RUN ls /bin
#RUN /bin/sh -c ls –l
#RUN chmod +x ./load-default-values.sh
#RUN ["sudo", "chmod", "u+x", "/var/etcd/sdf.sh"]
WORKDIR /var/etcd
#RUN ls –l
CMD sh ./sdf.sh initial-values-local.properties
#CMD /bin/sh ./load-default-values.sh initial-values-local.properties
#RUN /bin/sh -c ls