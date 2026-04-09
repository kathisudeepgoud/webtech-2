require('dotenv').config();
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const routes = require('./routes');
const { driver } = require('./connection');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes for local and direct access
app.use('/', routes); 
// Routes prefixed for Netlify redirects
app.use('/.netlify/functions/server', routes);

// Only listen locally if run directly
if (require.main === module) {
  app.listen(PORT, async () => {
    try {
      await driver.verifyConnectivity();
      console.log('Connected to Neo4j database successfully.');
    } catch (error) {
      console.error('Error connecting to Neo4j:', error);
    }
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export handler for Netlify
module.exports.handler = serverless(app);
