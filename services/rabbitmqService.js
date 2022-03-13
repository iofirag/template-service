const _ = require('lodash');
const amqp = require('amqplib');
const opentracing = require('opentracing');

module.exports = class RabbitMq {
    constructor(config, serviceData, logger, tracer) {
        this._config = config;
        this._serviceData = serviceData;
        this._logger = logger;
        this._tracer = tracer;
    }

    async start(parentSpan) {
        let span;
        try {
            span = this._tracer.startSpan(`${this.constructor.name} - ${this.start.name}`, { childOf: parentSpan });
            const connection = await amqp.connect(this._config.url);
            await this.buildQueueMap(connection, this._config.queueMap);

            // Catch connection errors
            connection.on('error', (error) => {
                this._logger.log('error', `${this.constructor.name} - ${this.start.name} failed. connection error: ${error.message}`);
                throw error;
            });
        } catch (error) {
            this._logger.log('error', `${this.constructor.name} - ${this.start.name} failed. error: ${error.message}`);
            span.setTag(opentracing.Tags.ERROR, true);
            throw error;
        } finally {
            span.finish();
        }
    }

    async buildQueueMap(connection, queueMap) {
        await this.buildFromConsumeList(connection, queueMap.consumeList);
        await this.buildFromPublishMap(connection, queueMap.publishMap);
    }

    async buildFromConsumeList(connection, consumeList = []) {
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

    async buildFromPublishMap(connection, publishMap = {}) {
        if (!Object.keys(publishMap).length) return;
        await this.createConfirmChannel(connection);
        for (const queueKey in publishMap) {
            if (publishMap[queueKey]) {
                const queueObj = publishMap[queueKey];
                if (queueObj.assertOptions) {
                    // Assert Queue
                    await this.assertionQueue(connection, queueObj);
                }
            }
        }
    }

    async createConfirmChannel(connection) {
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

    async send(msg, queueName, parentSpan) {
        let span;
        try {
            span = this._tracer.startSpan(`${this.constructor.name} - ${this.send.name}`, { childOf: parentSpan });
            this._logger.log('info', `send messaage ${msg} to ${queueName}`);
            await this._publishChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), { persistent: true });
        } catch (error) {
            this._logger.log('error', `${this.constructor.name} - ${this.send.name} failed. error: ${error.message}`);
            span.setTag(opentracing.Tags.ERROR, true);
            throw error;
        } finally {
            span.finish();
        }
    }

    async requeue(queueName, msg) {
        await this.reject(queueName, msg, true);
    }

    async reject(queueName, msg, requeue = false) {
        await this._consumeMap[queueName].reject(msg, requeue);
    }

    getPublishQueueNameByKey(key) {
        return this._config.queueMap.publishMap[key].queueName;
    }

    async handleReceiveDone(deliveryTag, queueName, parentSpan) {
        let span;
        try {
            span = this._tracer.startSpan(`${this.constructor.name} - ${this.handleReceiveDone.name}`, { childOf: parentSpan });
            const ackObj = { fields: { deliveryTag } };
            await this._consumeMap[queueName].ack(ackObj);
        } catch (error) {
            this._logger.log('error', `${this.constructor.name} - ${this.handleReceiveDone.name} failed. error: ${error.message}`);
        } finally {
            span.finish();
        }
    }
};
