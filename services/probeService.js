const { createTerminus, HealthCheckError } = require('@godaddy/terminus');
const http = require('http');

module.exports = class Probe {
    constructor(config, logger) {
        this._config = config;
        this._logger = logger;
        this._readyFlag = false;
        this._liveFlag = true;
        this._errors = [];

        const noop = () => {};

        const onSignal = () => {
            this._logger.log('onSignal, server is starting cleanup');
            return Promise.all([
                // your clean logic, like closing database connections
            ]);
        };

        const onShutdown = () => {
            this._logger.log('onShutdown, not implemented');
        };

        const beforeShutdown = () => {
            this._logger.log('beforeShutdown, not implemented');
        };

        const onSendFailureDuringShutdown = () => {
            this._logger.log('onSendFailureDuringShutdown, not implemented');
        };

        const liveness = () => {
            this._logger.log('silly', `liveness probe = ${this._liveFlag}`);
            if (this._liveFlag) {
                return Promise.resolve();
            } else {
                throw new HealthCheckError('liveness failed', this._errors);
            }
        };

        const readiness = () => {
            this._logger.log('silly', `readiness probe = ${this._readyFlag}`);
            if (this._readyFlag) {
                return Promise.resolve();
            } else {
                throw new HealthCheckError('rediness failed', this._errors);
            }
        };

        this._options = {
            // healthcheck options
            healthChecks: {
                '/liveness': this._config.liveness || liveness, // a promise returning function indicating service health
                '/readiness': this._config.readiness || readiness, // a promise returning function indicating service health
            },
            // cleanup options
            timeout: this._config.timeout || 1000, // [optional = 1000] number of milliseconds before forcefull exiting
            beforeShutdown: this._config.beforeShutdown || beforeShutdown, // [optional] called before the HTTP server starts its shutdown
            onSignal: this._config.onSignal || onSignal, // [optional] cleanup function, returning a promise (used to be onSignterm)
            onShutdown: this._config.onShutdown || onShutdown, // [optional] called right before exiting
            onSendFailureDuringShutdown: this._config.onSendFailureDuringShutdown || onSendFailureDuringShutdown, // [optional] called before sending each 503 during
            // both
            logger: this._config.logger || noop,
        };

        process.on('uncaughtException', (err) => {
            this._logger.log('error', `uncaughtException ${err}`);
            this.addError(`uncaughtException ${err}`);
            this._liveFlag = false;
        });

        // this._logger.log("info", `Probe configuration init`);
    }

    set readyFlag(flag) {
        this._logger.log('info', `readyFlag change to ${flag}`);
        this._readyFlag = flag;
    }

    set liveFlag(flag) {
        this._logger.log('info', `liveFlag change to ${flag}`);
        this._liveFlag = flag;
    }

    addError(err) {
        this._errors.push(err);
    }

    start(app, port) {
        return new Promise((resolve, reject) => {
            const server = createTerminus(http.createServer(app), this._options);
            server
                .listen(port, () => {
                    this._logger.log('info', `Probe server is listening on port ${port}`);
                    return resolve();
                })
                .on('error', (error) => {
                    this._readyFlag = false;
                    this._liveFlag = false;
                    this.addError(error);
                    this._logger.log('error', `Error start prob server: ${error}`);
                    return reject();
                });
        });
    }
};
