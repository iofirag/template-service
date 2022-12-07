const mongoose = require('mongoose');

module.exports = class MongooseService {
    constructor(config, logger) {
        this._config = config;
        this._logger = logger;
        this._model = {};
    }

    async init() {
        try {
            await mongoose.connect(this._config.connectionString, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            });
            this._logger.log('info', `${this.constructor.name} - ${this.init.name} - success`);
            process.on('SIGINT', () => {
                mongoose.connection.close();
                this._logger.log('info', `${this.constructor.name} - connection SIGINT close - success`);
            });
        } catch (error) {
            this._logger.log('error', `${this.constructor.name} - ${this.init.name} - ${error.message}`);
            throw error;
        }
    }

    registerModel(modelName, schema) {
        const schemaObj = new mongoose.Schema(schema);
        this._model[modelName] = mongoose.model(modelName, schemaObj);
    }

    async getAllDocs(modelName) {
        return this._model[modelName].find();
    }

    async insert(modelName, data) {
        const newDoc = new this._model[modelName](data);
        return newDoc.save();
    }
};
