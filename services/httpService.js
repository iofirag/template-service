const axios = require('axios');
const axiosRetry = require('axios-retry');
const opentracing = require("opentracing");

module.exports = class HttpService {
    constructor(baseURL, retryFunction, config, tracer) {
        this._config = config;
        this._tracer = tracer;
        axiosRetry(axios, {
            retries: this._config.retries,
            retryCondition: retryFunction,
        });
        this._client = axios.create({ baseURL, ...this._config.axiosOptions });
    }

    async request(method, pathName, headers = {}, data = {}, span) {
        const headersWithTracing = this.getHeadersWithTracing(span, headers);
        return this._client.request({ url: pathName, method, headersWithTracing, data });
    }

    async get({ pathName, headers, params }, span) {
        return this.request('GET', pathName, headers, params, span);
    }

    async post({ pathName, headers, body }, span) {
        return this.request('POST', pathName, headers, body, span);
    }

    async put({ pathName, headers, body }, span) {
        return this.request('PUT', pathName, headers, body, span);
    }

    async delete({ pathName, headers, body }, span) {
        return this.request('DELETE', pathName, headers, body, span);
    }

    getHeadersWithTracing(span, headers) {
        this._tracer.inject(span.context(), opentracing.FORMAT_HTTP_HEADERS, headers);
        return headers;
    }
};
