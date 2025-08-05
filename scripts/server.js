const createSimpleServer = require('./utils/server-utils');

const port = process.env.PORT || 3000;

createSimpleServer(port, './dist').start();
