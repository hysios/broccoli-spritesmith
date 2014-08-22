var Writer = require('broccoli-writer'),
  replace = require('broccoli-replace'),
  defaults = require('lodash-node/modern/objects/defaults'),
  fs = require('fs'),
  path = require('path'),
  walkSync = require('walk-sync'),
  Promise = require('rsvp').Promise,
  mkdirp = require('mkdirp'),
  Spritesmith = require('spritesmith');

module.exports = BroccoliSpritesmith;
BroccoliSpritesmith.prototype = Object.create(Writer.prototype);
BroccoliSpritesmith.prototype.constructor = BroccoliSpritesmith;
function BroccoliSpritesmith (inputTree, options) {
  if (!(this instanceof BroccoliSpritesmith)) return new BroccoliSpritesmith(inputTree, options);
  options = options || {};

  this.options = defaults(options, {
    srcDir: 'public',
    rootPath: 'public',
    spritesPath: 'assets/sprites',
    spriteName: 'sprites_background',
    ext: 'png',
    engine: 'auto',
    algorithm: 'binary-tree',
    padding: 5
  });

  this.inputTree = inputTree;

};

BroccoliSpritesmith.prototype.write = function (readTree, destDir) {
  var self = this;
  var ext = this.options.ext || '.png';
  var spritesPath = this.options.spritesPath;
  var rootPath = path.join(process.cwd(), this.options.rootPath);
  var spriteImagePath = path.join(rootPath, spritesPath);

  if (!fs.existsSync(spriteImagePath)) {
    return null;
  }

  var spritesImages = walkSync(spriteImagePath).map(function(file){
    return path.join(spriteImagePath, file);
  });
  var spriteName = this.options.spriteName;
  var ext = this.options.ext;
  var spritesOutputFile = path.join(destDir, spritesPath, spriteName + '.' + ext);
  var spritesOutputSCSS = path.join(destDir, spritesPath, 'sprites.scss');

  var runOptions = {
    src: spritesImages,
    padding: this.options.padding,
    algorithm: this.options.algorithm    
  };

  return new Promise(function(resolve, reject){
    Spritesmith(runOptions, function(err, result){
      if (err) {
        reject(err);
      } else {
        mkdirp.sync(path.join(destDir, spritesPath));
        fs.writeFileSync(spritesOutputFile, result.image, 'binary');
        fs.writeFileSync(spritesOutputSCSS, self.generateSCSSFile(result));
        // fs.writeFileSync(spritesScssFile, result.)
        self.results = result
        resolve(destDir);
      }
    });
  });
};


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


BroccoliSpritesmith.prototype.generateSCSS = function(rule){
  var template = 
    "${{name}}-x: {{x}}px;\n" + 
    "${{name}}-y: {{y}}px;\n" + 
    "${{name}}-offset-x: {{offsetX}}px;\n" + 
    "${{name}}-offset-y: {{offsetY}}px;\n" + 
    "${{name}}-width: {{width}}px;\n" + 
    "${{name}}-height: {{height}}px;\n" + 
    "${{name}}-total-width: {{totalWidth}}px;\n" + 
    "${{name}}-total-height: {{totalHeight}}px;\n" +
    "${{name}}-image: '{{imagePath}}';\n" +
    "${{name}}: {{x}}px {{y}}px {{offsetX}}px {{offsetY}}px {{width}}px {{height}}px {{totalWidth}}px {{totalHeight}}px '{{imagePath}}';\n";

  return compile(template, rule);
};

BroccoliSpritesmith.prototype.generateSCSSFile = function(config) {
  var list = config.coordinates;  
  var context = '';
  for (var key in list) {
    var rule = list[key];
    var name = path.basename(key, '.' + this.options.ext);

    rule['name'] = name;
    rule['offsetX'] = rule.x > 0 ? -rule.x : 0;
    rule['offsetY'] = rule.y > 0 ? -rule.y : 0;
    rule['totalWidth'] = config.properties.width;
    rule['totalHeight'] = config.properties.height;
    rule['imagePath'] = path.join('../', this.options.spritesPath, this.options.spriteName + '.' + this.options.ext);

    context += this.generateSCSS(rule);
  }

  var mixins = 
    "@mixin sprite-width($sprite) {\n" +
    "  width: nth($sprite, 5);\n" +
    "}\n" +

    "@mixin sprite-height($sprite) {\n" +
    "  height: nth($sprite, 6);\n" +
    "}\n" +

    "@mixin sprite-position($sprite) {\n" +
    "  $sprite-offset-x: nth($sprite, 3);\n" +
    "  $sprite-offset-y: nth($sprite, 4);\n" +
    " background-position: $sprite-offset-x  $sprite-offset-y;\n" +
    "}\n" +

    "@mixin sprite-image($sprite) {\n" +
    "  $sprite-image: nth($sprite, 9);\n" +
    "  background-image: url(#{$sprite-image});\n" +
    "}\n" +

    "@mixin sprite($sprite) {\n" +
    "  @include sprite-image($sprite);\n" +
    "  @include sprite-position($sprite);\n" + 
    "  @include sprite-width($sprite);\n" +
    "  @include sprite-height($sprite);\n" +
    "}\n";

  return context + mixins;
};
