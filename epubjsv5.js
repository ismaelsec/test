/**
 * @license Epub.js v0.5.0-alpha.2 | BSD-2-Clause | https://github.com/futurepress/epub.js
 */

const { apply, call } = Function.prototype;
const { create, defineProperty, defineProperties } = Object; 
const hasOwnProperty = Object.prototype.hasOwnProperty;

const descriptor = { configurable: true, enumerable: false, writable: true };

const on = function (type, listener) {
	let data;

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

const once = function (type, listener) {
	let once, self;

	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

const off = function (type, listener) {
	let data, listeners, candidate, i;

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

const emit = function (type) {
	let i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};


const descriptors = {
	on: {
		value: on,
		configurable: true,
		enumerable: false,
		writable: true
	},
	once: {
		value: once,
		configurable: true,
		enumerable: false,
		writable: true
	},
	off: {
		value: off,
		configurable: true,
		enumerable: false,
		writable: true
	},
	emit: {
		value: emit,
		configurable: true,
		enumerable: false,
		writable: true
	}
};

const base = defineProperties({}, descriptors);

function EventEmitter (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
}

function isAbsolute(inputUrl) {
	if (!inputUrl) {
		return
	}
	if (inputUrl instanceof URL) {
		return true;
	}
	return inputUrl.indexOf("://") > -1;
}

function createUrl(inputUrl, base) {
	if (inputUrl instanceof URL) {
		return inputUrl;
	} else if (!base && !isAbsolute(inputUrl)) {
		let locationBase = "";
		if (typeof(window) !== "undefined" &&
			typeof(window.location) !== "undefined") {
			locationBase = window.location.href;
		} else {
			locationBase = "http://example.com"; // Prevent URL error
		}
		return new URL(inputUrl, locationBase);
	} else {
		return new URL(inputUrl, base);
	}
}

function filename(inputUrl) {
	const url = createUrl(inputUrl);
	return url.pathname.split('/').pop();
}

function directory(inputUrl) {
	const url = createUrl(inputUrl);
	const name = filename(url);
	return url.pathname.replace(name, "");
}

function extension(inputUrl) {
	const name = filename(inputUrl);
	return name.split('.').pop();
}

function resolve(inputUrl, path) {
	const url = createUrl(inputUrl);
	if (url.origin === "http://example.com") {
		return new URL(path, url).href.replace("http://example.com/", "");
	} else {
		return new URL(path, url).href
	}
}

function relative(inputUrl, path) {
	const url = createUrl(inputUrl); 
	return new URL(path, url).pathname;
}

var url = /*#__PURE__*/Object.freeze({
	__proto__: null,
	isAbsolute: isAbsolute,
	createUrl: createUrl,
	filename: filename,
	directory: directory,
	extension: extension,
	resolve: resolve,
	relative: relative
});

const EPUBJS_VERSION = "0.4";

// Dom events to listen for
const DOM_EVENTS = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

const EVENTS = {
	BOOK : {
		OPEN_FAILED : "openFailed",
		READY : "ready"
	},
	CONTENTS : {
		EXPAND : "expand",
		RESIZE : "resize",
		SELECTED : "selected",
		SELECTED_RANGE : "selectedRange",
		LINK_CLICKED : "linkClicked"
	},
	LOCATIONS : {
		CHANGED : "changed"
	},
	MANAGERS : {
		RESIZE : "resize",
		RESIZED : "resized",
		ORIENTATION_CHANGE : "orientationchange",
		ADDED : "added",
		SCROLL : "scroll",
		SCROLLED : "scrolled"
	},
	VIEWS : {
		AXIS : "axis",
		LOAD_ERROR : "loaderror",
		RENDERED : "rendered",
		RESIZED : "resized",
		DISPLAYED : "displayed",
		SHOWN : "shown",
		HIDDEN : "hidden",
		MARK_CLICKED : "markClicked"
	},
	RENDITION : {
		STARTED : "started",
		ATTACHED : "attached",
		DISPLAYED : "displayed",
		DISPLAY_ERROR : "displayerror",
		RENDERED : "rendered",
		REMOVED : "removed",
		RESIZED : "resized",
		ORIENTATION_CHANGE : "orientationchange",
		LOCATION_CHANGED : "locationChanged",
		RELOCATED : "relocated",
		MARK_CLICKED : "markClicked",
		SELECTED : "selected",
		LAYOUT: "layout",
		WORKER_FAILED: "workerFailed",
		WORKER_INACTIVE: "workerInactive"
	},
	LAYOUT : {
		UPDATED : "updated"
	}
};

const XML_NS = "http://www.w3.org/1999/xhtml";

/**
 * Core Utilities and Helpers
 * @module Core
 */

/**
 * Vendor prefixed requestAnimationFrame
 * @returns {function} requestAnimationFrame
 * @memberof Core
 */
const requestAnimationFrame$1 = (typeof window != "undefined") ? (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame) : false;
const ELEMENT_NODE$2 = 1;
const TEXT_NODE$1 = 3;
const COMMENT_NODE = 8;
const DOCUMENT_NODE$1 = 9;

/**
 * Generates a UUID
 * based on: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
 * @returns {string} uuid
 * @memberof Core
 */
function uuid() {
	var d = new Date().getTime();
	if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		d += performance.now(); //use high-precision timer if available
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

/**
 * Gets the height of a document
 * @returns {number} height
 * @memberof Core
 */
function documentHeight() {
	return Math.max(
		document.documentElement.clientHeight,
		document.body.scrollHeight,
		document.documentElement.scrollHeight,
		document.body.offsetHeight,
		document.documentElement.offsetHeight
	);
}

/**
 * Checks if a node is an element
 * @param {object} obj
 * @returns {boolean}
 * @memberof Core
 */
function isElement(obj) {
	return !!(obj && obj.nodeType == 1);
}

/**
 * @param {any} n
 * @returns {boolean}
 * @memberof Core
 */
function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * @param {any} n
 * @returns {boolean}
 * @memberof Core
 */
function isFloat(n) {
	let f = parseFloat(n);

	if (isNumber(n) === false) {
		return false;
	}

	if (typeof n === "string" && n.indexOf(".") > -1) {
		return true;
	}

	return Math.floor(f) !== f;
}

/**
 * Get a prefixed css property
 * @param {string} unprefixed
 * @returns {string}
 * @memberof Core
 */
function prefixed(unprefixed) {
	var vendors = ["Webkit", "webkit", "Moz", "O", "ms"];
	var prefixes = ["-webkit-", "-webkit-", "-moz-", "-o-", "-ms-"];
	var upper = unprefixed[0].toUpperCase() + unprefixed.slice(1);
	var length = vendors.length;

	if (typeof (document) === "undefined" || typeof (document.body.style[unprefixed]) != "undefined") {
		return unprefixed;
	}

	for (var i = 0; i < length; i++) {
		if (typeof (document.body.style[vendors[i] + upper]) != "undefined") {
			return prefixes[i] + unprefixed;
		}
	}

	return unprefixed;
}

/**
 * Apply defaults to an object
 * @param {object} obj
 * @returns {object}
 * @memberof Core
 */
function defaults(obj) {
	for (var i = 1, length = arguments.length; i < length; i++) {
		var source = arguments[i];
		for (var prop in source) {
			if (obj[prop] === void 0) obj[prop] = source[prop];
		}
	}
	return obj;
}

/**
 * Extend properties of an object
 * @param {object} target
 * @returns {object}
 * @memberof Core
 */
function extend(target) {
	var sources = [].slice.call(arguments, 1);
	sources.forEach(function (source) {
		if (!source) return;
		Object.getOwnPropertyNames(source).forEach(function (propName) {
			Object.defineProperty(target, propName, Object.getOwnPropertyDescriptor(source, propName));
		});
	});
	return target;
}

/**
 * Fast quicksort insert for sorted array -- based on:
 *  http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
 * @param {any} item
 * @param {array} array
 * @param {function} [compareFunction]
 * @returns {number} location (in array)
 * @memberof Core
 */
function insert(item, array, compareFunction) {
	var location = locationOf(item, array, compareFunction);
	array.splice(location, 0, item);

	return location;
}

/**
 * Finds where something would fit into a sorted array
 * @param {any} item
 * @param {array} array
 * @param {function} [compareFunction]
 * @param {function} [_start]
 * @param {function} [_end]
 * @returns {number} location (in array)
 * @memberof Core
 */
function locationOf(item, array, compareFunction, _start, _end) {
	var start = _start || 0;
	var end = _end || array.length;
	var pivot = parseInt(start + (end - start) / 2);
	var compared;
	if (!compareFunction) {
		compareFunction = function (a, b) {
			if (a > b) return 1;
			if (a < b) return -1;
			if (a == b) return 0;
		};
	}
	if (end - start <= 0) {
		return pivot;
	}

	compared = compareFunction(array[pivot], item);
	if (end - start === 1) {
		return compared >= 0 ? pivot : pivot + 1;
	}
	if (compared === 0) {
		return pivot;
	}
	if (compared === -1) {
		return locationOf(item, array, compareFunction, pivot, end);
	} else {
		return locationOf(item, array, compareFunction, start, pivot);
	}
}

/**
 * Finds index of something in a sorted array
 * Returns -1 if not found
 * @param {any} item
 * @param {array} array
 * @param {function} [compareFunction]
 * @param {function} [_start]
 * @param {function} [_end]
 * @returns {number} index (in array) or -1
 * @memberof Core
 */
function indexOfSorted$1(item, array, compareFunction, _start, _end) {
	var start = _start || 0;
	var end = _end || array.length;
	var pivot = parseInt(start + (end - start) / 2);
	var compared;
	if (!compareFunction) {
		compareFunction = function (a, b) {
			if (a > b) return 1;
			if (a < b) return -1;
			if (a == b) return 0;
		};
	}
	if (end - start <= 0) {
		return -1; // Not found
	}

	compared = compareFunction(array[pivot], item);
	if (end - start === 1) {
		return compared === 0 ? pivot : -1;
	}
	if (compared === 0) {
		return pivot; // Found
	}
	if (compared === -1) {
		return indexOfSorted$1(item, array, compareFunction, pivot, end);
	} else {
		return indexOfSorted$1(item, array, compareFunction, start, pivot);
	}
}
/**
 * Find the bounds of an element
 * taking padding and margin into account
 * @param {element} el
 * @returns {{ width: Number, height: Number}}
 * @memberof Core
 */
function bounds(el) {

	var style = window.getComputedStyle(el);
	var widthProps = ["width", "paddingRight", "paddingLeft", "marginRight", "marginLeft", "borderRightWidth", "borderLeftWidth"];
	var heightProps = ["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

	var width = 0;
	var height = 0;

	widthProps.forEach(function (prop) {
		width += parseFloat(style[prop]) || 0;
	});

	heightProps.forEach(function (prop) {
		height += parseFloat(style[prop]) || 0;
	});

	return {
		height: height,
		width: width
	};

}

/**
 * Find the bounds of an element
 * taking padding, margin and borders into account
 * @param {element} el
 * @returns {{ width: Number, height: Number}}
 * @memberof Core
 */
function borders(el) {

	var style = window.getComputedStyle(el);
	var widthProps = ["paddingRight", "paddingLeft", "marginRight", "marginLeft", "borderRightWidth", "borderLeftWidth"];
	var heightProps = ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

	var width = 0;
	var height = 0;

	widthProps.forEach(function (prop) {
		width += parseFloat(style[prop]) || 0;
	});

	heightProps.forEach(function (prop) {
		height += parseFloat(style[prop]) || 0;
	});

	return {
		height: height,
		width: width
	};

}

/**
 * Find the bounds of any node
 * allows for getting bounds of text nodes by wrapping them in a range
 * @param {node} node
 * @returns {BoundingClientRect}
 * @memberof Core
 */
function nodeBounds(node) {
	let elPos;
	let doc = node.ownerDocument;
	if (node.nodeType == Node.TEXT_NODE) {
		let elRange = doc.createRange();
		elRange.selectNodeContents(node);
		elPos = elRange.getBoundingClientRect();
	} else {
		elPos = node.getBoundingClientRect();
	}
	return elPos;
}

/**
 * Find the equivelent of getBoundingClientRect of a browser window
 * @returns {{ width: Number, height: Number, top: Number, left: Number, right: Number, bottom: Number }}
 * @memberof Core
 */
function windowBounds() {

	var width = window.innerWidth;
	var height = window.innerHeight;

	return {
		top: 0,
		left: 0,
		right: width,
		bottom: height,
		width: width,
		height: height
	};

}

/**
 * Gets the index of a node in its parent
 * @param {Node} node
 * @param {string} typeId
 * @return {number} index
 * @memberof Core
 */
function indexOfNode(node, typeId) {
	var parent = node.parentNode;
	var children = parent.childNodes;
	var sib;
	var index = -1;
	for (var i = 0; i < children.length; i++) {
		sib = children[i];
		if (sib.nodeType === typeId) {
			index++;
		}
		if (sib == node) break;
	}

	return index;
}

/**
 * Gets the index of a text node in its parent
 * @param {node} textNode
 * @returns {number} index
 * @memberof Core
 */
function indexOfTextNode(textNode) {
	return indexOfNode(textNode, TEXT_NODE$1);
}

/**
 * Gets the index of an element node in its parent
 * @param {element} elementNode
 * @returns {number} index
 * @memberof Core
 */
function indexOfElementNode(elementNode) {
	return indexOfNode(elementNode, ELEMENT_NODE$2);
}

/**
 * Check if extension is xml
 * @param {string} ext
 * @returns {boolean}
 * @memberof Core
 */
function isXml(ext) {
	return ["xml", "opf", "ncx"].indexOf(ext) > -1;
}

/**
 * Create a new blob
 * @param {any} content
 * @param {string} mime
 * @returns {Blob}
 * @memberof Core
 */
function createBlob(content, mime) {
	return new Blob([content], {
		type: mime
	});
}

/**
 * Create a new blob url
 * @param {any} content
 * @param {string} mime
 * @returns {string} url
 * @memberof Core
 */
function createBlobUrl(content, mime) {
	var tempUrl;
	var blob = createBlob(content, mime);

	tempUrl = URL.createObjectURL(blob);

	return tempUrl;
}

/**
 * Remove a blob url
 * @param {string} url
 * @memberof Core
 */
function revokeBlobUrl(url) {
	return URL.revokeObjectURL(url);
}

/**
 * Create a new base64 encoded url
 * @param {any} content
 * @param {string} mime
 * @returns {string} url
 * @memberof Core
 */
function createBase64Url(content, mime) {
	var data;
	var datauri;

	if (typeof (content) !== "string") {
		// Only handles strings
		return;
	}

	data = btoa(encodeURIComponent(content));

	datauri = "data:" + mime + ";base64," + data;

	return datauri;
}

/**
 * Get type of an object
 * @param {object} obj
 * @returns {string} type
 * @memberof Core
 */
function type(obj) {
	return Object.prototype.toString.call(obj).slice(8, -1);
}

/**
 * Parse xml (or html) markup
 * @param {string} markup
 * @param {string} mime
 * @param {DOMParser} parser use xmlDom to parse instead of native parser
 * @returns {document} document
 * @memberof Core
 */
function parse$1(markup, mime, parser) {
	let doc;
	const Parser = parser || DOMParser;

	// Remove byte order mark before parsing
	// https://www.w3.org/International/questions/qa-byte-order-mark
	if (markup.charCodeAt(0) === 0xFEFF) {
		markup = markup.slice(1);
	}

	doc = new Parser().parseFromString(markup, mime);

	return doc;
}

/**
 * querySelector polyfill
 * @param {element} el
 * @param {string} sel selector string
 * @returns {element} element
 * @memberof Core
 */
function qs(el, sel) {
	var elements;
	if (!el) {
		throw new Error("No Element Provided");
	}

	if (typeof el.querySelector != "undefined") {
		return el.querySelector(sel);
	} else {
		elements = el.getElementsByTagName(sel);
		if (elements.length) {
			return elements[0];
		}
	}
}

/**
 * querySelectorAll polyfill
 * @param {element} el
 * @param {string} sel selector string
 * @returns {element[]} elements
 * @memberof Core
 */
function qsa(el, sel) {

	if (typeof el.querySelector != "undefined") {
		return el.querySelectorAll(sel);
	} else {
		return el.getElementsByTagName(sel);
	}
}

/**
 * querySelector by property
 * @param {element} el
 * @param {string} sel selector string
 * @param {object[]} props
 * @returns {element[]} elements
 * @memberof Core
 */
function qsp(el, sel, props) {
	var q, filtered;
	if (typeof el.querySelector != "undefined") {
		sel += "[";
		for (var prop in props) {
			sel += prop + "~='" + props[prop] + "'";
		}
		sel += "]";

		return el.querySelector(sel);
	} else {
		q = el.getElementsByTagName(sel);
		filtered = Array.prototype.slice.call(q, 0).filter(function (el) {
			for (var prop in props) {
				if (el.getAttribute(prop) === props[prop]) {
					return true;
				}
			}
			return false;
		});

		if (filtered) {
			return filtered[0];
		}
	}
}

/**
 * Sprint through all text nodes in a document
 * @memberof Core
 * @param  {element} root element to start with
 * @param  {function} func function to run on each element
 */
function sprint(root, func) {
	var doc = root.ownerDocument || root;
	if (typeof (doc.createTreeWalker) !== "undefined") {
		treeWalker(root, func, NodeFilter.SHOW_TEXT);
	} else {
		walk(root, function (node) {
			if (node && node.nodeType === 3) { // Node.TEXT_NODE
				func(node);
			}
		});
	}
}

/**
 * Create a treeWalker
 * @memberof Core
 * @param  {element} root element to start with
 * @param  {function} func function to run on each element
 * @param  {function | object} filter funtion or object to filter with
 */
function treeWalker(root, func, filter) {
	var treeWalker = document.createTreeWalker(root, filter, null, false);
	let node;
	while ((node = treeWalker.nextNode())) {
		func(node);
	}
}

/**
 * @memberof Core
 * @param {node} node
 * @param {callback} return false for continue,true for break inside callback
 */
function walk(node, callback) {
	if (callback(node)) {
		return true;
	}
	node = node.firstChild;
	if (node) {
		do {
			let walked = walk(node, callback);
			if (walked) {
				return true;
			}
			node = node.nextSibling;
		} while (node);
	}
}

/**
 * Convert a blob to a base64 encoded string
 * @param {Blog} blob
 * @returns {string}
 * @memberof Core
 */
function blob2base64(blob) {
	return new Promise(function (resolve, reject) {
		var reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = function () {
			resolve(reader.result);
		};
	});
}


/**
 * Creates a new pending promise and provides methods to resolve or reject it.
 * From: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred#backwards_forwards_compatible
 * @memberof Core
 */
function defer() {
	/* A method to resolve the associated Promise with the value passed.
	 * If the promise is already settled it does nothing.
	 *
	 * @param {anything} value : This value is used to resolve the promise
	 * If the value is a Promise then the associated promise assumes the state
	 * of Promise passed as value.
	 */
	this.resolve = null;

	/* A method to reject the assocaited Promise with the value passed.
	 * If the promise is already settled it does nothing.
	 *
	 * @param {anything} reason: The reason for the rejection of the Promise.
	 * Generally its an Error object. If however a Promise is passed, then the Promise
	 * itself will be the reason for rejection no matter the state of the Promise.
	 */
	this.reject = null;

	this.id = uuid();

	/* A newly created Pomise object.
	 * Initially in pending state.
	 */
	this.promise = new Promise((resolve, reject) => {
		this.resolve = resolve;
		this.reject = reject;
	});
	Object.freeze(this);
}

/**
 * querySelector with filter by epub type
 * @param {element} html
 * @param {string} element element type to find
 * @param {string} type epub type to find
 * @returns {element[]} elements
 * @memberof Core
 */
function querySelectorByType(html, element, type) {
	var query;
	if (typeof html.querySelector != "undefined") {
		query = html.querySelector(`${element}[*|type="${type}"]`);
	}
	// Handle IE not supporting namespaced epub:type in querySelector
	if (!query || query.length === 0) {
		query = qsa(html, element);
		for (var i = 0; i < query.length; i++) {
			if (query[i].getAttributeNS("http://www.idpf.org/2007/ops", "type") === type ||
				query[i].getAttribute("epub:type") === type) {
				return query[i];
			}
		}
	} else {
		return query;
	}
}

/**
 * Find direct decendents of an element
 * @param {element} el
 * @returns {element[]} children
 * @memberof Core
 */
function findChildren(el) {
	var result = [];
	var childNodes = el.childNodes;
	for (var i = 0; i < childNodes.length; i++) {
		let node = childNodes[i];
		if (node.nodeType === 1) {
			result.push(node);
		}
	}
	return result;
}

/**
 * Find all parents (ancestors) of an element
 * @param {element} node
 * @returns {element[]} parents
 * @memberof Core
 */
function parents(node) {
	var nodes = [node];
	for (; node; node = node.parentNode) {
		nodes.unshift(node);
	}
	return nodes;
}

/**
 * Find all direct decendents of a specific type
 * @param {element} el
 * @param {string} nodeName
 * @param {boolean} [single]
 * @returns {element[]} children
 * @memberof Core
 */
function filterChildren(el, nodeName, single) {
	var result = [];
	var childNodes = el.childNodes;
	for (var i = 0; i < childNodes.length; i++) {
		let node = childNodes[i];
		if (node.nodeType === 1 && node.nodeName.toLowerCase() === nodeName) {
			if (single) {
				return node;
			} else {
				result.push(node);
			}
		}
	}
	if (!single) {
		return result;
	}
}

/**
 * Filter all parents (ancestors) with tag name
 * @param {element} node
 * @param {string} tagname
 * @returns {element[]} parents
 * @memberof Core
 */
function getParentByTagName(node, tagname) {
	let parent;
	if (node === null || tagname === "") return;
	parent = node.parentNode;
	while (parent.nodeType === 1) {
		if (parent.tagName.toLowerCase() === tagname) {
			return parent;
		}
		parent = parent.parentNode;
	}
}

/**
 * Get the next section in the spine
 */
function nextSection(section, readingOrder) {
	let nextIndex = section.index;
	if (nextIndex < readingOrder.length - 1) {
		return readingOrder.get(nextIndex + 1);
	}
	return;
}

/**
 * Get the previous section in the spine
 */
function prevSection(section, readingOrder) {
	let prevIndex = section.index;
	if (prevIndex > 0) {
		return readingOrder.get(prevIndex - 1);
	}
	return;
}

/**
 * Serialize the contents of a document
 */
function serialize(doc) {
	let userAgent = (typeof navigator !== "undefined" && navigator.userAgent) || "";
	let isIE = userAgent.indexOf("Trident") >= 0;
	let Serializer;
	if (typeof XMLSerializer === "undefined" || isIE) ; else {
		Serializer = XMLSerializer;
	}
	let serializer = new Serializer();
	return serializer.serializeToString(doc);
}

/**
 * Lightweight Polyfill for DOM Range
 * @class
 * @memberof Core
 */
class RangeObject {
	constructor() {
		this.collapsed = false;
		this.commonAncestorContainer = undefined;
		this.endContainer = undefined;
		this.endOffset = undefined;
		this.startContainer = undefined;
		this.startOffset = undefined;
	}

	setStart(startNode, startOffset) {
		this.startContainer = startNode;
		this.startOffset = startOffset;

		if (!this.endContainer) {
			this.collapse(true);
		} else {
			this.commonAncestorContainer = this._commonAncestorContainer();
		}

		this._checkCollapsed();
	}

	setEnd(endNode, endOffset) {
		this.endContainer = endNode;
		this.endOffset = endOffset;

		if (!this.startContainer) {
			this.collapse(false);
		} else {
			this.collapsed = false;
			this.commonAncestorContainer = this._commonAncestorContainer();
		}

		this._checkCollapsed();
	}

	collapse(toStart) {
		this.collapsed = true;
		if (toStart) {
			this.endContainer = this.startContainer;
			this.endOffset = this.startOffset;
			this.commonAncestorContainer = this.startContainer.parentNode;
		} else {
			this.startContainer = this.endContainer;
			this.startOffset = this.endOffset;
			this.commonAncestorContainer = this.endOffset.parentNode;
		}
	}

	selectNode(referenceNode) {
		let parent = referenceNode.parentNode;
		let index = Array.prototype.indexOf.call(parent.childNodes, referenceNode);
		this.setStart(parent, index);
		this.setEnd(parent, index + 1);
	}

	selectNodeContents(referenceNode) {
		// let end = referenceNode.childNodes[referenceNode.childNodes - 1];
		let endIndex = (referenceNode.nodeType === 3) ?
			referenceNode.textContent.length : parent.childNodes.length;
		this.setStart(referenceNode, 0);
		this.setEnd(referenceNode, endIndex);
	}

	_commonAncestorContainer(startContainer, endContainer) {
		var startParents = parents(startContainer || this.startContainer);
		var endParents = parents(endContainer || this.endContainer);

		if (startParents[0] != endParents[0]) return undefined;

		for (var i = 0; i < startParents.length; i++) {
			if (startParents[i] != endParents[i]) {
				return startParents[i - 1];
			}
		}
	}

	_checkCollapsed() {
		if (this.startContainer === this.endContainer &&
			this.startOffset === this.endOffset) {
			this.collapsed = true;
		} else {
			this.collapsed = false;
		}
	}

	toString() {
		// TODO: implement walking between start and end to find text
	}
}

function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}

function throttle(func, wait = 300, options = {}) {
	let result;
	let timeout = null;
	let previous = 0;
	return (...args) => {
		let now = Date.now();
		if (!previous && options.leading === false) {
			previous = now;
		}
		let remaining = wait - (now - previous);
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(this, args);
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(() => {
				previous = (options.leading === false) ? 0 : Date.now();
				timeout = null;
				result = func.apply(this, args);
			}, remaining);
		}
		return result;
	};
}

function isXMLDocument(doc) {
	return doc && doc.documentElement.getAttribute('xmlns') === XML_NS;
}

var core = /*#__PURE__*/Object.freeze({
	__proto__: null,
	requestAnimationFrame: requestAnimationFrame$1,
	ELEMENT_NODE: ELEMENT_NODE$2,
	TEXT_NODE: TEXT_NODE$1,
	COMMENT_NODE: COMMENT_NODE,
	DOCUMENT_NODE: DOCUMENT_NODE$1,
	uuid: uuid,
	documentHeight: documentHeight,
	isElement: isElement,
	isNumber: isNumber,
	isFloat: isFloat,
	prefixed: prefixed,
	defaults: defaults,
	extend: extend,
	insert: insert,
	locationOf: locationOf,
	indexOfSorted: indexOfSorted$1,
	bounds: bounds,
	borders: borders,
	nodeBounds: nodeBounds,
	windowBounds: windowBounds,
	indexOfNode: indexOfNode,
	indexOfTextNode: indexOfTextNode,
	indexOfElementNode: indexOfElementNode,
	isXml: isXml,
	createBlob: createBlob,
	createBlobUrl: createBlobUrl,
	revokeBlobUrl: revokeBlobUrl,
	createBase64Url: createBase64Url,
	type: type,
	parse: parse$1,
	qs: qs,
	qsa: qsa,
	qsp: qsp,
	sprint: sprint,
	treeWalker: treeWalker,
	walk: walk,
	blob2base64: blob2base64,
	defer: defer,
	querySelectorByType: querySelectorByType,
	findChildren: findChildren,
	parents: parents,
	filterChildren: filterChildren,
	getParentByTagName: getParentByTagName,
	nextSection: nextSection,
	prevSection: prevSection,
	serialize: serialize,
	RangeObject: RangeObject,
	debounce: debounce,
	throttle: throttle,
	isXMLDocument: isXMLDocument
});

/**
 * A collection of Resources
 */
class ResourceList extends Map {
	constructor(items) {
		super(items);
		this.order = Array.from(this.entries());
		this.ids = new Map();
	}

	// unordered
	add(resource) {
		const { url } = resource;

		this.set(url, resource);

		if (resource.id) {
			this.ids.set(resource.id, url);
		}

		return this.size;
	}

	// ordered
	append(resource) {
		const { url } = resource;
		const index = this.size;
		resource.index = index;

		this.order.push(url);
		this.set(url, resource);

		if (resource.id) {
			this.ids.set(resource.id, url);
		}

		return index;
	}

	prepend(resource) {
		const { url } = resource;
		const index = 0;

		resource.index = index;
		
		this.order.unshift(url);

		if (resource.id) {
			this.ids.set(resource.id, url);
		}
		
		const tempMap = new Map(this);

		this.clear();

		this.set(url, resource);

		// Re-index
		let newIndex = 1;
		tempMap.forEach((value, key) => {
			value.index = newIndex;
			this.set(key, value);
			newIndex++;
		});

		return index;
	}

	insert(resource, index) {
		const { url } = resource;
		resource.index = index;

		if (resource.id) {
			this.ids.set(resource.id, url);
		}

		if (index > -1) {
			this.order.splice(index, 1);
			const tempMap = new Map(this);
			this.clear();

			let newIndex = 0;
			tempMap.forEach((value, key) => {
				if (index === newIndex) {
					this.set(url, resource);
					newIndex++;
				}
				if (index < newIndex) {
					value.index = newIndex;
					this.set(key, value);
				}
				newIndex++;
			});
		}
	}

	delete(resource) {
		const { url } = resource;
		super.delete(resource);

		if (resource.id) {
			this.ids.delete(resource.id);
		}

		const index = this.order.indexOf(url);
		if (index > -1) {
			this.order.splice(index, 1);

			let newIndex = 0;
			this.forEach((value, key) => {
				value.index = newIndex;
				newIndex++;
			});
		}
	}

	get(what) {
		if (isNumber(what)) {
			const url = (what > -1) && (what < this.order.length) && this.order[what];
			if (url) {
				return this.get(url);
			}
		}
		return super.get(what);
	}

	id(what) {
		let index = this.ids.get(what);
		if (index) {
			return this.get(index);
		}
	}

	first() {
		const url = this.order.length && this.order[0];
		if (url) {
			return this.get(url);
		}
	}

	last() {
		const url = this.order.length && this.order[this.order.length - 1];
		if (url) {
			return this.get(url);
		}
	}

	find(fn) {

		if (!fn) {
			return;
		}

		for (const [key, resource] of this) {
			let result = fn(resource);
			if (result) {
				return resource;
			}
		}
	}

	map(fn) {
		let results = [];

		if (!fn) {
			return;
		}

		for (const [key, resource] of this) {
			let result = fn(resource);
			if (result) {
				results.push(result);
			}
		}

		return results;
	}

	get length() {
		return this.size;
	}

	toArray() {
		return Array.from(this.values());
	}

	toJSON() {
		return this.toArray();
	}
}

function request(url, type, options={}) {
	let settings = {
		method: 'GET',
		headers: options.headers,
		credentials: options.credentials
	};

	// If type isn"t set, determine it from the file extension
	if(!type) {
		type = extension(url);
	}

	return fetch(url, settings)
		.then(function(response) {
			let deferred = new defer();
			if(response.ok) {
				return response;
			} else if (response.status === 403) {
				deferred.reject({
					status: this.response.status,
					response: this.response.response,
					message : "Forbidden",
					stack : new Error().stack
				});
				return deferred.promise;
			} else {
				deferred.reject({
					status: response.status,
					message : "Empty Response",
					stack : new Error().stack
				});
				return deferred.promise;
			}
		})
		.then(function(response) {
			if(isXml(type)){
				return response.text();
			} else if(type == "xhtml"){
				return response.text();
			} else if(type == "html" || type == "htm"){
				return response.text();
			} else if(type == "json"){
				return response.json();
			} else if(type == "blob"){
				return response.blob();
			} else if(type == "binary"){
				return response.arrayBuffer();
			} else {
				return response.text();
			}
		})
		.then(function(result) {
			let r;

			if(isXml(type)){
				r = parse$1(result, "text/xml");
			} else if(type === "xhtml"){
				r = parse$1(result, "application/xhtml+xml");
			} else if(type === "html" || type === "htm"){
				r = parse$1(result, "text/html");
			} else if(type === "json"){
				r = result;
			} else if(type === "blob"){
				r = result;
			} else {
				r = result;
			}

			return r;
		});
}

const ELEMENT_NODE$1 = 1;
const TEXT_NODE = 3;
const DOCUMENT_NODE = 9;

/**
	* Parsing and creation of EpubCFIs: http://www.idpf.org/epub/linking/cfi/epub-cfi.html

	* Implements:
	* - Character Offset: epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/2/1:3)
	* - Simple Ranges : epubcfi(/6/4[chap01ref]!/4[body01]/10[para05],/2/1:1,/3:4)

	* Does Not Implement:
	* - Temporal Offset (~)
	* - Spatial Offset (@)
	* - Temporal-Spatial Offset (~ + @)
	* - Text Location Assertion ([)
	* @class
	@param {string | Range | Node } [cfiFrom]
	@param {string | object} [base]
	@param {string} [ignoreClass] class to ignore when parsing DOM
*/
class EpubCFI {
	constructor(cfiFrom, base, ignoreClass){
		var type;

		this.str = "";

		this.base = {};
		this.spinePos = 0; // For compatibility

		this.range = false; // true || false;

		this.path = {};
		this.start = null;
		this.end = null;

		// Allow instantiation without the "new" keyword
		if (!(this instanceof EpubCFI)) {
			return new EpubCFI(cfiFrom, base, ignoreClass);
		}

		if(typeof base === "string") {
			this.base = this.parseComponent(base);
		} else if(typeof base === "object" && base.steps) {
			this.base = base;
		}

		type = this.checkType(cfiFrom);


		if(type === "string") {
			this.str = cfiFrom;
			return extend(this, this.parse(cfiFrom));
		} else if (type === "range") {
			return extend(this, this.fromRange(cfiFrom, this.base, ignoreClass));
		} else if (type === "node") {
			return extend(this, this.fromNode(cfiFrom, this.base, ignoreClass));
		} else if (type === "EpubCFI" && cfiFrom.path) {
			return cfiFrom;
		} else if (!cfiFrom) {
			return this;
		} else {
			throw new TypeError("not a valid argument for EpubCFI");
		}

	}

	/**
	 * Check the type of constructor input
	 * @private
	 */
	checkType(cfi) {

		if (this.isCfiString(cfi)) {
			return "string";
		// Is a range object
		} else if (cfi && typeof cfi === "object" && (type(cfi) === "Range" || typeof(cfi.startContainer) != "undefined")){
			return "range";
		} else if (cfi && typeof cfi === "object" && typeof(cfi.nodeType) != "undefined" ){ // || typeof cfi === "function"
			return "node";
		} else if (cfi && typeof cfi === "object" && cfi instanceof EpubCFI){
			return "EpubCFI";
		} else {
			return false;
		}
	}

	/**
	 * Parse a cfi string to a CFI object representation
	 * @param {string} cfiStr
	 * @returns {object} cfi
	 */
	parse(cfiStr) {
		var cfi = {
			spinePos: -1,
			range: false,
			base: {},
			path: {},
			start: null,
			end: null
		};
		var baseComponent, pathComponent, range;

		if(typeof cfiStr !== "string") {
			return {spinePos: -1};
		}

		if(cfiStr.indexOf("epubcfi(") === 0 && cfiStr[cfiStr.length-1] === ")") {
			// Remove initial epubcfi( and ending )
			cfiStr = cfiStr.slice(8, cfiStr.length-1);
		}

		baseComponent = this.getChapterComponent(cfiStr);

		// Make sure this is a valid cfi or return
		if(!baseComponent) {
			return {spinePos: -1};
		}

		cfi.base = this.parseComponent(baseComponent);

		pathComponent = this.getPathComponent(cfiStr);
		cfi.path = this.parseComponent(pathComponent);

		range = this.getRange(cfiStr);

		if(range) {
			cfi.range = true;
			cfi.start = this.parseComponent(range[0]);
			cfi.end = this.parseComponent(range[1]);
		}

		// Get spine node position
		// cfi.spineSegment = cfi.base.steps[1];

		// Chapter segment is always the second step
		if (!cfi.base.steps || cfi.base.steps.length < 2) {
			return { spinePos: -1 };
		} else {
			cfi.spinePos = cfi.base.steps[1].index;
		}

		return cfi;
	}

	parseComponent(componentStr){
		var component = {
			steps: [],
			terminal: {
				offset: null,
				assertion: null
			}
		};
		var parts = componentStr.split(":");
		var steps = parts[0].split("/");
		var terminal;

		if(parts.length > 1) {
			terminal = parts[1];
			component.terminal = this.parseTerminal(terminal);
		}

		if (steps[0] === "") {
			steps.shift(); // Ignore the first slash
		}

		component.steps = steps.map(function(step){
			return this.parseStep(step);
		}.bind(this));

		return component;
	}

	parseStep(stepStr){
		var type, num, index, has_brackets, id;

		has_brackets = stepStr.match(/\[(.*)\]/);
		if(has_brackets && has_brackets[1]){
			id = has_brackets[1];
		}

		//-- Check if step is a text node or element
		num = parseInt(stepStr);

		if(isNaN(num)) {
			return;
		}

		if(num % 2 === 0) { // Even = is an element
			type = "element";
			index = num / 2 - 1;
		} else {
			type = "text";
			index = (num - 1 ) / 2;
		}

		return {
			"type" : type,
			"index" : index,
			"id" : id || null
		};
	}

	parseTerminal(termialStr){
		var characterOffset, textLocationAssertion;
		var assertion = termialStr.match(/\[(.*)\]/);

		if(assertion && assertion[1]){
			characterOffset = parseInt(termialStr.split("[")[0]);
			textLocationAssertion = assertion[1];
		} else {
			characterOffset = parseInt(termialStr);
		}

		if (!isNumber(characterOffset)) {
			characterOffset = null;
		}

		return {
			"offset": characterOffset,
			"assertion": textLocationAssertion
		};

	}

	getChapterComponent(cfiStr) {

		var indirection = cfiStr.split("!");

		return indirection[0];
	}

	getPathComponent(cfiStr) {

		var indirection = cfiStr.split("!");

		if(indirection[1]) {
			let ranges = indirection[1].split(",");
			return ranges[0];
		}

	}

	getRange(cfiStr) {

		var ranges = cfiStr.split(",");

		if(ranges.length === 3){
			return [
				ranges[1],
				ranges[2]
			];
		}

		return false;
	}

	getCharecterOffsetComponent(cfiStr) {
		var splitStr = cfiStr.split(":");
		return splitStr[1] || "";
	}

	joinSteps(steps) {
		if(!steps) {
			return "";
		}

		return steps.map(function(part){
			var segment = "";

			if(part.type === "element") {
				segment += (part.index + 1) * 2;
			}

			if(part.type === "text") {
				segment += 1 + (2 * part.index); // TODO: double check that this is odd
			}

			if(part.id) {
				segment += "[" + part.id + "]";
			}

			return segment;

		}).join("/");

	}

	segmentString(segment) {
		var segmentString = "/";

		segmentString += this.joinSteps(segment.steps);

		if(segment.terminal && segment.terminal.offset != null){
			segmentString += ":" + segment.terminal.offset;
		}

		if(segment.terminal && segment.terminal.assertion != null){
			segmentString += "[" + segment.terminal.assertion + "]";
		}

		return segmentString;
	}

	/**
	 * Convert CFI to a epubcfi(...) string
	 * @returns {string} epubcfi
	 */
	toString() {
		var cfiString = "epubcfi(";

		cfiString += this.segmentString(this.base);

		cfiString += "!";
		cfiString += this.segmentString(this.path);

		// Add Range, if present
		if(this.range && this.start) {
			cfiString += ",";
			cfiString += this.segmentString(this.start);
		}

		if(this.range && this.end) {
			cfiString += ",";
			cfiString += this.segmentString(this.end);
		}

		cfiString += ")";

		return cfiString;
	}


	/**
	 * Compare which of two CFIs is earlier in the text
	 * @returns {number} First is earlier = -1, Second is earlier = 1, They are equal = 0
	 */
	compare(cfiOne, cfiTwo) {
		var stepsA, stepsB;
		var terminalA, terminalB;

		if(typeof cfiOne === "string") {
			cfiOne = new EpubCFI(cfiOne);
		}
		if(typeof cfiTwo === "string") {
			cfiTwo = new EpubCFI(cfiTwo);
		}
		// Compare Spine Positions
		if(cfiOne.spinePos > cfiTwo.spinePos) {
			return 1;
		}
		if(cfiOne.spinePos < cfiTwo.spinePos) {
			return -1;
		}

		if (cfiOne.range) {
			stepsA = cfiOne.path.steps.concat(cfiOne.start.steps);
			terminalA = cfiOne.start.terminal;
		} else {
			stepsA = cfiOne.path.steps;
			terminalA = cfiOne.path.terminal;
		}

		if (cfiTwo.range) {
			stepsB = cfiTwo.path.steps.concat(cfiTwo.start.steps);
			terminalB = cfiTwo.start.terminal;
		} else {
			stepsB = cfiTwo.path.steps;
			terminalB = cfiTwo.path.terminal;
		}

		// Compare Each Step in the First item
		for (var i = 0; i < stepsA.length; i++) {
			if(!stepsA[i]) {
				return -1;
			}
			if(!stepsB[i]) {
				return 1;
			}
			if(stepsA[i].index > stepsB[i].index) {
				return 1;
			}
			if(stepsA[i].index < stepsB[i].index) {
				return -1;
			}
			// Otherwise continue checking
		}

		// All steps in First equal to Second and First is Less Specific
		if(stepsA.length < stepsB.length) {
			return -1;
		}

		// Compare the character offset of the text node
		if(terminalA.offset > terminalB.offset) {
			return 1;
		}
		if(terminalA.offset < terminalB.offset) {
			return -1;
		}

		// CFI's are equal
		return 0;
	}

	step(node) {
		var nodeType = (node.nodeType === TEXT_NODE) ? "text" : "element";

		return {
			"id" : node.id,
			"tagName" : node.tagName,
			"type" : nodeType,
			"index" : this.position(node)
		};
	}

	filteredStep(node, ignoreClass) {
		var filteredNode = this.filter(node, ignoreClass);
		var nodeType;

		// Node filtered, so ignore
		if (!filteredNode) {
			return;
		}

		// Otherwise add the filter node in
		nodeType = (filteredNode.nodeType === TEXT_NODE) ? "text" : "element";

		return {
			"id" : filteredNode.id,
			"tagName" : filteredNode.tagName,
			"type" : nodeType,
			"index" : this.filteredPosition(filteredNode, ignoreClass)
		};
	}

	pathTo(node, offset, ignoreClass) {
		var segment = {
			steps: [],
			terminal: {
				offset: null,
				assertion: null
			}
		};
		var currentNode = node;
		var step;

		while(currentNode && currentNode.parentNode &&
					currentNode.parentNode.nodeType != DOCUMENT_NODE) {

			if (ignoreClass) {
				step = this.filteredStep(currentNode, ignoreClass);
			} else {
				step = this.step(currentNode);
			}

			if (step) {
				segment.steps.unshift(step);
			}

			currentNode = currentNode.parentNode;

		}

		if (offset != null && offset >= 0) {

			segment.terminal.offset = offset;

			// Make sure we are getting to a textNode if there is an offset
			if(segment.steps[segment.steps.length-1].type != "text") {
				segment.steps.push({
					"type" : "text",
					"index" : 0
				});
			}

		}


		return segment;
	}

	equalStep(stepA, stepB) {
		if (!stepA || !stepB) {
			return false;
		}

		if(stepA.index === stepB.index &&
			 stepA.id === stepB.id &&
			 stepA.type === stepB.type) {
			return true;
		}

		return false;
	}

	/**
	 * Create a CFI object from a Range
	 * @param {Range} range
	 * @param {string | object} base
	 * @param {string} [ignoreClass]
	 * @returns {object} cfi
	 */
	fromRange(range, base, ignoreClass) {
		var cfi = {
			range: false,
			base: {},
			path: {},
			start: null,
			end: null
		};

		var start = range.startContainer;
		var end = range.endContainer;

		var startOffset = range.startOffset;
		var endOffset = range.endOffset;

		var needsIgnoring = false;

		if (ignoreClass) {
			// Tell pathTo if / what to ignore
			needsIgnoring = (start.ownerDocument.querySelector("." + ignoreClass) != null);
		}


		if (typeof base === "string") {
			cfi.base = this.parseComponent(base);
			cfi.spinePos = cfi.base.steps[1].index;
		} else if (typeof base === "object") {
			cfi.base = base;
		}

		if (range.collapsed) {
			if (needsIgnoring) {
				startOffset = this.patchOffset(start, startOffset, ignoreClass);
			}
			cfi.path = this.pathTo(start, startOffset, ignoreClass);
		} else {
			cfi.range = true;

			if (needsIgnoring) {
				startOffset = this.patchOffset(start, startOffset, ignoreClass);
			}

			cfi.start = this.pathTo(start, startOffset, ignoreClass);
			if (needsIgnoring) {
				endOffset = this.patchOffset(end, endOffset, ignoreClass);
			}

			cfi.end = this.pathTo(end, endOffset, ignoreClass);

			// Create a new empty path
			cfi.path = {
				steps: [],
				terminal: null
			};

			// Push steps that are shared between start and end to the common path
			var len = cfi.start.steps.length;
			var i;

			for (i = 0; i < len; i++) {
				if (this.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
					if(i === len-1) {
						// Last step is equal, check terminals
						if(cfi.start.terminal === cfi.end.terminal) {
							// CFI's are equal
							cfi.path.steps.push(cfi.start.steps[i]);
							// Not a range
							cfi.range = false;
						}
					} else {
						cfi.path.steps.push(cfi.start.steps[i]);
					}

				} else {
					break;
				}
			}

			cfi.start.steps = cfi.start.steps.slice(cfi.path.steps.length);
			cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length);

			// TODO: Add Sanity check to make sure that the end if greater than the start
		}

		return cfi;
	}

	/**
	 * Create a CFI object from a Node
	 * @param {Node} anchor
	 * @param {string | object} base
	 * @param {string} [ignoreClass]
	 * @returns {object} cfi
	 */
	fromNode(anchor, base, ignoreClass) {
		var cfi = {
			range: false,
			base: {},
			path: {},
			start: null,
			end: null
		};

		if (typeof base === "string") {
			cfi.base = this.parseComponent(base);
			cfi.spinePos = cfi.base.steps[1].index;
		} else if (typeof base === "object") {
			cfi.base = base;
		}

		cfi.path = this.pathTo(anchor, null, ignoreClass);

		return cfi;
	}

	filter(anchor, ignoreClass) {
		var needsIgnoring;
		var sibling; // to join with
		var parent, previousSibling, nextSibling;
		var isText = false;

		if (anchor.nodeType === TEXT_NODE) {
			isText = true;
			parent = anchor.parentNode;
			needsIgnoring = anchor.parentNode.classList.contains(ignoreClass);
		} else {
			isText = false;
			needsIgnoring = anchor.classList.contains(ignoreClass);
		}

		if (needsIgnoring && isText) {
			previousSibling = parent.previousSibling;
			nextSibling = parent.nextSibling;

			// If the sibling is a text node, join the nodes
			if (previousSibling && previousSibling.nodeType === TEXT_NODE) {
				sibling = previousSibling;
			} else if (nextSibling && nextSibling.nodeType === TEXT_NODE) {
				sibling = nextSibling;
			}

			if (sibling) {
				return sibling;
			} else {
				// Parent will be ignored on next step
				return anchor;
			}

		} else if (needsIgnoring && !isText) {
			// Otherwise just skip the element node
			return false;
		} else {
			// No need to filter
			return anchor;
		}

	}

	patchOffset(anchor, offset, ignoreClass) {
		if (anchor.nodeType != TEXT_NODE) {
			throw new Error("Anchor must be a text node");
		}

		var curr = anchor;
		var totalOffset = offset;

		// If the parent is a ignored node, get offset from it's start
		if (anchor.parentNode.classList.contains(ignoreClass)) {
			curr = anchor.parentNode;
		}

		while (curr.previousSibling) {
			if(curr.previousSibling.nodeType === ELEMENT_NODE$1) {
				// Originally a text node, so join
				if(curr.previousSibling.classList.contains(ignoreClass)){
					totalOffset += curr.previousSibling.textContent.length;
				} else {
					break; // Normal node, dont join
				}
			} else {
				// If the previous sibling is a text node, join the nodes
				totalOffset += curr.previousSibling.textContent.length;
			}

			curr = curr.previousSibling;
		}

		return totalOffset;

	}

	normalizedMap(children, nodeType, ignoreClass) {
		var output = {};
		var prevIndex = -1;
		var i, len = children.length;
		var currNodeType;
		var prevNodeType;

		for (i = 0; i < len; i++) {

			currNodeType = children[i].nodeType;

			// Check if needs ignoring
			if (currNodeType === ELEMENT_NODE$1 &&
					children[i].classList.contains(ignoreClass)) {
				currNodeType = TEXT_NODE;
			}

			if (i > 0 &&
					currNodeType === TEXT_NODE &&
					prevNodeType === TEXT_NODE) {
				// join text nodes
				output[i] = prevIndex;
			} else if (nodeType === currNodeType){
				prevIndex = prevIndex + 1;
				output[i] = prevIndex;
			}

			prevNodeType = currNodeType;

		}

		return output;
	}

	position(anchor) {
		var children, index;
		if (anchor.nodeType === ELEMENT_NODE$1) {
			children = anchor.parentNode.children;
			if (!children) {
				children = findChildren(anchor.parentNode);
			}
			index = Array.prototype.indexOf.call(children, anchor);
		} else {
			children = this.textNodes(anchor.parentNode);
			index = children.indexOf(anchor);
		}

		return index;
	}

	filteredPosition(anchor, ignoreClass) {
		var children, index, map;

		if (anchor.nodeType === ELEMENT_NODE$1) {
			children = anchor.parentNode.children;
			map = this.normalizedMap(children, ELEMENT_NODE$1, ignoreClass);
		} else {
			children = anchor.parentNode.childNodes;
			// Inside an ignored node
			if(anchor.parentNode.classList.contains(ignoreClass)) {
				anchor = anchor.parentNode;
				children = anchor.parentNode.childNodes;
			}
			map = this.normalizedMap(children, TEXT_NODE, ignoreClass);
		}


		index = Array.prototype.indexOf.call(children, anchor);

		return map[index];
	}

	stepsToXpath(steps) {
		var xpath = [".", "*"];

		steps.forEach(function(step){
			var position = step.index + 1;

			if(step.id){
				xpath.push("*[position()=" + position + " and @id='" + step.id + "']");
			} else if(step.type === "text") {
				xpath.push("text()[" + position + "]");
			} else {
				xpath.push("*[" + position + "]");
			}
		});

		return xpath.join("/");
	}


	/*

	To get the last step if needed:

	// Get the terminal step
	lastStep = steps[steps.length-1];
	// Get the query string
	query = this.stepsToQuery(steps);
	// Find the containing element
	startContainerParent = doc.querySelector(query);
	// Find the text node within that element
	if(startContainerParent && lastStep.type == "text") {
		container = startContainerParent.childNodes[lastStep.index];
	}
	*/
	stepsToQuerySelector(steps) {
		var query = ["html"];

		steps.forEach(function(step){
			var position = step.index + 1;

			if(step.id){
				query.push("#" + step.id);
			} else if(step.type === "text") ; else {
				query.push("*:nth-child(" + position + ")");
			}
		});

		return query.join(">");

	}

	textNodes(container, ignoreClass) {
		return Array.prototype.slice.call(container.childNodes).
			filter(function (node) {
				if (node.nodeType === TEXT_NODE) {
					return true;
				} else if (ignoreClass && node.classList.contains(ignoreClass)) {
					return true;
				}
				return false;
			});
	}

	walkToNode(steps, _doc, ignoreClass) {
		var doc = _doc || document;
		var container = doc.documentElement;
		var children;
		var step;
		var len = steps.length;
		var i;

		for (i = 0; i < len; i++) {
			step = steps[i];

			if(step.type === "element") {
				//better to get a container using id as some times step.index may not be correct
				//For ex.https://github.com/futurepress/epub.js/issues/561
				if(step.id) {
					container = doc.getElementById(step.id);
				}
				else {
					children = container.children || findChildren(container);
					container = children[step.index];
				}
			} else if(step.type === "text") {
				container = this.textNodes(container, ignoreClass)[step.index];
			}
			if(!container) {
				//Break the for loop as due to incorrect index we can get error if
				//container is undefined so that other functionailties works fine
				//like navigation
				break;
			}

		}

		return container;
	}

	findNode(steps, _doc, ignoreClass) {
		var doc = _doc || document;
		var container;
		var xpath;

		if(!ignoreClass && typeof doc.evaluate != "undefined") {
			xpath = this.stepsToXpath(steps);
			container = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		} else if(ignoreClass) {
			container = this.walkToNode(steps, doc, ignoreClass);
		} else {
			container = this.walkToNode(steps, doc);
		}

		return container;
	}

	fixMiss(steps, offset, _doc, ignoreClass) {
		var container = this.findNode(steps.slice(0,-1), _doc, ignoreClass);
		var children = container.childNodes;
		var map = this.normalizedMap(children, TEXT_NODE, ignoreClass);
		var child;
		var len;
		var lastStepIndex = steps[steps.length-1].index;

		for (let childIndex in map) {
			if (!map.hasOwnProperty(childIndex)) return;

			if(map[childIndex] === lastStepIndex) {
				child = children[childIndex];
				len = child.textContent.length;
				if(offset > len) {
					offset = offset - len;
				} else {
					if (child.nodeType === ELEMENT_NODE$1) {
						container = child.childNodes[0];
					} else {
						container = child;
					}
					break;
				}
			}
		}

		return {
			container: container,
			offset: offset
		};

	}

	/**
	 * Creates a DOM range representing a CFI
	 * @param {document} _doc document referenced in the base
	 * @param {string} [ignoreClass]
	 * @return {Range}
	 */
	toRange(_doc, ignoreClass) {
		var doc = _doc || document;
		var range;
		var start, end, startContainer, endContainer;
		var cfi = this;
		var startSteps, endSteps;
		var needsIgnoring = ignoreClass ? (doc.querySelector("." + ignoreClass) != null) : false;
		var missed;

		if (typeof(doc.createRange) !== "undefined") {
			range = doc.createRange();
		} else {
			range = new RangeObject();
		}

		if (cfi.range) {
			start = cfi.start;
			startSteps = cfi.path.steps.concat(start.steps);
			startContainer = this.findNode(startSteps, doc, needsIgnoring ? ignoreClass : null);
			end = cfi.end;
			endSteps = cfi.path.steps.concat(end.steps);
			endContainer = this.findNode(endSteps, doc, needsIgnoring ? ignoreClass : null);
		} else {
			start = cfi.path;
			startSteps = cfi.path.steps;
			startContainer = this.findNode(cfi.path.steps, doc, needsIgnoring ? ignoreClass : null);
		}

		if(startContainer) {
			try {

				if(start.terminal.offset != null) {
					range.setStart(startContainer, start.terminal.offset);
				} else {
					range.setStart(startContainer, 0);
				}

			} catch (e) {
				missed = this.fixMiss(startSteps, start.terminal.offset, doc, needsIgnoring ? ignoreClass : null);
				range.setStart(missed.container, missed.offset);
			}
		} else {
			console.log("No startContainer found for", this.toString());
			// No start found
			return null;
		}

		if (endContainer) {
			try {

				if(end.terminal.offset != null) {
					range.setEnd(endContainer, end.terminal.offset);
				} else {
					range.setEnd(endContainer, 0);
				}

			} catch (e) {
				missed = this.fixMiss(endSteps, cfi.end.terminal.offset, doc, needsIgnoring ? ignoreClass : null);
				range.setEnd(missed.container, missed.offset);
			}
		}


		// doc.defaultView.getSelection().addRange(range);
		return range;
	}

	/**
	 * Check if a string is wrapped with "epubcfi()"
	 * @param {string} str
	 * @returns {boolean}
	 */
	isCfiString(str) {
		if(typeof str === "string" &&
			str.indexOf("epubcfi(") === 0 &&
			str[str.length-1] === ")") {
			return true;
		}

		return false;
	}

	generateChapterComponent(_spineNodeIndex, _pos, id) {
		var pos = parseInt(_pos),
				spineNodeIndex = (_spineNodeIndex + 1) * 2,
				cfi = "/"+spineNodeIndex+"/";

		cfi += (pos + 1) * 2;

		if(id) {
			cfi += "[" + id + "]";
		}

		return cfi;
	}

	/**
	 * Collapse a CFI Range to a single CFI Position
	 * @param {boolean} [toStart=false]
	 */
	collapse(toStart) {
		if (!this.range) {
			return;
		}

		this.range = false;

		if (toStart) {
			this.path.steps = this.path.steps.concat(this.start.steps);
			this.path.terminal = this.start.terminal;
		} else {
			this.path.steps = this.path.steps.concat(this.end.steps);
			this.path.terminal = this.end.terminal;
		}

	}
}

/*
 From Zip.js, by Gildas Lormeau
edited down
 */

var table = {
	"application" : {
		"ecmascript" : [ "es", "ecma" ],
		"javascript" : "js",
		"ogg" : "ogx",
		"pdf" : "pdf",
		"postscript" : [ "ps", "ai", "eps", "epsi", "epsf", "eps2", "eps3" ],
		"rdf+xml" : "rdf",
		"smil" : [ "smi", "smil" ],
		"xhtml+xml" : [ "xhtml", "xht" ],
		"xml" : [ "xml", "xsl", "xsd", "opf", "ncx" ],
		"zip" : "zip",
		"x-httpd-eruby" : "rhtml",
		"x-latex" : "latex",
		"x-maker" : [ "frm", "maker", "frame", "fm", "fb", "book", "fbdoc" ],
		"x-object" : "o",
		"x-shockwave-flash" : [ "swf", "swfl" ],
		"x-silverlight" : "scr",
		"epub+zip" : "epub",
		"font-tdpfr" : "pfr",
		"inkml+xml" : [ "ink", "inkml" ],
		"json" : "json",
		"jsonml+json" : "jsonml",
		"mathml+xml" : "mathml",
		"metalink+xml" : "metalink",
		"mp4" : "mp4s",
		// "oebps-package+xml" : "opf",
		"omdoc+xml" : "omdoc",
		"oxps" : "oxps",
		"vnd.amazon.ebook" : "azw",
		"widget" : "wgt",
		// "x-dtbncx+xml" : "ncx",
		"x-dtbook+xml" : "dtb",
		"x-dtbresource+xml" : "res",
		"x-font-bdf" : "bdf",
		"x-font-ghostscript" : "gsf",
		"x-font-linux-psf" : "psf",
		"x-font-otf" : "otf",
		"x-font-pcf" : "pcf",
		"x-font-snf" : "snf",
		"x-font-ttf" : [ "ttf", "ttc" ],
		"x-font-type1" : [ "pfa", "pfb", "pfm", "afm" ],
		"x-font-woff" : "woff",
		"x-mobipocket-ebook" : [ "prc", "mobi" ],
		"x-mspublisher" : "pub",
		"x-nzb" : "nzb",
		"x-tgif" : "obj",
		"xaml+xml" : "xaml",
		"xml-dtd" : "dtd",
		"xproc+xml" : "xpl",
		"xslt+xml" : "xslt",
		"internet-property-stream" : "acx",
		"x-compress" : "z",
		"x-compressed" : "tgz",
		"x-gzip" : "gz",
	},
	"audio" : {
		"flac" : "flac",
		"midi" : [ "mid", "midi", "kar", "rmi" ],
		"mpeg" : [ "mpga", "mpega", "mp2", "mp3", "m4a", "mp2a", "m2a", "m3a" ],
		"mpegurl" : "m3u",
		"ogg" : [ "oga", "ogg", "spx" ],
		"x-aiff" : [ "aif", "aiff", "aifc" ],
		"x-ms-wma" : "wma",
		"x-wav" : "wav",
		"adpcm" : "adp",
		"mp4" : "mp4a",
		"webm" : "weba",
		"x-aac" : "aac",
		"x-caf" : "caf",
		"x-matroska" : "mka",
		"x-pn-realaudio-plugin" : "rmp",
		"xm" : "xm",
		"mid" : [ "mid", "rmi" ]
	},
	"image" : {
		"gif" : "gif",
		"ief" : "ief",
		"jpeg" : [ "jpeg", "jpg", "jpe" ],
		"pcx" : "pcx",
		"png" : "png",
		"svg+xml" : [ "svg", "svgz" ],
		"tiff" : [ "tiff", "tif" ],
		"x-icon" : "ico",
		"bmp" : "bmp",
		"webp" : "webp",
		"x-pict" : [ "pic", "pct" ],
		"x-tga" : "tga",
		"cis-cod" : "cod"
	},
	"text" : {
		"cache-manifest" : [ "manifest", "appcache" ],
		"css" : "css",
		"csv" : "csv",
		"html" : [ "html", "htm", "shtml", "stm" ],
		"mathml" : "mml",
		"plain" : [ "txt", "text", "brf", "conf", "def", "list", "log", "in", "bas" ],
		"richtext" : "rtx",
		"tab-separated-values" : "tsv",
		"x-bibtex" : "bib"
	},
	"video" : {
		"mpeg" : [ "mpeg", "mpg", "mpe", "m1v", "m2v", "mp2", "mpa", "mpv2" ],
		"mp4" : [ "mp4", "mp4v", "mpg4" ],
		"quicktime" : [ "qt", "mov" ],
		"ogg" : "ogv",
		"vnd.mpegurl" : [ "mxu", "m4u" ],
		"x-flv" : "flv",
		"x-la-asf" : [ "lsf", "lsx" ],
		"x-mng" : "mng",
		"x-ms-asf" : [ "asf", "asx", "asr" ],
		"x-ms-wm" : "wm",
		"x-ms-wmv" : "wmv",
		"x-ms-wmx" : "wmx",
		"x-ms-wvx" : "wvx",
		"x-msvideo" : "avi",
		"x-sgi-movie" : "movie",
		"x-matroska" : [ "mpv", "mkv", "mk3d", "mks" ],
		"3gpp2" : "3g2",
		"h261" : "h261",
		"h263" : "h263",
		"h264" : "h264",
		"jpeg" : "jpgv",
		"jpm" : [ "jpm", "jpgm" ],
		"mj2" : [ "mj2", "mjp2" ],
		"vnd.ms-playready.media.pyv" : "pyv",
		"vnd.uvvu.mp4" : [ "uvu", "uvvu" ],
		"vnd.vivo" : "viv",
		"webm" : "webm",
		"x-f4v" : "f4v",
		"x-m4v" : "m4v",
		"x-ms-vob" : "vob",
		"x-smv" : "smv"
	}
};

var mimeTypes = (function() {
	var type, subtype, val, index, mimeTypes = {};
	for (type in table) {
		if (table.hasOwnProperty(type)) {
			for (subtype in table[type]) {
				if (table[type].hasOwnProperty(subtype)) {
					val = table[type][subtype];
					if (typeof val == "string") {
						mimeTypes[val] = type + "/" + subtype;
					} else {
						for (index = 0; index < val.length; index++) {
							mimeTypes[val[index]] = type + "/" + subtype;
						}
					}
				}
			}
		}
	}
	return mimeTypes;
})();

var defaultValue = "text/plain";//"application/octet-stream";

function lookup(filename) {
	return filename && mimeTypes[filename.split(".").pop().toLowerCase()] || defaultValue;
}

/**
 * 
 */
class Resource {
	constructor(item = {}, loader) {
		if (item && !item.url) {
			throw new Error("Resource url is required.");
		}
		if (item.rel && !Array.isArray(item.rel)) {
			item.rel = [item.rel];
		}
		this.data = {
			url: item.url,
			index: item.index,
			id: item.id,
			canonical: item.canonical,
			type: item.type,
			encoding: item.encoding || lookup(item.url),
			properites: item.properites || [],
			rel: item.rel || [],
			name: item.name,
			cfiPos: item.cfiPos,
			cfiBase: item.cfiBase
		};
	}

	get url() {
		return this.data.url;
	}

	set url(url) {
		this.data.url = url;
	}

	get index() {
		return this.data.index;
	}

	set index(index) {
		this.data.index = index;
	}

	get id() {
		return this.data.id;
	}

	set id(id) {
		this.data.id = id;
	}

	get canonical() {
		return this.data.canonical;
	}

	set canonical(canonical) {
		this.data.canonical = canonical;
	}

	get type() {
		return this.data.type;
	}

	set type(type) {
		this.data.type = type;
	}

	get encoding() {
		return this.data.encoding;
	}

	set encoding(encoding) {
		this.data.id = encoding;
	}

	get properites() {
		return this.data.properites;
	}

	set properites(properites) {
		this.data.properites = properites;
	}

	get rel() {
		return this.data.rel;
	}

	set rel(rel) {
		this.data.rel = rel;
	}

	get name() {
		return this.data.name;
	}

	set name(name) {
		this.data.name = name;
	}

	get cfiPos() {
		return this.data.cfiPos;
	}

	set cfiPos(pos) {
		this.data.cfiPos = pos;
	}

	get cfiBase() {
		return this.data.cfiBase;
	}

	set cfiBase(base) {
		this.data.cfiBase = base;
	}

	/**
	 * Load the resource from its url
	 */
	async load() {
		return request(this.url, this.type)
	}


	toJSON() {
		return this.data;
	}

	destroy() {

	}
}

/**
 * 
 */
class Locator {
	constructor(item = {}) {
		this.data = {
			url: item.url,
			index: item.index,
			id: item.id,
			cfi: item.cfi,
			type: item.type,
			name: item.name,
			parent: undefined,
			children: new ResourceList()
		};
	}

	get url() {
		return this.data.url;
	}

	set url(url) {
		this.data.url = url;
	}

	get index() {
		return this.data.index;
	}

	set index(index) {
		this.data.index = index;
	}

	get id() {
		return this.data.id;
	}

	set id(id) {
		this.data.id = id;
	}

	get cfi() {
		return this.data.cfi;
	}

	set cfi(cfi) {
		this.data.cfi = cfi;
	}

	get type() {
		return this.data.type;
	}

	set type(type) {
		this.data.type = type;
	}

	get name() {
		return this.data.name;
	}

	set name(name) {
		return this.data.name;
	}

	get parent() {
		return this.data.parent;
	}

	set parent(item) {
		this.data.parent = item;
		return this.data.parent;
	}

	get children() {
		return this.data.children;
	}

	set children(items) {
		for (const childItem of items) {
			const child = new Locator(childItem);
			child.parent = this;
			this.children.append(child);
		}
		return this.data.children;
	}


	toJSON() {
		return this.data;
	}

	destroy() {

	}
}

/**
 * Open DisplayOptions Format Parser
 * @class
 * @param {document} displayOptionsDocument XML
 */
class DisplayOptions {
	constructor(displayOptionsDocument) {
		this.interactive = "";
		this.fixedLayout = "";
		this.openToSpread = "";
		this.orientationLock = "";

		if (displayOptionsDocument) {
			this.parse(displayOptionsDocument);
		}
	}

	/**
	 * Parse XML
	 * @param  {document} displayOptionsDocument XML
	 * @return {DisplayOptions} self
	 */
	parse(displayOptionsDocument) {
		if(!displayOptionsDocument) {
			return this;
		}

		const displayOptionsNode = qs(displayOptionsDocument, "display_options");
		if(!displayOptionsNode) {
			return this;
		} 

		const options = qsa(displayOptionsNode, "option");
		options.forEach((el) => {
			let value = "";

			if (el.childNodes.length) {
				value = el.childNodes[0].nodeValue;
			}

			switch (el.attributes.name.value) {
			    case "interactive":
			        this.interactive = value;
			        break;
			    case "fixed-layout":
			        this.fixedLayout = value;
			        break;
			    case "open-to-spread":
			        this.openToSpread = value;
			        break;
			    case "orientation-lock":
			        this.orientationLock = value;
			        break;
			}
		});

		return this;
	}

	destroy() {
		this.interactive = undefined;
		this.fixedLayout = undefined;
		this.openToSpread = undefined;
		this.orientationLock = undefined;
	}
}

/**
 * A representation of a Publication with methods for the loading and manipulation
 * of its contents.
 * @class
 * @param {json | object} [manifest]
 * @returns {Publication}
 * @example new Publication(manifest)
 */
class Publication {
	constructor(data, requestMethod, requestOptions) {
		/**
		 * @member {object} data
		 * @memberof Publication
		 * @private
		 */
		this.data = {
			url: "",
			metadata: new Map(),
			navigation: new ResourceList(),
			landmarks: new ResourceList(),
			locations: new ResourceList(),
			pagelist: new ResourceList(),
			sections: new ResourceList(),
			resources: new ResourceList(),
			links: new ResourceList(),
			uniqueResources: new ResourceList(),
			displayOptions: new DisplayOptions(),
		};

		if (requestMethod) {
			this.request = requestMethod;
		}

		if (requestOptions) {
			this.requestOptions = requestOptions;
		}

		this.ids = [];

		if (data) {
			this.opened = this.open(data);
		} else {
			this.opened = Promise.resolve();
		}
	}

	async open() {
		this.parse(data);
	}

	async unpack(data) {
		if (!data) {
			return;
		}

		if (typeof data === "string") {
			data = JSON.parse(data);
		}

		let {
			url,
			metadata,
			resources,
			toc,
			landmarks,
			locations,
			pagelist,
			sections,
			links
		} = data;

		this.url = url;
		this.metadata = metadata;
		this.resources = resources;
		this.sections = sections;
		this.toc = toc;
		this.landmarks = landmarks;
		this.locations = locations;
		this.pagelist = pagelist;
		this.links = links;
	}

	/**
	 * Load a resource from the Book
	 * @private
	 * @param  {string} path path to the resource to load
	 * @return {Promise} returns a promise with the requested resource
	 */
	load(path, type) {
		const resolved = resolve(this.url, path);

		return this.request ? this.request(resolved, type,  this.requestOptions) : request(resolved, type, this.requestOptions);
	}

	/**
	 * Resolve a path to it's absolute position in the Publication
	 * @private
	 * @param  {string} path
	 * @param  {boolean} [absolute] force resolving the full URL
	 * @return {string} the resolved path string
	 */
	resolve(path, absolute) {
		if (!path) {
			return;
		}
		let resolved = path;

		if (isAbsolute(path)) {
			return path;
		}

		if (this.url) {
			resolved = resolve(this.url, path);
		}
		return resolved;
	}

	/**
	 * Get or set the Url
	 * @param {string} [url]
	 * @return {string} href
	 */
	get url() {
		return this.data.url;
	}

	set url(url) {
		this.data.url = url;
		return this.data.url;
	}


	/**
	 * Get or set the readingOrder
	 * @param {array} [spineItems]
	 * @return {array} spineItems
	 */
	get sections() {
		return this.data.sections;
	}

	set sections(items) {
		if (!items) {
			return;
		}
		let index = 1;
		for (let item of items) {
			if (typeof item === "string") {
				item = {
					url: item
				};
			}
			item.url = resolve(this.url, item.url  || item.href);
			// TEMP hack for handling EpubCFI
			let id = encodeURIComponent(filename(item.url).split(".")[0]);
			let tempId = id;
			let repeats = 1;
			while (this.ids.includes(tempId)) {
				tempId = `${id}_${repeats++}`;
			}
			id = tempId;
			this.ids.push(id);
			item.id = id;
			// Index 2 for Sections
			item.cfiBase = item.cfiBase || `2/${index * 2}[${id}]`;
			item.canonical = item.canonical || item.cfiBase;

			const resource = new Resource(item);
			this.data.sections.append(resource);
			this.data.uniqueResources.add(resource);
			index += 1;
		}

		return this.data.sections;
	}

	/**
	 * Get or set the metadata
	 * @param {object} [metadata]
	 * @return {object} metadata
	 */
	get metadata() {
		return this.data.metadata;
	}

	set metadata(metadata) {
		if (!metadata) {
			return;
		}

		for (const [key, value] of Object.entries(metadata)) {
			this.data.metadata.set(key, value);
		}

		return this.data.metadata;
	}

	/**
	 * Get or set the resources
	 * @param {object} [resources]
	 * @return {object} resources
	 */
	get resources() {
		return this.data.resources;
	}

	set resources(items) {
		if (!items) {
			return;
		}
		let index = 1;
		for (let item of items) {
			if (typeof item === "string") {
				item = {
					url: item
				};
			}
			item.url = this.resolve(item.url || item.href);
			// TEMP hack for handling EpubCFI
			let id = encodeURIComponent(filename(item.url).split(".")[0]);
			let tempId = id;
			let repeats = 1;
			while (this.ids.includes(tempId)) {
				tempId = `${id}_${repeats++}`;
			}
			id = tempId;
			this.ids.push(id);
			item.id = id;
			// Index 4 for Resources
			item.cfiBase = item.cfiBase || `4/${index * 2}[${id}]`;
			item.canonical = item.canonical || item.cfiBase;

			const resource = new Resource(item);
			this.data.resources.add(resource);
			this.data.uniqueResources.add(resource);

			index += 1;
		}

		return this.data.resources;
	}

	/**
	 * Get or set the uniqueResources
	 * @param {object} [resources]
	 * @return {object} resources
	 */
	get uniqueResources() {
		return this.data.uniqueResources;
	}

	set uniqueResources(items) {
		if (!items) {
			return;
		}

		for (const item of items) {
			item.url = this.resolve(item.url  || item.href);
			item.canonical = item.canonical || item.url;

			const resource = new Resource(item);
			this.data.uniqueResources.add(resource);
		}

		return this.data.uniqueResources;
	}

	/**
	 * Get or set the toc
	 * @param {array} [toc]
	 * @return {array} toc
	 */
	get navigation() {
		return this.data.navigation;
	}

	set navigation(items) {
		if (!items) {
			return;
		}

		for (const item of items) {
			item.url = this.resolve(item.url || item.href);
			item.canonical = item.canonical || item.url;

			const loc = new Locator(item);
			this.data.navigation.append(loc);
		}

		return this.data.navigation;
	}

	/**
	 * Get or set the landmarks
	 * @param {array} [landmarks]
	 * @return {array} landmarks
	 */
	get landmarks() {
		return this.data.landmarks;
	}

	set landmarks(items) {
		if (!items) {
			return;
		}

		for (const item of items) {
			item.url = this.resolve(item.url || item.href);
			item.canonical = item.canonical || item.url;

			const loc = new Locator(item);
			this.data.landmarks.append(loc);
		}

		return this.data.landmarks;
	}

	/**
	 * Get or set the locations
	 * @param {array} [locations]
	 * @return {array} locations
	 */
	get locations() {
		return this.data.locations;
	}

	set locations(items) {
		if (!items) {
			return;
		}
		for (const item of items) {
			let loc;
			if (typeof item === "string") {
				loc = new Locator({ url: item, cfi: item});
			} else {
				const { url, cfi } = item;
				loc = new Locator({ url: url || cfi, cfi: cfi || url });
			}
			this.data.locations.append(loc);
		}
		return this.data.locations;
	}

	/**
	 * Get or set the pagelist
	 * @param {array} [pageList]
	 * @return {array} pageList
	 */
	get pagelist() {
		return this.data.pagelist;
	}

	set pagelist(items) {
		if (!items) {
			return;
		}

		for (const item of items) {
			item.url = this.resolve(item.url || item.href);
			item.canonical = item.canonical || item.url;

			const loc = new Locator(item);
			this.data.pagelist.append(loc);
		}

		return this.data.pagelist;
	}

	/**
	 * Get or set links
	 * @param {array} [links]
	 * @return {array} links
	 */
	get links() {
		return this.data.links;
	}

	set links(links) {
		return this.data.links = links;
	}

	get displayOptions() {
		return this.data.displayOptions;
	}

	set displayOptions(options) {
		this.data.displayOptions = new DisplayOptions(options);
		return this.data.displayOptions;
	}

	/**
	 * Get or set the cover url
	 * @param {string} [url]
	 * @return {string} coverUrl
	 */
	 get coverUrl() {
		let coverResource = this.data.resources.find((resource) => {
			return resource.rel.includes("cover");
		});
		return coverResource && coverResource.url;
	}

	set coverUrl(url) {
		let coverResource = this.data.resources.find((resource) => {
			return resource.includes("cover");
		});

		if (coverResource) {
			coverResource.url = url;
		} else {
			coverResource = new Resource({
				rel: ["cover"],
				url: url
			});
			this.data.resources.add(coverResource);
		}
		return coverResource && coverResource.url;
	}

	/**
	* Get or set the table of contents url
	* @param {string} [url]
	* @return {string} contents
	*/
	get contentsUrl() {
		let contentsUrl = this.data.resources.find((resource) => {
			return resource.rel.includes("contents");
		});
		return contentsUrl && contentsUrl.url;
	}

	set contentsUrl(url) {
		let contentsUrl = this.data.resources.find((resource) => {
			return resource.rel.includes("contents");
		});

		if (contentsUrl) {
			contentsUrl.url = url;
		} else {
			contentsUrl = {
				rel: ["contents"],
				url: url
			};
			this.data.resources.add(contentsUrl);
		}
		return contentsUrl && contentsUrl.url;
	}


	/**
	* Get or set the landmarksUrl url
	* @param {string} [url]
	* @return {string} landmarksUrl
	*/
	get landmarksUrl() {
		let landmarksUrl = this.data.resources.find((resource) => {
			return resource.rel.includes("landmarks");
		});
		return landmarksUrl && landmarksUrl.url;
	}

	set landmarksUrl(url) {
		let landmarksUrl = this.data.resources.find((resource) => {
			return resource.rel.includes("landmarks");
		});

		if (landmarksUrl) {
			landmarksUrl.url = url;
		} else {
			landmarksUrl = {
				rel: ["landmarks"],
				url: url
			};
			this.data.resources.add(landmarksUrl);
		}
		return landmarksUrl && landmarksUrl.url;
	}


	/**
	* Get or set the pagelist url
	* @param {string} [url]
	* @return {string} pagelistUrl
	*/
	get pagelistUrl() {
		let pagelistUrl = this.data.resources.find((resource) => {
			return resource.rel.includes("pagelist");
		});
		return pagelistUrl && pagelistUrl.url;
	}

	set pagelistUrl(url) {
		let pagelistUrl = this.data.resources.find((resource) => {
			return resource.rel.includes("pagelist");
		});

		if (pagelistUrl) {
			pagelistUrl.url = url;
		} else {
			pagelistUrl = {
				rel: ["pagelist"],
				url: url
			};
			this.data.resources.add(pagelistUrl);
		}
		return pagelistUrl && pagelistUrl.url;
	}

	/**
	* Get or set the locations url
	* @param {string} [url]
	* @return {string} pagelistUrl
	*/
	get locationsUrl() {
		let locationsUrl = this.data.resources.find((resource) => {
			return resource.rel.includes("locations");
		});
		return locationsUrl && locationsUrl.url;
	}

	set locationsUrl(url) {
		let locationsUrl = this.data.resources.find((resource) => {
			return resource.rel.includes("locations");
		});

		if (locationsUrl) {
			locationsUrl.url = url;
		} else {
			locationsUrl = {
				rel: ["locations"],
				url: url
			};
			this.data.resources.add(locationsUrl);
		}
		return locationsUrl && locationsUrl.url;
	}

	/**
	 * Find a DOM Range for a given CFI Range
	 * @param  {EpubCFI} cfiRange a epub cfi range
	 * @return {Range}
	 */
	getRange(cfiRange) {
		var cfi = new EpubCFI(cfiRange);
		var item = this.sections.get(cfi.spinePos);

		if (!item) {
			return new Promise((resolve, reject) => {
				reject("CFI could not be found");
			});
		}

		return item.load().then(function (contents) {
			var range = cfi.toRange(item.document);
			return range;
		});
	}

	/**
	 * Generates the Publication Key using the identifier in the data or other string provided
	 * @param  {string} [identifier] to use instead of metadata identifier
	 * @return {string} key
	 */
	key(identifier) {
		let ident = identifier || this.metadata.get("id") || this.metadata.get("identifier");
		return `epubjs-${EPUBJS_VERSION}-${ident}`;
	}

	/**
	 * Generates a object representation of the publication structure
	 * @return {object}
	 */
	toObject() {
		return this.data;
	}

	/**
	 * Generates a JSON output of the publication structure
	 */
	toJSON() {
		return this.data;
	 }

	/**
	 * Destroy the Publication and all associated objects
	 */
	destroy() {
		this.data = undefined;
	}

}

//-- Enable binding events to publication
EventEmitter(Publication.prototype);

/**
 * Hooks allow for injecting functions that must all complete in order before finishing
 * They will execute in parallel but all must finish before continuing
 * Functions may return a promise if they are async.
 * @param {any} context scope of this
 * @example this.content = new EPUBJS.Hook(this);
 */
class Hook {
	constructor(context){
		this.context = context || this;
		this.hooks = [];
	}

	/**
	 * Adds a function to be run before a hook completes
	 * @example this.content.register(function(){...});
	 * @return {undefined} void
	 */
	register(){
		for(var i = 0; i < arguments.length; ++i) {
			if (typeof arguments[i]  === "function") {
				this.hooks.push(arguments[i]);
			} else {
				// unpack array
				for(var j = 0; j < arguments[i].length; ++j) {
					this.hooks.push(arguments[i][j]);
				}
			}
		}
	}

	/**
	 * Triggers a hook to run all functions
	 * @example this.content.trigger(args).then(function(){...});
	 * @return {Promise} results
	 */
	trigger(){
		var args = arguments;
		var context = this.context;
		var promises = [];

		this.hooks.forEach(function(task) {
			var executing = task.apply(context, args);

			if(executing && typeof executing["then"] === "function") {
				// Task is a function that returns a promise
				promises.push(executing);
			}
			// Otherwise Task resolves immediately, add resolved promise with result
			promises.push(new Promise((resolve, reject) => {
				resolve(executing);
			}));
		});


		return Promise.all(promises);
	}
	
	/**
	 * Triggers a hook to run all functions synchronously
	 * @example this.content.trigger(args).then(function(){...});
	 * @return {Array} results
	*/
	triggerSync(){
		var args = arguments;
		var context = this.context;
		var results = [];
	
		this.hooks.forEach(function(task) {
			var executing = task.apply(context, args);
	
			results.push(executing);
		});
	
	
		return results;
	}

	// Adds a function to be run before a hook completes
	list(){
		return this.hooks;
	}

	clear(){
		return this.hooks = [];
	}
}

/**
 * Queue for handling tasks one at a time
 * @class
 * @param {scope} context what this will resolve to in the tasks
 */
class Queue {
	constructor(context){
		this._q = [];
		this.context = context;
		this.tick = requestAnimationFrame;
		this.running = false;
		this.paused = false;
	}

	/**
	 * Add an item to the queue
	 * @return {Promise}
	 */
	enqueue() {
		var deferred, promise;
		var queued;
		var task = [].shift.call(arguments);
		var args = arguments;

		// Handle single args without context
		// if(args && !Array.isArray(args)) {
		//   args = [args];
		// }
		if(!task) {
			throw new Error("No Task Provided");
		}

		if(typeof task === "function"){

			deferred = new defer();
			promise = deferred.promise;

			queued = {
				"task" : task,
				"args"     : args,
				//"context"  : context,
				"deferred" : deferred,
				"promise" : promise
			};

		} else {
			// Task is a promise
			queued = {
				"promise" : task
			};

		}

		this._q.push(queued);

		// Wait to start queue flush
		if (this.paused == false && !this.running) {
			// setTimeout(this.flush.bind(this), 0);
			// this.tick.call(window, this.run.bind(this));
			this.run();
		}

		return queued.promise;
	}

	/**
	 * Run one item
	 * @return {Promise}
	 */
	dequeue(){
		var inwait, task, result;

		if(this._q.length && !this.paused) {
			inwait = this._q.shift();
			task = inwait.task;
			if(task){
				// console.log(task)

				result = task.apply(this.context, inwait.args);

				if(result && typeof result["then"] === "function") {
					// Task is a function that returns a promise
					return result.then(function(){
						inwait.deferred.resolve.apply(this.context, arguments);
					}.bind(this), function() {
						inwait.deferred.reject.apply(this.context, arguments);
					}.bind(this));
				} else {
					// Task resolves immediately
					inwait.deferred.resolve.apply(this.context, result);
					return inwait.promise;
				}



			} else if(inwait.promise) {
				// Task is a promise
				return inwait.promise;
			}

		} else {
			inwait = new defer();
			inwait.deferred.resolve();
			return inwait.promise;
		}

	}

	// Run All Immediately
	dump(){
		while(this._q.length) {
			this.dequeue();
		}
	}

	/**
	 * Run all tasks sequentially, at convince
	 * @return {Promise}
	 */
	run(){

		if(!this.running){
			this.running = true;
			this.defered = new defer();
		}

		this.tick.call(window, () => {

			if(this._q.length) {

				this.dequeue()
					.then(function(){
						this.run();
					}.bind(this));

			} else {
				this.defered.resolve();
				this.running = undefined;
			}

		});

		// Unpause
		if(this.paused == true) {
			this.paused = false;
		}

		return this.defered.promise;
	}

	/**
	 * Flush all, as quickly as possible
	 * @return {Promise}
	 */
	flush(){

		if(this.running){
			return this.running;
		}

		if(this._q.length) {
			this.running = this.dequeue()
				.then(function(){
					this.running = undefined;
					return this.flush();
				}.bind(this));

			return this.running;
		}

	}

	/**
	 * Clear all items in wait
	 */
	clear(){
		this._q = [];
	}

	/**
	 * Get the number of tasks in the queue
	 * @return {number} tasks
	 */
	length(){
		return this._q.length;
	}

	/**
	 * Pause a running queue
	 */
	pause(){
		this.paused = true;
	}

	/**
	 * End the queue
	 */
	stop(){
		this._q = [];
		this.running = false;
		this.paused = true;
	}
}

/**
 * Figures out the CSS values to apply for a layout
 * @class
 * @param {object} settings
 * @param {string} [settings.layout='reflowable']
 * @param {string} [settings.spread]
 * @param {number} [settings.minSpreadWidth=800]
 * @param {boolean} [settings.evenSpreads=false]
 */
class Layout {
	constructor(settings) {
		this.settings = settings;
		this.name = settings.layout || "reflowable";
		this._spread = (settings.spread === "none") ? false : true;
		this._minSpreadWidth = settings.minSpreadWidth || 800;
		this._evenSpreads = settings.evenSpreads || false;

		if (settings.flow === "scrolled" ||
				settings.flow === "scrolled-continuous" ||
				settings.flow === "scrolled-doc") {
			this._flow = "scrolled";
		} else {
			this._flow = "paginated";
		}


		this.width = 0;
		this.height = 0;
		this.spreadWidth = 0;
		this.delta = 0;

		this.columnWidth = 0;
		this.gap = 0;
		this.divisor = 1;

		this.props = {
			name: this.name,
			spread: this._spread,
			flow: this._flow,
			width: 0,
			height: 0,
			spreadWidth: 0,
			delta: 0,
			columnWidth: 0,
			gap: 0,
			divisor: 1
		};

	}

	/**
	 * Switch the flow between paginated and scrolled
	 * @param  {string} flow paginated | scrolled
	 * @return {string} simplified flow
	 */
	flow(flow) {
		if (typeof(flow) != "undefined") {
			if (flow === "scrolled" ||
					flow === "scrolled-continuous" ||
					flow === "scrolled-doc") {
				this._flow = "scrolled";
			} else {
				this._flow = "paginated";
			}
			// this.props.flow = this._flow;
			this.update({flow: this._flow});
		}
		return this._flow;
	}

	/**
	 * Switch between using spreads or not, and set the
	 * width at which they switch to single.
	 * @param  {string} spread "none" | "always" | "auto"
	 * @param  {number} min integer in pixels
	 * @return {boolean} spread true | false
	 */
	spread(spread, min) {

		if (spread) {
			this._spread = (spread === "none") ? false : true;
			// this.props.spread = this._spread;
			this.update({spread: this._spread});
		}

		if (min >= 0) {
			this._minSpreadWidth = min;
		}

		return this._spread;
	}

	/**
	 * Calculate the dimensions of the pagination
	 * @param  {number} _width  width of the rendering
	 * @param  {number} _height height of the rendering
	 * @param  {number} _gap    width of the gap between columns
	 */
	calculate(_width, _height, _gap){

		var divisor = 1;
		var gap = _gap || 0;

		//-- Check the width and create even width columns
		// var fullWidth = Math.floor(_width);
		var width = _width;
		var height = _height;

		var section = Math.floor(width / 12);

		var columnWidth;
		var spreadWidth;
		var pageWidth;
		var delta;

		if (this._spread && width >= this._minSpreadWidth) {
			divisor = 2;
		} else {
			divisor = 1;
		}

		if (this.name === "reflowable" && this._flow === "paginated" && !(_gap >= 0)) {
			gap = ((section % 2 === 0) ? section : section - 1);
		}

		if (this.name === "pre-paginated" ) {
			gap = 0;
		}

		//-- Double Page
		if(divisor > 1) {
			// width = width - gap;
			// columnWidth = (width - gap) / divisor;
			// gap = gap / divisor;
			columnWidth = (width / divisor) - gap;
			pageWidth = columnWidth + gap;
		} else {
			columnWidth = width;
			pageWidth = width;
		}

		if (this.name === "pre-paginated" && divisor > 1) {
			width = columnWidth;
		}

		spreadWidth = (columnWidth * divisor) + gap;

		delta = width;

		this.width = width;
		this.height = height;
		this.spreadWidth = spreadWidth;
		this.pageWidth = pageWidth;
		this.delta = delta;

		this.columnWidth = columnWidth;
		this.gap = gap;
		this.divisor = divisor;

		// this.props.width = width;
		// this.props.height = _height;
		// this.props.spreadWidth = spreadWidth;
		// this.props.pageWidth = pageWidth;
		// this.props.delta = delta;
		//
		// this.props.columnWidth = colWidth;
		// this.props.gap = gap;
		// this.props.divisor = divisor;

		this.update({
			width,
			height,
			spreadWidth,
			pageWidth,
			delta,
			columnWidth,
			gap,
			divisor
		});

	}

	/**
	 * Apply Css to a Document
	 * @param  {Contents} contents
	 * @return {Promise}
	 */
	format(contents, section, axis){
		var formating;

		if (this.name === "pre-paginated") {
			formating = contents.fit(this.columnWidth, this.height, section);
		} else if (this._flow === "paginated") {
			formating = contents.columns(this.width, this.height, this.columnWidth, this.gap, this.settings.direction);
		} else if (axis && axis === "horizontal") {
			formating = contents.size(null, this.height);
		} else {
			formating = contents.size(this.width, null);				
		}

		return formating; // might be a promise in some View Managers
	}

	/**
	 * Count number of pages
	 * @param  {number} totalLength
	 * @param  {number} pageLength
	 * @return {{spreads: Number, pages: Number}}
	 */
	count(totalLength, pageLength) {

		let spreads, pages;

		if (this.name === "pre-paginated") {
			spreads = 1;
			pages = 1;
		} else if (this._flow === "paginated") {
			pageLength = pageLength || this.delta;
			spreads = Math.ceil( totalLength / pageLength);
			pages = spreads * this.divisor;
		} else { // scrolled
			pageLength = pageLength || this.height;
			spreads = Math.ceil( totalLength / pageLength);
			pages = spreads;
		}

		return {
			spreads,
			pages
		};

	}

	/**
	 * Update props that have changed
	 * @private
	 * @param  {object} props
	 */
	update(props) {
		// Remove props that haven't changed
		Object.keys(props).forEach((propName) => {
			if (this.props[propName] === props[propName]) {
				delete props[propName];
			}
		});

		if(Object.keys(props).length > 0) {
			let newProps = extend(this.props, props);
			this.emit(EVENTS.LAYOUT.UPDATED, newProps, props);
		}
	}
}

EventEmitter(Layout.prototype);

/**
 * Themes to apply to displayed content
 * @class
 * @param {Rendition} rendition
 */
class Themes {
	constructor(rendition) {
		this.rendition = rendition;
		this._themes = {
			"default" : {
				"rules" : {},
				"url" : "",
				"serialized" : ""
			}
		};
		this._overrides = {};
		this._current = "default";
		this._injected = [];
		this.rendition.hooks.content.register(this.inject.bind(this));
		this.rendition.hooks.content.register(this.overrides.bind(this));

	}

	/**
	 * Add themes to be used by a rendition
	 * @param {object | Array<object> | string}
	 * @example themes.register("light", "http://example.com/light.css")
	 * @example themes.register("light", { "body": { "color": "purple"}})
	 * @example themes.register({ "light" : {...}, "dark" : {...}})
	 */
	register () {
		if (arguments.length === 0) {
			return;
		}
		if (arguments.length === 1 && typeof(arguments[0]) === "object") {
			return this.registerThemes(arguments[0]);
		}
		if (arguments.length === 1 && typeof(arguments[0]) === "string") {
			return this.default(arguments[0]);
		}
		if (arguments.length === 2 && typeof(arguments[1]) === "string") {
			return this.registerUrl(arguments[0], arguments[1]);
		}
		if (arguments.length === 2 && typeof(arguments[1]) === "object") {
			return this.registerRules(arguments[0], arguments[1]);
		}
	}

	/**
	 * Add a default theme to be used by a rendition
	 * @param {object | string} theme
	 * @example themes.register("http://example.com/default.css")
	 * @example themes.register({ "body": { "color": "purple"}})
	 */
	default (theme) {
		if (!theme) {
			return;
		}
		if (typeof(theme) === "string") {
			return this.registerUrl("default", theme);
		}
		if (typeof(theme) === "object") {
			return this.registerRules("default", theme);
		}
	}

	/**
	 * Register themes object
	 * @param {object} themes
	 */
	registerThemes (themes) {
		for (var theme in themes) {
			if (themes.hasOwnProperty(theme)) {
				if (typeof(themes[theme]) === "string") {
					this.registerUrl(theme, themes[theme]);
				} else {
					this.registerRules(theme, themes[theme]);
				}
			}
		}
	}

	/**
	 * Register a theme by passing its css as string
	 * @param {string} name 
	 * @param {string} css 
	 */
	registerCss (name, css) {
		this._themes[name] = { "serialized" : css };
		if (this._injected[name] || name == 'default') {
			this.update(name);
		}
	}

	/**
	 * Register a url
	 * @param {string} name
	 * @param {string} input
	 */
	registerUrl (name, input) {
		var url = createUrl(input);
		this._themes[name] = { "url": url.toString() };
		if (this._injected[name] || name == 'default') {
			this.update(name);
		}
	}

	/**
	 * Register rule
	 * @param {string} name
	 * @param {object} rules
	 */
	registerRules (name, rules) {
		this._themes[name] = { "rules": rules };
		// TODO: serialize css rules
		if (this._injected[name] || name == 'default') {
			this.update(name);
		}
	}

	/**
	 * Select a theme
	 * @param {string} name
	 */
	select (name) {
		var prev = this._current;
		var contents;

		this._current = name;
		this.update(name);

		contents = this.rendition.getContents();
		contents.forEach( (content) => {
			content.removeClass(prev);
			content.addClass(name);
		});
	}

	/**
	 * Update a theme
	 * @param {string} name
	 */
	update (name) {
		var contents = this.rendition.getContents();
		contents.forEach( (content) => {
			this.add(name, content);
		});
	}

	/**
	 * Inject all themes into contents
	 * @param {Contents} contents
	 */
	inject (contents) {
		var links = [];
		var themes = this._themes;
		var theme;

		for (var name in themes) {
			if (themes.hasOwnProperty(name) && (name === this._current || name === "default")) {
				theme = themes[name];
				if((theme.rules && Object.keys(theme.rules).length > 0) || (theme.url && links.indexOf(theme.url) === -1)) {
					this.add(name, contents);
				}
				this._injected.push(name);
			}
		}

		if(this._current != "default") {
			contents.addClass(this._current);
		}
	}

	/**
	 * Add Theme to contents
	 * @param {string} name
	 * @param {Contents} contents
	 */
	add (name, contents) {
		var theme = this._themes[name];

		if (!theme || !contents) {
			return;
		}

		if (theme.url) {
			contents.addStylesheet(theme.url);
		} else if (theme.serialized) {
			contents.addStylesheetCss(theme.serialized, name);
			theme.injected = true;
		} else if (theme.rules) {
			contents.addStylesheetRules(theme.rules, name);
			theme.injected = true;
		}
	}

	/**
	 * Add override
	 * @param {string} name
	 * @param {string} value
	 * @param {boolean} priority
	 */
	override (name, value, priority) {
		var contents = this.rendition.getContents();

		this._overrides[name] = {
			value: value,
			priority: priority === true
		};

		contents.forEach( (content) => {
			content.css(name, this._overrides[name].value, this._overrides[name].priority);
		});
	}

	removeOverride (name) {
		var contents = this.rendition.getContents();

		delete this._overrides[name];

		contents.forEach( (content) => {
			content.css(name);
		});
	}

	/**
	 * Add all overrides
	 * @param {Content} content
	 */
	overrides (contents) {
		var overrides = this._overrides;

		for (var rule in overrides) {
			if (overrides.hasOwnProperty(rule)) {
				contents.css(rule, overrides[rule].value, overrides[rule].priority);
			}
		}
	}

	/**
	 * Adjust the font size of a rendition
	 * @param {number} size
	 */
	fontSize (size) {
		this.override("font-size", size);
	}

	/**
	 * Adjust the font-family of a rendition
	 * @param {string} f
	 */
	font (f) {
		this.override("font-family", f, true);
	}

	destroy() {
		this.rendition = undefined;
		this._themes = undefined;
		this._overrides = undefined;
		this._current = undefined;
		this._injected = undefined;
	}

}

/**
 * Map text locations to CFI ranges
 * @class
 * @param {Layout} layout Layout to apply
 * @param {string} [direction="ltr"] Text direction
 * @param {string} [axis="horizontal"] vertical or horizontal axis
 * @param {boolean} [dev] toggle developer highlighting
 */
class Mapping {
	constructor(layout, direction, axis, dev=false) {
		this.layout = layout;
		this.horizontal = (axis === "horizontal") ? true : false;
		this.direction = direction || "ltr";
		this._dev = dev;
	}

	/**
	 * Find CFI pairs for entire section at once
	 */
	section(view) {
		var ranges = this.findRanges(view);
		var map = this.rangeListToCfiList(view.section.cfiBase, ranges);

		return map;
	}

	/**
	 * Find CFI pairs for a page
	 * @param {Contents} contents Contents from view
	 * @param {string} cfiBase string of the base for a cfi
	 * @param {number} start position to start at
	 * @param {number} end position to end at
	 */
	page(contents, cfiBase, start, end) {
		var root = contents && contents.document ? contents.document.body : false;
		var result;

		if (!root) {
			return;
		}

		result = this.rangePairToCfiPair(cfiBase, {
			start: this.findStart(root, start, end),
			end: this.findEnd(root, start, end)
		});

		if (this._dev === true) {
			let doc = contents.document;
			let startRange = new EpubCFI(result.start).toRange(doc);
			let endRange = new EpubCFI(result.end).toRange(doc);

			let selection = doc.defaultView.getSelection();
			let r = doc.createRange();
			selection.removeAllRanges();
			r.setStart(startRange.startContainer, startRange.startOffset);
			r.setEnd(endRange.endContainer, endRange.endOffset);
			selection.addRange(r);
		}

		return result;
	}

	/**
	 * Walk a node, preforming a function on each node it finds
	 * @private
	 * @param {Node} root Node to walkToNode
	 * @param {function} func walk function
	 * @return {*} returns the result of the walk function
	 */
	walk(root, func) {
		// IE11 has strange issue, if root is text node IE throws exception on
		// calling treeWalker.nextNode(), saying
		// Unexpected call to method or property access instead of returning null value
		if(root && root.nodeType === Node.TEXT_NODE) {
			return;
		}
		// safeFilter is required so that it can work in IE as filter is a function for IE
		// and for other browser filter is an object.
		var filter = {
			acceptNode: function(node) {
				if (node.data.trim().length > 0) {
					return NodeFilter.FILTER_ACCEPT;
				} else {
					return NodeFilter.FILTER_REJECT;
				}
			}
		};
		var safeFilter = filter.acceptNode;
		safeFilter.acceptNode = filter.acceptNode;

		var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, safeFilter, false);
		var node;
		var result;
		while ((node = treeWalker.nextNode())) {
			result = func(node);
			if(result) break;
		}

		return result;
	}

	findRanges(view){
		var columns = [];
		var scrollWidth = view.contents.scrollWidth();
		var spreads = Math.ceil( scrollWidth / this.layout.spreadWidth);
		var count = spreads * this.layout.divisor;
		var columnWidth = this.layout.columnWidth;
		var gap = this.layout.gap;
		var start, end;

		for (var i = 0; i < count.pages; i++) {
			start = (columnWidth + gap) * i;
			end = (columnWidth * (i+1)) + (gap * i);
			columns.push({
				start: this.findStart(view.document.body, start, end),
				end: this.findEnd(view.document.body, start, end)
			});
		}

		return columns;
	}

	/**
	 * Find Start Range
	 * @private
	 * @param {Node} root root node
	 * @param {number} start position to start at
	 * @param {number} end position to end at
	 * @return {Range}
	 */
	findStart(root, start, end){
		var stack = [root];
		var $el;
		var found;
		var $prev = root;

		while (stack.length) {

			$el = stack.shift();

			found = this.walk($el, (node) => {
				var left, right, top, bottom;
				var elPos;


				elPos = nodeBounds(node);

				if (this.horizontal && this.direction === "ltr") {

					left = this.horizontal ? elPos.left : elPos.top;
					right = this.horizontal ? elPos.right : elPos.bottom;

					if( left >= start && left <= end ) {
						return node;
					} else if (right > start) {
						return node;
					} else {
						$prev = node;
						stack.push(node);
					}

				} else if (this.horizontal && this.direction === "rtl") {

					left = elPos.left;
					right = elPos.right;

					if( right <= end && right >= start ) {
						return node;
					} else if (left < end) {
						return node;
					} else {
						$prev = node;
						stack.push(node);
					}

				} else {

					top = elPos.top;
					bottom = elPos.bottom;

					if( top >= start && top <= end ) {
						return node;
					} else if (bottom > start) {
						return node;
					} else {
						$prev = node;
						stack.push(node);
					}

				}


			});

			if(found) {
				return this.findTextStartRange(found, start, end);
			}

		}

		// Return last element
		return this.findTextStartRange($prev, start, end);
	}

	/**
	 * Find End Range
	 * @private
	 * @param {Node} root root node
	 * @param {number} start position to start at
	 * @param {number} end position to end at
	 * @return {Range}
	 */
	findEnd(root, start, end){
		var stack = [root];
		var $el;
		var $prev = root;
		var found;

		while (stack.length) {

			$el = stack.shift();

			found = this.walk($el, (node) => {

				var left, right, top, bottom;
				var elPos;

				elPos = nodeBounds(node);

				if (this.horizontal && this.direction === "ltr") {

					left = Math.round(elPos.left);
					right = Math.round(elPos.right);

					if(left > end && $prev) {
						return $prev;
					} else if(right > end) {
						return node;
					} else {
						$prev = node;
						stack.push(node);
					}

				} else if (this.horizontal && this.direction === "rtl") {

					left = Math.round(this.horizontal ? elPos.left : elPos.top);
					right = Math.round(this.horizontal ? elPos.right : elPos.bottom);

					if(right < start && $prev) {
						return $prev;
					} else if(left < start) {
						return node;
					} else {
						$prev = node;
						stack.push(node);
					}

				} else {

					top = Math.round(elPos.top);
					bottom = Math.round(elPos.bottom);

					if(top > end && $prev) {
						return $prev;
					} else if(bottom > end) {
						return node;
					} else {
						$prev = node;
						stack.push(node);
					}

				}

			});


			if(found){
				return this.findTextEndRange(found, start, end);
			}

		}

		// end of chapter
		return this.findTextEndRange($prev, start, end);
	}

	/**
	 * Find Text Start Range
	 * @private
	 * @param {Node} root root node
	 * @param {number} start position to start at
	 * @param {number} end position to end at
	 * @return {Range}
	 */
	findTextStartRange(node, start, end){
		var ranges = this.splitTextNodeIntoRanges(node);
		var range;
		var pos;
		var left, top, right;

		for (var i = 0; i < ranges.length; i++) {
			range = ranges[i];

			pos = range.getBoundingClientRect();

			if (this.horizontal && this.direction === "ltr") {

				left = pos.left;
				if( left >= start ) {
					return range;
				}

			} else if (this.horizontal && this.direction === "rtl") {

				right = pos.right;
				if( right <= end ) {
					return range;
				}

			} else {

				top = pos.top;
				if( top >= start ) {
					return range;
				}

			}

			// prev = range;

		}

		return ranges[0];
	}

	/**
	 * Find Text End Range
	 * @private
	 * @param {Node} root root node
	 * @param {number} start position to start at
	 * @param {number} end position to end at
	 * @return {Range}
	 */
	findTextEndRange(node, start, end){
		var ranges = this.splitTextNodeIntoRanges(node);
		var prev;
		var range;
		var pos;
		var left, right, top, bottom;

		for (var i = 0; i < ranges.length; i++) {
			range = ranges[i];

			pos = range.getBoundingClientRect();

			if (this.horizontal && this.direction === "ltr") {

				left = pos.left;
				right = pos.right;

				if(left > end && prev) {
					return prev;
				} else if(right > end) {
					return range;
				}

			} else if (this.horizontal && this.direction === "rtl") {

				left = pos.left;
				right = pos.right;

				if(right < start && prev) {
					return prev;
				} else if(left < start) {
					return range;
				}

			} else {

				top = pos.top;
				bottom = pos.bottom;

				if(top > end && prev) {
					return prev;
				} else if(bottom > end) {
					return range;
				}

			}


			prev = range;

		}

		// Ends before limit
		return ranges[ranges.length-1];

	}

	/**
	 * Split up a text node into ranges for each word
	 * @private
	 * @param {Node} root root node
	 * @param {string} [_splitter] what to split on
	 * @return {Range[]}
	 */
	splitTextNodeIntoRanges(node, _splitter){
		var ranges = [];
		var textContent = node.textContent || "";
		var text = textContent.trim();
		var range;
		var doc = node.ownerDocument;
		var splitter = _splitter || " ";

		var pos = text.indexOf(splitter);

		if(pos === -1 || node.nodeType != Node.TEXT_NODE) {
			range = doc.createRange();
			range.selectNodeContents(node);
			return [range];
		}

		range = doc.createRange();
		range.setStart(node, 0);
		range.setEnd(node, pos);
		ranges.push(range);
		range = false;

		while ( pos != -1 ) {

			pos = text.indexOf(splitter, pos + 1);
			if(pos > 0) {

				if(range) {
					range.setEnd(node, pos);
					ranges.push(range);
				}

				range = doc.createRange();
				range.setStart(node, pos+1);
			}
		}

		if(range) {
			range.setEnd(node, text.length);
			ranges.push(range);
		}

		return ranges;
	}


	/**
	 * Turn a pair of ranges into a pair of CFIs
	 * @private
	 * @param {string} cfiBase base string for an EpubCFI
	 * @param {object} rangePair { start: Range, end: Range }
	 * @return {object} { start: "epubcfi(...)", end: "epubcfi(...)" }
	 */
	rangePairToCfiPair(cfiBase, rangePair){

		var startRange = rangePair.start;
		var endRange = rangePair.end;

		startRange.collapse(true);
		endRange.collapse(false);

		let startCfi = new EpubCFI(startRange, cfiBase).toString();
		let endCfi = new EpubCFI(endRange, cfiBase).toString();

		return {
			start: startCfi,
			end: endCfi
		};

	}

	rangeListToCfiList(cfiBase, columns){
		var map = [];
		var cifPair;

		for (var i = 0; i < columns.length; i++) {
			cifPair = this.rangePairToCfiPair(cfiBase, columns[i]);

			map.push(cifPair);

		}

		return map;
	}

	/**
	 * Set the axis for mapping
	 * @param {string} axis horizontal | vertical
	 * @return {boolean} is it horizontal?
	 */
	axis(axis) {
		if (axis) {
			this.horizontal = (axis === "horizontal") ? true : false;
		}
		return this.horizontal;
	}
}

function replaceBase(doc, section){
	var base;
	var head;
	var url = section.href;
	var absolute = (url.indexOf("://") > -1);

	if(!doc){
		return;
	}

	head = qs(doc, "head");
	base = qs(head, "base");

	if(!base) {
		base = doc.createElement("base");
		head.insertBefore(base, head.firstChild);
	}

	// Fix for Safari crashing if the url doesn't have an origin
	if (!absolute && (typeof(window) !== "undefined" && window.location)) {
		let parts = window.location.href.split("/");
		let directory = "";

		parts.pop();
		directory = parts.join("/");

		url = directory + url;
	}

	base.setAttribute("href", url);
}

// TODO: move me to Contents
function replaceLinks(contents, fn) {

	let links = contents.querySelectorAll("a[href]");

	if (!links.length) {
		return;
	}

	let base = qs(contents.ownerDocument, "base");
	let location = base ? base.getAttribute("href") : contents.ownerDocument.defaultView.location.href;
	let replaceLink = function(link){
		var href = link.getAttribute("href");

		if(href.indexOf("mailto:") === 0){
			return;
		}

		(href.indexOf("://") > -1);

		if(isAbsolute(href)){

			link.setAttribute("target", "_blank");

		}else {
			link.onclick = function(){
				let linkUrl = createUrl(href, location);
				fn(linkUrl.toString());

				return false;
			};
		}
	}.bind(this);

	for (var i = 0; i < links.length; i++) {
		replaceLink(links[i]);
	}


}

const hasNavigator = typeof (navigator) !== "undefined";

const isChrome = hasNavigator && /Chrome/.test(navigator.userAgent);
const isWebkit = hasNavigator && !isChrome && /AppleWebKit/.test(navigator.userAgent);

const ELEMENT_NODE = 1;

/**
	* Handles DOM manipulation, queries and events for View contents
	* @class
	* @param {document} doc Document
	* @param {element} content Parent Element (typically Body)
	* @param {string} cfiBase Section component of CFIs
	* @param {number} sectionIndex Index in Spine of Conntent's Section
	*/
class Contents {
	constructor(doc, content, cfiBase, sectionIndex) {
		// Blank Cfi for Parsing
		this.epubcfi = new EpubCFI();

		this.document = doc;
		this.documentElement =  this.document.documentElement;
		this.content = content || this.document.body;
		this.window = this.document.defaultView;

		this._size = {
			width: 0,
			height: 0
		};

		this.sectionIndex = sectionIndex || 0;
		this.cfiBase = cfiBase || "";

		this.epubReadingSystem("epub.js", EPUBJS_VERSION);
		this.called = 0;
		this.active = true;
		this.listeners();
	}

	/**
		* Get DOM events that are listened for and passed along
		*/
	static get listenedEvents() {
		return DOM_EVENTS;
	}

	/**
		* Get or Set width
		* @param {number} [w]
		* @returns {number} width
		*/
	width(w) {
		// var frame = this.documentElement;
		var frame = this.content;

		if (w && isNumber(w)) {
			w = w + "px";
		}

		if (w) {
			frame.style.width = w;
			// this.content.style.width = w;
		}

		return parseInt(this.window.getComputedStyle(frame)["width"]);


	}

	/**
		* Get or Set height
		* @param {number} [h]
		* @returns {number} height
		*/
	height(h) {
		// var frame = this.documentElement;
		var frame = this.content;

		if (h && isNumber(h)) {
			h = h + "px";
		}

		if (h) {
			frame.style.height = h;
			// this.content.style.height = h;
		}

		return parseInt(this.window.getComputedStyle(frame)["height"]);

	}

	/**
		* Get or Set width of the contents
		* @param {number} [w]
		* @returns {number} width
		*/
	contentWidth(w) {

		var content = this.content || this.document.body;

		if (w && isNumber(w)) {
			w = w + "px";
		}

		if (w) {
			content.style.width = w;
		}

		return parseInt(this.window.getComputedStyle(content)["width"]);


	}

	/**
		* Get or Set height of the contents
		* @param {number} [h]
		* @returns {number} height
		*/
	contentHeight(h) {

		var content = this.content || this.document.body;

		if (h && isNumber(h)) {
			h = h + "px";
		}

		if (h) {
			content.style.height = h;
		}

		return parseInt(this.window.getComputedStyle(content)["height"]);

	}

	/**
		* Get the width of the text using Range
		* @returns {number} width
		*/
	textWidth() {
		let rect;
		let width;
		let range = this.document.createRange();
		let content = this.content || this.document.body;
		let border = borders(content);

		// Select the contents of frame
		range.selectNodeContents(content);

		// get the width of the text content
		rect = range.getBoundingClientRect();
		width = rect.width;

		if (border && border.width) {
			width += border.width;
		}

		return Math.round(width);
	}

	/**
		* Get the height of the text using Range
		* @returns {number} height
		*/
	textHeight() {
		let rect;
		let height;
		let range = this.document.createRange();
		let content = this.content || this.document.body;

		range.selectNodeContents(content);

		rect = range.getBoundingClientRect();
		height = rect.bottom;

		return Math.round(height);
	}

	/**
		* Get documentElement scrollWidth
		* @returns {number} width
		*/
	scrollWidth() {
		var width = this.documentElement.scrollWidth;

		return width;
	}

	/**
		* Get documentElement scrollHeight
		* @returns {number} height
		*/
	scrollHeight() {
		var height = this.documentElement.scrollHeight;

		return height;
	}

	/**
		* Set overflow css style of the contents
		* @param {string} [overflow]
		*/
	overflow(overflow) {

		if (overflow) {
			this.documentElement.style.overflow = overflow;
		}

		return this.window.getComputedStyle(this.documentElement)["overflow"];
	}

	/**
		* Set overflowX css style of the documentElement
		* @param {string} [overflow]
		*/
	overflowX(overflow) {

		if (overflow) {
			this.documentElement.style.overflowX = overflow;
		}

		return this.window.getComputedStyle(this.documentElement)["overflowX"];
	}

	/**
		* Set overflowY css style of the documentElement
		* @param {string} [overflow]
		*/
	overflowY(overflow) {

		if (overflow) {
			this.documentElement.style.overflowY = overflow;
		}

		return this.window.getComputedStyle(this.documentElement)["overflowY"];
	}

	/**
		* Set Css styles on the contents element (typically Body)
		* @param {string} property
		* @param {string} value
		* @param {boolean} [priority] set as "important"
		*/
	css(property, value, priority) {
		var content = this.content || this.document.body;

		if (value) {
			content.style.setProperty(property, value, priority ? "important" : "");
		} else {
			content.style.removeProperty(property);
		}

		return this.window.getComputedStyle(content)[property];
	}

	/**
		* Get or Set the viewport element
		* @param {object} [options]
		* @param {string} [options.width]
		* @param {string} [options.height]
		* @param {string} [options.scale]
		* @param {string} [options.minimum]
		* @param {string} [options.maximum]
		* @param {string} [options.scalable]
		*/
	viewport(options) {
		// var width, height, scale, minimum, maximum, scalable;
		var $viewport = this.document.querySelector("meta[name='viewport']");
		var parsed = {
			"width": undefined,
			"height": undefined,
			"scale": undefined,
			"minimum": undefined,
			"maximum": undefined,
			"scalable": undefined
		};
		var newContent = [];
		var settings = {};

		/*
		* check for the viewport size
		* <meta name="viewport" content="width=1024,height=697" />
		*/
		if($viewport && $viewport.hasAttribute("content")) {
			let content = $viewport.getAttribute("content");
			let _width = content.match(/width\s*=\s*([^,]*)/);
			let _height = content.match(/height\s*=\s*([^,]*)/);
			let _scale = content.match(/initial-scale\s*=\s*([^,]*)/);
			let _minimum = content.match(/minimum-scale\s*=\s*([^,]*)/);
			let _maximum = content.match(/maximum-scale\s*=\s*([^,]*)/);
			let _scalable = content.match(/user-scalable\s*=\s*([^,]*)/);

			if(_width && _width.length && typeof _width[1] !== "undefined"){
				parsed.width = _width[1];
			}
			if(_height && _height.length && typeof _height[1] !== "undefined"){
				parsed.height = _height[1];
			}
			if(_scale && _scale.length && typeof _scale[1] !== "undefined"){
				parsed.scale = _scale[1];
			}
			if(_minimum && _minimum.length && typeof _minimum[1] !== "undefined"){
				parsed.minimum = _minimum[1];
			}
			if(_maximum && _maximum.length && typeof _maximum[1] !== "undefined"){
				parsed.maximum = _maximum[1];
			}
			if(_scalable && _scalable.length && typeof _scalable[1] !== "undefined"){
				parsed.scalable = _scalable[1];
			}
		}

		settings = defaults(options || {}, parsed);

		if (options) {
			if (settings.width) {
				newContent.push("width=" + settings.width);
			}

			if (settings.height) {
				newContent.push("height=" + settings.height);
			}

			if (settings.scale) {
				newContent.push("initial-scale=" + settings.scale);
			}

			if (settings.scalable === "no") {
				newContent.push("minimum-scale=" + settings.scale);
				newContent.push("maximum-scale=" + settings.scale);
				newContent.push("user-scalable=" + settings.scalable);
			} else {

				if (settings.scalable) {
					newContent.push("user-scalable=" + settings.scalable);
				}

				if (settings.minimum) {
					newContent.push("minimum-scale=" + settings.minimum);
				}

				if (settings.maximum) {
					newContent.push("minimum-scale=" + settings.maximum);
				}
			}

			if (!$viewport) {
				$viewport = this.document.createElement("meta");
				$viewport.setAttribute("name", "viewport");
				this.document.querySelector("head").appendChild($viewport);
			}

			$viewport.setAttribute("content", newContent.join(", "));

			this.window.scrollTo(0, 0);
		}


		return settings;
	}

	/**
	 * Event emitter for when the contents has expanded
	 * @private
	 */
	expand() {
		this.emit(EVENTS.CONTENTS.EXPAND);
	}

	/**
	 * Add DOM listeners
	 * @private
	 */
	listeners() {
		this.imageLoadListeners();

		this.mediaQueryListeners();

		// this.fontLoadListeners();

		this.addEventListeners();

		this.addSelectionListeners();

		// this.transitionListeners();

		if (typeof ResizeObserver === "undefined") {
			this.resizeListeners();
			this.visibilityListeners();
		} else {
			this.resizeObservers();
		}

		// this.mutationObservers();

		this.linksHandler();
	}

	/**
	 * Remove DOM listeners
	 * @private
	 */
	removeListeners() {

		this.removeEventListeners();

		this.removeSelectionListeners();

		if (this.observer) {
			this.observer.disconnect();
		}

		clearTimeout(this.expanding);
	}

	/**
	 * Check if size of contents has changed and
	 * emit 'resize' event if it has.
	 * @private
	 */
	resizeCheck() {
		let width = this.textWidth();
		let height = this.textHeight();

		if (width != this._size.width || height != this._size.height) {

			this._size = {
				width: width,
				height: height
			};

			this.onResize && this.onResize(this._size);
			this.emit(EVENTS.CONTENTS.RESIZE, this._size);
		}
	}

	/**
	 * Poll for resize detection
	 * @private
	 */
	resizeListeners() {
		// Test size again
		clearTimeout(this.expanding);
		requestAnimationFrame(this.resizeCheck.bind(this));
		this.expanding = setTimeout(this.resizeListeners.bind(this), 350);
	}

	/**
	 * Listen for visibility of tab to change
	 * @private
	 */
	visibilityListeners() {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible" && this.active === false) {
				this.active = true;
				this.resizeListeners();
			} else {
				this.active = false;
				clearTimeout(this.expanding);
			}
		});
	}

	/**
	 * Use css transitions to detect resize
	 * @private
	 */
	transitionListeners() {
		let body = this.content;

		body.style['transitionProperty'] = "font, font-size, font-size-adjust, font-stretch, font-variation-settings, font-weight, width, height";
		body.style['transitionDuration'] = "0.001ms";
		body.style['transitionTimingFunction'] = "linear";
		body.style['transitionDelay'] = "0";

		this._resizeCheck = this.resizeCheck.bind(this);
		this.document.addEventListener('transitionend', this._resizeCheck);
	}

	/**
	 * Listen for media query changes and emit 'expand' event
	 * Adapted from: https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
	 * @private
	 */
	mediaQueryListeners() {
		var sheets = this.document.styleSheets;
		var mediaChangeHandler = function(m){
			if(m.matches && !this._expanding) {
				setTimeout(this.expand.bind(this), 1);
			}
		}.bind(this);

		for (var i = 0; i < sheets.length; i += 1) {
			var rules;
			// Firefox errors if we access cssRules cross-domain
			try {
				rules = sheets[i].cssRules;
			} catch (e) {
				return;
			}
			if(!rules) return; // Stylesheets changed
			for (var j = 0; j < rules.length; j += 1) {
				//if (rules[j].constructor === CSSMediaRule) {
				if(rules[j].media){
					var mql = this.window.matchMedia(rules[j].media.mediaText);
					mql.addListener(mediaChangeHandler);
					//mql.onchange = mediaChangeHandler;
				}
			}
		}
	}

	/**
	 * Use ResizeObserver to listen for changes in the DOM and check for resize
	 * @private
	 */
	resizeObservers() {
		// create an observer instance
		this.observer = new ResizeObserver((e) => {
			requestAnimationFrame(this.resizeCheck.bind(this));
		});

		// pass in the target node
		this.observer.observe(this.document.documentElement);
	}

	/**
	 * Use MutationObserver to listen for changes in the DOM and check for resize
	 * @private
	 */
	mutationObservers() {
		// create an observer instance
		this.observer = new MutationObserver((mutations) => {
			this.resizeCheck();
		});

		// configuration of the observer:
		let config = { attributes: true, childList: true, characterData: true, subtree: true };

		// pass in the target node, as well as the observer options
		this.observer.observe(this.document, config);
	}

	/**
	 * Test if images are loaded or add listener for when they load
	 * @private
	 */
	imageLoadListeners() {
		var images = this.document.querySelectorAll("img");
		var img;
		for (var i = 0; i < images.length; i++) {
			img = images[i];

			if (typeof img.naturalWidth !== "undefined" &&
					img.naturalWidth === 0) {
				img.onload = this.expand.bind(this);
			}
		}
	}

	/**
	 * Listen for font load and check for resize when loaded
	 * @private
	 */
	fontLoadListeners() {
		if (!this.document || !this.document.fonts) {
			return;
		}

		this.document.fonts.ready.then(function () {
			this.resizeCheck();
		}.bind(this));

	}

	/**
	 * Get the documentElement
	 * @returns {element} documentElement
	 */
	root() {
		if(!this.document) return null;
		return this.document.documentElement;
	}

	/**
	 * Get the location offset of a EpubCFI or an #id
	 * @param {string | EpubCFI} target
	 * @param {string} [ignoreClass] for the cfi
	 * @returns { {left: Number, top: Number }
	 */
	locationOf(target, ignoreClass) {
		var position;
		var targetPos = {"left": 0, "top": 0};

		if(!this.document) return targetPos;

		if(this.epubcfi.isCfiString(target)) {
			let range = new EpubCFI(target).toRange(this.document, ignoreClass);

			if(range) {
				try {
					if (!range.endContainer ||
						(range.startContainer == range.endContainer
						&& range.startOffset == range.endOffset)) {
						// If the end for the range is not set, it results in collapsed becoming
						// true. This in turn leads to inconsistent behaviour when calling
						// getBoundingRect. Wrong bounds lead to the wrong page being displayed.
						// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15684911/
						let pos = range.startContainer.textContent.indexOf(" ", range.startOffset);
						if (pos == -1) {
							pos = range.startContainer.textContent.length;
						}
						range.setEnd(range.startContainer, pos);
					}
				} catch (e) {
					console.error("setting end offset to start container length failed", e);
				}

				if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
					position = range.startContainer.getBoundingClientRect();
					targetPos.left = position.left;
					targetPos.top = position.top;
				} else {
					// Webkit does not handle collapsed range bounds correctly
					// https://bugs.webkit.org/show_bug.cgi?id=138949

					// Construct a new non-collapsed range
					if (isWebkit) {
						let container = range.startContainer;
						let newRange = new Range();
						try {
							if (container.nodeType === ELEMENT_NODE) {
								position = container.getBoundingClientRect();
							} else if (range.startOffset + 2 < container.length) {
								newRange.setStart(container, range.startOffset);
								newRange.setEnd(container, range.startOffset + 2);
								position = newRange.getBoundingClientRect();
							} else if (range.startOffset - 2 > 0) {
								newRange.setStart(container, range.startOffset - 2);
								newRange.setEnd(container, range.startOffset);
								position = newRange.getBoundingClientRect();
							} else { // empty, return the parent element
								position = container.parentNode.getBoundingClientRect();
							}
						} catch (e) {
							console.error(e, e.stack);
						}
					} else {
						position = range.getBoundingClientRect();
					}
				}
			}

		} else if(typeof target === "string" &&
			target.indexOf("#") > -1) {

			let id = target.substring(target.indexOf("#")+1);
			let el = this.document.getElementById(id);
			if(el) {
				if (isWebkit) {
					// Webkit reports incorrect bounding rects in Columns
					let newRange = new Range();
					newRange.selectNode(el);
					position = newRange.getBoundingClientRect();
				} else {
					position = el.getBoundingClientRect();
				}
			}
		}

		if (position) {
			targetPos.left = position.left;
			targetPos.top = position.top;
		}

		return targetPos;
	}

	/**
	 * Append a stylesheet link to the document head
	 * @param {string} src url
	 */
	addStylesheet(src) {
		return new Promise(function(resolve, reject){
			var $stylesheet;
			var ready = false;

			if(!this.document) {
				resolve(false);
				return;
			}

			// Check if link already exists
			$stylesheet = this.document.querySelector("link[href='"+src+"']");
			if ($stylesheet) {
				resolve(true);
				return; // already present
			}

			$stylesheet = this.document.createElement("link");
			$stylesheet.type = "text/css";
			$stylesheet.rel = "stylesheet";
			$stylesheet.href = src;
			$stylesheet.onload = $stylesheet.onreadystatechange = function() {
				if ( !ready && (!this.readyState || this.readyState == "complete") ) {
					ready = true;
					// Let apply
					setTimeout(() => {
						resolve(true);
					}, 1);
				}
			};

			this.document.head.appendChild($stylesheet);

		}.bind(this));
	}

	_getStylesheetNode(key) {
		var styleEl;
		key = "epubjs-inserted-css-" + (key || '');

		if(!this.document) return false;

		// Check if link already exists
		styleEl = this.document.getElementById(key);
		if (!styleEl) {
			styleEl = this.document.createElement("style");
			styleEl.id = key;
			// Append style element to head
			this.document.head.appendChild(styleEl);
		}
		return styleEl;
	}

	/**
	 * Append stylesheet css
	 * @param {string} serializedCss
	 * @param {string} key If the key is the same, the CSS will be replaced instead of inserted
	 */
	addStylesheetCss(serializedCss, key) {
		if(!this.document || !serializedCss) return false;

		var styleEl;
		styleEl = this._getStylesheetNode(key);
		styleEl.innerHTML = serializedCss;

		return true;
	}

	/**
	 * Append stylesheet rules to a generate stylesheet
	 * Array: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
	 * Object: https://github.com/desirable-objects/json-to-css
	 * @param {array | object} rules
	 * @param {string} key If the key is the same, the CSS will be replaced instead of inserted
	 */
	addStylesheetRules(rules, key) {
		var styleSheet;

		if(!this.document || !rules || rules.length === 0) return;

		// Grab style sheet
		styleSheet = this._getStylesheetNode(key).sheet;

		if (Object.prototype.toString.call(rules) === "[object Array]") {
			for (var i = 0, rl = rules.length; i < rl; i++) {
				var j = 1, rule = rules[i], selector = rules[i][0], propStr = "";
				// If the second argument of a rule is an array of arrays, correct our variables.
				if (Object.prototype.toString.call(rule[1][0]) === "[object Array]") {
					rule = rule[1];
					j = 0;
				}

				for (var pl = rule.length; j < pl; j++) {
					var prop = rule[j];
					propStr += prop[0] + ":" + prop[1] + (prop[2] ? " !important" : "") + ";\n";
				}

				// Insert CSS Rule
				styleSheet.insertRule(selector + "{" + propStr + "}", styleSheet.cssRules.length);
			}
		} else {
			const selectors = Object.keys(rules);
			selectors.forEach((selector) => {
				const definition = rules[selector];
				if (Array.isArray(definition)) {
					definition.forEach((item) => {
						const _rules = Object.keys(item);
						const result = _rules.map((rule) => {
							return `${rule}:${item[rule]}`;
						}).join(';');
						styleSheet.insertRule(`${selector}{${result}}`, styleSheet.cssRules.length);
					});
				} else {
					const _rules = Object.keys(definition);
					const result = _rules.map((rule) => {
						return `${rule}:${definition[rule]}`;
					}).join(';');
					styleSheet.insertRule(`${selector}{${result}}`, styleSheet.cssRules.length);
				}
			});
		}
	}

	/**
	 * Append a script tag to the document head
	 * @param {string} src url
	 * @returns {Promise} loaded
	 */
	addScript(src) {

		return new Promise(function(resolve, reject){
			var $script;
			var ready = false;

			if(!this.document) {
				resolve(false);
				return;
			}

			$script = this.document.createElement("script");
			$script.type = "text/javascript";
			$script.async = true;
			$script.src = src;
			$script.onload = $script.onreadystatechange = function() {
				if ( !ready && (!this.readyState || this.readyState == "complete") ) {
					ready = true;
					setTimeout(function(){
						resolve(true);
					}, 1);
				}
			};

			this.document.head.appendChild($script);

		}.bind(this));
	}

	/**
	 * Add a class to the contents container
	 * @param {string} className
	 */
	addClass(className) {
		var content;

		if(!this.document) return;

		content = this.content || this.document.body;

		if (content) {
			content.classList.add(className);
		}

	}

	/**
	 * Remove a class from the contents container
	 * @param {string} removeClass
	 */
	removeClass(className) {
		var content;

		if(!this.document) return;

		content = this.content || this.document.body;

		if (content) {
			content.classList.remove(className);
		}

	}

	/**
	 * Add DOM event listeners
	 * @private
	 */
	addEventListeners(){
		if(!this.document) {
			return;
		}

		this._triggerEvent = this.triggerEvent.bind(this);

		DOM_EVENTS.forEach(function(eventName){
			this.document.addEventListener(eventName, this._triggerEvent, { passive: true });
		}, this);

	}

	/**
	 * Remove DOM event listeners
	 * @private
	 */
	removeEventListeners(){
		if(!this.document) {
			return;
		}
		DOM_EVENTS.forEach(function(eventName){
			this.document.removeEventListener(eventName, this._triggerEvent, { passive: true });
		}, this);
		this._triggerEvent = undefined;
	}

	/**
	 * Emit passed browser events
	 * @private
	 */
	triggerEvent(e){
		this.emit(e.type, e);
	}

	/**
	 * Add listener for text selection
	 * @private
	 */
	addSelectionListeners(){
		if(!this.document) {
			return;
		}
		this._onSelectionChange = this.onSelectionChange.bind(this);
		this.document.addEventListener("selectionchange", this._onSelectionChange, { passive: true });
	}

	/**
	 * Remove listener for text selection
	 * @private
	 */
	removeSelectionListeners(){
		if(!this.document) {
			return;
		}
		this.document.removeEventListener("selectionchange", this._onSelectionChange, { passive: true });
		this._onSelectionChange = undefined;
	}

	/**
	 * Handle getting text on selection
	 * @private
	 */
	onSelectionChange(e){
		if (this.selectionEndTimeout) {
			clearTimeout(this.selectionEndTimeout);
		}
		this.selectionEndTimeout = setTimeout(function() {
			var selection = this.window.getSelection();
			this.triggerSelectedEvent(selection);
		}.bind(this), 250);
	}

	/**
	 * Emit event on text selection
	 * @private
	 */
	triggerSelectedEvent(selection){
		var range, cfirange;

		if (selection && selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
			if(!range.collapsed) {
				// cfirange = this.section.cfiFromRange(range);
				cfirange = new EpubCFI(range, this.cfiBase).toString();
				this.emit(EVENTS.CONTENTS.SELECTED, cfirange);
				this.emit(EVENTS.CONTENTS.SELECTED_RANGE, range);
			}
		}
	}

	/**
	 * Get a Dom Range from EpubCFI
	 * @param {EpubCFI} _cfi
	 * @param {string} [ignoreClass]
	 * @returns {Range} range
	 */
	range(_cfi, ignoreClass){
		var cfi = new EpubCFI(_cfi);
		return cfi.toRange(this.document, ignoreClass);
	}

	/**
	 * Get an EpubCFI from a Dom Range
	 * @param {Range} range
	 * @param {string} [ignoreClass]
	 * @returns {EpubCFI} cfi
	 */
	cfiFromRange(range, ignoreClass){
		return new EpubCFI(range, this.cfiBase, ignoreClass).toString();
	}

	/**
	 * Get an EpubCFI from a Dom node
	 * @param {node} node
	 * @param {string} [ignoreClass]
	 * @returns {EpubCFI} cfi
	 */
	cfiFromNode(node, ignoreClass){
		return new EpubCFI(node, this.cfiBase, ignoreClass).toString();
	}

	// TODO: find where this is used - remove?
	map(layout){
		var map = new Mapping(layout);
		return map.section();
	}

	/**
	 * Size the contents to a given width and height
	 * @param {number} [width]
	 * @param {number} [height]
	 */
	size(width, height){
		var viewport = { scale: 1.0, scalable: "no" };

		this.layoutStyle("scrolling");

		if (width >= 0) {
			this.width(width);
			viewport.width = width;
			this.css("padding", "0 "+(width/12)+"px");
		}

		if (height >= 0) {
			this.height(height);
			viewport.height = height;
		}

		this.css("margin", "0");
		this.css("box-sizing", "border-box");


		this.viewport(viewport);
	}

	/**
	 * Apply columns to the contents for pagination
	 * @param {number} width
	 * @param {number} height
	 * @param {number} columnWidth
	 * @param {number} gap
	 */
	columns(width, height, columnWidth, gap, dir){
		let COLUMN_AXIS = prefixed("column-axis");
		let COLUMN_GAP = prefixed("column-gap");
		let COLUMN_WIDTH = prefixed("column-width");
		let COLUMN_FILL = prefixed("column-fill");

		let writingMode = this.writingMode();
		let axis = (writingMode.indexOf("vertical") === 0) ? "vertical" : "horizontal";

		this.layoutStyle("paginated");

		if (dir === "rtl" && axis === "horizontal") {
			this.direction(dir);
		}

		this.width(width);
		this.height(height);

		// Deal with Mobile trying to scale to viewport
		this.viewport({ width: width, height: height, scale: 1.0, scalable: "no" });

		// TODO: inline-block needs more testing
		// Fixes Safari column cut offs, but causes RTL issues
		// this.css("display", "inline-block");

		this.css("overflow-y", "hidden");
		this.css("margin", "0", true);

		if (axis === "vertical") {
			this.css("padding-top", (gap / 2) + "px", true);
			this.css("padding-bottom", (gap / 2) + "px", true);
			this.css("padding-left", "20px");
			this.css("padding-right", "20px");
			this.css(COLUMN_AXIS, "vertical");
		} else {
			this.css("padding-top", "20px");
			this.css("padding-bottom", "20px");
			this.css("padding-left", (gap / 2) + "px", true);
			this.css("padding-right", (gap / 2) + "px", true);
			this.css(COLUMN_AXIS, "horizontal");
		}

		this.css("box-sizing", "border-box");
		this.css("max-width", "inherit");

		this.css(COLUMN_FILL, "auto");

		this.css(COLUMN_GAP, gap+"px");
		this.css(COLUMN_WIDTH, columnWidth+"px");

		// Fix glyph clipping in WebKit
		// https://github.com/futurepress/epub.js/issues/983
		this.css("-webkit-line-box-contain", "block glyphs replaced");
	}

	/**
	 * Scale contents from center
	 * @param {number} scale
	 * @param {number} offsetX
	 * @param {number} offsetY
	 */
	scaler(scale, offsetX, offsetY){
		var scaleStr = "scale(" + scale + ")";
		var translateStr = "";
		// this.css("position", "absolute"));
		this.css("transform-origin", "top left");

		if (offsetX >= 0 || offsetY >= 0) {
			translateStr = " translate(" + (offsetX || 0 )+ "px, " + (offsetY || 0 )+ "px )";
		}

		this.css("transform", scaleStr + translateStr);
	}

	/**
	 * Fit contents into a fixed width and height
	 * @param {number} width
	 * @param {number} height
	 */
	fit(width, height, section){
		var viewport = this.viewport();
		var viewportWidth = parseInt(viewport.width);
		var viewportHeight = parseInt(viewport.height);
		var widthScale = width / viewportWidth;
		var heightScale = height / viewportHeight;
		var scale = widthScale < heightScale ? widthScale : heightScale;

		// the translate does not work as intended, elements can end up unaligned
		// var offsetY = (height - (viewportHeight * scale)) / 2;
		// var offsetX = 0;
		// if (this.sectionIndex % 2 === 1) {
		// 	offsetX = width - (viewportWidth * scale);
		// }

		this.layoutStyle("paginated");

		// scale needs width and height to be set
		this.width(viewportWidth);
		this.height(viewportHeight);
		this.overflow("hidden");

		// Scale to the correct size
		this.scaler(scale, 0, 0);
		// this.scaler(scale, offsetX > 0 ? offsetX : 0, offsetY);

		// background images are not scaled by transform
		this.css("background-size", viewportWidth * scale + "px " + viewportHeight * scale + "px");

		this.css("background-color", "transparent");
		if (section && section.properties.includes("page-spread-left")) {
			// set margin since scale is weird
			var marginLeft = width - (viewportWidth * scale);
			this.css("margin-left", marginLeft + "px");
		}
	}

	/**
	 * Set the direction of the text
	 * @param {string} [dir="ltr"] "rtl" | "ltr"
	 */
	direction(dir) {
		if (this.documentElement) {
			this.documentElement.style["direction"] = dir;
		}
	}

	mapPage(cfiBase, layout, start, end, dev) {
		var mapping = new Mapping(layout, dev);

		return mapping.page(this, cfiBase, start, end);
	}

	/**
	 * Emit event when link in content is clicked
	 * @private
	 */
	linksHandler() {
		replaceLinks(this.content, (href) => {
			this.emit(EVENTS.CONTENTS.LINK_CLICKED, href);
		});
	}

	/**
	 * Set the writingMode of the text
	 * @param {string} [mode="horizontal-tb"] "horizontal-tb" | "vertical-rl" | "vertical-lr"
	 */
	writingMode(mode) {
		let WRITING_MODE = prefixed("writing-mode");

		if (mode && this.documentElement) {
			this.documentElement.style[WRITING_MODE] = mode;
		}

		return this.window.getComputedStyle(this.documentElement)[WRITING_MODE] || '';
	}

	/**
	 * Set the layoutStyle of the content
	 * @param {string} [style="paginated"] "scrolling" | "paginated"
	 * @private
	 */
	layoutStyle(style) {

		if (style) {
			this._layoutStyle = style;
			navigator.epubReadingSystem.layoutStyle = this._layoutStyle;
		}

		return this._layoutStyle || "paginated";
	}

	/**
	 * Add the epubReadingSystem object to the navigator
	 * @param {string} name
	 * @param {string} version
	 * @private
	 */
	epubReadingSystem(name, version) {
		navigator.epubReadingSystem = {
			name: name,
			version: version,
			layoutStyle: this.layoutStyle(),
			hasFeature: function (feature) {
				switch (feature) {
					case "dom-manipulation":
						return true;
					case "layout-changes":
						return true;
					case "touch-events":
						return true;
					case "mouse-events":
						return true;
					case "keyboard-events":
						return true;
					case "spine-scripting":
						return false;
					default:
						return false;
				}
			}
		};
		return navigator.epubReadingSystem;
	}

	destroy() {
		// this.document.removeEventListener('transitionend', this._resizeCheck);

		this.removeListeners();

	}
}

