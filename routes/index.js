const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    user: req.session.user,
    // emailSuccess: req.query.emailSuccess
  });
});

module.exports = router;
