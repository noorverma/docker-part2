const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Item = require('./models/Item'); // Import the updated Item model

const app = express();
app.set('view engine', 'ejs');

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// JWT configuration
const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
const jwtExpiry = process.env.JWT_EXPIRES_IN || '1h';

// Database connection
const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/studentDB';

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected Successfully for studentrestfulapi');
    console.log('Connection URI:', mongoURI);
  })
  .catch(err => {
    console.error('MongoDB Connection Error for studentrestfulapi:', err);
  });

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Expecting 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user; // Attach user information to the request
    next();
  });
};

// Route to issue a JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Dummy authentication (replace with your actual authentication logic)
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, jwtSecret, { expiresIn: jwtExpiry });
    return res.status(200).json({ token });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

// GET endpoint to retrieve all items
app.get('/', (req, res) => {
  Item.find()
    .then(items => {
      console.log('Items retrieved successfully:', items);
      res.render('index', { items });
    })
    .catch(err => {
      console.error('Error retrieving items:', err);
      res.status(500).json({ error: 'Failed to retrieve items', details: err.message });
    });
});

// POST endpoint to add a new item
app.post('/item/add', (req, res) => {
  console.log('Received POST request body:', req.body);

  if (!req.body.studentID || !req.body.studentName || !req.body.course || !req.body.presentDate) {
    console.log('Missing fields:', req.body);
    return res.status(400).json({
      error: 'Missing required fields',
      requiredFields: ['studentID', 'studentName', 'course', 'presentDate']
    });
  }

  const newItem = new Item(req.body);

  newItem.save()
    .then(item => {
      console.log('Item saved successfully:', item);
      res.status(201).json({
        message: "Student created successfully",
        item
      });
    })
    .catch(err => {
      console.error('Error saving item:', err);
      res.status(400).json({
        error: 'Failed to add item',
        details: err.message
      });
    });
});

// GET endpoint to retrieve all students (with token protection)
app.get('/students', authenticateToken, (req, res) => {
  Item.find()
    .then(students => {
      if (students.length === 0) {
        return res.status(404).json({ message: 'No students found' });
      }
      res.status(200).json({ message: 'Students retrieved successfully', students });
    })
    .catch(err => {
      console.error('Error retrieving students:', err);
      res.status(500).json({ error: 'Failed to retrieve students', details: err.message });
    });
});

// DELETE endpoint to remove a student by studentID
app.delete('/student/:studentID', (req, res) => {
  const studentID = req.params.studentID;

  Item.findOneAndDelete({ studentID })
    .then(result => {
      if (!result) {
        return res.status(404).json({ message: 'Student not found' });
      }
      console.log(`Student with ID ${studentID} deleted successfully.`);
      res.status(200).json({ message: 'Student deleted successfully' });
    })
    .catch(err => {
      console.error('Error deleting student:', err);
      res.status(500).json({ error: 'Failed to delete student', details: err.message });
    });
});

// PUT endpoint to update a student
app.put('/item/:id', (req, res) => {
  const updateData = req.body;

  Item.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(item => {
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    })
    .catch(err => res.status(400).json({ error: 'Failed to update item', details: err.message }));
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
