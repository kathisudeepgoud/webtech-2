const { getSession } = require('./connection');

const createConnection = async (fromName, toName) => {
  const session = getSession();
  try {
    const query = `
      MATCH (a:User), (b:User)
      WHERE toLower(a.name) = toLower($fromName) AND toLower(b.name) = toLower($toName)
      MERGE (a)-[r:FRIENDS_WITH]->(b)
      RETURN r
    `;
    const result = await session.run(query, { fromName, toName });
    if (result.records.length === 0) {
      throw new Error('One or both users not found, or connection could not be created');
    }
    return result.records[0].get('r');
  } finally {
    await session.close();
  }
};

const getGraph = async () => {
  const session = getSession();
  try {
    // Fetch all users
    const userResult = await session.run('MATCH (u:User) RETURN u');
    const nodes = userResult.records.map(record => record.get('u').properties);

    // Fetch all relationships
    const relResult = await session.run('MATCH (a)-[r:FRIENDS_WITH]->(b) RETURN a.id as source, b.id as target, type(r) as label');
    const edges = relResult.records.map(record => ({
      source: record.get('source'),
      target: record.get('target'),
      label: record.get('label')
    }));

    return { nodes, edges };
  } finally {
    await session.close();
  }
};

module.exports = {
  createConnection,
  getGraph
};
