var colors = require('colors');

module.exports = Base;


function Base (options) {

}

Base.prototype.isImage = false;
Base.prototype.isStyle = false;

Base.prototype.compile = function(template, context) {
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

Base.prototype.generate = function() {
	throw Error('nonimplement');
}

Base.prototype.log = function() {
  if (process.env.NODE_ENV === 'test') {
    var args = [].slice.call(arguments, 0);
    // console.log(args);
    args.unshift('debug:'.green);
    console.log.apply(null, args);
  }

};