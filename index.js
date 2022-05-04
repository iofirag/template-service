const cors = require('cors');
const morgan = require('morgan');
const oasTools = require('oas3-tools');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const container = require('./containerConfig');

(async () => {
    const source = container.resolve('source');
    const serviceData = container.resolve('serviceData');
    const serverConfig = container.resolve('serverConfig');
    const swaggerConfig = container.resolve('swaggerConfig');
    const logger = container.resolve('logger');
    const probe = container.resolve('probe');
    logger.log('info', serviceData);
    logger.log('info', source);

    try {
        const serverPort = serverConfig ? serverConfig.port : 3088;
        const serverHost = process.env.NODE_ENV ? serviceData.name : `localhost${serverPort}`;
        const oasOptions = {
            routing: {
                controllers: './routeControllers',
            },
            ...swaggerConfig,
        };
        const { app } = oasTools.expressAppConfig('./api/oas.yaml', oasOptions);
        app.use(cors());
        app.use(cookieParser());
        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(morgan('combined'));
        app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, UseCamelCase, x-clientid, Authorization');
            if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.end();
            } else {
                next();
            }
            // Check for token here (optional)
        });

        // Start the server
        await probe.start(app, serverPort);
        probe.readyFlag = true;
        logger.log('info', `Your server is lis`);
        logger.log('info', `your server is listening on port ${serverPort} at http://${serverHost}`);
        logger.log('info', `Swagger-ui is available on http://${serverHost}/docs`);
    } catch (error) {
        probe.readyFlag = false;
        probe.liveFlag = false;
        logger.log('error', `cannot start server ${error}`);
        probe.addError(error);
    }
})();
