'use strict';
/* jshint esversion: 6 */
/* jshint devel:true */
/* jshint node: true */
/* jshint browser: true */
/* globals $:false */

// =============================================================================
// NOTE: code adapted from Avishkar Autar at semisignal.com
// =============================================================================
// GraphicsCore object
let GraphicsCore = {};

GraphicsCore.setPixel = function(imageData, index, r, g, b, a) {
  imageData.data[index + 0] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
};

// =============================================================================
// FXController object
function FXController(_ctxSource, _ctxDest, _theShader, _width, _height, _fps, _maxFrames) {
  this.ctxSource = _ctxSource;
  this.ctxDest = _ctxDest;
  this.theShader = _theShader;
  this.width = _width;
  this.height = _height;
  this.fps = _fps;
  this.curFrame = 1; // [1, ...]
  this.maxFrames = _maxFrames;
  this.numPassesPerFrame = _theShader.numPassesRequired;
  this.invervalPtr = null;

  this.shaderFunc = function (fxCtrlr, passNum, frameNum, maxFrames) {
    Shader.run(fxCtrlr.ctxSource, fxCtrlr.ctxDest, fxCtrlr.width,
      fxCtrlr.height, fxCtrlr.theShader, passNum, frameNum, maxFrames);
  };

  this.init = function() {
    let fxCtrlr = this;
    let runFunc = function() {
      fxCtrlr.run(fxCtrlr);
    };

    this.invervalPtr = setInterval(runFunc, 1000.0 / this.fps);
  };

  this.unInit = function() {
    clearInterval(this.invervalPtr);
    this.invervalPtr = null;
  };

  this.run = function (sender /*FXController*/) {
    for (let pn = 1; pn <= sender.numPassesPerFrame; pn++) {
      sender.shaderFunc(sender, pn, sender.curFrame, sender.maxFrames);
    }

    sender.curFrame++;

    if (sender.curFrame > sender.maxFrames) {
      sender.unInit();
    }
  };
}

// =============================================================================
// Shader object
// Note: Shader.<shader_name>.numPassesRequired must be defined
let Shader = {};

Shader.run = function (ctxSource, ctxDest, width, height, shaderFunc, passNum, frameNum, maxFrames) {
  //
  // netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead"); // REMOVE ME BEFORE DEPLOYMENT
  //

  let bufWrite = ctxDest.getImageData(0, 0, width, height);
  let imageData = null;

  if (passNum === 1 && frameNum === 1) {
    imageData = ctxSource.getImageData(0, 0, width, height);
  }
  else {
    imageData = ctxDest.getImageData(0, 0, width, height);
  }

  for (let y = 0; y < height; y++) {

      for (let x = 0; x < width; x++) {

          let index = (x + y * imageData.width) << 2;
          shaderFunc(imageData, bufWrite, index, x, y, imageData.data[index + 0], imageData.data[index + 1], imageData.data[index + 2], imageData.data[index + 3], passNum, frameNum, maxFrames);
      }
  }

  ctxDest.putImageData(bufWrite, 0, 0);
};

// =============================================================================
// gaussian blur filter
Shader.gaussFact = Array(1, 6, 15, 20, 15, 6, 1);
Shader.gaussSum = 64; // not used, >> 6 bitshift used in Shader.gaussBlur()
Shader.gaussWidth = 7;

Shader.gaussBlur = function (imageData, bufWrite, index, x, y, r, g, b, a, passNum, frameNum, maxFrames) {
  if (passNum == 1 && (x <= 0 || x >= imageData.width - 1)) {
    GraphicsCore.setPixel(bufWrite, index, r, g, b, a);
    return;
  }

  if (passNum == 2 && (y <= 0 || y >= imageData.height - 1)) {
    GraphicsCore.setPixel(bufWrite, index, r, g, b, a);
    return;
  }

  let readBuf = imageData;
  let writeBuf = bufWrite;

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumA = 0;

  for (let k = 0; k < Shader.gaussWidth; k++) {
    let nx = x;
    let ny = y;

    if (passNum === 1) { nx = (x - ((Shader.gaussWidth - 1) >> 1) + k); }
    else if (passNum === 2) { ny = (y - ((Shader.gaussWidth - 1) >> 1) + k); }
    else { }

    // wrap around if we're trying to read pixels beyond the edge
    if (nx < 0) { nx = readBuf.width + nx; }
    if (ny < 0) { ny = readBuf.height + ny; }
    if (nx >= readBuf.width) { nx = nx - readBuf.width; }
    if (ny >= readBuf.height) { ny = ny - readBuf.height; }

    let pxi = (nx + ny * readBuf.width) << 2;
    let pxR = readBuf.data[pxi];
    let pxG = readBuf.data[pxi + 1];
    let pxB = readBuf.data[pxi + 2];
    let pxA = readBuf.data[pxi + 3];

    // little hack to make alpha=0 pixels look a bit better
    // Note, the proper way to handle the alpha channel is to premultiply, blur, "unpremultiply"
    if (pxA === 0) {
      pxR = 255;
      pxG = 255;
      pxB = 255;
      pxA = 255;
    }

    sumR += pxR * Shader.gaussFact[k];
    sumG += pxG * Shader.gaussFact[k];
    sumB += pxB * Shader.gaussFact[k];
    sumA += pxA * Shader.gaussFact[k];
  }

  GraphicsCore.setPixel(writeBuf, index, sumR >> 6, sumG >> 6, sumB >> 6, sumA >> 6);
};

Shader.gaussBlur.numPassesRequired = 2;

// =============================================================================
// calls gaussian blur functions
function blurImage() {
  let img = new Image();

  img.onload = function() {
    // get source image (grayCanvas)
    let imgObj = document.getElementById('grayCanvas');
    let ctxSource = imgObj.getContext('2d');

    // setup destination
    let canvas = document.getElementById('blurCanvas');
    let context = canvas.getContext('2d');

    let imgW = imgObj.width;
    let imgH = imgObj.height;
    canvas.width = imgW;
    canvas.height = imgH;

    context.createImageData(imgW, imgH);

    let theShader = Shader.gaussBlur;
    let fxCtrlr = new FXController(ctxSource, context, theShader, imgW, imgH, 1, 5);

    fxCtrlr.init();

    document.getElementById('blurCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });
  };

  img.src = getGrayscale();
}