EventEmitter(Contents.prototype);

/**
	* Handles managing adding & removing Annotations
	* @param {Rendition} rendition
	* @class
	*/
class Annotations {

	constructor (rendition) {
		this.rendition = rendition;
		this.highlights = [];
		this.underlines = [];
		this.marks = [];
		this._annotations = {};
		this._annotationsBySectionIndex = {};

		this.rendition.hooks.render.register(this.inject.bind(this));
		this.rendition.hooks.unloaded.register(this.clear.bind(this));
	}

	/**
	 * Add an annotation to store
	 * @param {string} type Type of annotation to add: "highlight", "underline", "mark"
	 * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
	 * @param {object} data Data to assign to annotation
	 * @param {function} [cb] Callback after annotation is added
	 * @param {string} className CSS class to assign to annotation
	 * @param {object} styles CSS styles to assign to annotation
	 * @returns {Annotation} annotation
	 */
	add (type, cfiRange, data, cb, className, styles) {
		let hash = encodeURI(cfiRange + type);
		let cfi = new EpubCFI(cfiRange);
		let sectionIndex = cfi.spinePos;
		let annotation = new Annotation({
			type,
			cfiRange,
			data,
			sectionIndex,
			cb,
			className,
			styles
		});

		this._annotations[hash] = annotation;

		if (sectionIndex in this._annotationsBySectionIndex) {
			this._annotationsBySectionIndex[sectionIndex].push(hash);
		} else {
			this._annotationsBySectionIndex[sectionIndex] = [hash];
		}

		let views = this.rendition.views();

		views.forEach( (view) => {
			if (annotation.sectionIndex === view.index) {
				annotation.attach(view);
			}
		});

		return annotation;
	}

