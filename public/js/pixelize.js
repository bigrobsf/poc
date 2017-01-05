'use-strict';
/* jshint esversion: 6 */
/* jshint devel:true */
/* jshint node: true */

//==============================================================================
// iterates through all blocks of the calculated number of pixels and draws them
function renderPixelImg(ctx, width, height) {
  let avgBlockColor = '';
  let numBlocks = 0;
  let blockSize = 10;
  let numRows = 0;
  let numCols = 0;

  if (width > height) {
    numBlocks = Math.floor(width / blockSize);
    numCols = numBlocks;
    numRows = Math.floor(height / blockSize);
  } else {
    numBlocks = Math.floor(height / blockSize);
    numRows = numBlocks;
    numCols = Math.floor(width / blockSize);
  }

  for (let row = 0; row < numRows; row++) {

    for (let col = 0; col < numCols; col++) {
      let blockPixels = ctx.getImageData(col * blockSize, row * blockSize, blockSize, blockSize);
      let blockData = blockPixels.data;

      avgBlockColor = getAvgBlockColor(blockData);

      let red = avgBlockColor[0];
      let green = avgBlockColor[1];
      let blue = avgBlockColor[2];

      ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
      ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
    }
  }
}

//==============================================================================
// calculates average color for a block of image pixels
function getAvgBlockColor(blockData) {
  let red = 0;
  let green = 0;
  let blue = 0;
  let i = 0;
  let count = 0;

  let length = blockData.length;

  while (i < length) {
    red   += blockData[i];
    green += blockData[i + 1];
    blue  += blockData[i + 2];
    i += 4; // skip alpha channel, get next red value
    count++;
  }

  red   = Math.floor(red / count);
  green = Math.floor(green / count);
  blue  = Math.floor(blue / count);

  return [red, green, blue];
}
