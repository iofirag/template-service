const opentracing = require('opentracing');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../config/firebase-adminsdk-credentials.json');

module.exports = class FirebaseService {
    constructor(config, logger, tracer) {
        this._config = config;
        this._logger = logger;
        this._tracer = tracer;
    }

    async init() {
        try {
            this._firebaseAdmin = firebaseAdmin.initializeApp({
                credential: firebaseAdmin.credential.cert(serviceAccount),
                databaseURL: 'https://test-react-http-7b253-default-rtdb.europe-west1.firebasedatabase.app',
            });
            this._client = this._firebaseAdmin.database();
            this._logger.log('info', `${this.constructor.name} - ${this.init.name} - success`);
        } catch (error) {
            this._logger.log('error', `${this.constructor.name} - ${this.init.name} - ${error.message}`);
            throw error;
        }
    }

    async getAllDocs(modelName) {
        const prsRef = await this._client.ref(modelName);
        const snapshot = await prsRef.once('value');
        const prsObj = snapshot.val();
        return Object.values(prsObj);
    }

    async insert(modelName, data) {
        const id = await this._client.ref(modelName).push().key;
        const doc = {
            ...data,
            id,
            creationDate: new Date().toISOString(),
        };
        await this._client.ref(`prs/${id}`).set(doc);
        return doc;
    }
};
