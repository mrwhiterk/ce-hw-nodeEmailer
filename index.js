const express           = require('express'),
      app               = express(),
      session           = require('express-session'),
      cookieParser      = require('cookie-parser'),
      expressValidator  = require('express-validator'),
      logger            = require('morgan')

app.set('view engine', 'ejs');

// set up public folder to serve static content
app.use(express.static(__dirname + '/public'));

// parsing form body
app.use(express.urlencoded({ extended: false }));

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

app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

/**
 * user routes
 */
app.get('/user/register', (req, res) => {
  res.render('register', { error_msg: false, user: req.session.user });
});

app.post('/user/register', (req, res) => {
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

app.get('/user/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/')
})

app.listen(3000, () => console.log('✅  3000'));
