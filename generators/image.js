var util = require('util'),
	fs = require('fs'),
	path = require('path'),
	assign = require('lodash-node/modern/objects/assign'),
	mkdirp = require('mkdirp'),
	Base = require('./base');

module.exports = ImageGenerator;


function ImageGenerator (options) {
	if (typeof options === 'undefined') {
		options = {}
	}

	options = assign({}, options, {
		outputPath: 'assets', 
		name: 'sprites',
		ext: '.png'
	})

	if (!options.destDir) {
		throw new Error('must have destDir argument in options');
	}	

	this.relativePath = options.outputPath;
	this.outputPath = path.join(options.destDir, options.outputPath);
	this.outputFile = path.join(this.outputPath, options.name + options.ext);
}

util.inherits(ImageGenerator, Base);

ImageGenerator.prototype.generate = function(data){
	mkdirp.sync(this.outputPath);
	fs.writeFileSync(this.outputFile, data, 'binary');
	this.log("\twrite to", this.outputFile);	
}

ImageGenerator.prototype.isImage = true;

