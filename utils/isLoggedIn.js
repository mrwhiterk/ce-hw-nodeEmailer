const isLoggedIn = (req, res) => {
  if (req.originalUrl === '/user/register' && !req.session.user) {
    res.render('register', { success_msg: false, errorMessage: false });
  } else if (req.originalUrl === '/user/login' && !req.session.user) {
    res.render('login', { success_msg: false, errorMessage: false });
  } else {
    res.redirect('/');
  }
};

module.exports = isLoggedIn;
