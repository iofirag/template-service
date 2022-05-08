const _ = require('lodash');
const fs = require('fs');
const { Etcd3 } = require('etcd3');
const templateJson = require('../config/template.json');

const fsPromise = fs.promises;

module.exports = class ConfigCreatorService {
    constructor() {
        this._configJson = {};
        this._managementKeys = ['key', 'defaultValue'];
        this._outputFilePath = './config/production.json';
        this._etcdKeyPrefix = process.env.ETCD_KEY_PREFIX || '/configuration/testservice';
        console.log(`ETCD_HOST=${process.env.ETCD_HOST}, ETCD_KEY_PREFIX=${process.env.ETCD_KEY_PREFIX}`);
        this._etcdClient = new Etcd3({
            hosts: process.env.ETCD_HOST || ['localhost:2379', 'localhost:2380'],
        });
        this._keysMapping = {};
    }

    async init() {
        const logObj = {
            prefix: `${this.constructor.name} - ${this.init.name}`,
            isError: false,
            msg: 'success',
        };
        try {
            try {
                this._keysMapping = await this._etcdClient.getAll().prefix('/configuration/testservice/');
            } catch (error) {
                this._keysMapping = {};
            } finally {
                await this.buildJsonFromTemplate();
                await this.saveLocalFile();
            }
        } catch (error) {
            console.error(error);
            logObj.isError = true;
            logObj.msg = error.message;
            throw error;
        } finally {
            console.log(logObj.isError ? 'error' : 'info', `${logObj.prefix} - ${logObj.msg}`);
        }
    }

    async buildJsonFromTemplate() {
        await this.iterateNestedObject(templateJson);
    }

    async saveLocalFile() {
        await fsPromise.writeFile(this._outputFilePath, JSON.stringify(this._configJson, null, 4));
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
                    const keyWitoutPrefix = obj[field].key.replace(this._etcdKeyPrefix, '');
                    const configValue = await this.getConfigKey(this._etcdKeyPrefix, keyWitoutPrefix, obj[field].defaultValue);
                    // write key in result json
                    _.set(this._configJson, keyTreeCopy.join('.'), configValue);
                } else {
                    // nested object
                    await this.iterateNestedObject(obj[field], keyTreeCopy);
                }
            }
        }
    }

    getConfigKey(prefix, key, defaultValue) {
        let resValue = defaultValue;
        const configValue = this._keysMapping[`${prefix}${key}`];
        if (configValue) {
            try {
                resValue = JSON.parse(configValue);
            } catch (error) {
                resValue = configValue;
            }
        }
        return resValue;
    }
};