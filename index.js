var Writer = require('broccoli-writer'),
	replace = require('broccoli-replace'),
	Spritesmith = require('spritesmith');

module.exports = BroccoliSpritesmith;
BroccoliSpritesmith.prototype = Object.create(Writer.prototype);
BroccoliSpritesmith.prototype.constructor = MyCompiler;
function BroccoliSpritesmith (arg1, arg2, ...) {
  if (!(this instanceof BroccoliSpritesmith)) return new BroccoliSpritesmith(arg1, arg2, ...);
  ...
};

BroccoliSpritesmith.prototype.write = function (readTree, destDir) {
  ...
};



var sprites = ['sprite1.png', 'sprite2.jpg', 'sprite3.png'];
Spritesmith({'src': sprites}, function (err, result) {
  result.image; // Binary string representation of image
  result.coordinates; // Object mapping filename to {x, y, width, height} of image
  result.properties; // Object with metadata about spritesheet {width, height}
});