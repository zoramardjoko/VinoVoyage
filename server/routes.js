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
    const description = req.query.description ?? '';

    connection.query(`SELECT * FROM Wine w WHERE w.title LIKE '%${title}%'
    AND w.points >= ${pointsLower} AND w.points <= ${pointsUpper} AND w.price >= ${priceLower} AND w.price <= ${priceUpper} AND description LIKE '%${description}%';`, (err, data) => {
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
      await runQuery(`CREATE INDEX idx_wine_price ON Wine(price);`);
    } catch (err) {
      if (!err.message.includes('Duplicate key name')) {
        throw err;
      }
      console.log('Index already exists, continuing...');
    }

    try {
      await runQuery(`CREATE INDEX idx_Slp ON GSOD(Slp);`);
    } catch (err) {
      if (!err.message.includes('Duplicate key name')) {
        throw err;
      }
      console.log('Index already exists, continuing...');
    }

    await runQuery(`DROP TABLE IF EXISTS AvgSlp;`);
    await runQuery(`DROP TABLE IF EXISTS GSOD_STN;`);

    // create AvgSlp
    await runQuery(`
    CREATE TABLE AvgSlp AS (
      SELECT AVG(G.Slp)
        FROM Wine W
        JOIN Location L ON W.title = L.title
        JOIN Country C ON L.Country = C.country
        JOIN GSOD G ON G.Stn = C.USAF
        WHERE W.winery = ':Nota Bene'
   );
   `);

    // Create MaxPoints table for optimization
    await runQuery(`
      CREATE TABLE GSOD_STN AS (
        SELECT G.Stn, AVG(G.Slp) AS Avg_Slp
        FROM GSOD G
        GROUP BY G.Stn
    );`);

    // this is the main query
    const data = await runQuery(`
    SELECT L.Country, AVG(price) as avg_price
    FROM Wine W
       JOIN Location L ON W.title = L.Title AND L.Country = 'Argentina'
       JOIN Country_Abb CA ON L.Country = CA.name
       JOIN Country C ON C.country = CA.abbreviation
       JOIN GSOD_STN G ON G.Stn = C.USAF
    GROUP BY L.Country
    HAVING AVG(G.Avg_Slp) < (SELECT * FROM AvgSlp);    
    `);

    // Send data to client
    res.json(data);

    // Optionally, clean up MaxPoints table if it's temporary for this query
    // do this for good practice
    await runQuery(`DROP TABLE IF EXISTS GSOD_STN;`);
    await runQuery(`DROP TABLE IF EXISTS AvgSlp;`);
  } catch (err) {
    console.error('SQL Error:', err);
    res.json([]);
  }
}

// trivia:
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

    await runQuery(`DROP TABLE IF EXISTS MaxPoints;`);

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
const test = async function(req, res) {
  connection.query(`
  SELECT COUNT(*) as num FROM Country
`, (err, data) => {
  if (err || data.length === 0) {
    console.log(err);
    res.json({});
  } else {
    res.json(data);
  }
});
}


const question_five = async function(req, res) {
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
      await runQuery(`CREATE INDEX idx_location_title_country
      ON Location (Title, Country);`);
    } catch (err) {
      if (!err.message.includes('Duplicate key name')) {
        throw err;
      }
      console.log('Index already exists, continuing...');
    }

    // drop the tables if they exist
    await runQuery(`DROP TABLE IF EXISTS WineRatings;`);
    await runQuery(`DROP TABLE IF EXISTS FruitWine;`);

    // Create WineRatings table for optimization
    await runQuery(`
    CREATE TEMPORARY TABLE WineRatings AS
    SELECT
       W.title,
       AVG(W.points) AS avg_rating
    FROM
       Wine W
    GROUP BY
       W.title;
    `);

    // Create FruitWine table for optimization
      await runQuery(`
      CREATE TABLE FruitWine AS
    SELECT
      L.Country,
      W.price,
      W.title,
      WR.avg_rating
    FROM
        Location L
    JOIN
        Wine W ON L.Title = W.title
    JOIN
        WineRatings WR ON W.title = WR.title
    WHERE
        W.description LIKE '%fruit%'
        AND L.Country NOT IN ('AR', 'NZ');
      `);

    // this is the main query
    const data = await runQuery(`
    SELECT
    S.taster_name,
    COUNT(*) AS num_tastings,
    AVG(FW.avg_rating) AS avg_wine_rating
 FROM
    Sommelier S
 JOIN
    FruitWine FW ON FW.title = S.title
 WHERE
    S.taster_twitter_handle NOT LIKE '@vossroger'
    AND NOT EXISTS (
        SELECT 1
        FROM WineRatings WR
        WHERE WR.title = S.title
        AND WR.avg_rating < 3.0
    )
 GROUP BY
    S.taster_name
 HAVING
    num_tastings > 3
 ORDER BY
    num_tastings DESC
 LIMIT 1;`);

    // Send data to client
    res.json(data);

    // Optionally, clean up MaxPoints table if it's temporary for this query
    // do this for good practice
    await runQuery(`DROP TABLE IF EXISTS WineRatings;`);
    await runQuery(`DROP TABLE IF EXISTS FruitWine;`);
  } catch (err) {
    console.error('SQL Error:', err);
    res.json([]);
  }
}


const question_six = async function(req, res) {
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

    // this is the main query
    const data = await runQuery(`
    WITH FruitWine AS (
      SELECT
         CA.abbreviation AS country,
         W.price
      FROM
          Location L
      JOIN
          Wine W ON L.Title = W.Title
      JOIN Country_Abb CA ON L.Country = CA.name
      WHERE
          W.description NOT LIKE '%fruit%'
    ),
    Countries_Temp AS (
       SELECT C.country, AVG(G.temp) AS avg_temp
       FROM Country C
       JOIN GSOD G ON G.stn = C.USAF
       GROUP BY C.country
    )
    SELECT C.country, C.avg_temp, AVG(FW.price)
    FROM
      Countries_Temp C
    JOIN FruitWine FW ON C.country = FW.country
    WHERE C.avg_temp > (SELECT AVG(temp) FROM GSOD)
    GROUP BY
      C.country
    ORDER BY
      C.avg_temp DESC
    `);

    // Send data to client
    res.json(data);
  } catch (err) {
    console.error('SQL Error:', err);
    res.json([]);
  }
}


module.exports = {
  random,
  wine,
  sommeliers,
  top_wines,
  search_wines,
  question_one,
  question_two,
  question_three,
  question_four,
  question_five,
  question_six

}
