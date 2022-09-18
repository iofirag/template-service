const container = require("../containerConfig");

const example1Service = container.resolve("example1Service");

module.exports = {
    addExample: example1Service.addExample.bind(example1Service)
};