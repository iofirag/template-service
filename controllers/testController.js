module.exports.testFunction = async function (req, res, next) {
    res.statusCode = 200;
    return res.end(JSON.stringify({ aa: 22 }));
};
