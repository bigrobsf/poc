'use strict';
/* jshint esversion: 6 */
/* jshint devel:true */
/* jshint node: true */
/* jshint browser: true */
/* jshint jquery: true */

// class definition
let EdgeDetector = function(imgPixels, context, imgW, imgH, threshold) {
  this.imgPixels = imgPixels;
  this.context = context;
  this.imgW = imgW;
  this.imgH = imgH;
  this.threshold = threshold || 30;
};

EdgeDetector.prototype.searchImage = function() {
  let index = 0;
  let pixel;

  let left;
  let top;
  let right;
  let bottom;

  for (let y = 0; y < this.imgPixels.height; y++) {
    for (let x = 0; x < this.imgPixels.width; x++) {

      // Get this pixel's data - we're looking at the blue channel only
      // Since this is a B/W photo, all color channels are the same.
      // For color photos, we would make this work for all channels.
      index = (x + y * this.imgW) * 4;
      pixel = this.imgPixels.data[index + 2];
      console.log('index, pixel: ', index, pixel);

      // Get the values of the surrounding pixels
      // Color data is stored [r,g,b,a][r,g,b,a]
      // in sequence.
      left = this.imgPixels.data[index - 4];
      right = this.imgPixels.data[index + 2];
      top = this.imgPixels.data[index - (this.imgW * 4)];
      bottom = this.imgPixels.data[index + (this.imgW * 4)];

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

EdgeDetector.prototype.plotPoint = function(x, y) {
  console.log('x, y: ', x, y);
  this.context.beginPath();
  this.context.arc(x, y, 0.5, 0, 2 * Math.PI, false);
  this.context.fillStyle = 'blue';
  this.context.fill();
  this.context.beginPath();
};
