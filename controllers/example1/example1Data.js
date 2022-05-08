const opentracing = require('opentracing');

module.exports = class Example1Data {
    constructor(archiveService, archiveConfig, logger, tracer, serviceData) {
        this._archiveService = archiveService;
        this._archiveConfig = archiveConfig;
        this._logger = logger;
        this._tracer = tracer;
        this._serviceData = serviceData;
        this._index = `${this._archiveConfig.indexPrefix}-${this._archiveConfig.entitiesIndex.example1}`;
    }

    async configure(parentSpan) {
        const logObj = {
            prefix: `${this.constructor.name} - ${this.configure.name}`,
            isError: false,
            msg: 'success',
        };
        const span = this._tracer.startSpan(logObj.prefix, { childOf: parentSpan });
        try {
            const mappingBody = {
                properties: {
                    name: {
                        type: 'keyword',
                    },
                },
            };
            await this._archiveService.createMappingIndexIfNotExist(this._index, null, mappingBody, span);
        } catch (error) {
            span.setTag(opentracing.Tags.ERROR, true);
            logObj.isError = true;
            logObj.msg = error.message;
            // throw error;
        } finally {
            this._logger.log(
                logObj.isError ? 'error' : 'info',
                `${logObj.prefix} - ${logObj.msg}`,
                span
            );
            span.finish();
        }
    }

    async addExample(newValue, parentSpan) {
        const logObj = {
            prefix: `${this.constructor.name} - ${this.addExample.name}`,
            isError: false,
            msg: 'success',
        };
        const span = this._tracer.startSpan(logObj.prefix, { childOf: parentSpan });
        try {
            await this._archiveService.saveData()
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
