
var TWF = TWF || {};
var API_URL = 'http://twf-api-production.elasticbeanstalk.com';

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

		for(i=0; i<len; i++){
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

	L.mapbox.accessToken = 'pk.eyJ1IjoidHJldm9ybWNuYXVnaHRvbiIsImEiOiJjZVhXMEFzIn0.uTplA3NuxCGuKuOfW-LHHQ';

	var submitLoc 			= $('#set-location');
	var submitGeoLoc		= $('.geo-location');
	var browserSupportFlag 	= new Boolean();
	var error				= new Boolean();
	var totalDistance = 0;

	var map = L.mapbox.map('map', 'trevormcnaughton.ln3fn8e9').setView([41.852, -87.681], 10);

	// Kind of a model
	var tracker = {
		init: function(){
			var polylineOptions = {
				color: TWF.bookstore.getCurrentColor()
			}

			TWF.bootstrap = new TWF.Bootstrap();
		},

		setLocationAndDraw: function(){
			var color = TWF.bookstore.tracker.currentBook.color;

			location 		= TWF.bookstore.tracker.enteredLocation;

			setTimeout(function(){
				$('#book-id, #location').val('');
			},280 );

			$('.total-points').html(pathPoints);

		}
	}; //end tracker

	// Book Marker Objects
	TWF.BookMarker = function(opts){
		this.config = {
			fillColor: '#36abc4',
			fillOpacity: 1,
			scale: 10,
			strokeColor: '#36abc4',
			strokeWeight: 10,
			strokeOpacity:0.3
		}

		$.extend(this.config,opts);

		this.ui = this.config;
	};

	// Form Actions
	TWF.Gateway = function(){
		this.formstate = 0; // Current state of form
		this.form = $('.form');
		this.input = $('#book-id');

		this.init();
	}

	TWF.Gateway.prototype = {
		init: function(){
			$('#set-book-id').on('click', $.proxy(this.formSubmit,this));
			this.form.on('submit', $.proxy(this.formSubmit,this));
		},
		formSubmit: function(){

			var me = this;

			// Handle book id lookup
			if( me.formstate === 0 ){
				var val = me.input.val().toLowerCase();
				var bookToLookup = TWF.bookstore.getBookById(val);
				if(bookToLookup !== null){
					TWF.bookstore.tracker.currentBook = bookToLookup;
					me.updateFormState();
				}else{
					$('.errors').html("Incorrect ID");
				}
			}else{
				// Handle location search
				TWF.bookstore.tracker.enteredLocation = me.input.val();

				geocoder.geocode({'address': TWF.bookstore.tracker.enteredLocation}, function(results, status){
					if(status == google.maps.GeocoderStatus.OK){
						TWF.bookstore.tracker.geocodedLocation = results[0].geometry.location;

						// Do an ajax save
						var data = {
							book_id: TWF.bookstore.tracker.currentBook.id,
							lat: results[0].geometry.location.Ya,
							lon: results[0].geometry.location.Za
						}

						$.ajax({
							type:'POST',
							url: API_URL + '/api/add',
							data: data,
							beforeSend: function(){
								// if you want
							},
							success: function(data){
								me.form.trigger('reveal:close');
								var pathToAddTo = TWF.Paths.getById(TWF.bookstore.tracker.currentBook.id).group;
								pathToAddTo.addPoint(TWF.bookstore.tracker.geocodedLocation);
							},
							error: function(err){
								//adderror
								alert('There was a problem saving your point. Please try again later');
							}
						});

					}else{
						$('.errors').html('We cannot find where you are, try to be more specific.');
					}
				});

			}
			return false;
		},
		updateFormState: function(){
			this.formstate = this.formstate === 0 ? 1 : 0;

			if(this.formstate === 1){
				// Change to location input
				this.input.attr('placeholder','address ex. 123 Damen Ave Chicago IL');
				this.input.val('');
				$('#modal-title').html('Enter your full address');
				$('.helpful-tip').html('Enter your address, be as specific as possible');
				$('.errors').html('');
			}
		}
	}

	// Load tracker
	$(window).load(function(){
		tracker.init();
		var gateway = new TWF.Gateway();
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
		var i = 0;
		var len = books.collection.length;

		for (i; i<len; i++) {
			var marker = L.marker([books.collection[i].get('lat'), books.collection[i].get('lon')]);
		}

		marker.addTo(map);
	};

	TWF.Bootstrap = function(){

		var me = this;
		// Fetch points
		$.ajax({
			url: API_URL + '/api/all',
			dataType: "json",
			success: function(pointsData){
				TWF.points = new TWF.PointsCollection(pointsData);
				me.batchPoints();
			},
			error: function(){
				// alert("Can't access the points at this time. Come back later!");
			}
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
