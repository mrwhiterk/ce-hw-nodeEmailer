const isLoggedIn = (req, res) => {
  console.log('req.route :', req.path);
  console.log('req orig url :', req.originalUrl);

  if (req.originalUrl === '/user/register' && !req.session.user) {
    res.render('register', { success_msg: false, error_msg: false });
  } else if (req.originalUrl === '/user/login' && !req.session.user) {
    res.render('login', { success_msg: false, error_msg: false });
  } else {
    res.redirect('/');
  }
};

module.exports = isLoggedIn;
