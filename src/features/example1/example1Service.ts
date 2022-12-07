import { injectable, inject } from "inversify";
import "reflect-metadata";
import opentracing from 'opentracing'
import { TYPES } from "../../containerTypes";

@injectable()
export default class Example1Service {
    @inject(TYPES.Example1Logic) private _handler: any;
    private _logger: any;
    private _tracer: any;
    private _serviceData: any;

    async addExample(req, res) {
        this._logger.logV2('info', this.constructor.name, req.route.path, 'start');
        let result;
        const logObj = {
            isError: false,
            msg: 'success',
        };
        const ctx = this._tracer.extract(opentracing.FORMAT_HTTP_HEADERS, req.headers);
        const span = ctx ? this._tracer.startSpan(this._serviceData.name, { childOf: ctx }) : this._tracer.startSpan(this._serviceData.name);
        try {
            const data = req.body;
            await this._handler.addExample(data, span);
            result = data;
        } catch (error) {
            span.setTag(opentracing.Tags.ERROR, true);
            logObj.isError = true;
            logObj.msg = error.message;
            res.statusCode = 500;
        } finally {
            this._logger.logV2(logObj.isError ? 'error' : 'info', this.constructor.name, req.route.path, logObj.msg);
            res.setHeader('Content-Type', 'application/json');
            res.end(result ? JSON.stringify(result) : '');
            span.finish();
        }
    }
};