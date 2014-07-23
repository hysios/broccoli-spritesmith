var Writer = require('broccoli-writer'),
	replace = require('broccoli-replace'),
	Spritesmith = require('spritesmith');

module.exports = BroccoliSpritesmith;
BroccoliSpritesmith.prototype = Object.create(Writer.prototype);
BroccoliSpritesmith.prototype.constructor = BroccoliSpritesmith;
function BroccoliSpritesmith (arg1, arg2, ...) {
  if (!(this instanceof BroccoliSpritesmith)) return new BroccoliSpritesmith(inputTree, options);
  options = options || {};

  this.options = defaults(options, {
    srcDir: 'public',
    rootPath: 'public',
    spritesPath: 'assets/sprites',
    spriteName: 'sprites_background',
    ext: 'png',
    engine: 'auto',
    algorithm: 'top-down',
    padding: 0
  });

  this.inputTree = inputTree;

};

BroccoliSpritesmith.prototype.write = function (readTree, destDir) {
  var self = this;
  var ext = this.options.ext || '.png';
  var spritesPath = this.options.spritesPath;
  var rootPath = path.join(process.cwd(), this.options.rootPath);
  var spriteImagePath = path.join(rootPath, spritesPath);
  var spritesImages = walkSync(spriteImagePath).map(function(file){
    return path.join(spriteImagePath, file);
  });
  var spriteName = this.options.spriteName;
  var ext = this.options.ext;
  var spritesOutputFile = path.join(destDir, spritesPath, spriteName + '.' + ext);

  var runOptions = {
    src: spritesImages
  };

  return new Promise(function(resolve, reject){
    spritesmith(runOptions, function(err, result){
      if (err) {
        reject(err);
      } else {
        mkdirp.sync(path.join(destDir, spritesPath));
        fs.writeFileSync(spritesOutputFile, result.image, 'binary');
        resolve(destDir);
      }
    });
  });
};
