var express = require('express');

const moment = require('moment');
moment.updateLocale('en');

var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
