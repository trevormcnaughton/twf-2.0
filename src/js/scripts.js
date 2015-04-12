var TWF = TWF || {};
var API_URL = 'http://twf-api-production.elasticbeanstalk.com';

var fb = new Firebase("https://to-wake-from.firebaseio.com/books");


// Fake DB
TWF.DataStore = function(){

	// Defaults
	this.defaults = {
		color: '#FFCC00'
	}

	// Books
	this.books = [
		{id:"twf-001", title: "book 1", color: "#70afbd"}, //light blue
		{id:"twf-002", title: "book 2", color: "#f45425"}, //orange
		{id:"twf-003", title: "book 3", color: "#e66169"}, //light red
		{id:"twf-004", title: "book 4", color: "#2d5c8b"}, //need new
		{id:"twf-005", title: "book 5", color: "#dcac3c"}, //gold
		{id:"twf-006", title: "book 6", color: "#61b256"}, //green
		{id:"twf-007", title: "book 7", color: "#00c6c6"}, //teal
		{id:"twf-008", title: "book 8", color: "#45794f"}, //dark green
		{id:"twf-009", title: "book 9", color: "#c85c97"}, //pink
		{id:"twf-010", title: "book 10", color:"#666666"}, //grey
	];

	// User/Tracker Data
	this.tracker = {
		currentBook: null,
		enteredLocation: null,
		geocode: null
	}

	// Utility methods
	this.getBookById = function(id){
		var bs = this.books;
		var len = bs.length;

		for(i = 0; i < len; i++){
			if(bs[i].id === id) return bs[i];
		}

		return null;
	}

	this.getCurrentColor = function(){
		return this.tracker.currentBook ? this.tracker.currentBook.color : this.defaults.color;
	}
};

TWF.bookstore = new TWF.DataStore();

