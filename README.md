# pixelizr

* __note__: the project works on Chrome 53, Firefox 49, Safari 10, and Edge 38 (let me know if your mileage varies.)
* It does NOT work on Internet Explorer 11 yet.

## Pixelizr extends our Pixel Art Maker homework to allow:

1. saving and retrieval of art using local storage
2. dynamic creation of a “canvas” of 30 to 50 blocks square - the default is 40
3. browse the most recent 30 images uploaded to Flickr and select one that will be “pixelized”
4. draw on and save the pixelized image just like the other create-it-yourself art

## Why?

I wasn’t happy with my original Pixel Art Maker as submitted and was thinking about enhancing it for my project but that
seemed too simple until Tyler suggested importing and pixelizing an image from online - that really caught my interest
because not only would it give me some experience using an API, but it would also require a non-trivial algorithm to
pixelize the image - and I love non-trivial algorithms even more than I love classes.

## How?

Lots of nested for loops. And Materialize, which looks great and is easy to use, even for a four-week old noob like me.

## Fun future features:

1. validate input for save and open
2. save as jpg
3. invert colors
4. ability to select and open file from local storage through a drop down
5. color-picker for custom colors
6. add a button that will display the original image, perhaps as a modal
7. make the UI responsive to different viewport sizes
8. add an undo feature
9. open and save an image from/to the file system like a real application!
