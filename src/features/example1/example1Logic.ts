import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import opentracing from 'opentracing';
import { TYPES } from '../../containerTypes';

@injectable()
export default class Example1Logic {
    @inject(TYPES.Example1Data) private _archive: any;
    private _logger: any;
    private _tracer: any;
    private _serviceData: any;
    private _queueService: any;

    async addExample(value, parentSpan) {
        const logObj = {
            prefix: `${this.constructor.name} - ${this.addExample.name}`,
            isError: false,
            msg: 'success',
        };
        const span = this._tracer.startSpan(logObj.prefix, {
            childOf: parentSpan,
        });
        try {
            if (!value) {
                throw new Error('empty value');
            }
            // await this._queueService.sendMessage(userData);
            // await this._archive.addExample(userData, span);
        } catch (error) {
            span.setTag(opentracing.Tags.ERROR, true);
            logObj.isError = true;
            logObj.msg = error.message;
            throw error;
        } finally {
            this._logger.log(logObj.isError ? 'error' : 'info', `${logObj.prefix} - ${logObj.msg}`, span);
            span.finish();
        }
    }
}
