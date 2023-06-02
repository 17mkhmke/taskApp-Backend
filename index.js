const express = require('express');
const app = express();
const dotenv = require('dotenv');

// Connect to the MySQL database
const mysql = require('mysql');
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.use(express.json());

// Create a new task
app.post('/tasks', (req, res) => {
  // Validate the request body
  const { title, description, dueDate } = req.body;

  // Create a new task in the database
  const task = {
    title,
    description,
    dueDate,
  };

  // Insert the task into the database
  db.query(
    'INSERT INTO tasks (title, description, dueDate) VALUES (?, ?, ?)',
    [title, description, dueDate],
    (err, result) => {
      if (err) {
        console.error('Error creating task:', err);
        res.sendStatus(500);
      } else {
        res.status(201).send({
          message: 'Task created successfully',
          task,
        });
      }
    }
  );
});

// Get all tasks
app.get('/tasks', (req, res) => {
  // Get all tasks from the database
  db.query('SELECT * FROM tasks', (err, tasks) => {
    if (err) {
      console.error('Error getting tasks:', err);
      res.sendStatus(500);
    } else {
      res.status(200).send(tasks);
    }
  });
});

// Get a single task
app.get('/tasks/:id', (req, res) => {
  // Get the task from the database
  const id = req.params.id;
  db.query('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
    if (err) {
      console.error('Error getting task:', err);
      res.sendStatus(500);
    } else if (task.length === 0) {
      res.sendStatus(404);
    } else {
      res.status(200).send(task[0]);
    }
  });
});

// Update a task
app.put('/tasks/:id', (req, res) => {
  // Validate the request body
  const { title, description, dueDate } = req.body;

  // Update the task in the database
  const id = req.params.id;
  db.query(
    'UPDATE tasks SET title = ?, description = ?, dueDate = ? WHERE id = ?',
    [title, description, dueDate, id],
    (err, result) => {
      if (err) {
        console.error('Error updating task:', err);
        res.sendStatus(500);
      } else if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(200);
      }
    }
  );
});
// Delete a task
app.delete('/tasks/:id', (req, res) => {
    // Delete the task from the database
    const id = req.params.id;
    db.query('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error deleting task:', err);
        res.sendStatus(500);
      } else if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(200);
      }
    });
  });
  
  // Start the server
  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
  