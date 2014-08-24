var util = require('util'),
	fs = require('fs'),
	path = require('path'),
	assign = require('lodash-node/modern/objects/assign'),
	mkdirp = require('mkdirp'),
	Base = require('./base');

module.exports = SCSSGenerator;


function SCSSGenerator (options) {
	if (typeof options === 'undefined') {
		options = {}
	}

	this.log('options', options);

	options = assign({}, options, {
		outputPath: 'app/styles', 
		name: 'sprites',
		ext: '.scss'
	})


	if (!options.destDir) {
		throw new Error('must have destDir argument in options');
	}

	this.relativePath = options.outputPath;
	this.outputPath = path.join(options.destDir, options.outputPath);
	this.outputFile = path.join(this.outputPath, options.name + options.ext);
	this.ext = options.ext;
	this.spriteName = options.name;
}

util.inherits(SCSSGenerator, Base);

SCSSGenerator.prototype.generateSCSS = function(rule){
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

  return this.compile(template, rule);
};

SCSSGenerator.prototype.generateSCSSFile = function(config) {
  var list = config.coordinates;  
  var context = '';
  for (var key in list) {
    var rule = list[key];
    var name = path.basename(key, '.png');
    rule['name'] = name;
    rule['offsetX'] = rule.x > 0 ? -rule.x : 0;
    rule['offsetY'] = rule.y > 0 ? -rule.y : 0;
    rule['totalWidth'] = config.properties.width;
    rule['totalHeight'] = config.properties.height;
    rule['imagePath'] = path.join('../', this.relativePath, this.spriteName + this.ext);

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


SCSSGenerator.prototype.generate = function(data){
	mkdirp.sync(this.outputPath);

    fs.writeFileSync(this.outputFile, this.generateSCSSFile(data));
	this.log("\twrite to", this.outputFile);
}

SCSSGenerator.prototype.isStyle = true;