	/**
	 * Remove an annotation from store
	 * @param {EpubCFI} cfiRange EpubCFI range the annotation is attached to
	 * @param {string} type Type of annotation to add: "highlight", "underline", "mark"
	 */
	remove (cfiRange, type) {
		let hash = encodeURI(cfiRange + type);

		if (hash in this._annotations) {
			let annotation = this._annotations[hash];

			if (type && annotation.type !== type) {
				return;
			}

			let views = this.rendition.views();
			views.forEach( (view) => {
				this._removeFromAnnotationBySectionIndex(annotation.sectionIndex, hash);
				if (annotation.sectionIndex === view.index) {
					annotation.detach(view);
				}
			});

			delete this._annotations[hash];
		}
	}

	/**
	 * Remove an annotations by Section Index
	 * @private
	 */
	_removeFromAnnotationBySectionIndex (sectionIndex, hash) {
		this._annotationsBySectionIndex[sectionIndex] = this._annotationsAt(sectionIndex).filter(h => h !== hash);
	}

	/**
	 * Get annotations by Section Index
	 * @private
	 */
	_annotationsAt (index) {
		return this._annotationsBySectionIndex[index];
	}


	/**
	 * Add a highlight to the store
	 * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
	 * @param {object} data Data to assign to annotation
	 * @param {function} cb Callback after annotation is clicked
	 * @param {string} className CSS class to assign to annotation
	 * @param {object} styles CSS styles to assign to annotation
	 */
	highlight (cfiRange, data, cb, className, styles) {
		return this.add("highlight", cfiRange, data, cb, className, styles);
	}

