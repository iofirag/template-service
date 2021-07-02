const opentracing = require('opentracing');
const Stopwatch = require('statman-stopwatch');

module.exports = class Example1Archive {
    constructor(archiveService, archiveConfig, logger, tracer, serviceData) {
        this._archiveService = archiveService;
        this._config = archiveConfig;
        this._logger = logger;
        this._tracer = tracer;
        this._serviceData = serviceData;
        this._index = `${this._config.indexPrefix}-${this._config.entitiesIndex.example1}`;
    }

    async configure(parentSpan) {
        const logObj = {
            prefix: `${this.constructor.name} - ${this.configure.name}`,
            sw: new Stopwatch(true),
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
            throw error;
        } finally {
            this._logger.log(
                logObj.isError ? 'error' : 'info',
                `${logObj.prefix} - ${logObj.msg}`,
                logObj.isError ? span : null,
                `time: ${logObj.sw.stop() / 1000}`
            );
            span.finish();
        }
    }

    async addExample(newValue, parentSpan) {
        const logObj = {
            prefix: `${this.constructor.name} - ${this.addExample.name}`,
            sw: new Stopwatch(true),
            isError: false,
            msg: 'success',
        };
        const span = this._tracer.startSpan(logObj.prefix, { childOf: parentSpan });
        try {
            await this._archiveService._client.index({
                index: this._index,
                body: newValue,
                refresh: 'wait_for',
            });
        } catch (error) {
            span.setTag(opentracing.Tags.ERROR, true);
            logObj.isError = true;
            logObj.msg = error.message;
            throw error;
        } finally {
            this._logger.log(
                logObj.isError ? 'error' : 'info',
                `${logObj.prefix} - ${logObj.msg}`,
                logObj.isError ? span : null,
                `time: ${logObj.sw.stop() / 1000}`
            );
        }
    }
};
