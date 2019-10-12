const authChecker = (req, res, next) => {
  usernameChecker(req);
  emailChecker(req);
  passwordChecker(req);

  next();
};

const usernameChecker = username => {
  username
    .check('username')
    .notEmpty()
    .withMessage('Please enter a username')
    .isLength({ min: 3, max: 15 })
    .withMessage('Username must be between 3 and 15 characters')
    .blacklist(/<>\//);
};

const emailChecker = email => {
  email
    .check('email')
    .isEmail()
    .withMessage('Please enter a valid email');
};

const passwordChecker = password => {
  password
    .check('password')
    .notEmpty()
    .withMessage('cannot be empty')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d`~!@#$%^&*()_+]{5,10}$/
    )
    .withMessage(
      'Minimum 5 and max 10 characters, at least one uppercase letter, one lower case, one number, one special char'
    );

  password
    .check('password2')
    .notEmpty()
    .withMessage('Confirm password cannot be empty')
    .equals(password.body.password)
    .withMessage('Password must match');
};

module.exports = authChecker;
