const dotenv = require('dotenv');
dotenv.config({ path: './config.env' })

const dbconfig = require('./config/dbConfig')

const server = require('./app')

const port = process.env.PORT || 3000;

server.listen(port, ()=> {
    console.log('listening to request on port: http://localhost:'+ port);
    
})