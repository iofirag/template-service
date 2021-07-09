const opentracing = require("opentracing");
const Stopwatch = require('statman-stopwatch');


module.exports = class Example1Service {
    constructor(example1Handler, logger, tracer, serviceData) {
        this._handler = example1Handler;
        this._logger = logger;
        this._tracer = tracer;
        this._serviceData = serviceData;
    }

    async addExample(req, res) {
        let result;
        const logObj = {
            prefix: `${this.constructor.name} - ${req.swagger.operation.operationId}`,
            sw: new Stopwatch(true),
            isError: false,
            msg: 'success',
        };
        const ctx = this._tracer.extract(opentracing.FORMAT_HTTP_HEADERS, req.headers);
        const span = ctx ? this._tracer.startSpan(this._serviceData.name, { childOf: ctx }) : this._tracer.startSpan(this._serviceData.name);
        try {
            const newValue = req.swagger.params.yourname.value;
            await this._handler.addExample(newValue, span);
            result = newValue;
        } catch (error) {
            span.setTag(opentracing.Tags.ERROR, true);
            logObj.isError = true;
            logObj.msg = error.message;
            res.statusCode = 500;
        } finally {
            this._logger.log(logObj.isError ? 'error' : 'info', `${logObj.prefix} - ${logObj.msg}`, span, `time: ${logObj.sw.stop()/1000}`);
            res.setHeader('Content-Type', 'application/json');
            res.end(result ? JSON.stringify(result || '') : '');
            span.finish();
        }
    }
};