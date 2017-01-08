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
    adjColor();
    sepia();

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
