const pg = require('pg');

const config = {
  database: 'twitterdb', //env var: PGDATABASE
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
};

const client = new pg.Client(config);

// connect to our database
client.connect(function (err) {
  if (err) throw err;

  // execute a query on our database
  client.query('SELECT * FROM tweets', function (err, result) {
    if (err) throw err;

    // just print the result to the console
    /*console.log(result.rows[0]); // outputs: { name: 'brianc' }

    // disconnect the client
    client.end(function (err) {
      if (err) throw err;
    });*/
  });
});

module.exports = client;
