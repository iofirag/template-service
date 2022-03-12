const container = require("../containerConfig");

const example1Service = container.resolve("example1Service");

exports.addExample = example1Service.addExample.bind(example1Service);