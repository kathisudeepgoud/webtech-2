const API_BASE_URL = 'http://localhost:3000';

let network = null;
let showSessionOnly = false;
let sessionUsers = JSON.parse(sessionStorage.getItem('sessionUsers') || '[]');

const showMessage = (msg, isError = false) => {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = msg;
  statusEl.className = `status-message ${isError ? 'error' : 'success'}`;
  setTimeout(() => {
    statusEl.className = 'status-message';
    statusEl.textContent = '';
  }, 5000);
};

const fetchAndRenderGraph = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/network/graph`);
    if (!res.ok) throw new Error('Failed to fetch graph data');
    const data = await res.json();

    let displayNodes = data.nodes;
    if (showSessionOnly) {
      displayNodes = displayNodes.filter(n => sessionUsers.includes(n.id));
    }
    const displayNodeIds = new Set(displayNodes.map(n => n.id));

    let displayEdges = data.edges;
    if (showSessionOnly) {
      displayEdges = displayEdges.filter(e => displayNodeIds.has(e.source) && displayNodeIds.has(e.target));
    }

    const nodes = new vis.DataSet(
      displayNodes.map(n => ({
        id: n.id,
        label: `${n.name}\n(Age: ${n.age || '?'})`,
        title: n.name,
        color: {
          background: '#1f2937', // dark bubble
          border: '#3b82f6',     // blue border
          highlight: { background: '#2563eb', border: '#60a5fa' }
        },
        font: { color: '#ffffff', face: 'Outfit' },
        shape: 'box',
        margin: 10
      }))
    );

    const edges = new vis.DataSet(
      displayEdges.map(e => ({
        from: e.source,
        to: e.target,
        arrows: 'to',
        color: { color: '#9ca3af', highlight: '#3b82f6' },
        smooth: { type: 'continuous' }
      }))
    );

    const container = document.getElementById('network-graph');
    const networkData = { nodes, edges };
    const options = {
      physics: {
        stabilization: false,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200
      }
    };

    if (network) {
      network.destroy();
    }
    network = new vis.Network(container, networkData, options);
  } catch (error) {
    console.error(error);
    showMessage('Error loading graph: ' + error.message, true);
  }
};

// Add User
document.getElementById('add-user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('userName').value.trim();
  const age = document.getElementById('userAge').value.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    
    if (data.id) {
       sessionUsers.push(data.id);
       sessionStorage.setItem('sessionUsers', JSON.stringify(sessionUsers));
    }
    
    showMessage(`User ${data.name} created successfully!`);
    e.target.reset();
    fetchAndRenderGraph();
  } catch (error) {
    showMessage(error.message, true);
  }
});

// Delete User
document.getElementById('delete-user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('deleteName').value.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/users/name/${encodeURIComponent(name)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    
    showMessage(data.message || `User deleted successfully!`);
    e.target.reset();
    fetchAndRenderGraph();
  } catch (error) {
    showMessage(error.message, true);
  }
});

// Connect Users
document.getElementById('connect-users-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fromName = document.getElementById('fromUser').value.trim();
  const toName = document.getElementById('toUser').value.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/network/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromName, toName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to connect users');
    
    showMessage(`Successfully connected ${fromName} to ${toName}!`);
    e.target.reset();
    fetchAndRenderGraph();
  } catch (error) {
    showMessage(error.message, true);
  }
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderGraph();

  const toggleBtn = document.getElementById('toggle-users-btn');
  if(toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      showSessionOnly = !showSessionOnly;
      e.target.textContent = showSessionOnly ? 'Show All Users' : 'Hide Previous Users (Session Only)';
      e.target.style.backgroundColor = showSessionOnly ? '#f85149' : '#8b949e';
      fetchAndRenderGraph();
    });
  }
});
