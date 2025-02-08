// Require mysql
const mysql = require('mysql');

const connection = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    database: 'data_warehouseDB',
    password: ''
});

module.exports = connection;