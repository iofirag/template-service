const axios = require('axios');
const axiosRetry = require('axios-retry');

module.exports = class HttpService {
    constructor(baseURL, retryFunction, config) {
        this._config = config;
        this._client = axios.create({ baseURL, ...this._config.axiosOptions });
        axiosRetry(axios, {
            retries: this._config.retries,
            retryCondition: retryFunction,
        });
    }

    async request(method, urlSuffix, headers = {}, data = {}) {
        return this._client.request({ url: urlSuffix, method, headers, data });
    }

    async get({ urlSuffix, headers, params }) {
        return this.request('GET', urlSuffix, headers, params);
    }

    async post({ urlSuffix, headers, body }) {
        return this.request('POST', urlSuffix, headers, body);
    }

    async put({ urlSuffix, headers, body }) {
        return this.request('PUT', urlSuffix, headers, body);
    }

    async delete({ urlSuffix, headers, body }) {
        return this.request('DELETE', urlSuffix, headers, body);
    }
};
