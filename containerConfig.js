const Awilix = require("awilix");
const pkgJson = require("./package.json");

module.exports = class ContainerConfig {
    static async getInstance() {
        if (!this.container) {
            await this.init();
        }
        return this.container;
    }

    static async init() {
        // load config file dependent on environment var NODE_ENV (dev/prod) using 'config' package
        // execute config.utils.loadFileConfigs() for fix wrong config path
        // or using conditional import
        // eslint-disable-next-line global-require
        const config = require("config");

        this.container = Awilix.createContainer({
            injectionMode: Awilix.InjectionMode.CLASSIC,
        });

        this.container.register({
            service: Awilix.asValue({
                name: pkgJson.name,
                version: pkgJson.version,
            }),
            test: Awilix.asValue(config.get("test")),
        });
    }
};
