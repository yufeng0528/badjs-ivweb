webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var log = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./mod.realtime\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	log.init();

	var source_trigger = __webpack_require__(12);
	source_trigger.init();

	var last_select = __webpack_require__(13);
	last_select.init();

/***/ },

/***/ 12:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {exports.init = function() {
		var not_show_source_page = false;
		var hideform_class_name = 'main-table-hidefrom';

		try {
			not_show_source_page = !!localStorage.not_show_source_page;
			$('.main-table')[not_show_source_page ? 'addClass' : 'removeClass'](hideform_class_name);
		} catch (ex) {}

		var update_source = function(show_source_page) {
			if (show_source_page) {
				$('.main-table').removeClass(hideform_class_name);
				$('#log-table .source_page_link').each(function() {
					var $this = $(this);
					$this.text($this.data('viewlink'));
				});
			} else {
				$('.main-table').addClass(hideform_class_name);
				$('#log-table .source_page_link').each(function() {
					var $this = $(this);
					$this.text($this.data('viewtext'));
				});
			}
		};

		var $ssp = $('#show_source_page');
		$ssp.prop('checked', !not_show_source_page).on('change', function() {
			try {
				var show_source_page = $ssp.prop('checked');
				localStorage.not_show_source_page = show_source_page ? '' : '1';
				update_source(show_source_page);
			} catch (ex) {}
		});
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },

/***/ 13:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {exports.init = function(){
		var last_select = -1;
		
		try {

		    last_select = localStorage.last_select >> 0; // jshint ignore:line
			
			var $sb = $('#select-business');
			
			last_select > 0 && $sb.find('[value=' + last_select + ']').length && $sb.val(last_select);

			$sb.on('change', function(){
				localStorage.last_select = $sb.val();
			});

		} catch (ex) {}

	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }

});