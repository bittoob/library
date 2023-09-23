const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'Please log in to access this page.');
    res.redirect('/auth/login');
  };
  
  const ensureNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'You are already logged in.');
    res.redirect('back');
  };
  
  module.exports = {
    ensureAuthenticated,
    ensureNotAuthenticated,
  };