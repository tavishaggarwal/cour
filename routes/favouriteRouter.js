var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .all(Verify.verifyOrdinaryUser)
    .get(function(req, res, next) {
        Favorites.find({ postedBy: req.decoded._doc._id })
            .populate('postedBy')
            .populate('dishes')
            .exec(function(err, favorites) {
                if (err) throw err;
                res.json(favorites)
            })
    })
    .post(function(req, res, next) {
        Favorites.findOneAndUpdate({
            postedBy: req.decoded._doc._id
        }, {
            $addToSet: { dishes: req.body._id }
        }, {
            upsert: true,
            new: true
        }, function(err, favorites) {
            if (err) throw err;
            res.json(favorites);
        });
    })
    .delete(function(req, res, next) {
        Favorites.findOneAndRemove({
            postedBy: req.decoded._doc._id
        }, function(err, favorites) {
            if (err) throw err;
            res.json(favorites);
        });
    })

favoriteRouter.route('/:dishObjectId')
    .all(Verify.verifyOrdinaryUser)
    .delete(function(req, res, next) {
        Favorites.findOneAndUpdate({
            postedBy: req.decoded._doc._id
        }, {
            $pull: { dishes: req.params.dishObjectId }
        }, {
            new: true
        }, function(err, favorites) {
            if (err) throw err;
            res.json(favorites);
        });
    })

module.exports = favoriteRouter;