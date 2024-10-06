# Orrery Web App

## Description

**Orrery Web App** is a web application that simulates a 3D orrery (model of the solar system). The frontend is developed using JavaScript (React and Three.js) to handle the user interface and 3D visualization, while the backend, built with Node.js (Express), manages the server-side logic and API.

## Technologies Used

- **Frontend**: JavaScript (React, Three.js)
- **Backend**: Node.js (Express)
- **3D Visualization**: Three.js
- **Version Control**: Git

## Project Structure

The repository is organized as follows:

```bash
/Orrery-web-app
│
├── /frontend          # Frontend application (JavaScript)
│   ├── /src           # React source code
│   ├── /public        # Public assets
│   └── package.json   # Frontend dependencies
│
├── /backend           # Backend API (Node.js)
│   ├── /routes        # API route definitions
│   ├── /controllers   # Server logic
│   ├── server.js      # Express server configuration
│   └── package.json   # Backend dependencies
│
├── .gitignore         # Files to ignore in Git
├── README.md          # Project documentation
└── package.json       # Monorepo configuration (if using workspaces)
