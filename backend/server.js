require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { driver } = require('./connection');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes for local development
app.use('/', routes);

app.listen(PORT, async () => {
  try {
    await driver.verifyConnectivity();
    console.log('Connected to Neo4j database successfully.');
  } catch (error) {
    console.error('Error connecting to Neo4j:', error);
  }
  console.log(`Server is running on port ${PORT}`);
});
