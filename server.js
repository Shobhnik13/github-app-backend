require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeHandler = require('./api/analyze/index.js');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze', analyzeHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
