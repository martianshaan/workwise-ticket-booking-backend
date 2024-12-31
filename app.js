const express = require('express');
const cors = require('cors');
const seatController = require('./controllers/seatController');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/seats', seatController.getAllSeats);
app.post('/api/seats/reserve', seatController.reserveSeats);
app.post('/api/seats/cancel', seatController.cancelSeats);
app.post('/api/seats/initialize', seatController.initializeSeats);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