	/**
	 * Add a underline to the store
	 * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
	 * @param {object} data Data to assign to annotation
	 * @param {function} cb Callback after annotation is clicked
	 * @param {string} className CSS class to assign to annotation
	 * @param {object} styles CSS styles to assign to annotation
	 */
	underline (cfiRange, data, cb, className, styles) {
		return this.add("underline", cfiRange, data, cb, className, styles);
	}

	/**
	 * Add a mark to the store
	 * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
	 * @param {object} data Data to assign to annotation
	 * @param {function} cb Callback after annotation is clicked
	 */
	mark (cfiRange, data, cb) {
		return this.add("mark", cfiRange, data, cb);
	}

	/**
	 * iterate over annotations in the store
	 */
	each () {
		return this._annotations.forEach.apply(this._annotations, arguments);
	}

	/**
	 * Hook for injecting annotation into a view
	 * @param {View} view
	 * @private
	 */
	inject (view) {
		let sectionIndex = view.index;
		if (sectionIndex in this._annotationsBySectionIndex) {
			let annotations = this._annotationsBySectionIndex[sectionIndex];
			annotations.forEach((hash) => {
				let annotation = this._annotations[hash];
				annotation.attach(view);
			});
		}
	}

	/**
	 * Hook for removing annotation from a view
	 * @param {View} view
	 * @private
	 */
	clear (view) {
		let sectionIndex = view.index;
		if (sectionIndex in this._annotationsBySectionIndex) {
			let annotations = this._annotationsBySectionIndex[sectionIndex];
			annotations.forEach((hash) => {
				let annotation = this._annotations[hash];
				annotation.detach(view);
			});
		}
	}

	/**
	 * [Not Implemented] Show annotations
	 * @TODO: needs implementation in View
	 */
	show () {

	}

	/**
	 * [Not Implemented] Hide annotations
	 * @TODO: needs implementation in View
	 */
	hide () {

	}

}

/**
 * Annotation object
 * @class
 * @param {object} options
 * @param {string} options.type Type of annotation to add: "highlight", "underline", "mark"
 * @param {EpubCFI} options.cfiRange EpubCFI range to attach annotation to
 * @param {object} options.data Data to assign to annotation
 * @param {int} options.sectionIndex Index in the Spine of the Section annotation belongs to
 * @param {function} [options.cb] Callback after annotation is clicked
 * @param {string} className CSS class to assign to annotation
 * @param {object} styles CSS styles to assign to annotation
 * @returns {Annotation} annotation
 */
class Annotation {

	constructor ({
		type,
		cfiRange,
		data,
		sectionIndex,
		cb,
		className,
		styles
	}) {
		this.type = type;
		this.cfiRange = cfiRange;
		this.data = data;
		this.sectionIndex = sectionIndex;
		this.mark = undefined;
		this.cb = cb;
		this.className = className;
		this.styles = styles;
	}

	/**
	 * Update stored data
	 * @param {object} data
	 */
	update (data) {
		this.data = data;
	}

	/**
	 * Add to a view
	 * @param {View} view
	 */
	attach (view) {
		let {cfiRange, data, type, mark, cb, className, styles} = this;
		let result;

		if (type === "highlight") {
			result = view.highlight(cfiRange, data, cb, className, styles);
		} else if (type === "underline") {
			result = view.underline(cfiRange, data, cb, className, styles);
		} else if (type === "mark") {
			result = view.mark(cfiRange, data, cb);
		}

		this.mark = result;
		this.emit(EVENTS.ANNOTATION.ATTACH, result);
		return result;
	}

	/**
	 * Remove from a view
	 * @param {View} view
	 */
	detach (view) {
		let {cfiRange, type} = this;
		let result;

		if (view) {
			if (type === "highlight") {
				result = view.unhighlight(cfiRange);
			} else if (type === "underline") {
				result = view.ununderline(cfiRange);
			} else if (type === "mark") {
				result = view.unmark(cfiRange);
			}
		}

		this.mark = undefined;
		this.emit(EVENTS.ANNOTATION.DETACH, result);
		return result;
	}

	/**
	 * [Not Implemented] Get text of an annotation
	 * @TODO: needs implementation in contents
	 */
	text () {

	}

}

EventEmitter(Annotation.prototype);

// import xmldom from "xmldom";

/**
 * Represents a Section of the Book
 *
 * In most books this is equivelent to a Chapter
 * @param {object} item  The spine item representing the section
 * @param {object} hooks hooks for serialize and content
 * @param {object} settings
 * @param {object} settings.replacements
 */
class Section {
	constructor(item, hooks, settings){
		this.item = item;
		this.idref = item.idref;
		this.linear = item.linear === "yes";
		this.properties = item.properties;
		this.index = item.index;
		this.url = item.url;
		this.source = item.source;
		this.canonical = item.canonical;
		this.type = item.type;
		this.next = item.next;
		this.prev = item.prev;

		this.cfiBase = item.cfiBase;

		if (hooks) {
			this.hooks = hooks;
		} else {
			this.hooks = {};
			this.hooks.serialize = new Hook(this);
			this.hooks.content = new Hook(this);
		}

		this.document = undefined;
		this.contents = undefined;
		this.output = undefined;

		this.originalHref = undefined;

		this.settings = settings || {};
	}

	/**
	 * Load the section from its url
	 * @param  {method} [_request] a request method to use for loading
	 * @return {document} a promise with the xml document
	 */
	load(_request){
		var request$1 = _request || this.request || request;
		var loading = new defer();
		var loaded = loading.promise;

		if(this.contents) {
			loading.resolve(this.contents);
		} else {
			let type = this.type === "application/xhtml+xml" ? "xhtml" : "html";
			request$1(this.url, type)
				.then(function(xml){
					this.document = xml;
					this.contents = xml.documentElement;

					return this.hooks.content.trigger(this.document, this);
				}.bind(this))
				.then(function(){
					loading.resolve(this.contents);
				}.bind(this))
				.catch(function(error){
					loading.reject(error);
				});
		}

		return loaded;
	}

	/**
	 * Adds a base tag for resolving urls in the section
	 * @private
	 */
	base(){
		return replaceBase(this.document, this);
	}

	/**
	 * Render the contents of a section
	 * @param  {method} [_request] a request method to use for loading
	 * @return {string} output a serialized XML Document
	 */
	render(_request){
		var rendering = new defer();
		var rendered = rendering.promise;
		this.output; // TODO: better way to return this from hooks?

		this.load(_request).
			then(function(contents){
				var userAgent = (typeof navigator !== "undefined" && navigator.userAgent) || "";
				var isIE = userAgent.indexOf("Trident") >= 0;
				var Serializer;
				if (typeof XMLSerializer === "undefined" || isIE) ; else {
					Serializer = XMLSerializer;
				}
				var serializer = new Serializer();
				this.output = serializer.serializeToString(contents);
				return this.output;
			}.bind(this)).
			then(function(){
				return this.hooks.serialize.trigger(this.output, this);
			}.bind(this)).
			then(function(){
				rendering.resolve(this.output);
			}.bind(this))
			.catch(function(error){
				rendering.reject(error);
			});

		return rendered;
	}

	/**
	 * Find a string in a section
	 * @param  {string} _query The query string to find
	 * @return {object[]} A list of matches, with form {cfi, excerpt}
	 */
	find(_query){
		var section = this;
		var matches = [];
		var query = _query.toLowerCase();
		var find = function(node){
			var text = node.textContent.toLowerCase();
			var range = section.document.createRange();
			var cfi;
			var pos;
			var last = -1;
			var excerpt;
			var limit = 150;

			while (pos != -1) {
				// Search for the query
				pos = text.indexOf(query, last + 1);

				if (pos != -1) {
					// We found it! Generate a CFI
					range = section.document.createRange();
					range.setStart(node, pos);
					range.setEnd(node, pos + query.length);

					cfi = section.cfiFromRange(range);

					// Generate the excerpt
					if (node.textContent.length < limit) {
						excerpt = node.textContent;
					}
					else {
						excerpt = node.textContent.substring(pos - limit/2, pos + limit/2);
						excerpt = "..." + excerpt + "...";
					}

					// Add the CFI to the matches list
					matches.push({
						cfi: cfi,
						excerpt: excerpt
					});
				}

				last = pos;
			}
		};

		sprint(section.document, function(node) {
			find(node);
		});

		return matches;
	}

	/**
	* Reconciles the current chapters layout properies with
	* the global layout properities.
	* @param {object} globalLayout  The global layout settings object, chapter properties string
	* @return {object} layoutProperties Object with layout properties
	*/
	reconcileLayoutSettings(globalLayout){
		//-- Get the global defaults
		var settings = {
			layout : globalLayout.layout,
			spread : globalLayout.spread,
			orientation : globalLayout.orientation
		};

		//-- Get the chapter's display type
		this.properties.forEach(function(prop){
			var rendition = prop.replace("rendition:", "");
			var split = rendition.indexOf("-");
			var property, value;

			if(split != -1){
				property = rendition.slice(0, split);
				value = rendition.slice(split+1);

				settings[property] = value;
			}
		});
		return settings;
	}

	/**
	 * Get a CFI from a Range in the Section
	 * @param  {range} _range
	 * @return {string} cfi an EpubCFI string
	 */
	cfiFromRange(_range) {
		return new EpubCFI(_range, this.cfiBase).toString();
	}

	/**
	 * Get a CFI from an Element in the Section
	 * @param  {element} el
	 * @return {string} cfi an EpubCFI string
	 */
	cfiFromElement(el) {
		return new EpubCFI(el, this.cfiBase).toString();
	}

	/**
	 * Unload the section document
	 */
	unload() {
		this.document = undefined;
		this.contents = undefined;
		this.output = undefined;
	}

	/**
	 * Return an object representation of the item
	 * @return {object}
	 */
	toObject() {
		return {
			idref : this.idref,
			linear : this.linear ? "yes" : "no",
			url : this.url,
			source : this.source,
			type : this.type,
			canonical : this.canonical
		}
	}

	/**
	 * Create a url from the content
	 */
	createUrl(request) {
		//var parsedUrl = new Url(url);
		//var mimeType = mime.lookup(parsedUrl.filename);
		let mimeType = this.type;

		return this.render(request)
			.then((text) => {
				return new Blob([text], {type : mimeType});
			})
			.then((blob) => {
				if (this.settings.replacements && this.settings.replacements === "base64") {
					return blob2base64(blob)
						.then((blob) => {
							return createBase64Url(blob, mimeType);
						});
				} else {
					return createBlobUrl(blob, mimeType);
				}
			})
			.then((url) => {
				this.originalHref = this.url;
				this.url = url;

				this.unload();

				return url;
			})
	}

	destroy() {
		this.unload();
		this.hooks.serialize.clear();
		this.hooks.content.clear();

		if (this.originalHref) {
			revokeBlobUrl(this.url);
		}

		this.hooks = undefined;
		this.idref = undefined;
		this.linear = undefined;
		this.properties = undefined;
		this.index = undefined;
		this.url = undefined;
		this.source = undefined;
		this.next = undefined;
		this.prev = undefined;

		this.canonical = undefined;
	}
}

function createElement(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}

var svg = {
    createElement: createElement
};

// import 'babelify/polyfill'; // needed for Object.assign

var events = {
    proxyMouse: proxyMouse
};


/**
 * Start proxying all mouse events that occur on the target node to each node in
 * a set of tracked nodes.
 *
 * The items in tracked do not strictly have to be DOM Nodes, but they do have
 * to have dispatchEvent, getBoundingClientRect, and getClientRects methods.
 *
 * @param target {Node} The node on which to listen for mouse events.
 * @param tracked {Node[]} A (possibly mutable) array of nodes to which to proxy
 *                         events.
 */
function proxyMouse(target, tracked) {
    function dispatch(e) {
        // We walk through the set of tracked elements in reverse order so that
        // events are sent to those most recently added first.
        //
        // This is the least surprising behaviour as it simulates the way the
        // browser would work if items added later were drawn "on top of"
        // earlier ones.
        for (var i = tracked.length - 1; i >= 0; i--) {
            var t = tracked[i];
            var x = e.clientX;
            var y = e.clientY;

            if (e.touches && e.touches.length) {
              x = e.touches[0].clientX;
              y = e.touches[0].clientY;
            }

            if (!contains(t, target, x, y)) {
                continue;
            }

            // The event targets this mark, so dispatch a cloned event:
            t.dispatchEvent(clone(e));
            // We only dispatch the cloned event to the first matching mark.
            break;
        }
    }

    if (target.nodeName === "iframe" || target.nodeName === "IFRAME") {

      try {
        // Try to get the contents if same domain
        this.target = target.contentDocument;
      } catch(err){
        this.target = target;
      }

    } else {
      this.target = target;
    }

    for (var ev of ['mouseup', 'mousedown', 'click', 'touchstart']) {
        this.target.addEventListener(ev, (e) => dispatch(e), false);
    }

}


