const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const logger = require('morgan');

const nodeMailer = require('nodemailer');
const Secret = require('./secret');
const pass = new Secret().getPass();

let mongoose = require('mongoose');
let indexRouter = require('./routes');
let userRouter = require('./routes/user');

let authChecker = require('./utils/authChecker');
const isLoggedIn = require('./utils/isLoggedIn');

let createError = require('http-errors');
const flash = require('connect-flash');
const passport = require('passport');

let MongoStore = require('connect-mongo')(session);

require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(data => {
    console.log('connected to DB');
  })
  .catch(err => {
    console.log('error: ', err.message);
  });

app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
      url: process.env.MONGODB_URI,
      autoReconnect: true
    }),
    cookie: {
      secure: false,
      maxAge: eval(process.env.COOKIE_LENGTH)
    }
  })
);

app.use(flash());

require('./lib/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

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

app.get('/', indexRouter);
app.use('/user', userRouter);

// app.get('/user/register', (req, res) => {
//   console.log('req session', req.session.user);
//   res.render('register', { error_msg: false, user: req.session.user });
// });

// app.post('/user/register', authChecker, (req, res) => {
//   let errors = req.validationErrors();
//   console.log(errors);

//   if (errors) {
//     res.render('register', {
//       error_msg: true,
//       errors,
//       user: req.body
//     });
//   } else {
//     req.session.user = req.body;
//     res.redirect('/');
//   }
// });
// ///////////////////// - working on
// app.post('/users/login', (req, res) => {
//   // req.checkBody('password').
//   let errors = req.validationErrors();

//   console.log('errors ', errors);

//   if (errors) {
//     res.render('login', {
//       error_msg: true,
//       errors,
//       user: req.body
//     });
//   } else {
//     console.log('user', user);
//     console.log('req.body', req.body);
//     if (user.email === req.body.email && user.password === req.body.password) {
//       console.log('hit');
//       req.session.user = user;
//     }
//     console.log('req.session.user', req.session.user);
//     res.redirect('/');
//   }
// });
// ///////////

// app.get('/user/contact', (req, res) => {
//   res.render('contact', { error_msg: false, user: req.session.user });
// });

// app.post('/user/contact', (req, res) => {
//   req.checkBody('name', 'not empty').notEmpty();

//   req.checkBody('email', 'enter a valid email').isEmail();

//   let errors = req.validationErrors();

//   if (errors) {
//     res.render('contact', {
//       error_msg: true,
//       errors,
//       data: req.body,
//       user: {}
//     });
//   } else {
//     let { name, comment } = req.body;

//     let transporter = nodeMailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'ryan.white@codeimmersives.com',
//         pass
//       }
//     });

//     let mailOptions = {
//       to: 'ryan.white@codeimmersives.com',
//       subject: `Email from ${name}`,
//       text: comment
//     };

//     transporter.sendMail(mailOptions, (err, info) => {
//       if (err) console.log(err);

//       console.log(`email sent: ${info.response}`);

//       res.redirect(`/?emailSuccess=true`);
//     });
//   }
// });

// app.get('/user/logout', (req, res) => {
//   req.session.destroy();
//   res.redirect('/');
// });

// app.get('/user/login', (req, res) => {
//   console.log('req session user', req.session.user);
//   res.render('login', {
//     success_msg: false,
//     error_msg: false,
//     user: req.session.user
//   });
// });

app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

})

// write route to handle request from login form

app.listen(3000, () => console.log('✅  3000'));
