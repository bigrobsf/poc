# Proof of concept for third quarter group project

The primary goal of my third quarter project was to implement edge detection in grayscale photographs. This led me to explore various grayscale filters and gaussian blur algorithms to prepare the image for edge detection.

Implementing a gaussian blur (that I understood *and* that was reasonably fast) seemed too tall an order in the time allotted so I added that to my post-graduation project list and used the canvas element's blur function.

One of the other members of my group developed a Photoshop-like menu system and since I was working on image manipulation and creation I decided to experiment with as many filters as I could.

This app is not the final project as submitted, but it is my contribution. I leveraged the framework from my first-quarter project for this proof of concept. It allows the user to select an image from a specific Flickr API or open an image on the user's computer, or paste in the URL of an image off the internet (assuming CORS doesn't get in the way!).

Secondary goals included learning:

* about the HTML Canvas element (which is amazingly powerful)
* to open from and save files to the computer's file system

A bonus was learning how to use the HTML input type 'range' to create sliders that change the parameter values of various filters.

A next logical step for this is to build a menu system and implement a basic Photoshop-like web app. This is also on my post-graduation project list.
