const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { createConnection } = require('mysql2/promise');

dotenv.config();
// Allow requests from all origins
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
(async () => {
  // Connect to the MySQL database
  const connection = await createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  // Middleware for parsing JSON data
  app.use(express.json());

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

      // Insert the task into the database
      const query = 'INSERT INTO tasks (title, description, dueDate) VALUES (?, ?, ?)';
      const values = [title, description, dueDate];
      await connection.query(query, values);

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
      // Get all tasks from the database
      const [tasks] = await connection.query('SELECT * FROM tasks');
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
      const [task] = await connection.query('SELECT * FROM tasks WHERE id = ?', [id]);

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

      // Update the task in the database
      const id = req.params.id;
      const query = 'UPDATE tasks SET title = ?, description = ?, dueDate = ? WHERE id = ?';
      const values = [title, description, dueDate, id];
      const [result] = await connection.query(query, values);

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
      // Delete the task from the database
      const id = req.params.id;
      const query = 'DELETE FROM tasks WHERE id = ?';
      const values = [id];
      const [result] = await connection.query(query, values);
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