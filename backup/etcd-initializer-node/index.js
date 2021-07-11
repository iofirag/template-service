const lineReader = require('line-reader');
const { Etcd3 } = require('etcd3');

(async () => {
    const etcdClient = new Etcd3({
        hosts: process.env.ETCD_ADDR || ['localhost:2379', 'localhost:2380'],
    });
    await etcdClient.delete().all();

    lineReader.eachLine('initial-values-local.properties', async (line) => {
        if (!line.match(/^\s*#/)) {
            const [key, val] = line.split('=');
            await etcdClient.put(key).value(val);
            console.log(`insert ${key}=${val}`);
        }
    });
})();
