# Social Network Explorer

A full-stack web application designed to visually explore and manage connections between people in a social network. The platform features an interactive graphical interface to visualize relationships seamlessly, backed by a robust graph database. 

## 🚀 Features

- **Interactive Graph Visualization**: Uses `vis-network` to render visually appealing, physics-based network graphs that users can interact with (zoom, pan, drag nodes).
- **User Management**:
  - **Add User**: Create new user profiles by specifying a Name and Age.
  - **Delete User**: Easily remove users by Name from the network completely.
- **Connection Management**: Create direct line-of-link connections (edges) between users to represent their social relationships.
- **Session Context Toggle**: Easily toggle between viewing the entire historical database of users or strictly filtering the graph down to users you've added in the current session.
- **Real-time Statistics**: Keep track of the total number of users within the database versus users in your active session.
- **Serverless Architecture Ready**: Pre-configured structure optimized for deployment as serverless endpoints via Netlify Functions.
- **Responsive Dark UI**: A dynamic, glassmorphic dark theme constructed with vanilla CSS, maintaining strong aesthetics across devices.

## 🛠 Tech Stack

### Frontend
- **HTML5 & Vanilla CSS3**: Custom CSS variables, grid, and flexbox for a highly responsive dark-mode UI.
- **Vanilla JavaScript**: Fetch API for backend communication, DOM manipulation, session storage.
- **vis-network**: Third-party JavaScript library for rendering dynamic, physics-based interactive graph data.
- **Fonts**: Google Fonts ('Outfit').

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated web framework for building the REST APIs.
- **Serverless-HTTP**: Wrapper to allow the Express application to run seamlessly within a serverless ecosystem (AWS Lambda / Netlify Functions).

### Database
- **Neo4j AuraDB**: Fully managed cloud graph database perfectly suited for relationship-heavy data.
- **neo4j-driver**: Official database driver to communicate with the Aura DB via the Cypher query language.

## 📁 Project Structure

```text
.
├── backend/
│   ├── connection.js       # Neo4j driver initialization
│   ├── routes.js           # Express API endpoints mapping
│   ├── server.js           # Local development Express server
│   ├── userModel.js        # Logic for writing/reading nodes/edges to Neo4j
│   └── networkService.js   # Service functions assisting with route logic
├── frontend/
│   ├── index.html          # Main application page layout and styling
│   └── app.js              # Frontend logic and vis.js graph rendering
├── functions/
│   └── api.js              # Serverless entry point for Netlify deployment
├── netlify.toml            # Build settings and API route redirects for Netlify
└── package.json            # Node configuration and dependencies
```

## ⚙️ Local Development Setup

To run this application locally, ensure you have **Node.js** installed. 

### 1. Clone & Install
Clone the codebase and install dependencies:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file inside the `backend/` directory. Within this file, provide your Neo4j database credentials:
```env
NEO4J_URI=neo4j+s://<YOUR_DB_ID>.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=<YOUR_SECURE_PASSWORD>
```

*(Note: In the live Netlify environment, these are set within Netlify's Environment variable dashboard).*

### 3. Start the Local Server
Run the start script to launch the local Node server:
```bash
npm start
```
The console will inform you the server is running on `http://localhost:3000`. You can now open index.html locally or navigate through your local server if configured to serve static files. 

## ☁️ Deployment

This application is configured for deployment on **Netlify**.
- **netlify.toml**: Instructs Netlify to use `/frontend` as the publish directory and the `/functions` folder for serverless backend logic.
- An automatic rewrite redirects all `/api/*` requests optimally to `/.netlify/functions/api/:splat` routing requests directly into the Express.js endpoints configured in `functions/api.js`.

To deploy via Netlify CLI:
```bash
npx netlify deploy --prod
```
Ensure you have configured your environment variables in your Netlify site settings.
