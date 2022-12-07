const { Client } = require('@elastic/elasticsearch');
const opentracing = require('opentracing');

module.exports = class ArchiveService {
    constructor(config, logger, tracer) {
        this._config = config;
        this._client = new Client({
            node: this._config.hosts,
            apiVersion: this._config.apiVersion,
            maxRetries: parseInt(this._config.maxRetries),
            requestTimeout: parseInt(this._config.requestTimeout),
        });
        this._logger = logger;
        this._tracer = tracer;
    }

    async createMappingIndexIfNotExist(indexName, typeName, mappingBody, parentSpan) {
        const logObj = {
            prefix: `${this.constructor.name} - ${this.createMappingIndexIfNotExist.name}`,
            isError: false,
            msg: 'success',
        };
        const span = this._tracer.startSpan(logObj.prefix, { childOf: parentSpan });
        try {
            const isIndexExists = this._client.indices.exists({ index: indexName });
            if (!isIndexExists.body) {
                this._logger.log('info', `${logObj.prefix} index ${indexName} does not exist. creating new index.`);
                await this._client.indices.create({
                    index: indexName,
                    body: {
                        // number_of_replicas: 1,
                        // number_of_shards: 15
                    },
                });
                await this.createMapping(indexName, this._docType, mappingBody, span);
            } else {
                this._logger.log('info', `${logObj.prefix} index ${indexName} already exist.`);
            }
        } catch (error) {
            span.setTag(opentracing.Tags.ERROR, true);
            logObj.isError = true;
            logObj.msg = `createIndex ${indexName} error: ${error.message}`;
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

    async createMapping(indexName, typeName, mappingBody, parentSpan) {
        const logObj = {
            prefix: `${this.constructor.name} - ${this.createMapping.name}`,
            isError: false,
            msg: 'success',
        };
        const span = this._tracer.startSpan(logObj.prefix, { childOf: parentSpan });
        try {
            this._logger.log('info', `${logObj.prefix} creating mapping.`);
            await this._client.indices.putMapping({
                index: indexName,
                body: mappingBody,
            });
        } catch (error) {
            span.setTag(opentracing.Tags.ERROR, true);
            logObj.isError = true;
            logObj.msg = `createIndex ${indexName} error: ${error.message}`;
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

    async saveNewData() {
        await this._archiveService._client.index({
            index: this._index,
            body: newValue,
            refresh: 'wait_for',
        });
    }

    get() {
        this._client.get();
    }

    async query(querySyntax) {
        //await this._client.query({
        //    body: querySyntax,
        //    headers: sdfsdf
        //})
    }
};
