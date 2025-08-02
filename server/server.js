const dotenv = require('dotenv');
dotenv.config({ path: './config.env' })

const dbconfig = require('./config/dbConfig')

const app = require('./app')

const port = process.env.PORT || 3000;

app.listen(port, ()=> {
    console.log('listening to request on port: http://localhost:'+ port);
    
})