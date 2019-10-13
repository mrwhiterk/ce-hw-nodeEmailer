const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const logger = require('morgan');

const mongoose = require('mongoose');
const indexRouter = require('./routes');
const userRouter = require('./routes/user');

const createError = require('http-errors');
const flash = require('connect-flash');
const passport = require('passport');

const MongoStore = require('connect-mongo')(session);
const port = process.env.PORT || 3000;

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

app.use('/', indexRouter);
app.use('/user', userRouter);

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
});

app.listen(port, () => console.log(`✅  PORT: ${port}`));
