const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:' || window.location.hostname === '';
const API_BASE_URL = isLocal ? 'http://localhost:3000' : '/api';

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

const updateAnalytics = (displayNodes, displayEdges) => {
  try {
    const totalUsers = displayNodes.length;
    const totalConnections = displayEdges.length;
    
    const degreeMap = {};
    displayNodes.forEach(n => degreeMap[n.id] = 0);
    
    displayEdges.forEach(e => {
      if (degreeMap[e.source] !== undefined) degreeMap[e.source]++;
      if (degreeMap[e.target] !== undefined) degreeMap[e.target]++;
    });
    
    let maxDegree = -1;
    let mostConnectedUser = 'None';
    
    displayNodes.forEach(n => {
      if (degreeMap[n.id] > maxDegree && degreeMap[n.id] > 0) {
        maxDegree = degreeMap[n.id];
        mostConnectedUser = n.name;
      }
    });

    const averageConnections = totalUsers > 0 ? (totalConnections / totalUsers).toFixed(1) : 0;
    
    const elTotalUsers = document.getElementById('analytics-total-users');
    const elTotalConnections = document.getElementById('analytics-total-connections');
    const elMostConnected = document.getElementById('analytics-most-connected');
    const elAvgConnections = document.getElementById('analytics-avg-connections');
    
    if (elTotalUsers) elTotalUsers.textContent = totalUsers;
    if (elTotalConnections) elTotalConnections.textContent = totalConnections;
    if (elMostConnected) elMostConnected.textContent = mostConnectedUser;
    if (elAvgConnections) elAvgConnections.textContent = averageConnections;
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
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

    const toggleBtn = document.getElementById('toggle-users-btn');
    if (toggleBtn) {
      if (showSessionOnly) {
         toggleBtn.textContent = 'Show All Users';
      } else {
         toggleBtn.textContent = 'Hide Previous Users (Session Only)';
      }
    }

    const dbCountEl = document.getElementById('db-count');
    const sessionCountEl = document.getElementById('session-count');
    if (dbCountEl && sessionCountEl) {
      dbCountEl.textContent = data.nodes.length;
      sessionCountEl.textContent = data.nodes.filter(n => sessionUsers.includes(n.id)).length;
    }

    let displayEdges = data.edges;
    if (showSessionOnly) {
      displayEdges = displayEdges.filter(e => displayNodeIds.has(e.source) && displayNodeIds.has(e.target));
    }

    const nodes = new vis.DataSet(
      displayNodes.map(n => {
        const interestLabel = n.interest ? `\nInterest: ${n.interest}` : '';
        return {
          id: n.id,
          label: `${n.name}\n(Age: ${n.age || '?'})${interestLabel}`,
          title: n.name,
          color: {
            background: '#ffffff', // white bubble
            border: '#6366f1',     // indigo border
            highlight: { background: '#e0e7ff', border: '#4f46e5' }
          },
          font: { color: '#0f172a', face: 'Outfit' },
          shape: 'box',
          margin: 10
        };
      })
    );

    const edges = new vis.DataSet(
      displayEdges.map(e => ({
        from: e.source,
        to: e.target,
        arrows: 'to',
        color: { color: '#94a3b8', highlight: '#6366f1' },
        smooth: { type: 'continuous' }
      }))
    );

    const container = document.getElementById('network-graph');
    const networkData = { nodes, edges };
    const options = {
      layout: {
        improvedLayout: true
      },
      physics: {
        stabilization: {
          enabled: true,
          iterations: 150,
          fit: true
        },
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
    
    // Automatically center and scale the graph after stabilization
    network.once('stabilizationIterationsDone', function () {
      network.fit({
        animation: {
          duration: 800,
          easingFunction: 'easeInOutQuad'
        }
      });
    });

    // Make the graph responsive to window resizing
    window.addEventListener('resize', () => {
      if (network) {
        network.fit();
      }
    });

    updateAnalytics(displayNodes, displayEdges);
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
  const interestInput = document.getElementById('userInterest').value.trim();
  const interest = interestInput.length > 0 ? interestInput : null;

  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age, interest })
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

// Update User
const updateForm = document.getElementById('update-user-form');
if (updateForm) {
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('updateName').value.trim();
    const age = document.getElementById('updateAge').value.trim();
    const interestInput = document.getElementById('updateInterest').value.trim();
    const interest = interestInput.length > 0 ? interestInput : null;

    try {
      const res = await fetch(`${API_BASE_URL}/users/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age, interest })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      
      showMessage(`User ${name} updated successfully!`);
      e.target.reset();
      fetchAndRenderGraph();
    } catch (error) {
      showMessage(error.message, true);
    }
  });
}

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
      e.target.style.backgroundColor = showSessionOnly ? 'var(--danger-color)' : 'var(--accent-color)';
      fetchAndRenderGraph();
    });
  }
});
