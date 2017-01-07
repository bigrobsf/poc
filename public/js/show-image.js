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
    edgeDetect();
    pixelize();
    adjBrightness();
    adjAlpha();

    document.getElementById('origCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });

    document.getElementById('dl-original').addEventListener('click', function() {
      this.href = canvas.toDataURL('image/jpeg');
    }, false);
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

  document.getElementById('dl-inverted').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

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

  document.getElementById('dl-grayscale').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}


//==============================================================================
// create blurred image for edge detection
function blurImage(blurRadius = 2, listener = false) {
  let imageObj = document.getElementById('grayCanvas');

  let canvas = document.getElementById('blurCanvas');
  let context = canvas.getContext('2d');

  let imgW = imageObj.width;
  let imgH = imageObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  context.filter = 'blur(' + blurRadius + 'px)';

  context.drawImage(imageObj, 0, 0);
  let rangeInput = document.getElementById('blur-radius');

if (listener === false) {
  document.getElementById('blurCanvas').addEventListener('click', function() {
    window.open(canvas.toDataURL('image/jpeg'), '_blank');
  });

  rangeInput.addEventListener('change', function() {
    document.getElementById('blur-radius').textContent = rangeInput.value;
    blurRadius = Number(rangeInput.value);

    blurImage(blurRadius, listener);
  });

  listener = true;
}

  document.getElementById('dl-blurred').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}


//==============================================================================
// edge detection main function - creates two canvases, one that is 'layered'
// and one that is just a plot of the edges
function edgeDetect(threshold = 10, listener = false) {
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

  let rangeInput = document.getElementById('threshold');

  if (listener === false) {
    document.getElementById('layerCanvas').addEventListener('click', function() {
      window.open(layerCvs.toDataURL('image/jpeg'), '_blank');
    });

    rangeInput.addEventListener('change', function() {
      document.getElementById('threshold').textContent = rangeInput.value;
      threshold = Number(rangeInput.value);

      edgeDetect(threshold, listener);
    });

    listener = true;
  }

  document.getElementById('dl-layered').addEventListener('click', function() {
    this.href = layerCvs.toDataURL('image/jpeg');
  }, false);

  // png encoding to make image viewable in new window
  document.getElementById('edgeCanvas').addEventListener('click', function() {
    window.open(edgeCvs.toDataURL('image/png'), '_blank');
  });

  document.getElementById('dl-edges').addEventListener('click', function() {
    this.href = edgeCvs.toDataURL('image/png');
  }, false);

  return edgeDetector.edgeCtx.canvas.toDataURL('data/png', 1.0);
}

//==============================================================================
// main function for pixelized image
function pixelize(blockSize = 20, listener = false) {
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

  let rangeInput = document.getElementById('block-size');

  if (listener === false) {
    document.getElementById('pxlCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });

    rangeInput.addEventListener('change', function() {
      document.getElementById('block-size').textContent = rangeInput.value;
      blockSize = Number(rangeInput.value);

      pixelize(blockSize, listener);
    });

    listener = true;
  }

  document.getElementById('dl-pixelated').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}

//==============================================================================
// change brightness of image
function adjBrightness(adjustment = 30, listener = false) {
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

  let rangeInput = document.getElementById('brightness');

  if (listener === false) {
    document.getElementById('brightCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });

    rangeInput.addEventListener('change', function() {
      document.getElementById('brightness').textContent = rangeInput.value;
      adjustment = Number(rangeInput.value);

      adjBrightness(adjustment, listener);
    });

    listener = true;
  }

  document.getElementById('dl-brightness').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}

//==============================================================================
// change transparency of image
function adjAlpha(alpha = 125, listener = false) {
  console.log(alpha);

  let imageObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('alphaCanvas');
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

      // if (x < 40 && y < 40) console.log(imgPixels.data[i], imgPixels.data[i + 1], imgPixels.data[i + 2], imgPixels.data[i + 3]);

      imgPixels.data[i + 3] = alpha;
    }
  }

  context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

  let rangeInput = document.getElementById('alpha');

  if (listener === false) {
    document.getElementById('alphaCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });

    rangeInput.addEventListener('change', function() {
      document.getElementById('alpha').textContent = rangeInput.value;
      alpha = Number(rangeInput.value);

      adjAlpha(alpha, listener);
    });

    listener = true;
  }

  document.getElementById('dl-alpha').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}
