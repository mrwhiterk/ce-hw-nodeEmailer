const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const registerValidation = require('../utils/registerValidation')

const nodeMailer = require('nodemailer');
const Secret = require('../secret');
const pass = new Secret().getPass();



/** register */
router.get('/register', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/');

  // res.render('register', { error_msg: false, user: req.session.user});
  res.render('register', {
    errors: req.flash('errors'),
    errorMessage: null
  })
});

router.post('/register', registerValidation, userController.register);

/** login */
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/');

  res.render('login', { errors: [] });
})

router.post('/login', async (req, res) => {
  try {
    let user = await userController.login(req.body);
    console.log('user ', user);
    if (user) {
      res.render('index', { successMessage: 'Successfully logged in'})
    }
  } catch (error) {
    res.render('login', { errors: [error] });
  }
})

/** contact */

router.get('/contact', (req, res) => {
  res.render('contact', { error_msg: false, user: req.session.user });
});

router.post('/contact', (req, res) => {
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
