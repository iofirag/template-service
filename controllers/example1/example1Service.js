const opentracing = require("opentracing");

module.exports = class Example1Service {
    constructor(example1Logic, logger, tracer, serviceData) {
        this._handler = example1Logic;
        this._logger = logger;
        this._tracer = tracer;
        this._serviceData = serviceData;
    }

    async addExample(req, res) {
        this._logger.logV2('info', this.constructor.name, req.openapi.schema.operationId, 'start');
        let result;
        const logObj = {
            isError: false,
            msg: 'success',
        };
        const ctx = this._tracer.extract(opentracing.FORMAT_HTTP_HEADERS, req.headers);
        const span = ctx ? this._tracer.startSpan(this._serviceData.name, { childOf: ctx }) : this._tracer.startSpan(this._serviceData.name);
        try {
            const userData = req.params.userData;
            await this._handler.addExample(userData, span);
            result = userData;
        } catch (error) {
            span.setTag(opentracing.Tags.ERROR, true);
            logObj.isError = true;
            logObj.msg = error.message;
            res.statusCode = 500;
        } finally {
            this._logger.logV2(logObj.isError ? 'error' : 'info', this.constructor.name, req.openapi.schema.operationId, logObj.msg);
            res.setHeader('Content-Type', 'application/json');
            res.end(result ? JSON.stringify(result) : '');
            span.finish();
        }
    }
};