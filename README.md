islandplot
==========

SVG based genome viewer written in javascript using D3

There are three pieces to the package, a circular genome viewer, a linear
genome viewer and a linear brush element.  Simply include the js files for
the elements you need in your page and you're ready to go.

Both view types take the same data format, a javascript data structure, with
a few extra tags for each type.

Available track types
=====================

* block track (simply start and end basepairs for each element)
* stranded track (allowing visualizing on the forward or reverse strand)
* plot track (for visualizing things such as average GC content)
* glyph track (for visualizing specific features at a given point)

Data format
===========

The data passed in must be an array of track objects (see included data.js for sample data).  Each track has the format of:

  { trackName: "track1",
                trackType: "stranded",
                visible: true,
                inner_radius: 125,
                outer_radius: 175,
                items: [
                         {id: 1, start:0, end:30000, name:"island0", strand: -1},
			 ...
                        ]
              }

