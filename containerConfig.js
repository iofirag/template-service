const Awilix = require("awilix");
const config = require("config");
const Logger = require('./services/loggerService');
const Probe = require("./services/probeService");
const Tracer = require("./services/tracerService");
const pkgJson = require("./package.json");

const RabbitMqService = require("./services/rabbitmqService");
const ArchiveService = require("./services/archiveService");

const Example1Service = require("./features/example1/example1Service");
const Example1Handler = require("./features/example1/example1Handler");
const Example1Archive = require("./features/example1/example1Archive");

const container = Awilix.createContainer({
    injectionMode: Awilix.InjectionMode.CLASSIC,
});
container.register({
    // Values
    test: Awilix.asValue(config.get("test")),
    loggerConfig: Awilix.asValue(config.get('log')),
    swaggerConfig: Awilix.asValue(config.get("swagger")),
    serverConfig: Awilix.asValue(config.get('server')),
    probeConfig: Awilix.asValue(config.get('probe')),
    tracerConfig: Awilix.asValue(config.get('tracer')),
    archiveConfig: Awilix.asValue(config.get('archive')),
    serviceData: Awilix.asValue({
        name: pkgJson.name,
        component: pkgJson.name,
        version: pkgJson.version,
        ts: Date.now()
    }),
    // Classes
    example1Service: Awilix.asClass(Example1Service),
    example1Handler: Awilix.asClass(Example1Handler),
    example1Archive: Awilix.asClass(Example1Archive).singleton(),
    // Vendor classes
    archiveService: Awilix.asClass(ArchiveService).singleton(),
    queueService: Awilix.asClass(RabbitMqService).singleton(),
    logger: Awilix.asClass(Logger).singleton(),
    probe: Awilix.asClass(Probe).singleton(),
    tracer: Awilix.asClass(Tracer).singleton(),
});

module.exports = container;