/**
 * Clone a mouse event object.
 *
 * @param e {MouseEvent} A mouse event object to clone.
 * @returns {MouseEvent}
 */
function clone(e) {
    var opts = Object.assign({}, e, {bubbles: false});
    try {
        return new MouseEvent(e.type, opts);
    } catch(err) { // compat: webkit
        var copy = document.createEvent('MouseEvents');
        copy.initMouseEvent(e.type, false, opts.cancelable, opts.view,
                            opts.detail, opts.screenX, opts.screenY,
                            opts.clientX, opts.clientY, opts.ctrlKey,
                            opts.altKey, opts.shiftKey, opts.metaKey,
                            opts.button, opts.relatedTarget);
        return copy;
    }
}


/**
 * Check if the item contains the point denoted by the passed coordinates
 * @param item {Object} An object with getBoundingClientRect and getClientRects
 *                      methods.
 * @param x {Number}
 * @param y {Number}
 * @returns {Boolean}
 */
function contains(item, target, x, y) {
    // offset
    var offset = target.getBoundingClientRect();

    function rectContains(r, x, y) {
        var top = r.top - offset.top;
        var left = r.left - offset.left;
        var bottom = top + r.height;
        var right = left + r.width;
        return (top <= y && left <= x && bottom > y && right > x);
    }

    // Check overall bounding box first
    var rect = item.getBoundingClientRect();
    if (!rectContains(rect, x, y)) {
        return false;
    }

    // Then continue to check each child rect
    var rects = item.getClientRects();
    for (var i = 0, len = rects.length; i < len; i++) {
        if (rectContains(rects[i], x, y)) {
            return true;
        }
    }
    return false;
}

// From https://github.com/nickstenning/marks

class Pane {
    constructor(target, container = document.body) {
        this.target = target;
        this.element = svg.createElement('svg');
        this.marks = [];

        // Match the coordinates of the target element
        this.element.style.position = 'absolute';
        // Disable pointer events
        this.element.setAttribute('pointer-events', 'none');

        // Set up mouse event proxying between the target element and the marks
        events.proxyMouse(this.target, this.marks);

        this.container = container;
        this.container.appendChild(this.element);

        this.render();
    }

    addMark(mark) {
        var g = svg.createElement('g');
        this.element.appendChild(g);
        mark.bind(g, this.container);

        this.marks.push(mark);

        mark.render();
        return mark;
    }

    removeMark(mark) {
        var idx = this.marks.indexOf(mark);
        if (idx === -1) {
            return;
        }
        var el = mark.unbind();
        this.element.removeChild(el);
        this.marks.splice(idx, 1);
    }

    render() {
        setCoords(this.element, coords(this.target, this.container));
        for (var m of this.marks) {
            m.render();
        }
    }
}


class Mark {
    constructor() {
        this.element = null;
    }

    bind(element, container) {
        this.element = element;
        this.container = container;
    }

    unbind() {
        var el = this.element;
        this.element = null;
        return el;
    }

    render() {}

    dispatchEvent(e) {
        if (!this.element) return;
        this.element.dispatchEvent(e);
    }

    getBoundingClientRect() {
        return this.element.getBoundingClientRect();
    }

    getClientRects() {
        var rects = [];
        var el = this.element.firstChild;
        while (el) {
            rects.push(el.getBoundingClientRect());
            el = el.nextSibling;
        }
        return rects;
    }

    filteredRanges() {
        if (!this.range) {
            return [];
        }

        // De-duplicate the boxes
        const rects = Array.from(this.range.getClientRects());
        const stringRects = rects.map((r) => JSON.stringify(r));
        const setRects = new Set(stringRects);
        return Array.from(setRects).map((sr) => JSON.parse(sr));
    }

}

class Highlight extends Mark {
    constructor(range, className, data, attributes) {
        super();
        this.range = range;
        this.className = className;
        this.data = data || {};
        this.attributes = attributes || {};
    }

    bind(element, container) {
        super.bind(element, container);

        for (var attr in this.data) {
          if (this.data.hasOwnProperty(attr)) {
            this.element.dataset[attr] = this.data[attr];
          }
        }

        for (var attr in this.attributes) {
          if (this.attributes.hasOwnProperty(attr)) {
            this.element.setAttribute(attr, this.attributes[attr]);
          }
        }

        if (this.className) {
          this.element.classList.add(this.className);
        }
    }

    render() {
        // Empty element
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }

        var docFrag = this.element.ownerDocument.createDocumentFragment();
        var filtered = this.filteredRanges();
        var offset = this.element.getBoundingClientRect();
        var container = this.container.getBoundingClientRect();

        for (var i = 0, len = filtered.length; i < len; i++) {
            var r = filtered[i];
            var el = svg.createElement('rect');
            el.setAttribute('x', r.left - offset.left + container.left);
            el.setAttribute('y', r.top - offset.top + container.top);
            el.setAttribute('height', r.height);
            el.setAttribute('width', r.width);
            docFrag.appendChild(el);
        }

        this.element.appendChild(docFrag);

    }
}

class Underline extends Highlight {
    constructor(range, className, data, attributes) {
        super(range, className, data,  attributes);
    }

    render() {
        // Empty element
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }

        var docFrag = this.element.ownerDocument.createDocumentFragment();
        var filtered = this.filteredRanges();
        var offset = this.element.getBoundingClientRect();
        var container = this.container.getBoundingClientRect();

        for (var i = 0, len = filtered.length; i < len; i++) {
            var r = filtered[i];

            var rect = svg.createElement('rect');
            rect.setAttribute('x', r.left - offset.left + container.left);
            rect.setAttribute('y', r.top - offset.top + container.top);
            rect.setAttribute('height', r.height);
            rect.setAttribute('width', r.width);
            rect.setAttribute('fill', 'none');


            var line = svg.createElement('line');
            line.setAttribute('x1', r.left - offset.left + container.left);
            line.setAttribute('x2', r.left - offset.left + container.left + r.width);
            line.setAttribute('y1', r.top - offset.top + container.top + r.height - 1);
            line.setAttribute('y2', r.top - offset.top + container.top + r.height - 1);

            line.setAttribute('stroke-width', 1);
            line.setAttribute('stroke', 'black'); //TODO: match text color?
            line.setAttribute('stroke-linecap', 'square');

            docFrag.appendChild(rect);

            docFrag.appendChild(line);
        }

        this.element.appendChild(docFrag);

    }
}


function coords(el, container) {
    var offset = container.getBoundingClientRect();
    var rect = el.getBoundingClientRect();

    return {
        top: rect.top - offset.top,
        left: rect.left - offset.left,
        height: el.scrollHeight,
        width: el.scrollWidth
    };
}


function setCoords(el, coords) {
    el.style.setProperty('top', `${coords.top}px`, 'important');
    el.style.setProperty('left', `${coords.left}px`, 'important');
    el.style.setProperty('height', `${coords.height}px`, 'important');
    el.style.setProperty('width', `${coords.width}px`, 'important');
}

class IframeView {
	constructor(section, options) {
		this.settings = extend({
			ignoreClass : "",
			axis: undefined, //options.layout && options.layout.props.flow === "scrolled" ? "vertical" : "horizontal",
			direction: undefined,
			width: 0,
			height: 0,
			layout: undefined,
			globalLayoutProperties: {},
			forceRight: false,
			allowScriptedContent: false,
			request: undefined,
			hooks: undefined
		}, options || {});

		if (this.settings.request) {
			this.request = this.settings.request;
		} else {
			this.request = request;
		}

		if (this.settings.hooks) {
			this.hooks = this.settings.hooks;
		} else {
			this.hooks = {};
			this.hooks.serialize = new Hook(this);
			this.hooks.document = new Hook(this);
		}

		this.id = "epubjs-view-" + uuid();
		this.section = section;
		this.index = section.index;

		this.element = this.container(this.settings.axis);

		this.added = false;
		this.displayed = false;
		this.rendered = false;

		// this.width  = this.settings.width;
		// this.height = this.settings.height;

		this.fixedWidth  = 0;
		this.fixedHeight = 0;

		// Blank Cfi for Parsing
		this.epubcfi = new EpubCFI();

		this.layout = this.settings.layout;
		// Dom events to listen for
		// this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

		this.pane = undefined;
		this.highlights = {};
		this.underlines = {};
		this.marks = {};

	}

	container(axis) {
		var element = document.createElement("div");

		element.classList.add("epub-view");

		// this.element.style.minHeight = "100px";
		element.style.height = "0px";
		element.style.width = "0px";
		element.style.overflow = "hidden";
		element.style.position = "relative";
		element.style.display = "block";

		if(axis && axis == "horizontal"){
			element.style.flex = "none";
		} else {
			element.style.flex = "initial";
		}

		return element;
	}

	create() {

		if(this.iframe) {
			return this.iframe;
		}

		if(!this.element) {
			this.element = this.createContainer();
		}

		this.iframe = document.createElement("iframe");
		this.iframe.id = this.id;
		this.iframe.scrolling = "no"; // Might need to be removed: breaks ios width calculations
		this.iframe.style.overflow = "hidden";
		this.iframe.seamless = "seamless";
		// Back up if seamless isn't supported
		this.iframe.style.border = "none";

		// sandbox
		this.iframe.sandbox = "allow-same-origin";
		if (this.settings.allowScriptedContent) {
			this.iframe.sandbox += " allow-scripts";
		}

		this.iframe.setAttribute("enable-annotation", "true");

		this.resizing = true;

		// this.iframe.style.display = "none";
		this.element.style.visibility = "hidden";
		this.iframe.style.visibility = "hidden";

		this.iframe.style.width = "0";
		this.iframe.style.height = "0";
		this._width = 0;
		this._height = 0;

		this.element.setAttribute("ref", this.index);

		this.element.appendChild(this.iframe);
		this.added = true;

		this.elementBounds = bounds(this.element);

		// if(width || height){
		//   this.resize(width, height);
		// } else if(this.width && this.height){
		//   this.resize(this.width, this.height);
		// } else {
		//   this.iframeBounds = bounds(this.iframe);
		// }


		if(("srcdoc" in this.iframe)) {
			this.supportsSrcdoc = true;
		} else {
			this.supportsSrcdoc = false;
		}

		return this.iframe;
	}

	render(requestMethod, show) {
		let sectionDocument;
		// view.onLayout = this.layout.format.bind(this.layout);
		this.create();

		// Fit to size of the container, apply padding
		this.size();

		const loader = requestMethod || this.request;

		sectionDocument = loader(this.section.url).catch((e) => {
			this.emit(EVENTS.VIEWS.LOAD_ERROR, e);
			return new Promise((resolve, reject) => {
				reject(e);
			});
		});

		// Render Chain
		return this.load(sectionDocument, this.section.encoding)
			.then(() => {

				// find and report the writingMode axis
				let writingMode = this.contents.writingMode();

				// Set the axis based on the flow and writing mode
				let axis;
				if (this.settings.flow === "scrolled") {
					axis = (writingMode.indexOf("vertical") === 0) ? "horizontal" : "vertical";
				} else {
					axis = (writingMode.indexOf("vertical") === 0) ? "vertical" : "horizontal";
				}

				if (writingMode.indexOf("vertical") === 0 && this.settings.flow === "paginated") {
					this.layout.delta = this.layout.height;
				}

				this.setAxis(axis);
				this.emit(EVENTS.VIEWS.AXIS, axis);

				this.setWritingMode(writingMode);
				this.emit(EVENTS.VIEWS.WRITING_MODE, writingMode);


				// apply the layout function to the contents
				this.layout.format(this.contents, this.section, this.axis);

				// Listen for events that require an expansion of the iframe
				this.addListeners();

				return new Promise((resolve, reject) => {
					// Expand the iframe to the full size of the content
					this.expand();

					if (this.settings.forceRight) {
						this.element.style.marginLeft = this.width() + "px";
					}
					resolve();
				});

			}, (e) => {
				this.emit(EVENTS.VIEWS.LOAD_ERROR, e);
				return new Promise((resolve, reject) => {
					reject(e);
				});
			})
			.then(() => {
				this.emit(EVENTS.VIEWS.RENDERED, this.section);
			});

	}

	reset () {
		if (this.iframe) {
			this.iframe.style.width = "0";
			this.iframe.style.height = "0";
			this._width = 0;
			this._height = 0;
			this._textWidth = undefined;
			this._contentWidth = undefined;
			this._textHeight = undefined;
			this._contentHeight = undefined;
		}
		this._needsReframe = true;
	}

	// Determine locks base on settings
	size(_width, _height) {
		var width = _width || this.settings.width;
		var height = _height || this.settings.height;

		if(this.layout.name === "pre-paginated") {
			this.lock("both", width, height);
		} else if(this.settings.axis === "horizontal") {
			this.lock("height", width, height);
		} else {
			this.lock("width", width, height);
		}

		this.settings.width = width;
		this.settings.height = height;
	}

	// Lock an axis to element dimensions, taking borders into account
	lock(what, width, height) {
		var elBorders = borders(this.element);
		var iframeBorders;

		if(this.iframe) {
			iframeBorders = borders(this.iframe);
		} else {
			iframeBorders = {width: 0, height: 0};
		}

		if(what == "width" && isNumber(width)){
			this.lockedWidth = width - elBorders.width - iframeBorders.width;
			// this.resize(this.lockedWidth, width); //  width keeps ratio correct
		}

		if(what == "height" && isNumber(height)){
			this.lockedHeight = height - elBorders.height - iframeBorders.height;
			// this.resize(width, this.lockedHeight);
		}

		if(what === "both" &&
			 isNumber(width) &&
			 isNumber(height)){

			this.lockedWidth = width - elBorders.width - iframeBorders.width;
			this.lockedHeight = height - elBorders.height - iframeBorders.height;
			// this.resize(this.lockedWidth, this.lockedHeight);
		}

		if(this.displayed && this.iframe) {

			// this.contents.layout();
			this.expand();
		}



	}

	// Resize a single axis based on content dimensions
	expand(force) {
		var width = this.lockedWidth;
		var height = this.lockedHeight;
		var columns;

		if(!this.iframe || this._expanding) return;

		this._expanding = true;

		if(this.layout.name === "pre-paginated") {
			width = this.layout.columnWidth;
			height = this.layout.height;
		}
		// Expand Horizontally
		else if(this.settings.axis === "horizontal") {
			// Get the width of the text
			width = this.contents.textWidth();

			if (width % this.layout.pageWidth > 0) {
				width = Math.ceil(width / this.layout.pageWidth) * this.layout.pageWidth;
			}

			if (this.settings.forceEvenPages) {
				columns = (width / this.layout.pageWidth);
				if ( this.layout.divisor > 1 &&
						 this.layout.name === "reflowable" &&
						(columns % 2 > 0)) {
					// add a blank page
					width += this.layout.pageWidth;
				}
			}

		} // Expand Vertically
		else if(this.settings.axis === "vertical") {
			height = this.contents.textHeight();
			if (this.settings.flow === "paginated" &&
				height % this.layout.height > 0) {
				height = Math.ceil(height / this.layout.height) * this.layout.height;
			}
		}

		// Only Resize if dimensions have changed or
		// if Frame is still hidden, so needs reframing
		if(this._needsReframe || width != this._width || height != this._height){
			this.reframe(width, height);
		}

		this._expanding = false;
	}

	reframe(width, height) {
		var size;

		if(isNumber(width)){
			this.element.style.width = width + "px";
			this.iframe.style.width = width + "px";
			this._width = width;
		}

		if(isNumber(height)){
			this.element.style.height = height + "px";
			this.iframe.style.height = height + "px";
			this._height = height;
		}

		let widthDelta = this.prevBounds ? width - this.prevBounds.width : width;
		let heightDelta = this.prevBounds ? height - this.prevBounds.height : height;

		size = {
			width: width,
			height: height,
			widthDelta: widthDelta,
			heightDelta: heightDelta,
		};

		this.pane && this.pane.render();

		requestAnimationFrame(() => {
			let mark;
			for (let m in this.marks) {
				if (this.marks.hasOwnProperty(m)) {
					mark = this.marks[m];
					this.placeMark(mark.element, mark.range);
				}
			}
		});

		this.onResize(this, size);

		this.emit(EVENTS.VIEWS.RESIZED, size);

		this.prevBounds = size;

		this.elementBounds = bounds(this.element);

	}


	load(sectionDocument, mimeType="text/html") {
		var loading = new defer();
		var loaded = loading.promise;

		if(!this.iframe) {
			loading.reject(new Error("No Iframe Available"));
			return loaded;
		}

		this.iframe.onload = function(event) {

			this.onLoad(event, loading);

		}.bind(this);

		sectionDocument.then(async (r) => {
			await this.hooks.document.trigger(r, this.section, this);
			let text = serialize(r);
			await this.hooks.serialize.trigger(text, this);
			this.blobUrl = createBlobUrl(text, mimeType); //"application/xhtml+xml"
			this.iframe.src = this.blobUrl;
		});

		return loaded;
	}

	async onLoad(event, promise) {

		this.window = this.iframe.contentWindow;
		this.document = this.iframe.contentDocument;

		this.contents = new Contents(this.document, this.document.body, this.section.cfiBase, this.section.index);

		this.rendering = false;

		if (document.fonts) {
			await document.fonts.ready;			
		}

		this.contents.on(EVENTS.CONTENTS.EXPAND, () => {
			if(this.displayed && this.iframe) {
				this.expand();
				if (this.contents) {
					this.layout.format(this.contents);
				}
			}
		});

		this.contents.on(EVENTS.CONTENTS.RESIZE, (e) => {
			if(this.displayed && this.iframe) {
				this.expand();
				if (this.contents) {
					this.layout.format(this.contents);
				}
			}
		});

		promise.resolve(this.contents);
	}

	setLayout(layout) {
		this.layout = layout;

		if (this.contents) {
			this.layout.format(this.contents);
			this.expand();
		}
	}

	setAxis(axis) {

		this.settings.axis = axis;

		if(axis == "horizontal"){
			this.element.style.flex = "none";
		} else {
			this.element.style.flex = "initial";
		}

		this.size();

	}

	setWritingMode(mode) {
		// this.element.style.writingMode = writingMode;
		this.writingMode = mode;
	}

	addListeners() {
		//TODO: Add content listeners for expanding
	}

	removeListeners(layoutFunc) {
		//TODO: remove content listeners for expanding
	}

	display(requestMethod) {
		var displayed = new defer();

		if (!this.displayed) {

			this.render(requestMethod)
				.then(function () {

					this.emit(EVENTS.VIEWS.DISPLAYED, this);
					this.onDisplayed(this);

					this.displayed = true;
					displayed.resolve(this);

				}.bind(this), function (err) {
					displayed.reject(err, this);
				});

		} else {
			displayed.resolve(this);
		}


		return displayed.promise;
	}

	show() {

		this.element.style.visibility = "visible";

		if(this.iframe){
			this.iframe.style.visibility = "visible";

			// Remind Safari to redraw the iframe
			this.iframe.style.transform = "translateZ(0)";
			this.iframe.offsetWidth;
			this.iframe.style.transform = null;
		}

		this.emit(EVENTS.VIEWS.SHOWN, this);
	}

	hide() {
		// this.iframe.style.display = "none";
		this.element.style.visibility = "hidden";
		this.iframe.style.visibility = "hidden";

		this.stopExpanding = true;
		this.emit(EVENTS.VIEWS.HIDDEN, this);
	}

	offset() {
		return {
			top: this.element.offsetTop,
			left: this.element.offsetLeft
		}
	}

	width() {
		return this._width;
	}

	height() {
		return this._height;
	}

	position() {
		return this.element.getBoundingClientRect();
	}

	locationOf(target) {
		this.iframe.getBoundingClientRect();
		var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);

		return {
			"left": targetPos.left,
			"top": targetPos.top
		};
	}

	onDisplayed(view) {
		// Stub, override with a custom functions
	}

	onResize(view, e) {
		// Stub, override with a custom functions
	}

	bounds(force) {
		if(force || !this.elementBounds) {
			this.elementBounds = bounds(this.element);
		}

		return this.elementBounds;
	}

	highlight(cfiRange, data={}, cb, className = "epubjs-hl", styles = {}) {
		if (!this.contents) {
			return;
		}
		const attributes = Object.assign({"fill": "yellow", "fill-opacity": "0.3", "mix-blend-mode": "multiply"}, styles);
		let range = this.contents.range(cfiRange);

		let emitter = () => {
			this.emit(EVENTS.VIEWS.MARK_CLICKED, cfiRange, data);
		};

		data["epubcfi"] = cfiRange;

		if (!this.pane) {
			this.pane = new Pane(this.iframe, this.element);
		}

		let m = new Highlight(range, className, data, attributes);
		let h = this.pane.addMark(m);

		this.highlights[cfiRange] = { "mark": h, "element": h.element, "listeners": [emitter, cb] };

		h.element.setAttribute("ref", className);
		h.element.addEventListener("click", emitter);
		h.element.addEventListener("touchstart", emitter);

		if (cb) {
			h.element.addEventListener("click", cb);
			h.element.addEventListener("touchstart", cb);
		}
		return h;
	}

	underline(cfiRange, data={}, cb, className = "epubjs-ul", styles = {}) {
		if (!this.contents) {
			return;
		}
		const attributes = Object.assign({"stroke": "black", "stroke-opacity": "0.3", "mix-blend-mode": "multiply"}, styles);
		let range = this.contents.range(cfiRange);
		let emitter = () => {
			this.emit(EVENTS.VIEWS.MARK_CLICKED, cfiRange, data);
		};

		data["epubcfi"] = cfiRange;

		if (!this.pane) {
			this.pane = new Pane(this.iframe, this.element);
		}

		let m = new Underline(range, className, data, attributes);
		let h = this.pane.addMark(m);

		this.underlines[cfiRange] = { "mark": h, "element": h.element, "listeners": [emitter, cb] };

		h.element.setAttribute("ref", className);
		h.element.addEventListener("click", emitter);
		h.element.addEventListener("touchstart", emitter);

		if (cb) {
			h.element.addEventListener("click", cb);
			h.element.addEventListener("touchstart", cb);
		}
		return h;
	}

	mark(cfiRange, data={}, cb) {
		if (!this.contents) {
			return;
		}

		if (cfiRange in this.marks) {
			let item = this.marks[cfiRange];
			return item;
		}

		let range = this.contents.range(cfiRange);
		if (!range) {
			return;
		}
		let container = range.commonAncestorContainer;
		let parent = (container.nodeType === 1) ? container : container.parentNode;

		let emitter = (e) => {
			this.emit(EVENTS.VIEWS.MARK_CLICKED, cfiRange, data);
		};

		if (range.collapsed && container.nodeType === 1) {
			range = new Range();
			range.selectNodeContents(container);
		} else if (range.collapsed) { // Webkit doesn't like collapsed ranges
			range = new Range();
			range.selectNodeContents(parent);
		}

		let mark = this.document.createElement("a");
		mark.setAttribute("ref", "epubjs-mk");
		mark.style.position = "absolute";

		mark.dataset["epubcfi"] = cfiRange;

		if (data) {
			Object.keys(data).forEach((key) => {
				mark.dataset[key] = data[key];
			});
		}

		if (cb) {
			mark.addEventListener("click", cb);
			mark.addEventListener("touchstart", cb);
		}

		mark.addEventListener("click", emitter);
		mark.addEventListener("touchstart", emitter);

		this.placeMark(mark, range);

		this.element.appendChild(mark);

		this.marks[cfiRange] = { "element": mark, "range": range, "listeners": [emitter, cb] };

		return parent;
	}

	placeMark(element, range) {
		let top, right, left;

		if(this.layout.name === "pre-paginated" ||
			this.settings.axis !== "horizontal") {
			let pos = range.getBoundingClientRect();
			top = pos.top;
			right = pos.right;
		} else {
			// Element might break columns, so find the left most element
			let rects = range.getClientRects();

			let rect;
			for (var i = 0; i != rects.length; i++) {
				rect = rects[i];
				if (!left || rect.left < left) {
					left = rect.left;
					// right = rect.right;
					right = Math.ceil(left / this.layout.props.pageWidth) * this.layout.props.pageWidth - (this.layout.gap / 2);
					top = rect.top;
				}
			}
		}

		element.style.top = `${top}px`;
		element.style.left = `${right}px`;
	}

	unhighlight(cfiRange) {
		let item;
		if (cfiRange in this.highlights) {
			item = this.highlights[cfiRange];

			this.pane.removeMark(item.mark);
			item.listeners.forEach((l) => {
				if (l) {
					item.element.removeEventListener("click", l);
					item.element.removeEventListener("touchstart", l);
				}			});
			delete this.highlights[cfiRange];
		}
	}

	ununderline(cfiRange) {
		let item;
		if (cfiRange in this.underlines) {
			item = this.underlines[cfiRange];
			this.pane.removeMark(item.mark);
			item.listeners.forEach((l) => {
				if (l) {
					item.element.removeEventListener("click", l);
					item.element.removeEventListener("touchstart", l);
				}			});
			delete this.underlines[cfiRange];
		}
	}

	unmark(cfiRange) {
		let item;
		if (cfiRange in this.marks) {
			item = this.marks[cfiRange];
			this.element.removeChild(item.element);
			item.listeners.forEach((l) => {
				if (l) {
					item.element.removeEventListener("click", l);
					item.element.removeEventListener("touchstart", l);
				}			});
			delete this.marks[cfiRange];
		}
	}

	destroy() {

		for (let cfiRange in this.highlights) {
			this.unhighlight(cfiRange);
		}

		for (let cfiRange in this.underlines) {
			this.ununderline(cfiRange);
		}

		for (let cfiRange in this.marks) {
			this.unmark(cfiRange);
		}

		if (this.blobUrl) {
			revokeBlobUrl(this.blobUrl);
		}

		if(this.displayed){
			this.displayed = false;

			this.removeListeners();
			this.contents.destroy();

			this.stopExpanding = true;
			this.element.removeChild(this.iframe);

			if (this.pane) {
				this.pane.element.remove();
				this.pane = undefined;
			}

			this.iframe = undefined;
			this.contents = undefined;

			this._textWidth = null;
			this._textHeight = null;
			this._width = null;
			this._height = null;
		}

		// this.element.style.height = "0px";
		// this.element.style.width = "0px";
	}
}

EventEmitter(IframeView.prototype);

// Detect RTL scroll type
// Based on https://github.com/othree/jquery.rtl-scroll-type/blob/master/src/jquery.rtl-scroll.js
function scrollType() {
	var type = "reverse";
	var definer = createDefiner();
	document.body.appendChild(definer);

	if (definer.scrollLeft > 0) {
		type = "default";
	} else {
		if (typeof Element !== 'undefined' && Element.prototype.scrollIntoView) {
			definer.children[0].children[1].scrollIntoView();
			if (definer.scrollLeft < 0) {
				type = "negative";
			}
		} else {
			definer.scrollLeft = 1;
			if (definer.scrollLeft === 0) {
				type = "negative";
			}
		}
	}

	document.body.removeChild(definer);
	return type;
}

function createDefiner() {
	var definer = document.createElement('div');
	definer.dir="rtl";

	definer.style.position = "fixed";
	definer.style.width = "1px";
	definer.style.height = "1px";
	definer.style.top = "0px";
	definer.style.left = "0px";
	definer.style.overflow = "hidden";

	var innerDiv = document.createElement('div');
	innerDiv.style.width = "2px";

	var spanA = document.createElement('span');
	spanA.style.width = "1px";
	spanA.style.display = "inline-block";

	var spanB = document.createElement('span');
	spanB.style.width = "1px";
	spanB.style.display = "inline-block";

	innerDiv.appendChild(spanA);
	innerDiv.appendChild(spanB);
	definer.appendChild(innerDiv);

	return definer;
}

// import throttle from 'lodash/throttle'

class Stage {
	constructor(_options) {
		this.settings = _options || {};
		this.id = "epubjs-container-" + uuid();

		this.container = this.create(this.settings);

		if(this.settings.hidden) {
			this.wrapper = this.wrap(this.container);
		}

	}

	/*
	* Creates an element to render to.
	* Resizes to passed width and height or to the elements size
	*/
	create(options){
		let height  = options.height;// !== false ? options.height : "100%";
		let width   = options.width;// !== false ? options.width : "100%";
		let overflow  = options.overflow || false;
		let axis = options.axis || "vertical";
		let direction = options.direction;

		extend(this.settings, options);

		if(options.height && isNumber(options.height)) {
			height = options.height + "px";
		}

		if(options.width && isNumber(options.width)) {
			width = options.width + "px";
		}

		// Create new container element
		let container = document.createElement("div");

		container.id = this.id;
		container.classList.add("epub-container");

		// Style Element
		// container.style.fontSize = "0";
		container.style.wordSpacing = "0";
		container.style.lineHeight = "0";
		container.style.verticalAlign = "top";
		container.style.position = "relative";

		if(axis === "horizontal") {
			// container.style.whiteSpace = "nowrap";
			container.style.display = "flex";
			container.style.flexDirection = "row";
			container.style.flexWrap = "nowrap";
		}

		if(width){
			container.style.width = width;
		}

		if(height){
			container.style.height = height;
		}

		if (overflow) {
			if (overflow === "scroll" && axis === "vertical") {
				container.style["overflow-y"] = overflow;
				container.style["overflow-x"] = "hidden";
			} else if (overflow === "scroll" && axis === "horizontal") {
				container.style["overflow-y"] = "hidden";
				container.style["overflow-x"] = overflow;
			} else {
				container.style["overflow"] = overflow;
			}
		}

		if (direction) {
			container.dir = direction;
			container.style["direction"] = direction;
		}

		if (direction && this.settings.fullsize) {
			document.body.style["direction"] = direction;
		}

		return container;
	}

	wrap(container) {
		var wrapper = document.createElement("div");

		wrapper.style.visibility = "hidden";
		wrapper.style.overflow = "hidden";
		wrapper.style.width = "0";
		wrapper.style.height = "0";

		wrapper.appendChild(container);
		return wrapper;
	}


	getElement(_element){
		var element;

		if(isElement(_element)) {
			element = _element;
		} else if (typeof _element === "string") {
			element = document.getElementById(_element);
		}

		if(!element){
			throw new Error("Not an Element");
		}

		return element;
	}

	attachTo(what){

		var element = this.getElement(what);
		var base;

		if(!element){
			return;
		}

		if(this.settings.hidden) {
			base = this.wrapper;
		} else {
			base = this.container;
		}

		element.appendChild(base);

		this.element = element;

		return element;

	}

	getContainer() {
		return this.container;
	}

	onResize(func){
		// Only listen to window for resize event if width and height are not fixed.
		// This applies if it is set to a percent or auto.
		if(!isNumber(this.settings.width) ||
			 !isNumber(this.settings.height) ) {
			this.resizeFunc = throttle(func, 50);
			window.addEventListener("resize", this.resizeFunc, false);
		}

	}

	onOrientationChange(func){
		this.orientationChangeFunc = func;
		window.addEventListener("orientationchange", this.orientationChangeFunc, false);
	}

	size(width, height){
		var bounds;
		let _width = width || this.settings.width;
		let _height = height || this.settings.height;

		// If width or height are set to false, inherit them from containing element
		if(width === null) {
			bounds = this.element.getBoundingClientRect();

			if(bounds.width) {
				width = Math.floor(bounds.width);
				this.container.style.width = width + "px";
			}
		} else {
			if (isNumber(width)) {
				this.container.style.width = width + "px";
			} else {
				this.container.style.width = width;
			}
		}

		if(height === null) {
			bounds = bounds || this.element.getBoundingClientRect();

			if(bounds.height) {
				height = bounds.height;
				this.container.style.height = height + "px";
			}

		} else {
			if (isNumber(height)) {
				this.container.style.height = height + "px";
			} else {
				this.container.style.height = height;
			}
		}

		if(!isNumber(width)) {
			width = this.container.clientWidth;
		}

		if(!isNumber(height)) {
			height = this.container.clientHeight;
		}

		this.containerStyles = window.getComputedStyle(this.container);

		this.containerPadding = {
			left: parseFloat(this.containerStyles["padding-left"]) || 0,
			right: parseFloat(this.containerStyles["padding-right"]) || 0,
			top: parseFloat(this.containerStyles["padding-top"]) || 0,
			bottom: parseFloat(this.containerStyles["padding-bottom"]) || 0
		};

		// Bounds not set, get them from window
		let _windowBounds = windowBounds();
		let bodyStyles = window.getComputedStyle(document.body);
		let bodyPadding = {
			left: parseFloat(bodyStyles["padding-left"]) || 0,
			right: parseFloat(bodyStyles["padding-right"]) || 0,
			top: parseFloat(bodyStyles["padding-top"]) || 0,
			bottom: parseFloat(bodyStyles["padding-bottom"]) || 0
		};

		if (!_width) {
			width = _windowBounds.width -
								bodyPadding.left -
								bodyPadding.right;
		}

		if ((this.settings.fullsize && !_height) || !_height) {
			height = _windowBounds.height -
								bodyPadding.top -
								bodyPadding.bottom;
		}

		return {
			width: width -
							this.containerPadding.left -
							this.containerPadding.right,
			height: height -
							this.containerPadding.top -
							this.containerPadding.bottom
		};

	}

	bounds(){
		let box;
		if (this.container.style.overflow !== "visible") {
			box = this.container && this.container.getBoundingClientRect();
		}

		if(!box || !box.width || !box.height) {
			return windowBounds();
		} else {
			return box;
		}

	}

	getSheet(){
		var style = document.createElement("style");

		// WebKit hack --> https://davidwalsh.name/add-rules-stylesheets
		style.appendChild(document.createTextNode(""));

		document.head.appendChild(style);

		return style.sheet;
	}

	addStyleRules(selector, rulesArray){
		var scope = "#" + this.id + " ";
		var rules = "";

		if(!this.sheet){
			this.sheet = this.getSheet();
		}

		rulesArray.forEach(function(set) {
			for (var prop in set) {
				if(set.hasOwnProperty(prop)) {
					rules += prop + ":" + set[prop] + ";";
				}
			}
		});

		this.sheet.insertRule(scope + selector + " {" + rules + "}", 0);
	}

	axis(axis) {
		if(axis === "horizontal") {
			this.container.style.display = "flex";
			this.container.style.flexDirection = "row";
			this.container.style.flexWrap = "nowrap";
		} else {
			this.container.style.display = "block";
		}
		this.settings.axis = axis;
	}

	// orientation(orientation) {
	// 	if (orientation === "landscape") {
	//
	// 	} else {
	//
	// 	}
	//
	// 	this.orientation = orientation;
	// }

	direction(dir) {
		if (this.container) {
			this.container.dir = dir;
			this.container.style["direction"] = dir;
		}

		if (this.settings.fullsize) {
			document.body.style["direction"] = dir;
		}
		this.settings.dir = dir;
	}

	overflow(overflow) {
		if (this.container) {
			if (overflow === "scroll" && this.settings.axis === "vertical") {
				this.container.style["overflow-y"] = overflow;
				this.container.style["overflow-x"] = "hidden";
			} else if (overflow === "scroll" && this.settings.axis === "horizontal") {
				this.container.style["overflow-y"] = "hidden";
				this.container.style["overflow-x"] = overflow;
			} else {
				this.container.style["overflow"] = overflow;
			}
		}
		this.settings.overflow = overflow;
	}

	destroy() {

		if (this.element) {

			if(this.settings.hidden) ;

			if(this.element.contains(this.container)) {
				this.element.removeChild(this.container);
			}

			window.removeEventListener("resize", this.resizeFunc);
			window.removeEventListener("orientationChange", this.orientationChangeFunc);

		}
	}
}

class Views {
	constructor(container) {
		this.container = container;
		this._views = [];
		this.length = 0;
		this.hidden = false;
	}

	all() {
		return this._views;
	}

	first() {
		return this._views[0];
	}

	last() {
		return this._views[this._views.length-1];
	}

	indexOf(view) {
		return this._views.indexOf(view);
	}

	slice() {
		return this._views.slice.apply(this._views, arguments);
	}

	get(i) {
		return this._views[i];
	}

	append(view){
		this._views.push(view);
		if(this.container){
			this.container.appendChild(view.element);
		}
		this.length++;
		return view;
	}

	prepend(view){
		this._views.unshift(view);
		if(this.container){
			this.container.insertBefore(view.element, this.container.firstChild);
		}
		this.length++;
		return view;
	}

	insert(view, index) {
		this._views.splice(index, 0, view);

		if(this.container){
			if(index < this.container.children.length){
				this.container.insertBefore(view.element, this.container.children[index]);
			} else {
				this.container.appendChild(view.element);
			}
		}

		this.length++;
		return view;
	}

	remove(view) {
		var index = this._views.indexOf(view);

		if(index > -1) {
			this._views.splice(index, 1);
		}


		this.destroy(view);

		this.length--;
	}

	destroy(view) {
		if(view.displayed){
			view.destroy();
		}
		
		if(this.container){
			 this.container.removeChild(view.element);
		}
		view = null;
	}

	// Iterators

	forEach() {
		return this._views.forEach.apply(this._views, arguments);
	}

	clear(){
		// Remove all views
		var view;
		var len = this.length;

		if(!this.length) return;

		for (var i = 0; i < len; i++) {
			view = this._views[i];
			this.destroy(view);
		}

		this._views = [];
		this.length = 0;
	}

	find(section){

		var view;
		var len = this.length;

		for (var i = 0; i < len; i++) {
			view = this._views[i];
			if(view.displayed && view.section.index == section.index) {
				return view;
			}
		}

	}

	displayed(){
		var displayed = [];
		var view;
		var len = this.length;

		for (var i = 0; i < len; i++) {
			view = this._views[i];
			if(view.displayed){
				displayed.push(view);
			}
		}
		return displayed;
	}

	show(){
		var view;
		var len = this.length;

		for (var i = 0; i < len; i++) {
			view = this._views[i];
			if(view.displayed){
				view.show();
			}
		}
		this.hidden = false;
	}

	hide(){
		var view;
		var len = this.length;

		for (var i = 0; i < len; i++) {
			view = this._views[i];
			if(view.displayed){
				view.hide();
			}
		}
		this.hidden = true;
	}
}

