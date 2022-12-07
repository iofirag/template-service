module.exports.testFunction = async function (req, res, next) {
    res.statusCode = 200;
    return res.end(JSON.stringify({ aa: 22 }));
};

// module.exports = {
//     addExample: example1Service.addExample.bind(example1Service),
// };

// export const testFunction = async (req, res, next) => {
//     res.statusCode = 200;
//     return res.end(JSON.stringify({ aa: 22 }));
// };

// export async function testFunction(req, res, next) {
//     res.statusCode = 200;
//     return res.end(JSON.stringify({ aa: 23 }));
// }
