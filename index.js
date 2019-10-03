let express = require('express');
const path = require('path');
const logger = require('morgan');
let session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
let expressValidator = require('express-validator');

let app = express();

let ejs = require('ejs');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser('ryan'));

let user = {};

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

app.get('/', (req, res, next) => {
  // if (Object.keys(req.query) != 0) {
  //   return next();
  // }

  if (req.session.user) {
    res.render('index', { user: req.session.user });
  } else {
    res.render('index', { user: null });
  }
});

app.get('/test', (req, res) => {
  res.render('index');
});

app.get('/user/register', (req, res) => {
  res.render('register', { error_msg: false });
});

app.post('/users/register', (req, res) => {
  console.log('req.body', req.body);

  req.checkBody('username', 'is in range 3 - 15').isLength({ min: 3, max: 15 });

  req
    .checkBody('username', 'Only use A-Z')
    .notEmpty()
    .blacklist(new RegExp('[^A-Za-z]'));

  req.checkBody('email', 'enter a valid email').isEmail();

  req
    .checkBody('password2', 'password is not matching')
    .notEmpty()
    .equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    let { username, password, password2, email } = req.body;

    res.render('register', {
      error_msg: true,
      errors,
      username,
      password,
      email,
      password2
    });
  } else {
    user.email = req.body.email;
    user.username = req.body.username;
    user.password = req.body.password;

    req.session.user = user;

    res.redirect('/show-me-my-page');
  }
});

app.get('/show-me-my-page', (req, res) => {
  if (req.session.user) {
    res.render('index', { user: req.session.user });
  } else {
    res.render('index', { user: null });
  }
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

app.listen(3000, () => console.log('👹: 3000'));
