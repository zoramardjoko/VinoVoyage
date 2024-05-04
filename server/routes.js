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

/******************
 * WARM UP ROUTES *
 ******************/

// Route 1: GET /author/:type

// Route 2: GET /random
// will return random wine title
const random = async function(req, res) {
  connection.query(`
    SELECT *
    FROM Wine
    ORDER BY RAND()
    LIMIT 1
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

// GET /wine/:title
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

// GET /sommelier/:taster_name
// returns all info about a sommelier given their name (twitter handle is cleaned)
const sommelier = async function(req, res) {
  const taster_name = req.params.taster_name;
  connection.query(`SELECT title, taster_name, REGEXP_REPLACE(taster_twitter_handle, '^@', '') AS taster_twitter_handle FROM Sommelier WHERE taster_name = '${taster_name}'`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 5: GET /sommeliers
// returns number of wines, sommelier name, twitter handle
const sommeliers = async function(req, res) {
  connection.query(`SELECT COUNT(title) AS number_of_wines, taster_name AS sommelier, REGEXP_REPLACE(taster_twitter_handle, '^@', '') AS taster_twitter_handle
  FROM Sommelier
  GROUP BY sommelier
  ORDER BY number_of_wines DESC;
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}
const top_wines = async function(req, res) {
  const page = req.query.page;
  // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
    // Hint: you will need to use a JOIN to get the album title as well
    connection.query(`SELECT * FROM Wine ORDER BY points DESC, title ASC LIMIT 12`, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
    } else {
    // TODO (TASK 10): reimplement TASK 9 with pagination
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

const search_wines = async function(req, res) {
    const title = req.query.title ?? '';
    const description = req.query.description ?? '';
    const designation = req.query.designation ?? '';
    const pointsLower = req.query.points_lower_bound ?? 0;
    const pointsUpper = req.query.points_upper_bound ?? 100;

    const priceLower = req.query.price_lower_bound ?? 0;
    const priceUpper = req.query.price_upper_bound ?? 1000000000000;

    const variety = req.query.variety ?? '';
    const winery = req.query.winery ?? '';
    // title, description, designation, points, price, variety, winery
    connection.query(`SELECT * FROM Wine w WHERE w.title LIKE '%${title}%'
    AND w.description LIKE '%${description}%' 
   AND w.designation LIKE '%${designation}%' and w.points >= ${pointsLower} AND w.points <= ${pointsUpper} AND w.price >= ${priceLower} AND w.price <= ${priceUpper} AND w.variety LIKE '%${variety}%'
   AND w.winery LIKE '%${winery}%';`, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
}

const test = async function(req, res) {
  connection.query(`SELECT * FROM Wine w ORDER BY price DESC;`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}


module.exports = {
  random,
  wine,
  sommelier,
  sommeliers,
  top_wines,
  search_wines,
  test
}
