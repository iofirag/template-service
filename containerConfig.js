const Awilix = require("awilix");
const config = require("config");
const HttpService = require('./services/httpService');
const Logger = require('./services/loggerService');
const Tracer = require("./services/tracerService");
const Probe = require("./services/probeService");
const pkgJson = require("./package.json");

const RabbitMqService = require("./services/rabbitmqService");
const ArchiveService = require("./services/archiveService");

const Example1Service = require("./controllers/example1/example1Service");
const Example1Logic = require("./controllers/example1/example1Logic");
const Example1Data = require("./controllers/example1/example1Data");

const container = Awilix.createContainer({
    injectionMode: Awilix.InjectionMode.CLASSIC,
});
container.register({
    // Values
    source: Awilix.asValue(config.get("source")),
    swaggerConfig: Awilix.asValue(config.get("swagger")),
    serverConfig: Awilix.asValue(config.get('server')),
    serviceData: Awilix.asValue({
        name: pkgJson.name,
        component: pkgJson.name,
        version: pkgJson.version,
        ts: Date.now()
    }),
    // Classes
    example1Service: Awilix.asClass(Example1Service),
    example1Handler: Awilix.asClass(Example1Logic),
    example1Archive: Awilix.asClass(Example1Data).singleton(),
    // Vendor classes
    archiveService: Awilix.asClass(ArchiveService).singleton(),
    queueService: Awilix.asClass(RabbitMqService).singleton(),
    httpService: Awilix.asClass(HttpService).inject(() => ({ config: config.get('http') })).singleton(),
    logger: Awilix.asClass(Logger).inject(() => ({ config: config.get('log') })).singleton(),
    probe: Awilix.asClass(Probe).inject(() => ({ config: config.get('probe') })).singleton(),
    tracer: Awilix.asClass(Tracer).inject(() => ({ config: config.get('tracer') })).singleton(),
});

module.exports = container;