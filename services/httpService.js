const axios = require('axios');

module.exports = class HttpService {
    constructor(config, logger, tracer) {
        this._config = config;
        this._logger = logger;
        this._tracer = tracer;
    }

    async get(url, config = {}) {
        const requstObj = {
            ...config,
            method: 'GET',
            url,
        };
        return this.request(requstObj);
    }

    async post(url, data = {}, config = {}) {
        const requstObj = {
            ...config,
            method: 'POST',
            url,
            data,
        };
        return this.request(requstObj);
    }

    async put(url, data = {}, config = {}) {
        const requstObj = {
            ...config,
            method: 'PUT',
            url,
            data,
        };
        return this.request(requstObj);
    }

    async delete(url, config = {}) {
        const requstObj = {
            ...config,
            method: 'DELETE',
            url
        };
        return this.request(requstObj);
    }

    async request(config) {
        try {
            const res = await axios.request(config);
            return res.data;
        } catch (error) {
            this._logger.log('error', `${this.constructor.name} - ${this.request.name} failed. error: ${error.message}`);
            throw error;
        }
    }
};