class DefaultViewManager {
	constructor(options) {

		this.name = "default";
		this.optsSettings = options.settings;
		this.View = options.view;
		this.sections = options.sections;
		this.request = options.request;
		this.hooks = options.hooks;
		this.q = new Queue(this);

		this.settings = extend(this.settings || {}, {
			infinite: true,
			hidden: false,
			width: undefined,
			height: undefined,
			axis: undefined,
			writingMode: undefined,
			flow: "scrolled",
			ignoreClass: "",
			fullsize: undefined,
			allowScriptedContent: false,
		});

		extend(this.settings, options.settings || {});

		this.viewSettings = {
			ignoreClass: this.settings.ignoreClass,
			axis: this.settings.axis,
			flow: this.settings.flow,
			layout: this.layout,
			width: 0,
			height: 0,
			forceEvenPages: true,
			allowScriptedContent: this.settings.allowScriptedContent,
			hooks: this.hooks,
			request: this.request
		};

		this.rendered = false;

	}

	render(element, size){
		let tag = element.tagName;

		if (typeof this.settings.fullsize === "undefined" &&
				tag && (tag.toLowerCase() == "body" ||
				tag.toLowerCase() == "html")) {
				this.settings.fullsize = true;
		}

		if (this.settings.fullsize) {
			this.settings.overflow = "visible";
			this.overflow = this.settings.overflow;
		}

		this.settings.size = size;

		this.settings.rtlScrollType = scrollType();

		// Save the stage
		this.stage = new Stage({
			width: size.width,
			height: size.height,
			overflow: this.overflow,
			hidden: this.settings.hidden,
			axis: this.settings.axis,
			fullsize: this.settings.fullsize,
			direction: this.settings.direction,
			scale: this.settings.scale
		});

		this.stage.attachTo(element);

		// Get this stage container div
		this.container = this.stage.getContainer();

		// Views array methods
		this.views = new Views(this.container);

		// Calculate Stage Size
		this._bounds = this.bounds();
		this._stageSize = this.stage.size();

		// Set the dimensions for views
		this.viewSettings.width = this._stageSize.width;
		this.viewSettings.height = this._stageSize.height;

		// Function to handle a resize event.
		// Will only attach if width and height are both fixed.
		this.stage.onResize(this.onResized.bind(this));

		this.stage.onOrientationChange(this.onOrientationChange.bind(this));

		// Add Event Listeners
		this.addEventListeners();

		// Add Layout method
		// this.applyLayoutMethod();
		if (this.layout) {
			this.updateLayout();
		}

		this.rendered = true;

	}

	addEventListeners(){
		var scroller;

		window.addEventListener("unload", function(e){
			this.destroy();
		}.bind(this));

		if(!this.settings.fullsize) {
			scroller = this.container;
		} else {
			scroller = window;
		}

		this._onScroll = this.onScroll.bind(this);
		scroller.addEventListener("scroll", this._onScroll);
	}

	removeEventListeners(){
		var scroller;

		if(!this.settings.fullsize) {
			scroller = this.container;
		} else {
			scroller = window;
		}

		if (scroller) {
			scroller.removeEventListener("scroll", this._onScroll);
		}
		this._onScroll = undefined;
	}

	destroy(){
		clearTimeout(this.orientationTimeout);
		clearTimeout(this.resizeTimeout);
		clearTimeout(this.afterScrolled);

		this.clear();

		this.removeEventListeners();

		this.stage && this.stage.destroy();

		this.rendered = false;

		/*

			clearTimeout(this.trimTimeout);
			if(this.settings.hidden) {
				this.element.removeChild(this.wrapper);
			} else {
				this.element.removeChild(this.container);
			}
		*/
	}

	onOrientationChange(e) {
		let {orientation} = window;

		if(this.optsSettings.resizeOnOrientationChange) {
			this.resize();
		}

		// Per ampproject:
		// In IOS 10.3, the measured size of an element is incorrect if the
		// element size depends on window size directly and the measurement
		// happens in window.resize event. Adding a timeout for correct
		// measurement. See https://github.com/ampproject/amphtml/issues/8479
		clearTimeout(this.orientationTimeout);
		this.orientationTimeout = setTimeout(function(){
			this.orientationTimeout = undefined;

			if(this.optsSettings.resizeOnOrientationChange) {
				this.resize();
			}

			this.emit(EVENTS.MANAGERS.ORIENTATION_CHANGE, orientation);
		}.bind(this), 500);

	}

	onResized(e) {
		this.resize();
	}

	resize(width, height, epubcfi){
		let stageSize = this.stage.size(width, height);

		// For Safari, wait for orientation to catch up
		// if the window is a square
		this.winBounds = windowBounds();
		if (this.orientationTimeout &&
				this.winBounds.width === this.winBounds.height) {
			// reset the stage size for next resize
			this._stageSize = undefined;
			return;
		}

		if (this._stageSize &&
				this._stageSize.width === stageSize.width &&
				this._stageSize.height === stageSize.height ) {
			// Size is the same, no need to resize
			return;
		}

		this._stageSize = stageSize;

		this._bounds = this.bounds();

		// Clear current views
		this.clear();

		// Update for new views
		this.viewSettings.width = this._stageSize.width;
		this.viewSettings.height = this._stageSize.height;

		this.updateLayout();

		this.emit(EVENTS.MANAGERS.RESIZED, {
			width: this._stageSize.width,
			height: this._stageSize.height
		}, epubcfi);
	}

	createView(section, forceRight) {
		return new this.View(section, extend(this.viewSettings, { forceRight }) );
	}

	handleNextPrePaginated(forceRight, section, action) {
		let next;

		if (this.layout.name === "pre-paginated" && this.layout.divisor > 1) {
			if (forceRight || section.index === 0) {
				// First page (cover) should stand alone for pre-paginated books
				return;
			}
			next = nextSection(section, this.sections);
			if (next && !next.properties.includes("page-spread-left")) {
				return action.call(this, next);
			}
		}
	}

	display(section, target){

		var displaying = new defer();
		var displayed = displaying.promise;

		// Check if moving to target is needed
		if (target === section.url || isNumber(target)) {
			target = undefined;
		}

		// Check to make sure the section we want isn't already shown
		var visible = this.views.find(section);

		// View is already shown, just move to correct location in view
		if(visible && section && this.layout.name !== "pre-paginated") {
			let offset = visible.offset();

			if (this.settings.direction === "ltr") {
				this.scrollTo(offset.left, offset.top, true);
			} else {
				let width = visible.width();
				this.scrollTo(offset.left + width, offset.top, true);
			}

			if(target) {
				let offset = visible.locationOf(target);
				let width = visible.width();
				this.moveTo(offset, width);
			}

			displaying.resolve();
			return displayed;
		}

		// Hide all current views
		this.clear();

		let forceRight = false;
		if (this.layout.name === "pre-paginated" && this.layout.divisor === 2 && section.properties.includes("page-spread-right")) {
			forceRight = true;
		}

		this.add(section, forceRight)
			.then(function(view){

				// Move to correct place within the section, if needed
				if(target) {
					let offset = view.locationOf(target);
					let width = view.width();
					this.moveTo(offset, width);
				}

			}.bind(this), (err) => {
				displaying.reject(err);
			})
			.then(function(){
				return this.handleNextPrePaginated(forceRight, section, this.add);
			}.bind(this))
			.then(function(){

				this.views.show();

				displaying.resolve();

			}.bind(this));
		// .then(function(){
		// 	return this.hooks.display.trigger(view);
		// }.bind(this))
		// .then(function(){
		// 	this.views.show();
		// }.bind(this));
		return displayed;
	}

	afterDisplayed(view){
		this.emit(EVENTS.MANAGERS.ADDED, view);
	}

	afterResized(view){
		this.emit(EVENTS.MANAGERS.RESIZE, view.section);
	}

	moveTo(offset, width){
		var distX = 0,
				distY = 0;

		if(!this.isPaginated) {
			distY = offset.top;
		} else {
			distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;

			if (distX + this.layout.delta > this.container.scrollWidth) {
				distX = this.container.scrollWidth - this.layout.delta;
			}

			distY = Math.floor(offset.top / this.layout.delta) * this.layout.delta;

			if (distY + this.layout.delta > this.container.scrollHeight) {
				distY = this.container.scrollHeight - this.layout.delta;
			}
		}
		if(this.settings.direction === 'rtl'){
			/***
				the `floor` function above (L343) is on positive values, so we should add one `layout.delta` 
				to distX or use `Math.ceil` function, or multiply offset.left by -1
				before `Math.floor`
			*/
			distX = distX + this.layout.delta; 
			distX = distX - width;
		}
		this.scrollTo(distX, distY, true);
	}

	add(section, forceRight){
		var view = this.createView(section, forceRight);

		this.views.append(view);

		// view.on(EVENTS.VIEWS.SHOWN, this.afterDisplayed.bind(this));
		view.onDisplayed = this.afterDisplayed.bind(this);
		view.onResize = this.afterResized.bind(this);

		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});

		view.on(EVENTS.VIEWS.WRITING_MODE, (mode) => {
			this.updateWritingMode(mode);
		});

		return view.display(this.request);
	}

	append(section, forceRight){
		var view = this.createView(section, forceRight);
		this.views.append(view);

		view.onDisplayed = this.afterDisplayed.bind(this);
		view.onResize = this.afterResized.bind(this);

		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});

		view.on(EVENTS.VIEWS.WRITING_MODE, (mode) => {
			this.updateWritingMode(mode);
		});

		return view.display(this.request);
	}

	prepend(section, forceRight){
		var view = this.createView(section, forceRight);

		view.on(EVENTS.VIEWS.RESIZED, (bounds) => {
			this.counter(bounds);
		});

		this.views.prepend(view);

		view.onDisplayed = this.afterDisplayed.bind(this);
		view.onResize = this.afterResized.bind(this);

		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});

		view.on(EVENTS.VIEWS.WRITING_MODE, (mode) => {
			this.updateWritingMode(mode);
		});

		return view.display(this.request);
	}

	counter(bounds){
		if(this.settings.axis === "vertical") {
			this.scrollBy(0, bounds.heightDelta, true);
		} else {
			this.scrollBy(bounds.widthDelta, 0, true);
		}

	}

	// resizeView(view) {
	//
	// 	if(this.settings.globalLayoutProperties.layout === "pre-paginated") {
	// 		view.lock("both", this.bounds.width, this.bounds.height);
	// 	} else {
	// 		view.lock("width", this.bounds.width, this.bounds.height);
	// 	}
	//
	// };

	next(){
		var next;
		var left;

		let dir = this.settings.direction;

		if(!this.views.length) return;

		if(this.isPaginated && this.settings.axis === "horizontal" && (!dir || dir === "ltr")) {

			this.scrollLeft = this.container.scrollLeft;

			left = this.container.scrollLeft + this.container.offsetWidth + this.layout.delta;

			if(left <= this.container.scrollWidth) {
				this.scrollBy(this.layout.delta, 0, true);
			} else {
				next = nextSection(this.views.last().section, this.sections);
			}
		} else if (this.isPaginated && this.settings.axis === "horizontal" && dir === "rtl") {

			this.scrollLeft = this.container.scrollLeft;

			if (this.settings.rtlScrollType === "default"){
				left = this.container.scrollLeft;

				if (left > 0) {
					this.scrollBy(this.layout.delta, 0, true);
				} else {
					next = nextSection(this.views.last().section, this.sections);
				}
			} else {
				left = this.container.scrollLeft + ( this.layout.delta * -1 );

				if (left > this.container.scrollWidth * -1){
					this.scrollBy(this.layout.delta, 0, true);
				} else {
					next = nextSection(this.views.last().section, this.sections);
				}
			}

		} else if (this.isPaginated && this.settings.axis === "vertical") {

			this.scrollTop = this.container.scrollTop;

			let top  = this.container.scrollTop + this.container.offsetHeight;

			if(top < this.container.scrollHeight) {
				this.scrollBy(0, this.layout.height, true);
			} else {
				next = nextSection(this.views.last().section, this.sections);
			}

		} else {
			next = nextSection(this.views.last().section, this.sections);
		}

		if(next) {
			this.clear();
			// The new section may have a different writing-mode from the old section. Thus, we need to update layout.
			this.updateLayout();

			let forceRight = false;
			if (this.layout.name === "pre-paginated" && this.layout.divisor === 2 && next.properties.includes("page-spread-right")) {
				forceRight = true;
			}

			return this.append(next, forceRight)
				.then(function(){
					return this.handleNextPrePaginated(forceRight, next, this.append);
				}.bind(this), (err) => {
					return err;
				})
				.then(function(){

					// Reset position to start for scrolled-doc vertical-rl in default mode
					if (!this.isPaginated &&
						this.settings.axis === "horizontal" &&
						this.settings.direction === "rtl" &&
						this.settings.rtlScrollType === "default") {
						
						this.scrollTo(this.container.scrollWidth, 0, true);
					}
					this.views.show();
				}.bind(this));
		}


	}

	prev(){
		var prev;
		var left;
		let dir = this.settings.direction;

		if(!this.views.length) return;

		if(this.isPaginated && this.settings.axis === "horizontal" && (!dir || dir === "ltr")) {

			this.scrollLeft = this.container.scrollLeft;

			left = this.container.scrollLeft;

			if(left > 0) {
				this.scrollBy(-this.layout.delta, 0, true);
			} else {
				prev = prevSection(this.views.first().section, this.sections);
			}

		} else if (this.isPaginated && this.settings.axis === "horizontal" && dir === "rtl") {

			this.scrollLeft = this.container.scrollLeft;

			if (this.settings.rtlScrollType === "default"){
				left = this.container.scrollLeft + this.container.offsetWidth;

				if (left < this.container.scrollWidth) {
					this.scrollBy(-this.layout.delta, 0, true);
				} else {
					prev = prevSection(this.views.first().section, this.sections);
				}
			}
			else {
				left = this.container.scrollLeft;

				if (left < 0) {
					this.scrollBy(-this.layout.delta, 0, true);
				} else {
					prev = prevSection(this.views.first().section, this.sections);
				}
			}

		} else if (this.isPaginated && this.settings.axis === "vertical") {

			this.scrollTop = this.container.scrollTop;

			let top = this.container.scrollTop;

			if(top > 0) {
				this.scrollBy(0, -(this.layout.height), true);
			} else {
				prev = prevSection(this.views.first().section, this.sections);
			}

		} else {

			prev = prevSection(this.views.first().section, this.sections);

		}

		if(prev) {
			this.clear();
			// The new section may have a different writing-mode from the old section. Thus, we need to update layout.
			this.updateLayout();

			let forceRight = false;
			if (this.layout.name === "pre-paginated" && this.layout.divisor === 2 && typeof prev.prev() !== "object") {
				forceRight = true;
			}

			return this.prepend(prev, forceRight)
				.then(function(){
					var left;
					if (this.layout.name === "pre-paginated" && this.layout.divisor > 1) {
						left = prev.prev();
						if (left) {
							return this.prepend(left);
						}
					}
				}.bind(this), (err) => {
					return err;
				})
				.then(function(){
					if(this.isPaginated && this.settings.axis === "horizontal") {
						if (this.settings.direction === "rtl") {
							if (this.settings.rtlScrollType === "default"){
								this.scrollTo(0, 0, true);
							}
							else {
								this.scrollTo((this.container.scrollWidth * -1) + this.layout.delta, 0, true);
							}
						} else {
							this.scrollTo(this.container.scrollWidth - this.layout.delta, 0, true);
						}
					}
					this.views.show();
				}.bind(this));
		}
	}

	current(){
		var visible = this.visible();
		if(visible.length){
			// Current is the last visible view
			return visible[visible.length-1];
		}
		return null;
	}

	clear () {

		// this.q.clear();

		if (this.views) {
			this.views.hide();
			this.scrollTo(0,0, true);
			this.views.clear();
		}
	}

	currentLocation(){
		this.updateLayout();
		if (this.isPaginated && this.settings.axis === "horizontal") {
			this.location = this.paginatedLocation();
		} else {
			this.location = this.scrolledLocation();
		}
		return this.location;
	}

	scrolledLocation() {
		let visible = this.visible();
		let container = this.container.getBoundingClientRect();
		let pageHeight = (container.height < window.innerHeight) ? container.height : window.innerHeight;
		let pageWidth = (container.width < window.innerWidth) ? container.width : window.innerWidth;
		let vertical = (this.settings.axis === "vertical");
		(this.settings.direction === "rtl"); 
			
		let offset = 0;
		let used = 0;

		if(this.settings.fullsize) {
			offset = vertical ? window.scrollY : window.scrollX;
		}

		let sections = visible.map((view) => {
			let {index, url} = view.section;
			let position = view.position();
			let width = view.width();
			let height = view.height();

			let startPos;
			let endPos;
			let stopPos;
			let totalPages;

			if (vertical) {
				startPos = offset + container.top - position.top + used;
				endPos = startPos + pageHeight - used;
				totalPages = this.layout.count(height, pageHeight).pages;
				stopPos = pageHeight;
			} else {
				startPos = offset + container.left - position.left + used;
				endPos = startPos + pageWidth - used;
				totalPages = this.layout.count(width, pageWidth).pages;
				stopPos = pageWidth;
			}

			let currPage = Math.ceil(startPos / stopPos);
			let pages = [];
			let endPage = Math.ceil(endPos / stopPos);

			// Reverse page counts for horizontal rtl
			if (this.settings.direction === "rtl" && !vertical) {
				let tempStartPage = currPage;
				currPage = totalPages - endPage;
				endPage = totalPages - tempStartPage;
			}

			pages = [];
			for (var i = currPage; i <= endPage; i++) {
				let pg = i + 1;
				pages.push(pg);
			}

			let mapping = this.mapping.page(view.contents, view.section.cfiBase, startPos, endPos);

			return {
				index,
				url,
				pages,
				totalPages,
				mapping
			};
		});

		return sections;
	}

	paginatedLocation(){
		let visible = this.visible();
		let container = this.container.getBoundingClientRect();

		let left = 0;
		let used = 0;

		if(this.settings.fullsize) {
			left = window.scrollX;
		}

		let sections = visible.map((view) => {
			let {index, url} = view.section;
			let offset;
			let position = view.position();
			let width = view.width();

			// Find mapping
			let start;
			let end;
			let pageWidth;

			if (this.settings.direction === "rtl") {
				offset = container.right - left;
				pageWidth = Math.min(Math.abs(offset - position.left), this.layout.width) - used;
				end = position.width - (position.right - offset) - used;
				start = end - pageWidth;
			} else {
				offset = container.left + left;
				pageWidth = Math.min(position.right - offset, this.layout.width) - used;
				start = offset - position.left + used;
				end = start + pageWidth;
			}

			used += pageWidth;

			let mapping = this.mapping.page(view.contents, view.section.canonical, start, end);

			let totalPages = this.layout.count(width).pages;
			let startPage = Math.floor(start / this.layout.pageWidth);
			let pages = [];
			let endPage = Math.floor(end / this.layout.pageWidth);
			
			// start page should not be negative
			if (startPage < 0) {
				startPage = 0;
				endPage = endPage + 1;
			}

			// Reverse page counts for rtl
			if (this.settings.direction === "rtl") {
				let tempStartPage = startPage;
				startPage = totalPages - endPage;
				endPage = totalPages - tempStartPage;
			}


			for (var i = startPage + 1; i <= endPage; i++) {
				let pg = i;
				pages.push(pg);
			}

			return {
				index,
				url,
				pages,
				totalPages,
				mapping
			};
		});

		return sections;
	}

	isVisible(view, offsetPrev, offsetNext, _container){
		var position = view.position();
		var container = _container || this.bounds();

		if(this.settings.axis === "horizontal" &&
			position.right > container.left - offsetPrev &&
			position.left < container.right + offsetNext) {

			return true;

		} else if(this.settings.axis === "vertical" &&
			position.bottom > container.top - offsetPrev &&
			position.top < container.bottom + offsetNext) {

			return true;
		}

		return false;

	}

	visible(){
		var container = this.bounds();
		var views = this.views.displayed();
		var viewsLength = views.length;
		var visible = [];
		var isVisible;
		var view;

		for (var i = 0; i < viewsLength; i++) {
			view = views[i];
			isVisible = this.isVisible(view, 0, 0, container);

			if(isVisible === true) {
				visible.push(view);
			}

		}
		return visible;
	}

	scrollBy(x, y, silent){
		let dir = this.settings.direction === "rtl" ? -1 : 1;

		if(silent) {
			this.ignore = true;
		}

		if(!this.settings.fullsize) {
			if(x) this.container.scrollLeft += x * dir;
			if(y) this.container.scrollTop += y;
		} else {
			window.scrollBy(x * dir, y * dir);
		}
		this.scrolled = true;
	}

	scrollTo(x, y, silent){
		if(silent) {
			this.ignore = true;
		}

		if(!this.settings.fullsize) {
			this.container.scrollLeft = x;
			this.container.scrollTop = y;
		} else {
			window.scrollTo(x,y);
		}
		this.scrolled = true;
	}

	onScroll(){
		let scrollTop;
		let scrollLeft;

		if(!this.settings.fullsize) {
			scrollTop = this.container.scrollTop;
			scrollLeft = this.container.scrollLeft;
		} else {
			scrollTop = window.scrollY;
			scrollLeft = window.scrollX;
		}

		this.scrollTop = scrollTop;
		this.scrollLeft = scrollLeft;

		if(!this.ignore) {
			this.emit(EVENTS.MANAGERS.SCROLL, {
				top: scrollTop,
				left: scrollLeft
			});

			clearTimeout(this.afterScrolled);
			this.afterScrolled = setTimeout(function () {
				this.emit(EVENTS.MANAGERS.SCROLLED, {
					top: this.scrollTop,
					left: this.scrollLeft
				});
			}.bind(this), 20);



		} else {
			this.ignore = false;
		}

	}

	bounds() {
		var bounds;

		bounds = this.stage.bounds();

		return bounds;
	}

	applyLayout(layout) {

		this.layout = layout;
		this.updateLayout();
		if (this.views && this.views.length > 0 && this.layout.name === "pre-paginated") {
			this.display(this.views.first().section);
		}
		 // this.manager.layout(this.layout.format);
	}

	updateLayout() {

		if (!this.stage) {
			return;
		}

		this._stageSize = this.stage.size();

		if(!this.isPaginated) {
			this.layout.calculate(this._stageSize.width, this._stageSize.height);
		} else {
			this.layout.calculate(
				this._stageSize.width,
				this._stageSize.height,
				this.settings.gap
			);

			// Set the look ahead offset for what is visible
			this.settings.offset = this.layout.delta / this.layout.divisor;

			// this.stage.addStyleRules("iframe", [{"margin-right" : this.layout.gap + "px"}]);

		}

		// Set the dimensions for views
		this.viewSettings.width = this.layout.width;
		this.viewSettings.height = this.layout.height;

		this.setLayout(this.layout);
	}

	setLayout(layout){

		this.viewSettings.layout = layout;

		this.mapping = new Mapping(layout.props, this.settings.direction, this.settings.axis);

		if(this.views) {

			this.views.forEach(function(view){
				if (view) {
					view.setLayout(layout);
				}
			});

		}

	}

	updateWritingMode(mode) {
		this.writingMode = mode;
	}

	updateAxis(axis, forceUpdate){

		if (!forceUpdate && axis === this.settings.axis) {
			return;
		}

		this.settings.axis = axis;

		this.stage && this.stage.axis(axis);

		this.viewSettings.axis = axis;

		if (this.mapping) {
			this.mapping = new Mapping(this.layout.props, this.settings.direction, this.settings.axis);
		}

		if (this.layout) {
			if (axis === "vertical") {
				this.layout.spread("none");
			} else {
				this.layout.spread(this.layout.settings.spread);
			}
		}
	}

	updateFlow(flow, defaultScrolledOverflow="auto"){
		let isPaginated = (flow === "paginated" || flow === "auto");

		this.isPaginated = isPaginated;

		if (flow === "scrolled-doc" ||
				flow === "scrolled-continuous" ||
				flow === "scrolled") {
			this.updateAxis("vertical");
		} else {
			this.updateAxis("horizontal");
		}

		this.viewSettings.flow = flow;

		if (!this.settings.overflow) {
			this.overflow = isPaginated ? "hidden" : defaultScrolledOverflow;
		} else {
			this.overflow = this.settings.overflow;
		}

		this.stage && this.stage.overflow(this.overflow);

		this.updateLayout();

	}

	getContents(){
		var contents = [];
		if (!this.views) {
			return contents;
		}
		this.views.forEach(function(view){
			const viewContents = view && view.contents;
			if (viewContents) {
				contents.push(viewContents);
			}
		});
		return contents;
	}

	direction(dir="ltr") {
		this.settings.direction = dir;

		this.stage && this.stage.direction(dir);

		this.viewSettings.direction = dir;

		this.updateLayout();
	}

	isRendered() {
		return this.rendered;
	}

	scale(s) {
		this.settings.scale = s;

		if (this.stage) {
			this.stage.scale(s);
		}
	}
}

//-- Enable binding events to Manager
EventEmitter(DefaultViewManager.prototype);

// easing equations from https://github.com/danro/easing-js/blob/master/easing.js
const PI_D2 = (Math.PI / 2);
const EASING_EQUATIONS = {
		easeOutSine: function (pos) {
				return Math.sin(pos * PI_D2);
		},
		easeInOutSine: function (pos) {
				return (-0.5 * (Math.cos(Math.PI * pos) - 1));
		},
		easeInOutQuint: function (pos) {
				if ((pos /= 0.5) < 1) {
						return 0.5 * Math.pow(pos, 5);
				}
				return 0.5 * (Math.pow((pos - 2), 5) + 2);
		},
		easeInCubic: function(pos) {
			return Math.pow(pos, 3);
  	}
};

class Snap {
	constructor(manager, options) {

		this.settings = extend({
			duration: 80,
			minVelocity: 0.2,
			minDistance: 10,
			easing: EASING_EQUATIONS['easeInCubic']
		}, options || {});

		this.supportsTouch = this.supportsTouch();

		if (this.supportsTouch) {
			this.setup(manager);
		}
	}

	setup(manager) {
		this.manager = manager;

		this.layout = this.manager.layout;

		this.fullsize = this.manager.settings.fullsize;
		if (this.fullsize) {
			this.element = this.manager.stage.element;
			this.scroller = window;
			this.disableScroll();
		} else {
			this.element = this.manager.stage.container;
			this.scroller = this.element;
			this.element.style["WebkitOverflowScrolling"] = "touch";
		}

		// this.overflow = this.manager.overflow;

		// set lookahead offset to page width
		this.manager.settings.offset = this.layout.width;
		this.manager.settings.afterScrolledTimeout = this.settings.duration * 2;

		this.isVertical = this.manager.settings.axis === "vertical";

		// disable snapping if not paginated or axis in not horizontal
		if (!this.manager.isPaginated || this.isVertical) {
			return;
		}

		this.touchCanceler = false;
		this.resizeCanceler = false;
		this.snapping = false;


		this.scrollLeft;
		this.scrollTop;

		this.startTouchX = undefined;
		this.startTouchY = undefined;
		this.startTime = undefined;
		this.endTouchX = undefined;
		this.endTouchY = undefined;
		this.endTime = undefined;

		this.addListeners();
	}

	supportsTouch() {
		if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
			return true;
		}

		return false;
	}

	disableScroll() {
		this.element.style.overflow = "hidden";
	}

	enableScroll() {
		this.element.style.overflow = "";
	}

	addListeners() {
		this._onResize = this.onResize.bind(this);
		window.addEventListener('resize', this._onResize);

		this._onScroll = this.onScroll.bind(this);
		this.scroller.addEventListener('scroll', this._onScroll);

		this._onTouchStart = this.onTouchStart.bind(this);
		this.scroller.addEventListener('touchstart', this._onTouchStart, { passive: true });
		this.on('touchstart', this._onTouchStart);

		this._onTouchMove = this.onTouchMove.bind(this);
		this.scroller.addEventListener('touchmove', this._onTouchMove, { passive: true });
		this.on('touchmove', this._onTouchMove);

		this._onTouchEnd = this.onTouchEnd.bind(this);
		this.scroller.addEventListener('touchend', this._onTouchEnd, { passive: true });
		this.on('touchend', this._onTouchEnd);

		this._afterDisplayed = this.afterDisplayed.bind(this);
		this.manager.on(EVENTS.MANAGERS.ADDED, this._afterDisplayed);
	}

	removeListeners() {
		window.removeEventListener('resize', this._onResize);
		this._onResize = undefined;

		this.scroller.removeEventListener('scroll', this._onScroll);
		this._onScroll = undefined;

		this.scroller.removeEventListener('touchstart', this._onTouchStart, { passive: true });
		this.off('touchstart', this._onTouchStart);
		this._onTouchStart = undefined;

		this.scroller.removeEventListener('touchmove', this._onTouchMove, { passive: true });
		this.off('touchmove', this._onTouchMove);
		this._onTouchMove = undefined;

		this.scroller.removeEventListener('touchend', this._onTouchEnd, { passive: true });
		this.off('touchend', this._onTouchEnd);
		this._onTouchEnd = undefined;

		this.manager.off(EVENTS.MANAGERS.ADDED, this._afterDisplayed);
		this._afterDisplayed = undefined;
	}

	afterDisplayed(view) {
		let contents = view.contents;
		["touchstart", "touchmove", "touchend"].forEach((e) => {
			contents.on(e, (ev) => this.triggerViewEvent(ev, contents));
		});
	}

	triggerViewEvent(e, contents){
		this.emit(e.type, e, contents);
	}

	onScroll(e) {
		this.scrollLeft = this.fullsize ? window.scrollX : this.scroller.scrollLeft;
		this.scrollTop = this.fullsize ? window.scrollY : this.scroller.scrollTop;
	}

	onResize(e) {
		this.resizeCanceler = true;
	}

	onTouchStart(e) {
		let { screenX, screenY } = e.touches[0];

		if (this.fullsize) {
			this.enableScroll();
		}

		this.touchCanceler = true;

		if (!this.startTouchX) {
			this.startTouchX = screenX;
			this.startTouchY = screenY;
			this.startTime = this.now();
		}

		this.endTouchX = screenX;
		this.endTouchY = screenY;
		this.endTime = this.now();
	}

	onTouchMove(e) {
		let { screenX, screenY } = e.touches[0];
		let deltaY = Math.abs(screenY - this.endTouchY);

		this.touchCanceler = true;


		if (!this.fullsize && deltaY < 10) {
			this.element.scrollLeft -= screenX - this.endTouchX;
		}

		this.endTouchX = screenX;
		this.endTouchY = screenY;
		this.endTime = this.now();
	}

	onTouchEnd(e) {
		if (this.fullsize) {
			this.disableScroll();
		}

		this.touchCanceler = false;

		let swipped = this.wasSwiped();

		if (swipped !== 0) {
			this.snap(swipped);
		} else {
			this.snap();
		}

		this.startTouchX = undefined;
		this.startTouchY = undefined;
		this.startTime = undefined;
		this.endTouchX = undefined;
		this.endTouchY = undefined;
		this.endTime = undefined;
	}

	wasSwiped() {
		let snapWidth = this.layout.pageWidth * this.layout.divisor;
		let distance = (this.endTouchX - this.startTouchX);
		let absolute = Math.abs(distance);
		let time = this.endTime - this.startTime;
		let velocity = (distance / time);
		let minVelocity = this.settings.minVelocity;

		if (absolute <= this.settings.minDistance || absolute >= snapWidth) {
			return 0;
		}

		if (velocity > minVelocity) {
			// previous
			return -1;
		} else if (velocity < -minVelocity) {
			// next
			return 1;
		}
	}

	needsSnap() {
		let left = this.scrollLeft;
		let snapWidth = this.layout.pageWidth * this.layout.divisor;
		return (left % snapWidth) !== 0;
	}

	snap(howMany=0) {
		let left = this.scrollLeft;
		let snapWidth = this.layout.pageWidth * this.layout.divisor;
		let snapTo = Math.round(left / snapWidth) * snapWidth;

		if (howMany) {
			snapTo += (howMany * snapWidth);
		}

		return this.smoothScrollTo(snapTo);
	}

	smoothScrollTo(destination) {
		const deferred = new defer();
		const start = this.scrollLeft;
		const startTime = this.now();

		const duration = this.settings.duration;
		const easing = this.settings.easing;

		this.snapping = true;

		// add animation loop
		function tick() {
			const now = this.now();
			const time = Math.min(1, ((now - startTime) / duration));
			easing(time);


			if (this.touchCanceler || this.resizeCanceler) {
				this.resizeCanceler = false;
				this.snapping = false;
				deferred.resolve();
				return;
			}

			if (time < 1) {
					window.requestAnimationFrame(tick.bind(this));
					this.scrollTo(start + ((destination - start) * time), 0);
			} else {
					this.scrollTo(destination, 0);
					this.snapping = false;
					deferred.resolve();
			}
		}

		tick.call(this);

		return deferred.promise;
	}

	scrollTo(left=0, top=0) {
		if (this.fullsize) {
			window.scroll(left, top);
		} else {
			this.scroller.scrollLeft = left;
			this.scroller.scrollTop = top;
		}
	}

	now() {
		return ('now' in window.performance) ? performance.now() : new Date().getTime();
	}

	destroy() {
		if (!this.scroller) {
			return;
		}

		if (this.fullsize) {
			this.enableScroll();
		}

		this.removeListeners();

		this.scroller = undefined;
	}
}

EventEmitter(Snap.prototype);

// import debounce from "lodash/debounce";

class ContinuousViewManager extends DefaultViewManager {
	constructor(options) {
		super(options);

		this.name = "continuous";

		this.settings = extend(this.settings || {}, {
			infinite: true,
			overflow: undefined,
			axis: undefined,
			writingMode: undefined,
			flow: "scrolled",
			offset: 500,
			offsetDelta: 250,
			width: undefined,
			height: undefined,
			snap: false,
			afterScrolledTimeout: 10,
			allowScriptedContent: false
		});

		extend(this.settings, options.settings || {});

		// Gap can be 0, but defaults doesn't handle that
		if (options.settings.gap != "undefined" && options.settings.gap === 0) {
			this.settings.gap = options.settings.gap;
		}

		this.viewSettings = {
			ignoreClass: this.settings.ignoreClass,
			axis: this.settings.axis,
			flow: this.settings.flow,
			layout: this.layout,
			width: 0,
			height: 0,
			forceEvenPages: false,
			allowScriptedContent: this.settings.allowScriptedContent,
			hooks: this.hooks,
			request: this.request
		};

		this.scrollTop = 0;
		this.scrollLeft = 0;
	}

	display(section, target){
		return DefaultViewManager.prototype.display.call(this, section, target)
			.then(function () {
				return this.fill();
			}.bind(this));
	}

	fill(_full){
		var full = _full || new defer();

		this.q.enqueue(() => {
			return this.check();
		}).then((result) => {
			if (result) {
				this.fill(full);
			} else {
				full.resolve();
			}
		});

		return full.promise;
	}

	moveTo(offset){
		// var bounds = this.stage.bounds();
		// var dist = Math.floor(offset.top / bounds.height) * bounds.height;
		var distX = 0,
				distY = 0;

		if(!this.isPaginated) {
			distY = offset.top;
			offset.top+this.settings.offsetDelta;
		} else {
			distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;
			distX+this.settings.offsetDelta;
		}

		if (distX > 0 || distY > 0) {
			this.scrollBy(distX, distY, true);
		}
	}

	afterResized(view){
		this.emit(EVENTS.MANAGERS.RESIZE, view.section);
	}

	// Remove Previous Listeners if present
	removeShownListeners(view){

		// view.off("shown", this.afterDisplayed);
		// view.off("shown", this.afterDisplayedAbove);
		view.onDisplayed = function(){};

	}

