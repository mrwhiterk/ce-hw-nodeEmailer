const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', (req, res) => {
  res.render('index', {
    user: req.session.user,
    emailSuccess: req.query.emailSuccess
  });
});

module.exports = router;
