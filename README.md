# 3D interactive graphics for jQuery

![canvas example](http://www.livereference.org/scene3d/images/scene3d-example.jpg)

SCENE3D is an 3D interactive graphics jQuery plugin based on HTML5 and X3DOM aimed for rapid and effortless prototyping of 3D scenes for the web.

## Example and usage

A quick and simple introduction

### HTML

```html
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<meta charset="utf-8">

<script src="http://www.x3dom.org/download/x3dom.js"></script>
<link rel='stylesheet' type='text/css' href='css/x3dom.css'/>
<link rel='stylesheet' type='text/css' href='http://www.x3dom.org/download/x3dom.css'/>
<script src="http://code.jquery.com/jquery-latest.js"></script>
<script src="scene3d.jquery.js"></script>

<script>
$(function() { 
	var myCanvas = $('#3dcanvas').scene3d();
	myCanvas.addBox (); // add an object
}); 
</script>
</head>

<body>
	<div id="3dcanvas"></div>
</body>
</html>
```

### jQuery

as simple as 1- 2- 3:

1) initialize a canvas:

```js
// with default options
var myCanvas = $('#3dcanvas').scene3d();

// or with options of your choice
var myCanvas = $('#3dcanvas').scene3d({
	width:		"600px",
	height:		"600px",
	background:	"#eeeeee"
});
```

2) add your 3D objects 

```js
myCanvas.addSphere({ x:1, y:0, z:2 }); 
myCanvas.addBox({ x:1, y:1, z:2, width:1, depth:1, height:1 });
myCanvas.addCone({ x:1, y:2, z:2, label:'3D Objects' });
myCanvas.addCylinder({ x:1, y:-2, z:2, radius:1, height:2,color:'#00aaff' });
```
or for example, use ajax calls to draw graphs from data files or databases

```js
$.getJSON( "actors.json", function( myGraph ) {	
	myCanvas.addGraph({ data: myGraph });
});	
```

3) click, rotate, pan, zoom and more ...

Demo and more examples in "examples" folder and in [http://www.livereference.org/scene3d/](http://www.livereference.org/scene3d/)

### Copyright
This software comes with the same license as jQuery. However, x3dom has its own license. Please check at [http://www.x3dom.org/](http://www.x3dom.org/)

_– [Aleksandar](http://www.livereference.org/scene3d/index.php)_
