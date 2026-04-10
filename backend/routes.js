const express = require('express');
const { createUser, deleteUser, updateUser } = require('./userModel');
const { createConnection, getGraph, getAnalytics } = require('./networkService');

const router = express.Router();

router.post('/users', async (req, res) => {
  try {
    const { name, age, interest } = req.body;
    if (!name || age === undefined) {
      return res.status(400).json({ error: 'Name and age are required' });
    }
    const user = await createUser(name, age, interest);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/update', async (req, res) => {
  try {
    const { name, age, interest } = req.body;
    if (!name || age === undefined) {
      return res.status(400).json({ error: 'Name and age are required' });
    }
    const user = await updateUser(name, age, interest);
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const user = await deleteUser(name);
    res.status(200).json({ message: 'User deleted successfully', user });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post('/network/connect', async (req, res) => {
  try {
    const { fromName, toName } = req.body;
    if (!fromName || !toName) {
      return res.status(400).json({ error: 'fromName and toName are required' });
    }
    const connection = await createConnection(fromName, toName);
    res.status(201).json({ message: 'Connection created', connection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/network/graph', async (req, res) => {
  try {
    const graph = await getGraph();
    res.status(200).json(graph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/network/analytics', async (req, res) => {
  try {
    const data = await getAnalytics();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
