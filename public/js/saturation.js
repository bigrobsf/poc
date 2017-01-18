'use strict';
/* jshint esversion: 6 */
/* jshint devel:true */
/* jshint node: true */
/* jshint browser: true */
/* globals $:false */

// =============================================================================
// working on this code to replace the simpler algorithm currently in use
// =============================================================================
function convertRGBToHSL(red, green, blue, hue, saturation, luminance) {
	let r, g, b, h, s, l; //this function works with floats between 0 and 1
	r = red / 255;
	g = green / 255;
	b = blue / 255;
	//Then, minColor and maxColor are defined. Mincolor is the value of the color component with
	// the smallest value, while maxColor is the value of the color component with the largest value.
	// These two variables are needed because the Lightness is defined as (minColor + maxColor) / 2.
	let maxColor = MAX(r, MAX(g, b));
	let minColor = MIN(r, MIN(g, b));
	//If minColor equals maxColor, we know that R=G=B and thus the color is a shade of gray.
	// This is a trivial case, hue can be set to anything, saturation has to be set to 0 because
	// only then it's a shade of gray, and lightness is set to R=G=B, the shade of the gray.
	//R == G == B, so it's a shade of gray
	if((r === g)&&(g === b)) {
		h = 0; //it doesn't matter what value it has
		s = 0;
		l = r; //doesn't matter if you pick r, g, or b
	}
	// If minColor is not equal to maxColor, we have a real color instead of a shade of gray,
	// so more calculations are needed:
	// Lightness (l) is now set to it's definition of (minColor + maxColor)/2.
	// Saturation (s) is then calculated with a different formula depending if light is in the first
	// half of the second half. This is because the HSL model can be represented as a double cone, the
	// first cone has a black tip and corresponds to the first half of lightness values, the second cone
	// has a white tip and contains the second half of lightness values.
	// Hue (h) is calculated with a different formula depending on which of the 3 color components is
	// the dominating one, and then normalized to a number between 0 and 1.
	else {
		let d = maxColor - minColor;
		l = (minColor + maxColor) / 2;
		if(l < 0.5) s = d / (maxColor + minColor);
		else s = d / (2 - maxColor - minColor);
		if(r === maxColor) h = (g - b) / (maxColor - minColor);
		else if(g === maxColor) h = 2 + (b - r) / (maxColor - minColor);
		else h = 4 + (r - g) / (maxColor - minColor);
		h /= 6; //to bring it to a number between 0 and 1
		if(h < 0) h++;
	}
	//Finally, H, S and L are calculated out of h,s and l as integers between 0..360 / 0 and 255 and
	// "returned"  as the result. Returned, because H, S and L were passed by reference to the function.
	hue = h * 360;
	saturation = s * 255;
	luminance = l * 255;
}

function convertHSLToRGB(hue, saturation, luminance, red, green, blue) {
	let r, g, b, h, s, l; //this function works with floats between 0 and 1
	let temp1, temp2, tempr, tempg, tempb;
	h = (hue % 260) / 360;
	s = saturation / 256;
	l = luminance / 256;
	//Then follows a trivial case: if the saturation is 0, the color will be a grayscale color,
	// and the calculation is then very simple: r, g and b are all set to the lightness.
	//If saturation is 0, the color is a shade of gray
	if(s === 0){
		r = l;
		g = l;
		b = l;
	}
	//If the saturation is higher than 0, more calculations are needed again. red, green and blue
	// are calculated with the formulas defined in the code.
	//If saturation > 0, more complex calculations are needed
	else {
		//Set the temporary values
		if(l < 0.5) temp2 = l * (1 + s);
		else
		temp2 = (l + s) - (l * s);
		temp1 = 2 * l - temp2;

		tempr = h + 1 / 3;
		if(tempr > 1) tempr--;
		tempg = h;
		tempb = h - 1 / 3;
		if(tempb < 0) tempb++;

		//Red
		if(tempr < 1 / 6) r = temp1 + (temp2 - temp1) * 6 * tempr;
		else if(tempr < 0.5) r = temp2;
		else if(tempr < 2 / 3) r = temp1 + (temp2 - temp1) * ((2 / 3) - tempr) * 6;
		else r = temp1;

		//Green
		if(tempg < 1 / 6) g = temp1 + (temp2 - temp1) * 6 * tempg;
		else if(tempg < 0.5) g = temp2;
		else if(tempg < 2 / 3) g = temp1 + (temp2 - temp1) * ((2 / 3) - tempg) * 6;
		else g = temp1;

		//Blue
		if(tempb < 1 / 6) b = temp1 + (temp2 - temp1) * 6 * tempb;
		else if(tempb < 0.5) b = temp2;
		else if(tempb < 2 / 3) b = temp1 + (temp2 - temp1) * ((2 / 3) - tempb) * 6;
		else b = temp1;
	}
	//And finally, the results are returned as integers between 0 and 255.
	red = r * 255;
	green = g * 255;
	blue = b * 255;
}


function pixSat(imgPixels, fract) {
	// normalize parameters
	if (fract < -1) fract = -1;
	else if (fract > 1) fract = 1;

	let datas, lines;
	let i, j, bx, by, bw, bh, w, h, wpls;
	let red, green, blue;
	if (!imgPixels || pixGetDepth(imgPixels) != 32) return; //not 32bpp
	pixGetDimensions(imgPixels, w, h, NULL);
	datas = pixGetData(imgPixels);
	wpls = pixGetWpl(imgPixels);

	for (i = 0; i < h; i++) {
		lines = datas + i * wpls;
		for (j = 0; j < w; j++) {
			extractRGBValues(lines[j], red, green, blue);
			let h, s, l;
			convertRGBToHSL(red, green, blue, h, s, l);

			if (fract >= 0) {
				// we don't want to saturate unsaturated colors -> we get only defects
				// for unsaturared colors this tends to 0
				let gray_factor = s / 255;
				// how far can we go?
				// if we increase saturation, we have "255-s" space left
				let var_interval = 255 - s;
				// compute the new saturation
				s = s + fract * var_interval * gray_factor;
			} else {
				// how far can we go?
				// for decrease we have "s" left
				let var_interval = s;
				s = s + fract * var_interval  ;
			}

			convertHSLToRGB(h,s,l, red, green, blue);
			composeRGBPixel(red, green, blue, lines + j);
		}
	}
}
