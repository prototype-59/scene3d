/*
* scene3d - X3DOM jQuery wrapper for x3DOM geometry
*
* Aleksandar Radovanovic (2014)
* http://www.livereference.org/scene3d
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
*
* Based on X3DOM (http://www.x3dom.org)
*
*/
(function ( $ ) {
	
	$.fn.scene3d = function( options ) {
		var options = $.extend( {}, $.fn.scene3d.defaults, options );
		return this.each(function() {			
			var element = $( this );
			x3domInit(element, options);
		});
	};

	/* private functions
	--------------------------------------------------------------------------*/
	
	var NODE_COLOR = "#cccccc";
	var FONT_COLOR = "#000000";
	var FONT_FAMILY = 'SERIF';
	var FONT_SIZE = .5;
	var RADIUS = .1;
	var ANIMATION_CODE = '<timeSensor DEF="clock" cycleInterval="16" loop="true"></timeSensor>\
		<OrientationInterpolator DEF="spinThings" key="0 0.25 0.5 0.75 1" keyValue="0 1 0 0  0 1 0 1.57079  0 1 0 3.14159  0 1 0 4.71239  0 1 0 6.28317"></OrientationInterpolator>\
        <ROUTE fromNode="clock" fromField="fraction_changed" toNode="spinThings" toField="set_fraction"></ROUTE>\
    	<ROUTE fromNode="spinThings" fromField="value_changed" toNode="rotationArea" toField="set_rotation"></ROUTE>';
	
	// hex to RGB converter
	function hex2rgb( hex ) {
		hex = (hex.substr(0,1)=="#") ? hex.substr(1) : hex;
		return [parseInt(hex.substr(0,2), 16)/255, parseInt(hex.substr(2,2), 16)/255, parseInt(hex.substr(4,2), 16)/255];
	};	
		
	// change existing arguments
	function setArgs (oDefault, oArg)
	{
		$.each( oArg, function( key, value ) {
			oDefault[key] = value;
		});
		return oDefault;
	}

	function x3domInit(elem, options) {
		var animationCode = options.sceneAnimation ? ANIMATION_CODE : '';
		var xmlx3d = $($.parseXML( '\
		<x3d id="x3dElement" width="150px" height="150px" showStat="false" showLog="false">\
		<Scene><transform DEF="rotationArea"><Background skyColor="1 1 1"/><Viewpoint orientation="0,0,0,1" position="0,0,10" /></transform>'
		+animationCode+'</Scene>\
		</x3d>' ));			

		xmlx3d.find('x3d').attr('width', options.width);		
		xmlx3d.find('x3d').attr('height', options.height);
		xmlx3d.find('x3d').attr('showStat', options.showStat);
		xmlx3d.find('x3d').attr('showLog', options.showLog);		
		xmlx3d.find('Background').attr('skyColor', hex2rgb(options.background));
		xmlx3d.find('Viewpoint').attr('orientation', options.ViewpointOrientation);
		xmlx3d.find('Viewpoint').attr('position', options.ViewpointPosition);
		var x3dElem = (new XMLSerializer()).serializeToString(xmlx3d[0]);
		FONT_FAMILY = options.fontFamily;
		FONT_SIZE = options.fontSize;
		elem.append(x3dElem);
	};
	
	function rndNumber (min, max)
	{
		return (Math.random() * (max - min)) + min;
	}	
	
	/* DRAWING
	------------------------------------------------------------------------ */

	function setLabel ( oLabelAttr ) {
		var z = oLabelAttr.z + oLabelAttr.labeloffset;
		var label = '\
			<transform translation="' + oLabelAttr.x + ' ' + oLabelAttr.y + ' ' + z + '">\<shape>\
			<appearance>\
				<material diffuseColor="'+hex2rgb(oLabelAttr.fontColor)+'" ></material>\
			</appearance>\
			<text string="'+oLabelAttr.label+'">\
				<fontstyle family="'+oLabelAttr.fontFamily+'" size="'+oLabelAttr.fontSize+'"></fontstyle>\
			</text>\
			</shape></transform>';
			return label;
  	}

	function drawText( oArg) {
		var oAttr = {
			x:0, y:0, z:0, label:'',
			fontFamily:FONT_FAMILY, fontColor:FONT_COLOR, fontSize:FONT_SIZE};
		if (oArg != null) { oAttr = setArgs (oAttr, oArg); }
		
		var gObj = $('\
			<transform translation="' + oAttr.x + ',' + oAttr.y + ',' + oAttr.z + '">\<shape>\
			<appearance>\
				<material diffuseColor="'+hex2rgb(oAttr.fontColor)+'" ></material>\
			</appearance>\
			<text string="'+oAttr.label+'">\
				<fontstyle family="'+oAttr.fontFamily+'" size="'+oAttr.fontSize+'"></fontstyle>\
			</text>\
			</shape></transform>');
			return gObj;
  		}
	function drawLine( oArg ) {
		var oAttr = {
			x1:0, y1:0, z1:0,
			x2:0, y2:0, z2:0,
			linewidth:1, linetype:1,
			color:NODE_COLOR,
			label:'', labeloffset: 0.1,
			fontFamily:FONT_FAMILY,
			fontColor:FONT_COLOR,
			fontSize:FONT_SIZE
		};
		oAttr = setArgs (oAttr, oArg);
		var oText = oAttr;
		oText.x = (oAttr.x1+oAttr.x2) / 2;
		oText.y = (oAttr.y1+oAttr.y2) / 2;
		oText.z = (oAttr.z1+oAttr.z2) / 2;
		var label = (oAttr.label.length > 0) ? setLabel ( oText ) : '';
		var gObj = $('\
			<transform><shape>\
			<appearance><material emissiveColor="'+hex2rgb(oAttr.color)+'"></material>\
			<LineProperties linetype="'+oAttr.linetype+'" linewidthScaleFactor="'+oAttr.linewidth+'" applied="true" containerField="lineProperties"></LineProperties>\
			</appearance>\
			<LineSet>\
				<Coordinate point="' + oAttr.x1 + ' ' + oAttr.y1 + ' ' + oAttr.z1 + ' ' + oAttr.x2 + ' ' + oAttr.y2 + ' ' + oAttr.z2 +'"/>\
			</LineSet>\
			</shape></transform>'+label);
		if (oAttr.id) { $(gObj).find('shape').attr("id", oAttr.id); } 
		if (oAttr.onclick) { $(gObj).find('shape').attr("onclick", oAttr.onclick); } 
		$.each( oAttr, function( key, value ) {
			if (key.match("^data-")) { $(gObj).find('shape').attr(key, value); }
		});
		return gObj;
	}
	
	function drawSphere ( oArg) {
		var oAttr = {
			x:0, y:0, z:0, radius:.1, color:NODE_COLOR,
			label:'', labeloffset: 0.1,
			fontFamily:FONT_FAMILY, fontColor:FONT_COLOR, fontSize:FONT_SIZE
		};
		oAttr = setArgs (oAttr, oArg);
		var label = (oAttr.label.length > 0) ? setLabel ( oAttr ) : '';
		var gObj = $('\
			<transform translation="' + oAttr.x + ' ' + oAttr.y + ' ' + oAttr.z + '">\
			<shape><appearance><material diffuseColor="'+hex2rgb(oAttr.color)+'"></material></appearance>\
			<Sphere radius="'+oAttr.radius+'"></Sphere></shape>\
			</transform>'+label);
		if (oAttr.id) { $(gObj).find('shape').attr("id", oAttr.id); } 
		if (oAttr.onclick) { $(gObj).find('shape').attr("onclick", oAttr.onclick); } 
		// find data-* attribute
		$.each( oAttr, function( key, value ) {
			if (key.match("^data-")) { $(gObj).find('shape').attr(key, value); }
		});
		return gObj;
	}

	function drawCylinder ( oArg) {
		var oAttr = {
			x:0, y:0, z:0, radius:.1, height:1, color:NODE_COLOR,
			label:'', labeloffset: 0.1,
			fontFamily:FONT_FAMILY, fontColor:FONT_COLOR, fontSize:FONT_SIZE
		};
		oAttr = setArgs (oAttr, oArg);
		var label = (oAttr.label.length > 0) ? setLabel ( oAttr ) : '';
		var gObj = $('\
			<transform translation="' + oAttr.x + ' ' + oAttr.y + ' ' + oAttr.z + '">\
			<shape><appearance><material diffuseColor="'+hex2rgb(oAttr.color)+'"></material></appearance>\
			<Cylinder radius="'+oAttr.radius+' "height="'+oAttr.height+'"></Cylinder></shape>\
			</transform>'+label);
		if (oAttr.id) { $(gObj).find('shape').attr("id", oAttr.id); } 
		if (oAttr.onclick) { $(gObj).find('shape').attr("onclick", oAttr.onclick); } 
		$.each( oAttr, function( key, value ) {
			if (key.match("^data-")) { $(gObj).find('shape').attr(key, value); }
		});
		return gObj;
	}
	
	function drawCone ( oArg) {
		var oAttr = {
			x:0, y:0, z:0, height:1, bottomRadius:1.0,topRadius:0, color:NODE_COLOR,
			label:'', labeloffset: 0.1,
			fontFamily:FONT_FAMILY,fontColor:FONT_COLOR,fontSize:FONT_SIZE
		};
		oAttr = setArgs (oAttr, oArg);
		var label = (oAttr.label.length > 0) ? setLabel ( oAttr ) : '';
		var gObj = $('\
			<transform translation="' + oAttr.x + ' ' + oAttr.y + ' ' + oAttr.z + '">\
			<shape><appearance><material diffuseColor="'+hex2rgb(oAttr.color)+'"></material></appearance>\
			<Cone  height="'+oAttr.height+'" bottomRadius="'+oAttr.bottomRadius+'" topRadius="'+oAttr.topRadius+'"></Cone></shape>\
			</transform>'+label);
		if (oAttr.id) { $(gObj).find('shape').attr("id", oAttr.id); } 
		if (oAttr.onclick) { $(gObj).find('shape').attr("onclick", oAttr.onclick); } 
		$.each( oAttr, function( key, value ) {
			if (key.match("^data-")) { $(gObj).find('shape').attr(key, value); }
		});
		return gObj;
	}

	function drawBox ( oArg) {
		var oAttr = {
			x:0, y:0, z:0, width:1, depth:1,height:1, color:NODE_COLOR,
			label:'', labeloffset: 0.1,
			fontFamily:FONT_FAMILY,fontColor:FONT_COLOR,fontSize:FONT_SIZE
		};
		oAttr = setArgs (oAttr, oArg);
		var label = (oAttr.label.length > 0) ? setLabel ( oAttr ) : '';
		var gObj = $('\
			<transform translation="' + oAttr.x + ' ' + oAttr.y + ' ' + oAttr.z + '">\
			<shape><appearance><material diffuseColor="'+hex2rgb(oAttr.color)+'"></material></appearance>\
			<Box size="'+oAttr.width+','+oAttr.height+','+oAttr.depth+'"></Box></shape>\
			</transform>'+label);
		if (oAttr.id) { $(gObj).find('shape').attr("id", oAttr.id); } 
		if (oAttr.onclick) { $(gObj).find('shape').attr("onclick", oAttr.onclick); } 
		$.each( oAttr, function( key, value ) {
			if (key.match("^data-")) { $(gObj).find('shape').attr(key, value); }
		});
		return gObj;
	}
	function addInline ( oArg) {
		var oAttr = { x:0, y:0, z:0, url:'' };
		oAttr = setArgs (oAttr, oArg);
		var gObj = $('\
			<transform translation="' + oAttr.x + ' ' + oAttr.y + ' ' + oAttr.z + '">\
			<Inline url="'+oAttr.url+'" />\
			</transform>');
		return gObj;
	}
	
	//-------------------------------------------------------------------------
	// set cuboid coordinates for graph
	//-------------------------------------------------------------------------

	function cuboidGraph( oGraph, c_width, c_height, c_depth )
	{
		var x, y, z, dx, dy, dz;	
		var cellCount = 0;
		var divisions = [1, 1, 1];
		while ( cellCount < oGraph.node.length ) {
			var i = divisions.indexOf(Math.min.apply(Math, divisions));
			divisions[i]++;
			cellCount = divisions[0] * divisions[1] * divisions[2];
		}
		dx = c_width/divisions[0]; dy = c_height/divisions[1]; dz= c_depth/divisions[2];	
		var coordinates = {'coord':[]};
		var a = c_width/2, b = c_height/2, c = c_depth/2;
		for ( x = -a; x < a; x+=dx ) {
			for ( y = -b; y < b; y+=dy ) {
				for ( z = -c; z < c; z+=dz ) {
					coordinates.coord.push ([x+dx/2,y+dy/2,z+dz/2]);
					var xx = x+dx/2, yy = y+dy/2, zz = z+dz/2;
				}
			}
		}
		$.each(oGraph.node, function( index, node ) {
			var coords = coordinates.coord.pop();
			node.x = coords[0];
			node.y = coords[1];
			node.z = coords[2];
		});
		return oGraph;
	}
	
	/* public functions
	--------------------------------------------------------------------------*/

	$.fn.addText = function( oArg) {
		this.find('scene').append($(drawText( oArg )));
  	}
	$.fn.addLine = function( oArg ) {
		this.find('scene').append($(drawLine( oArg )));
	}

	$.fn.addCylinder = function( oArg) {
		this.find('scene').append( $( drawCylinder( oArg ) ) );
	};	
	$.fn.addSphere = function( oArg) {
		this.find('scene').append( $( drawSphere( oArg ) ) );
	};	
	$.fn.addCone = function( oArg ) {
		this.find('scene').append( $( drawCone( oArg ) ) );
	};	
	$.fn.addBox = function( oArg ) {
		this.find('scene').append( $( drawBox( oArg ) ) );
	};	
	
	
	/* draw graph
	------------------------------------------------------------------------ */
	$.fn.addGraph = function( oArg ) {
		var oGraph = oArg.data;
		if ( oArg.type == 'cuboid' ) {
			oGraph = cuboidGraph( oGraph, oArg.width, oArg.height, oArg.depth );
		}
		var scene = this;
		var oAttr = {};
		var lineCoords = [];
		$.each(oGraph.node, function( index, node ) {
			oAttr = {	// set default values
				id: 'n-'+  parseInt(rndNumber( 1, 99999)),
				x: rndNumber( -oArg.width/2, oArg.width/2),
				y: rndNumber( -oArg.height/2, oArg.height/2),
				z: rndNumber( -	oArg.depth/2, oArg.depth/2),
				radius: rndNumber( .1, .2),
				color: '#'+Math.floor(Math.random()*16777215).toString(16),
				label: '',
				fontFamily:FONT_FAMILY,
				fontColor:FONT_COLOR,
				fontSize:FONT_SIZE
			};
			oAttr = setArgs (oAttr, oArg); // user's input overwrite defaults
			oAttr = setArgs (oAttr, node); // node data overwrite user input
			lineCoords.push( {id:oAttr.id, x:oAttr.x, y:oAttr.y, z:oAttr.z } );
			scene.find('scene').append($(drawSphere( oAttr )));
		});
		oAttr = {};
		$.each(oGraph.edge, function( index, edge ) {
			var edgeSource = $.grep(lineCoords, function ( obj ) {
				return ( obj.id === edge.source );
			})[0];
			var edgeTarget = $.grep(lineCoords, function ( obj ) {
				return ( obj.id === edge.target );
			})[0];
			oAttr = {
				id: 'n-'+  parseInt(rndNumber( 1, 99999)),
				x1: edgeSource.x,
				y1: edgeSource.y,
				z1: edgeSource.z,
				x2: edgeTarget.x,
				y2: edgeTarget.y,
				z2: edgeTarget.z,
				linewidth: 0,
				color: NODE_COLOR,
				label: '',
				fontFamily:FONT_FAMILY,
				fontColor:FONT_COLOR,
				fontSize:FONT_SIZE
			}
			oAttr = setArgs (oAttr, edge); // overwrite defaults
			scene.find('scene').append($(drawLine( oAttr )));
		});

	};
	
	$.fn.importX3D = function( oArg ) {
		this.find('scene').append($(addInline( oArg )));
	};
	
	$.fn.scene3d.defaults = {
		width:		"150px",
		height:		"150px",
		background:	"#ffffff",
		fontSize:	0.8,
		fontFamily:	'SERIF',
		sceneAnimation: false,
		ViewpointOrientation: '0,0,0,1',//"0.1,-0.2,-0.2,-0.1" 
		ViewpointPosition: '0,0,10',
		showStat:	false,
		showLog:	false,
		id:			"x3dElement"		
	};
}( jQuery ));