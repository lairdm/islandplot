islandplot
==========

SVG based genome viewer written in javascript using D3

There are three pieces to the package, a circular genome viewer, a linear
genome viewer and a linear brush element.  Simply include the js files for
the elements you need in your page and you're ready to go.

Both view types take the same data format, a javascript data structure, with
a few extra tags for each type.  Tracks can not be added after creation of the initial plot objects (but they can be initialized as visible: false) and in the linear plot they can not be reordered.

Available track types
=====================

* block track (simply start and end basepairs for each element)
* stranded track (allowing visualizing on the forward or reverse strand)
* plot track (for visualizing things such as average GC content, circular plot only)
* glyph track (for visualizing specific features at a given point, circular plot only)

Data format
===========

The data passed in must be an array of track objects (see included data.js for sample data).  Each track has the format of:

```
{ 
  trackName: "track1",
  trackType: "stranded",
  visible: true,
  inner_radius: 125,
  outer_radius: 175,
  items: [
          {id: 1, start:0, end:30000, name:"island0", strand: -1},
           ...
         ]
}
```

trackName and trackType are mandatory.  visible defaults to true and is optional.  For all track types except the plot type, items is an array of objects, where each object is a track element with a start and end bp location.  For plot type tracks its simply an array of points for the track and the bp_per_element tag must be included, which is the number of bp between data points in the set.

Track colours and functionality can be customized via CSS, elements will have classes such as track1_pos for the forward (positive) strand elements of track1.

For glyph tracks the shapes allowed are standard SVG shapes.

Creating plots
==============

Tracks also require a second object to be passed on when creating them, the layout of the track.  The minimum needed is the genomesize (in bp) and the div to create the object in.

```
var circularlayout = {genomesize: 6264404,
                      container: "#circularchart",
        };

var cTrack = new circularTrack(circularlayout, tracks);
```

The two arguments are the layout and the track data.

Manipulating plots
==================

You may also make JS calls to manipulate visualized tracks, the basic functionality is to show and hide a track, this is done via the name in the trackName element of the track.

```
cTrack.showTrack("track1");

cTrack.hideTrack("track1");
```

For glyph tracks the format is slightly different, you must specify which glyph type in the track is to be shown or hidden.

```
cTrack.showGlyphTrackType("track5", "adb");

cTrack.hideGlyphTrackType("track5", "adb");
```

There is also functionality to alter the radius of where a track is in a circular plot.  This is done by track id rather than name so a call to findTrackbyName must be done first:

```
var id = cTrack.findTrackbyName('track1');
cTrack.moveTrack(id, newInnerRadius, newOuterRadius);
```

Attaching a brush
=================

For zooming and resizing the linear track there's a brush element made to work with the track.  Once the linear track is made the brush can "attach" to it.

```
var linearTrack = new genomeTrack(linearlayout, tracks);
var brush = new linearBrush(contextLayout,linearTrack);
```

There's an incomplete but somewhat functional polar brush element in the circular plot type.

```
var cTrack = new circularTrack(circularlayout, tracks);
cTrack.attachBrush(linearTrack);
```
