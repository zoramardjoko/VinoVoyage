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

const question_one = async function(req, res) {
  connection.query(`SELECT w.title FROM Wine w JOIN Location L on w.title = L.title WHERE price < 20 
  AND L.country = 'US' LIMIT 1;`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

const question_two = async function(req, res) {
  connection.query(`SELECT * FROM Wine WHERE description LIKE '%citrus%';`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

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
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

const question_four = async function(req, res) {
  // Function to run a query and return a promise
  const runQuery = (query) => {
    return new Promise((resolve, reject) => {
      connection.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  try {
    // create the index on the country table for optimization (include error handling)
    try {
      await runQuery(`CREATE INDEX idx_country_abbreviation ON Country(country);`);
    } catch (err) {
      if (!err.message.includes('Duplicate key name')) {
        throw err;
      }
      console.log('Index already exists, continuing...');
    }

    // Create MaxPoints table for optimization
    await runQuery(`
      CREATE TABLE MaxPoints AS
      SELECT
        L.Country,
        MAX(W.points) AS max_points
      FROM
        Wine AS W
        JOIN Location AS L ON W.title = L.Title
      GROUP BY
        L.Country
    `);

    // this is the main query
    const data = await runQuery(`
      SELECT C.country, AVG(W.points) AS avg_rating, W.title, W.points AS max_rating
      FROM (SELECT title, points FROM Wine) AS W
      JOIN (SELECT Title, country FROM Location) AS L ON W.title = L.Title
      JOIN (SELECT name, abbreviation FROM Country_Abb) AS CA ON L.country = CA.name
      JOIN (SELECT DISTINCT country FROM Country) AS C ON CA.abbreviation = C.country
      JOIN (SELECT max_points, country FROM MaxPoints) AS MaxPoints ON W.points = MaxPoints.max_points AND L.country = MaxPoints.country
      GROUP BY C.country, W.title
      ORDER BY C.country;
    `);

    // Send data to client
    res.json(data);

    // Optionally, clean up MaxPoints table if it's temporary for this query
    // do this for good practice
    await runQuery(`DROP TABLE IF EXISTS MaxPoints;`);
  } catch (err) {
    console.error('SQL Error:', err);
    res.json([]);
  }
}


module.exports = {
  random,
  wine,
  sommelier,
  sommeliers,
  top_wines,
  search_wines,
  question_one,
  question_two,
  question_three,
  question_four
}
