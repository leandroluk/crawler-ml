const { App } = require('./app');

const port = process.env.PORT;

App.new({ port }).catch((err) => console.error(err));
