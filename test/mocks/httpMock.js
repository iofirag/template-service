const http = require('http');
const HttpService = require('../../services/httpService')

const defaultOptions = {
    timeout: 1000 * 60 * 2,
    headers: {systemName: 'httpMock'},
    httpAgent: new http.Agent({
        maxSockets: 25 // Conventionally recommended 25-50
    })
}

const defaultRetryFunction = (error) => {
    return true;
}

module.exports = new HttpService('http://localhost:3000/', defaultOptions, defaultRetryFunction);