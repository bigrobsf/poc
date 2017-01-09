'use-strict';
/* jshint esversion: 6 */
/* jshint devel:true */
/* jshint node: true */

//==============================================================================
// create blurred image for edge detection.
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

    // png encoding to make image viewable in new window
    document.getElementById('edgeCanvas').addEventListener('click', function() {
      window.open(edgeCvs.toDataURL('image/png'), '_blank');
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
// change color channel intensity
function adjColor(red = 0, green = 0, blue = 0, listener = false) {
  let imageObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('clrCanvas');
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

      imgPixels.data[i] += red;
      imgPixels.data[i + 1] += green;
      imgPixels.data[i + 2] += blue;
    }
  }

  context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

  let redInput = document.getElementById('red-adj');
  let greenInput = document.getElementById('green-adj');
  let blueInput = document.getElementById('blue-adj');

  if (listener === false) {
    document.getElementById('clrCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });

    redInput.addEventListener('change', function() {
      document.getElementById('red-adj').textContent = redInput.value;
      red = Number(redInput.value);

      adjColor(red, green, blue, listener);
    });

    greenInput.addEventListener('change', function() {
      document.getElementById('green-adj').textContent = greenInput.value;
      green = Number(greenInput.value);

      adjColor(red, green, blue, listener);
    });

    blueInput.addEventListener('change', function() {
      document.getElementById('blue-adj').textContent = blueInput.value;
      blue = Number(blueInput.value);

      adjColor(red, green, blue, listener);
    });

    listener = true;
  }

  document.getElementById('dl-color').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}


//==============================================================================
// change transparency of image
function adjAlpha(alpha = 125, listener = false) {
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

//==============================================================================
// adjustable sepia filter
function sepia(adjustment = 100, listener = false) {
  adjustment /= 100;

  let imageObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('sepiaCanvas');
  let context = canvas.getContext('2d');

  let imgW = imageObj.width;
  let imgH = imageObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  context.drawImage(imageObj, 0, 0);

  let imgPixels = context.getImageData(0, 0, imgW, imgH);

  let red = 0;
  let green = 0;
  let blue = 0;

  for (let y = 0; y < imgPixels.height; y++) {
    for (let x = 0; x < imgPixels.width; x++) {
      let i = (y * 4) * imgPixels.width + x * 4;

      red = imgPixels.data[i];
      green = imgPixels.data[i + 1];
      blue = imgPixels.data[i + 2];

      imgPixels.data[i] = Math.min(255, (red * (1 - (0.607 * adjustment))) + (green * (0.769 * adjustment)) + (blue * (0.189 * adjustment)));
      imgPixels.data[i + 1] = Math.min(255, (red * (0.349 * adjustment)) + (green * (1 - (0.314 * adjustment))) + (blue * (0.168 * adjustment)));
      imgPixels.data[i + 2] = Math.min(255, (red * (0.272 * adjustment)) + (green * (0.534 * adjustment)) + (blue * (1- (0.869 * adjustment))));
    }
  }

  context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

  let rangeInput = document.getElementById('sepia');

  if (listener === false) {
    document.getElementById('sepiaCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });

    rangeInput.addEventListener('change', function() {
      document.getElementById('sepia').textContent = rangeInput.value;
      adjustment = Number(rangeInput.value);

      sepia(adjustment, listener);
    });

    listener = true;
  }

  document.getElementById('dl-sepia').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}

//==============================================================================
// contrast adjustable by color channel
function adjContrast(red = 40, green = 40, blue = 40, listener = false) {
  let redAdj = Math.pow((red + 100) / 100, 2);
  let greenAdj = Math.pow((green + 100) / 100, 2);
  let blueAdj = Math.pow((blue + 100) / 100, 2);

  let imageObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('contrastCanvas');
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

      red = imgPixels.data[i];
      green = imgPixels.data[i + 1];
      blue = imgPixels.data[i + 2];

      red /= 255;
      red -= 0.5;
      red *= redAdj;
      red += 0.5;
      red *= 255;

      green /= 255;
      green -= 0.5;
      green *= greenAdj;
      green += 0.5;
      green *= 255;

      blue /= 255;
      blue -= 0.5;
      blue *= blueAdj;
      blue += 0.5;
      blue *= 255;

      imgPixels.data[i] = red;
      imgPixels.data[i + 1] = green;
      imgPixels.data[i + 2] = blue;
    }
  }

  context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

  let redInput = document.getElementById('red-cont');
  let greenInput = document.getElementById('green-cont');
  let blueInput = document.getElementById('blue-cont');

  if (listener === false) {
    document.getElementById('contrastCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });

    redInput.addEventListener('change', function() {
      document.getElementById('red-cont').textContent = redInput.value;
      red = Number(redInput.value);
      console.log('redInput', red);

      adjContrast(red, green, blue, listener);
    });

    greenInput.addEventListener('change', function() {
      document.getElementById('green-cont').textContent = greenInput.value;
      green = Number(greenInput.value);
      console.log('greenInput', green);

      adjContrast(red, green, blue, listener);
    });

    blueInput.addEventListener('change', function() {
      document.getElementById('blue-cont').textContent = blueInput.value;
      blue = Number(blueInput.value);
      console.log('blueInput', blue);

      adjContrast(red, green, blue, listener);
    });

    listener = true;
  }

  document.getElementById('dl-contrast').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}

//==============================================================================
// change saturation by color channel
function adjSaturation(red = 0, green = 0, blue = 0, listener = false) {
  let redAdj = red * -0.01;
  let greenAdj = green * -0.01;
  let blueAdj = blue * -0.01;

  let imageObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('satCanvas');
  let context = canvas.getContext('2d');

  let imgW = imageObj.width;
  let imgH = imageObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  context.drawImage(imageObj, 0, 0);

  let imgPixels = context.getImageData(0, 0, imgW, imgH);
  let max = 0;

  for (let y = 0; y < imgPixels.height; y++) {
    for (let x = 0; x < imgPixels.width; x++) {
      let i = (y * 4) * imgPixels.width + x * 4;

      red = imgPixels.data[i];
      green = imgPixels.data[i + 1];
      blue = imgPixels.data[i + 2];

      max = Math.max(red, green, blue);

      if (red !== max) red += (max - red) * redAdj;
      if (green !== max) green += (max - green) * greenAdj;
      if (blue !== max) blue += (max - blue) * blueAdj;

      imgPixels.data[i] += red;
      imgPixels.data[i + 1] += green;
      imgPixels.data[i + 2] += blue;
    }
  }

  context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

  let redInput = document.getElementById('red-sat');
  let greenInput = document.getElementById('green-sat');
  let blueInput = document.getElementById('blue-sat');

  if (listener === false) {
    document.getElementById('satCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });

    redInput.addEventListener('change', function() {
      document.getElementById('red-sat').textContent = redInput.value;
      red = Number(redInput.value);

      adjSaturation(red, green, blue, listener);
    });

    greenInput.addEventListener('change', function() {
      document.getElementById('green-sat').textContent = greenInput.value;
      green = Number(greenInput.value);

      adjSaturation(red, green, blue, listener);
    });

    blueInput.addEventListener('change', function() {
      document.getElementById('blue-sat').textContent = blueInput.value;
      blue = Number(blueInput.value);

      adjSaturation(red, green, blue, listener);
    });

    listener = true;
  }

  document.getElementById('dl-sat').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}

// //==============================================================================
// // adjust vibrance
// function vibrance(adjustment = 40, listener = false) {
//   adjustment *= -1;
//
//   let imageObj = document.getElementById('origCanvas');
//
//   let canvas = document.getElementById('vibeCanvas');
//   let context = canvas.getContext('2d');
//
//   let imgW = imageObj.width;
//   let imgH = imageObj.height;
//   canvas.width = imgW;
//   canvas.height = imgH;
//
//   context.drawImage(imageObj, 0, 0);
//
//   let imgPixels = context.getImageData(0, 0, imgW, imgH);
//   let max = 0;
//   let average = 0;
//   let amount = 0;
//
//   for (let y = 0; y < imgPixels.height; y++) {
//     for (let x = 0; x < imgPixels.width; x++) {
//       let i = (y * 4) * imgPixels.width + x * 4;
//
//       red = imgPixels.data[i];
//       green = imgPixels.data[i + 1];
//       blue = imgPixels.data[i + 2];
//
//       max = Math.max(red, green, blue);
//       average = (red + green + blue) / 3;
//       amount = ((Math.abs(max - average) * 2 / 255) * adjustment)/10;
//       if (x < 40 && y < 40) console.log(max, average, amount);
//
//       if (red !== max) red += (max - red) * amount;
//       if (green !== max) green += (max - green) * amount;
//       if (blue !== max) blue += (max - blue) * amount;
//
//       imgPixels.data[i] += red;
//       imgPixels.data[i + 1] += green;
//       imgPixels.data[i + 2] += blue;
//     }
//   }
//
//   context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
//
//   let rangeInput = document.getElementById('vibrance');
//
//   if (listener === false) {
//     document.getElementById('vibeCanvas').addEventListener('click', function() {
//       window.open(canvas.toDataURL('image/jpeg'), '_blank');
//     });
//
//     rangeInput.addEventListener('change', function() {
//       document.getElementById('vibrance').textContent = rangeInput.value;
//       adjustment = Number(rangeInput.value);
//
//       vibrance(adjustment, listener);
//     });
//
//     listener = true;
//   }
//
//   document.getElementById('dl-vibe').addEventListener('click', function() {
//     this.href = canvas.toDataURL('image/jpeg');
//   }, false);
//
//   return context.canvas.toDataURL('data/jpeg', 1.0);
// }

//==============================================================================
// adjust gamma
function adjGamma(adjustment = 10, listener = false) {
  adjustment /= 10;

  let imageObj = document.getElementById('origCanvas');

  let canvas = document.getElementById('gammaCanvas');
  let context = canvas.getContext('2d');

  let imgW = imageObj.width;
  let imgH = imageObj.height;
  canvas.width = imgW;
  canvas.height = imgH;

  context.drawImage(imageObj, 0, 0);

  let imgPixels = context.getImageData(0, 0, imgW, imgH);
  let max = 0;
  let average = 0;
  let amount = 0;

  for (let y = 0; y < imgPixels.height; y++) {
    for (let x = 0; x < imgPixels.width; x++) {
      let i = (y * 4) * imgPixels.width + x * 4;

      red = imgPixels.data[i];
      green = imgPixels.data[i + 1];
      blue = imgPixels.data[i + 2];

      red = Math.pow(red / 255, adjustment) * 255;
      green = Math.pow(green / 255, adjustment) * 255;
      blue = Math.pow(blue / 255, adjustment) * 255;

      imgPixels.data[i] += red;
      imgPixels.data[i + 1] += green;
      imgPixels.data[i + 2] += blue;
    }
  }

  context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

  let rangeInput = document.getElementById('gamma');

  if (listener === false) {
    document.getElementById('gammaCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });

    rangeInput.addEventListener('change', function() {
      document.getElementById('gamma').textContent = rangeInput.value;
      adjustment = Number(rangeInput.value);

      adjGamma(adjustment, listener);
    });

    listener = true;
  }

  document.getElementById('dl-gamma').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}


//==============================================================================
// create fill color
function fillColor(red = 127, green = 127, blue = 127, listener = false) {
  let canvas = document.getElementById('fillCanvas');
  let context = canvas.getContext('2d');

  let imgW = canvas.width;
  let imgH = canvas.height;

  context.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
  context.fillRect(0, 0, imgW, imgH);

  let redInput = document.getElementById('red-fill');
  let greenInput = document.getElementById('green-fill');
  let blueInput = document.getElementById('blue-fill');

  if (listener === false) {
    document.getElementById('fillCanvas').addEventListener('click', function() {
      window.open(canvas.toDataURL('image/jpeg'), '_blank');
    });

    redInput.addEventListener('change', function() {
      document.getElementById('red-fill').textContent = redInput.value;
      red = Number(redInput.value);

      fillColor(red, green, blue, listener);
    });

    greenInput.addEventListener('change', function() {
      document.getElementById('green-fill').textContent = greenInput.value;
      green = Number(greenInput.value);

      fillColor(red, green, blue, listener);
    });

    blueInput.addEventListener('change', function() {
      document.getElementById('blue-fill').textContent = blueInput.value;
      blue = Number(blueInput.value);

      fillColor(red, green, blue, listener);
    });

    listener = true;
  }

  document.getElementById('dl-fill').addEventListener('click', function() {
    this.href = canvas.toDataURL('image/jpeg');
  }, false);

  return context.canvas.toDataURL('data/jpeg', 1.0);
}
