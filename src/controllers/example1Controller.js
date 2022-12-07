const { container } = require('../containerConfig.ts');
const { TYPES } = require('../containerTypes.ts');

const example1Service = container.get(TYPES.Example1Service);

module.exports = {
    addExample: example1Service.addExample.bind(example1Service),
};