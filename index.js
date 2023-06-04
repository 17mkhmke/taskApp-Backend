const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { createPool } = require('mysql2/promise');

dotenv.config();

(async () => {
  // Create a MySQL connection pool
  const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 10, // Adjust the limit as per your requirement
  });

  // Middleware for parsing JSON data
  app.use(express.json());

  // Allow requests from all origins
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // Create a new task
  app.post('/tasks', async (req, res) => {
    try {
      // Validate the request body
      const { title, description, dueDate } = req.body;

      // Create a new task in the database
      const task = {
        title,
        description,
        dueDate,
      };

      // Get a connection from the pool
      const connection = await pool.getConnection();

      // Insert the task into the database
      const query = 'INSERT INTO tasks (title, description, dueDate) VALUES (?, ?, ?)';
      const values = [title, description, dueDate];
      await connection.query(query, values);

      // Release the connection back to the pool
      connection.release();

      res.status(201).send({
        message: 'Task created successfully',
        task,
      });
    } catch (err) {
      console.error('Error creating task:', err);
      res.sendStatus(500);
    }
  });

  // Get all tasks
  app.get('/tasks', async (req, res) => {
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();

      // Get all tasks from the database
      const query = 'SELECT * FROM tasks';
      const [tasks] = await connection.query(query);

      // Release the connection back to the pool
      connection.release();

      res.status(200).send(tasks);
    } catch (err) {
      console.error('Error getting tasks:', err);
      res.sendStatus(500);
    }
  });

  // Get a single task
  app.get('/tasks/:id', async (req, res) => {
    try {
      // Get the task from the database
      const id = req.params.id;

      // Get a connection from the pool
      const connection = await pool.getConnection();

      const query = 'SELECT * FROM tasks WHERE id = ?';
      const [task] = await connection.query(query, [id]);

      // Release the connection back to the pool
      connection.release();

      if (task.length === 0) {
        res.sendStatus(404);
      } else {
        res.status(200).send(task[0]);
      }
    } catch (err) {
      console.error('Error getting task:', err);
      res.sendStatus(500);
    }
  });
  // Update a task
  app.put('/tasks/:id', async (req, res) => {
    try {
      // Validate the request body
      const { title, description, dueDate } = req.body;
      const id = req.params.id;

      // Get a connection from the pool
      const connection = await pool.getConnection();

      // Update the task in the database
      const query = 'UPDATE tasks SET title = ?, description = ?, dueDate = ? WHERE id = ?';
      const values = [title, description, dueDate, id];
      const [result] = await connection.query(query, values);

      // Release the connection back to the pool
      connection.release();

      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(200);
      }
    } catch (err) {
      console.error('Error updating task:', err);
      res.sendStatus(500);
    }
  });

  // Delete a task
  app.delete('/tasks/:id', async (req, res) => {
    try {
      // Get the task ID
      const id = req.params.id;

      // Get a connection from the pool
      const connection = await pool.getConnection();

      // Delete the task from the database
      const query = 'DELETE FROM tasks WHERE id = ?';
      const [result] = await connection.query(query, [id]);

      // Release the connection back to the pool
      connection.release();

      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(200);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      res.sendStatus(500);
    }
  });

  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();
