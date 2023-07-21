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

// let proxyNode;
// let httpsAgent;
// let httpAgent;
// const blacklistProxy = new Set();

// export const initProxyNode = () => {
// 	proxyNode = null;
// }

// const initProxy = () => {
//     do {
//         proxyNode = config.http.proxyList[Utils.getRandomNumber(config.http.proxyList.length)];
//     } while (blacklistProxy.has(proxyNode.host));
//     console.log('use proxy:',proxyNode.host);
//     const proxyUrl = `${proxyNode.protocol}://${proxyNode.auth ? `${proxyNode.auth.username}:${proxyNode.auth.password}@` : ''}${proxyNode.host}:${proxyNode.port}`;
//     console.log('proxyUrl: ',proxyUrl);
//     httpsAgent = proxyNode.protocol.toUpperCase().includes('SOCKS') ? new SocksProxyAgent(proxyUrl) : new HttpsProxyAgent(proxyUrl);
//     httpAgent = proxyNode.protocol.toUpperCase().includes('SOCKS') ? new SocksProxyAgent(proxyUrl) : new HttpProxyAgent(proxyUrl);
// };

// export const sendHttp = async (reqConfig, cookie=null) => {
//     try {
//         config.http.useProxy && config.http.proxyList && !proxyNode && initProxy();
//         reqConfig = {
//             ...reqConfig,
//             // ...(config.http.disableCache && { url: `${reqConfig.url}` }), // &timestamp=${new Date().getTime()}
//             headers: {
//                 ...reqConfig.headers,
//                 // ...(cookie && { 'Cookie': cookie }),
//                 ...(config.http.disableCache && {
//                     'Cache-Control': 'no-cache',
//                     'Pragma': 'no-cache',
//                     'Expires': '0'
//                 }),
//             },
//             ...(proxyNode && { httpsAgent, httpAgent }),
//             ...(config.http.timeout && { timeout: config.http.timeout }),
//         }
//         return await axios.request(reqConfig);
//     } catch (error) {
//         if (['CERT_HAS_EXPIRED', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'ETIMEDOUT'].includes(error.code)) {
//             console.error('change proxy');
//             blacklistProxy.add(proxyNode.host);
//             console.error('added to blacklist', proxyNode.host);
//             proxyNode = null;
//             return sendHttp(reqConfig);
//         } else {
//             throw error
//         }
//     }
// };

// export const getCookieFromResponse = (res: AxiosResponse) => {
//     try {
//         if (!res.headers['set-cookie']) throw new Error('MISSING_AUTHORIZATION_COOKIE');
//         return res.headers['set-cookie'].join('; ');
//     } catch (error) {
//         console.error(error)
//     }
// };
