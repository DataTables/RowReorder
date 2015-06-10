/*! RowReorder 1.0.0
 * 2014-2015 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     RowReorder
 * @description Row reordering extension for DataTables
 * @version     1.0.0
 * @file        dataTables.rowReorder.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2015 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

(function(window, document, undefined) {


var factory = function( $, DataTable ) {
"use strict";

/**
 *
 * 
 *  @class
 *  @param {object} settings DataTables settings object for the host table
 *  @param {object} [opts] Configuration options
 *  @requires jQuery 1.7+
 *  @requires DataTables 1.10.7+
 */
var RowReorder = function ( settings, opts ) {
	// Sanity check that we are using DataTables 1.10 or newer
	if ( ! DataTable.versionCheck || ! DataTable.versionCheck( '1.10.8' ) ) {
		throw 'DataTables Responsive requires DataTables 1.10.8 or newer';
	}

	this.c = $.extend( true, {},
		DataTable.defaults.rowReorder,
		RowReorder.defaults,
		opts
	);

	this.s = {
		dt: new DataTable.Api( settings ),
		columns: [],
		getDataFn: DataTable.ext.oApi._fnGetObjectDataFn( this.c.dataSrc ),
		setDataFn: DataTable.ext.oApi._fnSetObjectDataFn( this.c.dataSrc )
	};

	this.dom = {
		clone: null
	};

	// Check if responsive has already been initialised on this table
	if ( this.s.dt.settings()[0].rowreorder ) {
		return;
	}

	// details is an object, but for simplicity the user can give it as a string
	if ( opts && typeof opts.details === 'string' ) {
		opts.details = { type: opts.details };
	}

	settings.rowreorder = this;
	this._constructor();
};

