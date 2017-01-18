'use strict';
/* jshint esversion: 6 */
/* jshint devel:true */
/* jshint node: true */
/* jshint browser: true */
/* jshint jquery: true */

// =============================================================================
// class definition
let EdgeDetector = function(imgPixels, layerCtx, edgeCtx, imgW, imgH, threshold) {
  this.imgPixels = imgPixels;
  this.layerCtx = layerCtx;
  this.edgeCtx = edgeCtx;
  this.imgW = imgW;
  this.imgH = imgH;
  this.threshold = threshold;
};

// =============================================================================
// iterates through each pixel to get its intensity, the intensity of the surrounding
// pixels, and compares them
EdgeDetector.prototype.searchImage = function() {
  let index = 0;
  let pixel = 0;

  let left;
  let above;
  let right;
  let below;

  for (let y = 0; y < this.imgH; y++) {
    for (let x = 0; x < this.imgW; x++) {

      // Get this pixel's data from the blue channel only.
      // We could us any channel as they are all the same for a black and white photo.
      // For color photos, we would implement this for all channels.
      index = (x + y * this.imgW) * 4;
      pixel = this.imgPixels.data[index + 2];

      // Get the values of the surrounding pixels
      // Color data is stored [r,g,b,a][r,g,b,a] in sequence.
      left = this.imgPixels.data[index - 4];
      right = this.imgPixels.data[index + 2];
      above = this.imgPixels.data[index - (this.imgW * 4)];
      below = this.imgPixels.data[index + (this.imgW * 4)];

      // console.log('index pixel left right above below: ', x, y, ' - ', index, pixel, left, right, above, below);

      // Compare brightness of all surrounding pixels
      if (pixel > left + this.threshold) {
        this.plotEdge(x, y);
      }
      else if (pixel < left - this.threshold) {
        this.plotEdge(x, y);
      }
      else if (pixel > right + this.threshold) {
        this.plotEdge(x, y);
      }
      else if (pixel < right - this.threshold) {
        this.plotEdge(x, y);
      }
      else if (pixel > above + this.threshold) {
        this.plotEdge(x, y);
      }
      else if (pixel < above - this.threshold) {
        this.plotEdge(x, y);
      }
      else if (pixel > below + this.threshold) {
        this.plotEdge(x, y);
      }
      else if (pixel < below - this.threshold) {
        this.plotEdge(x, y);
      }
    }
  }
};

// =============================================================================
// draws a tiny circle of one pixel diameter where edge is detected and fills it
EdgeDetector.prototype.plotEdge = function(x, y) {
  // console.log('plotEdge: ', x,y);

  // draws edge points on copy of searched image
  this.layerCtx.beginPath();
  this.layerCtx.arc(x, y, 0.5, 0, 2 * Math.PI, false);
  this.layerCtx.fillStyle = 'blue';
  this.layerCtx.fill();
  this.layerCtx.beginPath();

  // draws edge points on blank canvas
  this.edgeCtx.beginPath();
  this.edgeCtx.arc(x, y, 0.5, 0, 2 * Math.PI, false);
  this.edgeCtx.fillStyle = 'black';
  this.edgeCtx.fill();
  this.edgeCtx.beginPath();
};
