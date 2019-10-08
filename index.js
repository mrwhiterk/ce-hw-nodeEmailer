const express = require('express'),
  app = express(),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  expressValidator = require('express-validator'),
  logger = require('morgan');

const nodeMailer = require('nodemailer'),
  Secret = require('./secret'),
  pass = new Secret().getPass();

let mongoose = require('mongoose');
let indexRoutes = require('./routes/index');
let userRoutes = require('./routes/user');

let authChecker = require('./utils/authChecker');
const isLoggedIn = require('./utils/isLoggedIn');

/**
 * DB
 */
mongoose
  .connect('mongodb://localhost:27017/ce-blog-hw', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('connected to DB');
  })
  .catch(err => {
    console.log('error: ', err.message);
  });

app.set('view engine', 'ejs');

// set up public folder to serve static content
app.use(express.static(__dirname + '/public'));

// parsing form body
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev'));

app.use(express.json());
app.use(cookieParser('ryan'));

let user = {
  email: 'dog@dog.com',
  password: 'Dog@123',
  username: 'doggy'
};

app.use(
  session({
    secret: 'ryan',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 365 * 24 * 60 * 60 * 1000 }
  })
);

app.use(
  expressValidator({
    errorFormatter: (param, message, value) => {
      let namespace = param.split('.');
      let root = namespace.shift();
      let formParam = root;

      while (namespace.length) {
        formParam += `[${namespace.shift()}]`;
      }

      return {
        param: formParam,
        message,
        value
      };
    }
  })
);

app.get('/', indexRoutes);

app.get('/user/register', (req, res) => {
  console.log('req session', req.session.user);
  res.render('register', { error_msg: false, user: req.session.user });
});

app.post('/user/register', authChecker, (req, res) => {
  let errors = req.validationErrors();
  console.log(errors);

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
///////////////////// - working on
app.post('/users/login', (req, res) => {
  // req.checkBody('password').
  let errors = req.validationErrors();

  console.log('errors ', errors);

  if (errors) {
    res.render('login', {
      error_msg: true,
      errors,
      user: req.body
    });
  } else {
    console.log('user', user);
    console.log('req.body', req.body);
    if (user.email === req.body.email && user.password === req.body.password) {
      console.log('hit');
      req.session.user = user;
    }
    console.log('req.session.user', req.session.user);
    res.redirect('/');
  }
});
///////////

app.get('/user/contact', (req, res) => {
  res.render('contact', { error_msg: false, user: req.session.user });
});

app.post('/user/contact', (req, res) => {
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
    let { name, comment } = req.body;

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

app.get('/user/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/user/login', (req, res) => {
  console.log('req session user', req.session.user);
  res.render('login', {
    success_msg: false,
    error_msg: false,
    user: req.session.user
  });
});

// write route to handle request from login form

app.listen(3001, () => console.log('✅  3001'));
