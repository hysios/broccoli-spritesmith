var Writer = require('broccoli-writer'),
  replace = require('broccoli-replace'),
  defaults = require('lodash-node/modern/objects/defaults'),
  filter = require('lodash-node/modern/collections/filter'),
  fs = require('fs'),
  path = require('path'),
  walkSync = require('walk-sync'),
  Promise = require('rsvp').Promise,
  mkdirp = require('mkdirp'),
  colors = require('colors'),
  Spritesmith = require('spritesmith');

module.exports = BroccoliSpritesmith;
BroccoliSpritesmith.prototype = Object.create(Writer.prototype);
BroccoliSpritesmith.prototype.constructor = BroccoliSpritesmith;
function BroccoliSpritesmith (inputTree, options) {
  if (!(this instanceof BroccoliSpritesmith)) return new BroccoliSpritesmith(inputTree, options);
  options = options || {};

  this.options = defaults(options, {
    output: 'all',
    outputPath: 'assets',
    spriteName: 'sprites',
    ext: 'png',

    // sprite engine arguments
    engine: 'auto',
    algorithm: 'binary-tree',
    padding: 5
  });

  this.inputTree = inputTree;

  this._generators = {};

};

BroccoliSpritesmith.prototype.write = function (readTree, destDir) {
  var self = this;
  var ext = this.options.ext || '.png';
  var outputPath = this.options.outputPath;
  var spriteImagePath = path.join(process.cwd(), this.inputTree);


  this.log(spriteImagePath, this.inputTree);

  if (!fs.existsSync(spriteImagePath)) {
    return null;
  }

  var spritesImages = walkSync(spriteImagePath).filter(function(path) {
    return path.lastIndexOf(ext) === path.length - ext.length;
  }).map(function(file){
    self.log("\tdetecting:", file);
    return path.join(spriteImagePath, file);
  });


  var spriteName = this.options.spriteName;
  var ext = this.options.ext;
  // var spritesOutputFile = path.join(destDir, outputPath, spriteName + '.' + ext);
  // var spritesOutputSCSS = path.join(destDir, outputPath, 'sprites.scss');

  var runOptions = {
    src: spritesImages,
    padding: this.options.padding,
    algorithm: this.options.algorithm,
    engine: this.options.engine
  };

  return new Promise(function(resolve, reject){
    Spritesmith(runOptions, function(err, result){
      if (err) {
        reject(err);
      } else {

        var generators = self.loadGenerators({
          destDir: destDir,
          outputPath: outputPath,

        });

        self.log('load', generators.length, 'generator success!');

        generators.forEach(function(generator){

          if (generator.isImage) {
            generator.generate(result.image);
          } else {
            generator.generate(result);
          }
        });

        // fs.writeFileSync(spritesOutputFile, result.image, 'binary');
        // self.log("\twrite to", spritesOutputFile);
        // fs.writeFileSync(spritesOutputSCSS, self.generateSCSSFile(result));
        // self.log("\twrite to", spritesOutputSCSS);
        self.results = result
        resolve(destDir);
      }
    });
  });
};

BroccoliSpritesmith.prototype.loadGenerators = function(options) {
  var self = this, outputs;

  if (this.options.output === 'all') {
    outputs = ['image', 'scss'];
  } else {
    outputs = [this.options.output];
  }

  this.log('loadGenerators...', outputs);

  return outputs.map(function(type){
    return  self.loadGenerator(type, options);
  }).filter(function(generator){
    return !!generator;
  });
};

BroccoliSpritesmith.prototype.loadGenerator = function (type, options) {

  try {
    var Generator = require('./generators/' + type);
    return  new Generator(options);
  } catch (e) {
    this.log(e);
    return null;
  }
}

function compile (template, context) {
  var patt = /\{\{(\w+)\}\}/ig;
  var output = "";
  var pos = 0;
  while ((result = patt.exec(template)) != null)  {
    var found = result[1];
    var lastIndex = patt.lastIndex || 0;
    var startIndex = lastIndex - result[0].length
    // console.log(result[0], pos, startIndex, lastIndex);

    output += template.slice(pos, startIndex);
    output += typeof context[found] !== 'undefined' ? context[found] : '';
    pos = lastIndex;
  }
  output += template.slice(pos);
  return output;
}

BroccoliSpritesmith.prototype.log = function() {
  if (process.env.NODE_ENV === 'test') {
    var args = [].slice.call(arguments, 0);
    // console.log(args);
    args.unshift('debug:'.green);
    console.log.apply(null, args);
  }

};
