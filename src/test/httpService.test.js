const sinon = require('sinon');
const httpService = require('./mocks/httpMock');

describe('HttpService testing', () => {
    let axiosRequestStub;

    beforeEach(() => {
        axiosRequestStub = sinon.stub(httpService._client, 'request');
    });

    afterEach(() => {
        axiosRequestStub.restore();
    });

    it('request - should try to make get request', async () => {
        const configRequest = { urlEnding: 'isalive', headers: '', params: '' }
        await httpService.get(configRequest);
        sinon.assert.calledOnce(axiosRequestStub);
    })
});
