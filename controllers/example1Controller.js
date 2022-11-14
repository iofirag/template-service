const container = require('../containerConfig');

const example1Service = container.resolve('example1Service');

module.exports.addExample = example1Service.addExample.bind(example1Service);

// module.exports = {
//     addExample: example1Service.addExample.bind(example1Service),
// };

// module.exports.addExample = (req, res) => {
//     const params = res.locals.oas?.params;
//     const body = res.locals.oas?.body;
//     const files = res.locals.oas?.files;
//     /* Perform some operation, like saving to a database */
//     res.status(200).json({ code: 591 });
// };
