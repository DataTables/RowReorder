// Type definitions for JQuery DataTables RowReorder extension 1.1
// Project: http://datatables.net/extensions/rowreorder/, https://datatables.net
// Definitions by: Vincent Biret <https://github.com/baywet>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.4

/// <reference types="jquery" />
/// <reference types="datatables.net"/>

declare namespace DataTables {
    interface Settings {
        /**
         * Enable and configure the RowReorder extension for DataTables
         */
        rowReorder?: RowReorderSettings;
    }

    interface Api {
        rowReorder:{
            /**
             * Disable the end user's ability to click and drag to reorder rows.
             * 
             * @returns DataTables API instance
             */
            disable(): Api;

            /**
             * Enable, or optionally disable, the end user's ability to click and drag to reorder rows.
             * 
             * @param enable that can be used to indicate if row reordering should be enabled or disabled.
             * @returns DataTables API instance
             */
            enable(enable?: boolean): Api;
        };
    }

    interface RowReorderSettings {
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
}
