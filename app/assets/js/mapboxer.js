/*!
 * fastshell
 * Fiercely quick and opinionated front-ends
 * https://HosseinKarami.github.io/fastshell
 * @author Hossein Karami
 * @version 1.0.3
 * Copyright 2015. MIT licensed.
 */
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
}
})(jQuery, this);
