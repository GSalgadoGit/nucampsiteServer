// Task 2 - Week 4
const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
  Favorite.find({ user: req.user._id })
  .populate('user')
  .populate('campsites')
  .then(favorites => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorites);
  })
  .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({user: req.user._id })
    .then(favorite => {
      if (favorite) {
        if(!favorite.campsites.includes(req.campsites._id)) {
          favorite.campsites.push(req.campsites._id);
          favorite.save()
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
        } else {
            err = new Error(`Campsite ${req.campsites._id} already exists`);
            err.status = 404;
            return next(err);
        }
      } else {
          err = new Error(`Favorite ${req.user._id} not found`);
          err.status = 404;
          return next(err);
      }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
   .then(response => {
      if(response) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      } else {
        res.setHeader('Content-Type', 'text/plain');
        res.end('You do not have any favorites to delete.');
      }
    })
   .catch(err => next(err));
  
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
  res.statusCode = 403;
  res.end(`Get operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  Favorite.findOne({user: req.user._id })
    .then(favorite => {
      if (favorite) {
        if(!favorite.campsites.includes(req.params.campsiteId)) {
          favorites.campsites.push(req.params.campsiteId);
          favorite.save()
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
        } else {
          err = new Error('Campsite is already in the list of favorites');
          err.status = 404;
          return next(err);
        } 
      } else {
          req.body.user = req.user._id;
          req.body.campsites = req.params.campsiteId;
          Favorite.create(req.body)
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({user: req.user._id })
  .then(favorite => {
    if (favorite) {
      favorites.campsites.splice(favorites.campsites.indexOf(req.params.campsiteId),1);
      favorite.save()
        .then(favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
          })
    } else {
      err = new Error(`Favorite ${req.user._id} not found`);
      err.status = 404;
      return next(err);
    }
  })
    .catch(err => next(err));
  
});


module.exports = favoriteRouter;