;(function ($, window, undefined) {
  'use strict';

  var $doc = $(document),
      Modernizr = window.Modernizr;

  // Hide address bar on mobile devices
  if (Modernizr.touch) {
    $(window).load(function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });
  }

	//get these maps poppin'
	var poly;
	var tmppoly;
	var map;
	var location;
	var initialLocation;
	var geodesic;
	var geocoder 			= new google.maps.Geocoder();
	var submitLoc 			= $('#set-location');
	var submitGeoLoc		= $('.geo-location');
	var chicago 			= new google.maps.LatLng(41.852, -87.681);
	var browserSupportFlag 	= new Boolean();
	var error				= new Boolean();

	var totalDistance = 0;

	// Kind of a model
	var tracker = {
		init: function(){
			//Map Options

			//Give this map some style
			var styles = [
				{
					stylers: [
						{ saturation: -100 }
					]
				},{
					featureType: "road",
					elementType: "geometry",
					stylers: [
						{ lightness: 150 },
						{ visibility: "simplified" }
					]
				},{
					featureType: "road",
					elementType: "labels",
					stylers: [
						{ visibility: "off" }
					]
				}
			];

			//initiate styled map and giver 'er a name
			var styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});

			var mapOpt 	=	{
				zoom:	12,
				center:	chicago,
				//mapTypeId: google.maps.MapTypeId.ROADMAP,
				disableDefaultUI: true,
				zoomControl: true,
			    zoomControlOptions: {
			        style: google.maps.ZoomControlStyle.LARGE,
			        position: google.maps.ControlPosition.LEFT_CENTER
			    },
				mapTypeControlOptions: {
					mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
				}
			};

			map = new google.maps.Map(document.getElementById("maps-canvas"), mapOpt);
			map.mapTypes.set('map_style', styledMap);
			map.setMapTypeId('map_style');


			var polyOptions = {
				strokeColor:	TWF.bookstore.getCurrentColor(),
				strokeOpacity:	0.75,
				strokeWeight:	3
			}

			//setup polyline
			poly = new google.maps.Polyline(polyOptions, {geodesic: true});
			poly.setMap(map);

			TWF.bootstrap = new TWF.Bootstrap();
		},
		setLocationAndDraw: function(){

			var color = TWF.bookstore.tracker.currentBook.color;

			// Update line color
			poly.setOptions({strokeColor:color});


			var path 		= poly.getPath();
			var pathPoints	= (path.length) + 1;
			location 		= TWF.bookstore.tracker.enteredLocation;//$('#location').val();

			var customBookMarker = new TWF.BookMarker({fillColor:color,strokeColor:color});
			//Call the geocode method
			geocoder.geocode({'address': location}, function(results, status){

				if (status == google.maps.GeocoderStatus.OK){
					path.push(results[0].geometry.location);
					getDistance();
					map.setCenter(results[0].geometry.location); //if geocode status is OK set centerpoint to the variables location

					//after center, sets marker at location
					var marker = new google.maps.Marker({

						map:map,
						position: results[0].geometry.location,
						animation: google.maps.Animation.DROP,
						icon: customBookMarker.ui,
						zoom: 16

					});

					google.maps.event.addListener(marker, 'click', function(){
						TWF.infoWindow.infowindow.open(map,marker);
					})

/* 					submitLoc.trigger('reveal:close'); */

				//throw an error into the HTML
				}else{
					$('.geocode-error-message').html('We cannot find where you are, try to be more specific.').addClass('show-error');
				}
			});
			//Clears inputs
			setTimeout(function(){
				$('#book-id, #location').val('');
			},280 );

			$('.total-points').html(pathPoints);

		},

		setGeolocation: function(){

			//Check for Geolocation then use W3C Geolocation (preffered)
			if(navigator.geolocation) {
				browserSupportFlag = true;

				navigator.geolocation.getCurrentPosition(function(position) {
					initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
					map.setCenter(initialLocation);

					var marker = new google.maps.Marker({
						position:	initialLocation,
						map:		map
					});

				}, function() {
				  handleNoGeolocation(browserSupportFlag);
				});
			} else {
				browserSupportFlag = false;
				handleNoGeolocation(browserSupportFlag)
			}

			function handleNoGeolocation(errorFlag) {
			    if (errorFlag == true) {
			      $('.geocode-error-message').html('Oh no! Geolocation service has failed. Try typing in your location.').addClass('show-error');
			    } else {
			      $('.geocode-error-message').html("Your browser doesn't support geolocation").addClass('show-error');
			    }
			    map.setCenter(initialLocation);
			  }

			  map.setZoom(16)
			  $(this).trigger('reveal:close');

		}

	}; //end tracker





	//Calculate Distance
	function getDistance(){
		var path = poly.getPath();
		var len = path.length;
		var newPoint;
		var lastPoint;

		if( len > 1 ){
			newPoint = path.getAt(len-1);
			lastPoint = path.getAt(len-2);
			updateDistance(google.maps.geometry.spherical.computeDistanceBetween(newPoint,lastPoint));
		}
	}





	//Update total distance
	function updateDistance(dist){
		dist = Math.round(dist*0.00062);
		totalDistance += dist;

		$('.last-dist').html(dist + ' mi');
		$('.total-dist').html(totalDistance + ' mi');

	}




	// Book Marker Objects
	TWF.BookMarker = function(opts){
		this.config = {
			path: google.maps.SymbolPath.CIRCLE,
			fillColor: '#36abc4',
			fillOpacity: 1,
			scale: 8,
			strokeColor: '#36abc4',
			strokeWeight: 8,
			strokeOpacity:0.3
		}

		$.extend(this.config,opts);

		this.ui = this.config;
	};



	// Load tracker
	$(window).load(function(){
		tracker.init();

    Backbone.on('book:add', function (rawData) {
      var bookId = rawData.bookId;

      TWF.bookstore.tracker.currentBook = TWF.bookstore.getBookById(bookId)
      TWF.bookstore.tracker.currentBook.id = bookId;
      TWF.bookstore.tracker.enteredLocation = rawData.address;

      geocoder.geocode({'address': rawData.address}, function(results, status){
        if(status == google.maps.GeocoderStatus.OK){
          fb.push({
            id: _.uniqueId() + new Date().getTime(),
            book_id: TWF.bookstore.tracker.currentBook.id,
            lat: results[0].geometry.location.k,
            lon: results[0].geometry.location.D,
            date: new Date().getTime()
          });
        }else{
          console.log('We cannot find where you are, try to be more specific.');
        }
      });
    });
	});




	TWF.PointModel = Backbone.Model.extend({
		defaults:{
			"book_id":"twf-001",
			"lat" : "0",
			"lon" : "0",
			"time" : new Date()
		}
	});

	TWF.PointsCollection = Backbone.Collection.extend({
		model: TWF.PointModel
	});

	// Mock Collection
	TWF.PathsCollection = function(){
		this.paths = [];
	};

	TWF.PathsCollection.prototype = {
		getById: function(id){
			var i = 0;
			var len = this.paths.length;
			for(i; i<len; i++){
				if(this.paths[i].id === id){ return this.paths[i]; }
			}
		}
	}

	TWF.PathGroup = function(books){
		this.polyOptions = {
			strokeColor:	TWF.bookstore.getBookById(books.id).color,
			strokeOpacity:	0.75,
			strokeWeight:	3
		};
		this.books = books;
		this.id = books.id;
		this.poly = new google.maps.Polyline(this.polyOptions, {geodesic: true});
		this.poly.setMap(map);
		var color = this.polyOptions.strokeColor;
		this.color = color;
		var i = 0;
		var len = books.collection.length;
		var pts = [];

		for(i; i<len; i++){
			var path = this.poly.getPath();
			this.poly.setOptions({strokeColor:color});
			var point = new google.maps.LatLng(books.collection[i].get("lat"), books.collection[i].get("lon"));
			path.push(point);
			var marker = new google.maps.Marker({
					map:map,
					position: point,
					//animation: google.maps.Animation.DROP,
					icon: new TWF.BookMarker({fillColor:color, strokeColor:color}).ui,
					zoom: 16
			});


		}
	};

	TWF.PathGroup.prototype = {
		addPoint: function(newpoint){
			this.books.collection.push(newpoint);
			this.poly.getPath().push(newpoint);
			var me = this;
			var marker = new google.maps.Marker({
					map:map,
					position: newpoint,
					animation: google.maps.Animation.DROP,
					icon: new TWF.BookMarker({fillColor:me.color, strokeColor:me.color}).ui,
					zoom: 16
			});
			map.setCenter(newpoint);
			map.setZoom(8)
		}
	}




	TWF.Bootstrap = function(){
		var me = this;

    fb.on('value', function (dataSnapshot) {
      var points = dataSnapshot.val();

      if (_.isObject(points)) {
        var newPoints = [];

        _.keys(points).forEach(function (point) {
          newPoints.push(points[point]);
        });

        points = newPoints;
      }

      TWF.points = new TWF.PointsCollection(points);
      me.batchPoints();
    });
	};

	TWF.Bootstrap.prototype = {
		batchPoints: function(){

			var coll = TWF.points;

			TWF.books = [
				{collection:[]},
				{collection:[]},
				{collection:[]},
				{collection:[]},
				{collection:[]},
				{collection:[]},
				{collection:[]},
				{collection:[]},
				{collection:[]},
				{collection:[]}
			];


			_.each(coll.models, function(model,idx){
				var bid = model.get("book_id");

				if( bid === "twf-001" ){
					TWF.books[0].id = bid;
					TWF.books[0].collection.push(model);
				}else if( bid === "twf-002" ){
					TWF.books[1].id = bid;
					TWF.books[1].collection.push(model);
				}else if( bid === "twf-003" ){
					TWF.books[2].id = bid;
					TWF.books[2].collection.push(model);
				}else if( bid === "twf-004" ){
					TWF.books[3].id = bid;
					TWF.books[3].collection.push(model);
				}else if( bid === "twf-005" ){
					TWF.books[4].id = bid;
					TWF.books[4].collection.push(model);
				}else if( bid === "twf-006" ){
					TWF.books[5].id = bid;
					TWF.books[5].collection.push(model);
				}else if( bid === "twf-007" ){
					TWF.books[6].id = bid;
					TWF.books[6].collection.push(model);
				}else if( bid === "twf-008" ){
					TWF.books[7].id = bid;
					TWF.books[7].collection.push(model);
				}else if( bid === "twf-009" ){
					TWF.books[8].id = bid;
					TWF.books[8].collection.push(model);
				}else if( bid === "twf-010" ){
					TWF.books[9].id = bid;
					TWF.books[9].collection.push(model);
				}
			});

			TWF.Paths = new TWF.PathsCollection();

			for(var i = 0; i<10; i++){
				TWF.Paths.paths.push({
					group: new TWF.PathGroup({collection:TWF.books[i].collection,id:TWF.books[i].id}),
					id: TWF.books[i].id
				});
			}

		}
	}
})(jQuery, this);
