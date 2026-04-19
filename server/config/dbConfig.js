const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

mongoose.connect(process.env.CONN_STRING)

const db = mongoose.connection;

db.on('connected', () => {
    console.log('DB Connection Successful');
})

db.on('err', () => {
    console.log('DB Connection Failed');
    
})

module.exports = db;