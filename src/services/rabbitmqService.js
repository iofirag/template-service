const _ = require('lodash');
const amqp = require('amqplib');
const opentracing = require('opentracing');

module.exports = class RabbitMq {
    constructor(config, logger, tracer) {
        this._config = config;
        this._consumeMap = {};
        this._publishChannel = null;
        this._unRetryableErrors = config.unRetryableErrors;
        this._logger = logger;
        this._tracer = tracer;
    }

    async start(parentSpan) {
        let span;
        try {
            span = this._tracer.startSpan(`${this.constructor.name} - ${this.start.name}`, { childOf: parentSpan });
            this._logger.logV2('start', RabbitMq.name, this.start.name);
            const connection = await amqp.connect(this._config.url, { timeout: this._config.timeout || 10000 });
            // create publish
            await this.initPublishChaneel(connection);
            // Build consume map
            await this.buildConsumeMap(connection, this._config.consumeList);
            // Catch connection errors
            connection.on('error', (error) => {
                this._logger.log('error', `${this.constructor.name} - ${this.start.name} failed. connection error: ${error.message}`);
                throw error;
            });
            this._logger.logV2('success', RabbitMq.name, this.start.name);
        } catch (error) {
            this._logger.logV2('error', this.constructor.name, this.start.name, error);
            span.setTag(opentracing.Tags.ERROR, true);
            throw error;
        } finally {
            span.finish();
        }
    }

    async buildConsumeMap(connection, consumeList = []) {
        for (const queueObj of consumeList) {
            const queueName = queueObj.queueName;
            const channel = await connection.createChannel();
            channel.prefetch(parseInt(queueObj.prefetch));
            // QueueMap
            this._consumeMap[queueName] = channel;
            if (queueObj.assertOptions) {
                // Assert Queue
                await this.assertionQueue(connection, queueObj);
            }
        }
    }

    async initPublishChaneel(connection) {
        // Create confirm channel for all publishers
        this._publishChannel = await connection.createConfirmChannel();
    }

    async assertionQueue(connection, queueObj) {
        const assertChannel = await connection.createChannel();
        const { durable, exclusive, deadLetterExchange, deadLetterRoutingKey, exchangeName, routingKey, exchangeType } = queueObj.assertOptions;
        await assertChannel.assertExchange(exchangeName, exchangeType, {
            ...(!_.isNil(durable) && { durable }),
        });
        await assertChannel.assetQueue(queueObj.queueName, {
            ...(!_.isNil(exclusive) && { exclusive }),
            ...(!_.isNil(deadLetterExchange) && { deadLetterExchange }),
            ...(!_.isNil(deadLetterRoutingKey) && { deadLetterRoutingKey }),
        });
        await assertChannel.bindQueue(queueObj.queueName, exchangeName, routingKey);
        await assertChannel.close();
    }

    async publish(message, exhnageName, routingKey, parentSpan) {
        let span;
        try {
            span = this._tracer.startSpan(`${this.constructor.name} - ${this.publish.name}`, { childOf: parentSpan });
            this._logger.logV2('info', this.constructor.name, this.publish.name, 'start');
            await this._publishChannel.publish(exhnageName, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
            this._logger.logV2('info', this.constructor.name, this.publish.name, 'success');
        } catch (error) {
            this._logger.logV2('error', this.constructor.name, this.publish.name, error.message, { exhnageName, routingKey });
            span.setTag(opentracing.Tags.ERROR, true);
            throw error;
        } finally {
            span.finish();
        }
    }

    async register(callback) {
        try {
            this._logger.logV2('info', this.constructor.name, this.register.name);
            for (const queueName in this._consumeMap) {
                if (Object.prototype.hasOwnProperty.call(this._consumeMap, queueName)) {
                    const consumeChannel = this._consumeMap[queueName];
                    consumeChannel.on('error', (error) => {
                        this._logger.logV2('error', this.constructor.name, this.register.name, error.message);
                    });
                    await consumeChannel.consume(
                        queueName,
                        (msg) => {
                            this.handleReceiveMsg(callback, msg, queueName);
                        },
                        {
                            noAck: false,
                        }
                    );
                }
            }
            this._logger.logV2('info', this.constructor.name, this.register.name, 'success');
        } catch (error) {
            this._logger.logV2('error', this.constructor.name, this.register.name, error.message);
            throw error;
        }
    }

    async handleError(queueName, errorMessage, message) {
        try {
            const ackObj = { fields: { deliveryTag: message.fields.deliveryTag } };
            this._logger.logV2('info', this.constructor.name, this.handleError.name, '', { errorMessage });
            const isUnRetryableError = this._unRetryableErrors.some((error) => errorMessage.toLowerCase().includes(error.toLowerCase()));
            if (isUnRetryableError) {
                // error happen because error from the unfixed error list
                this._logger.logV2('warn', this.constructor.name, this.handleError.name, `send error queue name with error: ${errorMessage}`);
                await this.reject(queueName, ackObj);
            } else {
                this._logger.logV2('warn', this.constructor.name, this.handleError.name, `start requeue with error: ${errorMessage}`);
                await this.requeue(queueName, ackObj);
            }
            this._logger.logV2('info', this.constructor.name, this.handleError.name, 'success', { errorMessage });
        } catch (error) {
            this._logger.logV2('error', this.constructor.name, this.handleError.name, error.message);
            throw error;
        }
    }

    async requeue(queueName, msg) {
        await this.reject(queueName, msg, true);
    }

    async reject(queueName, msg, requeue = false) {
        await this._consumeMap[queueName].reject(msg, requeue);
    }

    getPublisherExchange() {
        return this._config.publisher.exchangeName;
    }

    getPublisherRoutingKey(key) {
        return this._config.publisher.routingKeys[key];
    }

    async handleReceiveDone(deliveryTag, queueName, parentSpan) {
        let span;
        try {
            span = this._tracer.startSpan(`${this.constructor.name} - ${this.handleReceiveDone.name}`, { childOf: parentSpan });
            const ackObj = { fields: { deliveryTag } };
            await this._consumeMap[queueName].ack(ackObj);
        } catch (error) {
            this._logger.log('error', `${this.constructor.name} - ${this.handleReceiveDone.name} failed. error: ${error.message}`);
            throw error;
        } finally {
            span.finish();
        }
    }
};
