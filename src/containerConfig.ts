import * as config from 'config'
import { Container } from "inversify";
import path from 'path';
import { TYPES } from "./containerTypes";
import Example1Data from "./features/example1/example1Data";
import Example1Logic from "./features/example1/example1Logic";
import Example1Service from "./features/example1/example1Service";

// const HttpService = require('./services/httpService');
// const Logger = require('./services/loggerService');
// const Tracer = require("./services/tracerService");
// const Probe = require("./services/probeService");
// const pkgJson = require("./package.json");

// const RabbitMqService = require("./services/rabbitmqService");
// const ArchiveService = require("./services/archiveService");

console.log(config.type)
export const container: Container = new Container();
container.bind<Example1Service>(TYPES.Example1Service).to(Example1Service).inSingletonScope();
container.bind<Example1Logic>(TYPES.Example1Logic).to(Example1Logic).inSingletonScope();
container.bind<Example1Data>(TYPES.Example1Data).to(Example1Data).inSingletonScope();
// Values
config.api.middleware.router.controllers = path.join(__dirname, config.api.middleware.router.controllers) // fix controller path
container.bind<any>(TYPES.ApiConfig).toConstantValue(config.api);


// container.register({
//     source: Awilix.asValue(config.get("source")),
//     loggerConfig: Awilix.asValue(config.get('log')),
//     swaggerConfig: Awilix.asValue(config.get("swagger")),
//     serverConfig: Awilix.asValue(config.get('server')),
//     serviceData: Awilix.asValue({
//         name: pkgJson.name,
//         component: pkgJson.name,
//         version: pkgJson.version
//     }),
//     // Classes
//     example1Service: Awilix.asClass(Example1Service).singleton(),
//     example1Logic: Awilix.asClass(Example1Logic).singleton(),
//     example1Data: Awilix.asClass(Example1Data).inject(() => ({ archiveConfig: config.get('archive') })).singleton(),
//     // Vendor classes
//     archiveService: Awilix.asClass(ArchiveService).inject(() => ({ config: config.get('archive') })).singleton(),
//     queueService: Awilix.asClass(RabbitMqService).inject(() => ({ config: config.get('queue') })).singleton(),
//     httpService: Awilix.asClass(HttpService).inject(() => ({ config: config.get('http') })).singleton(),
//     logger: Awilix.asClass(Logger).inject(() => ({ config: config.get('log') })).singleton(),
//     probe: Awilix.asClass(Probe).inject(() => ({ config: config.get('probe') })).singleton(),
//     tracer: Awilix.asClass(Tracer).inject(() => ({ config: config.get('tracer') })).singleton(),
// });

// module.exports = container;