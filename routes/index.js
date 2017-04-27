'use strict';
var express = require('express');
var router = express.Router();
var client = require('../db/index.js');

module.exports = router;

// a reusable function
function respondWithAllTweets (req, res, next){
  var allTheTweets = [];
  client.query('SELECT name, content FROM tweets INNER JOIN users ON users.id = tweets.user_id', function(err, result) {
    if (err) throw err;
    allTheTweets = result.rows.map(function(elem){
      return {name: elem.name, content: elem.content};
    });
    console.log(allTheTweets);
    res.render('index', {
      title: 'Twitter.js',
      tweets: allTheTweets,
      showForm: true
    });
  });
  // console.log(allTheTweets);
}

// here we basically treet the root view and tweets view as identical
router.get('/', respondWithAllTweets);
router.get('/tweets', respondWithAllTweets);

// single-user page
router.get('/users/:username', function(req, res, next){
  client.query('SELECT content FROM tweets INNER JOIN users ON users.id = tweets.user_id '
   + 'AND users.name = $1', [req.params.username], function(err, results) {
     if (err) throw err;
     var tweetsForName = results.rows.map(elem => {
          return {name: req.params.username, content: elem.content};
        })
     res.render('index', {
       title: 'Twitter.js',
       tweets: tweetsForName,
       showForm: true,
       username: req.params.username
     });
   });

});

// single-tweet page
router.get('/tweets/:id', function(req, res, next){
  client.query('SELECT name, content FROM tweets INNER JOIN users ON users.id = tweets.user_id'
  + ' WHERE tweets.id=$1', [req.params.id],
    function(err, results){
      if (err) throw err;
      var tweetsWithThatId = [{name: results.rows[0].name, content: results.rows[0].content}];
      // console.log(tweetsWithThatId);
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsWithThatId // an array of only one element ;-)
      });
    });
});

/*router.get('/search', function(req, res, next){
  console.log(req.body);
  client.query("SELECT name, content FROM tweets INNER JOIN users ON users.id = tweets.user_id WHERE content LIKE '%' || $1 || '%'", [req.body.search], function(err, results){
    if (err) throw err;
    var relevantTweets = results.rows.map(elem => {
         return {name: elem.name, content: elem.content};
       });
       res.render('index', {
         title: 'Search Results',
         tweets: relevantTweets
       })
  });
})*/

// create a new tweet
router.post('/tweets', function(req, res, next){
  client.query('SELECT id FROM users WHERE users.name = $1', [req.body.name], function(err, result){
    if (err) throw err;
    //console.log(req.body);
    if (result.rows.length){
      client.query('INSERT INTO tweets(user_id, content) VALUES($1, $2)', [result.rows[0].id, req.body.content])
    }
    else {
      client.query('INSERT INTO users (name) VALUES($1) RETURNING id', [req.body.name], function(error, results){
        if (error) throw error;
        client.query('INSERT INTO tweets(user_id, content) VALUES($1, $2)', [results.rows[0].id, req.body.content])
      });
    }
  });
  res.redirect('/');
});

// // replaced this hard-coded route with general static routing in app.js
// router.get('/stylesheets/style.css', function(req, res, next){
//   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
// });
