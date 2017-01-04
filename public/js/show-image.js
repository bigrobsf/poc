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
    getInvertedColor();
    // getGrayscale();
    blurImage();

    document.getElementById('origCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });
  };

  imageObj.src = imageURL;
  // return context.canvas.toDataURL('data/jpeg', 1.0);
}


//==============================================================================
// create inverted image
function getInvertedColor() {
  let imgObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('invCanvas');
  let context = canvas.getContext('2d');

  let imgW = imgObj.width;
  let imgH = imgObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  context.drawImage(imgObj, 0, 0);

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
    console.log('hello');
    window.open(canvas.toDataURL('image/jpeg'), '_blank');
  });

  return context.canvas.toDataURL('data/jpeg', 1.0);
}


//==============================================================================
// create grayscale image
function getGrayscale() {
  let imgObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('grayCanvas');
  let context = canvas.getContext('2d');

  let imgW = imgObj.width;
  let imgH = imgObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  context.drawImage(imgObj, 0, 0);

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
// create blurred image
function blurImage() {
  let img = new Image();

  img.onload = function() {

    let imgObj = document.getElementById('grayCanvas');

    let cvsElement = document.getElementById('blurCanvas');
    let context = cvsElement.getContext('2d');

    let imgW = imgObj.width;
    let imgH = imgObj.height;
    cvsElement.width = imgW;
    cvsElement.height = imgH;

    let blurStrength = '';

    if (imgW > 800 || imgH > 800) {
      blurStrength = 'blur(3px)';
    } else {
      blurStrength = 'blur(1px)';
    }

    context.filter = blurStrength;
    context.drawImage(imgObj, 0, 0);

    document.getElementById('blurCanvas').addEventListener('click', function() {
      window.open(cvsElement.toDataURL('image/jpeg'), '_blank');
    });

    // return context.canvas.toDataURL('data/jpeg', 1.0);
  };

  img.src = getGrayscale();
}
