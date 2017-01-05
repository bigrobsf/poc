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
  this.threshold = threshold || 30;
};

EdgeDetector.prototype.searchImage = function() {
  let index = 0;
  let pixel = 0;

  let left;
  let top;
  let right;
  let bottom;

  for (let y = 0; y < this.imgH; y++) {
    for (let x = 0; x < this.imgW; x++) {

      // Get this pixel's data - from the blue channel only.
      // Since this is a B/W photo, all color channels are the same.
      // For color photos, we would make this work for all channels.
      index = (x + y * this.imgW) * 4;
      pixel = this.imgPixels.data[index + 2];

      // Get the values of the surrounding pixels
      // Color data is stored [r,g,b,a][r,g,b,a]
      // in sequence.
      left = this.imgPixels.data[index - 4];
      right = this.imgPixels.data[index + 2];
      top = this.imgPixels.data[index - (this.imgW * 4)];
      bottom = this.imgPixels.data[index + (this.imgW * 4)];

      // console.log('index pixel left right top bottom: ', index, pixel, left, right, top, bottom);
      // Compare all surrounding pixels
      if (pixel > left + this.threshold) {
        this.plotPoint(x, y);
      }
      else if (pixel < left - this.threshold) {
        this.plotPoint(x, y);
      }
      else if (pixel > right + this.threshold) {
        this.plotPoint(x, y);
      }
      else if (pixel < right - this.threshold) {
        this.plotPoint(x, y);
      }
      else if (pixel > top + this.threshold) {
        this.plotPoint(x, y);
      }
      else if (pixel < top - this.threshold) {
        this.plotPoint(x, y);
      }
      else if (pixel > bottom + this.threshold) {
        this.plotPoint(x, y);
      }
      else if (pixel < bottom - this.threshold) {
        this.plotPoint(x, y);
      }
    }
  }
};

// =============================================================================
// draws a tiny circle of one pixel diameter where edge is detected and fills it
EdgeDetector.prototype.plotPoint = function(x, y) {
  // console.log('plotPoint: ', x,y);
  this.layerCtx.beginPath();
  this.layerCtx.arc(x, y, 0.5, 0, 2 * Math.PI, false);
  this.layerCtx.fillStyle = 'blue';
  this.layerCtx.fill();
  this.layerCtx.beginPath();

  this.edgeCtx.beginPath();
  this.edgeCtx.arc(x, y, 0.5, 0, 2 * Math.PI, false);
  this.edgeCtx.fillStyle = 'black';
  this.edgeCtx.fill();
  this.edgeCtx.beginPath();
};
