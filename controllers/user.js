const User = require('../models/user');
const bcrypt = require('bcryptjs');

async function register(req, res, next) {
  let errorValidate = req.validationErrors();
  if (errorValidate) {
    res.render('register', {
      errors: [],
      errorMessage: true,
      errorValidate
    });
    return;
  }
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      req.flash('error', 'User already exist');
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

function login(params) {
  return new Promise((resolve, reject) => {
    User.findOne({ email: params.email }).then(user => {
      if (!user) {
        let errors = {};
        errors.message = 'User is not found';
        errors.status = 400;

        reject(errors);
      } else {
        bcrypt.compare(params.password, user.password, (err, result) => {
          if (!result) {
            let errors = {};
            errors.message = 'Compare failed';
            errors.status = 400;
            reject(errors);
          } else {
            resolve(user);
          }
        });
      }
    })
    .catch(err => reject(err))
  });
}

module.exports = {
  register,
  login
}
