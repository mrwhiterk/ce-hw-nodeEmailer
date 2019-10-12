const User = require('../models/user');
const bcrypt = require('bcryptjs');

async function register(req, res, next) {
  let errors = req.validationErrors();

  if (errors) {
    res.statusCode = 300;
    return res.render('register', { errors });
  }
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      req.flash('errors', 'User already exist');
      return res.redirect(301, '/user/register');
    } else {
      const newUser = new User();
      newUser.password = req.body.password;
      newUser.email = req.body.email;
      newUser.username = req.body.username;

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) {
            console.log(err);
          } else {
            newUser.password = hash;
            try {
              let user = await newUser.save();

              req.login(user, err => {
                if (err) {
                  res.status(400).json({
                    confirmation: false,
                    message: err
                  });
                } else {
                  res.redirect(301, '/');
                }
              });
            } catch (error) {
              return console.log(err);
            }
          }
        });
      });
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function login(req, res, next) {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash('errors', 'Invalid username or password');
      let errors = req.flash('errors')
      res.render('login', { errors });
      return;
    } else {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (!result) {
          req.flash(
            'errors',
            'Whoops there is a problem with our server. Try again later'
          );
          let errors = req.flash('errors');
          return res.render('login', { errors });
        } else {
          next()
        }
      });
    }
  } catch (error) {
    return console.log(error);
  }
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  } else {
    next();
  }
}

module.exports = {
  register,
  login,
  isAuthenticated
};
