#!/bin/sh
echo "Delete all etcd keys"
ETCDCTL_API=3
etcdctl del "*" --from-key=true --endpoints=http://etcd:2380
#
# Be careful: In properties file commented key-value pairs will be read out anyways (but with '#')
# $1 is a variable input derived from the 1st argument of the sh-script
ETCD_KEY_VALUE_FILE=$1
#IFS == internal field separator
echo "putting default key-value-pairs into etcd"
cat $ETCD_KEY_VALUE_FILE | grep -v '^ *#' | while IFS="=" read -r KEY VALUE
do
    echo insert ${KEY}=${VALUE}
    etcdctl put ${KEY} "${VALUE}" --endpoints=http://etcd:2380
done