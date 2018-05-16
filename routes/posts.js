var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './public/images' });

var mongo = require('mongodb');
var db = require('monk')('localhost/mango');


router.get('/show/:id', function(req, res, next) {
	var posts = db.get('posts');

	posts.findById(req.params.id, function(err, post){
		res.render('show',{
  			'post': post
  		});
	});  
});

router.get('/add', function(req, res, next) {
	var categories = db.get('categories');

	categories.find({}, {}, function(err, categories){
		res.render('addpost',{
  			'title': 'Add Post',
  			'categories': categories
  		});
	});  	
});


//mapping with views
router.post('/add', upload.single('image'), function(req, res, next){
	//Form values
	var title = req.body.title;
	var category = req.body.category;
	var author = req.body.author;
	var body = req.body.body;
	var date = new Date();

	if(req.file){
		var image = req.file.filename;
	}else{
		var image = 'noimage.jpg';
	}

	//validation
	req.checkBody('title', 'This field is required').notEmpty();
	req.checkBody('body', 'This field is required').notEmpty();

	var errors = req.validationErrors();
	if(errors){
		res.render('addpost', {
			"errors": errors
		});
	}else{
		var posts = db.get('posts');
		posts.insert({
			"title": title,
			"body": body,
			"category": category,
			"date": date,
			"author": author,
			"image": image
		}, function(err, post){
			if(err){
				res.send(err);
			}else{
				req.flash('success', 'Your post is successfully added to home page!');
				res.location('/');
				res.redirect('/');
			}
		});
	}

});

router.post('/addcomment', function(req, res, next){
	//Form values
	var postid = req.body.postid;
	var name = req.body.name;
	var email = req.body.email;
	var body = req.body.body;
	var commentdate = new Date();
	
	//validation
	req.checkBody('name', 'This field is required').notEmpty();
	req.checkBody('body', 'This field is required').notEmpty();
	req.checkBody('email', 'Email is required but never display').notEmpty();
	req.checkBody('email', 'Email is invalid').isEmail();

	var errors = req.validationErrors();

	if(errors){
		var posts = db.get('posts');
		posts.findById(postid, function(err, post){
			res.render('show', {
				"errors": errors,
				"post": post
			});
		});		
	}else{
		//object
		var comment = {
			"name": name,
			"email": email,
			"body": body,
			"commentdate": commentdate
		}
		var posts = db.get('posts');
		posts.update({
			"_id": postid
		}, {
			$push:{
				"comments":comment
			}
		}, function(err, doc){
			if(err){
				throw err;
			}else{
				req.flash('success', 'Your comment is sumitted');
				res.location('/posts/show/' + postid);
				res.redirect('/posts/show/' + postid);
			}
		});
	}
});

module.exports = router;
