const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authChecker = require('../utils/authChecker');
const nodeMailer = require('nodemailer');
const Secret = require('../secret');
const pass = new Secret().getPass();
const passport = require('passport');

/** register */
router.get('/register', userController.isAuthenticated, (req, res) => {
  res.render('register', {
    errors: req.flash('errors')
  });
});

router.post('/register', authChecker, userController.register);

/** login */
router.get('/login', userController.isAuthenticated, (req, res) => {

  res.render('login', {
    errors: req.flash('errors')
  });
});

router.post(
  '/login',
  userController.login,
  passport.authenticate('local-login'),
  (req, res) => {
    console.log(req.user);
    res.redirect('/');
  }
);

/** contact */

router.get('/contact', (req, res) => {
  res.render('contact', { errorMessage: false, user: req.session.user });
});

router.post('/contact', (req, res) => {
  req.checkBody('name', 'not empty').notEmpty();

  req.checkBody('email', 'enter a valid email').isEmail();

  let errors = req.validationErrors();

  if (errors) {
    res.render('contact', {
      errorMessage: true,
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

      res.redirect(`/`);
    });
  }
});

/** logout */

router.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/');
});

module.exports = router;
