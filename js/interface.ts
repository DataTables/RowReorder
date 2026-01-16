// Type definitions for DataTables RowReorder
//
// Project: https://datatables.net/extensions/rowreorder/, https://datatables.net
// Definitions by:
//   SpryMedia
//   Vincent Biret <https://github.com/baywet>

import DataTables, { Api, Dom } from 'datatables.net';
import RowReorder from './RowReorder';

export default DataTables;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables' types integration
 */
declare module 'datatables.net' {
	interface Config {
		/**
		 * RowReorder extension options
		 */
		rowReorder?: boolean | ConfigRowReorder;
	}

	interface Defaults {
		/**
		 * RowReorder extension options
		 */
		rowReorder?: boolean | ConfigRowReorder;
	}

	interface Api<T> {
		/**
		 * RowReorder methods container
		 * 
		 * @returns Api for chaining with the additional RowReorder methods
		 */
		rowReorder: ApiRowReorderMethods<T>;
	}

	interface Context {
		rowreorder: RowReorder;
	}

	interface DataTablesStatic {
		/**
		 * RowReorder class
		 */
		RowReorder: typeof RowReorder
	}
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Options
 */

interface ConfigRowReorder {
	/**
	 * Configure the data point that will be used for the reordering data
	 */
	dataSrc?: string;

	/**
	 * Attach an Editor instance for database updating
	 */
	editor?: any;

	/**
	 * Enable / disable RowReorder's user interaction
	 */
	enable?: boolean;

	/**
	 * Set the options for the Editor form when submitting data
	 */
	formOptions?: any;

	/**
	 * Define the selector used to pick the elements that will start a drag
	 */
	selector?: string;

	/**
	 * Horizontal position control of the row being dragged
	 */
	snapX?: number | boolean;

	/**
	 * Control automatic of data when a row is dropped
	 */
	update?: boolean;
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * API
 */

interface ApiRowReorderMethods<T> extends Api<T> {
	/**
	 * Disable the end user's ability to click and drag to reorder rows.
	 * 
	 * @returns DataTables API instance
	 */
	disable(): Api<T>;

	/**
	 * Enable, or optionally disable, the end user's ability to click and drag to reorder rows.
	 * 
	 * @param enable that can be used to indicate if row reordering should be enabled or disabled.
	 * @returns DataTables API instance
	 */
	enable(enable?: boolean): Api<T>;
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Internal
 */
export interface Defaults {
		/**
		 * Data point in the host row's data source object for where to get and
		 * set the data to reorder. This will normally also be the sorting
		 * column.
		 */
		dataSrc: number;

		/**
		 * Editor instance that will be used to perform the update
		 */
		editor: any;

		/**
		 * Enable / disable RowReorder's user interaction
		 */
		enable: boolean;

		/**
		 * Form options to pass to Editor when submitting a change in the row
		 * order. See the Editor `from-options` object for details of the
		 * options available.
		 */
		formOptions: any;

		/**
		 * Drag handle selector. This defines the element that when dragged will
		 * reorder a row.
		 */
		selector: string;

		/**
		 * Optionally lock the dragged row's x-position. This can be `true` to
		 * fix the position match the host table's, `false` to allow free
		 * movement of the row, or a number to define an offset from the host
		 * table.
		 */
		snapX: boolean | number;

		/**
		 * Update the table's data on drop
		 */
		update: boolean;

		/**
		 * Selector for children of the drag handle selector that mouseDown
		 * events will be passed through to and drag will not activate
		 */
		excludedChildren: 'a',

		/**
		 * Enable / disable the canceling of the drag & drop interaction
		 */
		cancelable: boolean;
}

export interface Settings {
	bodyArea: {
		bottom: number;
		left: number;
		right: number;
		top: number;
	}

	/** Scroll body top cache */
	bodyTop: number;

	/** DataTables' API instance */
	dt: Api;

	/** Data fetch function */
	getDataFn: Function;

	/** Pixel positions for row insertion calculation */
	middles: number[];

	/** Cached dimension information for use in the mouse move event handler */
	scroll: {
		windowHeight: number;
		windowWidth: number;
		dtTop: number | null;
		dtLeft: number | null;
		dtHeight: number | null;
		dtWidth: number | null;
		windowVert?: number;
		dtVert?: number;
	};

	/** Interval object used for smooth scrolling */
	scrollInterval: any;

	/** Data set function */
	setDataFn: Function;

	/** Mouse down information */
	start: {
		top: number;
		left: number;
		offsetTop: number;
		offsetLeft: number;
		nodes: HTMLElement[],
		rowIndex: number;
	};

	/** Window height cached value */
	windowHeight: number;

	/** Document outer height cached value */
	documentOuterHeight: number;

	/** DOM clone outer height cached value */
	domCloneOuterHeight: number;

	/** Flag used for signing if the drop is enabled or not */
	dropAllowed: boolean;

	/** Position of the drop */
	lastInsert: number;
}

export interface InternalDom {
	clone: Dom | null;
	cloneParent: Dom | null;
	dtScroll: Dom;
	target: Dom;
}

export interface Diff {
	node: HTMLElement;
	oldData: any;
	newData: any;
	newPosition: number;
	oldPosition: number;
}

export interface Area {
	left: number;
	top: number;
	right: number;
	bottom: number;
}