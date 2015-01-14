broccoli-spritesmith
--------------------

this is spritesmit for broccoli plugins


Usage
-----

Example

```js 
	var BroccoliSpritesmith = require('broccoli-spritesmith'),
	var spriteTree = BroccoliSpritesmith('test/images');

```

API
---

BroccoliSpritesmith(tree, options)

Example `options` object:
```js
{
    output: 'all',
    outputPath: 'assets',
    spriteName: 'sprites',
    ext: 'png',

    // sprite engine arguments   
    engine: 'auto', // e.g. phantomjs, canvas, ...
    algorithm: 'binary-tree',
    padding: 5
}
```


`output` defaults is 'all', can be set `'scss'`, `'image'`, '`less`', but now only support `'scss'` , `'image'`

`engine`, `algorithm`, `padding` are spritesmith [options](https://github.com/Ensighten/spritesmith#documentation)

License

MIT © Hysios Hu
