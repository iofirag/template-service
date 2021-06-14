//const container = ContainerConfig.getInstance();

module.exports.exampleController = (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'example response :)' }));
};