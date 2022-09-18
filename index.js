const express = require('express');
const fs = require('fs');
const jsyaml = require('js-yaml');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const oasTools = require('@oas-tools/core');
const container = require('./containerConfig');

const app = express();

(async () => {
    const serviceData = container.resolve('serviceData');
    const serverConfig = container.resolve('serverConfig');
    const serverPort = serverConfig ? serverConfig.port : 3000;
    const logger = container.resolve('logger');
    const probe = container.resolve('probe');
    const source = container.resolve('source');

    logger.log('info', serviceData);
    logger.log('info', source);

    try {
        // await container.resolve('example1Archive').configure();

        const config = {
            oasFile: 'api/oas.yaml',
            middleware: {
                router: {
                    controllers: './controllers',
                }
            }
        }
        // swaggerUi: '/swagger.json',
        // controllers: './controllers',
        // useStabs: process.env.NODE_ENV === 'development', // Conditionally turn on stubs (mock mode)
        // const spec = fs.readFileSync('./api/oas.yaml', 'utf8');
        // const swaggerDoc = jsyaml.load(spec);

        app.use(cors());
        app.use(cookieParser());
        app.use(morgan('combined'));
        app.use(express.json({ limit: '50mb' })); // for parsing application/json
        app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

        oasTools.initialize(app, config).then(() => {
            app.createServer(app).listen(serverPort, () => console.log("Server started!"));
        });

        // oasTools.initialize(app, async (middleware) => {
        //     // Interpret Swagger resouces and attach metadata to  request - must he first in swagger tools middleware chain
        //     app.use(middleware.swaggerMetadata());
        //     // app.use(morgan('combined'));

        //     // validate swagger requests
        //     app.use(middleware.swaggerValidator());

        //     // CORT!!! and OPTIONS handler
        //     app.use((req, res, next) => {
        //         res.setHeader('Access-Control-Allow-Origin', '*');
        //         res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        //         res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, UseCamelCase, x-clientid, Authorization');
        //         if (req.method === 'OPTIONS') {
        //             res.statusCode = 200;
        //             res.end();
        //         } else {
        //             next();
        //         }
        //     });

        //     // Route validated requests to appropriate controller
        //     app.use(middleware.swaggerRouter(options));

        //     // Serve the swagger documents and swagger ui
        //     app.use(
        //         middleware.swaggerUi({
        //             apiDocs: `${parsedURL.path}${serviceData.name}/api-docs`,
        //             swaggerUi: '/docs',
        //         })
        //     );

        //     // Start the server
        //     await probe.start(app, serverPort);
        //     probe.readyFlag = true;
        //     logger.log('info', `your server is listening on port ${serverPort} http://${swaggerDoc.host}`);
        //     logger.log('info', `Swagger-ui is available on http://${swaggerDoc.host}/docs`);
        // });
    } catch (error) {
        probe.readyFlag = false;
        probe.liveFlag = false;
        logger.log('error', `cannot start server ${error}`);
        probe.addError(error);
    }
})();

// const cors = require('cors');
// const morgan = require('morgan');
// const oasTools = require('oas3-tools');
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const container = require('./containerConfig');

// (async () => {
//     const source = container.resolve('source');
//     const serviceData = container.resolve('serviceData');
//     const serverConfig = container.resolve('serverConfig');
//     const swaggerConfig = container.resolve('swaggerConfig');
//     const logger = container.resolve('logger');
//     const probe = container.resolve('probe');
//     logger.log('info', serviceData);
//     logger.log('info', source);

//     try {
//         const serverPort = serverConfig ? serverConfig.port : 3088;
//         const serverHost = process.env.NODE_ENV ? serviceData.name : `localhost${serverPort}`;
//         const oasOptions = {
//             routing: {
//                 controllers: './controllers',
//             },
//             ...swaggerConfig,
//         };
//         const { app } = oasTools.expressAppConfig('./api/oas.yaml', oasOptions);
//         app.use(cors());
//         app.use(cookieParser());
//         app.use(bodyParser.json({ limit: '50mb' }));
//         app.use(morgan('combined'));
//         app.use((req, res, next) => {
//             res.setHeader('Access-Control-Allow-Origin', '*');
//             res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//             res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, UseCamelCase, x-clientid, Authorization');
//             if (req.method === 'OPTIONS') {
//                 res.statusCode = 200;
//                 res.end();
//             } else {
//                 next();
//             }
//             // Check for token here (optional)
//         });

//         // Start the server
//         await probe.start(app, serverPort);
//         probe.readyFlag = true;
//         logger.log('info', `Your server is lis`);
//         logger.log('info', `your server is listening on port ${serverPort} at http://${serverHost}`);
//         logger.log('info', `Swagger-ui is available on http://${serverHost}/docs`);
//     } catch (error) {
//         probe.readyFlag = false;
//         probe.liveFlag = false;
//         logger.log('error', `cannot start server ${error}`);
//         probe.addError(error);
//     }
// })();
