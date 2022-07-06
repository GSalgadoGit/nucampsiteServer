// Authenticate with Json Web Token & passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const FacebookTokenStrategy = require('passport-facebook-token');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt =  require('passport-jwt').ExtractJwt;
// used to create, sign, and verify tokens
const jwt = require('jsonwebtoken');

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
  return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(
      opts,
      (jwt_payload, done) => {
          console.log('JWT payload:', jwt_payload);
          User.findOne({_id: jwt_payload._id}, (err, user) => {
              if (err) {
                  return done(err, false);
              } else if (user) {
                  return done(null, user);
              } else {
                  return done(null, false);
              }
          });
      }
  )
);

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }, 
        (accessToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', {session: false});
// Task 1 - Week 3
exports.verifyAdmin = passport.authenticate('jwt', {session: false});

