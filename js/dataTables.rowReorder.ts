
import DataTable, { Context } from 'datatables.net';
import './interface';
import { Defaults } from './interface';
import RowReorder from './RowReorder';

if (!DataTable.versionCheck('3')) {
	throw 'Warning: Select requires DataTables 3 or newer';
}

const Api = DataTable.Api;
const dom = DataTable.dom;
const util = DataTable.util;

// Doesn't do anything - work around for a bug in DT... Not documented
Api.register('rowReorder()', function () {
	return this;
});

Api.register('rowReorder.enable()', function (toggle) {
	if (toggle === undefined) {
		toggle = true;
	}

	return this.iterator('table', function (ctx) {
		if (ctx.rowreorder) {
			ctx.rowreorder.c.enable = toggle;
		}
	});
});

Api.register('rowReorder.disable()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx.rowreorder) {
			ctx.rowreorder.c.enable = false;
		}
	});
});

DataTable.RowReorder = RowReorder;

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
dom.s(document).on('init.dt.dtr', function (e, settings: Context, json) {
	if (e.namespace !== 'dt') {
		return;
	}

	var init = settings.init.rowReorder;
	var defaults = DataTable.defaults.rowReorder;

	if (init || defaults) {
		let opts: Partial<Defaults> = {};

		if (util.is.plainObject(defaults)) {
			util.object.assign(opts, defaults);
		}

		if (util.is.plainObject(init)) {
			util.object.assign(opts, init);
		}

		if (init !== false) {
			let dt = new DataTable.Api(settings);

			new RowReorder(dt, opts);
		}
	}
});
