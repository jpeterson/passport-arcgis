var express = require('express');
var app = express();
var logger = require('express-logger');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('express-session')

var passport = require('passport');
var util = require('util');
var ArcGISStrategy = require('passport-arcgis').Strategy;

var ARCGIS_CLIENT_ID = "UaGPPkRbGmBV6GTK";
var ARCGIS_CLIENT_SECRET = "ba3f18c3da8c42ce833cc006c7afdc5e";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete ArcGIS profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the ArcGISStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and ArcGIS
//   profile), and invoke a callback with a user object.
passport.use(new ArcGISStrategy({
    clientID: ARCGIS_CLIENT_ID,
    clientSecret: ARCGIS_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/arcgis/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {

      // To keep the example simple, the user's ArcGIS profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the ArcGIS account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

app.listen(3000);

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// app.use(logger({path: '/logfile.txt'}));
app.use(cookieParser());
app.use(methodOverride());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'keyboard cat'
}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res) {
  res.render('index', {
    user: req.user
  });
});

app.get('/account', ensureAuthenticated, function(req, res) {
  res.render('account', {
    user: req.user
  });
});

app.get('/login', function(req, res) {
  res.render('login', {
    user: req.user
  });
});

// GET /auth/arcgis
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in ArcGIS authentication will involve redirecting
//   the user to arcgis.com.  After authorization, ArcGISwill redirect the user
//   back to this application at /auth/arcgis/callback
app.get('/auth/arcgis',
  passport.authenticate('arcgis'),
  function(req, res) {
    // The request will be redirected to ArcGIS for authentication, so this
    // function will not be called.
  });

// GET /auth/arcgis/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/arcgis/callback',
  passport.authenticate('arcgis', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
