'use strict';
/* jshint esversion: 6 */
/* jshint devel:true */
/* jshint node: true */
/* jshint browser: true */
/* globals $:false */

//==============================================================================
// MAIN - start here!
window.onload = function main() {
  document.getElementById('browse-btn').addEventListener('click', function() {
    window.open('api-call','');
  });

  getFlickrImg();
};

//==============================================================================
// open image in URL bar
function getFlickrImg() {
  let url = window.location.search.split('=');

  if (url[0] === '?img') {
    let directURL = url[1];

    openImgInCanvas(directURL);
  }
}

//==============================================================================
// open image from file system
function readFileImage() {
  let canvas = document.getElementById('origCanvas');
  let context = canvas.getContext('2d');

  let reader = new FileReader();

  reader.onload = function(event) {
    let imageObj = new Image();

    imageObj.onload = function() {
      context.drawImage(imageObj, 0, 0);

      openImgInCanvas(imageObj.src);
    };

    imageObj.src = event.target.result;
  };

  let fileElement = document.getElementById('file-upload');

  reader.readAsDataURL(fileElement.files[0]);
}

function getElement(id) {
  return document.getElementById(id);
}

getElement('file-upload').addEventListener('change', readFileImage, false);
