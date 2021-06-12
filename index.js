const app = require("express")();
// const url = require("url");
const ContainerConfig = require("./containerConfig");

(async () => {
    const container = await ContainerConfig.getInstance();
    const logger = container.resolve("logger");
    const probe = container.resolve("probe");
    const serverConfig = container.resolve("serverConfig");
    // const testData = container.resolve("test");

    try {
        const serverPort = serverConfig ? serverConfig.port : 3008;
        await probe.start(app, serverPort);
        logger.log('info', `your server is listening on port ${serverPort} http://`);
        probe.readyFlag = true;
    } catch (error) {
        probe.readyFlag = false;
        probe.liveFlag = false;
        logger.log('error', `cannot start server ${error}`);
        probe.addError(error);
    }
})();
