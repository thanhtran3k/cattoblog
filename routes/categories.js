var express = require('express');
var router = express.Router();

var mongo = require('mongodb');
var db = require('monk')('localhost/mango');

router.get('/show/:category', function(req, res, next) {
	var posts = db.get('posts');

	//Get value from url
	posts.find({category: req.params.category}, {}, function(err, posts){
		res.render('index',{
  			'title': req.params.category,
  			'posts': posts
  		});
	});  	
});


router.get('/add', function(req, res, next) {
		res.render('addcategory',{
  			'title': 'Add Category'  			
  		});
});

//mapping with views
router.post('/add', function(req, res, next){
	//Form values
	var name = req.body.name;
	
	//validation
	req.checkBody('name', 'This field is required').notEmpty();	

	var errors = req.validationErrors();
	if(errors){
		res.render('addcategory', {
			"errors": errors
		});
	}else{
		var categories = db.get('categories');
		categories.insert({
			"name": name,
		}, function(err, category){
			if(err){
				req.send(err);
			}else{
				req.flash('success', 'Success!');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});
module.exports = router;
