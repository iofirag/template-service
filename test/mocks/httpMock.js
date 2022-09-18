const http = require('http');
const HttpService = require('../../services/httpService');

const defaultOptions = {
    timeout: 1000 * 60 * 2,
    headers: { systemName: 'httpMock' },
    httpAgent: new http.Agent({
        maxSockets: 25, // Conventionally recommended 25-50
    }),
};

const defaultRetryFunction = (error) => {
    console.log('httpClient', 'retry function', `request to ${'host'}/${'path'} failed. error: ${error.message}`, { error });
    return true;
};

module.exports = new HttpService('http://localhost:3000/', defaultOptions, defaultRetryFunction);
