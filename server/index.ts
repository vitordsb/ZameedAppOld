
import express, { type Request, type Response } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { MySQLStorage } from "./mysql-storage";
import { SQLiteStorage } from "./sqlite-storage";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static("public"));

async function startServer() {
  let storage;
  
  try {
    // Try MySQL first
    console.log('🔄 Attempting to connect to MySQL...');
    storage = new MySQLStorage();
    await storage.getAllUsers(); // Test connection
    console.log('✅ MySQL connection successful');
  } catch (error) {
    console.log('❌ MySQL connection failed, falling back to SQLite');
    console.log('Error:', error.message);
    
    // Fallback to SQLite
    storage = new SQLiteStorage();
    console.log('✅ SQLite database initialized');
  }

  // Setup authentication
  setupAuth(app, storage);

  // Register API routes
  const server = await registerRoutes(app, storage);

  // Start server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Database: ${storage.constructor.name}`);
  });
}

startServer().catch(console.error);