	add(section){
		var view = this.createView(section);

		this.views.append(view);

		view.on(EVENTS.VIEWS.RESIZED, (bounds) => {
			view.expanded = true;
		});

		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});

		view.on(EVENTS.VIEWS.WRITING_MODE, (mode) => {
			this.updateWritingMode(mode);
		});

		// view.on(EVENTS.VIEWS.SHOWN, this.afterDisplayed.bind(this));
		view.onDisplayed = this.afterDisplayed.bind(this);
		view.onResize = this.afterResized.bind(this);

		return view.display(this.request);
	}

	append(section){
		var view = this.createView(section);

		view.on(EVENTS.VIEWS.RESIZED, (bounds) => {
			view.expanded = true;
		});

		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});

		view.on(EVENTS.VIEWS.WRITING_MODE, (mode) => {
			this.updateWritingMode(mode);
		});

		this.views.append(view);

		view.onDisplayed = this.afterDisplayed.bind(this);

		return view;
	}

	prepend(section){
		var view = this.createView(section);

		view.on(EVENTS.VIEWS.RESIZED, (bounds) => {
			this.counter(bounds);
			view.expanded = true;
		});

		view.on(EVENTS.VIEWS.AXIS, (axis) => {
			this.updateAxis(axis);
		});

		view.on(EVENTS.VIEWS.WRITING_MODE, (mode) => {
			this.updateWritingMode(mode);
		});

		this.views.prepend(view);

		view.onDisplayed = this.afterDisplayed.bind(this);

		return view;
	}

	counter(bounds){
		if(this.settings.axis === "vertical") {
			this.scrollBy(0, bounds.heightDelta, true);
		} else {
			this.scrollBy(bounds.widthDelta, 0, true);
		}
	}

	update(_offset){
		var container = this.bounds();
		var views = this.views.all();
		var viewsLength = views.length;
		var offset = typeof _offset != "undefined" ? _offset : (this.settings.offset || 0);
		var isVisible;
		var view;

		var updating = new defer();
		var promises = [];
		for (var i = 0; i < viewsLength; i++) {
			view = views[i];

			isVisible = this.isVisible(view, offset, offset, container);

			if(isVisible === true) {
				// console.log("visible " + view.index, view.displayed);

				if (!view.displayed) {
					let displayed = view.display(this.request)
						.then(function (view) {
							view.show();
						}, (err) => {
							view.hide();
						});
					promises.push(displayed);
				} else {
					view.show();
				}
			} else {
				this.q.enqueue(view.destroy.bind(view));
				// console.log("hidden " + view.index, view.displayed);

				clearTimeout(this.trimTimeout);
				this.trimTimeout = setTimeout(function(){
					this.q.enqueue(this.trim.bind(this));
				}.bind(this), 250);
			}

		}

		if(promises.length){
			return Promise.all(promises)
				.catch((err) => {
					updating.reject(err);
				});
		} else {
			updating.resolve();
			return updating.promise;
		}

	}

	check(_offsetLeft, _offsetTop){
		var checking = new defer();
		var newViews = [];

		var horizontal = (this.settings.axis === "horizontal");
		var delta = this.settings.offset || 0;

		if (_offsetLeft && horizontal) {
			delta = _offsetLeft;
		}

		if (_offsetTop && !horizontal) {
			delta = _offsetTop;
		}

		var bounds = this._bounds; // bounds saved this until resize

		let offset = horizontal ? this.scrollLeft : this.scrollTop;
		let visibleLength = horizontal ? Math.floor(bounds.width) : bounds.height;
		let contentLength = horizontal ? this.container.scrollWidth : this.container.scrollHeight;
		let writingMode = (this.writingMode && this.writingMode.indexOf("vertical") === 0) ? "vertical" : "horizontal";
		let rtlScrollType = this.settings.rtlScrollType;
		let rtl = this.settings.direction === "rtl";

		if (!this.settings.fullsize) {
			// Scroll offset starts at width of element
			if (rtl && rtlScrollType === "default" && writingMode === "horizontal") {
				offset = contentLength - visibleLength - offset;
			}
			// Scroll offset starts at 0 and goes negative
			if (rtl && rtlScrollType === "negative" && writingMode === "horizontal") {
				offset = offset * -1;
			}
		} else {
			// Scroll offset starts at 0 and goes negative
			if ((horizontal && rtl && rtlScrollType === "negative") ||
				(!horizontal && rtl && rtlScrollType === "default")) {
				offset = offset * -1;
			}
		}

		let prepend = () => {
			let first = this.views.first();
			let prev = first && prevSection(first.section, this.sections);

			if(prev) {
				newViews.push(this.prepend(prev));
			}
		};

		let append = () => {
			let last = this.views.last();
			let next = last && nextSection(last.section, this.sections);
			
			if(next) {
				newViews.push(this.append(next));
			}

		};

		let end = offset + visibleLength + delta;
		let start = offset - delta;

		if (end >= contentLength) {
			append();
		}
		
		if (start < 0) {
			prepend();
		}
		

		let promises = newViews.map((view) => {
			return view.display(this.request);
		});

		if(newViews.length){
			return Promise.all(promises)
				.then(() => {
					return this.check();
				})
				.then(() => {
					// Check to see if anything new is on screen after rendering
					return this.update(delta);
				}, (err) => {
					return err;
				});
		} else {
			this.q.enqueue(function(){
				this.update();
			}.bind(this));
			checking.resolve(false);
			return checking.promise;
		}


	}

	trim(){
		var task = new defer();
		var displayed = this.views.displayed();
		var first = displayed[0];
		var last = displayed[displayed.length-1];
		var firstIndex = this.views.indexOf(first);
		var lastIndex = this.views.indexOf(last);
		var above = this.views.slice(0, firstIndex);
		var below = this.views.slice(lastIndex+1);

		// Erase all but last above
		for (var i = 0; i < above.length-1; i++) {
			this.erase(above[i], above);
		}

		// Erase all except first below
		for (var j = 1; j < below.length; j++) {
			this.erase(below[j]);
		}

		task.resolve();
		return task.promise;
	}

	erase(view, above){ //Trim

		var prevTop;
		var prevLeft;

		if(!this.settings.fullsize) {
			prevTop = this.container.scrollTop;
			prevLeft = this.container.scrollLeft;
		} else {
			prevTop = window.scrollY;
			prevLeft = window.scrollX;
		}

		var bounds = view.bounds();

		this.views.remove(view);
		
		if(above) {
			if (this.settings.axis === "vertical") {
				this.scrollTo(0, prevTop - bounds.height, true);
			} else {
				if(this.settings.direction === 'rtl') {
					if (!this.settings.fullsize) {
						this.scrollTo(prevLeft, 0, true);					
					} else {
						this.scrollTo(prevLeft + Math.floor(bounds.width), 0, true);
					}
				} else {
					this.scrollTo(prevLeft - Math.floor(bounds.width), 0, true);
				}
			}
		}

	}

	addEventListeners(stage){

		window.addEventListener("unload", function(e){
			this.ignore = true;
			// this.scrollTo(0,0);
			this.destroy();
		}.bind(this));

		this.addScrollListeners();

		if (this.isPaginated && this.settings.snap) {
			this.snapper = new Snap(this, this.settings.snap && (typeof this.settings.snap === "object") && this.settings.snap);
		}
	}

	addScrollListeners() {
		var scroller;

		this.tick = requestAnimationFrame$1;

		let dir = this.settings.direction === "rtl" && this.settings.rtlScrollType === "default" ? -1 : 1;

		this.scrollDeltaVert = 0;
		this.scrollDeltaHorz = 0;

		if(!this.settings.fullsize) {
			scroller = this.container;
			this.scrollTop = this.container.scrollTop;
			this.scrollLeft = this.container.scrollLeft;
		} else {
			scroller = window;
			this.scrollTop = window.scrollY * dir;
			this.scrollLeft = window.scrollX * dir;
		}

		this._onScroll = this.onScroll.bind(this);
		scroller.addEventListener("scroll", this._onScroll);
		this._scrolled = debounce(this.scrolled.bind(this), 30);
		// this.tick.call(window, this.onScroll.bind(this));

		this.didScroll = false;

	}

	removeEventListeners(){
		var scroller;

		if(!this.settings.fullsize) {
			scroller = this.container;
		} else {
			scroller = window;
		}

		scroller.removeEventListener("scroll", this._onScroll);
		this._onScroll = undefined;
	}

	onScroll(){
		let scrollTop;
		let scrollLeft;
		let dir = this.settings.direction === "rtl" && this.settings.rtlScrollType === "default" ? -1 : 1;

		if(!this.settings.fullsize) {
			scrollTop = this.container.scrollTop;
			scrollLeft = this.container.scrollLeft;
		} else {
			scrollTop = window.scrollY * dir;
			scrollLeft = window.scrollX * dir;
		}

		this.scrollTop = scrollTop;
		this.scrollLeft = scrollLeft;

		if(!this.ignore) {

			this._scrolled();

		} else {
			this.ignore = false;
		}

		this.scrollDeltaVert += Math.abs(scrollTop-this.prevScrollTop);
		this.scrollDeltaHorz += Math.abs(scrollLeft-this.prevScrollLeft);

		this.prevScrollTop = scrollTop;
		this.prevScrollLeft = scrollLeft;

		clearTimeout(this.scrollTimeout);
		this.scrollTimeout = setTimeout(function(){
			this.scrollDeltaVert = 0;
			this.scrollDeltaHorz = 0;
		}.bind(this), 150);

		clearTimeout(this.afterScrolled);

		this.didScroll = false;

	}

	scrolled() {

		this.q.enqueue(function() {
			return this.check();
		}.bind(this));

		this.emit(EVENTS.MANAGERS.SCROLL, {
			top: this.scrollTop,
			left: this.scrollLeft
		});

		clearTimeout(this.afterScrolled);
		this.afterScrolled = setTimeout(function () {

			// Don't report scroll if we are about the snap
			if (this.snapper && this.snapper.supportsTouch && this.snapper.needsSnap()) {
				return;
			}

			this.emit(EVENTS.MANAGERS.SCROLLED, {
				top: this.scrollTop,
				left: this.scrollLeft
			});

		}.bind(this), this.settings.afterScrolledTimeout);
	}

	next(){

		let delta = this.layout.props.name === "pre-paginated" &&
								this.layout.props.spread ? this.layout.props.delta * 2 : this.layout.props.delta;

		if(!this.views.length) return;

		if(this.isPaginated && this.settings.axis === "horizontal") {

			this.scrollBy(delta, 0, true);

		} else {

			this.scrollBy(0, this.layout.height, true);

		}

		this.q.enqueue(function() {
			return this.check();
		}.bind(this));
	}

	prev(){

		let delta = this.layout.props.name === "pre-paginated" &&
								this.layout.props.spread ? this.layout.props.delta * 2 : this.layout.props.delta;

		if(!this.views.length) return;

		if(this.isPaginated && this.settings.axis === "horizontal") {

			this.scrollBy(-delta, 0, true);

		} else {

			this.scrollBy(0, -this.layout.height, true);

		}

		this.q.enqueue(function() {
			return this.check();
		}.bind(this));
	}

	updateFlow(flow){
		if (this.rendered && this.snapper) {
			this.snapper.destroy();
			this.snapper = undefined;
		}

		super.updateFlow(flow, "scroll");

		if (this.rendered && this.isPaginated && this.settings.snap) {
			this.snapper = new Snap(this, this.settings.snap && (typeof this.settings.snap === "object") && this.settings.snap);
		}
	}

	destroy(){
		super.destroy();

		if (this.snapper) {
			this.snapper.destroy();
		}
	}

}

/**
 * Locators
 * @param {object} [manifest]
 */
class Locators {
	constructor(publication) {
		if (publication) {
			this.unpack(publication);
		}
	}

	unpack(publication) {
		if (publication.locations) {
			this.unpackLocations(publication.locations);
		}

		if (publication.pagelist) {
			this.unpackPages(publication.pagelist);
		}
	}

	unpackLocations(locations) {
		if (!locations) {
			return;
		}
		this.locations = [];
		for (const [key, location] of locations) {
			if (EpubCFI.prototype.isCfiString(location)) {
				this.locations.push(location);
			} else if (location.cfi) {
				this.locations.push(location.cfi);				
			}
		}
		this.totalLocations = this.locations.length - 1;
	}

	unpackPages(pages) {
		if (!pages) {
			return;
		}
		this.pages = pages;
		this.pageLocations = [];
		
		this.firstPage = parseInt(this.pages[0]);
		this.lastPage = parseInt(this.pages[this.pages.length-1]);
		this.totalPages = this.lastPage - this.firstPage;

		pages.forEach((item) => {
			if (item.cfi) {
				this.pageLocations.push(item.cfi);
			}
		});
	}

	/**
	 * Get a location from an EpubCFI
	 * @param {EpubCFI} cfi
	 * @return {number}
	 */
	locationFromCfi(cfi){
		let loc;
		if (EpubCFI.prototype.isCfiString(cfi)) {
			cfi = new EpubCFI(cfi);
		}
		// Check if the location has not been set yet
		if(this.locations.length === 0) {
			return -1;
		}

		loc = locationOf(cfi, this.locations, EpubCFI.prototype.compare);

		if (loc > this.totalLocations) {
			return this.totalLocations;
		}

		return loc;
	}

	/**
	 * Get a percentage position in locations from an EpubCFI
	 * @param {EpubCFI} cfi
	 * @return {number}
	 */
	percentageFromCfi(cfi) {
		if(!this.locations || this.locations.length === 0) {
			return null;
		}
		// Find closest cfi
		let loc = this.locationFromCfi(cfi);
		// Get percentage in total
		return this.percentageFromLocation(loc);
	}

	/**
	 * Get a percentage position from a location index
	 * @param {number} location
	 * @return {number}
	 */
	percentageFromLocation(loc) {
		if (!loc || !this.totalLocations) {
			return 0;
		}

		return (loc / this.totalLocations);
	}

	/**
	 * Get an EpubCFI from location index
	 * @param {number} loc
	 * @return {EpubCFI} cfi
	 */
	cfiFromLocation(loc){
		var cfi = -1;
		// check that pg is an int
		if(typeof loc != "number"){
			loc = parseInt(loc);
		}

		if(loc >= 0 && loc < this.locations.length) {
			cfi = this.locations[loc];
		}

		return cfi;
	}

	/**
	 * Get an EpubCFI from location percentage
	 * @param {number} percentage
	 * @return {EpubCFI} cfi
	 */
	cfiFromPercentage(percentage){
		let loc;
		if (percentage > 1) {
			console.warn("Normalize cfiFromPercentage value to between 0 - 1");
		}

		// Make sure 1 goes to very end
		if (percentage >= 1) {
			let cfi = new EpubCFI(this.locations[this.totalLocations]);
			cfi.collapse();
			return cfi.toString();
		}

		loc = Math.ceil(this.totalLocations * percentage);
		return this.cfiFromLocation(loc);
	}

	/**
	 * Get a PageList result from a EpubCFI
	 * @param  {string} cfi EpubCFI String
	 * @return {string} page
	 */
	pageFromCfi(cfi){
		var pg = -1;

		// Check if the pageList has not been set yet
		if(!this.pageLocations || this.pageLocations.length === 0) {
			return -1;
		}

		// check if the cfi is in the location list
		var index = indexOfSorted(cfi, this.pageLocations, EpubCFI.prototype.compare);
		if(index != -1) {
			pg = this.pages[index];
		} else {
			// Otherwise add it to the list of locations
			// Insert it in the correct position in the locations page
			index = locationOf(cfi, this.pageLocations, EpubCFI.prototype.compare);
			// Get the page at the location just before the new one, or return the first
			pg = index-1 >= 0 ? this.pages[index-1] : this.pages[0];
			if(pg !== undefined) ; else {
				pg = -1;
			}

		}
		return pg;
	}

	/**
	 * Get an EpubCFI from a Page List Item
	 * @param  {string} pg
	 * @return {string} cfi
	 */
	cfiFromPage(pg){
		var cfi = -1;
		// check that pg is an int
		if(typeof pg != "number"){
			pg = parseInt(pg);
		}

		// check if the cfi is in the page list
		// Pages could be unsorted.
		var index = this.pages.indexOf(pg);
		if(index != -1) {
			cfi = this.pageLocations[index];
		}
		// TODO: handle pages not in the list
		return cfi;
	}

	/**
	 * Get a Page from Book percentage
	 * @param  {number} percent
	 * @return {string} page
	 */
	pageFromPercentage(percent){
		var pg = Math.round(this.totalPages * percent);
		return pg;
	}

	/**
	 * Returns a value between 0 - 1 corresponding to the location of a page
	 * @param  {int} pg the page
	 * @return {number} percentage
	 */
	percentageFromPage(pg){
		var percentage = (pg - this.firstPage) / this.totalPages;
		return Math.round(percentage * 1000) / 1000;
	}

	/**
	 * Returns a value between 0 - 1 corresponding to the location of a cfi
	 * @param  {string} cfi EpubCFI String
	 * @return {number} percentage
	 */
	percentagePageFromCfi(cfi){
		var pg = this.pageFromCfi(cfi);
		var percentage = this.percentageFromPage(pg);
		return percentage;
	}

	destroy () {

	}
}

EventEmitter(Locators.prototype);

/**
 * Displays an Epub as a series of Views for each Section.
 * Requires Manager and View class to handle specifics of rendering
 * the section content.
 * @class
 * @param {Publication} publication
 * @param {object} [options]
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {string} [options.ignoreClass] class for the cfi parser to ignore
 * @param {string | function | object} [options.manager='default']
 * @param {string | function} [options.view='iframe']
 * @param {string} [options.layout] layout to force
 * @param {string} [options.spread] force spread value
 * @param {number} [options.minSpreadWidth] overridden by spread: none (never) / both (always)
 * @param {string} [options.stylesheet] url of stylesheet to be injected
 * @param {boolean} [options.resizeOnOrientationChange] false to disable orientation events
 * @param {string} [options.script] url of script to be injected
 * @param {boolean | object} [options.snap=false] use snap scrolling
 * @param {string} [options.defaultDirection='ltr'] default text direction
 * @param {boolean} [options.allowScriptedContent=false] enable running scripts in content
 * @param {string | Element} [options.element] element to render to
 */
class Rendition {
	constructor(publication, options) {

		this.settings = extend(this.settings || {}, {
			width: null,
			height: null,
			ignoreClass: "",
			manager: "default",
			view: "iframe",
			flow: null,
			layout: null,
			spread: null,
			minSpreadWidth: 800,
			stylesheet: null,
			resizeOnOrientationChange: true,
			script: null,
			snap: false,
			defaultDirection: "ltr",
			allowScriptedContent: false,
			request: null,
			canonical: null
		});

		extend(this.settings, options);

		if (typeof(this.settings.manager) === "object") {
			this.manager = this.settings.manager;
		}

		this.publication = publication || new Publication();

		if (!this.settings.request && typeof this.publication.request !== "undefined") {
			this.settings.request = this.publication.request.bind(this.publication);
		}

		/**
		 * Adds Hook methods to the Rendition prototype
		 * @member {object} hooks
		 * @property {Hook} hooks.content
		 * @memberof Rendition
		 */
		this.hooks = {};
		this.hooks.display = new Hook(this);
		this.hooks.document = new Hook(this);
		this.hooks.serialize = new Hook(this);
		this.hooks.content = new Hook(this);
		this.hooks.unloaded = new Hook(this);
		this.hooks.layout = new Hook(this);
		this.hooks.render = new Hook(this);
		this.hooks.show = new Hook(this);

		this.hooks.content.register(this.handleLinks.bind(this));
		this.hooks.content.register(this.passEvents.bind(this));
		this.hooks.content.register(this.adjustImages.bind(this));
		this.hooks.content.register(this.preloadImages.bind(this));

		this.hooks.document.register(this.injectIdentifier.bind(this));
		this.hooks.document.register(this.injectBase.bind(this));
		this.hooks.document.register(this.injectCanonical.bind(this));
		if (this.settings.stylesheet) {
			this.hooks.document.register(this.injectStylesheet.bind(this));
		}

		if (this.settings.script) {
			this.hooks.document.register(this.injectScript.bind(this));
		}

		/**
		 * @member {Themes} themes
		 * @memberof Rendition
		 */
		this.themes = new Themes(this);

		/**
		 * @member {Annotations} annotations
		 * @memberof Rendition
		 */
		this.annotations = new Annotations(this);

		this.epubcfi = new EpubCFI();

		this.q = new Queue(this);

		/**
		 * A Rendered Location Range
		 * @typedef location
		 * @type {Object}
		 * @property {object} start
		 * @property {string} start.index
		 * @property {string} start.url
		 * @property {object} start.displayed
		 * @property {EpubCFI} start.cfi
		 * @property {number} start.location
		 * @property {number} start.percentage
		 * @property {number} start.displayed.page
		 * @property {number} start.displayed.total
		 * @property {object} end
		 * @property {string} end.index
		 * @property {string} end.url
		 * @property {object} end.displayed
		 * @property {EpubCFI} end.cfi
		 * @property {number} end.location
		 * @property {number} end.percentage
		 * @property {number} end.displayed.page
		 * @property {number} end.displayed.total
		 * @property {boolean} atStart
		 * @property {boolean} atEnd
		 * @memberof Rendition
		 */
		this.location = undefined;

		// Hold queue until publication is opened
		this.q.enqueue(this.publication.opened);

		// Block the queue until rendering is started
		/**
		 * @member {promise} started returns after the rendition has started
		 * @memberof Rendition
		 */
		this.started = this.q.enqueue(this.start);

		// Start rendering
		if (this.settings.element) {
			this.renderTo(this.settings.element);
		}
	}

	/**
	 * Set the manager function
	 * @param {function} manager
	 */
	setManager(manager) {
		this.manager = manager;
	}

	/**
	 * Require the manager from passed string, or as a class function
	 * @param  {string|object} manager [description]
	 * @return {method}
	 */
	requireManager(manager) {
		var viewManager;

		// If manager is a string, try to load from imported managers
		if (typeof manager === "string" && manager === "default") {
			viewManager = DefaultViewManager;
		} else if (typeof manager === "string" && manager === "continuous") {
			viewManager = ContinuousViewManager;
		} else {
			// otherwise, assume we were passed a class function
			viewManager = manager;
		}

		return viewManager;
	}

	/**
	 * Require the view from passed string, or as a class function
	 * @param  {string|object} view
	 * @return {view}
	 */
	requireView(view) {
		var View;

		// If view is a string, try to load from imported views,
		if (typeof view == "string" && view === "iframe") {
			View = IframeView;
		} else {
			// otherwise, assume we were passed a class function
			View = view;
		}

		return View;
	}

	/**
	 * Start the rendering
	 * @return {Promise} rendering has started
	 */
	start(){
		// TODO: Move this Fred
		if (!this.settings.layout && (this.publication.metadata.layout === "pre-paginated" || this.publication.displayOptions.fixedLayout === "true")) {
			this.settings.layout = "pre-paginated";
		}
		switch(this.publication.metadata.spread) {
			case 'none':
				this.settings.spread = 'none';
				break;
			case 'both':
				this.settings.spread = true;
				break;
		}

		if(!this.manager) {
			this.ViewManager = this.requireManager(this.settings.manager);
			this.View = this.requireView(this.settings.view);

			this.manager = new this.ViewManager({
				view: this.View,
				queue: this.q,
				hooks: this.hooks,
				request: this.settings.request,
				sections: this.publication.sections,
				settings: this.settings
			});
		}

		this.locators = new Locators(this.publication);

		this.direction(this.publication.metadata.direction || this.settings.defaultDirection);

		// Parse metadata to get layout props
		this.settings.globalLayoutProperties = this.determineLayoutProperties(this.publication.metadata);

		this.flow(this.settings.globalLayoutProperties.flow);

		this.layout(this.settings.globalLayoutProperties);

		// Listen for displayed views
		this.manager.on(EVENTS.MANAGERS.ADDED, this.afterDisplayed.bind(this));
		this.manager.on(EVENTS.MANAGERS.REMOVED, this.afterRemoved.bind(this));

		// Listen for resizing
		this.manager.on(EVENTS.MANAGERS.RESIZED, this.onResized.bind(this));

		// Listen for rotation
		this.manager.on(EVENTS.MANAGERS.ORIENTATION_CHANGE, this.onOrientationChange.bind(this));

		// Listen for scroll changes
		this.manager.on(EVENTS.MANAGERS.SCROLLED, this.reportLocation.bind(this));

		/**
		 * Emit that rendering has started
		 * @event started
		 * @memberof Rendition
		 */
		this.emit(EVENTS.RENDITION.STARTED);
	}

	/**
	 * Call to attach the container to an element in the dom
	 * Container must be attached before rendering can begin
	 * @param  {element} element to attach to
	 * @return {Promise}
	 */
	renderTo(element){
		return this.q.enqueue(function () {
			// Start rendering
			this.manager.render(element, {
				"width"  : this.settings.width,
				"height" : this.settings.height
			});

			/**
			 * Emit that rendering has attached to an element
			 * @event attached
			 * @memberof Rendition
			 */
			this.emit(EVENTS.RENDITION.ATTACHED);

		}.bind(this));
	}

	/**
	 * Alias for renderTo
	 * @alias renderTo
	 * @param  {element} element to attach to
	 * @return {Promise}
	 */
	attachTo(element) {
		return this.renderTo(element);
	}

	/**
	 * Display a point in the publication
	 * The request will be added to the rendering Queue,
	 * so it will wait until publication is opened, rendering started
	 * and all other rendering tasks have finished to be called.
	 * @param  {string} target Url or EpubCFI
	 * @return {Promise}
	 */
	display(target){
		if (this.displaying) {
			this.displaying.resolve();
		}
		return this.q.enqueue(this._display, target);
	}

	/**
	 * Tells the manager what to display immediately
	 * @private
	 * @param  {string} target Url or EpubCFI
	 * @return {Promise}
	 */
	_display(target){
		if (!this.publication) {
			return;
		}
		const displaying = new defer();
		const displayed = displaying.promise;

		this.displaying = displaying;

		// Check if this is a publication percentage
		if (this.locators.locations.length && isFloat(target)) {
			target = this.locators.cfiFromPercentage(parseFloat(target));
		}

		if (typeof target === "undefined") {
			target = 0;
		}

		let resource = this.findResource(target);

		if(!resource){
			displaying.reject(new Error("No Section Found"));
			return displayed;
		}

		const section = new Section(resource);

		this.manager.display(section, target)
			.then(() => {
				displaying.resolve(section);
				this.displaying = undefined;

				/**
				 * Emit that a section has been displayed
				 * @event displayed
				 * @param {Section} section
				 * @memberof Rendition
				 */
				this.emit(EVENTS.RENDITION.DISPLAYED, section);
				this.reportLocation();
			}, (err) => {
				/**
				 * Emit that has been an error displaying
				 * @event displayError
				 * @param {Section} section
				 * @memberof Rendition
				 */
				this.emit(EVENTS.RENDITION.DISPLAY_ERROR, err);
			});

		return displayed;
	}

	findResource(target) {
		let resource;

		if(this.epubcfi.isCfiString(target)) {
			let cfi = new EpubCFI(target);
			let spineItem = cfi.base.steps[1];
			if (spineItem.id) {
				return this.publication.uniqueResources.id(spineItem.id);
			} else if (spineItem.index) {
				return this.publication.uniqueResources.find((r) => {
					return r.cfiPos === spineItem.index;
				});
			}
		}

		if (isNumber(target)) {
			resource = this.publication.sections.get(target);
		} else {
			resource = this.publication.uniqueResources.get(target);
		}
		return resource;
	}

	/*
	render(view, show) {

		// view.onLayout = this.layout.format.bind(this.layout);
		view.create();

		// Fit to size of the container, apply padding
		this.manager.resizeView(view);

		// Render Chain
		return view.section.render(this.book.request)
			.then(function(contents){
				return view.load(contents);
			}.bind(this))
			.then(function(doc){
				return this.hooks.content.trigger(view, this);
			}.bind(this))
			.then(function(){
				this.layout.format(view.contents);
				return this.hooks.layout.trigger(view, this);
			}.bind(this))
			.then(function(){
				return view.display();
			}.bind(this))
			.then(function(){
				return this.hooks.render.trigger(view, this);
			}.bind(this))
			.then(function(){
				if(show !== false) {
					this.q.enqueue(function(view){
						view.show();
					}, view);
				}
				// this.map = new Map(view, this.layout);
				this.hooks.show.trigger(view, this);
				this.trigger("rendered", view.section);

			}.bind(this))
			.catch(function(e){
				this.trigger("loaderror", e);
			}.bind(this));

	}
	*/

	/**
	 * Report what section has been displayed
	 * @private
	 * @param  {*} view
	 */
	afterDisplayed(view){

		view.on(EVENTS.VIEWS.MARK_CLICKED, (cfiRange, data) => this.triggerMarkEvent(cfiRange, data, view.contents));

		this.hooks.render.trigger(view, this)
			.then(() => {
				if (view.contents) {
					this.hooks.content.trigger(view.contents, view.section, this).then(() => {
						/**
						 * Emit that a section has been rendered
						 * @event rendered
						 * @param {Section} section
						 * @param {View} view
						 * @memberof Rendition
						 */
						this.emit(EVENTS.RENDITION.RENDERED, view.section, view);
					});
				} else {
					this.emit(EVENTS.RENDITION.RENDERED, view.section, view);
				}
			});

	}

	/**
	 * Report what has been removed
	 * @private
	 * @param  {*} view
	 */
	afterRemoved(view){
		this.hooks.unloaded.trigger(view, this).then(() => {
			/**
			 * Emit that a section has been removed
			 * @event removed
			 * @param {Section} section
			 * @param {View} view
			 * @memberof Rendition
			 */
			this.emit(EVENTS.RENDITION.REMOVED, view.section, view);
		});
	}

	/**
	 * Report resize events and display the last seen location
	 * @private
	 */
	onResized(size, epubcfi){

		/**
		 * Emit that the rendition has been resized
		 * @event resized
		 * @param {number} width
		 * @param {height} height
		 * @param {string} epubcfi (optional)
		 * @memberof Rendition
		 */
		this.emit(EVENTS.RENDITION.RESIZED, {
			width: size.width,
			height: size.height
		}, epubcfi);

		if (this.location && this.location.start) {
			this.display(epubcfi || this.location.start.cfi);
		}

	}

	/**
	 * Report orientation events and display the last seen location
	 * @private
	 */
	onOrientationChange(orientation){
		/**
		 * Emit that the rendition has been rotated
		 * @event orientationchange
		 * @param {string} orientation
		 * @memberof Rendition
		 */
		this.emit(EVENTS.RENDITION.ORIENTATION_CHANGE, orientation);
	}

	/**
	 * Move the Rendition to a specific offset
	 * Usually you would be better off calling display()
	 * @param {object} offset
	 */
	moveTo(offset){
		this.manager.moveTo(offset);
	}

	/**
	 * Trigger a resize of the views
	 * @param {number} [width]
	 * @param {number} [height]
	 * @param {string} [epubcfi] (optional)
	 */
	resize(width, height, epubcfi){
		if (width) {
			this.settings.width = width;
		}
		if (height) {
			this.settings.height = height;
		}
		this.manager.resize(width, height, epubcfi);
	}

	/**
	 * Clear all rendered views
	 */
	clear(){
		this.manager.clear();
	}

	/**
	 * Go to the next "page" in the rendition
	 * @return {Promise}
	 */
	next(){
		return this.q.enqueue(this.manager.next.bind(this.manager))
			.then(this.reportLocation.bind(this));
	}

	/**
	 * Go to the previous "page" in the rendition
	 * @return {Promise}
	 */
	prev(){
		return this.q.enqueue(this.manager.prev.bind(this.manager))
			.then(this.reportLocation.bind(this));
	}

	//-- http://www.idpf.org/epub/301/spec/epub-publications.html#meta-properties-rendering
	/**
	 * Determine the Layout properties from metadata and settings
	 * @private
	 * @param  {object} metadata
	 * @return {object} properties
	 */
	determineLayoutProperties(metadata){
		var properties;
		var layout = this.settings.layout || metadata.layout || "reflowable";
		var spread = this.settings.spread || metadata.spread || "auto";
		var orientation = this.settings.orientation || metadata.orientation || "auto";
		var flow = this.settings.flow || metadata.flow || "auto";
		var viewport = metadata.viewport || "";
		var minSpreadWidth = this.settings.minSpreadWidth || metadata.minSpreadWidth || 800;
		var direction = this.settings.direction || metadata.direction || "ltr";

		properties = {
			layout : layout,
			spread : spread,
			orientation : orientation,
			flow : flow,
			viewport : viewport,
			minSpreadWidth : minSpreadWidth,
			direction: direction
		};

		return properties;
	}

	/**
	 * Adjust the flow of the rendition to paginated or scrolled
	 * (scrolled-continuous vs scrolled-doc are handled by different view managers)
	 * @param  {string} flow
	 */
	flow(flow){
		var _flow = flow;
		if (flow === "scrolled" ||
				flow === "scrolled-doc" ||
				flow === "scrolled-continuous") {
			_flow = "scrolled";
		}

		if (flow === "auto" || flow === "paginated") {
			_flow = "paginated";
		}

		this.settings.flow = flow;

		if (this._layout) {
			this._layout.flow(_flow);
		}

		if (this.manager && this._layout) {
			this.manager.applyLayout(this._layout);
		}

		if (this.manager) {
			this.manager.updateFlow(_flow);
		}

		if (this.manager && this.manager.isRendered() && this.location) {
			this.manager.clear();
			this.display(this.location.start.cfi);
		}
	}

	/**
	 * Adjust the layout of the rendition to reflowable or pre-paginated
	 * @param  {object} settings
	 */
	layout(settings){
		if (settings) {
			this._layout = new Layout(settings);
			this._layout.spread(settings.spread, this.settings.minSpreadWidth);

			// this.mapping = new Mapping(this._layout.props);

			this._layout.on(EVENTS.LAYOUT.UPDATED, (props, changed) => {
				this.emit(EVENTS.RENDITION.LAYOUT, props, changed);
			});
		}

		if (this.manager && this._layout) {
			this.manager.applyLayout(this._layout);
		}

		return this._layout;
	}

	/**
	 * Adjust if the rendition uses spreads
	 * @param  {string} spread none | auto (TODO: implement landscape, portrait, both)
	 * @param  {int} [min] min width to use spreads at
	 */
	spread(spread, min){

		this.settings.spread = spread;

		if (min) {
			this.settings.minSpreadWidth = min;
		}

		if (this._layout) {
			this._layout.spread(spread, min);
		}

		if (this.manager && this.manager.isRendered()) {
			this.manager.updateLayout();
		}
	}

	/**
	 * Adjust the direction of the rendition
	 * @param  {string} dir
	 */
	direction(dir){

		this.settings.direction = dir || "ltr";

		if (this.manager) {
			this.manager.direction(this.settings.direction);
		}

		if (this.manager && this.manager.isRendered() && this.location) {
			this.manager.clear();
			this.display(this.location.start.cfi);
		}
	}

	/**
	 * Report the current location
	 * @fires relocated
	 * @fires locationChanged
	 */
	reportLocation(){
		return this.q.enqueue(function reportedLocation(){
			requestAnimationFrame(function reportedLocationAfterRAF() {
				var location = this.manager.currentLocation();
				if (location && location.then && typeof location.then === "function") {
					location.then(function(result) {
						let located = this.located(result);

						if (!located || !located.start || !located.end) {
							return;
						}

						this.location = located;

						this.emit(EVENTS.RENDITION.LOCATION_CHANGED, {
							index: this.location.start.index,
							url: this.location.start.url,
							start: this.location.start.cfi,
							end: this.location.end.cfi,
							percentage: this.location.start.percentage
						});

						this.emit(EVENTS.RENDITION.RELOCATED, this.location);
					}.bind(this));
				} else if (location) {
					let located = this.located(location);

					if (!located || !located.start || !located.end) {
						return;
					}

					this.location = located;

					/**
					 * @event locationChanged
					 * @deprecated
					 * @type {object}
					 * @property {number} index
					 * @property {string} url
					 * @property {EpubCFI} start
					 * @property {EpubCFI} end
					 * @property {number} percentage
					 * @memberof Rendition
					 */
					this.emit(EVENTS.RENDITION.LOCATION_CHANGED, {
						index: this.location.start.index,
						url: this.location.start.url,
						start: this.location.start.cfi,
						end: this.location.end.cfi,
						percentage: this.location.start.percentage
					});

					/**
					 * @event relocated
					 * @type {displayedLocation}
					 * @memberof Rendition
					 */
					this.emit(EVENTS.RENDITION.RELOCATED, this.location);
				}
			}.bind(this));
		}.bind(this));
	}

	/**
	 * Get the Current Location object
	 * @return {displayedLocation | promise} location (may be a promise)
	 */
	currentLocation(){
		var location = this.manager.currentLocation();
		if (location && location.then && typeof location.then === "function") {
			location.then(function(result) {
				let located = this.located(result);
				return located;
			}.bind(this));
		} else if (location) {
			let located = this.located(location);
			return located;
		}
	}

	/**
	 * Creates a Rendition#locationRange from location
	 * passed by the Manager
	 * @returns {displayedLocation}
	 * @private
	 */
	located(location){
		if (!location.length) {
			return {};
		}
		let start = location[0];
		let end = location[location.length-1];

		let located = {
			start: {
				index: start.index,
				url: start.url,
				cfi: start.mapping.start,
				displayed: {
					page: start.pages[0] || 1,
					total: start.totalPages
				}
			},
			end: {
				index: end.index,
				url: end.url,
				cfi: end.mapping.end,
				displayed: {
					page: end.pages[end.pages.length-1] || 1,
					total: end.totalPages
				}
			}
		};

		if (this.locators.locations.length) {
			let locationStart = this.locators.locationFromCfi(start.mapping.start);
			let locationEnd = this.locators.locationFromCfi(end.mapping.end);

			if (locationStart != null) {
				located.start.location = locationStart;
				located.start.percentage = this.locators.percentageFromLocation(locationStart);
			}
			if (locationEnd != null) {
				located.end.location = locationEnd;
				located.end.percentage = this.locators.percentageFromLocation(locationEnd);
			}
		}

		if (this.locators.pages.length) {
			let pageStart = this.locators.pageFromCfi(start.mapping.start);
			let pageEnd = this.locators.pageFromCfi(end.mapping.end);

			if (pageStart != -1) {
				located.start.page = pageStart;
			}
			if (pageEnd != -1) {
				located.end.page = pageEnd;
			}
		}

		if (end.index === this.publication.sections.last().index &&
			located.end.displayed.page >= located.end.displayed.total) {
			located.atEnd = true;
		}

		if (start.index === this.publication.sections.first().index &&
			located.start.displayed.page === 1) {
			located.atStart = true;
		}

		return located;
	}

	/**
	 * Remove and Clean Up the Rendition
	 */
	destroy(){
		// Clear the queue
		this.q.clear();
		this.q = undefined;

		this.manager && this.manager.destroy();

		this.publication = undefined;

		// this.views = null;

		this.hooks.display.clear();
		// this.hooks.serialize.clear();
		this.hooks.content.clear();
		this.hooks.layout.clear();
		this.hooks.render.clear();
		this.hooks.show.clear();
		this.hooks = {};

		this.themes.destroy();
		this.themes = undefined;

		this.epubcfi = undefined;

		// this.starting = undefined;
		// this.started = undefined;


	}

	/**
	 * Pass the events from a view's Contents
	 * @private
	 * @param  {Contents} view contents
	 */
	passEvents(contents){
		DOM_EVENTS.forEach((e) => {
			contents.on(e, (ev) => this.triggerViewEvent(ev, contents));
		});

		contents.on(EVENTS.CONTENTS.SELECTED, (e) => this.triggerSelectedEvent(e, contents));
	}

	/**
	 * Emit events passed by a view
	 * @private
	 * @param  {event} e
	 */
	triggerViewEvent(e, contents){
		this.emit(e.type, e, contents);
	}

	/**
	 * Emit a selection event's CFI Range passed from a a view
	 * @private
	 * @param  {string} cfirange
	 */
	triggerSelectedEvent(cfirange, contents){
		/**
		 * Emit that a text selection has occurred
		 * @event selected
		 * @param {string} cfirange
		 * @param {Contents} contents
		 * @memberof Rendition
		 */
		this.emit(EVENTS.RENDITION.SELECTED, cfirange, contents);
	}

	/**
	 * Emit a markClicked event with the cfiRange and data from a mark
	 * @private
	 * @param  {EpubCFI} cfirange
	 */
	triggerMarkEvent(cfiRange, data, contents){
		/**
		 * Emit that a mark was clicked
		 * @event markClicked
		 * @param {EpubCFI} cfirange
		 * @param {object} data
		 * @param {Contents} contents
		 * @memberof Rendition
		 */
		this.emit(EVENTS.RENDITION.MARK_CLICKED, cfiRange, data, contents);
	}

	/**
	 * Get a Range from a Visible CFI
	 * @param  {string} cfi EpubCfi String
	 * @param  {string} ignoreClass
	 * @return {range}
	 */
	getRange(cfi, ignoreClass){
		var _cfi = new EpubCFI(cfi);
		var found = this.manager.visible().filter(function (view) {
			if(_cfi.spinePos === view.index) return true;
		});

		// Should only every return 1 item
		if (found.length) {
			return found[0].contents.range(_cfi, ignoreClass);
		}
	}

