var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var util = require('util');


//Include User models
var User = require('../models/user');
//Include Student models
var Student = require('../models/student');
//Include instructor models
var Instructor = require('../models/instructor');
/* GET users listing. */
router.get('/signup', function(req, res, next) {
  res.render('users/signup');
});

router.post('/signup', function(req, res){
   // Get Form values
    var first_name        = req.body.first_name;
    var last_name         = req.body.last_name;
    var whatsapp_contact  = req.body.whatsapp_contact;
    var street_address    = req.body.street_address;
    var city              = req.body.city;
    var state             = req.body.state;
    var zip               = req.body.zip;
    var email             = req.body.email;
    var username          = req.body.username;
    var password          = req.body.password;
    var password2         = req.body.password2;
    var type              = req.body.type;

     // Form Field Validation
    req.checkBody('first_name', 'First name field is required').notEmpty();
    req.checkBody('last_name', 'Last name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    req.checkBody('whatsapp_contact', 'whatsapp contact is required').notEmpty();
    //req.checkBody('whatsapp_contact', 'whatsapp contact must be a valid whatsapp contact').isMobilePhone();
    req.checkBody('username', 'Usrname field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
      res.render('users/signup', {
              errors: errors,
              first_name: first_name,
              last_name: last_name,
              whatsapp_contact: whatsapp_contact,
              street_address: street_address,
              city: city,
              state: state,
              zip: zip,
              email: email,
              username: username,
              password: password,
              password2: password2
          });
    } else {
       var newUser = User({
          email: email,
          username: username,
          password: password,
          whatsapp_contact: whatsapp_contact,
          type: type
        });
        var newStudent = new Student({
            first_name: first_name,
            last_name: last_name,
            whatsapp_contact: whatsapp_contact,
            address: [{
                street_address: street_address,
                city: city,
                state: state,
                zip: zip
            }],
            email: email,
            username: username
        });
      if(type == 'student'){
        User.saveStudent(newUser, newStudent, function(err, user){
          console.log('Student created');
        });
      } else  {
         User.saveInstructor(newUser, newInstructor, function(err, user){
          console.log('Instructor created');
        });
      }
      req.flash('success', 'User successfully created')
      res.redirect('/');
    }
});
router.all('/', function(req, res){
  res.send(JSON.stringify(req.flash('success')));
});

passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(function(id, done){
    User.getUserById(id, function(err, user){
      done(err, user);
    });
});

router.post('/login', passport.authenticate('local',{failureRedirect:'/', failureFlash:'Wrong Username or Password'}), function(req, res){
    req.flash('success', 'You are now logged in');
    var usertype = req.user.type;
    res.redirect(301, '/' +usertype+'s/classes');
});
router.all('/', function(req, res){
  res.send(JSON.stringify(req.flash('success')));
});

passport.use(new LocalStrategy(
    function(username, password, done){

      console.log("username: " + username);
      console.log("password: " + password);

      User.getUserByUsername(username, function(err, user){

          if (err) throw err;

          if(!user){
            console.log("Unknown user " + username);
            return done(null, false, { message: 'Unknown user ' + username });
          }

          User.comparePassword(password, user.password, function(err, isMatch){

            if (err) {
              console.log("error " + err);
              return done(err);
            }

            if(isMatch){
              console.log('Password Match');
              return done(null, user);
            } else {
              console.log('Invalid Password');
              return done(null, false, {message: 'Invalid password'});
            }
          });
      });
    }
));

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', "You have logged out");
    res.redirect('/');
});
router.get('/', function(req, res){
  res.send(JSON.stringify(req.flash('success')));
});
function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()){
      return next();
  }
  res.redirect('/');
}
module.exports = router;