require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeHandler = require('./api/analyze')

const app = express();
app.use(cors());
app.use(express.json());

app.post('/analyze', (req, res) => analyzeHandler(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
