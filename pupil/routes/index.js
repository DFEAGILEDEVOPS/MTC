const express = require('express');
const router = express.Router();
const passport = require('passport');

// const logger = require('../lib/logger');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.locals.pageTitle = 'Multiplication Tables Check';
  if (req.isAuthenticated()) {
    res.redirect('/check/start');
  } else {
    res.redirect('/sign-in');
  }
});

/* GET Logger function */
router.get('/logger', function (req, res, next) {
  // logger.info({ logVars: req.query }, 'logger request');
  res.writeHead(200, {'content-type': 'text/html'});
  res.end("OK");
});

/* Login page */
router.get('/sign-in', function (req, res, next) {
  res.locals.pageTitle = 'Multiplication tables check - Login';
  res.render('sign-in-5-digit-pin', { layout: 'question-layout' }); // Temp layout
});

/* Login validation */
router.post('/sign-in', passport.authenticate('custom', {
    failureRedirect: '/sign-in-failure',
    successRedirect: '/sign-in-success'
  })
);

/* Sign out */
router.get('/sign-out', function (req, res) {
  req.logout();
  req.session.regenerate(function() {
    // session has been regenerated
    res.redirect('/');
  });
});

router.get('/sign-in-success' , function (req, res) {
  res.redirect('/check/sign-in-success');
});

/* Sign in failure */
router.get('/sign-in-failure', function (req, res) {
  res.locals.pageTitle = 'Multiplication tables check - Sign-in error';
  res.render('sign-in-failure-5pin', { layout: 'question-layout' }); // Temp layout
});

/* Health check */
router.get('/ping', function (req, res) {
  res.status(200).send("OK");
});

module.exports = router;
