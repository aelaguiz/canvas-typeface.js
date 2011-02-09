/*****************************************************************
 * canvas-typeface.js - Modified typeface.js that draws directly
 * to canvas elements
 * 
 ****************************************************************/
 
/*****************************************************************

typeface.js, version 0.14 | typefacejs.neocracy.org

Copyright (c) 2008 - 2009, David Chester davidchester@gmx.net 

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*****************************************************************/
CanvasTypeface = function() {
	this.faces = {}
}

CanvasTypeface.prototype = {
	constructor: new CanvasTypeface(),


	loadFace: function(typefaceData) {

		var familyName = typefaceData.familyName.toLowerCase();
		
		if (!this.faces[familyName]) {
			this.faces[familyName] = {};
		}
		if (!this.faces[familyName][typefaceData.cssFontWeight]) {
			this.faces[familyName][typefaceData.cssFontWeight] = {};
		}

		var face = this.faces[familyName][typefaceData.cssFontWeight][typefaceData.cssFontStyle] = typefaceData;
		face.loaded = true;
	},

	log: function(message) {
		
		if (this.quiet) {
			return;
		}
		
		message = "typeface.js: " + message;
		
		if (this.customLogFn) {
			this.customLogFn(message);

		} else if (window.console && window.console.log) {
			window.console.log(message);
		}
		
	},
	
	pixelsFromPoints: function(face, style, points, dimension) {
		var pixels = points * parseInt(style.fontSize) * 72 / (face.resolution * 100);
		if (dimension == 'horizontal' && style.fontStretchPercent) {
			pixels *= style.fontStretchPercent;
		}
		return pixels;
	},

	pointsFromPixels: function(face, style, pixels, dimension) {
		var points = pixels * face.resolution / (parseInt(style.fontSize) * 72 / 100);
		if (dimension == 'horizontal' && style.fontStretchPrecent) {
			points *= style.fontStretchPercent;
		}
		return points;
	},

	cssFontWeightMap: {
		normal: 'normal',
		bold: 'bold',
		400: 'normal',
		700: 'bold'
	},

	cssFontStretchMap: {
		'ultra-condensed': 0.55,
		'extra-condensed': 0.77,
		'condensed': 0.85,
		'semi-condensed': 0.93,
		'normal': 1,
		'semi-expanded': 1.07,
		'expanded': 1.15,
		'extra-expanded': 1.23,
		'ultra-expanded': 1.45,
		'default': 1
	},
	
	fallbackCharacter: '.',

	configure: function(args) {
		var configurableOptionNames = [ 'customLogFn',  'customClassNameRegex', 'customTypefaceElementsList', 'quiet', 'verbose', 'disableSelection' ];
		
		for (var i = 0; i < configurableOptionNames.length; i++) {
			var optionName = configurableOptionNames[i];
			if (args[optionName]) {
				if (optionName == 'customLogFn') {
					if (typeof args[optionName] != 'function') {
						throw "customLogFn is not a function";
					} else {
						this.customLogFn = args.customLogFn;
					}
				} else {
					this[optionName] = args[optionName];
				}
			}
		}
	},

	getTextExtents: function(face, style, text) {
		var extentX = 0;
		var extentY = 0;
		var horizontalAdvance;
	
		var textLength = text.length;
		for (var i = 0; i < textLength; i++) {
			var glyph = face.glyphs[text.charAt(i)] ? face.glyphs[text.charAt(i)] : face.glyphs[this.fallbackCharacter];
			var letterSpacingAdjustment = this.pointsFromPixels(face, style, style.letterSpacing);

			// if we're on the last character, go with the glyph extent if that's more than the horizontal advance
			extentX += i + 1 == textLength ? Math.max(glyph.x_max, glyph.ha) : glyph.ha;
			extentX += letterSpacingAdjustment;

			horizontalAdvance += glyph.ha + letterSpacingAdjustment;
		}
		return { 
			x: extentX, 
			y: extentY,
			ha: horizontalAdvance
			
		};
	},

	capitalizeText: function(text) {
		return text.replace(/(^|\s)[a-z]/g, function(match) { return match.toUpperCase() } ); 
	},
	render: function(text, options, ctx) {
		var style = { 
			color: options.color, 
			fontFamily: options.fontFamily.split(/\s*,\s*/)[0].replace(/(^"|^'|'$|"$)/g, '').toLowerCase(), 
			fontSize: options.fontSize,
			fontWeight: this.cssFontWeightMap[options.fontWeight ? options.fontWeight : 'normal'],
			fontStyle: options.fontStyle ? options.fontStyle : 'normal',
			fontStretchPercent: this.cssFontStretchMap[options['font-stretch'] ? options['font-stretch'] : 'default'],
			textDecoration: options.textDecoration,
			lineHeight: options.lineHeight,
			letterSpacing: options.letterSpacing ? options.letterSpacing : 0,
			textTransform: options.textTransform,
			rotationX: options.rotationX ? options.rotationX: 0,
			rotationY: options.rotationY ? options.rotationY: 0,
			rotationZ: options.rotationZ ? options.rotationZ: 0,
			eyeDistance: options.eyeDistance ? options.eyeDistance: 0,
			z: options.z ? options.z: 0,
		};

		var face;
		if (
			this.faces[style.fontFamily]  
			&& this.faces[style.fontFamily][style.fontWeight]
		) {
			face = this.faces[style.fontFamily][style.fontWeight][style.fontStyle];
		}

		text = text.replace(/^\s+/, '');
		text = text.replace(/\s+$/, '');
		text = text.replace(/\s+/g, ' ');
	
		if (style.textTransform && style.textTransform != 'none') {
			switch (style.textTransform) {
				case 'capitalize':
					text = this.capitalizeText(text);
					break;
				case 'uppercase':
					text = text.toUpperCase();
					break;
				case 'lowercase':
					text = text.toLowerCase();
					break;
			}
		}

		if (!face) {
			var excerptLength = 12;
			var textExcerpt = text.substring(0, excerptLength);
			if (text.length > excerptLength) {
				textExcerpt += '...';
			}
		
			var fontDescription = style.fontFamily;
			if (style.fontWeight != 'normal') fontDescription += ' ' + style.fontWeight;
			if (style.fontStyle != 'normal') fontDescription += ' ' + style.fontStyle;
		
			this.log("couldn't find typeface font: " + fontDescription + ' for text "' + textExcerpt + '"');
			return;
		}
	
		var words = text.split(/\b(?=\w)/);
		
		ctx.save();
		
		this.initializeSurface(face, style, text, ctx);
		
		var wordsLength = words.length;
		for (var i = 0; i < wordsLength; i++) {
			var word = words[i];
			
			//console.log("Rendering word " + word);
			this.renderWord(face, style, word, ctx);
		}
		
		ctx.restore();
	},

	initializeSurface: function(face, style, text, ctx) {

		var extents = this.getTextExtents(face, style, text);

		var pointScale = this.pixelsFromPoints(face, style, 1);
		ctx.scale(pointScale * style.fontStretchPercent, -1 * pointScale);
		ctx.translate(0, -1 * face.ascender);
		ctx.fillStyle = style.color;
	},
	projectedX: function projectedX(x, y,z, eyeDistance) {
		return x / ((z + eyeDistance)/eyeDistance);
	},
	projectedY: function projectedY(x, y,z, eyeDistance) {
		return y / ((z + eyeDistance)/eyeDistance);
	},
	projectedCoords: function projectedCoords(x, y, z, eyeDistance) {
		return {x: this.projectedX(x,y,z,eyeDistance), y: this.projectedY(x,y,z,eyeDistance)};
	},
	rotateCoordinates: function rotateCoordinates(inCoords, outCoords,RadianX, RadianY, RadianZ, OriginX, OriginY, OriginZ) {
		var x= inCoords[0]-OriginX,
			y = inCoords[1]-OriginY,
			z = inCoords[2]-OriginZ,
			sinY = Math.sin(RadianY),
			sinX = Math.sin(RadianX),
			sinZ = Math.sin(RadianZ),
			cosY = Math.cos(RadianY),
			cosX = Math.cos(RadianX),
			cosZ = Math.cos(RadianZ);
		
		outCoords[0] = (x * (cosY * cosZ)) + 
						(y * (-cosX*sinZ+sinX*sinY*cosZ)) + 
						(z * (sinX*sinZ+cosX*sinY*cosZ)) + OriginX;
						
		outCoords[1] = (x * (cosY * sinZ)) + 
						(y * (cosX * cosZ+sinX*sinY*sinZ)) + 
						(z * (-sinX * cosZ+cosX*sinY*sinZ)) + OriginY;
						
		outCoords[2] = (x * -sinY) + 
						(y * (sinX * cosY)) + 
						(z * (cosX * cosY)) + OriginZ;
						
	},
	renderGlyph: function(ctx, face, char, style) {
		var z = style.z,
			eyeDistance = style.eyeDistance,
			rX = style.rotationX, 
			rY = style.rotationY, 
			rZ = style.rotationZ,
		 	coords,
			rotCoords = [],
			quadCoords,
			bezCoords,
			glyphWidth,
			glyphHeight,
			originX = 0,
			originY = 0,
			originZ = style.z/2;
		var glyph = face.glyphs[char];

		if (!glyph) {
			//this.log.error("glyph not defined: " + char);
			return this.renderGlyph(ctx, face, this.fallbackCharacter, style);
		}

		
		if (glyph.o) {
			
			var outline;
			if (glyph.cached_outline) {
				outline = glyph.cached_outline;
			} else {
				outline = glyph.o.split(' ');
				glyph.cached_outline = outline;
			}
			
			glyphWidth = glyph.x_max-glyph.x_min;
			glyphHeight = face.ascender;
			
			originX = glyphWidth/2;
			originY = glyphHeight/2;


			/*
			 * Draws an origin x so it's easier to picture rotation, but not useful for production
			 */

			/*
			ctx.lineWidth=5;
			this.rotateCoordinates([originX, 0, z], rotCoords, rX,rY,rZ, originX, originY, 0);
			coords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
			ctx.moveTo(coords.x, coords.y);
			
			this.rotateCoordinates([originX, glyphHeight, z], rotCoords, rX,rY,rZ, originX, originY, 0);
			coords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
			ctx.lineTo(coords.x, coords.y);
			
			ctx.stroke();
			
			this.rotateCoordinates([0, originY, z], rotCoords, rX,rY,rZ, originX, originY, 0);
			coords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
			ctx.moveTo(coords.x, coords.y);
			
			this.rotateCoordinates([glyphWidth, originY, z], rotCoords, rX,rY,rZ, originX, originY, 0);
			coords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
			ctx.lineTo(coords.x, coords.y);
			
			ctx.stroke();
			
			ctx.lineWidth=1;*/
			
			var outlineLength = outline.length;
			for (var i = 0; i < outlineLength; ) {

				var action = outline[i++];

				switch(action) {
					case 'm':
						this.rotateCoordinates([outline[i++], outline[i++], z], rotCoords, rX,rY,rZ, originX, originY, originZ);
						coords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
						ctx.moveTo(coords.x, coords.y);
						break;
					case 'l':
						this.rotateCoordinates([outline[i++], outline[i++], z], rotCoords, rX,rY,rZ, originX, originY, originZ);
						coords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
						ctx.lineTo(coords.x, coords.y);
						break;

					case 'q':
						this.rotateCoordinates([outline[i++], outline[i++], z], rotCoords, rX,rY,rZ, originX, originY, originZ);
						coords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
						
						this.rotateCoordinates([outline[i++], outline[i++], z], rotCoords, rX,rY,rZ, originX, originY, originZ);
						quadCoords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
						ctx.quadraticCurveTo(quadCoords.x, quadCoords.y, coords.x, coords.y);
						break;

					case 'b':
						this.rotateCoordinates([outline[i++], outline[i++], z], rotCoords, rX,rY,rZ, originX, originY, originZ);
						coords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
						
						this.rotateCoordinates([outline[i++], outline[i++], z], rotCoords, rX,rY,rZ, originX, originY, originZ);
						bezCoords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
						
						this.rotateCoordinates([outline[i++], outline[i++], z], rotCoords, rX,rY,rZ, originX, originY, originZ);
						quadCoords = this.projectedCoords(rotCoords[0],rotCoords[1],rotCoords[2], eyeDistance);
						
						ctx.bezierCurveTo(bezCoords.x, bezCoords.y, quadCoords.x, quadCoords.y, coords.x, coords.y);
						break;
				}
			}					
		}
		if (glyph.ha) {
			var letterSpacingPoints = 
				style.letterSpacing && style.letterSpacing != 'normal' ? 
					this.pointsFromPixels(face, style, style.letterSpacing) : 
					0;

			//console.log("Translated " + (glyph.ha + letterSpacingPoints));
			ctx.translate(glyph.ha + letterSpacingPoints, 0);
		}
	},
	renderWord: function(face, style, text, ctx) {
		ctx.beginPath();

		var chars = text.split('');
		var charsLength = chars.length;
		for (var i = 0; i < charsLength; i++) {
			this.renderGlyph(ctx, face, chars[i], style);
		}

		ctx.fill();

		if (style.textDecoration == 'underline') {

			ctx.beginPath();
			ctx.moveTo(0, face.underlinePosition);
			//ctx.restore();
			ctx.lineTo(0, face.underlinePosition);
			ctx.strokeStyle = style.color;
			ctx.lineWidth = face.underlineThickness;
			ctx.stroke();
		}
	}
};

Typeface = _typeface_js = new CanvasTypeface();
