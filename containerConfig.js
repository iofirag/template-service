const Awilix = require("awilix");
const ConfigCreatorService = require("./services/configCreatorService");
const { Logger } = require('./services/loggerService');
const probe = require("./services/probeService");
const pkgJson = require("./package.json");

module.exports = class ContainerConfig {
    static async getInstance() {
        if (!this.container) {
            await this.buildConfig();
            await this.init();
        }
        return this.container;
    }

    static async buildConfig() {
        if (process.env.NODE_ENV) {
            // integ / production
            // build config file from etcd using template.json (contains etcd keys & default values)
            // needs environment variable:
            // -ETCD_HOST
            // -ETCD_KEY_PREFIX
            const configCreatorService = new ConfigCreatorService();
            await configCreatorService.init();
        }
    }

    static async init() {
        // build dependency injection using configs
        const config = require("config");
        // load config file dependent on NODE_ENV environment value (''/dev/prod) using 'config' package
        // execute config.utils.loadFileConfigs() for fix wrong config path
        // or using conditional import
        // eslint-disable-next-line global-require

        this.container = Awilix.createContainer({
            injectionMode: Awilix.InjectionMode.CLASSIC,
        });

        this.container.register({
            test: Awilix.asValue(config.get("test")),
            loggerConfig: Awilix.asValue(config.get('log')),
            logger: Awilix.asClass(Logger),
            serviceData: Awilix.asValue({
                name: pkgJson.name,
                version: pkgJson.version,
                //component: pkgJson.component || pkgJson.name
            }),
            serverConfig: Awilix.asValue(config.get('server')),
            probeConfig: Awilix.asValue(config.get('probe')),
            probe: Awilix.asClass(probe)
        });
    }
};
