const express = require('express');
const fs = require('fs');
const jsyaml = require('js-yaml');
const url = require('url');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerTools = require('swagger-tools');
const container = require('./containerConfig');

(async () => {
    const logger = container.resolve('logger');
    const probe = container.resolve('probe');
    const serverConfig = container.resolve('serverConfig');
    const swaggerConfig = container.resolve('swaggerConfig');
    const serviceData = container.resolve('serviceData');
    const test = container.resolve('test');
    logger.log('info', serviceData);
    logger.log('info', test);

    const app = express();

    try {
        // await container.resolve('example1Archive').configure();

        const options = {
            // swaggerUi: '/swagger.json',
            controllers: './controllers',
            useStabs: process.env.NODE_ENV === 'development', // Conditionally turn on stubs (mock mode)
        };
        const spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
        const swaggerDoc = jsyaml.load(spec);

        const parsedURL = url.parse(swaggerConfig.host);
        swaggerDoc.host = parsedURL.host || swaggerDoc.host;
        parsedURL.path = parsedURL.path || '/';
        swaggerDoc.basePath = parsedURL.path + serviceData.name + swaggerDoc.basePath;
        const serverPort = serverConfig ? serverConfig.port : 3008;

        app.use(express.json({ limit: '50mb' })); // for parsing application/json
        app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
        app.use(cookieParser());

        swaggerTools.initializeMiddleware(swaggerDoc, async (middleware) => {
            // Interpret Swagger resouces and attach metadata to  request - must he first in swagger tools middleware chain
            app.use(middleware.swaggerMetadata());
            app.use(morgan('combined'));

            // validate swagger requests
            app.use(middleware.swaggerValidator());

            // CORT!!! and OPTIONS handler
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
            });

            // Route validated requests to appropriate controller
            app.use(middleware.swaggerRouter(options));

            // Serve the swagger documents and swagger ui
            app.use(
                middleware.swaggerUi({
                    apiDocs: `${parsedURL.path}${serviceData.name}/api-docs`,
                    swaggerUi: '/docs',
                })
            );

            // Start the server
            await probe.start(app, serverPort);
            probe.readyFlag = true;
            logger.log('info', `your server is listening on port ${serverPort} http://${swaggerDoc.host}`);
            logger.log('info', `Swagger-ui is available on http://${swaggerDoc.host}/docs`);
        });
    } catch (error) {
        probe.readyFlag = false;
        probe.liveFlag = false;
        logger.log('error', `cannot start server ${error}`);
        probe.addError(error);
    }
})();