	/**
	 * Hook to adjust images to fit in columns
	 * @param  {Contents} contents
	 * @private
	 */
	adjustImages(contents) {

		if (this._layout.name === "pre-paginated") {
			return new Promise(function(resolve){
				resolve();
			});
		}

		let computed = contents.window.getComputedStyle(contents.content, null);
		let height = (contents.content.offsetHeight - (parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom))) * .95;
		let horizontalPadding = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);

		contents.addStylesheetRules({
			"img" : {
				"max-width": (this._layout.columnWidth ? (this._layout.columnWidth - horizontalPadding) + "px" : "100%") + "!important",
				"max-height": height + "px" + "!important",
				"object-fit": "contain",
				"page-break-inside": "avoid",
				"break-inside": "avoid",
				"box-sizing": "border-box"
			},
			"svg" : {
				"max-width": (this._layout.columnWidth ? (this._layout.columnWidth - horizontalPadding) + "px" : "100%") + "!important",
				"max-height": height + "px" + "!important",
				"page-break-inside": "avoid",
				"break-inside": "avoid"
			}
		});

		return new Promise(function(resolve, reject){
			// Wait to apply
			setTimeout(function() {
				resolve();
			}, 1);
		});
	}

	/**
	 * Get the Contents object of each rendered view
	 * @returns {Contents[]}
	 */
	getContents () {
		return this.manager ? this.manager.getContents() : [];
	}

	/**
	 * Get the views member from the manager
	 * @returns {Views}
	 */
	views () {
		let views = this.manager ? this.manager.views : undefined;
		return views || [];
	}

	/**
	 * Hook to handle link clicks in rendered content
	 * @param  {Contents} contents
	 * @param  {Section} section
	 * @private
	 */
	handleLinks(contents, section) {
		if (contents) {
			contents.on(EVENTS.CONTENTS.LINK_CLICKED, (href) => {
				let resolved = this.publication.resolve(href);
				this.display(resolved);
			});
		}
	}

	preloadImages(contents) {
		let doc = contents.document;
		let imgs = doc.querySelectorAll("img");
		for (const img of imgs) {
			img.loading = "lazy";
		}
	}

	/**
	 * Hook to handle injecting stylesheet before
	 * a Section is serialized
	 * @param  {Contents} contents
	 * @param  {Section} section
	 * @private
	 */
	injectStylesheet(doc, section) {
		style.setAttribute("type", "text/css");
		style.setAttribute("rel", "stylesheet");
		style.setAttribute("href", this.settings.stylesheet);
		doc.getElementsByTagName("head")[0].appendChild(style);
	}

	/**
	 * Hook to handle injecting scripts before
	 * a Section is serialized
	 * @param  {Contents} contents
	 * @param  {Section} section
	 * @private
	 */
	injectScript(doc, section) {
		let script = doc.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", this.settings.script);
		script.textContent = " "; // Needed to prevent self closing tag
		doc.getElementsByTagName("head")[0].appendChild(script);
	}

	/**
	 * Hook to handle the document identifier before
	 * a Section is serialized
	 * @param  {Contents} contents
	 * @param  {Section} section
	 * @private
	 */
	injectIdentifier(doc, section) {
		let ident = this.publication.metadata.identifier;
		let isXml = isXMLDocument(doc);
		if (ident) {
			let meta = isXml ? doc.createElementNS(XML_NS, "meta") : doc.createElement("meta");
			meta.setAttribute("name", "dc.relation.ispartof");
			meta.setAttribute("content", ident);
			doc.getElementsByTagName("head")[0].appendChild(meta);
		}
	}

	injectBase(doc, section) {
		let head = doc.querySelector("head");
		let base = doc.querySelector("base");
		let isXml = isXMLDocument(doc);

		if (!base) {
			base = isXml ? doc.createElementNS(XML_NS, "base") : doc.createElement("base");
			head.insertBefore(base, head.firstChild);
		}

		base.setAttribute("href", section.url);
	}
	
	injectCanonical(doc, section) {
		let url = this.canonical(section.url);
		let head = doc.querySelector("head");
		let link = doc.querySelector("link[rel='canonical']");
		let isXml = isXMLDocument(doc);
	
		if (!link) {
			link = isXml ? doc.createElementNS(XML_NS, "link") : doc.createElement("link");
			head.appendChild(link);
		}
	
		link.setAttribute("rel", "canonical");
		link.setAttribute("href", url);
	}
	
	canonical(path) {
		let url = path;
		
		if (!path) {
			return "";
		}
	
		if (this.settings.canonical) {
			url = this.settings.canonical(path);
		} else {
			url = this.publication.resolve(path, true);
		}

		return url;
	}

	scale(s) {
		return this.manager && this.manager.scale(s);
	}
}

//-- Enable binding events to Renderer
EventEmitter(Rendition.prototype);

/**
 * Handles Parsing and Accessing an Epub Container
 * @class
 * @param {document} [containerDocument] xml document
 */
class Container {
	constructor(containerDocument) {
		this.packagePath = "";
		this.directory = "";
		this.encoding = "";

		if (containerDocument) {
			this.parse(containerDocument);
		}
	}

	/**
	 * Parse the Container XML
	 * @param  {document} containerDocument
	 */
	parse(containerDocument){
		//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
		var rootfile;

		if(!containerDocument) {
			throw new Error("Container File Not Found");
		}

		rootfile = qs(containerDocument, "rootfile");

		if(!rootfile) {
			throw new Error("No RootFile Found");
		}

		this.packagePath = rootfile.getAttribute("full-path");
		this.directory = directory(this.packagePath);
		this.encoding = containerDocument.xmlEncoding;
	}

	destroy() {
		this.packagePath = undefined;
		this.directory = undefined;
		this.encoding = undefined;
	}
}

/**
 * Open Packaging Format Parser
 * @class
 * @param {document} packageDocument OPF XML
 */
class Packaging {
	constructor(packageDocument) {
		this.manifest = {};
		this.navPath = "";
		this.ncxPath = "";
		this.coverPath = "";
		this.spineNodeIndex = 0;
		this.spine = [];
		this.metadata = {};

		if (packageDocument) {
			this.parse(packageDocument);
		}
	}

	/**
	 * Parse OPF XML
	 * @param  {document} packageDocument OPF XML
	 * @return {object} parsed package parts
	 */
	parse(packageDocument){
		if(!packageDocument) {
			throw new Error("Package File Not Found");
		}

		const metadataNode = qs(packageDocument, "metadata");
		if(!metadataNode) {
			throw new Error("No Metadata Found");
		}

		const manifestNode = qs(packageDocument, "manifest");
		if(!manifestNode) {
			throw new Error("No Manifest Found");
		}

		const spineNode = qs(packageDocument, "spine");
		if(!spineNode) {
			throw new Error("No Spine Found");
		}

		this.metadata = this.parseMetadata(metadataNode);
		this.manifest = this.parseManifest(manifestNode);
		this.navPath = this.findNavPath(manifestNode);
		this.ncxPath = this.findNcxPath(manifestNode, spineNode);
		this.coverPath = this.findCoverPath(packageDocument);

		this.spineNodeIndex = indexOfElementNode(spineNode);
		this.manifestNodeIndex = indexOfElementNode(manifestNode);

		this.spine = this.parseSpine(spineNode, this.manifest);

		this.uniqueIdentifier = this.findUniqueIdentifier(packageDocument);

		this.metadata.direction = spineNode.getAttribute("page-progression-direction");

		return {
			"metadata" : this.metadata,
			"spine"    : this.spine,
			"manifest" : this.manifest,
			"navPath"  : this.navPath,
			"ncxPath"  : this.ncxPath,
			"coverPath": this.coverPath,
			"spineNodeIndex" : this.spineNodeIndex,
			"manifestNodeIndex" : this.manifestNodeIndex,
		};
	}

	/**
	 * Parse Metadata
	 * @private
	 * @param  {node} xml
	 * @return {object} metadata
	 */
	parseMetadata(xml){
		const metadata = {};

		metadata.title = this.getElementText(xml, "title");
		metadata.creator = this.getElementText(xml, "creator");
		metadata.description = this.getElementText(xml, "description");

		metadata.pubdate = this.getElementText(xml, "date");

		metadata.publisher = this.getElementText(xml, "publisher");

		metadata.identifier = this.getElementText(xml, "identifier");
		metadata.language = this.getElementText(xml, "language");
		metadata.rights = this.getElementText(xml, "rights");

		metadata.modified_date = this.getPropertyText(xml, "dcterms:modified");

		metadata.layout = this.getPropertyText(xml, "rendition:layout");
		metadata.orientation = this.getPropertyText(xml, "rendition:orientation");
		metadata.flow = this.getPropertyText(xml, "rendition:flow");
		metadata.viewport = this.getPropertyText(xml, "rendition:viewport");
		metadata.media_active_class = this.getPropertyText(xml, "media:active-class");
		metadata.spread = this.getPropertyText(xml, "rendition:spread");
		// metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");

		return metadata;
	}

	/**
	 * Parse Manifest
	 * @private
	 * @param  {node} manifestXml
	 * @return {object} manifest
	 */
	parseManifest(manifestXml) {
		var manifest = {};

		//-- Turn items into an array
		// var selected = manifestXml.querySelectorAll("item");
		var selected = qsa(manifestXml, "item");
		var items = Array.prototype.slice.call(selected);

		//-- Create an object with the id as key
		items.forEach((item) => {
			var id = item.getAttribute("id"),
				href = item.getAttribute("href") || "",
				type = item.getAttribute("media-type") || "",
				overlay = item.getAttribute("media-overlay") || "",
				properties = item.getAttribute("properties") || "";

			manifest[id] = {
				"href": href,
				// "url" : href,
				"type": type,
				"overlay": overlay,
				"properties": properties.length ? properties.split(" ") : []
			};

		});

		return manifest;

	}

	/**
	 * Parse Spine
	 * @private
	 * @param  {node} spineXml
	 * @param  {Packaging.manifest} manifest
	 * @return {object} spine
	 */
	parseSpine(spineXml, manifest){
		const spine = [];

		const selected = qsa(spineXml, "itemref");
		const items = Array.prototype.slice.call(selected);

		// var epubcfi = new EpubCFI();

		//-- Add to array to maintain ordering and cross reference with manifest
		items.forEach((item, index) => {
			const idref = item.getAttribute("idref");
			const props = item.getAttribute("properties") || "";
			const propArray = props.length ? props.split(" ") : [];

			const itemref = {
				"idref" : idref,
				"linear" : item.getAttribute("linear") || "yes",
				"properties" : propArray,
				"index" : index
			};
			spine.push(itemref);
		});

		return spine;
	}

	/**
	 * Find Unique Identifier
	 * @private
	 * @param  {node} packageXml
	 * @return {string} Unique Identifier text
	 */
	findUniqueIdentifier(packageXml){
		const uniqueIdentifierId = packageXml.documentElement.getAttribute("unique-identifier");
		if (!uniqueIdentifierId) {
			return "";
		}
		const identifier = packageXml.getElementById(uniqueIdentifierId);
		if (!identifier) {
			return "";
		}

		if (identifier.localName === "identifier" && identifier.namespaceURI === "http://purl.org/dc/elements/1.1/") {
			return identifier.childNodes.length > 0 ? identifier.childNodes[0].nodeValue.trim() : "";
		}

		return "";
	}

	/**
	 * Find TOC NAV
	 * @private
	 * @param {element} manifestNode
	 * @return {string}
	 */
	findNavPath(manifestNode){
		// Find item with property "nav"
		// Should catch nav regardless of order
		const node = qsp(manifestNode, "item", {"properties":"nav"});
		return node ? node.getAttribute("href") : false;
	}

	/**
	 * Find TOC NCX
	 * media-type="application/x-dtbncx+xml" href="toc.ncx"
	 * @private
	 * @param {element} manifestNode
	 * @param {element} spineNode
	 * @return {string}
	 */
	findNcxPath(manifestNode, spineNode){
		let node = qsp(manifestNode, "item", {"media-type":"application/x-dtbncx+xml"});

		// If we can't find the toc by media-type then try to look for id of the item in the spine attributes as
		// according to http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.4.1.2,
		// "The item that describes the NCX must be referenced by the spine toc attribute."
		if (!node) {
			const tocId = spineNode.getAttribute("toc");
			if(tocId) {
				node = manifestNode.querySelector(`#${tocId}`);
			}
		}

		return node ? node.getAttribute("href") : false;
	}

	/**
	 * Find the Cover Path
	 * <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
	 * Fallback for Epub 2.0
	 * @private
	 * @param  {node} packageXml
	 * @return {string} href
	 */
	findCoverPath(packageXml){
		// Try parsing cover with epub 3.
		const node = qsp(packageXml, "item", {"properties":"cover-image"});
		if (node) {
			return node.getAttribute("href");
		}
		
		// Fallback to epub 2.
		const metaCover = qsp(packageXml, "meta", {"name":"cover"});

		if (metaCover) {
			const coverId = metaCover.getAttribute("content");
			const cover = packageXml.getElementById(coverId);
			return cover ? cover.getAttribute("href") : "";
		} else {
			return false;
		}
	}

	/**
	 * Get text of a namespaced element
	 * @private
	 * @param  {node} xml
	 * @param  {string} tag
	 * @return {string} text
	 */
	getElementText(xml, tag){
		const found = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", tag);

		if(!found || found.length === 0) return "";

		const el = found[0];

		if(el.childNodes.length){
			return el.childNodes[0].nodeValue;
		}

		return "";
	}

	/**
	 * Get text by property
	 * @private
	 * @param  {node} xml
	 * @param  {string} property
	 * @return {string} text
	 */
	getPropertyText(xml, property){
		const el = qsp(xml, "meta", {"property":property});

		if(el && el.childNodes.length){
			return el.childNodes[0].nodeValue;
		}

		return "";
	}

	destroy() {
		this.manifest = undefined;
		this.navPath = undefined;
		this.ncxPath = undefined;
		this.coverPath = undefined;
		this.spineNodeIndex = undefined;
		this.spine = undefined;
		this.metadata = undefined;
	}
}

/**
 * Navigation Parser
 * @param {document} xml navigation html / xhtml / ncx
 */
class Navigation {
	constructor(xml) {
		this.toc = [];
		this.tocByHref = {};
		this.tocById = {};

		this.landmarks = [];
		this.landmarksByType = {};

		this.length = 0;
		if (xml) {
			this.parse(xml);
		}
	}

	/**
	 * Parse out the navigation items
	 * @param {document} xml navigation html / xhtml / ncx
	 */
	parse(xml) {
		let isXml = xml.nodeType;
		let html;
		let ncx;

		if (isXml) {
			html = qs(xml, "html");
			ncx = qs(xml, "ncx");
		}

		if (!isXml) {
			this.toc = this.load(xml);
		} else if(html) {
			this.toc = this.parseNav(xml);
			this.landmarks = this.parseLandmarks(xml);
		} else if(ncx){
			this.toc = this.parseNcx(xml);
		}

		this.length = 0;

		this.unpack(this.toc);
	}

	/**
	 * Unpack navigation items
	 * @private
	 * @param  {array} toc
	 */
	unpack(toc) {
		var item;

		for (var i = 0; i < toc.length; i++) {
			item = toc[i];

			if (item.href) {
				this.tocByHref[item.href] = i;
			}

			if (item.id) {
				this.tocById[item.id] = i;
			}

			this.length++;

			if (item.children.length) {
				this.unpack(item.children);
			}
		}

	}

	/**
	 * Get an item from the navigation
	 * @param  {string} target
	 * @return {object} navItem
	 */
	get(target) {
		var index;

		if(!target) {
			return this.toc;
		}

		if(target.indexOf("#") === 0) {
			index = this.tocById[target.substring(1)];
		} else if(target in this.tocByHref){
			index = this.tocByHref[target];
		}

		return this.getByIndex(target, index, this.toc);
	}

	/**
	 * Get an item from navigation subitems recursively by index
	 * @param  {string} target
	 * @param  {number} index
	 * @param  {array} navItems
	 * @return {object} navItem
	 */
	getByIndex(target, index, navItems) {
		if (navItems.length === 0) {
			return;
		}

		const item = navItems[index];
		if (item && (target === item.id || target === item.href)) {
			return item;
		} else {
			let result;
			for (let i = 0; i < navItems.length; ++i) {
				result = this.getByIndex(target, index, navItems[i].subitems);
				if (result) {
					break;
				}
			}
			return result;
		}
	}

	/**
	 * Get a landmark by type
	 * List of types: https://idpf.github.io/epub-vocabs/structure/
	 * @param  {string} type
	 * @return {object} landmarkItem
	 */
	landmark(type) {
		var index;

		if(!type) {
			return this.landmarks;
		}

		index = this.landmarksByType[type];

		return this.landmarks[index];
	}

	/**
	 * Parse toc from a Epub > 3.0 Nav
	 * @private
	 * @param  {document} navHtml
	 * @return {array} navigation list
	 */
	parseNav(navHtml){
		var navElement = querySelectorByType(navHtml, "nav", "toc");
		var list = [];

		if (!navElement) return list;

		let navList = filterChildren(navElement, "ol", true);
		if (!navList) return list;

		list = this.parseNavList(navList);
		return list;
	}

	/**
	 * Parses lists in the toc
	 * @param  {document} navListHtml
	 * @param  {string} parent id
	 * @return {array} navigation list
	 */
	parseNavList(navListHtml, parent) {
		const result = [];

		if (!navListHtml) return result;
		if (!navListHtml.children) return result;
		
		for (let i = 0; i < navListHtml.children.length; i++) {
			const item = this.navItem(navListHtml.children[i], parent);

			if (item) {
				result.push(item);
			}
		}

		return result;
	}

	/**
	 * Create a navItem
	 * @private
	 * @param  {element} item
	 * @return {object} navItem
	 */
	navItem(item, parent) {
		let id = item.getAttribute("id") || undefined;
		let content = filterChildren(item, "a", true)
			|| filterChildren(item, "span", true);

		if (!content) {
			return;
		}

		if (!id) {
			id = 'epubjs-autogen-toc-id-' + uuid();
			item.setAttribute('id', id);
		}

		let href = content.getAttribute("href") || "";
		let name = content.textContent || "";
		let children = [];
		let nested = filterChildren(item, "ol", true);
		if (nested) {
			children = 	this.parseNavList(nested, id);
		}

		return {
			id,
			href,
			name,
			children,
			parent
		};
	}

	/**
	 * Parse landmarks from a Epub > 3.0 Nav
	 * @private
	 * @param  {document} navHtml
	 * @return {array} landmarks list
	 */
	parseLandmarks(navHtml){
		let navElement = querySelectorByType(navHtml, "nav", "landmarks");
		let navItems = navElement ? qsa(navElement, "li") : [];
		let length = navItems.length;
		let i;
		let list = [];
		let item;

		if(!navItems || length === 0) return list;

		for (i = 0; i < length; ++i) {
			item = this.landmarkItem(navItems[i]);
			if (item) {
				list.push(item);
				this.landmarksByType[item.type] = i;
			}
		}

		return list;
	}

	/**
	 * Create a landmarkItem
	 * @private
	 * @param  {element} item
	 * @return {object} landmarkItem
	 */
	landmarkItem(item){
		let content = filterChildren(item, "a", true);

		if (!content) {
			return;
		}

		let type = content.getAttributeNS("http://www.idpf.org/2007/ops", "type") || undefined;
		let href = content.getAttribute("href") || "";
		let name = content.textContent || "";

		return {
			href,
			name,
			type
		};
	}

	/**
	 * Parse from a Epub > 3.0 NC
	 * @private
	 * @param  {document} navHtml
	 * @return {array} navigation list
	 */
	parseNcx(tocXml){
		let navPoints = qsa(tocXml, "navPoint");
		let length = navPoints.length;
		let i;
		let toc = {};
		let list = [];
		let item, parent;

		if(!navPoints || length === 0) return list;

		for (i = 0; i < length; ++i) {
			item = this.ncxItem(navPoints[i]);
			toc[item.id] = item;
			if(!item.parent) {
				list.push(item);
			} else {
				parent = toc[item.parent];
				parent.children.push(item);
			}
		}

		return list;
	}

	/**
	 * Create a ncxItem
	 * @private
	 * @param  {element} item
	 * @return {object} ncxItem
	 */
	ncxItem(item){
		var id = item.getAttribute("id") || false,
				content = qs(item, "content"),
				href = content.getAttribute("src"),
				navLabel = qs(item, "navLabel"),
				name = navLabel.textContent ? navLabel.textContent : "",
				children = [],
				parentNode = item.parentNode,
				parent;

		if(parentNode && (parentNode.nodeName === "navPoint" || parentNode.nodeName.split(':').slice(-1)[0] === "navPoint")) {
			parent = parentNode.getAttribute("id");
		}

		if (!id) {
			id = 'epubjs-autogen-toc-id-' + uuid();
			item.setAttribute('id', id);
		}

		return {
			id,
			href,
			name,
			children,
			parent
		};
	}

	/**
	 * forEach pass through
	 * @param  {Function} fn function to run on each item
	 * @return {method} forEach loop
	 */
	forEach(fn) {
		return this.toc.forEach(fn);
	}

	/**
	 * Get an Array of all Table of Contents Items
	 */
	getTocArray(resolver) {
		return this.toc.map((item) => {
			let url = resolver ? resolver(item.href) : item.href;

			let obj = {
				href: url,
				name: item.name
			};

			if (item.children.length) {
				obj.children = item.children;
			}

			return obj;
		});
	}

	/**
	 * Get an Array of all landmarks
	 */
	getLandmarksArray(resolver) {
		return this.landmarks.map((item) => {
			let url = resolver ? resolver(item.href) : item.href;

			let obj = {
				href: url,
				name: item.name,
				type: item.type
			};

			return obj;
		});
	}
}

/**
 * Page List Parser
 * @param {document} [xml]
 */
class PageList {
	constructor(xml) {
		this.pages = [];
		this.locations = [];
		this.epubcfi = new EpubCFI();

		this.firstPage = 0;
		this.lastPage = 0;
		this.totalPages = 0;

		this.toc = undefined;
		this.ncx = undefined;

		if (xml) {
			this.pageList = this.parse(xml);
		}

		if(this.pageList && this.pageList.length) {
			this.process(this.pageList);
		}
	}

	/**
	 * Parse PageList Xml
	 * @param  {document} xml
	 */
	parse(xml) {
		var html = qs(xml, "html");
		var ncx = qs(xml, "ncx");

		if(html) {
			return this.parseNav(xml);
		} else if(ncx){
			return this.parseNcx(xml);
		}

	}

	/**
	 * Parse a Nav PageList
	 * @private
	 * @param  {node} navHtml
	 * @return {PageList.item[]} list
	 */
	parseNav(navHtml){
		var navElement = querySelectorByType(navHtml, "nav", "page-list");
		var navItems = navElement ? qsa(navElement, "li") : [];
		var length = navItems.length;
		var i;
		var list = [];
		var item;

		if(!navItems || length === 0) return list;

		for (i = 0; i < length; ++i) {
			item = this.item(navItems[i]);
			list.push(item);
		}

		return list;
	}

	parseNcx(navXml) {
		var list = [];
		var i = 0;
		var item;
		var pageList;
		var pageTargets;
		var length = 0;

		pageList = qs(navXml, "pageList");
		if (!pageList) return list;

		pageTargets = qsa(pageList, "pageTarget");
		length = pageTargets.length;

		if (!pageTargets || pageTargets.length === 0) {
			return list;
		}

		for (i = 0; i < length; ++i) {
			item = this.ncxItem(pageTargets[i]);
			list.push(item);
		}

		return list;
	}

	ncxItem(item) {
		var navLabel = qs(item, "navLabel");
		var navLabelText = qs(navLabel, "text");
		var pageText = navLabelText.textContent;
		var content = qs(item, "content");

		var href = content.getAttribute("src");
		var page = parseInt(pageText, 10);

		return {
			"href": href,
			"page": page,
		};
	}

	/**
	 * Page List Item
	 * @private
	 * @param  {node} item
	 * @return {object} pageListItem
	 */
	item(item){
		var content = qs(item, "a"),
				href = content.getAttribute("href") || "",
				text = content.textContent || "",
				page = parseInt(text),
				isCfi = href.indexOf("epubcfi"),
				split,
				packageUrl,
				cfi;

		if(isCfi != -1) {
			split = href.split("#");
			packageUrl = split[0];
			cfi = split.length > 1 ? split[1] : false;
			return {
				"cfi" : cfi,
				"href" : href,
				"packageUrl" : packageUrl,
				"page" : page
			};
		} else {
			return {
				"href" : href,
				"page" : page
			};
		}
	}

	/**
	 * Process pageList items
	 * @private
	 * @param  {array} pageList
	 */
	process(pageList){
		pageList.forEach(function(item){
			this.pages.push(item.page);
			if (item.cfi) {
				this.locations.push(item.cfi);
			}
		}, this);
		this.firstPage = parseInt(this.pages[0]);
		this.lastPage = parseInt(this.pages[this.pages.length-1]);
		this.totalPages = this.lastPage - this.firstPage;
	}

	/**
	 * Get a PageList result from a EpubCFI
	 * @param  {string} cfi EpubCFI String
	 * @return {number} page
	 */
	pageFromCfi(cfi){
		var pg = -1;

		// Check if the pageList has not been set yet
		if(this.locations.length === 0) {
			return -1;
		}

		// TODO: check if CFI is valid?

		// check if the cfi is in the location list
		// var index = this.locations.indexOf(cfi);
		var index = indexOfSorted$1(cfi, this.locations, this.epubcfi.compare);
		if(index != -1) {
			pg = this.pages[index];
		} else {
			// Otherwise add it to the list of locations
			// Insert it in the correct position in the locations page
			//index = EPUBJS.core.insert(cfi, this.locations, this.epubcfi.compare);
			index = locationOf(cfi, this.locations, this.epubcfi.compare);
			// Get the page at the location just before the new one, or return the first
			pg = index-1 >= 0 ? this.pages[index-1] : this.pages[0];
			if(pg !== undefined) ; else {
				pg = -1;
			}

		}
		return pg;
	}

	/**
	 * Get an EpubCFI from a Page List Item
	 * @param  {string | number} pg
	 * @return {string} cfi
	 */
	cfiFromPage(pg){
		var cfi = -1;
		// check that pg is an int
		if(typeof pg != "number"){
			pg = parseInt(pg);
		}

		// check if the cfi is in the page list
		// Pages could be unsorted.
		var index = this.pages.indexOf(pg);
		if(index != -1) {
			cfi = this.locations[index];
		}
		// TODO: handle pages not in the list
		return cfi;
	}

	/**
	 * Get a Page from Book percentage
	 * @param  {number} percent
	 * @return {number} page
	 */
	pageFromPercentage(percent){
		var pg = Math.round(this.totalPages * percent);
		return pg;
	}

	/**
	 * Returns a value between 0 - 1 corresponding to the location of a page
	 * @param  {number} pg the page
	 * @return {number} percentage
	 */
	percentageFromPage(pg){
		var percentage = (pg - this.firstPage) / this.totalPages;
		return Math.round(percentage * 1000) / 1000;
	}

	/**
	 * Returns a value between 0 - 1 corresponding to the location of a cfi
	 * @param  {string} cfi EpubCFI String
	 * @return {number} percentage
	 */
	percentageFromCfi(cfi){
		var pg = this.pageFromCfi(cfi);
		var percentage = this.percentageFromPage(pg);
		return percentage;
	}

	/**
	 * Export pages as an Array
	 * @return {array}
	 */
	toArray() {
		return this.locations;
	}

	/**
	 * Export pages as JSON
	 * @return {json}
	 */
	toJSON() {
		return this.locations;
	}

	/**
	 * Destroy
	 */
	destroy() {
		this.pages = undefined;
		this.locations = undefined;
		this.epubcfi = undefined;

		this.pageList = undefined;

		this.toc = undefined;
		this.ncx = undefined;
	}
}

/**
 * A collection of Spine Items
 */
class Spine {
	constructor(packaging) {
		this.items = undefined;
		this.manifest = undefined;
		this.spineNodeIndex = undefined;
		this.baseUrl = undefined;
		this.length = 0;
		this.readingOrder = [];
		this.resources = [];

		this.epubcfi = new EpubCFI();

		if (packaging) {
			this.unpack(packaging);
		}
	}

	/**
	 * Unpack items from a opf into spine items
	 * @param  {Packaging} packaging
	 */
	unpack(packaging) {
		this.items = packaging.spine;
		this.manifest = packaging.manifest;
		this.spineNodeIndex = packaging.spineNodeIndex;
		this.baseUrl = packaging.baseUrl || packaging.basePath || "";
		this.length = this.items.length;

		this.items.forEach( (item, index) => {
			let manifestItem = this.manifest[item.idref];

			item.id = item.idref;
			item.cfiBase = this.epubcfi.generateChapterComponent(this.spineNodeIndex, item.index, item.idref);
			item.cfiPos = index;

			if(manifestItem) {
				item.url = manifestItem.href;

				if(manifestItem.properties.length){
					item.properties.push.apply(item.properties, manifestItem.properties);
				}
			}

			if (item.linear === "yes") {
				this.readingOrder.push(item);
			} else {
				this.resources.push(item);
			}
		});
	}


	destroy() {
		this.items = undefined;
		this.manifest = undefined;
		this.spineNodeIndex = undefined;
		this.baseUrl = undefined;
		this.length = undefined;
		this.epubcfi = undefined;
		this.readingOrder = undefined;
	}
}

const CONTAINER_PATH = "META-INF/container.xml";
const IBOOKS_DISPLAY_OPTIONS_PATH = "META-INF/com.apple.ibooks.display-options.xml";
const INPUT_TYPE = {
	EPUB: "epub",
	OPF: "opf",
	DIRECTORY: "directory",
	CONTAINER: "container"
};

class Epub extends Publication {
	constructor(url, options) {
		super();

		if (url) {
			this.opened = this.open(url);
		}
	}

	/**
	 * Determine the type of they input passed to open
	 * @private
	 * @param  {string} input
	 * @return {string}  directory | epub | opf
	 */
	determineType(input) {
		const ext = extension(input);

		if (!ext) {
			return INPUT_TYPE.DIRECTORY;
		}

		if (ext === "epub") {
			return INPUT_TYPE.EPUB;
		}

		if (ext === "opf") {
			return INPUT_TYPE.OPF;
		}

		if (ext === "xml") {
			return INPUT_TYPE.CONTAINER;
		}
	}

	/**
	 * Open the epub container
	 * @private
	 * @param  {string} url
	 * @return {string} packagePath
	 */
	async loadContainer(url) {
		const xml = await this.load(url);

		this.container = new Container(xml);
		return this.container;
	}

	/**
	 * Open the Open Packaging Format Xml
	 * @private
	 * @param  {string} url
	 * @return {Promise}
	 */
	async loadPackaging(url) {
		const xml = await this.load(url);

		this.packaging = new Packaging(xml);
		return this.packaging;
	}

	/**
	 * Load Navigation and PageList from package
	 * @private
	 * @param {document} opf XML Document
	 */
	async loadNavigation(opf) {
		let navPath = opf.navPath || opf.ncxPath;

		if (!navPath) {
			return {
				toc: undefined,
				landmarks: undefined,
				pageList: undefined,
				locations: undefined
			}
		}

		const navUrl = this.resolve(navPath);
		const xml = await this.load(navUrl, "xml");

		const navigation = new Navigation(xml, navUrl);
		const pagelist = new PageList(xml);

		if (navigation.toc && navigation.toc.length) {
			this.contentsUrl = navUrl;
		}

		if (navigation.landmarks && navigation.landmarks.length) {
			this.landmarksUrl = navUrl;
		}

		if (pagelist.pages && pagelist.pages.length) {
			this.pagelistUrl = navUrl;
		}

		if (pagelist.locations && pagelist.locations.length) {
			this.locationsUrl = navUrl;
		}

		return {
			toc: navigation.toc,
			landmarks: navigation.landmarks,
			pageList: pagelist.pages,
			locations: pagelist.locations
		}
	}

	async loadDisplayOptions(packaging) {
		let displayOptionsXml;
		if (packaging.metadata.layout === "") {
			displayOptionsXml = await this.load(IBOOKS_DISPLAY_OPTIONS_PATH).catch((err) => {
				return undefined;
			});
		}

		return displayOptionsXml;
	}

	loadSections(packaging) {
		let spine = new Spine(packaging);
		return {
			readingOrder: spine.readingOrder,
			unordered: spine.resources
		}
	}

	loadResources(packaging) {
		let resources = [];
		for (const r in packaging.manifest) {
			const resource = packaging.manifest[r];
			if (resource.type !== "application/xhtml+xml" &&
				resource.type !== "text/html") {
				resource.url = resource.href;
				resources.push(resource);
			}
		}
		return resources;
	}

	loadMetadata(packaging) {
		return packaging.metadata;
	}

	/**
	 * Unpack the contents of the Epub
	 * @private
	 * @param {document} packageXml XML Document
	 */
	async unpack(packaging) {
		this.package = packaging;

		this.metadata = this.loadMetadata(packaging);

		const resources = this.loadResources(packaging);
		const { readingOrder, unordered } = this.loadSections(packaging);
		
		this.spine = readingOrder;
		this.resources = [...unordered, ...resources];

		const { toc, landmarks, pageList, locations } = await this.loadNavigation(packaging);
		this.toc = toc;
		this.landmarks = landmarks;
		this.pagelist = pageList;
		this.locations = locations;

		this.displayOptions = await this.loadDisplayOptions(packaging);

		if (packaging.coverImagePath) {
			let cover = this.resources.get(this.resolve(packaging.coverPath));
			if (cover) {
				cover.rel.push("cover-image");
			}
		}

		return this;
	}

	async open(url, what) {
		const type = what || this.determineType(url);
		let packaging;

		if (type === INPUT_TYPE.EPUB) {
			throw new Error("Epub must be unarchived");
		}

		if (type === INPUT_TYPE.DIRECTORY) {
			const container = await this.loadContainer(CONTAINER_PATH);
			this.url = url + container.packagePath;
			packaging = await this.loadPackaging(container.packagePath);
		} else if (type === INPUT_TYPE.CONTAINER) {
			const container = await this.loadContainer(url);
			const packageUrl = resolve(url, "../" + container.packagePath);
			this.url = packageUrl;
			packaging = await this.loadPackaging(packageUrl);
		} else {
			this.url = url;
			packaging = await this.loadPackaging(url);
		}

		return this.unpack(packaging);
	}

	get spine() {
		return this.sections;
	}

	set spine(items) {
		return this.sections = items;
	}

	get toc() {
		return this.navigation;
	}

	set toc(items) {
		return this.navigation = items;
	}

	toJSON() {
		return super.toJSON();
	}

	/**
	 * Destroy the Epub and all associated objects
	 */
	destroy() {

	}
}

EventEmitter(Epub.prototype);

/**
 * A representation of a Manifest with methods for the loading and manipulation
 * of its contents.
 * @class
 * @param {json} [manifest]
 * @returns {Manifest}
 * @example new Manifest(manifest)
 */
class Manifest extends Publication {
	constructor(url, requestMethod, requestOptions) {
		super(null, requestMethod, requestOptions);

		if (url) {
			this.opened = this.open(url);
		}
	}

	async unpack(json) {
		for (const [key, value] of Object.entries(json)) {
			switch (key) {
				case "readingOrder":
					this.readingOrder = value;
					break;
				case "resources":
					this.resources = value;
					break;
				case "navigation":
				case "toc":
					this.navigation = value;
					break;
				case "landmarks":
					this.landmarks = value;
					break;
				case "pagelist":
					this.pagelist = value;
					break;
				case "locations":
					this.locations = value;
					break;
				case "cover":
					this.coverUrl = value;
				default:
					this.setMetadata(key, value);
					break;
			}
		}

		const contentsUrl = this.contentsUrl;
		if (contentsUrl) {
			this.contents = await this.loadNavigation(contentsUrl, "toc");
		}

		const landmarksUrl = this.landmarksUrl;
		if (landmarksUrl) {
			this.landmarks = await this.loadNavigation(landmarksUrl, "landmarks");
		}

		const pagelistUrl = this.pagelistUrl;
		if (pagelistUrl) {
			this.pagelist = await this.loadNavigation(pagelistUrl, "pagelist");
		}

		const locationsUrl = this.locationsUrl;
		if (locationsUrl) {
			this.locations = await this.load(locationsUrl, "json");
		}

	}

	async open(url) {
		this.url = url;

		const manifest = await this.load(url, "json");

		return this.unpack(manifest);
	}

	async loadNavigation(contentsUrl, role="toc") {
		const html = await this.load(contentsUrl, "html");
		let items = [];
		let url = createUrl(contentsUrl);

		html.querySelector("h1, h2, h3, h4, h5, h6");
		const toc = html.querySelector(`*[role='doc-${role}']`);		
		if (toc) {
			const links = toc.querySelectorAll("ol > li > a, ul > li > a");			
			for (const link of links) {
				items.push(this.contentsEntry(link, url));
			}
		}
		return items;
	}

	contentsEntry(link, contentsUrl) {
		const href = link.getAttribute("href");
		const url = resolve(contentsUrl, href);

		let item = {
			url: url,
			name: link.textContent
		};

		const children = link.querySelectorAll("ol > li > a, ul > li > a");
		
		if (children.length) {
			item.children = [];
			for (const child of children) {
				item.children.push(this.contentsEntry(child, contentsUrl));
			}
		}

		return item;
	}

	setMetadata(key, value) {
		if (key === "readingProgression") {
			this.metadata.set("direction", value);
		}
		if (key === "url") {
			this.url = value;
		}
		this.metadata.set(key, value);
	}


	get readingOrder() {
		return this.sections;
	}

	set readingOrder(items) {
		return this.sections = items;
	}

	get contents() {
		return this.navigation;
	}

	set contents(items) {
		return this.navigation = items;
	}

}

async function generateLocations(sections, options={}) {
    let q = new Queue();
    let chars = options.chars || 150;
    let requestMethod = options.request || request;
    let pause = options.pause || 100;
    let processing = [];
    let locations = [];

    q.pause();

    for (const [key, section] of sections) {
        processing.push(q.enqueue(process, section, chars, requestMethod, pause));
    }

    q.run();

    let processed = await Promise.all(processing);

    for (const group of processed) {
        locations.push(...group);
    }

    return locations;
}

function createRange() {
    return {
        startContainer: undefined,
        startOffset: undefined,
        endContainer: undefined,
        endOffset: undefined
    };
}

async function process(section, chars, requestMethod, pause) {
    let contents = await requestMethod(section.url);
    let locations = parse(contents, section.cfiBase);

    return locations;
}

function parse(doc, cfiBase, chars) {
    let locations = [];
    let range;
    let body = qs(doc, "body");
    let counter = 0;
    let prev;
    let _break = chars;
    let parser = function(node) {
        let len = node.length;
        let dist;
        let pos = 0;

        if (node.textContent.trim().length === 0) {
            return false; // continue
        }

        // Start range
        if (counter == 0) {
            range = createRange();
            range.startContainer = node;
            range.startOffset = 0;
        }

        dist = _break - counter;

        // Node is smaller than a break,
        // skip over it
        if(dist > len){
            counter += len;
            pos = len;
        }


        while (pos < len) {
            dist = _break - counter;

            if (counter === 0) {
                // Start new range
                pos += 1;
                range = createRange();
                range.startContainer = node;
                range.startOffset = pos;
            }

            // pos += dist;

            // Gone over
            if(pos + dist >= len){
                // Continue counter for next node
                counter += len - pos;
                // break
                pos = len;
            // At End
            } else {
                // Advance pos
                pos += dist;

                // End the previous range
                range.endContainer = node;
                range.endOffset = pos;
                // cfi = section.cfiFromRange(range);
                let cfi = new EpubCFI(range, cfiBase).toString();
                locations.push({cfi});
                counter = 0;
            }
        }
        prev = node;
    };

    sprint(body, parser);

    // Close remaining
    if (range && range.startContainer && prev) {
        range.endContainer = prev;
        range.endOffset = prev.length;
        let cfi = new EpubCFI(range, cfiBase).toString();
        locations.push({cfi});
        counter = 0;
    }

    return locations;
}

export { Contents, Epub, EpubCFI, Layout, Manifest, Publication, Rendition, core, generateLocations, url };
