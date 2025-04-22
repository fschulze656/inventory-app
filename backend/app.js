const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const allowedOrigins = [
  'https://localhost:8085',
  'http://localhost'
];

require('./database/MongoClient')();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.use(compression());
app.use(morgan('tiny'));
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.options('*', cors());

const httpsOptions = {
  key: process.env.NODE_ENV === 'production' ? '' : fs.readFileSync('../server.key'),
  cert: process.env.NODE_ENV === 'production' ? '' : fs.readFileSync('../server.cert')
};

let server;
server = process.env.NODE_ENV === 'production'
  ? http.createServer(app)
  : https.createServer(httpsOptions, app);

require('./routes')(app, server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(process.env.NODE_ENV === 'production' ? 'Running HTTP server' : 'Runnning HTTPS server')
});
