const express = require('express');
const app = express();
const port = 3001;
const SeatsRoutes = require('./routes/seatRoutes')
const AuthRoutes = require('./routes/authRoutes')
const BookingRoutes = require('./routes/bookingRoutes')
const { clerkMiddleware } = require('@clerk/express')
const { requireAuth } = require('@clerk/express')
const cors = require('cors')

// Updated CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'https://workwise-ticket-booking-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

//middleware to parse JSON request bodies
app.use(express.json());

app.use(clerkMiddleware())

app.get('/', (req, res) => {
    return res.json('hello world')
})

app.get('/auth-state', (req, res) => {
    const authState = req.auth
    console.log('req', authState);
    return res.json(authState)
})

app.use('/api/seats', SeatsRoutes);
app.use('/api/profile', AuthRoutes)
app.use('/api/bookings', BookingRoutes)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
