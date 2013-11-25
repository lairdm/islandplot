var tracks = [
	      { trackName: "track1",
		trackType: "stranded",
		items: [
                         {id: 1, start:0, end:30000, name:"island0", fill:"green", strand: -1},
                         {id: 2, start:60000,end:100000, name:"island1", fill:"green", strand: -1},
                         {id: 3, start:800000,end:1000000, name:"island2", strand: 1},
                         {id: 4, start:1200000,end:1500000, name:"island3", strand: 1},
                         {id: 4, start:1500000,end:1700000, name:"island4",fill:"green",strand: -1},
                         {id:5, start:2000000,end:2100000, name:"island5", strand: 1}
			]
	      },
	      { trackName: "track2",
		trackType: "stranded",
		items: [
                         {id: 1, start:30000, end:90000, name:"island0", fill:"green", strand: -1},
                         {id: 2, start:100000,end:300000, name:"island1", fill:"green", strand: -1},
                         {id: 3, start:1000000,end:1400000, name:"island2", strand: 1},
                         {id: 4, start:1400000,end:1700000, name:"island3", strand: -1},
                         {id: 4, start:1800000,end:2000000, name:"island4",fill:"green",strand: -1},
                         {id:5, start:2000000,end:2500000, name:"island5", strand: 1}
			]
	      }
	      ];



var layout = {genomesize: 6200000,
	      container: "#linearchart"};

var contextLayout = {genomesize: 6200000,
	      container: "#brush"};

var linearTrack = new genomeTrack(layout, tracks);
var brush = new linearBrush(contextLayout,linearTrack);

