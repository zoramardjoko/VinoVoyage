const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));


// Route 1: GET /random
// will return random wine title
const random = async function(req, res) {
  connection.query(`
    SELECT * FROM Wine ORDER BY RAND() LIMIT 1
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json({
        title: data[0].title,
        winery: data[0].winery
      });
    }
  });
}

// 2: GET /wine/:title
const wine = async function(req, res) {
  const title = req.params.title;
  connection.query(`SELECT * FROM Wine WHERE title = '${title}' LIMIT 1`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 3: GET /sommeliers
// returns number of wines, sommelier name, twitter handle
const sommeliers = async function(req, res) {
  connection.query(`SELECT COUNT(title) AS number_of_wines, taster_name AS sommelier, REGEXP_REPLACE(taster_twitter_handle, '^@', '') AS taster_twitter_handle
  FROM Sommelier
  GROUP BY sommelier
  ORDER BY number_of_wines DESC;
  `, (err, data) => {
      res.json(data);
  });
}

// Route 4: get top 12 wines
const top_wines = async function(req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`SELECT * FROM Wine ORDER BY points DESC, title ASC LIMIT 12`, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
    } else {
    connection.query(`SELECT * FROM Wine ORDER BY points DESC, title ASC LIMIT ${(page-1)*pageSize}, ${pageSize}`, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
    // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
    // res.json([]); // replace this with your implementation
  }
}


// Route 5: search wines
const search_wines = async function(req, res) {
    const title = req.query.title ?? '';
    const pointsLower = req.query.points_lower_bound ?? 0;
    const pointsUpper = req.query.points_upper_bound ?? 100;
    const priceLower = req.query.price_lower_bound ?? 0;
    const priceUpper = req.query.price_upper_bound ?? 2013;

    connection.query(`SELECT * FROM Wine w WHERE w.title LIKE '%${title}%'
    AND w.points >= ${pointsLower} AND w.points <= ${pointsUpper} AND w.price >= ${priceLower} AND w.price <= ${priceUpper};`, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
}


// trivia: Retrieves a wine under $20 from the US.
const question_one = async function(req, res) {
  connection.query(`SELECT w.title FROM Wine w JOIN Location L on w.title = L.title WHERE price < 20 
  AND L.country = 'US' LIMIT 1;`, (err, data) => {
      res.json(data);
  });
}

// trivia: Finds wines with descriptions that include the word 'citrus'.
const question_two = async function(req, res) {
  connection.query(`SELECT * FROM Wine WHERE description LIKE '%citrus%';`, (err, data) => {
      res.json(data);
  });
}

// trivia: Computes the average rating points of wines from Washington reviewed by sommeliers who have reviewed more than 10 wines.
const question_three = async function(req, res) {
  connection.query(`SELECT AVG(W.points) AS average_points FROM Wine W
  JOIN Location L ON W.title = L.title
  JOIN Sommelier S ON W.title = S.title WHERE L.province = 'Washington'
  AND S.taster_name IN (
     SELECT taster_name
     FROM Sommelier
     GROUP BY taster_name
     HAVING COUNT(title) > 10
  );
  `, (err, data) => {
      res.json(data);
  });
}


module.exports = {
  random,
  wine,
  sommeliers,
  top_wines,
  search_wines,
  question_one,
  question_two,
  question_three
}
