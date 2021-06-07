// const app = require("express");
// const url = require("url");
const ConfigCreatorService = require("./services/configCreatorService");
const ContainerConfig = require("./containerConfig");

(async () => {
    try {
        console.log("NODE_ENV=", process.env.NODE_ENV);
        // build config file using template (etcd keys & default values)
        const configCreatorService = new ConfigCreatorService();
        await configCreatorService.init();

        // build dependency injection using configs
        const container = await ContainerConfig.getInstance();
        const testData = container.resolve("test");
        console.log(testData);
    } catch (error) {
        console.error(error);
    }
})();
