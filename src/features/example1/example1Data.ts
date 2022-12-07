import { injectable, inject } from "inversify";
import "reflect-metadata";
import opentracing from 'opentracing'

@injectable()
export default class Example1Data {
    private _archiveService: any;
    private _archiveConfig: any;
    private _logger: any;
    private _tracer: any;
    private _serviceData: any;
    private _index: string;

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
