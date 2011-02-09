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

var _typeface_js = {

	faces: {},

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

	pixelsFromCssAmount: function(cssAmount, defaultValue, element) {

		var matches = undefined;

		if (cssAmount == 'normal') {
			return defaultValue;

		} else if (matches = cssAmount.match(/([\-\d+\.]+)px/)) {
			return matches[1];

		} else {
			// thanks to Dean Edwards for this very sneaky way to get IE to convert 
			// relative values to pixel values
			
			var pixelAmount;
			
			var leftInlineStyle = element.style.left;
			var leftRuntimeStyle = element.runtimeStyle.left;

			element.runtimeStyle.left = element.currentStyle.left;

			if (!cssAmount.match(/\d(px|pt)$/)) {
				element.style.left = '1em';
			} else {
				element.style.left = cssAmount || 0;
			}

			pixelAmount = element.style.pixelLeft;
		
			element.style.left = leftInlineStyle;
			element.runtimeStyle.left = leftRuntimeStyle;
			
			return pixelAmount || defaultValue;
		}
	},

	capitalizeText: function(text) {
		return text.replace(/(^|\s)[a-z]/g, function(match) { return match.toUpperCase() } ); 
	},

	getElementStyle: function(e) {
		if (window.getComputedStyle) {
			return window.getComputedStyle(e, '');
		
		} else if (e.currentStyle) {
			return e.currentStyle;
		}
	},

	getRenderedText: function(e) {

		var browserStyle = this.getElementStyle(e.parentNode);

		var inlineStyleAttribute = e.parentNode.getAttribute('style');
		if (inlineStyleAttribute && typeof(inlineStyleAttribute) == 'object') {
			inlineStyleAttribute = inlineStyleAttribute.cssText;
		}

		if (inlineStyleAttribute) {

			var inlineStyleDeclarations = inlineStyleAttribute.split(/\s*\;\s*/);

			var inlineStyle = {};
			for (var i = 0; i < inlineStyleDeclarations.length; i++) {
				var declaration = inlineStyleDeclarations[i];
				var declarationOperands = declaration.split(/\s*\:\s*/);
				inlineStyle[declarationOperands[0]] = declarationOperands[1];
			}
		}

		var style = { 
			color: browserStyle.color, 
			fontFamily: browserStyle.fontFamily.split(/\s*,\s*/)[0].replace(/(^"|^'|'$|"$)/g, '').toLowerCase(), 
			fontSize: this.pixelsFromCssAmount(browserStyle.fontSize, 12, e.parentNode),
			fontWeight: this.cssFontWeightMap[browserStyle.fontWeight],
			fontStyle: browserStyle.fontStyle ? browserStyle.fontStyle : 'normal',
			fontStretchPercent: this.cssFontStretchMap[inlineStyle && inlineStyle['font-stretch'] ? inlineStyle['font-stretch'] : 'default'],
			textDecoration: browserStyle.textDecoration,
			lineHeight: this.pixelsFromCssAmount(browserStyle.lineHeight, 'normal', e.parentNode),
			letterSpacing: this.pixelsFromCssAmount(browserStyle.letterSpacing, 0, e.parentNode),
			textTransform: browserStyle.textTransform
		};

		var face;
		if (
			this.faces[style.fontFamily]  
			&& this.faces[style.fontFamily][style.fontWeight]
		) {
			face = this.faces[style.fontFamily][style.fontWeight][style.fontStyle];
		}

		var text = e.nodeValue;
		
		if (
			e.previousSibling 
			&& e.previousSibling.nodeType == 1 
			&& e.previousSibling.tagName != 'BR' 
			&& this.getElementStyle(e.previousSibling).display.match(/inline/)
		) {
			text = text.replace(/^\s+/, ' ');
		} else {
			text = text.replace(/^\s+/, '');
		}
		
		if (
			e.nextSibling 
			&& e.nextSibling.nodeType == 1 
			&& e.nextSibling.tagName != 'BR' 
			&& this.getElementStyle(e.nextSibling).display.match(/inline/)
		) {
			text = text.replace(/\s+$/, ' ');
		} else {
			text = text.replace(/\s+$/, '');
		}
		
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

		var containerSpan = document.createElement('span');
		containerSpan.className = 'typeface-js-vector-container';
		
		var wordsLength = words.length;
		for (var i = 0; i < wordsLength; i++) {
			var word = words[i];
			
			var vector = this.renderWord(face, style, word);
			
			if (vector) {
				containerSpan.appendChild(vector.element);

				if (!this.disableSelection) {
					var selectableSpan = document.createElement('span');
					selectableSpan.className = 'typeface-js-selected-text';

					var wordNode = document.createTextNode(word);
					selectableSpan.appendChild(wordNode);

					if (this.vectorBackend != 'vml') {
						selectableSpan.style.marginLeft = -1 * (vector.width + 1) + 'px';
					}
					selectableSpan.targetWidth = vector.width;
					//selectableSpan.style.lineHeight = 1 + 'px';

					if (this.vectorBackend == 'vml') {
						vector.element.appendChild(selectableSpan);
					} else {
						containerSpan.appendChild(selectableSpan);
					}
				}
			}
		}

		return containerSpan;
	},

	applyElementVerticalMetrics: function(face, style, e) {

		if (style.lineHeight == 'normal') {
			style.lineHeight = this.pixelsFromPoints(face, style, face.lineHeight);
		}

		var cssLineHeightAdjustment = style.lineHeight - this.pixelsFromPoints(face, style, face.lineHeight);

		e.style.marginTop = Math.round( cssLineHeightAdjustment / 2 ) + 'px';
		e.style.marginBottom = Math.round( cssLineHeightAdjustment / 2) + 'px';
	
	},
	initializeSurface: function(face, style, text) {

		var extents = this.getTextExtents(face, style, text);

		var canvas = document.createElement('canvas');
		if (this.disableSelection) {
			canvas.innerHTML = text;
		}

		canvas.height = Math.round(this.pixelsFromPoints(face, style, face.lineHeight));
		canvas.width = Math.round(this.pixelsFromPoints(face, style, extents.x, 'horizontal'));

		this.applyElementVerticalMetrics(face, style, canvas);

		if (extents.x > extents.ha) 
			canvas.style.marginRight = Math.round(this.pixelsFromPoints(face, style, extents.x - extents.ha, 'horizontal')) + 'px';

		var ctx = canvas.getContext('2d');

		var pointScale = this.pixelsFromPoints(face, style, 1);
		ctx.scale(pointScale * style.fontStretchPercent, -1 * pointScale);
		ctx.translate(0, -1 * face.ascender);
		ctx.fillStyle = style.color;

		return { context: ctx, canvas: canvas };
	},
	renderGlyph: function(ctx, face, char, style) {

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

			var outlineLength = outline.length;
			for (var i = 0; i < outlineLength; ) {

				var action = outline[i++];

				switch(action) {
					case 'm':
						ctx.moveTo(outline[i++], outline[i++]);
						break;
					case 'l':
						ctx.lineTo(outline[i++], outline[i++]);
						break;

					case 'q':
						var cpx = outline[i++];
						var cpy = outline[i++];
						ctx.quadraticCurveTo(outline[i++], outline[i++], cpx, cpy);
						break;

					case 'b':
						var x = outline[i++];
						var y = outline[i++];
						ctx.bezierCurveTo(outline[i++], outline[i++], outline[i++], outline[i++], x, y);
						break;
				}
			}					
		}
		if (glyph.ha) {
			var letterSpacingPoints = 
				style.letterSpacing && style.letterSpacing != 'normal' ? 
					this.pointsFromPixels(face, style, style.letterSpacing) : 
					0;

			ctx.translate(glyph.ha + letterSpacingPoints, 0);
		}
	},
	renderWord: function(face, style, text) {
		var surface = this.initializeSurface(face, style, text);
		var ctx = surface.context;
		var canvas = surface.canvas;
		ctx.beginPath();
		ctx.save();

		var chars = text.split('');
		var charsLength = chars.length;
		for (var i = 0; i < charsLength; i++) {
			this.renderGlyph(ctx, face, chars[i], style);
		}

		ctx.fill();

		if (style.textDecoration == 'underline') {

			ctx.beginPath();
			ctx.moveTo(0, face.underlinePosition);
			ctx.restore();
			ctx.lineTo(0, face.underlinePosition);
			ctx.strokeStyle = style.color;
			ctx.lineWidth = face.underlineThickness;
			ctx.stroke();
		}

		return { element: ctx.canvas, width: Math.floor(canvas.width) };
	
	},
	setVectorBackend: function(backend) {

		this.vectorBackend = backend;
		var backendFunctions = ['renderWord', 'initializeSurface', 'renderGlyph'];

		for (var i = 0; i < backendFunctions.length; i++) {
			var backendFunction = backendFunctions[i];
			this[backendFunction] = this.vectorBackends[backend]['_' + backendFunction];
		}
	}
};