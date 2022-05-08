const opentracing = require('opentracing');

module.exports = class Example1Logic {
    constructor(example1Data, logger, tracer, serviceData, queueService) {
        this._archive = example1Data;
        this._logger = logger;
        this._tracer = tracer;
        this._serviceData = serviceData;
        this._queueService = queueService;
    }

    async addExample(userData, parentSpan) {
        const logObj = {
            prefix: `${this.constructor.name} - ${this.addExample.name}`,
            isError: false,
            msg: 'success',
        };
        const span = this._tracer.startSpan(logObj.prefix, {
            childOf: parentSpan,
        });
        try {
            if (!userData) {
                throw new Error('empty value');
            }
            await this._queueService.sendMessage(userData);
            // await this._archive.addExample(userData, span);
        } catch (error) {
            span.setTag(opentracing.Tags.ERROR, true);
            logObj.isError = true;
            logObj.msg = error.message;
            throw error;
        } finally {
            this._logger.log(
                logObj.isError ? 'error' : 'info',
                `${logObj.prefix} - ${logObj.msg}`,
                span
            );
            span.finish();
        }
    }
};
