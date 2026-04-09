const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const routes = require('../backend/routes');
// We require the connection to ensure driver is initialized
const { driver } = require('../backend/connection'); 

const app = express();
app.use(cors());
app.use(express.json());

// For Netlify, the proxy brings requests here with path starting from root, 
// usually stripped down to the splat, depending on `serverless-http` config.
// Since we redirect `/api/*` to `/.netlify/functions/api/:splat`, the router 
// receives `/.netlify/functions/api/...`. Let's mount routes on both just in case.
app.use('/.netlify/functions/api', routes);
app.use('/api', routes);
app.use('/', routes);

module.exports.handler = serverless(app);
