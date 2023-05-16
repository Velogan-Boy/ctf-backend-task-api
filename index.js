require('dotenv-flow').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV == 'development') app.use(morgan('dev'));
app.use('/api', require('./routes'));

app.get('/', (req, res) => {
   res.send('<h1> CTF Backend Task - Techops Student Director Recruitment  </h1>');
});

const port = process.env.PORT || 5000;

app.listen(port, async () => {
   console.log(`✅ Server listening on port ${port}`);
});
