'use-strict';
/* jshint esversion: 6 */
/* jshint devel:true */
/* jshint node: true */

//==============================================================================
// opens retrieved image in HTML Canvas element
function openImgInCanvas(imageURL) {
  let canvas = document.getElementById('origCanvas');
  let context = canvas.getContext('2d');

  let imageObj = new Image();
  imageObj.crossOrigin = 'anonymous';

  imageObj.onload = function() {
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    context.drawImage(this, 0, 0);
    invertColor();
    grayscale();
    blurImage();
    edgeDetect(5);
    pixelize(50);
    adjBrightness(100);

    document.getElementById('origCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });
  };

  imageObj.src = imageURL;
  return context.canvas.toDataURL('data/jpeg', 1.0);
}


//==============================================================================
// create inverted image
function invertColor() {
  let imageObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('invCanvas');
  let context = canvas.getContext('2d');

  let imgW = imageObj.width;
  let imgH = imageObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  context.drawImage(imageObj, 0, 0);

  let imgPixels = context.getImageData(0, 0, imgW, imgH);

  for (let y = 0; y < imgPixels.height; y++) {
    for (let x = 0; x < imgPixels.width; x++) {
      let i = (y * 4) * imgPixels.width + x * 4;

      let red = 255 - imgPixels.data[i];
      let green = 255 - imgPixels.data[i + 1];
      let blue = 255 - imgPixels.data[i + 2];

      imgPixels.data[i] = red;
      imgPixels.data[i + 1] = green;
      imgPixels.data[i + 2] = blue;
    }
  }

  context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

  document.getElementById('invCanvas').addEventListener('click', function() {
    window.open(canvas.toDataURL('image/jpeg'), '_blank');
  });

  return context.canvas.toDataURL('data/jpeg', 1.0);
}


//==============================================================================
// create grayscale image for edge detection
function grayscale() {
  let imageObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('grayCanvas');
  let context = canvas.getContext('2d');

  let imgW = imageObj.width;
  let imgH = imageObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  context.drawImage(imageObj, 0, 0);

  let imgPixels = context.getImageData(0, 0, imgW, imgH);

  for (let y = 0; y < imgPixels.height; y++) {
    for (let x = 0; x < imgPixels.width; x++) {
      let i = (y * 4) * imgPixels.width + x * 4;

      // grayscale conversion coefficients from ITU-R BT.601 specification
      let avg = (imgPixels.data[i] * 0.299 + imgPixels.data[i + 1] * 0.587 + imgPixels.data[i + 2] * 0.114);

      imgPixels.data[i] = avg;
      imgPixels.data[i + 1] = avg;
      imgPixels.data[i + 2] = avg;
    }
  }

  context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

  document.getElementById('grayCanvas').addEventListener('click', function() {
    window.open(canvas.toDataURL('image/jpeg'), '_blank');
  });

  return context.canvas.toDataURL('data/jpeg', 1.0);
}


//==============================================================================
// create blurred image for edge detection
function blurImage() {
  let imageObj = document.getElementById('grayCanvas');

  let canvas = document.getElementById('blurCanvas');
  let context = canvas.getContext('2d');

  let imgW = imageObj.width;
  let imgH = imageObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  let blurStrength = '';

  if (imgW > 600 || imgH > 600) {
    blurStrength = 'blur(2px)';
  } else {
    blurStrength = 'blur(1px)';
  }

  context.filter = blurStrength;

  context.drawImage(imageObj, 0, 0);

  document.getElementById('blurCanvas').addEventListener('click', function() {
    window.open(canvas.toDataURL('image/jpeg'), '_blank');
  });

  return context.canvas.toDataURL('data/jpeg', 1.0);
}


//==============================================================================
// edge detection main function - creates two canvases, one that is 'layered'
// and one that is just a plot of the edges
function edgeDetect(threshold = 10) {
  let imageObj = document.getElementById('blurCanvas');

  let layerCvs = document.getElementById('layerCanvas');
  let layerCtx = layerCvs.getContext('2d');

  let edgeCvs = document.getElementById('edgeCanvas');
  let edgeCtx = edgeCvs.getContext('2d');

  let imgW = imageObj.width;
  let imgH = imageObj.height;

  layerCvs.width = imgW;
  layerCvs.height = imgH;

  edgeCvs.width = imgW;
  edgeCvs.height = imgH;

  layerCtx.drawImage(imageObj, 0, 0);

  let imgPixels = layerCtx.getImageData(0, 0, imgW, imgH);

  let edgeDetector = new EdgeDetector(imgPixels, layerCtx, edgeCtx, imgW, imgH, threshold);
  edgeDetector.searchImage();

  edgeDetector.layerCtx.drawImage(layerCvs, 0, 0);
  edgeDetector.edgeCtx.drawImage(edgeCvs, 0, 0);

  document.getElementById('layerCanvas').addEventListener('click', function() {
    window.open(layerCvs.toDataURL('image/jpeg'), '_blank');
  });

  // png encoding to make image viewable in new window
  document.getElementById('edgeCanvas').addEventListener('click', function() {
    window.open(edgeCvs.toDataURL('image/png'), '_blank');
  });

  return edgeDetector.edgeCtx.canvas.toDataURL('data/png', 1.0);
}

//==============================================================================
// main function for pixelized image
function pixelize(blockSize = 10) {
  let imageObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('pxlCanvas');
  let context = canvas.getContext('2d');

  let imgW = imageObj.width;
  let imgH = imageObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  context.drawImage(imageObj, 0, 0);

  let imgPixels = context.getImageData(0, 0, imgW, imgH);
  renderPixelImg(context, imgW, imgH, blockSize);

  document.getElementById('pxlCanvas').addEventListener('click', function() {
    window.open(canvas.toDataURL('image/jpeg'), '_blank');
  });

  return context.canvas.toDataURL('data/jpeg', 1.0);
}

//==============================================================================
// change brightness of image
function adjBrightness(adjustment = 50) {
  let imageObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('brightCanvas');
  let context = canvas.getContext('2d');

  let imgW = imageObj.width;
  let imgH = imageObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  context.drawImage(imageObj, 0, 0);

  let imgPixels = context.getImageData(0, 0, imgW, imgH);

  for (let y = 0; y < imgPixels.height; y++) {
    for (let x = 0; x < imgPixels.width; x++) {
      let i = (y * 4) * imgPixels.width + x * 4;

      imgPixels.data[i] += adjustment;
      imgPixels.data[i + 1] += adjustment;
      imgPixels.data[i + 2] += adjustment;
    }
  }

  context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

  document.getElementById('brightCanvas').addEventListener('click', function() {
    window.open(canvas.toDataURL('image/jpeg'), '_blank');
  });

  return context.canvas.toDataURL('data/jpeg', 1.0);
}
