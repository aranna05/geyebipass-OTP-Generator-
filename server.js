// Import Express web framework to build server endpoints
import express from 'express';
// Import CORS middleware to enable cross-origin requests from the React frontend
import cors from 'cors';
// Import dotenv library to load environment variables from the local .env file
import dotenv from 'dotenv';
// Import mysql2 promise module to run asynchronous database queries
import mysql from 'mysql2/promise';
// Import v4 function from uuid library to generate unique secret tokens
import { v4 as uuidv4 } from 'uuid';

// Initialize environment variables from .env file into process.env object
dotenv.config();

// Create an Express application instance to handle incoming HTTP requests
const app = express();

// Apply CORS middleware allowing browser clients to access this API
app.use(cors());

// Apply JSON body parser middleware so incoming request JSON payloads are available on req.body
app.use(express.json());

// Create a reusable MySQL connection pool using configured environment credentials
const db = mysql.createPool({
  // Specify MySQL database host address from environment variable or default to localhost
  host: process.env.DB_HOST || 'localhost',
  // Specify MySQL user account from environment variable or default to root
  user: process.env.DB_USER || 'root',
  // Specify MySQL password from environment variable or default to empty string
  password: process.env.DB_PASSWORD || '',
  // Specify database name from environment variable or default to gayebi_pass
  database: process.env.DB_NAME || 'gayebi_pass',
  // Specify MySQL port number from environment variable or default to standard 3306
  port: Number(process.env.DB_PORT) || 3306
});

// Define POST route to create and store a new encrypted/sensitive secret in database
app.post('/api/secrets', async (req, res) => {
  // Extract secret_text property submitted inside the JSON request body
  const { secret_text } = req.body;
  // Check if secret_text is missing or empty, returning 400 Bad Request if true
  if (!secret_text) return res.status(400).json({ error: 'Secret text is required' });
  // Generate a random unique UUID identifier for referencing this secret link
  const id = uuidv4();
  // Execute SQL INSERT query to persist secret ID and text into secrets table
  await db.query('INSERT INTO secrets (id, secret_text) VALUES (?, ?)', [id, secret_text]);
  // Send 201 Created HTTP status with JSON object containing the newly created secret ID
  res.status(201).json({ id });
});

// Define GET route to retrieve a secret by ID and immediately vanish it from database
app.get('/api/secrets/:id', async (req, res) => {
  // Extract secret ID from the route URL parameters
  const { id } = req.params;
  // Execute SQL SELECT query to find matching secret row by ID
  const [rows] = await db.query('SELECT secret_text FROM secrets WHERE id = ?', [id]);
  // Check if no matching record was found in the database table
  if (rows.length === 0) return res.status(404).json({ error: 'Link expired or already vanished' });
  // Execute SQL DELETE query immediately to permanently remove secret record from database
  await db.query('DELETE FROM secrets WHERE id = ?', [id]);
  // Send back retrieved secret text in JSON response before it vanishes forever
  res.json({ secret_text: rows[0].secret_text });
});

// Define server port from process environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Start listening for incoming HTTP requests on the specified port number
app.listen(PORT, () => console.log(`Gayebi-Pass server running on port ${PORT}`));
