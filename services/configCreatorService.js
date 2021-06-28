const _ = require('lodash');
const fs = require('fs');
const Etcd = require('node-etcd');
const templateJson = require('../config/template.json');

const fsPromise = fs.promises;

class ConfigCreatorService {
    constructor() {
        this._configJson = {};
        this._managementKeys = ['key', 'defaultValue'];
        this._outputFilePath = './config/production.json';
        this._etcdKeyPrefix = process.env.ETCD_KEY_PREFIX || '';
        this._etcdClient = new Etcd([process.env.ETCD_HOST || 'localhost:2379']);
    }

    async init() {
        await this.buildJsonFromTemplate();
        await this.saveLocalFile();
    }

    async saveLocalFile() {
        await fsPromise.writeFile(this._outputFilePath, JSON.stringify(this._configJson, null, 4));
    }

    async buildJsonFromTemplate() {
        await this.iterateNestedObject(templateJson);
    }

    isSameItemsInArrays(arr1, arr2) {
        return arr1.every((v) => arr2.includes(v)) && arr2.every((v) => arr1.includes(v));
    }

    async iterateNestedObject(obj, keyTree = []) {
        for (const field in obj) {
            if (field in obj) {
                const keyTreeCopy = [...keyTree];
                keyTreeCopy.push(field);
                if (this.isSameItemsInArrays(Object.keys(obj[field]), this._managementKeys)) {
                    // value object
                    const configValue = await this.fetchConfigKey(this._etcdKeyPrefix + obj[field].key, obj[field].defaultValue);
                    // build key in complete json
                    _.set(this._configJson, keyTreeCopy.join('.'), configValue);
                } else {
                    // nested object
                    await this.iterateNestedObject(obj[field], keyTreeCopy);
                }
            }
        }
    }

    async fetchConfigKey(key = '', defaultValue = '') {
        return new Promise((resolve, reject) => {
            // get key from etcd
            this._etcdClient.get(key, (err, res) => {
                let value;
                if (err) {
                    // Default value
                    value = defaultValue;
                } else {
                    try {
                        value = JSON.parse(res.node.value);
                    } catch (error) {
                        value = res.node.value;
                    }
                }
                resolve(value);
            });
        });
    }
}

(async () => {
    const configCreatorService = new ConfigCreatorService();
    await configCreatorService.init();
})();
