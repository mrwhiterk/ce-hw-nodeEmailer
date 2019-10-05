const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/user/register', (req, res) => {
  res.render('register', { error_msg: false, user: req.session.user });
});

router.post('/user/register', (req, res) => {
  req.checkBody('username', 'is in range 3 - 15').isLength({ min: 3, max: 15 });

  req
    .checkBody('username', 'Only use A-Z')
    .blacklist(new RegExp('/[^A-Za-z]/'));

  req.checkBody('email', 'enter a valid email').isEmail();

  req
    .checkBody('password2', 'password is not matching')
    .notEmpty()
    .equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      error_msg: true,
      errors,
      user: req.body
    });
  } else {
    req.session.user = req.body;
    res.redirect('/');
  }
});

router.get('/user/contact', (req, res) => {
  res.render('contact', { error_msg: false, user: req.session.user });
});

router.post('/user/contact', (req, res) => {
  req.checkBody('name', 'not empty').notEmpty();

  req.checkBody('email', 'enter a valid email').isEmail();

  let errors = req.validationErrors();

  if (errors) {
    res.render('contact', {
      error_msg: true,
      errors,
      data: req.body,
      user: {}
    });
  } else {
    let { name, email, comment } = req.body;

    let transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ryan.white@codeimmersives.com',
        pass
      }
    });

    let mailOptions = {
      to: 'ryan.white@codeimmersives.com',
      subject: `Email from ${name}`,
      text: comment
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);

      console.log(`email sent: ${info.response}`);

      res.redirect(`/?emailSuccess=true`);
    });
  }
});

router.get('/user/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/');
});

module.exports = router;
