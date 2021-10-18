const amqp = require('amqplib/callback_api');

module.exports = class RabbitMq {
    constructor(logger, serviceData) {
        this._serviceData = serviceData;
        this._logger = logger;
        this._queueName = 'testQueue';
        amqp.connect('amqps://ootbbpng:Q0oM7tMnJVGiGP_Vj6d4CvrsDoaiHnK5@cattle.rmq2.cloudamqp.com/ootbbpng', (error0, connection) => {
            if (error0) {
                throw error0;
            }
            this._conn = connection;
            this._logger.log('info', 'connection open');

            this._conn.createChannel((error1, channel) => {
                if (error1) {
                    throw error1;
                }
                channel.assertQueue(this._queueName, { durable: false });
                this._logger.log('info', 'channel created');
                this._channel = channel;
            });
        });
    }

    async sendMessage(msg) {
        this._logger.log('info', `send message start' ${msg}`);
        this._channel.sendToQueue(this._queueName, Buffer.from(JSON.stringify(msg)));
        this._logger.log('info', `Sent: ${msg}`);
    }
};
