const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/random', routes.random);
app.get('/wine/:title', routes.wine);
app.get('/sommeliers', routes.sommeliers);
app.get('/top_wines', routes.top_wines);
app.get('/search_wines', routes.search_wines);
app.get('/question_one', routes.question_one);
app.get('/question_two', routes.question_two);
app.get('/question_three', routes.question_three);
app.get('/question_four', routes.question_four);
app.get('/test', routes.test);


app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
