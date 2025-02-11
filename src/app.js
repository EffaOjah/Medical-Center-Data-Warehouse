require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 1000;

// Require cookie-parser
const cookieParser = require('cookie-parser');

// Require database connection file
const connection = require('./db/connection');

connection.connect((err) => {
    if (err) {
        console.log('Database connection failed: ', err);
    } else {
        console.log('Database connection established');
    }
});

// Require auth route
const authRoute = require('./auth/authRoute');

// Require admin routes
const adminRoute = require('./routes/adminRoutes');

// Require staff routes
const staffRoute = require('./routes/staffRoutes');

// Require user routes
const userRoute = require('./routes/userRoutes');

// Set app to use express to parse req.body]
app.use(express.urlencoded({ extended: true }));

// Set app to use static files
app.use(express.static(path.join(__dirname, './public')));

// Set view engine
app.set('view engine', 'ejs');

// Use cookie-parser middleware
app.use(cookieParser());

// Routes
// Use external routes
app.use(authRoute);

app.use(adminRoute);
app.use(staffRoute);
app.use(userRoute);

// Home route
app.get('/', (req, res) => {
    res.render(path.join(__dirname, './views/home'));
    // res.send('Welcome to the data warehouse system!');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});