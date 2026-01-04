require('dotenv').config();
const express = require('express');
const cors = require('cors');
const githubAnalysisController = require('./controllers/analyzer');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze', githubAnalysisController);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
