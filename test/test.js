var should = require('should'),
	BroccoliSpritesmith = require('..'),
	path = require('path'),
	fs = require('fs'),
	Builder = require('broccoli').Builder;

describe('BroccoliSpritesmith generate all', function(){
	it ("Story 1", function(done){

		var spriteTree = BroccoliSpritesmith('test/images'),
		 	builder = new Builder(spriteTree);

 		builder.build().then(function (hash) {
 			var destStyleFile = path.join(hash.directory, 'app/styles/sprites.scss'), 
 				destImageFile = path.join(hash.directory, 'assets/sprites.png');

        	fs.existsSync(destStyleFile).should.be.true;
			fs.existsSync(destImageFile).should.be.true;

        	done();
        }).catch(function(e){
        	console.trace(e);
        });
		
	});

	it ("Story 2 only generate styles", function(done) {
		var spriteTree = BroccoliSpritesmith('test/images', {
				output: 'scss'
			}),
		 	builder = new Builder(spriteTree);


 		builder.build().then(function (hash) {
 			var destStyleFile = path.join(hash.directory, 'app/styles/sprites.scss'), 
 				destImageFile = path.join(hash.directory, 'assets/sprites.png');

        	fs.existsSync(destStyleFile).should.be.true;
			fs.existsSync(destImageFile).should.be.false;

        	done();
        }).catch(function(e){
        	console.trace(e);
        });


	});

	it ("Story 2 only generate sprite image", function(done) {
		var spriteTree = BroccoliSpritesmith('test/images', {
				output: 'image'
			}),
		 	builder = new Builder(spriteTree);


 		builder.build().then(function (hash) {
 			var destStyleFile = path.join(hash.directory, 'app/styles/sprites.scss'), 
 				destImageFile = path.join(hash.directory, 'assets/sprites.png');

        	fs.existsSync(destStyleFile).should.be.false;
			fs.existsSync(destImageFile).should.be.true;

        	done();
        }).catch(function(e){
        	console.trace(e);
        });
	});	
});