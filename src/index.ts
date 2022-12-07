import express from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import oasTools from '@oas-tools/core'
import { container } from "./containerConfig";
import { TYPES } from './containerTypes';
import path from 'path';

const app: express.Application = express();

(async () => {
    const apiConfig = container.get<any>(TYPES.ApiConfig);
    // const example1Service = container.get<any>(TYPES.Example1Service);

    // const serviceData = container.resolve('serviceData');
    // const serverConfig = container.resolve('serverConfig');
    // const serverPort = serverConfig ? serverConfig.port : 3000;
    // const logger = container.resolve('logger');
    // const probe = container.resolve('probe');
    // const source = container.resolve('source');
    const apiSpec = yaml.load(fs.readFileSync(apiConfig.oasFile, 'utf8'));
    // logger.log('info', serviceData);
    // logger.log('info', source);

    try {
    //     // await container.resolve('example1Archive').configure();

        app.use(cors());
        app.use(cookieParser());
        app.use(morgan('combined'));
        app.use(express.json({ limit: '50mb' }));
        app.use(express.urlencoded({ extended: true }));
        
        // Serve file
        app.get('/api-doc', (req: any, res: any) => res.json(apiSpec));
        // app.use('/api-doc/api/v1', express.static(apiConfig.oasFile))
        // app.get('/api-doc', (req: any, res: any) => JSON.stringify(fs.readFileSync(apiConfig.oasFile, 'utf8')));

        // serve api + ui
        await oasTools.initialize(app, apiConfig);
    // Start the server
    app.listen(3001, ()=> {
        console.log('server listening on http://localhost:3001')
    })
    //     await probe.start(app, serverPort);
    //     probe.readyFlag = true;
    //     logger.log(
    //         'info',
    //         `your server is listening on http://localhost:${serverPort} 
    //     Swagger-ui API is available on http://localhost:${serverPort}/docs 
    //     Swagger-ui API-DOC is available on http://localhost:${serverPort}/api-docs`
    //     );
    } catch (error) {
        console.error(error)
    //     probe.readyFlag = false;
    //     probe.liveFlag = false;
    //     logger.log('error', `cannot start server ${error}`);
    //     probe.addError(error);
    }
})();
