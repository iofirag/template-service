const container = require("../containerConfig");

const example1Service = container.resolve("example1Service");

module.exports.addExample = (req, res, next) => {
    example1Service.addExample(req, res);
};