RowReorder.prototype = {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialise the Responsive instance
	 *
	 * @private
	 */
	_constructor: function ()
	{
		var that = this;
		var dt = this.s.dt;
		var body = $( dt.table().node() );

		if ( body.css('position') === 'static' ) {
			body.css( 'position', 'relative' );
		}

		// listen for mouse down on the target column - we have to implement
		// this rather than using HTML5 drag and drop as drag and drop doesn't
		// appear to work on table rows at this time. Also mobile browsers are
		// not supported
		// xxx touchstart
		$( body ).on( 'mousedown.rowReorder', this.c.selector, function (e) {
			var tr = $(this).closest('tr');

			// Double check that it is a DataTable row
			if ( dt.row( tr ).any() ) {
				that._mouseDown( e, tr );
				return false;
			}
		} );
		// 
		// data update - update a column or data property
		// use a replacement method - so the row replacing the other gets the
		// other's data. Little more complicated, a lot more versatile
		// indexes are then an implementation detail (Editor - delete and add
		// could be fun - can do it in SQL with an event? should be possible)
		// 
		// on drop, emit an event with the new data in an object with row ids as
		// the properties

		dt.on( 'destroy', function () {
			body.off( '.rowReorder' );
		} );
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */
	
	_cachePositions: function ()
	{
		var dt = this.s.dt;

		// Frustratingly, if we add `position:relative` to the tbody, the
		// position is still relatively to the parent. So we need to adjust
		// for that
		var headerHeight = $( dt.table().node() ).find('thead').outerHeight();

		// Need to pass the nodes through jQuery to get them in document order,
		// not what DataTables thinks it is, since we have been altering the
		// order
		var nodes = $.unique( dt.rows( { page: 'current' } ).nodes().toArray() );
		var tops = $.map( nodes, function ( node, i ) {
			return $(node).position().top - headerHeight;
		} );

		var middles = $.map( tops, function ( top, i ) {
			return tops.length < i-1 ?
				(top + tops[i+1]) / 2 :
				(top + top + $( dt.row( ':last-child' ).node() ).outerHeight() ) / 2;
		} );

		this.s.middles = middles;
		this.s.bodyTop = $( dt.table().body() ).offset().top;
		this.s.windowHeight = $(window).height();
	},


	_clone: function ( target )
	{
		var dt = this.s.dt;
		var clone = $( dt.table().node().cloneNode(false) )
			.addClass( 'dt-rowReorder-float' )
			.append('<tbody/>')
			.append( target.clone( false ) );

		// Match the table and column widths - read all sizes before setting
		// to reduce reflows
		var tableWidth = target.outerWidth();
		var tableHeight = target.outerHeight();
		var sizes = target.children().map( function () {
			return $(this).width();
		} );

		clone
			.width( tableWidth )
			.height( tableHeight )
			.find('tr').children().each( function (i) {
				this.style.width = sizes[i]+'px';
			} );

		// Insert into the document to have it floating around
		clone.appendTo( 'body' );

		this.dom.clone = clone;
	},


	_clonePosition: function ( e )
	{
		var topDiff = e.pageY - this.s.startTop;
		var leftDiff = e.pageX - this.s.startLeft;
		var startOffsetLeft = this.s.startOffsetLeft;
		var snap = this.c.snapX;
		var left;

		if ( snap === true ) {
			left = startOffsetLeft;
		}
		else if ( typeof snap === 'number' ) {
			left = startOffsetLeft + snap;
		}
		else {
			left = leftDiff + startOffsetLeft;
		}

		this.dom.clone.css( {
			top: topDiff + this.s.startOffsetTop,
			left: left
		} );
	},


	_emitEvent: function ( name, args )
	{
		this.s.dt.iterator( 'table', function ( ctx, i ) {
			$(ctx.nTable).triggerHandler( name, args );
		} );
	},


	_mouseDown: function ( e, target  )
	{
		var that = this;
		var dt = this.s.dt;

		var offset = target.offset();
		this.s.startTop = e.pageY;
		this.s.startLeft = e.pageX;
		this.s.startOffsetTop = offset.top;
		this.s.startOffsetLeft = offset.left;
		this.s.startNodes = $.unique( dt.rows( { page: 'current' } ).nodes().toArray() );

		this._cachePositions();
		this._clone( target );
		this._clonePosition( e );

		this.dom.target = target;
		target.addClass( 'dt-rowReorder-moving' );

		$( document )
			.on( 'mouseup.rowReorder', function (e) {
				that._mouseUp(e);
			} )
			.on( 'mousemove.rowReorder', function (e) {
				that._mouseMove(e);
			} );

		// Check if window is x-scrolling - if not, disable it for the duration
		// of the drag
		if ( $(window).width() === $(document).width() ) {
			$(document.body).addClass( 'dt-rowReorder-noOverflow' );
		}
	},

	_mouseMove: function (e)
	{
		this._clonePosition( e );

		// Transform the mouse position into a position in the table's body
		var bodyY = e.pageY - this.s.bodyTop;
		var middles = this.s.middles;
		var insertPoint = null;
		var dt = this.s.dt;
		var body = dt.table().body();

		for ( var i=0, ien=middles.length ; i<ien ; i++ ) {
			if ( bodyY < middles[i] ) {
				insertPoint = i;
				break;
			}
		}

		if ( insertPoint === null ) {
			insertPoint = middles.length;
		}

		if ( this.s.lastInsert === null || this.s.lastInsert !== insertPoint ) {
			if ( insertPoint === 0 ) {
				this.dom.target.prependTo( body );
			}
			else {
				var nodes = $.unique( dt.rows( { page: 'current' } ).nodes().toArray() );

				if ( insertPoint > this.s.lastInsert ) {
					this.dom.target.before( nodes[ insertPoint-1 ] );
				}
				else {
					this.dom.target.after( nodes[ insertPoint ] );
				}
			}

			this._cachePositions();

			this.s.lastInsert = insertPoint;
		}

		// scroll window up and down when reaching the edges
		var windowY = e.pageY - document.body.scrollTop;
		var scrollInterval = this.s.scrollInterval;

		if ( windowY < 65 ) {
			if ( ! scrollInterval ) {
				this.s.scrollInterval = setInterval( function () {
					document.body.scrollTop -= 5;
				}, 15 );
			}
		}
		else if ( this.s.windowHeight - windowY < 65 ) {
			if ( ! scrollInterval ) {
				this.s.scrollInterval = setInterval( function () {
					document.body.scrollTop += 5;
				}, 15 );
			}
		}
		else {
			clearInterval( scrollInterval );
			this.s.scrollInterval = null;
		}
	},

	_mouseUp: function (e)
	{
		var dt = this.s.dt;
		var i, ien;

		this.dom.clone.remove();
		this.dom.clone = null;

		this.dom.target.removeClass( 'dt-rowReorder-moving' );
		//this.dom.target = null;

		$(document).off( 'mouseup.rowReorder mousemove.rowReorder' );
		$(document.body).removeClass( 'dt-rowReorder-noOverflow' );

		// Calculate the difference
		var startNodes = this.s.startNodes;
		var endNodes = $.unique( dt.rows( { page: 'current' } ).nodes().toArray() );
		var idDiff = {};
		var fullDiff = [];
		var getDataFn = this.s.getDataFn;
		var setDataFn = this.s.setDataFn;

		for ( i=0, ien=startNodes.length ; i<ien ; i++ ) {
			if ( startNodes[i] !== endNodes[i] ) {
				var id = dt.row( startNodes[i] ).id();
				var endRowData = dt.row( endNodes[i] ).data();
				var startRowData = dt.row( startNodes[i] ).data();

				if ( id ) {
					idDiff[ id ] = getDataFn( endRowData );
				}

				fullDiff.push( {
					node: endNodes[i],
					oldData: getDataFn( endRowData ),
					newData: getDataFn( startRowData ),
					newPosition: i,
					oldPosition: $.inArray( endNodes[i], startNodes )
				} );
			}
		}
		
		// Emit event
		this._emitEvent( 'row-reorder', [ fullDiff, idDiff ] );
		

		// Do update if required
		if ( this.c.update ) {
			for ( i=0, ien=fullDiff.length ; i<ien ; i++ ) {
				var row = dt.row( fullDiff[i].node );
				var rowData = row.data();

				setDataFn( rowData, fullDiff[i].newData );

				row.invalidate( 'data' );
			}

			dt.draw();
		}
	}
};



/**
 * Responsive default settings for initialisation
 *
 * @namespace
 * @name Responsive.defaults
 * @static
 */
RowReorder.defaults = {
	selector: 'td:first-child',

	snapX: false,

	update: true,

	dataSrc: 0
};


/*
 * API
 */
var Api = $.fn.dataTable.Api;

// Doesn't do anything - work around for a bug in DT... Not documented
Api.register( 'responsive()', function () {
	return this;
} );


/**
 * Version information
 *
 * @name Responsive.version
 * @static
 */
RowReorder.version = '1.0.0';


$.fn.dataTable.RowReorder = RowReorder;
$.fn.DataTable.RowReorder = RowReorder;

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on( 'init.dt.dtr', function (e, settings, json) {
	if ( e.namespace !== 'dt' ) {
		return;
	}

	var init = settings.oInit.rowReorder;
	var defaults = DataTable.defaults.rowReorder;

	if ( init || defaults ) {
		var opts = $.extend( {}, init, defaults );

		if ( init !== false ) {
			new RowReorder( settings, opts  );
		}
	}
} );

return RowReorder;
}; // /factory


// Define as an AMD module if possible
if ( typeof define === 'function' && define.amd ) {
	define( ['jquery', 'datatables'], factory );
}
else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    factory( require('jquery'), require('datatables') );
}
else if ( jQuery && !jQuery.fn.dataTable.RowReorder ) {
	// Otherwise simply initialise as normal, stopping multiple evaluation
	factory( jQuery, jQuery.fn.dataTable );
}


})(window, document);
