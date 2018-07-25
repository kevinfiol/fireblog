(function () {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var mithril = createCommonjsModule(function (module) {
	(function() {
	function Vnode(tag, key, attrs0, children, text, dom) {
		return {tag: tag, key: key, attrs: attrs0, children: children, text: text, dom: dom, domSize: undefined, state: undefined, _state: undefined, events: undefined, instance: undefined, skip: false}
	}
	Vnode.normalize = function(node) {
		if (Array.isArray(node)) { return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined) }
		if (node != null && typeof node !== "object") { return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined) }
		return node
	};
	Vnode.normalizeChildren = function normalizeChildren(children) {
		for (var i = 0; i < children.length; i++) {
			children[i] = Vnode.normalize(children[i]);
		}
		return children
	};
	var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
	var selectorCache = {};
	var hasOwn = {}.hasOwnProperty;
	function isEmpty(object) {
		for (var key in object) { if (hasOwn.call(object, key)) { return false } }
		return true
	}
	function compileSelector(selector) {
		var match, tag = "div", classes = [], attrs = {};
		while (match = selectorParser.exec(selector)) {
			var type = match[1], value = match[2];
			if (type === "" && value !== "") { tag = value; }
			else if (type === "#") { attrs.id = value; }
			else if (type === ".") { classes.push(value); }
			else if (match[3][0] === "[") {
				var attrValue = match[6];
				if (attrValue) { attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\"); }
				if (match[4] === "class") { classes.push(attrValue); }
				else { attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true; }
			}
		}
		if (classes.length > 0) { attrs.className = classes.join(" "); }
		return selectorCache[selector] = {tag: tag, attrs: attrs}
	}
	function execSelector(state, attrs, children) {
		var hasAttrs = false, childList, text;
		var className = attrs.className || attrs.class;
		if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
			var newAttrs = {};
			for(var key in attrs) {
				if (hasOwn.call(attrs, key)) {
					newAttrs[key] = attrs[key];
				}
			}
			attrs = newAttrs;
		}
		for (var key in state.attrs) {
			if (hasOwn.call(state.attrs, key)) {
				attrs[key] = state.attrs[key];
			}
		}
		if (className !== undefined) {
			if (attrs.class !== undefined) {
				attrs.class = undefined;
				attrs.className = className;
			}
			if (state.attrs.className != null) {
				attrs.className = state.attrs.className + " " + className;
			}
		}
		for (var key in attrs) {
			if (hasOwn.call(attrs, key) && key !== "key") {
				hasAttrs = true;
				break
			}
		}
		if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
			text = children[0].children;
		} else {
			childList = children;
		}
		return Vnode(state.tag, attrs.key, hasAttrs ? attrs : undefined, childList, text)
	}
	function hyperscript(selector) {
		var arguments$1 = arguments;

		// Because sloppy mode sucks
		var attrs = arguments[1], start = 2, children;
		if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
			throw Error("The selector must be either a string or a component.");
		}
		if (typeof selector === "string") {
			var cached = selectorCache[selector] || compileSelector(selector);
		}
		if (attrs == null) {
			attrs = {};
		} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
			attrs = {};
			start = 1;
		}
		if (arguments.length === start + 1) {
			children = arguments[start];
			if (!Array.isArray(children)) { children = [children]; }
		} else {
			children = [];
			while (start < arguments.length) { children.push(arguments$1[start++]); }
		}
		var normalized = Vnode.normalizeChildren(children);
		if (typeof selector === "string") {
			return execSelector(cached, attrs, normalized)
		} else {
			return Vnode(selector, attrs.key, attrs, normalized)
		}
	}
	hyperscript.trust = function(html) {
		if (html == null) { html = ""; }
		return Vnode("<", undefined, undefined, html, undefined, undefined)
	};
	hyperscript.fragment = function(attrs1, children) {
		return Vnode("[", attrs1.key, attrs1, Vnode.normalizeChildren(children), undefined, undefined)
	};
	var m = hyperscript;
	/** @constructor */
	var PromisePolyfill = function(executor) {
		if (!(this instanceof PromisePolyfill)) { throw new Error("Promise must be called with `new`") }
		if (typeof executor !== "function") { throw new TypeError("executor must be a function") }
		var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
		var instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
		function handler(list, shouldAbsorb) {
			return function execute(value) {
				var then;
				try {
					if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
						if (value === self) { throw new TypeError("Promise can't be resolved w/ itself") }
						executeOnce(then.bind(value));
					}
					else {
						callAsync(function() {
							if (!shouldAbsorb && list.length === 0) { console.error("Possible unhandled promise rejection:", value); }
							for (var i = 0; i < list.length; i++) { list[i](value); }
							resolvers.length = 0, rejectors.length = 0;
							instance.state = shouldAbsorb;
							instance.retry = function() {execute(value);};
						});
					}
				}
				catch (e) {
					rejectCurrent(e);
				}
			}
		}
		function executeOnce(then) {
			var runs = 0;
			function run(fn) {
				return function(value) {
					if (runs++ > 0) { return }
					fn(value);
				}
			}
			var onerror = run(rejectCurrent);
			try {then(run(resolveCurrent), onerror);} catch (e) {onerror(e);}
		}
		executeOnce(executor);
	};
	PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
		var self = this, instance = self._instance;
		function handle(callback, list, next, state) {
			list.push(function(value) {
				if (typeof callback !== "function") { next(value); }
				else { try {resolveNext(callback(value));} catch (e) {if (rejectNext) { rejectNext(e); }} }
			});
			if (typeof instance.retry === "function" && state === instance.state) { instance.retry(); }
		}
		var resolveNext, rejectNext;
		var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject;});
		handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
		return promise
	};
	PromisePolyfill.prototype.catch = function(onRejection) {
		return this.then(null, onRejection)
	};
	PromisePolyfill.resolve = function(value) {
		if (value instanceof PromisePolyfill) { return value }
		return new PromisePolyfill(function(resolve) {resolve(value);})
	};
	PromisePolyfill.reject = function(value) {
		return new PromisePolyfill(function(resolve, reject) {reject(value);})
	};
	PromisePolyfill.all = function(list) {
		return new PromisePolyfill(function(resolve, reject) {
			var total = list.length, count = 0, values = [];
			if (list.length === 0) { resolve([]); }
			else { for (var i = 0; i < list.length; i++) {
				(function(i) {
					function consume(value) {
						count++;
						values[i] = value;
						if (count === total) { resolve(values); }
					}
					if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
						list[i].then(consume, reject);
					}
					else { consume(list[i]); }
				})(i);
			} }
		})
	};
	PromisePolyfill.race = function(list) {
		return new PromisePolyfill(function(resolve, reject) {
			for (var i = 0; i < list.length; i++) {
				list[i].then(resolve, reject);
			}
		})
	};
	if (typeof window !== "undefined") {
		if (typeof window.Promise === "undefined") { window.Promise = PromisePolyfill; }
		var PromisePolyfill = window.Promise;
	} else if (typeof commonjsGlobal !== "undefined") {
		if (typeof commonjsGlobal.Promise === "undefined") { commonjsGlobal.Promise = PromisePolyfill; }
		var PromisePolyfill = commonjsGlobal.Promise;
	}
	var buildQueryString = function(object) {
		if (Object.prototype.toString.call(object) !== "[object Object]") { return "" }
		var args = [];
		for (var key0 in object) {
			destructure(key0, object[key0]);
		}
		return args.join("&")
		function destructure(key0, value) {
			if (Array.isArray(value)) {
				for (var i = 0; i < value.length; i++) {
					destructure(key0 + "[" + i + "]", value[i]);
				}
			}
			else if (Object.prototype.toString.call(value) === "[object Object]") {
				for (var i in value) {
					destructure(key0 + "[" + i + "]", value[i]);
				}
			}
			else { args.push(encodeURIComponent(key0) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : "")); }
		}
	};
	var FILE_PROTOCOL_REGEX = new RegExp("^file://", "i");
	var _8 = function($window, Promise) {
		var callbackCount = 0;
		var oncompletion;
		function setCompletionCallback(callback) {oncompletion = callback;}
		function finalizer() {
			var count = 0;
			function complete() {if (--count === 0 && typeof oncompletion === "function") { oncompletion(); }}
			return function finalize(promise0) {
				var then0 = promise0.then;
				promise0.then = function() {
					count++;
					var next = then0.apply(promise0, arguments);
					next.then(complete, function(e) {
						complete();
						if (count === 0) { throw e }
					});
					return finalize(next)
				};
				return promise0
			}
		}
		function normalize(args, extra) {
			if (typeof args === "string") {
				var url = args;
				args = extra || {};
				if (args.url == null) { args.url = url; }
			}
			return args
		}
		function request(args, extra) {
			var finalize = finalizer();
			args = normalize(args, extra);
			var promise0 = new Promise(function(resolve, reject) {
				if (args.method == null) { args.method = "GET"; }
				args.method = args.method.toUpperCase();
				var useBody = (args.method === "GET" || args.method === "TRACE") ? false : (typeof args.useBody === "boolean" ? args.useBody : true);
				if (typeof args.serialize !== "function") { args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify; }
				if (typeof args.deserialize !== "function") { args.deserialize = deserialize; }
				if (typeof args.extract !== "function") { args.extract = extract; }
				args.url = interpolate(args.url, args.data);
				if (useBody) { args.data = args.serialize(args.data); }
				else { args.url = assemble(args.url, args.data); }
				var xhr = new $window.XMLHttpRequest(),
					aborted = false,
					_abort = xhr.abort;
				xhr.abort = function abort() {
					aborted = true;
					_abort.call(xhr);
				};
				xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);
				if (args.serialize === JSON.stringify && useBody && !(args.headers && args.headers.hasOwnProperty("Content-Type"))) {
					xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
				}
				if (args.deserialize === deserialize && !(args.headers && args.headers.hasOwnProperty("Accept"))) {
					xhr.setRequestHeader("Accept", "application/json, text/*");
				}
				if (args.withCredentials) { xhr.withCredentials = args.withCredentials; }
				for (var key in args.headers) { if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key]);
				} }
				if (typeof args.config === "function") { xhr = args.config(xhr, args) || xhr; }
				xhr.onreadystatechange = function() {
					// Don't throw errors on xhr.abort().
					if(aborted) { return }
					if (xhr.readyState === 4) {
						try {
							var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args));
							if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || FILE_PROTOCOL_REGEX.test(args.url)) {
								resolve(cast(args.type, response));
							}
							else {
								var error = new Error(xhr.responseText);
								for (var key in response) { error[key] = response[key]; }
								reject(error);
							}
						}
						catch (e) {
							reject(e);
						}
					}
				};
				if (useBody && (args.data != null)) { xhr.send(args.data); }
				else { xhr.send(); }
			});
			return args.background === true ? promise0 : finalize(promise0)
		}
		function jsonp(args, extra) {
			var finalize = finalizer();
			args = normalize(args, extra);
			var promise0 = new Promise(function(resolve, reject) {
				var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
				var script = $window.document.createElement("script");
				$window[callbackName] = function(data) {
					script.parentNode.removeChild(script);
					resolve(cast(args.type, data));
					delete $window[callbackName];
				};
				script.onerror = function() {
					script.parentNode.removeChild(script);
					reject(new Error("JSONP request failed"));
					delete $window[callbackName];
				};
				if (args.data == null) { args.data = {}; }
				args.url = interpolate(args.url, args.data);
				args.data[args.callbackKey || "callback"] = callbackName;
				script.src = assemble(args.url, args.data);
				$window.document.documentElement.appendChild(script);
			});
			return args.background === true? promise0 : finalize(promise0)
		}
		function interpolate(url, data) {
			if (data == null) { return url }
			var tokens = url.match(/:[^\/]+/gi) || [];
			for (var i = 0; i < tokens.length; i++) {
				var key = tokens[i].slice(1);
				if (data[key] != null) {
					url = url.replace(tokens[i], data[key]);
				}
			}
			return url
		}
		function assemble(url, data) {
			var querystring = buildQueryString(data);
			if (querystring !== "") {
				var prefix = url.indexOf("?") < 0 ? "?" : "&";
				url += prefix + querystring;
			}
			return url
		}
		function deserialize(data) {
			try {return data !== "" ? JSON.parse(data) : null}
			catch (e) {throw new Error(data)}
		}
		function extract(xhr) {return xhr.responseText}
		function cast(type0, data) {
			if (typeof type0 === "function") {
				if (Array.isArray(data)) {
					for (var i = 0; i < data.length; i++) {
						data[i] = new type0(data[i]);
					}
				}
				else { return new type0(data) }
			}
			return data
		}
		return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
	};
	var requestService = _8(window, PromisePolyfill);
	var coreRenderer = function($window) {
		var $doc = $window.document;
		var $emptyFragment = $doc.createDocumentFragment();
		var nameSpace = {
			svg: "http://www.w3.org/2000/svg",
			math: "http://www.w3.org/1998/Math/MathML"
		};
		var onevent;
		function setEventCallback(callback) {return onevent = callback}
		function getNameSpace(vnode) {
			return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
		}
		//create
		function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
			for (var i = start; i < end; i++) {
				var vnode = vnodes[i];
				if (vnode != null) {
					createNode(parent, vnode, hooks, ns, nextSibling);
				}
			}
		}
		function createNode(parent, vnode, hooks, ns, nextSibling) {
			var tag = vnode.tag;
			if (typeof tag === "string") {
				vnode.state = {};
				if (vnode.attrs != null) { initLifecycle(vnode.attrs, vnode, hooks); }
				switch (tag) {
					case "#": return createText(parent, vnode, nextSibling)
					case "<": return createHTML(parent, vnode, nextSibling)
					case "[": return createFragment(parent, vnode, hooks, ns, nextSibling)
					default: return createElement(parent, vnode, hooks, ns, nextSibling)
				}
			}
			else { return createComponent(parent, vnode, hooks, ns, nextSibling) }
		}
		function createText(parent, vnode, nextSibling) {
			vnode.dom = $doc.createTextNode(vnode.children);
			insertNode(parent, vnode.dom, nextSibling);
			return vnode.dom
		}
		function createHTML(parent, vnode, nextSibling) {
			var match1 = vnode.children.match(/^\s*?<(\w+)/im) || [];
			var parent1 = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match1[1]] || "div";
			var temp = $doc.createElement(parent1);
			temp.innerHTML = vnode.children;
			vnode.dom = temp.firstChild;
			vnode.domSize = temp.childNodes.length;
			var fragment = $doc.createDocumentFragment();
			var child;
			while (child = temp.firstChild) {
				fragment.appendChild(child);
			}
			insertNode(parent, fragment, nextSibling);
			return fragment
		}
		function createFragment(parent, vnode, hooks, ns, nextSibling) {
			var fragment = $doc.createDocumentFragment();
			if (vnode.children != null) {
				var children = vnode.children;
				createNodes(fragment, children, 0, children.length, hooks, null, ns);
			}
			vnode.dom = fragment.firstChild;
			vnode.domSize = fragment.childNodes.length;
			insertNode(parent, fragment, nextSibling);
			return fragment
		}
		function createElement(parent, vnode, hooks, ns, nextSibling) {
			var tag = vnode.tag;
			var attrs2 = vnode.attrs;
			var is = attrs2 && attrs2.is;
			ns = getNameSpace(vnode) || ns;
			var element = ns ?
				is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
				is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
			vnode.dom = element;
			if (attrs2 != null) {
				setAttrs(vnode, attrs2, ns);
			}
			insertNode(parent, element, nextSibling);
			if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
				setContentEditable(vnode);
			}
			else {
				if (vnode.text != null) {
					if (vnode.text !== "") { element.textContent = vnode.text; }
					else { vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]; }
				}
				if (vnode.children != null) {
					var children = vnode.children;
					createNodes(element, children, 0, children.length, hooks, null, ns);
					setLateAttrs(vnode);
				}
			}
			return element
		}
		function initComponent(vnode, hooks) {
			var sentinel;
			if (typeof vnode.tag.view === "function") {
				vnode.state = Object.create(vnode.tag);
				sentinel = vnode.state.view;
				if (sentinel.$$reentrantLock$$ != null) { return $emptyFragment }
				sentinel.$$reentrantLock$$ = true;
			} else {
				vnode.state = void 0;
				sentinel = vnode.tag;
				if (sentinel.$$reentrantLock$$ != null) { return $emptyFragment }
				sentinel.$$reentrantLock$$ = true;
				vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode);
			}
			vnode._state = vnode.state;
			if (vnode.attrs != null) { initLifecycle(vnode.attrs, vnode, hooks); }
			initLifecycle(vnode._state, vnode, hooks);
			vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode));
			if (vnode.instance === vnode) { throw Error("A view cannot return the vnode it received as argument") }
			sentinel.$$reentrantLock$$ = null;
		}
		function createComponent(parent, vnode, hooks, ns, nextSibling) {
			initComponent(vnode, hooks);
			if (vnode.instance != null) {
				var element = createNode(parent, vnode.instance, hooks, ns, nextSibling);
				vnode.dom = vnode.instance.dom;
				vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0;
				insertNode(parent, element, nextSibling);
				return element
			}
			else {
				vnode.domSize = 0;
				return $emptyFragment
			}
		}
		//update
		function updateNodes(parent, old, vnodes, recycling, hooks, nextSibling, ns) {
			if (old === vnodes || old == null && vnodes == null) { return }
			else if (old == null) { createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns); }
			else if (vnodes == null) { removeNodes(old, 0, old.length, vnodes); }
			else {
				if (old.length === vnodes.length) {
					var isUnkeyed = false;
					for (var i = 0; i < vnodes.length; i++) {
						if (vnodes[i] != null && old[i] != null) {
							isUnkeyed = vnodes[i].key == null && old[i].key == null;
							break
						}
					}
					if (isUnkeyed) {
						for (var i = 0; i < old.length; i++) {
							if (old[i] === vnodes[i]) { continue }
							else if (old[i] == null && vnodes[i] != null) { createNode(parent, vnodes[i], hooks, ns, getNextSibling(old, i + 1, nextSibling)); }
							else if (vnodes[i] == null) { removeNodes(old, i, i + 1, vnodes); }
							else { updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), recycling, ns); }
						}
						return
					}
				}
				recycling = recycling || isRecyclable(old, vnodes);
				if (recycling) {
					var pool = old.pool;
					old = old.concat(old.pool);
				}
				var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map;
				while (oldEnd >= oldStart && end >= start) {
					var o = old[oldStart], v = vnodes[start];
					if (o === v && !recycling) { oldStart++, start++; }
					else if (o == null) { oldStart++; }
					else if (v == null) { start++; }
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldStart >= old.length - pool.length) || ((pool == null) && recycling);
						oldStart++, start++;
						updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), shouldRecycle, ns);
						if (recycling && o.tag === v.tag) { insertNode(parent, toFragment(o), nextSibling); }
					}
					else {
						var o = old[oldEnd];
						if (o === v && !recycling) { oldEnd--, start++; }
						else if (o == null) { oldEnd--; }
						else if (v == null) { start++; }
						else if (o.key === v.key) {
							var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling);
							updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns);
							if (recycling || start < end) { insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling)); }
							oldEnd--, start++;
						}
						else { break }
					}
				}
				while (oldEnd >= oldStart && end >= start) {
					var o = old[oldEnd], v = vnodes[end];
					if (o === v && !recycling) { oldEnd--, end--; }
					else if (o == null) { oldEnd--; }
					else if (v == null) { end--; }
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling);
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns);
						if (recycling && o.tag === v.tag) { insertNode(parent, toFragment(o), nextSibling); }
						if (o.dom != null) { nextSibling = o.dom; }
						oldEnd--, end--;
					}
					else {
						if (!map) { map = getKeyMap(old, oldEnd); }
						if (v != null) {
							var oldIndex = map[v.key];
							if (oldIndex != null) {
								var movable = old[oldIndex];
								var shouldRecycle = (pool != null && oldIndex >= old.length - pool.length) || ((pool == null) && recycling);
								updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
								insertNode(parent, toFragment(movable), nextSibling);
								old[oldIndex].skip = true;
								if (movable.dom != null) { nextSibling = movable.dom; }
							}
							else {
								var dom = createNode(parent, v, hooks, ns, nextSibling);
								nextSibling = dom;
							}
						}
						end--;
					}
					if (end < start) { break }
				}
				createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
				removeNodes(old, oldStart, oldEnd + 1, vnodes);
			}
		}
		function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
			var oldTag = old.tag, tag = vnode.tag;
			if (oldTag === tag) {
				vnode.state = old.state;
				vnode._state = old._state;
				vnode.events = old.events;
				if (!recycling && shouldNotUpdate(vnode, old)) { return }
				if (typeof oldTag === "string") {
					if (vnode.attrs != null) {
						if (recycling) {
							vnode.state = {};
							initLifecycle(vnode.attrs, vnode, hooks);
						}
						else { updateLifecycle(vnode.attrs, vnode, hooks); }
					}
					switch (oldTag) {
						case "#": updateText(old, vnode); break
						case "<": updateHTML(parent, old, vnode, nextSibling); break
						case "[": updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns); break
						default: updateElement(old, vnode, recycling, hooks, ns);
					}
				}
				else { updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns); }
			}
			else {
				removeNode(old, null);
				createNode(parent, vnode, hooks, ns, nextSibling);
			}
		}
		function updateText(old, vnode) {
			if (old.children.toString() !== vnode.children.toString()) {
				old.dom.nodeValue = vnode.children;
			}
			vnode.dom = old.dom;
		}
		function updateHTML(parent, old, vnode, nextSibling) {
			if (old.children !== vnode.children) {
				toFragment(old);
				createHTML(parent, vnode, nextSibling);
			}
			else { vnode.dom = old.dom, vnode.domSize = old.domSize; }
		}
		function updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns) {
			updateNodes(parent, old.children, vnode.children, recycling, hooks, nextSibling, ns);
			var domSize = 0, children = vnode.children;
			vnode.dom = null;
			if (children != null) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i];
					if (child != null && child.dom != null) {
						if (vnode.dom == null) { vnode.dom = child.dom; }
						domSize += child.domSize || 1;
					}
				}
				if (domSize !== 1) { vnode.domSize = domSize; }
			}
		}
		function updateElement(old, vnode, recycling, hooks, ns) {
			var element = vnode.dom = old.dom;
			ns = getNameSpace(vnode) || ns;
			if (vnode.tag === "textarea") {
				if (vnode.attrs == null) { vnode.attrs = {}; }
				if (vnode.text != null) {
					vnode.attrs.value = vnode.text; //FIXME handle0 multiple children
					vnode.text = undefined;
				}
			}
			updateAttrs(vnode, old.attrs, vnode.attrs, ns);
			if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
				setContentEditable(vnode);
			}
			else if (old.text != null && vnode.text != null && vnode.text !== "") {
				if (old.text.toString() !== vnode.text.toString()) { old.dom.firstChild.nodeValue = vnode.text; }
			}
			else {
				if (old.text != null) { old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]; }
				if (vnode.text != null) { vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]; }
				updateNodes(element, old.children, vnode.children, recycling, hooks, null, ns);
			}
		}
		function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
			if (recycling) {
				initComponent(vnode, hooks);
			} else {
				vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode));
				if (vnode.instance === vnode) { throw Error("A view cannot return the vnode it received as argument") }
				if (vnode.attrs != null) { updateLifecycle(vnode.attrs, vnode, hooks); }
				updateLifecycle(vnode._state, vnode, hooks);
			}
			if (vnode.instance != null) {
				if (old.instance == null) { createNode(parent, vnode.instance, hooks, ns, nextSibling); }
				else { updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns); }
				vnode.dom = vnode.instance.dom;
				vnode.domSize = vnode.instance.domSize;
			}
			else if (old.instance != null) {
				removeNode(old.instance, null);
				vnode.dom = undefined;
				vnode.domSize = 0;
			}
			else {
				vnode.dom = old.dom;
				vnode.domSize = old.domSize;
			}
		}
		function isRecyclable(old, vnodes) {
			if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
				var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0;
				var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0;
				var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0;
				if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
					return true
				}
			}
			return false
		}
		function getKeyMap(vnodes, end) {
			var map = {}, i = 0;
			for (var i = 0; i < end; i++) {
				var vnode = vnodes[i];
				if (vnode != null) {
					var key2 = vnode.key;
					if (key2 != null) { map[key2] = i; }
				}
			}
			return map
		}
		function toFragment(vnode) {
			var count0 = vnode.domSize;
			if (count0 != null || vnode.dom == null) {
				var fragment = $doc.createDocumentFragment();
				if (count0 > 0) {
					var dom = vnode.dom;
					while (--count0) { fragment.appendChild(dom.nextSibling); }
					fragment.insertBefore(dom, fragment.firstChild);
				}
				return fragment
			}
			else { return vnode.dom }
		}
		function getNextSibling(vnodes, i, nextSibling) {
			for (; i < vnodes.length; i++) {
				if (vnodes[i] != null && vnodes[i].dom != null) { return vnodes[i].dom }
			}
			return nextSibling
		}
		function insertNode(parent, dom, nextSibling) {
			if (nextSibling && nextSibling.parentNode) { parent.insertBefore(dom, nextSibling); }
			else { parent.appendChild(dom); }
		}
		function setContentEditable(vnode) {
			var children = vnode.children;
			if (children != null && children.length === 1 && children[0].tag === "<") {
				var content = children[0].children;
				if (vnode.dom.innerHTML !== content) { vnode.dom.innerHTML = content; }
			}
			else if (vnode.text != null || children != null && children.length !== 0) { throw new Error("Child node of a contenteditable must be trusted") }
		}
		//remove
		function removeNodes(vnodes, start, end, context) {
			for (var i = start; i < end; i++) {
				var vnode = vnodes[i];
				if (vnode != null) {
					if (vnode.skip) { vnode.skip = false; }
					else { removeNode(vnode, context); }
				}
			}
		}
		function removeNode(vnode, context) {
			var expected = 1, called = 0;
			if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
				var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode);
				if (result != null && typeof result.then === "function") {
					expected++;
					result.then(continuation, continuation);
				}
			}
			if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeremove === "function") {
				var result = vnode._state.onbeforeremove.call(vnode.state, vnode);
				if (result != null && typeof result.then === "function") {
					expected++;
					result.then(continuation, continuation);
				}
			}
			continuation();
			function continuation() {
				if (++called === expected) {
					onremove(vnode);
					if (vnode.dom) {
						var count0 = vnode.domSize || 1;
						if (count0 > 1) {
							var dom = vnode.dom;
							while (--count0) {
								removeNodeFromDOM(dom.nextSibling);
							}
						}
						removeNodeFromDOM(vnode.dom);
						if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
							if (!context.pool) { context.pool = [vnode]; }
							else { context.pool.push(vnode); }
						}
					}
				}
			}
		}
		function removeNodeFromDOM(node) {
			var parent = node.parentNode;
			if (parent != null) { parent.removeChild(node); }
		}
		function onremove(vnode) {
			if (vnode.attrs && typeof vnode.attrs.onremove === "function") { vnode.attrs.onremove.call(vnode.state, vnode); }
			if (typeof vnode.tag !== "string") {
				if (typeof vnode._state.onremove === "function") { vnode._state.onremove.call(vnode.state, vnode); }
				if (vnode.instance != null) { onremove(vnode.instance); }
			} else {
				var children = vnode.children;
				if (Array.isArray(children)) {
					for (var i = 0; i < children.length; i++) {
						var child = children[i];
						if (child != null) { onremove(child); }
					}
				}
			}
		}
		//attrs2
		function setAttrs(vnode, attrs2, ns) {
			for (var key2 in attrs2) {
				setAttr(vnode, key2, null, attrs2[key2], ns);
			}
		}
		function setAttr(vnode, key2, old, value, ns) {
			var element = vnode.dom;
			if (key2 === "key" || key2 === "is" || (old === value && !isFormAttribute(vnode, key2)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key2)) { return }
			var nsLastIndex = key2.indexOf(":");
			if (nsLastIndex > -1 && key2.substr(0, nsLastIndex) === "xlink") {
				element.setAttributeNS("http://www.w3.org/1999/xlink", key2.slice(nsLastIndex + 1), value);
			}
			else if (key2[0] === "o" && key2[1] === "n" && typeof value === "function") { updateEvent(vnode, key2, value); }
			else if (key2 === "style") { updateStyle(element, old, value); }
			else if (key2 in element && !isAttribute(key2) && ns === undefined && !isCustomElement(vnode)) {
				if (key2 === "value") {
					var normalized0 = "" + value; // eslint-disable-line no-implicit-coercion
					//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
					if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) { return }
					//setting select[value] to same value while having select open blinks select dropdown in Chrome
					if (vnode.tag === "select") {
						if (value === null) {
							if (vnode.dom.selectedIndex === -1 && vnode.dom === $doc.activeElement) { return }
						} else {
							if (old !== null && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) { return }
						}
					}
					//setting option[value] to same value while having select open blinks select dropdown in Chrome
					if (vnode.tag === "option" && old != null && vnode.dom.value === normalized0) { return }
				}
				// If you assign an input type1 that is not supported by IE 11 with an assignment expression, an error0 will occur.
				if (vnode.tag === "input" && key2 === "type") {
					element.setAttribute(key2, value);
					return
				}
				element[key2] = value;
			}
			else {
				if (typeof value === "boolean") {
					if (value) { element.setAttribute(key2, ""); }
					else { element.removeAttribute(key2); }
				}
				else { element.setAttribute(key2 === "className" ? "class" : key2, value); }
			}
		}
		function setLateAttrs(vnode) {
			var attrs2 = vnode.attrs;
			if (vnode.tag === "select" && attrs2 != null) {
				if ("value" in attrs2) { setAttr(vnode, "value", null, attrs2.value, undefined); }
				if ("selectedIndex" in attrs2) { setAttr(vnode, "selectedIndex", null, attrs2.selectedIndex, undefined); }
			}
		}
		function updateAttrs(vnode, old, attrs2, ns) {
			if (attrs2 != null) {
				for (var key2 in attrs2) {
					setAttr(vnode, key2, old && old[key2], attrs2[key2], ns);
				}
			}
			if (old != null) {
				for (var key2 in old) {
					if (attrs2 == null || !(key2 in attrs2)) {
						if (key2 === "className") { key2 = "class"; }
						if (key2[0] === "o" && key2[1] === "n" && !isLifecycleMethod(key2)) { updateEvent(vnode, key2, undefined); }
						else if (key2 !== "key") { vnode.dom.removeAttribute(key2); }
					}
				}
			}
		}
		function isFormAttribute(vnode, attr) {
			return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === $doc.activeElement
		}
		function isLifecycleMethod(attr) {
			return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
		}
		function isAttribute(attr) {
			return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height"// || attr === "type"
		}
		function isCustomElement(vnode){
			return vnode.attrs.is || vnode.tag.indexOf("-") > -1
		}
		function hasIntegrationMethods(source) {
			return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove)
		}
		//style
		function updateStyle(element, old, style) {
			if (old === style) { element.style.cssText = "", old = null; }
			if (style == null) { element.style.cssText = ""; }
			else if (typeof style === "string") { element.style.cssText = style; }
			else {
				if (typeof old === "string") { element.style.cssText = ""; }
				for (var key2 in style) {
					element.style[key2] = style[key2];
				}
				if (old != null && typeof old !== "string") {
					for (var key2 in old) {
						if (!(key2 in style)) { element.style[key2] = ""; }
					}
				}
			}
		}
		//event
		function updateEvent(vnode, key2, value) {
			var element = vnode.dom;
			var callback = typeof onevent !== "function" ? value : function(e) {
				var result = value.call(element, e);
				onevent.call(element, e);
				return result
			};
			if (key2 in element) { element[key2] = typeof value === "function" ? callback : null; }
			else {
				var eventName = key2.slice(2);
				if (vnode.events === undefined) { vnode.events = {}; }
				if (vnode.events[key2] === callback) { return }
				if (vnode.events[key2] != null) { element.removeEventListener(eventName, vnode.events[key2], false); }
				if (typeof value === "function") {
					vnode.events[key2] = callback;
					element.addEventListener(eventName, vnode.events[key2], false);
				}
			}
		}
		//lifecycle
		function initLifecycle(source, vnode, hooks) {
			if (typeof source.oninit === "function") { source.oninit.call(vnode.state, vnode); }
			if (typeof source.oncreate === "function") { hooks.push(source.oncreate.bind(vnode.state, vnode)); }
		}
		function updateLifecycle(source, vnode, hooks) {
			if (typeof source.onupdate === "function") { hooks.push(source.onupdate.bind(vnode.state, vnode)); }
		}
		function shouldNotUpdate(vnode, old) {
			var forceVnodeUpdate, forceComponentUpdate;
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") { forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old); }
			if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeupdate === "function") { forceComponentUpdate = vnode._state.onbeforeupdate.call(vnode.state, vnode, old); }
			if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
				vnode.dom = old.dom;
				vnode.domSize = old.domSize;
				vnode.instance = old.instance;
				return true
			}
			return false
		}
		function render(dom, vnodes) {
			if (!dom) { throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.") }
			var hooks = [];
			var active = $doc.activeElement;
			var namespace = dom.namespaceURI;
			// First time0 rendering into a node clears it out
			if (dom.vnodes == null) { dom.textContent = ""; }
			if (!Array.isArray(vnodes)) { vnodes = [vnodes]; }
			updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), false, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace);
			dom.vnodes = vnodes;
			// document.activeElement can return null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
			if (active != null && $doc.activeElement !== active) { active.focus(); }
			for (var i = 0; i < hooks.length; i++) { hooks[i](); }
		}
		return {render: render, setEventCallback: setEventCallback}
	};
	function throttle(callback) {
		//60fps translates to 16.6ms, round it down since setTimeout requires int
		var time = 16;
		var last = 0, pending = null;
		var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout;
		return function() {
			var now = Date.now();
			if (last === 0 || now - last >= time) {
				last = now;
				callback();
			}
			else if (pending === null) {
				pending = timeout(function() {
					pending = null;
					callback();
					last = Date.now();
				}, time - (now - last));
			}
		}
	}
	var _11 = function($window) {
		var renderService = coreRenderer($window);
		renderService.setEventCallback(function(e) {
			if (e.redraw === false) { e.redraw = undefined; }
			else { redraw(); }
		});
		var callbacks = [];
		function subscribe(key1, callback) {
			unsubscribe(key1);
			callbacks.push(key1, throttle(callback));
		}
		function unsubscribe(key1) {
			var index = callbacks.indexOf(key1);
			if (index > -1) { callbacks.splice(index, 2); }
		}
		function redraw() {
			for (var i = 1; i < callbacks.length; i += 2) {
				callbacks[i]();
			}
		}
		return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
	};
	var redrawService = _11(window);
	requestService.setCompletionCallback(redrawService.redraw);
	var _16 = function(redrawService0) {
		return function(root, component) {
			if (component === null) {
				redrawService0.render(root, []);
				redrawService0.unsubscribe(root);
				return
			}
			
			if (component.view == null && typeof component !== "function") { throw new Error("m.mount(element, component) expects a component, not a vnode") }
			
			var run0 = function() {
				redrawService0.render(root, Vnode(component));
			};
			redrawService0.subscribe(root, run0);
			redrawService0.redraw();
		}
	};
	m.mount = _16(redrawService);
	var Promise = PromisePolyfill;
	var parseQueryString = function(string) {
		if (string === "" || string == null) { return {} }
		if (string.charAt(0) === "?") { string = string.slice(1); }
		var entries = string.split("&"), data0 = {}, counters = {};
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i].split("=");
			var key5 = decodeURIComponent(entry[0]);
			var value = entry.length === 2 ? decodeURIComponent(entry[1]) : "";
			if (value === "true") { value = true; }
			else if (value === "false") { value = false; }
			var levels = key5.split(/\]\[?|\[/);
			var cursor = data0;
			if (key5.indexOf("[") > -1) { levels.pop(); }
			for (var j = 0; j < levels.length; j++) {
				var level = levels[j], nextLevel = levels[j + 1];
				var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
				var isValue = j === levels.length - 1;
				if (level === "") {
					var key5 = levels.slice(0, j).join();
					if (counters[key5] == null) { counters[key5] = 0; }
					level = counters[key5]++;
				}
				if (cursor[level] == null) {
					cursor[level] = isValue ? value : isNumber ? [] : {};
				}
				cursor = cursor[level];
			}
		}
		return data0
	};
	var coreRouter = function($window) {
		var supportsPushState = typeof $window.history.pushState === "function";
		var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout;
		function normalize1(fragment0) {
			var data = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent);
			if (fragment0 === "pathname" && data[0] !== "/") { data = "/" + data; }
			return data
		}
		var asyncId;
		function debounceAsync(callback0) {
			return function() {
				if (asyncId != null) { return }
				asyncId = callAsync0(function() {
					asyncId = null;
					callback0();
				});
			}
		}
		function parsePath(path, queryData, hashData) {
			var queryIndex = path.indexOf("?");
			var hashIndex = path.indexOf("#");
			var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length;
			if (queryIndex > -1) {
				var queryEnd = hashIndex > -1 ? hashIndex : path.length;
				var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd));
				for (var key4 in queryParams) { queryData[key4] = queryParams[key4]; }
			}
			if (hashIndex > -1) {
				var hashParams = parseQueryString(path.slice(hashIndex + 1));
				for (var key4 in hashParams) { hashData[key4] = hashParams[key4]; }
			}
			return path.slice(0, pathEnd)
		}
		var router = {prefix: "#!"};
		router.getPath = function() {
			var type2 = router.prefix.charAt(0);
			switch (type2) {
				case "#": return normalize1("hash").slice(router.prefix.length)
				case "?": return normalize1("search").slice(router.prefix.length) + normalize1("hash")
				default: return normalize1("pathname").slice(router.prefix.length) + normalize1("search") + normalize1("hash")
			}
		};
		router.setPath = function(path, data, options) {
			var queryData = {}, hashData = {};
			path = parsePath(path, queryData, hashData);
			if (data != null) {
				for (var key4 in data) { queryData[key4] = data[key4]; }
				path = path.replace(/:([^\/]+)/g, function(match2, token) {
					delete queryData[token];
					return data[token]
				});
			}
			var query = buildQueryString(queryData);
			if (query) { path += "?" + query; }
			var hash = buildQueryString(hashData);
			if (hash) { path += "#" + hash; }
			if (supportsPushState) {
				var state = options ? options.state : null;
				var title = options ? options.title : null;
				$window.onpopstate();
				if (options && options.replace) { $window.history.replaceState(state, title, router.prefix + path); }
				else { $window.history.pushState(state, title, router.prefix + path); }
			}
			else { $window.location.href = router.prefix + path; }
		};
		router.defineRoutes = function(routes, resolve, reject) {
			function resolveRoute() {
				var path = router.getPath();
				var params = {};
				var pathname = parsePath(path, params, params);
				var state = $window.history.state;
				if (state != null) {
					for (var k in state) { params[k] = state[k]; }
				}
				for (var route0 in routes) {
					var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");
					if (matcher.test(pathname)) {
						pathname.replace(matcher, function() {
							var keys = route0.match(/:[^\/]+/g) || [];
							var values = [].slice.call(arguments, 1, -2);
							for (var i = 0; i < keys.length; i++) {
								params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i]);
							}
							resolve(routes[route0], params, path, route0);
						});
						return
					}
				}
				reject(path, params);
			}
			if (supportsPushState) { $window.onpopstate = debounceAsync(resolveRoute); }
			else if (router.prefix.charAt(0) === "#") { $window.onhashchange = resolveRoute; }
			resolveRoute();
		};
		return router
	};
	var _20 = function($window, redrawService0) {
		var routeService = coreRouter($window);
		var identity = function(v) {return v};
		var render1, component, attrs3, currentPath, lastUpdate;
		var route = function(root, defaultRoute, routes) {
			if (root == null) { throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined") }
			var run1 = function() {
				if (render1 != null) { redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3))); }
			};
			var bail = function(path) {
				if (path !== defaultRoute) { routeService.setPath(defaultRoute, null, {replace: true}); }
				else { throw new Error("Could not resolve default route " + defaultRoute) }
			};
			routeService.defineRoutes(routes, function(payload, params, path) {
				var update = lastUpdate = function(routeResolver, comp) {
					if (update !== lastUpdate) { return }
					component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div";
					attrs3 = params, currentPath = path, lastUpdate = null;
					render1 = (routeResolver.render || identity).bind(routeResolver);
					run1();
				};
				if (payload.view || typeof payload === "function") { update({}, payload); }
				else {
					if (payload.onmatch) {
						Promise.resolve(payload.onmatch(params, path)).then(function(resolved) {
							update(payload, resolved);
						}, bail);
					}
					else { update(payload, "div"); }
				}
			}, bail);
			redrawService0.subscribe(root, run1);
		};
		route.set = function(path, data, options) {
			if (lastUpdate != null) {
				options = options || {};
				options.replace = true;
			}
			lastUpdate = null;
			routeService.setPath(path, data, options);
		};
		route.get = function() {return currentPath};
		route.prefix = function(prefix0) {routeService.prefix = prefix0;};
		route.link = function(vnode1) {
			vnode1.dom.setAttribute("href", routeService.prefix + vnode1.attrs.href);
			vnode1.dom.onclick = function(e) {
				if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) { return }
				e.preventDefault();
				e.redraw = false;
				var href = this.getAttribute("href");
				if (href.indexOf(routeService.prefix) === 0) { href = href.slice(routeService.prefix.length); }
				route.set(href, undefined, undefined);
			};
		};
		route.param = function(key3) {
			if(typeof attrs3 !== "undefined" && typeof key3 !== "undefined") { return attrs3[key3] }
			return attrs3
		};
		return route
	};
	m.route = _20(window, redrawService);
	m.withAttr = function(attrName, callback1, context) {
		return function(e) {
			callback1.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName));
		}
	};
	var _28 = coreRenderer(window);
	m.render = _28.render;
	m.redraw = redrawService.redraw;
	m.request = requestService.request;
	m.jsonp = requestService.jsonp;
	m.parseQueryString = parseQueryString;
	m.buildQueryString = buildQueryString;
	m.version = "1.1.6";
	m.vnode = Vnode;
	{ module["exports"] = m; }
	}());
	});

	(function(self) {

	  if (self.fetch) {
	    return
	  }

	  var support = {
	    searchParams: 'URLSearchParams' in self,
	    iterable: 'Symbol' in self && 'iterator' in Symbol,
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob();
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  };

	  if (support.arrayBuffer) {
	    var viewClasses = [
	      '[object Int8Array]',
	      '[object Uint8Array]',
	      '[object Uint8ClampedArray]',
	      '[object Int16Array]',
	      '[object Uint16Array]',
	      '[object Int32Array]',
	      '[object Uint32Array]',
	      '[object Float32Array]',
	      '[object Float64Array]'
	    ];

	    var isDataView = function(obj) {
	      return obj && DataView.prototype.isPrototypeOf(obj)
	    };

	    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
	      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
	    };
	  }

	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name);
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }

	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value);
	    }
	    return value
	  }

	  // Build a destructive iterator for the value list
	  function iteratorFor(items) {
	    var iterator = {
	      next: function() {
	        var value = items.shift();
	        return {done: value === undefined, value: value}
	      }
	    };

	    if (support.iterable) {
	      iterator[Symbol.iterator] = function() {
	        return iterator
	      };
	    }

	    return iterator
	  }

	  function Headers(headers) {
	    this.map = {};

	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value);
	      }, this);
	    } else if (Array.isArray(headers)) {
	      headers.forEach(function(header) {
	        this.append(header[0], header[1]);
	      }, this);
	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name]);
	      }, this);
	    }
	  }

	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name);
	    value = normalizeValue(value);
	    var oldValue = this.map[name];
	    this.map[name] = oldValue ? oldValue+','+value : value;
	  };

	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)];
	  };

	  Headers.prototype.get = function(name) {
	    name = normalizeName(name);
	    return this.has(name) ? this.map[name] : null
	  };

	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  };

	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = normalizeValue(value);
	  };

	  Headers.prototype.forEach = function(callback, thisArg) {
	    var this$1 = this;

	    for (var name in this$1.map) {
	      if (this$1.map.hasOwnProperty(name)) {
	        callback.call(thisArg, this$1.map[name], name, this$1);
	      }
	    }
	  };

	  Headers.prototype.keys = function() {
	    var items = [];
	    this.forEach(function(value, name) { items.push(name); });
	    return iteratorFor(items)
	  };

	  Headers.prototype.values = function() {
	    var items = [];
	    this.forEach(function(value) { items.push(value); });
	    return iteratorFor(items)
	  };

	  Headers.prototype.entries = function() {
	    var items = [];
	    this.forEach(function(value, name) { items.push([name, value]); });
	    return iteratorFor(items)
	  };

	  if (support.iterable) {
	    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
	  }

	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true;
	  }

	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result);
	      };
	      reader.onerror = function() {
	        reject(reader.error);
	      };
	    })
	  }

	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader();
	    var promise = fileReaderReady(reader);
	    reader.readAsArrayBuffer(blob);
	    return promise
	  }

	  function readBlobAsText(blob) {
	    var reader = new FileReader();
	    var promise = fileReaderReady(reader);
	    reader.readAsText(blob);
	    return promise
	  }

	  function readArrayBufferAsText(buf) {
	    var view = new Uint8Array(buf);
	    var chars = new Array(view.length);

	    for (var i = 0; i < view.length; i++) {
	      chars[i] = String.fromCharCode(view[i]);
	    }
	    return chars.join('')
	  }

	  function bufferClone(buf) {
	    if (buf.slice) {
	      return buf.slice(0)
	    } else {
	      var view = new Uint8Array(buf.byteLength);
	      view.set(new Uint8Array(buf));
	      return view.buffer
	    }
	  }

	  function Body() {
	    this.bodyUsed = false;

	    this._initBody = function(body) {
	      this._bodyInit = body;
	      if (!body) {
	        this._bodyText = '';
	      } else if (typeof body === 'string') {
	        this._bodyText = body;
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body;
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body;
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this._bodyText = body.toString();
	      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
	        this._bodyArrayBuffer = bufferClone(body.buffer);
	        // IE 10-11 can't handle a DataView body.
	        this._bodyInit = new Blob([this._bodyArrayBuffer]);
	      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
	        this._bodyArrayBuffer = bufferClone(body);
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }

	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8');
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type);
	        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	        }
	      }
	    };

	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this);
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyArrayBuffer) {
	          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      };

	      this.arrayBuffer = function() {
	        if (this._bodyArrayBuffer) {
	          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
	        } else {
	          return this.blob().then(readBlobAsArrayBuffer)
	        }
	      };
	    }

	    this.text = function() {
	      var rejected = consumed(this);
	      if (rejected) {
	        return rejected
	      }

	      if (this._bodyBlob) {
	        return readBlobAsText(this._bodyBlob)
	      } else if (this._bodyArrayBuffer) {
	        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
	      } else if (this._bodyFormData) {
	        throw new Error('could not read FormData body as text')
	      } else {
	        return Promise.resolve(this._bodyText)
	      }
	    };

	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      };
	    }

	    this.json = function() {
	      return this.text().then(JSON.parse)
	    };

	    return this
	  }

	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase();
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }

	  function Request(input, options) {
	    options = options || {};
	    var body = options.body;

	    if (input instanceof Request) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url;
	      this.credentials = input.credentials;
	      if (!options.headers) {
	        this.headers = new Headers(input.headers);
	      }
	      this.method = input.method;
	      this.mode = input.mode;
	      if (!body && input._bodyInit != null) {
	        body = input._bodyInit;
	        input.bodyUsed = true;
	      }
	    } else {
	      this.url = String(input);
	    }

	    this.credentials = options.credentials || this.credentials || 'omit';
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers);
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET');
	    this.mode = options.mode || this.mode || null;
	    this.referrer = null;

	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body);
	  }

	  Request.prototype.clone = function() {
	    return new Request(this, { body: this._bodyInit })
	  };

	  function decode(body) {
	    var form = new FormData();
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=');
	        var name = split.shift().replace(/\+/g, ' ');
	        var value = split.join('=').replace(/\+/g, ' ');
	        form.append(decodeURIComponent(name), decodeURIComponent(value));
	      }
	    });
	    return form
	  }

	  function parseHeaders(rawHeaders) {
	    var headers = new Headers();
	    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
	    // https://tools.ietf.org/html/rfc7230#section-3.2
	    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
	    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
	      var parts = line.split(':');
	      var key = parts.shift().trim();
	      if (key) {
	        var value = parts.join(':').trim();
	        headers.append(key, value);
	      }
	    });
	    return headers
	  }

	  Body.call(Request.prototype);

	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {};
	    }

	    this.type = 'default';
	    this.status = options.status === undefined ? 200 : options.status;
	    this.ok = this.status >= 200 && this.status < 300;
	    this.statusText = 'statusText' in options ? options.statusText : 'OK';
	    this.headers = new Headers(options.headers);
	    this.url = options.url || '';
	    this._initBody(bodyInit);
	  }

	  Body.call(Response.prototype);

	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  };

	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''});
	    response.type = 'error';
	    return response
	  };

	  var redirectStatuses = [301, 302, 303, 307, 308];

	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }

	    return new Response(null, {status: status, headers: {location: url}})
	  };

	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;

	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request = new Request(input, init);
	      var xhr = new XMLHttpRequest();

	      xhr.onload = function() {
	        var options = {
	          status: xhr.status,
	          statusText: xhr.statusText,
	          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
	        };
	        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options));
	      };

	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'));
	      };

	      xhr.ontimeout = function() {
	        reject(new TypeError('Network request failed'));
	      };

	      xhr.open(request.method, request.url, true);

	      if (request.credentials === 'include') {
	        xhr.withCredentials = true;
	      } else if (request.credentials === 'omit') {
	        xhr.withCredentials = false;
	      }

	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob';
	      }

	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value);
	      });

	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	    })
	  };
	  self.fetch.polyfill = true;
	})(typeof self !== 'undefined' ? self : undefined);

	// Store setTimeout reference so promise-polyfill will be unaffected by
	// other code modifying setTimeout (like sinon.useFakeTimers())
	var setTimeoutFunc = setTimeout;

	function noop() {}

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
	  return function() {
	    fn.apply(thisArg, arguments);
	  };
	}

	function Promise$1(fn) {
	  if (!(this instanceof Promise$1))
	    { throw new TypeError('Promises must be constructed via new'); }
	  if (typeof fn !== 'function') { throw new TypeError('not a function'); }
	  this._state = 0;
	  this._handled = false;
	  this._value = undefined;
	  this._deferreds = [];

	  doResolve(fn, this);
	}

	function handle(self, deferred) {
	  while (self._state === 3) {
	    self = self._value;
	  }
	  if (self._state === 0) {
	    self._deferreds.push(deferred);
	    return;
	  }
	  self._handled = true;
	  Promise$1._immediateFn(function() {
	    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
	    if (cb === null) {
	      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
	      return;
	    }
	    var ret;
	    try {
	      ret = cb(self._value);
	    } catch (e) {
	      reject(deferred.promise, e);
	      return;
	    }
	    resolve(deferred.promise, ret);
	  });
	}

	function resolve(self, newValue) {
	  try {
	    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	    if (newValue === self)
	      { throw new TypeError('A promise cannot be resolved with itself.'); }
	    if (
	      newValue &&
	      (typeof newValue === 'object' || typeof newValue === 'function')
	    ) {
	      var then = newValue.then;
	      if (newValue instanceof Promise$1) {
	        self._state = 3;
	        self._value = newValue;
	        finale(self);
	        return;
	      } else if (typeof then === 'function') {
	        doResolve(bind(then, newValue), self);
	        return;
	      }
	    }
	    self._state = 1;
	    self._value = newValue;
	    finale(self);
	  } catch (e) {
	    reject(self, e);
	  }
	}

	function reject(self, newValue) {
	  self._state = 2;
	  self._value = newValue;
	  finale(self);
	}

	function finale(self) {
	  if (self._state === 2 && self._deferreds.length === 0) {
	    Promise$1._immediateFn(function() {
	      if (!self._handled) {
	        Promise$1._unhandledRejectionFn(self._value);
	      }
	    });
	  }

	  for (var i = 0, len = self._deferreds.length; i < len; i++) {
	    handle(self, self._deferreds[i]);
	  }
	  self._deferreds = null;
	}

	function Handler(onFulfilled, onRejected, promise) {
	  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	  this.promise = promise;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, self) {
	  var done = false;
	  try {
	    fn(
	      function(value) {
	        if (done) { return; }
	        done = true;
	        resolve(self, value);
	      },
	      function(reason) {
	        if (done) { return; }
	        done = true;
	        reject(self, reason);
	      }
	    );
	  } catch (ex) {
	    if (done) { return; }
	    done = true;
	    reject(self, ex);
	  }
	}

	Promise$1.prototype['catch'] = function(onRejected) {
	  return this.then(null, onRejected);
	};

	Promise$1.prototype.then = function(onFulfilled, onRejected) {
	  var prom = new this.constructor(noop);

	  handle(this, new Handler(onFulfilled, onRejected, prom));
	  return prom;
	};

	Promise$1.prototype['finally'] = function(callback) {
	  var constructor = this.constructor;
	  return this.then(
	    function(value) {
	      return constructor.resolve(callback()).then(function() {
	        return value;
	      });
	    },
	    function(reason) {
	      return constructor.resolve(callback()).then(function() {
	        return constructor.reject(reason);
	      });
	    }
	  );
	};

	Promise$1.all = function(arr) {
	  return new Promise$1(function(resolve, reject) {
	    if (!arr || typeof arr.length === 'undefined')
	      { throw new TypeError('Promise.all accepts an array'); }
	    var args = Array.prototype.slice.call(arr);
	    if (args.length === 0) { return resolve([]); }
	    var remaining = args.length;

	    function res(i, val) {
	      try {
	        if (val && (typeof val === 'object' || typeof val === 'function')) {
	          var then = val.then;
	          if (typeof then === 'function') {
	            then.call(
	              val,
	              function(val) {
	                res(i, val);
	              },
	              reject
	            );
	            return;
	          }
	        }
	        args[i] = val;
	        if (--remaining === 0) {
	          resolve(args);
	        }
	      } catch (ex) {
	        reject(ex);
	      }
	    }

	    for (var i = 0; i < args.length; i++) {
	      res(i, args[i]);
	    }
	  });
	};

	Promise$1.resolve = function(value) {
	  if (value && typeof value === 'object' && value.constructor === Promise$1) {
	    return value;
	  }

	  return new Promise$1(function(resolve) {
	    resolve(value);
	  });
	};

	Promise$1.reject = function(value) {
	  return new Promise$1(function(resolve, reject) {
	    reject(value);
	  });
	};

	Promise$1.race = function(values) {
	  return new Promise$1(function(resolve, reject) {
	    for (var i = 0, len = values.length; i < len; i++) {
	      values[i].then(resolve, reject);
	    }
	  });
	};

	// Use polyfill for setImmediate for performance gains
	Promise$1._immediateFn =
	  (typeof setImmediate === 'function' &&
	    function(fn) {
	      setImmediate(fn);
	    }) ||
	  function(fn) {
	    setTimeoutFunc(fn, 0);
	  };

	Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
	  if (typeof console !== 'undefined' && console) {
	    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
	  }
	};

	var globalNS = (function() {
	  // the only reliable means to get the global object is
	  // `Function('return this')()`
	  // However, this causes CSP violations in Chrome apps.
	  if (typeof self !== 'undefined') {
	    return self;
	  }
	  if (typeof window !== 'undefined') {
	    return window;
	  }
	  if (typeof global !== 'undefined') {
	    return global;
	  }
	  throw new Error('unable to locate global object');
	})();

	if (!globalNS.Promise) {
	  globalNS.Promise = Promise$1;
	}

	function createCommonjsModule$1(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var _global = createCommonjsModule$1(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') { __g = global; } // eslint-disable-line no-undef
	});

	var _core = createCommonjsModule$1(function (module) {
	var core = module.exports = { version: '2.5.5' };
	if (typeof __e == 'number') { __e = core; } // eslint-disable-line no-undef
	});
	var _core_1 = _core.version;

	var _isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var _anObject = function (it) {
	  if (!_isObject(it)) { throw TypeError(it + ' is not an object!'); }
	  return it;
	};

	var _fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var _descriptors = !_fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var document$1 = _global.document;
	// typeof document.createElement is 'object' in old IE
	var is = _isObject(document$1) && _isObject(document$1.createElement);
	var _domCreate = function (it) {
	  return is ? document$1.createElement(it) : {};
	};

	var _ie8DomDefine = !_descriptors && !_fails(function () {
	  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
	});

	// 7.1.1 ToPrimitive(input [, PreferredType])

	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var _toPrimitive = function (it, S) {
	  if (!_isObject(it)) { return it; }
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) { return val; }
	  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) { return val; }
	  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) { return val; }
	  throw TypeError("Can't convert object to primitive value");
	};

	var dP = Object.defineProperty;

	var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  _anObject(O);
	  P = _toPrimitive(P, true);
	  _anObject(Attributes);
	  if (_ie8DomDefine) { try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ } }
	  if ('get' in Attributes || 'set' in Attributes) { throw TypeError('Accessors not supported!'); }
	  if ('value' in Attributes) { O[P] = Attributes.value; }
	  return O;
	};

	var _objectDp = {
		f: f
	};

	var _propertyDesc = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var _hide = _descriptors ? function (object, key, value) {
	  return _objectDp.f(object, key, _propertyDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var _has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var id = 0;
	var px = Math.random();
	var _uid = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

	var _redefine = createCommonjsModule$1(function (module) {
	var SRC = _uid('src');
	var TO_STRING = 'toString';
	var $toString = Function[TO_STRING];
	var TPL = ('' + $toString).split(TO_STRING);

	_core.inspectSource = function (it) {
	  return $toString.call(it);
	};

	(module.exports = function (O, key, val, safe) {
	  var isFunction = typeof val == 'function';
	  if (isFunction) { _has(val, 'name') || _hide(val, 'name', key); }
	  if (O[key] === val) { return; }
	  if (isFunction) { _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key))); }
	  if (O === _global) {
	    O[key] = val;
	  } else if (!safe) {
	    delete O[key];
	    _hide(O, key, val);
	  } else if (O[key]) {
	    O[key] = val;
	  } else {
	    _hide(O, key, val);
	  }
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, TO_STRING, function toString() {
	  return typeof this == 'function' && this[SRC] || $toString.call(this);
	});
	});

	var _aFunction = function (it) {
	  if (typeof it != 'function') { throw TypeError(it + ' is not a function!'); }
	  return it;
	};

	// optional / simple context binding

	var _ctx = function (fn, that, length) {
	  _aFunction(fn);
	  if (that === undefined) { return fn; }
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
	  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
	  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
	  var key, own, out, exp;
	  if (IS_GLOBAL) { source = name; }
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
	    // extend global
	    if (target) { _redefine(target, key, out, type & $export.U); }
	    // export
	    if (exports[key] != out) { _hide(exports, key, exp); }
	    if (IS_PROTO && expProto[key] != out) { expProto[key] = out; }
	  }
	};
	_global.core = _core;
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	var _export = $export;

	var toString = {}.toString;

	var _cof = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	// fallback for non-array-like ES3 and non-enumerable old V8 strings

	// eslint-disable-next-line no-prototype-builtins
	var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return _cof(it) == 'String' ? it.split('') : Object(it);
	};

	// 7.2.1 RequireObjectCoercible(argument)
	var _defined = function (it) {
	  if (it == undefined) { throw TypeError("Can't call method on  " + it); }
	  return it;
	};

	// 7.1.13 ToObject(argument)

	var _toObject = function (it) {
	  return Object(_defined(it));
	};

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	var _toInteger = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

	// 7.1.15 ToLength

	var min = Math.min;
	var _toLength = function (it) {
	  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

	// 7.2.2 IsArray(argument)

	var _isArray = Array.isArray || function isArray(arg) {
	  return _cof(arg) == 'Array';
	};

	var SHARED = '__core-js_shared__';
	var store = _global[SHARED] || (_global[SHARED] = {});
	var _shared = function (key) {
	  return store[key] || (store[key] = {});
	};

	var _wks = createCommonjsModule$1(function (module) {
	var store = _shared('wks');

	var Symbol = _global.Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
	};

	$exports.store = store;
	});

	var SPECIES = _wks('species');

	var _arraySpeciesConstructor = function (original) {
	  var C;
	  if (_isArray(original)) {
	    C = original.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) { C = undefined; }
	    if (_isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) { C = undefined; }
	    }
	  } return C === undefined ? Array : C;
	};

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)


	var _arraySpeciesCreate = function (original, length) {
	  return new (_arraySpeciesConstructor(original))(length);
	};

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex





	var _arrayMethods = function (TYPE, $create) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  var create = $create || _arraySpeciesCreate;
	  return function ($this, callbackfn, that) {
	    var O = _toObject($this);
	    var self = _iobject(O);
	    var f = _ctx(callbackfn, that, 3);
	    var length = _toLength(self.length);
	    var index = 0;
	    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var val, res;
	    for (;length > index; index++) { if (NO_HOLES || index in self) {
	      val = self[index];
	      res = f(val, index, O);
	      if (TYPE) {
	        if (IS_MAP) { result[index] = res; }   // map
	        else if (res) { switch (TYPE) {
	          case 3: return true;             // some
	          case 5: return val;              // find
	          case 6: return index;            // findIndex
	          case 2: result.push(val);        // filter
	        } } else if (IS_EVERY) { return false; } // every
	      }
	    } }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

	// 22.1.3.31 Array.prototype[@@unscopables]
	var UNSCOPABLES = _wks('unscopables');
	var ArrayProto = Array.prototype;
	if (ArrayProto[UNSCOPABLES] == undefined) { _hide(ArrayProto, UNSCOPABLES, {}); }
	var _addToUnscopables = function (key) {
	  ArrayProto[UNSCOPABLES][key] = true;
	};

	// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)

	var $find = _arrayMethods(5);
	var KEY = 'find';
	var forced = true;
	// Shouldn't skip holes
	if (KEY in []) { Array(1)[KEY](function () { forced = false; }); }
	_export(_export.P + _export.F * forced, 'Array', {
	  find: function find(callbackfn /* , that = undefined */) {
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	_addToUnscopables(KEY);

	var find = _core.Array.find;

	// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)

	var $find$1 = _arrayMethods(6);
	var KEY$1 = 'findIndex';
	var forced$1 = true;
	// Shouldn't skip holes
	if (KEY$1 in []) { Array(1)[KEY$1](function () { forced$1 = false; }); }
	_export(_export.P + _export.F * forced$1, 'Array', {
	  findIndex: function findIndex(callbackfn /* , that = undefined */) {
	    return $find$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	_addToUnscopables(KEY$1);

	var findIndex = _core.Array.findIndex;

	// to indexed object, toObject with fallback for non-array-like ES3 strings


	var _toIobject = function (it) {
	  return _iobject(_defined(it));
	};

	var max = Math.max;
	var min$1 = Math.min;
	var _toAbsoluteIndex = function (index, length) {
	  index = _toInteger(index);
	  return index < 0 ? max(index + length, 0) : min$1(index, length);
	};

	// false -> Array#indexOf
	// true  -> Array#includes



	var _arrayIncludes = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = _toIobject($this);
	    var length = _toLength(O.length);
	    var index = _toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) { while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) { return true; }
	    // Array#indexOf ignores holes, Array#includes - not
	    } } else { for (;length > index; index++) { if (IS_INCLUDES || index in O) {
	      if (O[index] === el) { return IS_INCLUDES || index || 0; }
	    } } } return !IS_INCLUDES && -1;
	  };
	};

	var shared = _shared('keys');

	var _sharedKey = function (key) {
	  return shared[key] || (shared[key] = _uid(key));
	};

	var arrayIndexOf = _arrayIncludes(false);
	var IE_PROTO = _sharedKey('IE_PROTO');

	var _objectKeysInternal = function (object, names) {
	  var O = _toIobject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) { if (key != IE_PROTO) { _has(O, key) && result.push(key); } }
	  // Don't enum bug & hidden keys
	  while (names.length > i) { if (_has(O, key = names[i++])) {
	    ~arrayIndexOf(result, key) || result.push(key);
	  } }
	  return result;
	};

	// IE 8- don't enum bug keys
	var _enumBugKeys = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)



	var _objectKeys = Object.keys || function keys(O) {
	  return _objectKeysInternal(O, _enumBugKeys);
	};

	var f$1 = Object.getOwnPropertySymbols;

	var _objectGops = {
		f: f$1
	};

	var f$2 = {}.propertyIsEnumerable;

	var _objectPie = {
		f: f$2
	};

	// 19.1.2.1 Object.assign(target, source, ...)





	var $assign = Object.assign;

	// should work with symbols and should have deterministic property order (V8 bug)
	var _objectAssign = !$assign || _fails(function () {
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var S = Symbol();
	  var K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function (k) { B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source) {
	  var arguments$1 = arguments;
	 // eslint-disable-line no-unused-vars
	  var T = _toObject(target);
	  var aLen = arguments.length;
	  var index = 1;
	  var getSymbols = _objectGops.f;
	  var isEnum = _objectPie.f;
	  while (aLen > index) {
	    var S = _iobject(arguments$1[index++]);
	    var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) { if (isEnum.call(S, key = keys[j++])) { T[key] = S[key]; } }
	  } return T;
	} : $assign;

	// 19.1.3.1 Object.assign(target, source)


	_export(_export.S + _export.F, 'Object', { assign: _objectAssign });

	var assign = _core.Object.assign;

	// 7.2.8 IsRegExp(argument)


	var MATCH = _wks('match');
	var _isRegexp = function (it) {
	  var isRegExp;
	  return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
	};

	// helper for String#{startsWith, endsWith, includes}



	var _stringContext = function (that, searchString, NAME) {
	  if (_isRegexp(searchString)) { throw TypeError('String#' + NAME + " doesn't accept regex!"); }
	  return String(_defined(that));
	};

	var MATCH$1 = _wks('match');
	var _failsIsRegexp = function (KEY) {
	  var re = /./;
	  try {
	    '/./'[KEY](re);
	  } catch (e) {
	    try {
	      re[MATCH$1] = false;
	      return !'/./'[KEY](re);
	    } catch (f) { /* empty */ }
	  } return true;
	};

	var STARTS_WITH = 'startsWith';
	var $startsWith = ''[STARTS_WITH];

	_export(_export.P + _export.F * _failsIsRegexp(STARTS_WITH), 'String', {
	  startsWith: function startsWith(searchString /* , position = 0 */) {
	    var that = _stringContext(this, searchString, STARTS_WITH);
	    var index = _toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
	    var search = String(searchString);
	    return $startsWith
	      ? $startsWith.call(that, search, index)
	      : that.slice(index, index + search.length) === search;
	  }
	});

	var startsWith = _core.String.startsWith;

	var _stringRepeat = function repeat(count) {
	  var str = String(_defined(this));
	  var res = '';
	  var n = _toInteger(count);
	  if (n < 0 || n == Infinity) { throw RangeError("Count can't be negative"); }
	  for (;n > 0; (n >>>= 1) && (str += str)) { if (n & 1) { res += str; } }
	  return res;
	};

	_export(_export.P, 'String', {
	  // 21.1.3.13 String.prototype.repeat(count)
	  repeat: _stringRepeat
	});

	var repeat = _core.String.repeat;

	var _meta = createCommonjsModule$1(function (module) {
	var META = _uid('meta');


	var setDesc = _objectDp.f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var FREEZE = !_fails(function () {
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function (it) {
	  setDesc(it, META, { value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  } });
	};
	var fastKey = function (it, create) {
	  // return primitive with prefix
	  if (!_isObject(it)) { return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it; }
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) { return 'F'; }
	    // not necessary to add metadata
	    if (!create) { return 'E'; }
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function (it, create) {
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) { return true; }
	    // not necessary to add metadata
	    if (!create) { return false; }
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) { setMeta(it); }
	  return it;
	};
	var meta = module.exports = {
	  KEY: META,
	  NEED: false,
	  fastKey: fastKey,
	  getWeak: getWeak,
	  onFreeze: onFreeze
	};
	});
	var _meta_1 = _meta.KEY;
	var _meta_2 = _meta.NEED;
	var _meta_3 = _meta.fastKey;
	var _meta_4 = _meta.getWeak;
	var _meta_5 = _meta.onFreeze;

	var def = _objectDp.f;

	var TAG = _wks('toStringTag');

	var _setToStringTag = function (it, tag, stat) {
	  if (it && !_has(it = stat ? it : it.prototype, TAG)) { def(it, TAG, { configurable: true, value: tag }); }
	};

	var f$3 = _wks;

	var _wksExt = {
		f: f$3
	};

	var _library = false;

	var defineProperty = _objectDp.f;
	var _wksDefine = function (name) {
	  var $Symbol = _core.Symbol || (_core.Symbol = _global.Symbol || {});
	  if (name.charAt(0) != '_' && !(name in $Symbol)) { defineProperty($Symbol, name, { value: _wksExt.f(name) }); }
	};

	// all enumerable object keys, includes symbols



	var _enumKeys = function (it) {
	  var result = _objectKeys(it);
	  var getSymbols = _objectGops.f;
	  if (getSymbols) {
	    var symbols = getSymbols(it);
	    var isEnum = _objectPie.f;
	    var i = 0;
	    var key;
	    while (symbols.length > i) { if (isEnum.call(it, key = symbols[i++])) { result.push(key); } }
	  } return result;
	};

	var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  _anObject(O);
	  var keys = _objectKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) { _objectDp.f(O, P = keys[i++], Properties[P]); }
	  return O;
	};

	var document$1$1 = _global.document;
	var _html = document$1$1 && document$1$1.documentElement;

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



	var IE_PROTO$1 = _sharedKey('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE$1 = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = _domCreate('iframe');
	  var i = _enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  _html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (i--) { delete createDict[PROTOTYPE$1][_enumBugKeys[i]]; }
	  return createDict();
	};

	var _objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE$1] = _anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE$1] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else { result = createDict(); }
	  return Properties === undefined ? result : _objectDps(result, Properties);
	};

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

	var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

	var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return _objectKeysInternal(O, hiddenKeys);
	};

	var _objectGopn = {
		f: f$4
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

	var gOPN = _objectGopn.f;
	var toString$1 = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return gOPN(it);
	  } catch (e) {
	    return windowNames.slice();
	  }
	};

	var f$5 = function getOwnPropertyNames(it) {
	  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
	};

	var _objectGopnExt = {
		f: f$5
	};

	var gOPD = Object.getOwnPropertyDescriptor;

	var f$6 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
	  O = _toIobject(O);
	  P = _toPrimitive(P, true);
	  if (_ie8DomDefine) { try {
	    return gOPD(O, P);
	  } catch (e) { /* empty */ } }
	  if (_has(O, P)) { return _propertyDesc(!_objectPie.f.call(O, P), O[P]); }
	};

	var _objectGopd = {
		f: f$6
	};

	// ECMAScript 6 symbols shim





	var META = _meta.KEY;



















	var gOPD$1 = _objectGopd.f;
	var dP$1 = _objectDp.f;
	var gOPN$1 = _objectGopnExt.f;
	var $Symbol = _global.Symbol;
	var $JSON = _global.JSON;
	var _stringify = $JSON && $JSON.stringify;
	var PROTOTYPE$2 = 'prototype';
	var HIDDEN = _wks('_hidden');
	var TO_PRIMITIVE = _wks('toPrimitive');
	var isEnum = {}.propertyIsEnumerable;
	var SymbolRegistry = _shared('symbol-registry');
	var AllSymbols = _shared('symbols');
	var OPSymbols = _shared('op-symbols');
	var ObjectProto = Object[PROTOTYPE$2];
	var USE_NATIVE = typeof $Symbol == 'function';
	var QObject = _global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = _descriptors && _fails(function () {
	  return _objectCreate(dP$1({}, 'a', {
	    get: function () { return dP$1(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (it, key, D) {
	  var protoDesc = gOPD$1(ObjectProto, key);
	  if (protoDesc) { delete ObjectProto[key]; }
	  dP$1(it, key, D);
	  if (protoDesc && it !== ObjectProto) { dP$1(ObjectProto, key, protoDesc); }
	} : dP$1;

	var wrap = function (tag) {
	  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D) {
	  if (it === ObjectProto) { $defineProperty(OPSymbols, key, D); }
	  _anObject(it);
	  key = _toPrimitive(key, true);
	  _anObject(D);
	  if (_has(AllSymbols, key)) {
	    if (!D.enumerable) {
	      if (!_has(it, HIDDEN)) { dP$1(it, HIDDEN, _propertyDesc(1, {})); }
	      it[HIDDEN][key] = true;
	    } else {
	      if (_has(it, HIDDEN) && it[HIDDEN][key]) { it[HIDDEN][key] = false; }
	      D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
	    } return setSymbolDesc(it, key, D);
	  } return dP$1(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P) {
	  _anObject(it);
	  var keys = _enumKeys(P = _toIobject(P));
	  var i = 0;
	  var l = keys.length;
	  var key;
	  while (l > i) { $defineProperty(it, key = keys[i++], P[key]); }
	  return it;
	};
	var $create = function create(it, P) {
	  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key) {
	  var E = isEnum.call(this, key = _toPrimitive(key, true));
	  if (this === ObjectProto && _has(AllSymbols, key) && !_has(OPSymbols, key)) { return false; }
	  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
	  it = _toIobject(it);
	  key = _toPrimitive(key, true);
	  if (it === ObjectProto && _has(AllSymbols, key) && !_has(OPSymbols, key)) { return; }
	  var D = gOPD$1(it, key);
	  if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) { D.enumerable = true; }
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it) {
	  var names = gOPN$1(_toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) { result.push(key); }
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
	  var IS_OP = it === ObjectProto;
	  var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto, key) : true)) { result.push(AllSymbols[key]); }
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if (!USE_NATIVE) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) { throw TypeError('Symbol is not a constructor!'); }
	    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function (value) {
	      if (this === ObjectProto) { $set.call(OPSymbols, value); }
	      if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) { this[HIDDEN][tag] = false; }
	      setSymbolDesc(this, tag, _propertyDesc(1, value));
	    };
	    if (_descriptors && setter) { setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set }); }
	    return wrap(tag);
	  };
	  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
	    return this._k;
	  });

	  _objectGopd.f = $getOwnPropertyDescriptor;
	  _objectDp.f = $defineProperty;
	  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
	  _objectPie.f = $propertyIsEnumerable;
	  _objectGops.f = $getOwnPropertySymbols;

	  if (_descriptors && !_library) {
	    _redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  _wksExt.f = function (name) {
	    return wrap(_wks(name));
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE, { Symbol: $Symbol });

	for (var es6Symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), j = 0; es6Symbols.length > j;){ _wks(es6Symbols[j++]); }

	for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) { _wksDefine(wellKnownSymbols[k++]); }

	_export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function (key) {
	    return _has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) { throw TypeError(sym + ' is not a symbol!'); }
	    for (var key in SymbolRegistry) { if (SymbolRegistry[key] === sym) { return key; } }
	  },
	  useSetter: function () { setter = true; },
	  useSimple: function () { setter = false; }
	});

	_export(_export.S + _export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function () {
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it) {
	    var arguments$1 = arguments;

	    var args = [it];
	    var i = 1;
	    var replacer, $replacer;
	    while (arguments.length > i) { args.push(arguments$1[i++]); }
	    $replacer = replacer = args[1];
	    if (!_isObject(replacer) && it === undefined || isSymbol(it)) { return; } // IE8 returns string on undefined
	    if (!_isArray(replacer)) { replacer = function (key, value) {
	      if (typeof $replacer == 'function') { value = $replacer.call(this, key, value); }
	      if (!isSymbol(value)) { return value; }
	    }; }
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	_setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	_setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	_setToStringTag(_global.JSON, 'JSON', true);

	// getting tag from 19.1.3.6 Object.prototype.toString()

	var TAG$1 = _wks('toStringTag');
	// ES3 wrong here
	var ARG = _cof(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (e) { /* empty */ }
	};

	var _classof = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
	    // builtinTag case
	    : ARG ? _cof(O)
	    // ES3 arguments fallback
	    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

	// 19.1.3.6 Object.prototype.toString()

	var test = {};
	test[_wks('toStringTag')] = 'z';
	if (test + '' != '[object z]') {
	  _redefine(Object.prototype, 'toString', function toString() {
	    return '[object ' + _classof(this) + ']';
	  }, true);
	}

	_wksDefine('asyncIterator');

	_wksDefine('observable');

	var symbol = _core.Symbol;

	// true  -> String#at
	// false -> String#codePointAt
	var _stringAt = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(_defined(that));
	    var i = _toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) { return TO_STRING ? '' : undefined; }
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

	var _iterators = {};

	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

	var _iterCreate = function (Constructor, NAME, next) {
	  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
	  _setToStringTag(Constructor, NAME + ' Iterator');
	};

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


	var IE_PROTO$2 = _sharedKey('IE_PROTO');
	var ObjectProto$1 = Object.prototype;

	var _objectGpo = Object.getPrototypeOf || function (O) {
	  O = _toObject(O);
	  if (_has(O, IE_PROTO$2)) { return O[IE_PROTO$2]; }
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto$1 : null;
	};

	var ITERATOR = _wks('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';

	var returnThis = function () { return this; };

	var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  _iterCreate(Constructor, NAME, next);
	  var getMethod = function (kind) {
	    if (!BUGGY && kind in proto) { return proto[kind]; }
	    switch (kind) {
	      case KEYS: return function keys() { return new Constructor(this, kind); };
	      case VALUES: return function values() { return new Constructor(this, kind); };
	    } return function entries() { return new Constructor(this, kind); };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = $native || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      _setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if (typeof IteratorPrototype[ITERATOR] != 'function') { _hide(IteratorPrototype, ITERATOR, returnThis); }
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if (BUGGY || VALUES_BUG || !proto[ITERATOR]) {
	    _hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  _iterators[NAME] = $default;
	  _iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) { for (key in methods) {
	      if (!(key in proto)) { _redefine(proto, key, methods[key]); }
	    } } else { _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods); }
	  }
	  return methods;
	};

	var $at = _stringAt(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	_iterDefine(String, 'String', function (iterated) {
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var index = this._i;
	  var point;
	  if (index >= O.length) { return { value: undefined, done: true }; }
	  point = $at(O, index);
	  this._i += point.length;
	  return { value: point, done: false };
	});

	var _iterStep = function (done, value) {
	  return { value: value, done: !!done };
	};

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
	  this._t = _toIobject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return _iterStep(1);
	  }
	  if (kind == 'keys') { return _iterStep(0, index); }
	  if (kind == 'values') { return _iterStep(0, O[index]); }
	  return _iterStep(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	_iterators.Arguments = _iterators.Array;

	_addToUnscopables('keys');
	_addToUnscopables('values');
	_addToUnscopables('entries');

	var ITERATOR$1 = _wks('iterator');
	var TO_STRING_TAG = _wks('toStringTag');
	var ArrayValues = _iterators.Array;

	var DOMIterables = {
	  CSSRuleList: true, // TODO: Not spec compliant, should be false.
	  CSSStyleDeclaration: false,
	  CSSValueList: false,
	  ClientRectList: false,
	  DOMRectList: false,
	  DOMStringList: false,
	  DOMTokenList: true,
	  DataTransferItemList: false,
	  FileList: false,
	  HTMLAllCollection: false,
	  HTMLCollection: false,
	  HTMLFormElement: false,
	  HTMLSelectElement: false,
	  MediaList: true, // TODO: Not spec compliant, should be false.
	  MimeTypeArray: false,
	  NamedNodeMap: false,
	  NodeList: true,
	  PaintRequestList: false,
	  Plugin: false,
	  PluginArray: false,
	  SVGLengthList: false,
	  SVGNumberList: false,
	  SVGPathSegList: false,
	  SVGPointList: false,
	  SVGStringList: false,
	  SVGTransformList: false,
	  SourceBufferList: false,
	  StyleSheetList: true, // TODO: Not spec compliant, should be false.
	  TextTrackCueList: false,
	  TextTrackList: false,
	  TouchList: false
	};

	for (var collections = _objectKeys(DOMIterables), i = 0; i < collections.length; i++) {
	  var NAME = collections[i];
	  var explicit = DOMIterables[NAME];
	  var Collection = _global[NAME];
	  var proto = Collection && Collection.prototype;
	  var key;
	  if (proto) {
	    if (!proto[ITERATOR$1]) { _hide(proto, ITERATOR$1, ArrayValues); }
	    if (!proto[TO_STRING_TAG]) { _hide(proto, TO_STRING_TAG, NAME); }
	    _iterators[NAME] = ArrayValues;
	    if (explicit) { for (key in es6_array_iterator) { if (!proto[key]) { _redefine(proto, key, es6_array_iterator[key], true); } } }
	  }
	}

	var iterator = _wksExt.f('iterator');

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = Object.setPrototypeOf ||
	    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	    function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };

	function __extends(d, b) {
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	function __awaiter(thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}

	function __generator(thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) { throw t[1]; } return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) { throw new TypeError("Generator is already executing."); }
	        while (_) { try {
	            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) { return t; }
	            if (y = 0, t) { op = [0, t.value]; }
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) { _.ops.pop(); }
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; } }
	        if (op[0] & 5) { throw op[1]; } return { value: op[0] ? op[1] : void 0, done: true };
	    }
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Do a deep-copy of basic JavaScript Objects or Arrays.
	 */
	function deepCopy(value) {
	    return deepExtend(undefined, value);
	}
	/**
	 * Copy properties from source to target (recursively allows extension
	 * of Objects and Arrays).  Scalar values in the target are over-written.
	 * If target is undefined, an object of the appropriate type will be created
	 * (and returned).
	 *
	 * We recursively copy all child properties of plain Objects in the source- so
	 * that namespace- like dictionaries are merged.
	 *
	 * Note that the target can be a function, in which case the properties in
	 * the source Object are copied onto it as static properties of the Function.
	 */
	function deepExtend(target, source) {
	    if (!(source instanceof Object)) {
	        return source;
	    }
	    switch (source.constructor) {
	        case Date:
	            // Treat Dates like scalars; if the target date object had any child
	            // properties - they will be lost!
	            var dateValue = source;
	            return new Date(dateValue.getTime());
	        case Object:
	            if (target === undefined) {
	                target = {};
	            }
	            break;
	        case Array:
	            // Always copy the array source and overwrite the target.
	            target = [];
	            break;
	        default:
	            // Not a plain Object - treat it as a scalar.
	            return source;
	    }
	    for (var prop in source) {
	        if (!source.hasOwnProperty(prop)) {
	            continue;
	        }
	        target[prop] = deepExtend(target[prop], source[prop]);
	    }
	    return target;
	}
	// TODO: Really needed (for JSCompiler type checking)?
	function patchProperty(obj, prop, value) {
	    obj[prop] = value;
	}

	var ERROR_NAME = 'FirebaseError';
	var captureStackTrace = Error
	    .captureStackTrace;
	var FirebaseError = /** @class */ (function () {
	    function FirebaseError(code, message) {
	        this.code = code;
	        this.message = message;
	        // We want the stack value, if implemented by Error
	        if (captureStackTrace) {
	            // Patches this.stack, omitted calls above ErrorFactory#create
	            captureStackTrace(this, ErrorFactory.prototype.create);
	        }
	        else {
	            try {
	                // In case of IE11, stack will be set only after error is raised.
	                // https://docs.microsoft.com/en-us/scripting/javascript/reference/stack-property-error-javascript
	                throw Error.apply(this, arguments);
	            }
	            catch (err) {
	                this.name = ERROR_NAME;
	                // Make non-enumerable getter for the property.
	                Object.defineProperty(this, 'stack', {
	                    get: function () {
	                        return err.stack;
	                    }
	                });
	            }
	        }
	    }
	    return FirebaseError;
	}());
	// Back-door inheritance
	FirebaseError.prototype = Object.create(Error.prototype);
	FirebaseError.prototype.constructor = FirebaseError;
	FirebaseError.prototype.name = ERROR_NAME;
	var ErrorFactory = /** @class */ (function () {
	    function ErrorFactory(service, serviceName, errors) {
	        this.service = service;
	        this.serviceName = serviceName;
	        this.errors = errors;
	        // Matches {$name}, by default.
	        this.pattern = /\{\$([^}]+)}/g;
	        // empty
	    }
	    ErrorFactory.prototype.create = function (code, data) {
	        if (data === undefined) {
	            data = {};
	        }
	        var template = this.errors[code];
	        var fullCode = this.service + '/' + code;
	        var message;
	        if (template === undefined) {
	            message = 'Error';
	        }
	        else {
	            message = template.replace(this.pattern, function (match, key) {
	                var value = data[key];
	                return value !== undefined ? value.toString() : '<' + key + '?>';
	            });
	        }
	        // Service: Error message (service/code).
	        message = this.serviceName + ': ' + message + ' (' + fullCode + ').';
	        var err = new FirebaseError(fullCode, message);
	        // Populate the Error object with message parts for programmatic
	        // accesses (e.g., e.file).
	        for (var prop in data) {
	            if (!data.hasOwnProperty(prop) || prop.slice(-1) === '_') {
	                continue;
	            }
	            err[prop] = data[prop];
	        }
	        return err;
	    };
	    return ErrorFactory;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	// Copyright 2011 The Closure Library Authors. All Rights Reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//      http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS-IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	/**
	 * @fileoverview Abstract cryptographic hash interface.
	 *
	 * See Sha1 and Md5 for sample implementations.
	 *
	 */
	/**
	 * Create a cryptographic hash instance.
	 *
	 * @constructor
	 * @struct
	 */
	var Hash = /** @class */ (function () {
	    function Hash() {
	        /**
	         * The block size for the hasher.
	         * @type {number}
	         */
	        this.blockSize = -1;
	    }
	    return Hash;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * @fileoverview SHA-1 cryptographic hash.
	 * Variable names follow the notation in FIPS PUB 180-3:
	 * http://csrc.nist.gov/publications/fips/fips180-3/fips180-3_final.pdf.
	 *
	 * Usage:
	 *   var sha1 = new sha1();
	 *   sha1.update(bytes);
	 *   var hash = sha1.digest();
	 *
	 * Performance:
	 *   Chrome 23:   ~400 Mbit/s
	 *   Firefox 16:  ~250 Mbit/s
	 *
	 */
	/**
	 * SHA-1 cryptographic hash constructor.
	 *
	 * The properties declared here are discussed in the above algorithm document.
	 * @constructor
	 * @extends {Hash}
	 * @final
	 * @struct
	 */
	var Sha1 = /** @class */ (function (_super) {
	    __extends(Sha1, _super);
	    function Sha1() {
	        var _this = _super.call(this) || this;
	        /**
	         * Holds the previous values of accumulated variables a-e in the compress_
	         * function.
	         * @type {!Array<number>}
	         * @private
	         */
	        _this.chain_ = [];
	        /**
	         * A buffer holding the partially computed hash result.
	         * @type {!Array<number>}
	         * @private
	         */
	        _this.buf_ = [];
	        /**
	         * An array of 80 bytes, each a part of the message to be hashed.  Referred to
	         * as the message schedule in the docs.
	         * @type {!Array<number>}
	         * @private
	         */
	        _this.W_ = [];
	        /**
	         * Contains data needed to pad messages less than 64 bytes.
	         * @type {!Array<number>}
	         * @private
	         */
	        _this.pad_ = [];
	        /**
	         * @private {number}
	         */
	        _this.inbuf_ = 0;
	        /**
	         * @private {number}
	         */
	        _this.total_ = 0;
	        _this.blockSize = 512 / 8;
	        _this.pad_[0] = 128;
	        for (var i = 1; i < _this.blockSize; ++i) {
	            _this.pad_[i] = 0;
	        }
	        _this.reset();
	        return _this;
	    }
	    Sha1.prototype.reset = function () {
	        this.chain_[0] = 0x67452301;
	        this.chain_[1] = 0xefcdab89;
	        this.chain_[2] = 0x98badcfe;
	        this.chain_[3] = 0x10325476;
	        this.chain_[4] = 0xc3d2e1f0;
	        this.inbuf_ = 0;
	        this.total_ = 0;
	    };
	    /**
	     * Internal compress helper function.
	     * @param {!Array<number>|!Uint8Array|string} buf Block to compress.
	     * @param {number=} opt_offset Offset of the block in the buffer.
	     * @private
	     */
	    Sha1.prototype.compress_ = function (buf, opt_offset) {
	        if (!opt_offset) {
	            opt_offset = 0;
	        }
	        var W = this.W_;
	        // get 16 big endian words
	        if (typeof buf === 'string') {
	            for (var i = 0; i < 16; i++) {
	                // TODO(user): [bug 8140122] Recent versions of Safari for Mac OS and iOS
	                // have a bug that turns the post-increment ++ operator into pre-increment
	                // during JIT compilation.  We have code that depends heavily on SHA-1 for
	                // correctness and which is affected by this bug, so I've removed all uses
	                // of post-increment ++ in which the result value is used.  We can revert
	                // this change once the Safari bug
	                // (https://bugs.webkit.org/show_bug.cgi?id=109036) has been fixed and
	                // most clients have been updated.
	                W[i] =
	                    (buf.charCodeAt(opt_offset) << 24) |
	                        (buf.charCodeAt(opt_offset + 1) << 16) |
	                        (buf.charCodeAt(opt_offset + 2) << 8) |
	                        buf.charCodeAt(opt_offset + 3);
	                opt_offset += 4;
	            }
	        }
	        else {
	            for (var i = 0; i < 16; i++) {
	                W[i] =
	                    (buf[opt_offset] << 24) |
	                        (buf[opt_offset + 1] << 16) |
	                        (buf[opt_offset + 2] << 8) |
	                        buf[opt_offset + 3];
	                opt_offset += 4;
	            }
	        }
	        // expand to 80 words
	        for (var i = 16; i < 80; i++) {
	            var t = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
	            W[i] = ((t << 1) | (t >>> 31)) & 0xffffffff;
	        }
	        var a = this.chain_[0];
	        var b = this.chain_[1];
	        var c = this.chain_[2];
	        var d = this.chain_[3];
	        var e = this.chain_[4];
	        var f, k;
	        // TODO(user): Try to unroll this loop to speed up the computation.
	        for (var i = 0; i < 80; i++) {
	            if (i < 40) {
	                if (i < 20) {
	                    f = d ^ (b & (c ^ d));
	                    k = 0x5a827999;
	                }
	                else {
	                    f = b ^ c ^ d;
	                    k = 0x6ed9eba1;
	                }
	            }
	            else {
	                if (i < 60) {
	                    f = (b & c) | (d & (b | c));
	                    k = 0x8f1bbcdc;
	                }
	                else {
	                    f = b ^ c ^ d;
	                    k = 0xca62c1d6;
	                }
	            }
	            var t = (((a << 5) | (a >>> 27)) + f + e + k + W[i]) & 0xffffffff;
	            e = d;
	            d = c;
	            c = ((b << 30) | (b >>> 2)) & 0xffffffff;
	            b = a;
	            a = t;
	        }
	        this.chain_[0] = (this.chain_[0] + a) & 0xffffffff;
	        this.chain_[1] = (this.chain_[1] + b) & 0xffffffff;
	        this.chain_[2] = (this.chain_[2] + c) & 0xffffffff;
	        this.chain_[3] = (this.chain_[3] + d) & 0xffffffff;
	        this.chain_[4] = (this.chain_[4] + e) & 0xffffffff;
	    };
	    Sha1.prototype.update = function (bytes, opt_length) {
	        var this$1 = this;

	        // TODO(johnlenz): tighten the function signature and remove this check
	        if (bytes == null) {
	            return;
	        }
	        if (opt_length === undefined) {
	            opt_length = bytes.length;
	        }
	        var lengthMinusBlock = opt_length - this.blockSize;
	        var n = 0;
	        // Using local instead of member variables gives ~5% speedup on Firefox 16.
	        var buf = this.buf_;
	        var inbuf = this.inbuf_;
	        // The outer while loop should execute at most twice.
	        while (n < opt_length) {
	            // When we have no data in the block to top up, we can directly process the
	            // input buffer (assuming it contains sufficient data). This gives ~25%
	            // speedup on Chrome 23 and ~15% speedup on Firefox 16, but requires that
	            // the data is provided in large chunks (or in multiples of 64 bytes).
	            if (inbuf == 0) {
	                while (n <= lengthMinusBlock) {
	                    this$1.compress_(bytes, n);
	                    n += this$1.blockSize;
	                }
	            }
	            if (typeof bytes === 'string') {
	                while (n < opt_length) {
	                    buf[inbuf] = bytes.charCodeAt(n);
	                    ++inbuf;
	                    ++n;
	                    if (inbuf == this$1.blockSize) {
	                        this$1.compress_(buf);
	                        inbuf = 0;
	                        // Jump to the outer loop so we use the full-block optimization.
	                        break;
	                    }
	                }
	            }
	            else {
	                while (n < opt_length) {
	                    buf[inbuf] = bytes[n];
	                    ++inbuf;
	                    ++n;
	                    if (inbuf == this$1.blockSize) {
	                        this$1.compress_(buf);
	                        inbuf = 0;
	                        // Jump to the outer loop so we use the full-block optimization.
	                        break;
	                    }
	                }
	            }
	        }
	        this.inbuf_ = inbuf;
	        this.total_ += opt_length;
	    };
	    /** @override */
	    Sha1.prototype.digest = function () {
	        var this$1 = this;

	        var digest = [];
	        var totalBits = this.total_ * 8;
	        // Add pad 0x80 0x00*.
	        if (this.inbuf_ < 56) {
	            this.update(this.pad_, 56 - this.inbuf_);
	        }
	        else {
	            this.update(this.pad_, this.blockSize - (this.inbuf_ - 56));
	        }
	        // Add # bits.
	        for (var i = this.blockSize - 1; i >= 56; i--) {
	            this$1.buf_[i] = totalBits & 255;
	            totalBits /= 256; // Don't use bit-shifting here!
	        }
	        this.compress_(this.buf_);
	        var n = 0;
	        for (var i = 0; i < 5; i++) {
	            for (var j = 24; j >= 0; j -= 8) {
	                digest[n] = (this$1.chain_[i] >> j) & 255;
	                ++n;
	            }
	        }
	        return digest;
	    };
	    return Sha1;
	}(Hash));

	/**
	 * Helper to make a Subscribe function (just like Promise helps make a
	 * Thenable).
	 *
	 * @param executor Function which can make calls to a single Observer
	 *     as a proxy.
	 * @param onNoObservers Callback when count of Observers goes to zero.
	 */
	function createSubscribe(executor, onNoObservers) {
	    var proxy = new ObserverProxy(executor, onNoObservers);
	    return proxy.subscribe.bind(proxy);
	}
	/**
	 * Implement fan-out for any number of Observers attached via a subscribe
	 * function.
	 */
	var ObserverProxy = /** @class */ (function () {
	    /**
	     * @param executor Function which can make calls to a single Observer
	     *     as a proxy.
	     * @param onNoObservers Callback when count of Observers goes to zero.
	     */
	    function ObserverProxy(executor, onNoObservers) {
	        var _this = this;
	        this.observers = [];
	        this.unsubscribes = [];
	        this.observerCount = 0;
	        // Micro-task scheduling by calling task.then().
	        this.task = Promise.resolve();
	        this.finalized = false;
	        this.onNoObservers = onNoObservers;
	        // Call the executor asynchronously so subscribers that are called
	        // synchronously after the creation of the subscribe function
	        // can still receive the very first value generated in the executor.
	        this.task
	            .then(function () {
	            executor(_this);
	        })
	            .catch(function (e) {
	            _this.error(e);
	        });
	    }
	    ObserverProxy.prototype.next = function (value) {
	        this.forEachObserver(function (observer) {
	            observer.next(value);
	        });
	    };
	    ObserverProxy.prototype.error = function (error) {
	        this.forEachObserver(function (observer) {
	            observer.error(error);
	        });
	        this.close(error);
	    };
	    ObserverProxy.prototype.complete = function () {
	        this.forEachObserver(function (observer) {
	            observer.complete();
	        });
	        this.close();
	    };
	    /**
	     * Subscribe function that can be used to add an Observer to the fan-out list.
	     *
	     * - We require that no event is sent to a subscriber sychronously to their
	     *   call to subscribe().
	     */
	    ObserverProxy.prototype.subscribe = function (nextOrObserver, error, complete) {
	        var _this = this;
	        var observer;
	        if (nextOrObserver === undefined &&
	            error === undefined &&
	            complete === undefined) {
	            throw new Error('Missing Observer.');
	        }
	        // Assemble an Observer object when passed as callback functions.
	        if (implementsAnyMethods(nextOrObserver, ['next', 'error', 'complete'])) {
	            observer = nextOrObserver;
	        }
	        else {
	            observer = {
	                next: nextOrObserver,
	                error: error,
	                complete: complete
	            };
	        }
	        if (observer.next === undefined) {
	            observer.next = noop$1;
	        }
	        if (observer.error === undefined) {
	            observer.error = noop$1;
	        }
	        if (observer.complete === undefined) {
	            observer.complete = noop$1;
	        }
	        var unsub = this.unsubscribeOne.bind(this, this.observers.length);
	        // Attempt to subscribe to a terminated Observable - we
	        // just respond to the Observer with the final error or complete
	        // event.
	        if (this.finalized) {
	            this.task.then(function () {
	                try {
	                    if (_this.finalError) {
	                        observer.error(_this.finalError);
	                    }
	                    else {
	                        observer.complete();
	                    }
	                }
	                catch (e) {
	                    // nothing
	                }
	                return;
	            });
	        }
	        this.observers.push(observer);
	        return unsub;
	    };
	    // Unsubscribe is synchronous - we guarantee that no events are sent to
	    // any unsubscribed Observer.
	    ObserverProxy.prototype.unsubscribeOne = function (i) {
	        if (this.observers === undefined || this.observers[i] === undefined) {
	            return;
	        }
	        delete this.observers[i];
	        this.observerCount -= 1;
	        if (this.observerCount === 0 && this.onNoObservers !== undefined) {
	            this.onNoObservers(this);
	        }
	    };
	    ObserverProxy.prototype.forEachObserver = function (fn) {
	        var this$1 = this;

	        if (this.finalized) {
	            // Already closed by previous event....just eat the additional values.
	            return;
	        }
	        // Since sendOne calls asynchronously - there is no chance that
	        // this.observers will become undefined.
	        for (var i = 0; i < this.observers.length; i++) {
	            this$1.sendOne(i, fn);
	        }
	    };
	    // Call the Observer via one of it's callback function. We are careful to
	    // confirm that the observe has not been unsubscribed since this asynchronous
	    // function had been queued.
	    ObserverProxy.prototype.sendOne = function (i, fn) {
	        var _this = this;
	        // Execute the callback asynchronously
	        this.task.then(function () {
	            if (_this.observers !== undefined && _this.observers[i] !== undefined) {
	                try {
	                    fn(_this.observers[i]);
	                }
	                catch (e) {
	                    // Ignore exceptions raised in Observers or missing methods of an
	                    // Observer.
	                    // Log error to console. b/31404806
	                    if (typeof console !== 'undefined' && console.error) {
	                        console.error(e);
	                    }
	                }
	            }
	        });
	    };
	    ObserverProxy.prototype.close = function (err) {
	        var _this = this;
	        if (this.finalized) {
	            return;
	        }
	        this.finalized = true;
	        if (err !== undefined) {
	            this.finalError = err;
	        }
	        // Proxy is no longer needed - garbage collect references
	        this.task.then(function () {
	            _this.observers = undefined;
	            _this.onNoObservers = undefined;
	        });
	    };
	    return ObserverProxy;
	}());
	/**
	 * Return true if the object passed in implements any of the named methods.
	 */
	function implementsAnyMethods(obj, methods) {
	    if (typeof obj !== 'object' || obj === null) {
	        return false;
	    }
	    for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
	        var method = methods_1[_i];
	        if (method in obj && typeof obj[method] === 'function') {
	            return true;
	        }
	    }
	    return false;
	}
	function noop$1() {
	    // do nothing
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var contains$1 = function (obj, key) {
	    return Object.prototype.hasOwnProperty.call(obj, key);
	};
	var DEFAULT_ENTRY_NAME = '[DEFAULT]';
	// An array to capture listeners before the true auth functions
	// exist
	var tokenListeners = [];
	/**
	 * Global context object for a collection of services using
	 * a shared authentication state.
	 */
	var FirebaseAppImpl = /** @class */ (function () {
	    function FirebaseAppImpl(options, config, firebase_) {
	        this.firebase_ = firebase_;
	        this.isDeleted_ = false;
	        this.services_ = {};
	        this.name_ = config.name;
	        this._automaticDataCollectionEnabled =
	            config.automaticDataCollectionEnabled || false;
	        this.options_ = deepCopy(options);
	        this.INTERNAL = {
	            getUid: function () { return null; },
	            getToken: function () { return Promise.resolve(null); },
	            addAuthTokenListener: function (callback) {
	                tokenListeners.push(callback);
	                // Make sure callback is called, asynchronously, in the absence of the auth module
	                setTimeout(function () { return callback(null); }, 0);
	            },
	            removeAuthTokenListener: function (callback) {
	                tokenListeners = tokenListeners.filter(function (listener) { return listener !== callback; });
	            }
	        };
	    }
	    Object.defineProperty(FirebaseAppImpl.prototype, "automaticDataCollectionEnabled", {
	        get: function () {
	            this.checkDestroyed_();
	            return this._automaticDataCollectionEnabled;
	        },
	        set: function (val) {
	            this.checkDestroyed_();
	            this._automaticDataCollectionEnabled = val;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(FirebaseAppImpl.prototype, "name", {
	        get: function () {
	            this.checkDestroyed_();
	            return this.name_;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(FirebaseAppImpl.prototype, "options", {
	        get: function () {
	            this.checkDestroyed_();
	            return this.options_;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    FirebaseAppImpl.prototype.delete = function () {
	        var _this = this;
	        return new Promise(function (resolve) {
	            _this.checkDestroyed_();
	            resolve();
	        })
	            .then(function () {
	            _this.firebase_.INTERNAL.removeApp(_this.name_);
	            var services = [];
	            Object.keys(_this.services_).forEach(function (serviceKey) {
	                Object.keys(_this.services_[serviceKey]).forEach(function (instanceKey) {
	                    services.push(_this.services_[serviceKey][instanceKey]);
	                });
	            });
	            return Promise.all(services.map(function (service) {
	                return service.INTERNAL.delete();
	            }));
	        })
	            .then(function () {
	            _this.isDeleted_ = true;
	            _this.services_ = {};
	        });
	    };
	    /**
	     * Return a service instance associated with this app (creating it
	     * on demand), identified by the passed instanceIdentifier.
	     *
	     * NOTE: Currently storage is the only one that is leveraging this
	     * functionality. They invoke it by calling:
	     *
	     * ```javascript
	     * firebase.app().storage('STORAGE BUCKET ID')
	     * ```
	     *
	     * The service name is passed to this already
	     * @internal
	     */
	    FirebaseAppImpl.prototype._getService = function (name, instanceIdentifier) {
	        if (instanceIdentifier === void 0) { instanceIdentifier = DEFAULT_ENTRY_NAME; }
	        this.checkDestroyed_();
	        if (!this.services_[name]) {
	            this.services_[name] = {};
	        }
	        if (!this.services_[name][instanceIdentifier]) {
	            /**
	             * If a custom instance has been defined (i.e. not '[DEFAULT]')
	             * then we will pass that instance on, otherwise we pass `null`
	             */
	            var instanceSpecifier = instanceIdentifier !== DEFAULT_ENTRY_NAME
	                ? instanceIdentifier
	                : undefined;
	            var service = this.firebase_.INTERNAL.factories[name](this, this.extendApp.bind(this), instanceSpecifier);
	            this.services_[name][instanceIdentifier] = service;
	        }
	        return this.services_[name][instanceIdentifier];
	    };
	    /**
	     * Callback function used to extend an App instance at the time
	     * of service instance creation.
	     */
	    FirebaseAppImpl.prototype.extendApp = function (props) {
	        var _this = this;
	        // Copy the object onto the FirebaseAppImpl prototype
	        deepExtend(this, props);
	        /**
	         * If the app has overwritten the addAuthTokenListener stub, forward
	         * the active token listeners on to the true fxn.
	         *
	         * TODO: This function is required due to our current module
	         * structure. Once we are able to rely strictly upon a single module
	         * implementation, this code should be refactored and Auth should
	         * provide these stubs and the upgrade logic
	         */
	        if (props.INTERNAL && props.INTERNAL.addAuthTokenListener) {
	            tokenListeners.forEach(function (listener) {
	                _this.INTERNAL.addAuthTokenListener(listener);
	            });
	            tokenListeners = [];
	        }
	    };
	    /**
	     * This function will throw an Error if the App has already been deleted -
	     * use before performing API actions on the App.
	     */
	    FirebaseAppImpl.prototype.checkDestroyed_ = function () {
	        if (this.isDeleted_) {
	            error('app-deleted', { name: this.name_ });
	        }
	    };
	    return FirebaseAppImpl;
	}());
	// Prevent dead-code elimination of these methods w/o invalid property
	// copying.
	(FirebaseAppImpl.prototype.name && FirebaseAppImpl.prototype.options) ||
	    FirebaseAppImpl.prototype.delete ||
	    console.log('dc');
	/**
	 * Return a firebase namespace object.
	 *
	 * In production, this will be called exactly once and the result
	 * assigned to the 'firebase' global.  It may be called multiple times
	 * in unit tests.
	 */
	function createFirebaseNamespace() {
	    var apps_ = {};
	    var factories = {};
	    var appHooks = {};
	    // A namespace is a plain JavaScript Object.
	    var namespace = {
	        // Hack to prevent Babel from modifying the object returned
	        // as the firebase namespace.
	        __esModule: true,
	        initializeApp: initializeApp,
	        app: app,
	        apps: null,
	        Promise: Promise,
	        SDK_VERSION: '5.0.4',
	        INTERNAL: {
	            registerService: registerService,
	            createFirebaseNamespace: createFirebaseNamespace,
	            extendNamespace: extendNamespace,
	            createSubscribe: createSubscribe,
	            ErrorFactory: ErrorFactory,
	            removeApp: removeApp,
	            factories: factories,
	            useAsService: useAsService,
	            Promise: Promise,
	            deepExtend: deepExtend
	        }
	    };
	    // Inject a circular default export to allow Babel users who were previously
	    // using:
	    //
	    //   import firebase from 'firebase';
	    //   which becomes: var firebase = require('firebase').default;
	    //
	    // instead of
	    //
	    //   import * as firebase from 'firebase';
	    //   which becomes: var firebase = require('firebase');
	    patchProperty(namespace, 'default', namespace);
	    // firebase.apps is a read-only getter.
	    Object.defineProperty(namespace, 'apps', {
	        get: getApps
	    });
	    /**
	     * Called by App.delete() - but before any services associated with the App
	     * are deleted.
	     */
	    function removeApp(name) {
	        var app = apps_[name];
	        callAppHooks(app, 'delete');
	        delete apps_[name];
	    }
	    /**
	     * Get the App object for a given name (or DEFAULT).
	     */
	    function app(name) {
	        name = name || DEFAULT_ENTRY_NAME;
	        if (!contains$1(apps_, name)) {
	            error('no-app', { name: name });
	        }
	        return apps_[name];
	    }
	    patchProperty(app, 'App', FirebaseAppImpl);
	    function initializeApp(options, rawConfig) {
	        if (rawConfig === void 0) { rawConfig = {}; }
	        if (typeof rawConfig !== 'object' || rawConfig === null) {
	            var name_1 = rawConfig;
	            rawConfig = { name: name_1 };
	        }
	        var config = rawConfig;
	        if (config.name === undefined) {
	            config.name = DEFAULT_ENTRY_NAME;
	        }
	        var name = config.name;
	        if (typeof name !== 'string' || !name) {
	            error('bad-app-name', { name: name + '' });
	        }
	        if (contains$1(apps_, name)) {
	            error('duplicate-app', { name: name });
	        }
	        var app = new FirebaseAppImpl(options, config, namespace);
	        apps_[name] = app;
	        callAppHooks(app, 'create');
	        return app;
	    }
	    /*
	     * Return an array of all the non-deleted FirebaseApps.
	     */
	    function getApps() {
	        // Make a copy so caller cannot mutate the apps list.
	        return Object.keys(apps_).map(function (name) { return apps_[name]; });
	    }
	    /*
	     * Register a Firebase Service.
	     *
	     * firebase.INTERNAL.registerService()
	     *
	     * TODO: Implement serviceProperties.
	     */
	    function registerService(name, createService, serviceProperties, appHook, allowMultipleInstances) {
	        // Cannot re-register a service that already exists
	        if (factories[name]) {
	            error('duplicate-service', { name: name });
	        }
	        // Capture the service factory for later service instantiation
	        factories[name] = createService;
	        // Capture the appHook, if passed
	        if (appHook) {
	            appHooks[name] = appHook;
	            // Run the **new** app hook on all existing apps
	            getApps().forEach(function (app) {
	                appHook('create', app);
	            });
	        }
	        // The Service namespace is an accessor function ...
	        var serviceNamespace = function (appArg) {
	            if (appArg === void 0) { appArg = app(); }
	            if (typeof appArg[name] !== 'function') {
	                // Invalid argument.
	                // This happens in the following case: firebase.storage('gs:/')
	                error('invalid-app-argument', { name: name });
	            }
	            // Forward service instance lookup to the FirebaseApp.
	            return appArg[name]();
	        };
	        // ... and a container for service-level properties.
	        if (serviceProperties !== undefined) {
	            deepExtend(serviceNamespace, serviceProperties);
	        }
	        // Monkey-patch the serviceNamespace onto the firebase namespace
	        namespace[name] = serviceNamespace;
	        // Patch the FirebaseAppImpl prototype
	        FirebaseAppImpl.prototype[name] = function () {
	            var arguments$1 = arguments;

	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i] = arguments$1[_i];
	            }
	            var serviceFxn = this._getService.bind(this, name);
	            return serviceFxn.apply(this, allowMultipleInstances ? args : []);
	        };
	        return serviceNamespace;
	    }
	    /**
	     * Patch the top-level firebase namespace with additional properties.
	     *
	     * firebase.INTERNAL.extendNamespace()
	     */
	    function extendNamespace(props) {
	        deepExtend(namespace, props);
	    }
	    function callAppHooks(app, eventName) {
	        Object.keys(factories).forEach(function (serviceName) {
	            // Ignore virtual services
	            var factoryName = useAsService(app, serviceName);
	            if (factoryName === null) {
	                return;
	            }
	            if (appHooks[factoryName]) {
	                appHooks[factoryName](eventName, app);
	            }
	        });
	    }
	    // Map the requested service to a registered service name
	    // (used to map auth to serverAuth service when needed).
	    function useAsService(app, name) {
	        if (name === 'serverAuth') {
	            return null;
	        }
	        var useService = name;
	        var options = app.options;
	        return useService;
	    }
	    return namespace;
	}
	function error(code, args) {
	    throw appErrors.create(code, args);
	}
	// TypeScript does not support non-string indexes!
	// let errors: {[code: AppError: string} = {
	var errors = {
	    'no-app': "No Firebase App '{$name}' has been created - " +
	        'call Firebase App.initializeApp()',
	    'bad-app-name': "Illegal App name: '{$name}",
	    'duplicate-app': "Firebase App named '{$name}' already exists",
	    'app-deleted': "Firebase App named '{$name}' already deleted",
	    'duplicate-service': "Firebase service named '{$name}' already registered",
	    'sa-not-supported': 'Initializing the Firebase SDK with a service ' +
	        'account is only allowed in a Node.js environment. On client ' +
	        'devices, you should instead initialize the SDK with an api key and ' +
	        'auth domain',
	    'invalid-app-argument': 'firebase.{$name}() takes either no argument or a ' +
	        'Firebase App instance.'
	};
	var appErrors = new ErrorFactory('app', 'Firebase', errors);

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var firebase = createFirebaseNamespace();

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * The JS SDK supports 5 log levels and also allows a user the ability to
	 * silence the logs altogether.
	 *
	 * The order is a follows:
	 * DEBUG < VERBOSE < INFO < WARN < ERROR
	 *
	 * All of the log types above the current log level will be captured (i.e. if
	 * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
	 * `VERBOSE` logs will not)
	 */
	var LogLevel;
	(function (LogLevel) {
	    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
	    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
	    LogLevel[LogLevel["INFO"] = 2] = "INFO";
	    LogLevel[LogLevel["WARN"] = 3] = "WARN";
	    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
	    LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
	})(LogLevel || (LogLevel = {}));
	/**
	 * The default log level
	 */
	var defaultLogLevel = LogLevel.INFO;
	/**
	 * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
	 * messages on to their corresponding console counterparts (if the log method
	 * is supported by the current log level)
	 */
	var defaultLogHandler = function (instance, logType) {
	    var arguments$1 = arguments;

	    var args = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        args[_i - 2] = arguments$1[_i];
	    }
	    if (logType < instance.logLevel)
	        { return; }
	    var now = new Date().toISOString();
	    switch (logType) {
	        /**
	         * By default, `console.debug` is not displayed in the developer console (in
	         * chrome). To avoid forcing users to have to opt-in to these logs twice
	         * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
	         * logs to the `console.log` function.
	         */
	        case LogLevel.DEBUG:
	            console.log.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
	            break;
	        case LogLevel.VERBOSE:
	            console.log.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
	            break;
	        case LogLevel.INFO:
	            console.info.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
	            break;
	        case LogLevel.WARN:
	            console.warn.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
	            break;
	        case LogLevel.ERROR:
	            console.error.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
	            break;
	        default:
	            throw new Error("Attempted to log a message with an invalid logType (value: " + logType + ")");
	    }
	};
	var Logger = /** @class */ (function () {
	    /**
	     * Gives you an instance of a Logger to capture messages according to
	     * Firebase's logging scheme.
	     *
	     * @param name The name that the logs will be associated with
	     */
	    function Logger(name) {
	        this.name = name;
	        /**
	         * The log level of the given Logger instance.
	         */
	        this._logLevel = defaultLogLevel;
	        /**
	         * The log handler for the Logger instance.
	         */
	        this._logHandler = defaultLogHandler;
	    }
	    Object.defineProperty(Logger.prototype, "logLevel", {
	        get: function () {
	            return this._logLevel;
	        },
	        set: function (val) {
	            if (!(val in LogLevel)) {
	                throw new TypeError('Invalid value assigned to `logLevel`');
	            }
	            this._logLevel = val;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Logger.prototype, "logHandler", {
	        get: function () {
	            return this._logHandler;
	        },
	        set: function (val) {
	            if (typeof val !== 'function') {
	                throw new TypeError('Value assigned to `logHandler` must be a function');
	            }
	            this._logHandler = val;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * The functions below are all based on the `console` interface
	     */
	    Logger.prototype.debug = function () {
	        var arguments$1 = arguments;

	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments$1[_i];
	        }
	        this._logHandler.apply(this, [this, LogLevel.DEBUG].concat(args));
	    };
	    Logger.prototype.log = function () {
	        var arguments$1 = arguments;

	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments$1[_i];
	        }
	        this._logHandler.apply(this, [this, LogLevel.VERBOSE].concat(args));
	    };
	    Logger.prototype.info = function () {
	        var arguments$1 = arguments;

	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments$1[_i];
	        }
	        this._logHandler.apply(this, [this, LogLevel.INFO].concat(args));
	    };
	    Logger.prototype.warn = function () {
	        var arguments$1 = arguments;

	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments$1[_i];
	        }
	        this._logHandler.apply(this, [this, LogLevel.WARN].concat(args));
	    };
	    Logger.prototype.error = function () {
	        var arguments$1 = arguments;

	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments$1[_i];
	        }
	        this._logHandler.apply(this, [this, LogLevel.ERROR].concat(args));
	    };
	    return Logger;
	}());

	var dist = createCommonjsModule(function (module) {
	(function() {var g,goog=goog||{},k=this;function l(a){return "string"==typeof a}function n(a,b){a=a.split(".");b=b||k;for(var c=0;c<a.length;c++){ if(b=b[a[c]],null==b){ return null; } }return b}function aa(){}
	function ba(a){var b=typeof a;if("object"==b){ if(a){if(a instanceof Array){ return "array"; }if(a instanceof Object){ return b; }var c=Object.prototype.toString.call(a);if("[object Window]"==c){ return "object"; }if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice")){ return "array"; }if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call")){ return "function" }}else { return "null"; } }
	else if("function"==b&&"undefined"==typeof a.call){ return "object"; }return b}function p(a){return "array"==ba(a)}function ca(a){var b=ba(a);return "array"==b||"object"==b&&"number"==typeof a.length}function da(a){return "function"==ba(a)}function ea(a){var b=typeof a;return "object"==b&&null!=a||"function"==b}var q="closure_uid_"+(1E9*Math.random()>>>0),fa=0;function ha(a,b,c){return a.call.apply(a.bind,arguments)}
	function ia(a,b,c){if(!a){ throw Error(); }if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function r(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?r=ha:r=ia;return r.apply(null,arguments)}
	function ja(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}}var t=Date.now||function(){return +new Date};function u(a,b){function c(){}c.prototype=b.prototype;a.H=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.Ib=function(a,c,f){
	var arguments$1 = arguments;
	for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++){ d[e-2]=arguments$1[e]; }return b.prototype[c].apply(a,d)};}function ka(a){if(Error.captureStackTrace){ Error.captureStackTrace(this,ka); }else{var b=Error().stack;b&&(this.stack=b);}a&&(this.message=String(a));}u(ka,Error);ka.prototype.name="CustomError";function la(a,b){a=a.split("%s");for(var c="",d=a.length-1,e=0;e<d;e++){ c+=a[e]+(e<b.length?b[e]:"%s"); }ka.call(this,c+a[d]);}u(la,ka);la.prototype.name="AssertionError";function ma(a,b){throw new la("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));}function w(){this.i=this.i;this.m=this.m;}var na=0;w.prototype.i=!1;w.prototype.$=function(){if(!this.i&&(this.i=!0,this.w(),0!=na)){var a=this[q]||(this[q]=++fa);}};w.prototype.w=function(){
	var this$1 = this;
	if(this.m){ for(;this.m.length;){ this$1.m.shift()(); } }};var qa=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if(l(a)){ return l(b)&&1==b.length?a.indexOf(b,0):-1; }for(var c=0;c<a.length;c++){ if(c in a&&a[c]===b){ return c; } }return -1},ra=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c);}:function(a,b,c){for(var d=a.length,e=l(a)?a.split(""):a,f=0;f<d;f++){ f in e&&b.call(c,e[f],f,a); }};
	function sa(a){a:{var b=ta;for(var c=a.length,d=l(a)?a.split(""):a,e=0;e<c;e++){ if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a} }b=-1;}return 0>b?null:l(a)?a.charAt(b):a[b]}function ua(a){if(!p(a)){ for(var b=a.length-1;0<=b;b--){ delete a[b]; } }a.length=0;}function va(a){return Array.prototype.concat.apply([],arguments)}function wa(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++){ c[d]=a[d]; }return c}return []}function xa(a){return /^[\s\xa0]*$/.test(a)}var ya=String.prototype.trim?function(a){return a.trim()}:function(a){return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]};function za(a,b){return a<b?-1:a>b?1:0}var x;a:{var Aa=k.navigator;if(Aa){var Ba=Aa.userAgent;if(Ba){x=Ba;break a}}x="";}function y(a){return -1!=x.indexOf(a)}function Ca(a,b,c){for(var d in a){ b.call(c,a[d],d,a); }}function Da(a){var b=[],c=0,d;for(d in a){ b[c++]=a[d]; }return b}function Ea(a){var b=[],c=0,d;for(d in a){ b[c++]=d; }return b}function Fa(a){var b={},c;for(c in a){ b[c]=a[c]; }return b}var Ga="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
	function Ha(a,b){
	var arguments$1 = arguments;
	for(var c,d,e=1;e<arguments.length;e++){d=arguments$1[e];for(c in d){ a[c]=d[c]; }for(var f=0;f<Ga.length;f++){ c=Ga[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c]); }}}function Ia(a){Ia[" "](a);return a}Ia[" "]=aa;function Ja(a,b){var c=Ka;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)}var La=y("Opera"),z=y("Trident")||y("MSIE"),Ma=y("Edge"),Na=Ma||z,Oa=y("Gecko")&&!(-1!=x.toLowerCase().indexOf("webkit")&&!y("Edge"))&&!(y("Trident")||y("MSIE"))&&!y("Edge"),Pa=-1!=x.toLowerCase().indexOf("webkit")&&!y("Edge");function Qa(){var a=k.document;return a?a.documentMode:void 0}var Ra;
	a:{var Sa="",Ta=function(){var a=x;if(Oa){ return /rv:([^\);]+)(\)|;)/.exec(a); }if(Ma){ return /Edge\/([\d\.]+)/.exec(a); }if(z){ return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a); }if(Pa){ return /WebKit\/(\S+)/.exec(a); }if(La){ return /(?:Version)[ \/]?(\S+)/.exec(a) }}();Ta&&(Sa=Ta?Ta[1]:"");if(z){var Ua=Qa();if(null!=Ua&&Ua>parseFloat(Sa)){Ra=String(Ua);break a}}Ra=Sa;}var Ka={};
	function Va(a){return Ja(a,function(){for(var b=0,c=ya(String(Ra)).split("."),d=ya(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var h=c[f]||"",m=d[f]||"";do{h=/(\d*)(\D*)(.*)/.exec(h)||["","","",""];m=/(\d*)(\D*)(.*)/.exec(m)||["","","",""];if(0==h[0].length&&0==m[0].length){ break; }b=za(0==h[1].length?0:parseInt(h[1],10),0==m[1].length?0:parseInt(m[1],10))||za(0==h[2].length,0==m[2].length)||za(h[2],m[2]);h=h[3];m=m[3];}while(0==b)}return 0<=b})}var Wa;var Xa=k.document;
	Wa=Xa&&z?Qa()||("CSS1Compat"==Xa.compatMode?parseInt(Ra,10):5):void 0;var Ya=Object.freeze||function(a){return a};var Za=!z||9<=Number(Wa),$a=z&&!Va("9"),ab=function(){if(!k.addEventListener||!Object.defineProperty){ return !1; }var a=!1,b=Object.defineProperty({},"passive",{get:function(){a=!0;}});k.addEventListener("test",aa,b);k.removeEventListener("test",aa,b);return a}();function A(a,b){this.type=a;this.a=this.target=b;this.Ra=!0;}A.prototype.b=function(){this.Ra=!1;};function bb(a,b){A.call(this,a?a.type:"");this.relatedTarget=this.a=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=0;this.key="";this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.pointerId=0;this.pointerType="";this.c=null;if(a){var c=this.type=a.type,d=a.changedTouches?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.a=b;if(b=a.relatedTarget){if(Oa){a:{try{Ia(b.nodeName);var e=!0;break a}catch(f){}e=!1;}e||(b=null);}}else{ "mouseover"==c?b=
	a.fromElement:"mouseout"==c&&(b=a.toElement); }this.relatedTarget=b;null===d?(this.clientX=void 0!==a.clientX?a.clientX:a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0):(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0);this.button=a.button;this.key=a.key||"";this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=
	a.metaKey;this.pointerId=a.pointerId||0;this.pointerType=l(a.pointerType)?a.pointerType:cb[a.pointerType]||"";this.c=a;a.defaultPrevented&&this.b();}}u(bb,A);var cb=Ya({2:"touch",3:"pen",4:"mouse"});bb.prototype.b=function(){bb.H.b.call(this);var a=this.c;if(a.preventDefault){ a.preventDefault(); }else if(a.returnValue=!1,$a){ try{if(a.ctrlKey||112<=a.keyCode&&123>=a.keyCode){ a.keyCode=-1; }}catch(b){} }};var db="closure_listenable_"+(1E6*Math.random()|0),eb=0;function fb(a,b,c,d,e){this.listener=a;this.proxy=null;this.src=b;this.type=c;this.capture=!!d;this.ga=e;this.key=++eb;this.Z=this.ba=!1;}function gb(a){a.Z=!0;a.listener=null;a.proxy=null;a.src=null;a.ga=null;}function hb(a){this.src=a;this.a={};this.b=0;}hb.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.a[f];a||(a=this.a[f]=[],this.b++);var h=ib(a,b,d,e);-1<h?(b=a[h],c||(b.ba=!1)):(b=new fb(b,this.src,f,!!d,e),b.ba=c,a.push(b));return b};function jb(a,b){var c=b.type;if(c in a.a){var d=a.a[c],e=qa(d,b),f;(f=0<=e)&&Array.prototype.splice.call(d,e,1);f&&(gb(b),0==a.a[c].length&&(delete a.a[c],a.b--));}}
	function ib(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.Z&&f.listener==b&&f.capture==!!c&&f.ga==d){ return e }}return -1}var kb="closure_lm_"+(1E6*Math.random()|0),lb={};function nb(a,b,c,d,e){if(d&&d.once){ return ob(a,b,c,d,e); }if(p(b)){for(var f=0;f<b.length;f++){ nb(a,b[f],c,d,e); }return null}c=pb(c);return a&&a[db]?a.Ia(b,c,ea(d)?!!d.capture:!!d,e):qb(a,b,c,!1,d,e)}
	function qb(a,b,c,d,e,f){if(!b){ throw Error("Invalid event type"); }var h=ea(e)?!!e.capture:!!e,m=rb(a);m||(a[kb]=m=new hb(a));c=m.add(b,c,d,h,f);if(c.proxy){ return c; }d=sb();c.proxy=d;d.src=a;d.listener=c;if(a.addEventListener){ ab||(e=h),void 0===e&&(e=!1),a.addEventListener(b.toString(),d,e); }else if(a.attachEvent){ a.attachEvent(tb(b.toString()),d); }else if(a.addListener&&a.removeListener){ a.addListener(d); }else { throw Error("addEventListener and attachEvent are unavailable."); }return c}
	function sb(){var a=ub,b=Za?function(c){return a.call(b.src,b.listener,c)}:function(c){c=a.call(b.src,b.listener,c);if(!c){ return c }};return b}function ob(a,b,c,d,e){if(p(b)){for(var f=0;f<b.length;f++){ ob(a,b[f],c,d,e); }return null}c=pb(c);return a&&a[db]?a.Ja(b,c,ea(d)?!!d.capture:!!d,e):qb(a,b,c,!0,d,e)}
	function vb(a,b,c,d,e){if(p(b)){ for(var f=0;f<b.length;f++){ vb(a,b[f],c,d,e); } }else{ (d=ea(d)?!!d.capture:!!d,c=pb(c),a&&a[db])?(a=a.f,b=String(b).toString(),b in a.a&&(f=a.a[b],c=ib(f,c,d,e),-1<c&&(gb(f[c]),Array.prototype.splice.call(f,c,1),0==f.length&&(delete a.a[b],a.b--)))):a&&(a=rb(a))&&(b=a.a[b.toString()],a=-1,b&&(a=ib(b,c,d,e)),(c=-1<a?b[a]:null)&&wb(c)); }}
	function wb(a){if("number"!=typeof a&&a&&!a.Z){var b=a.src;if(b&&b[db]){ jb(b.f,a); }else{var c=a.type,d=a.proxy;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent?b.detachEvent(tb(c),d):b.addListener&&b.removeListener&&b.removeListener(d);(c=rb(b))?(jb(c,a),0==c.b&&(c.src=null,b[kb]=null)):gb(a);}}}function tb(a){return a in lb?lb[a]:lb[a]="on"+a}
	function xb(a,b,c,d){var e=!0;if(a=rb(a)){ if(b=a.a[b.toString()]){ for(b=b.concat(),a=0;a<b.length;a++){var f=b[a];f&&f.capture==c&&!f.Z&&(f=yb(f,d),e=e&&!1!==f);} } }return e}function yb(a,b){var c=a.listener,d=a.ga||a.src;a.ba&&wb(a);return c.call(d,b)}
	function ub(a,b){if(a.Z){ return !0; }if(!Za){var c=b||n("window.event");b=new bb(c,this);var d=!0;if(!(0>c.keyCode||void 0!=c.returnValue)){a:{var e=!1;if(0==c.keyCode){ try{c.keyCode=-1;break a}catch(h){e=!0;} }if(e||void 0==c.returnValue){ c.returnValue=!0; }}c=[];for(e=b.a;e;e=e.parentNode){ c.push(e); }a=a.type;for(e=c.length-1;0<=e;e--){b.a=c[e];var f=xb(c[e],a,!0,b);d=d&&f;}for(e=0;e<c.length;e++){ b.a=c[e],f=xb(c[e],a,!1,b),d=d&&f; }}return d}return yb(a,new bb(b,this))}
	function rb(a){a=a[kb];return a instanceof hb?a:null}var zb="__closure_events_fn_"+(1E9*Math.random()>>>0);function pb(a){if(da(a)){ return a; }a[zb]||(a[zb]=function(b){return a.handleEvent(b)});return a[zb]}function B(){w.call(this);this.f=new hb(this);this.N=this;this.J=null;}u(B,w);B.prototype[db]=!0;g=B.prototype;g.addEventListener=function(a,b,c,d){nb(this,a,b,c,d);};g.removeEventListener=function(a,b,c,d){vb(this,a,b,c,d);};
	g.dispatchEvent=function(a){var b,c=this.J;if(c){ for(b=[];c;c=c.J){ b.push(c); } }c=this.N;var d=a.type||a;if(l(a)){ a=new A(a,c); }else if(a instanceof A){ a.target=a.target||c; }else{var e=a;a=new A(d,c);Ha(a,e);}e=!0;if(b){ for(var f=b.length-1;0<=f;f--){var h=a.a=b[f];e=Ab(h,d,!0,a)&&e;} }h=a.a=c;e=Ab(h,d,!0,a)&&e;e=Ab(h,d,!1,a)&&e;if(b){ for(f=0;f<b.length;f++){ h=a.a=b[f],e=Ab(h,d,!1,a)&&e; } }return e};
	g.w=function(){B.H.w.call(this);if(this.f){var a=this.f,c;for(c in a.a){for(var d=a.a[c],e=0;e<d.length;e++){ gb(d[e]); }delete a.a[c];a.b--;}}this.J=null;};g.Ia=function(a,b,c,d){return this.f.add(String(a),b,!1,c,d)};g.Ja=function(a,b,c,d){return this.f.add(String(a),b,!0,c,d)};
	function Ab(a,b,c,d){b=a.f.a[String(b)];if(!b){ return !0; }b=b.concat();for(var e=!0,f=0;f<b.length;++f){var h=b[f];if(h&&!h.Z&&h.capture==c){var m=h.listener,v=h.ga||h.src;h.ba&&jb(a.f,h);e=!1!==m.call(v,d)&&e;}}return e&&0!=d.Ra}function Bb(a){return /^\s*$/.test(a)?!1:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/(?:"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)[\s\u2028\u2029]*(?=:|,|]|}|$)/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,""))}function Cb(a){a=String(a);if(Bb(a)){ try{return eval("("+a+")")}catch(b){} }throw Error("Invalid JSON string: "+a);}function Db(a){var b=[];Eb(new Fb,a,b);return b.join("")}function Fb(){}
	function Eb(a,b,c){if(null==b){ c.push("null"); }else{if("object"==typeof b){if(p(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++){ c.push(e),Eb(a,d[f],c),e=","; }c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean){ b=b.valueOf(); }else{c.push("{");e="";for(d in b){ Object.prototype.hasOwnProperty.call(b,d)&&(f=b[d],"function"!=typeof f&&(c.push(e),Gb(d,c),c.push(":"),Eb(a,f,c),e=",")); }c.push("}");return}}switch(typeof b){case "string":Gb(b,c);break;case "number":c.push(isFinite(b)&&
	!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}}var Hb={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},Ib=/\uffff/.test("\uffff")?/[\\"\x00-\x1f\x7f-\uffff]/g:/[\\"\x00-\x1f\x7f-\xff]/g;
	function Gb(a,b){b.push('"',a.replace(Ib,function(a){var b=Hb[a];b||(b="\\u"+(a.charCodeAt(0)|65536).toString(16).substr(1),Hb[a]=b);return b}),'"');}function Jb(a,b){this.c=a;this.f=b;this.b=0;this.a=null;}Jb.prototype.get=function(){if(0<this.b){this.b--;var a=this.a;this.a=a.next;a.next=null;}else { a=this.c(); }return a};function Kb(){this.b=this.a=null;}var Nb=new Jb(function(){return new Lb},function(a){a.reset();});Kb.prototype.add=function(a,b){var c=Nb.get();c.set(a,b);this.b?this.b.next=c:this.a=c;this.b=c;};function Ob(){var a=Pb,b=null;a.a&&(b=a.a,a.a=a.a.next,a.a||(a.b=null),b.next=null);return b}function Lb(){this.next=this.b=this.a=null;}Lb.prototype.set=function(a,b){this.a=a;this.b=b;this.next=null;};Lb.prototype.reset=function(){this.next=this.b=this.a=null;};function Qb(a){k.setTimeout(function(){throw a;},0);}var Rb;
	function Sb(){var a=k.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!y("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow;a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+"//"+b.location.host;a=r(function(a){if(("*"==d||a.origin==d)&&a.data==
	c){ this.port1.onmessage(); }},this);b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d);}};});if("undefined"!==typeof a&&!y("Trident")&&!y("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var a=c.za;c.za=null;a();}};return function(a){d.next={za:a};d=d.next;b.port2.postMessage(0);}}return "undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?function(a){var b=document.createElement("SCRIPT");
	b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null;};document.documentElement.appendChild(b);}:function(a){k.setTimeout(a,0);}}var Tb;function Ub(){if(-1!=String(k.Promise).indexOf("[native code]")){var a=k.Promise.resolve(void 0);Tb=function(){a.then(Vb);};}else { Tb=function(){var a=Vb;!da(k.setImmediate)||k.Window&&k.Window.prototype&&!y("Edge")&&k.Window.prototype.setImmediate==k.setImmediate?(Rb||(Rb=Sb()),Rb(a)):k.setImmediate(a);}; }}var Wb=!1,Pb=new Kb;function Vb(){for(var a;a=Ob();){try{a.a.call(a.b);}catch(c){Qb(c);}var b=Nb;b.f(a);100>b.b&&(b.b++,a.next=b.a,b.a=a);}Wb=!1;}function Xb(a,b){B.call(this);this.b=a||1;this.a=b||k;this.c=r(this.qb,this);this.g=t();}u(Xb,B);g=Xb.prototype;g.ea=!1;g.O=null;g.qb=function(){if(this.ea){var a=t()-this.g;0<a&&a<.8*this.b?this.O=this.a.setTimeout(this.c,this.b-a):(this.O&&(this.a.clearTimeout(this.O),this.O=null),this.dispatchEvent("tick"),this.ea&&(this.O=this.a.setTimeout(this.c,this.b),this.g=t()));}};g.start=function(){this.ea=!0;this.O||(this.O=this.a.setTimeout(this.c,this.b),this.g=t());};
	function Yb(a){a.ea=!1;a.O&&(a.a.clearTimeout(a.O),a.O=null);}g.w=function(){Xb.H.w.call(this);Yb(this);delete this.a;};function Zb(a,b,c){if(da(a)){ c&&(a=r(a,c)); }else if(a&&"function"==typeof a.handleEvent){ a=r(a.handleEvent,a); }else { throw Error("Invalid listener argument"); }return 2147483647<Number(b)?-1:k.setTimeout(a,b||0)}function $b(a,b,c){w.call(this);this.f=null!=c?r(a,c):a;this.c=b;this.b=r(this.kb,this);this.a=[];}u($b,w);g=$b.prototype;g.ha=!1;g.Y=null;g.cb=function(a){this.a=arguments;this.Y?this.ha=!0:ac(this);};g.w=function(){$b.H.w.call(this);this.Y&&(k.clearTimeout(this.Y),this.Y=null,this.ha=!1,this.a=[]);};g.kb=function(){this.Y=null;this.ha&&(this.ha=!1,ac(this));};function ac(a){a.Y=Zb(a.b,a.c);a.f.apply(null,a.a);}function bc(a){w.call(this);this.b=a;this.a={};}u(bc,w);var cc=[];function dc(a,b,c,d){p(c)||(c&&(cc[0]=c.toString()),c=cc);for(var e=0;e<c.length;e++){var f=nb(b,c[e],d||a.handleEvent,!1,a.b||a);if(!f){ break; }a.a[f.key]=f;}}function ec(a){Ca(a.a,function(a,c){this.a.hasOwnProperty(c)&&wb(a);},a);a.a={};}bc.prototype.w=function(){bc.H.w.call(this);ec(this);};bc.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented");};function fc(a,b,c){this.reset(a,b,c,void 0,void 0);}fc.prototype.a=null;fc.prototype.reset=function(a,b,c,d,e){delete this.a;};function hc(a){this.f=a;this.b=this.c=this.a=null;}function C(a,b){this.name=a;this.value=b;}C.prototype.toString=function(){return this.name};var ic=new C("SEVERE",1E3),jc=new C("WARNING",900),kc=new C("INFO",800),lc=new C("CONFIG",700),mc=new C("FINE",500);function nc(a){if(a.c){ return a.c; }if(a.a){ return nc(a.a); }ma("Root logger has no level set.");return null}hc.prototype.log=function(a,b,c){if(a.value>=nc(this).value){ for(da(b)&&(b=b()),a=new fc(a,String(b),this.f),c&&(a.a=c),c=this;c;){ c=c.a; } }};
	var oc={},pc=null;function qc(a){pc||(pc=new hc(""),oc[""]=pc,pc.c=lc);var b;if(!(b=oc[a])){b=new hc(a);var c=a.lastIndexOf("."),d=a.substr(c+1);c=qc(a.substr(0,c));c.b||(c.b={});c.b[d]=b;b.a=c;oc[a]=b;}return b}function D(a,b){a&&a.log(jc,b,void 0);}function rc(a,b){a&&a.log(kc,b,void 0);}function E(a,b){a&&a.log(mc,b,void 0);}function sc(){this.a=qc("goog.labs.net.webChannel.WebChannelDebug");this.b=!0;}sc.prototype.Fa=function(){this.b=!1;};function tc(a,b,c,d,e,f){F(a,function(){if(a.b){ if(f){var h="";for(var m=f.split("&"),v=0;v<m.length;v++){var I=m[v].split("=");if(1<I.length){var X=I[0];I=I[1];var Mb=X.split("_");h=2<=Mb.length&&"type"==Mb[1]?h+(X+"="+I+"&"):h+(X+"=redacted&");}}}else { h=null; } }else { h=f; }return "XMLHTTP REQ ("+d+") [attempt "+e+"]: "+b+"\n"+c+"\n"+h});}
	function uc(a,b,c,d,e,f,h){F(a,function(){return "XMLHTTP RESP ("+d+") [ attempt "+e+"]: "+b+"\n"+c+"\n"+f+" "+h});}function G(a,b,c,d){F(a,function(){return "XMLHTTP TEXT ("+b+"): "+vc(a,c)+(d?" "+d:"")});}function wc(a,b){F(a,function(){return "TIMEOUT: "+b});}function H(a,b){E(a.a,b);}function xc(a,b,c){(a=a.a)&&a.log(ic,c||"Exception",b);}function F(a,b){rc(a.a,b);}function J(a,b){(a=a.a)&&a.log(ic,b,void 0);}
	function vc(a,b){if(!a.b){ return b; }if(!b){ return null; }try{var c=JSON.parse(b);if(c){ for(var d=0;d<c.length;d++){ if(p(c[d])){var e=c[d];if(!(2>e.length)){var f=e[1];if(p(f)&&!(1>f.length)){var h=f[0];if("noop"!=h&&"stop"!=h&&"close"!=h){ for(var m=1;m<f.length;m++){ f[m]=""; } }}}} } }return Db(c)}catch(v){return H(a,"Exception parsing expected JS array - probably was not JS"),b}}var yc=new B;function zc(a){A.call(this,"serverreachability",a);}u(zc,A);function Ac(a){yc.dispatchEvent(new zc(yc,a));}function Bc(a){A.call(this,"statevent",a);}u(Bc,A);function K(a){yc.dispatchEvent(new Bc(yc,a));}function Cc(a){A.call(this,"timingevent",a);}u(Cc,A);function Dc(a,b,c){yc.dispatchEvent(new Cc(yc,a,b,c));}function Ec(a,b){if(!da(a)){ throw Error("Fn must not be null and must be a function"); }return k.setTimeout(function(){a();},b)}var Fc={NO_ERROR:0,rb:1,yb:2,xb:3,ub:4,wb:5,zb:6,Ua:7,TIMEOUT:8,Cb:9};var Gc={tb:"complete",Gb:"success",Va:"error",Ua:"abort",Eb:"ready",Fb:"readystatechange",TIMEOUT:"timeout",Ab:"incrementaldata",Db:"progress",vb:"downloadprogress",Hb:"uploadprogress"};function Hc(){}Hc.prototype.a=null;function Ic(a){var b;(b=a.a)||(b={},Jc(a)&&(b[0]=!0,b[1]=!0),b=a.a=b);return b}function Kc(){}var Lc={OPEN:"a",sb:"b",Va:"c",Bb:"d"};function Mc(){A.call(this,"d");}u(Mc,A);function Nc(){A.call(this,"c");}u(Nc,A);var Oc;function Pc(){}u(Pc,Hc);function Qc(a){return (a=Jc(a))?new ActiveXObject(a):new XMLHttpRequest}function Jc(a){if(!a.b&&"undefined"==typeof XMLHttpRequest&&"undefined"!=typeof ActiveXObject){for(var b=["MSXML2.XMLHTTP.6.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP"],c=0;c<b.length;c++){var d=b[c];try{return new ActiveXObject(d),a.b=d}catch(e){}}throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");}return a.b}Oc=new Pc;function L(a,b,c,d){this.i=a;this.b=b;this.c=c;this.T=d||1;this.L=new bc(this);this.R=Rc;a=Na?125:void 0;this.S=new Xb(a);this.j=null;this.f=!1;this.l=this.g=this.h=this.J=this.D=this.U=this.s=null;this.u=[];this.a=null;this.G=0;this.m=this.o=null;this.C=-1;this.B=!1;this.N=0;this.I=null;this.v=this.X=this.K=!1;}var Rc=45E3;
	function Sc(a,b){switch(a){case 0:return "Non-200 return code ("+b+")";case 1:return "XMLHTTP failure (no data)";case 2:return "HttpConnection timeout";default:return "Unknown error"}}var Tc={},Uc={};g=L.prototype;g.setTimeout=function(a){this.R=a;};function Vc(a,b,c){a.J=1;a.h=Wc(M(b));a.l=c;a.K=!0;Xc(a,null);}function Yc(a,b,c,d){a.J=1;a.h=Wc(M(b));a.l=null;a.K=c;Xc(a,d);}
	function Xc(a,b){a.D=t();Zc(a);a.g=M(a.h);$c(a.g,"t",a.T);a.G=0;a.a=a.i.ca(a.i.ia()?b:null);0<a.N&&(a.I=new $b(r(a.Sa,a,a.a),a.N));dc(a.L,a.a,"readystatechange",a.nb);b=a.j?Fa(a.j):{};a.l?(a.o||(a.o="POST"),b["Content-Type"]="application/x-www-form-urlencoded",a.a.fa(a.g,a.o,a.l,b)):(a.o="GET",a.a.fa(a.g,a.o,null,b));Ac(1);tc(a.b,a.o,a.g,a.c,a.T,a.l);}g.nb=function(a){a=a.target;var b=this.I;b&&3==N(a)?(H(this.b,"Throttling readystatechange."),b.cb()):this.Sa(a);};
	g.Sa=function(a){try{a==this.a?ad(this):D(this.b.a,"Called back with an unexpected xmlhttp");}catch(c){if(H(this.b,"Failed call to OnXmlHttpReadyStateChanged_"),this.a&&this.a.V()){var b=this;xc(this.b,c,function(){return "ResponseText: "+b.a.V()});}else { xc(this.b,c,"No response text"); }}finally{}};
	function ad(a){var b=N(a.a),c=a.a.Ga(),d=a.a.W();if(!(3>b||3==b&&!Na&&!a.a.V())){a.B||4!=b||7==c||(8==c||0>=d?Ac(3):Ac(2));bd(a);var e=a.a.W();a.C=e;(c=a.a.V())||H(a.b,function(){return "No response text for uri "+a.g+" status "+e});a.f=200==e;uc(a.b,a.o,a.g,a.c,a.T,b,e);if(a.f){if(d=cd(a)){ G(a.b,a.c,d,"Initial handshake response via X-HTTP-Initial-Response"),a.v=!0,dd(a,d); }a.K?(ed(a,b,c),Na&&a.f&&3==b&&fd(a)):(G(a.b,a.c,c,null),dd(a,c));4==b&&gd(a);a.f&&!a.B&&(4==b?a.i.ta(a):(a.f=!1,Zc(a)));}else { 400==
	e&&0<c.indexOf("Unknown SID")?(a.m=3,K(12),D(a.b.a,"XMLHTTP Unknown SID ("+a.c+")")):(a.m=0,K(13),D(a.b.a,"XMLHTTP Bad status "+e+" ("+a.c+")")),gd(a),hd(a); }}}function cd(a){return !a.X||a.v?null:a.a&&(a=id(a.a,"X-HTTP-Initial-Response"))&&!xa(a)?a:null}
	function ed(a,b,c){for(var d=!0;!a.B&&a.G<c.length;){var e=jd(a,c);if(e==Uc){4==b&&(a.m=4,K(14),d=!1);G(a.b,a.c,null,"[Incomplete Response]");break}else if(e==Tc){a.m=4;K(15);G(a.b,a.c,c,"[Invalid Chunk]");d=!1;break}else { G(a.b,a.c,e,null),dd(a,e); }}4==b&&0==c.length&&(a.m=1,K(16),d=!1);a.f=a.f&&d;d||(G(a.b,a.c,c,"[Invalid Chunked Response]"),gd(a),hd(a));}g.mb=function(){if(this.a){var a=N(this.a),b=this.a.V();this.G<b.length&&(bd(this),ed(this,a,b),this.f&&4!=a&&Zc(this));}};
	function fd(a){dc(a.L,a.S,"tick",a.mb);a.S.start();}function jd(a,b){var c=a.G,d=b.indexOf("\n",c);if(-1==d){ return Uc; }c=Number(b.substring(c,d));if(isNaN(c)){ return Tc; }d+=1;if(d+c>b.length){ return Uc; }b=b.substr(d,c);a.G=d+c;return b}g.cancel=function(){this.B=!0;gd(this);};function Zc(a){a.U=t()+a.R;kd(a,a.R);}function kd(a,b){if(null!=a.s){ throw Error("WatchDog timer not null"); }a.s=Ec(r(a.lb,a),b);}function bd(a){a.s&&(k.clearTimeout(a.s),a.s=null);}
	g.lb=function(){this.s=null;var a=t();0<=a-this.U?(this.f&&J(this.b,"Received watchdog timeout even though request loaded successfully"),wc(this.b,this.g),2!=this.J&&(Ac(3),K(17)),gd(this),this.m=2,hd(this)):(D(this.b.a,"WatchDog timer called too early"),kd(this,this.U-a));};function hd(a){a.i.La()||a.B||a.i.ta(a);}function gd(a){bd(a);var b=a.I;b&&"function"==typeof b.$&&b.$();a.I=null;Yb(a.S);ec(a.L);a.a&&(b=a.a,a.a=null,b.abort(),b.$());}
	function dd(a,b){try{a.i.Oa(a,b),Ac(4);}catch(c){xc(a.b,c,"Error in httprequest callback");}}function ld(a){if(a.A&&"function"==typeof a.A){ return a.A(); }if(l(a)){ return a.split(""); }if(ca(a)){for(var b=[],c=a.length,d=0;d<c;d++){ b.push(a[d]); }return b}return Da(a)}
	function md(a,b){if(a.forEach&&"function"==typeof a.forEach){ a.forEach(b,void 0); }else if(ca(a)||l(a)){ ra(a,b,void 0); }else{if(a.M&&"function"==typeof a.M){ var c=a.M(); }else if(a.A&&"function"==typeof a.A){ c=void 0; }else if(ca(a)||l(a)){c=[];for(var d=a.length,e=0;e<d;e++){ c.push(e); }}else { c=Ea(a); }d=ld(a);e=d.length;for(var f=0;f<e;f++){ b.call(void 0,d[f],c&&c[f],a); }}}function O(a,b){
	var arguments$1 = arguments;
	var this$1 = this;
	this.b={};this.a=[];this.c=0;var c=arguments.length;if(1<c){if(c%2){ throw Error("Uneven number of arguments"); }for(var d=0;d<c;d+=2){ this$1.set(arguments$1[d],arguments$1[d+1]); }}else if(a){ if(a instanceof O){ for(c=a.M(),d=0;d<c.length;d++){ this$1.set(c[d],a.get(c[d])); } }else { for(d in a){ this$1.set(d,a[d]); } } }}g=O.prototype;g.A=function(){
	var this$1 = this;
	nd(this);for(var a=[],b=0;b<this.a.length;b++){ a.push(this$1.b[this$1.a[b]]); }return a};g.M=function(){nd(this);return this.a.concat()};
	function od(a){a.b={};a.a.length=0;a.c=0;}function pd(a,b){return P(a.b,b)?(delete a.b[b],a.c--,a.a.length>2*a.c&&nd(a),!0):!1}function nd(a){if(a.c!=a.a.length){for(var b=0,c=0;b<a.a.length;){var d=a.a[b];P(a.b,d)&&(a.a[c++]=d);b++;}a.a.length=c;}if(a.c!=a.a.length){var e={};for(c=b=0;b<a.a.length;){ d=a.a[b],P(e,d)||(a.a[c++]=d,e[d]=1),b++; }a.a.length=c;}}g.get=function(a,b){return P(this.b,a)?this.b[a]:b};g.set=function(a,b){P(this.b,a)||(this.c++,this.a.push(a));this.b[a]=b;};
	g.forEach=function(a,b){
	var this$1 = this;
	for(var c=this.M(),d=0;d<c.length;d++){var e=c[d],f=this$1.get(e);a.call(b,f,e,this$1);}};function P(a,b){return Object.prototype.hasOwnProperty.call(a,b)}var qd=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;function rd(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e=null;if(0<=d){var f=a[c].substring(0,d);e=a[c].substring(d+1);}else { f=a[c]; }b(f,e?decodeURIComponent(e.replace(/\+/g," ")):"");}}}function Q(a,b){this.b=this.j=this.f="";this.i=null;this.g=this.a="";this.h=!1;var c;a instanceof Q?(this.h=void 0!==b?b:a.h,sd(this,a.f),this.j=a.j,td(this,a.b),ud(this,a.i),this.a=a.a,vd(this,wd(a.c)),this.g=a.g):a&&(c=String(a).match(qd))?(this.h=!!b,sd(this,c[1]||"",!0),this.j=xd(c[2]||""),td(this,c[3]||"",!0),ud(this,c[4]),this.a=xd(c[5]||"",!0),vd(this,c[6]||"",!0),this.g=xd(c[7]||"")):(this.h=!!b,this.c=new yd(null,this.h));}
	Q.prototype.toString=function(){var a=[],b=this.f;b&&a.push(zd(b,Ad,!0),":");var c=this.b;if(c||"file"==b){ a.push("//"),(b=this.j)&&a.push(zd(b,Ad,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.i,null!=c&&a.push(":",String(c)); }if(c=this.a){ this.b&&"/"!=c.charAt(0)&&a.push("/"),a.push(zd(c,"/"==c.charAt(0)?Bd:Cd,!0)); }(c=this.c.toString())&&a.push("?",c);(c=this.g)&&a.push("#",zd(c,Dd));return a.join("")};
	Q.prototype.resolve=function(a){var b=M(this),c=!!a.f;c?sd(b,a.f):c=!!a.j;c?b.j=a.j:c=!!a.b;c?td(b,a.b):c=null!=a.i;var d=a.a;if(c){ ud(b,a.i); }else if(c=!!a.a){if("/"!=d.charAt(0)){ if(this.b&&!this.a){ d="/"+d; }else{var e=b.a.lastIndexOf("/");-1!=e&&(d=b.a.substr(0,e+1)+d);} }e=d;if(".."==e||"."==e){ d=""; }else if(-1!=e.indexOf("./")||-1!=e.indexOf("/.")){d=0==e.lastIndexOf("/",0);e=e.split("/");for(var f=[],h=0;h<e.length;){var m=e[h++];"."==m?d&&h==e.length&&f.push(""):".."==m?((1<f.length||1==f.length&&""!=
	f[0])&&f.pop(),d&&h==e.length&&f.push("")):(f.push(m),d=!0);}d=f.join("/");}else { d=e; }}c?b.a=d:c=""!==a.c.toString();c?vd(b,wd(a.c)):c=!!a.g;c&&(b.g=a.g);return b};function M(a){return new Q(a)}function sd(a,b,c){a.f=c?xd(b,!0):b;a.f&&(a.f=a.f.replace(/:$/,""));}function td(a,b,c){a.b=c?xd(b,!0):b;}function ud(a,b){if(b){b=Number(b);if(isNaN(b)||0>b){ throw Error("Bad port number "+b); }a.i=b;}else { a.i=null; }}function vd(a,b,c){b instanceof yd?(a.c=b,Ed(a.c,a.h)):(c||(b=zd(b,Fd)),a.c=new yd(b,a.h));}
	function R(a,b,c){a.c.set(b,c);}function $c(a,b,c){p(c)||(c=[String(c)]);Gd(a.c,b,c);}function Wc(a){R(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^t()).toString(36));return a}function Hd(a){return a instanceof Q?M(a):new Q(a,void 0)}function Id(a,b,c,d){var e=new Q(null,void 0);a&&sd(e,a);b&&td(e,b);c&&ud(e,c);d&&(e.a=d);return e}function xd(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}
	function zd(a,b,c){return l(a)?(a=encodeURI(a).replace(b,Jd),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Jd(a){a=a.charCodeAt(0);return "%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Ad=/[#\/\?@]/g,Cd=/[#\?:]/g,Bd=/[#\?]/g,Fd=/[#\?@]/g,Dd=/#/g;function yd(a,b){this.b=this.a=null;this.c=a||null;this.f=!!b;}function S(a){a.a||(a.a=new O,a.b=0,a.c&&rd(a.c,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c);}));}g=yd.prototype;
	g.add=function(a,b){S(this);this.c=null;a=Kd(this,a);var c=this.a.get(a);c||this.a.set(a,c=[]);c.push(b);this.b+=1;return this};function Ld(a,b){S(a);b=Kd(a,b);P(a.a.b,b)&&(a.c=null,a.b-=a.a.get(b).length,pd(a.a,b));}function Md(a,b){S(a);b=Kd(a,b);return P(a.a.b,b)}g.forEach=function(a,b){S(this);this.a.forEach(function(c,d){ra(c,function(c){a.call(b,c,d,this);},this);},this);};
	g.M=function(){S(this);for(var a=this.a.A(),b=this.a.M(),c=[],d=0;d<b.length;d++){ for(var e=a[d],f=0;f<e.length;f++){ c.push(b[d]); } }return c};g.A=function(a){S(this);var b=[];if(l(a)){ Md(this,a)&&(b=va(b,this.a.get(Kd(this,a)))); }else{a=this.a.A();for(var c=0;c<a.length;c++){ b=va(b,a[c]); }}return b};g.set=function(a,b){S(this);this.c=null;a=Kd(this,a);Md(this,a)&&(this.b-=this.a.get(a).length);this.a.set(a,[b]);this.b+=1;return this};g.get=function(a,b){a=a?this.A(a):[];return 0<a.length?String(a[0]):b};
	function Gd(a,b,c){Ld(a,b);0<c.length&&(a.c=null,a.a.set(Kd(a,b),wa(c)),a.b+=c.length);}g.toString=function(){
	var this$1 = this;
	if(this.c){ return this.c; }if(!this.a){ return ""; }for(var a=[],b=this.a.M(),c=0;c<b.length;c++){var d=b[c],e=encodeURIComponent(String(d));d=this$1.A(d);for(var f=0;f<d.length;f++){var h=e;""!==d[f]&&(h+="="+encodeURIComponent(String(d[f])));a.push(h);}}return this.c=a.join("&")};function wd(a){var b=new yd;b.c=a.c;a.a&&(b.a=new O(a.a),b.b=a.b);return b}
	function Kd(a,b){b=String(b);a.f&&(b=b.toLowerCase());return b}function Ed(a,b){b&&!a.f&&(S(a),a.c=null,a.a.forEach(function(a,b){var c=b.toLowerCase();b!=c&&(Ld(this,b),Gd(this,c,a));},a));a.f=b;}function Pd(){}function Qd(){}u(Qd,Pd);function Rd(a,b){this.a=a;this.b=b;this.c=this.i=null;this.h=!1;this.m=null;this.f=-1;this.l=this.g=null;}g=Rd.prototype;g.P=null;
	function Sd(a){H(a.b,"TestConnection: starting stage 2");var b=a.a.I.a;if(null!=b){ H(a.b,function(){return "TestConnection: skipping stage 2, precomputed result is "+b?"Buffered":"Unbuffered"}),K(4),b?(K(10),Td(a.a,a,!1)):(K(11),Td(a.a,a,!0)); }else{a.c=new L(a,a.b,void 0,void 0);a.c.j=a.i;var c=Ud(a.a,a.g,a.m);K(4);$c(c,"TYPE","xmlhttp");var d=a.a.j,e=a.a.K;d&&e&&R(c,d,e);Yc(a.c,c,!1,a.g);}}g.ca=function(a){return this.a.ca(a)};g.abort=function(){this.c&&(this.c.cancel(),this.c=null);this.f=-1;};
	g.La=function(){return !1};
	g.Oa=function(a,b){this.f=a.C;if(0==this.P){H(this.b,"TestConnection: Got data for stage 1");if(!this.a.o&&(a=a.a)){var c=id(a,"X-Client-Wire-Protocol");this.l=c?c:null;this.a.j&&((a=id(a,"X-HTTP-Session-Id"))?this.a.K=a:D(this.b.a,"Missing X_HTTP_SESSION_ID in the handshake response"));}if(b){try{var d=this.a.la.a.parse(b);}catch(e){xc(this.b,e);Vd(this.a,this);return}this.g=d[0];}else { H(this.b,"TestConnection: Null responseText"),Vd(this.a,this); }}else if(1==this.P){ if(this.h){ K(6); }else if("11111"==b){if(K(5),
	this.h=!0,!z||10<=Number(Wa)){ this.f=200,this.c.cancel(),H(this.b,"Test connection succeeded; using streaming connection"),K(11),Td(this.a,this,!0); }}else { K(7),this.h=!1; } }};
	g.ta=function(){this.f=this.c.C;this.c.f?0==this.P?(this.P=1,H(this.b,"TestConnection: request complete for initial check"),Sd(this)):1==this.P&&(H(this.b,"TestConnection: request complete for stage 2"),this.h?(H(this.b,"Test connection succeeded; using streaming connection"),K(11),Td(this.a,this,!0)):(H(this.b,"Test connection failed; not using streaming"),K(10),Td(this.a,this,!1))):(H(this.b,"TestConnection: request failed, in state "+this.P),0==this.P?K(8):1==this.P&&K(9),Vd(this.a,this));};
	g.ia=function(){return this.a.ia()};g.qa=function(){return this.a.qa()};function Wd(){this.a=this.b=null;}function Xd(){this.a=new O;}function Yd(a){var b=typeof a;return "object"==b&&a||"function"==b?"o"+(a[q]||(a[q]=++fa)):b.charAt(0)+a}Xd.prototype.add=function(a){this.a.set(Yd(a),a);};Xd.prototype.A=function(){return this.a.A()};function Zd(a,b){this.a=a;this.b=b;}function $d(a){this.g=a||ae;k.PerformanceNavigationTiming?(a=k.performance.getEntriesByType("navigation"),a=0<a.length&&("hq"==a[0].nextHopProtocol||"h2"==a[0].nextHopProtocol)):a=!!(k.oa&&k.oa.Ma&&k.oa.Ma()&&k.oa.Ma().Jb);this.f=a?this.g:1;this.a=null;1<this.f&&(this.a=new Xd);this.b=null;this.c=[];}var ae=10;function be(a,b){a.a||-1==b.indexOf("spdy")&&-1==b.indexOf("quic")&&-1==b.indexOf("h2")||(a.f=a.g,a.a=new Xd,a.b&&(ce(a,a.b),a.b=null));}function de(a){return a.b?!0:a.a?a.a.a.c>=a.f:!1}
	function ee(a,b){a.b?a=a.b==b:a.a?(b=Yd(b),a=P(a.a.a.b,b)):a=!1;return a}function ce(a,b){a.a?a.a.add(b):a.b=b;}function fe(a,b){if(a.b&&a.b==b){ a.b=null; }else{var c;if(c=a.a){ c=Yd(b),c=P(a.a.a.b,c); }c&&pd(a.a.a,Yd(b));}}$d.prototype.cancel=function(){this.c=ge(this);this.b?(this.b.cancel(),this.b=null):this.a&&0!=this.a.a.c&&(ra(this.a.A(),function(a){a.cancel();}),od(this.a.a));};
	function ge(a){if(null!=a.b){ return a.c.concat(a.b.u); }if(null!=a.a&&0!=a.a.a.c){var b=a.c;ra(a.a.A(),function(a){b=b.concat(a.u);});return b}return wa(a.c)}function he(a,b){a.c=a.c.concat(b);}function ie(){}ie.prototype.stringify=function(a){return k.JSON.stringify(a,void 0)};ie.prototype.parse=function(a){return k.JSON.parse(a,void 0)};function je(){this.a=new ie;}function ke(a,b,c){var d=c||"";try{md(a,function(a,c){var e=a;ea(a)&&(e=Db(a));b.push(d+c+"="+encodeURIComponent(e));});}catch(e){throw b.push(d+"type="+encodeURIComponent("_badmap")),e;}}function le(a,b){var c=new sc;H(c,"TestLoadImage: loading "+a);var d=new Image;d.onload=ja(me,c,d,"TestLoadImage: loaded",!0,b);d.onerror=ja(me,c,d,"TestLoadImage: error",!1,b);d.onabort=ja(me,c,d,"TestLoadImage: abort",!1,b);d.ontimeout=ja(me,c,d,"TestLoadImage: timeout",!1,b);k.setTimeout(function(){if(d.ontimeout){ d.ontimeout(); }},1E4);d.src=a;}function me(a,b,c,d,e){try{H(a,c),b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null,e(d);}catch(f){xc(a,f);}}function T(a){B.call(this);this.headers=new O;this.s=a||null;this.c=!1;this.D=this.a=null;this.K=this.B="";this.j=0;this.g="";this.h=this.I=this.u=this.G=!1;this.l=0;this.C=null;this.L=ne;this.v=this.o=!1;}u(T,B);var ne="";T.prototype.b=qc("goog.net.XhrIo");var oe=/^https?$/i,pe=["POST","PUT"];g=T.prototype;
	g.fa=function(a,b,c,d){if(this.a){ throw Error("[goog.net.XhrIo] Object is active with another request="+this.B+"; newUri="+a); }b=b?b.toUpperCase():"GET";this.B=a;this.g="";this.j=0;this.K=b;this.G=!1;this.c=!0;this.a=this.s?Qc(this.s):Qc(Oc);this.D=this.s?Ic(this.s):Ic(Oc);this.a.onreadystatechange=r(this.Na,this);try{E(this.b,U(this,"Opening Xhr")),this.I=!0,this.a.open(b,String(a),!0),this.I=!1;}catch(f){E(this.b,U(this,"Error opening Xhr: "+f.message));qe(this,f);return}a=c||"";var e=new O(this.headers);
	d&&md(d,function(a,b){e.set(b,a);});d=sa(e.M());c=k.FormData&&a instanceof k.FormData;!(0<=qa(pe,b))||d||c||e.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");e.forEach(function(a,b){this.a.setRequestHeader(b,a);},this);this.L&&(this.a.responseType=this.L);"withCredentials"in this.a&&this.a.withCredentials!==this.o&&(this.a.withCredentials=this.o);try{re(this),0<this.l&&(this.v=se(this.a),E(this.b,U(this,"Will abort after "+this.l+"ms if incomplete, xhr2 "+this.v)),this.v?(this.a.timeout=
	this.l,this.a.ontimeout=r(this.Ka,this)):this.C=Zb(this.Ka,this.l,this)),E(this.b,U(this,"Sending request")),this.u=!0,this.a.send(a),this.u=!1;}catch(f){E(this.b,U(this,"Send error: "+f.message)),qe(this,f);}};function se(a){return z&&Va(9)&&"number"==typeof a.timeout&&void 0!==a.ontimeout}function ta(a){return "content-type"==a.toLowerCase()}
	g.Ka=function(){"undefined"!=typeof goog&&this.a&&(this.g="Timed out after "+this.l+"ms, aborting",this.j=8,E(this.b,U(this,this.g)),this.dispatchEvent("timeout"),this.abort(8));};function qe(a,b){a.c=!1;a.a&&(a.h=!0,a.a.abort(),a.h=!1);a.g=b;a.j=5;te(a);ue(a);}function te(a){a.G||(a.G=!0,a.dispatchEvent("complete"),a.dispatchEvent("error"));}
	g.abort=function(a){this.a&&this.c&&(E(this.b,U(this,"Aborting")),this.c=!1,this.h=!0,this.a.abort(),this.h=!1,this.j=a||7,this.dispatchEvent("complete"),this.dispatchEvent("abort"),ue(this));};g.w=function(){this.a&&(this.c&&(this.c=!1,this.h=!0,this.a.abort(),this.h=!1),ue(this,!0));T.H.w.call(this);};g.Na=function(){this.i||(this.I||this.u||this.h?ve(this):this.jb());};g.jb=function(){ve(this);};
	function ve(a){if(a.c&&"undefined"!=typeof goog){ if(a.D[1]&&4==N(a)&&2==a.W()){ E(a.b,U(a,"Local request error detected and ignored")); }else if(a.u&&4==N(a)){ Zb(a.Na,0,a); }else if(a.dispatchEvent("readystatechange"),4==N(a)){E(a.b,U(a,"Request complete"));a.c=!1;try{var b=a.W();a:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break a;default:c=!1;}var d;if(!(d=c)){var e;if(e=0===b){var f=String(a.B).match(qd)[1]||null;if(!f&&k.self&&k.self.location){var h=k.self.location.protocol;
	f=h.substr(0,h.length-1);}e=!oe.test(f?f.toLowerCase():"");}d=e;}d?(a.dispatchEvent("complete"),a.dispatchEvent("success")):(a.j=6,a.g=a.Ha()+" ["+a.W()+"]",te(a));}finally{ue(a);}} }}function ue(a,b){if(a.a){re(a);var c=a.a,d=a.D[0]?aa:null;a.a=null;a.D=null;b||a.dispatchEvent("ready");try{c.onreadystatechange=d;}catch(e){(a=a.b)&&a.log(ic,"Problem encountered resetting onreadystatechange: "+e.message,void 0);}}}function re(a){a.a&&a.v&&(a.a.ontimeout=null);a.C&&(k.clearTimeout(a.C),a.C=null);}
	function N(a){return a.a?a.a.readyState:0}g.W=function(){try{return 2<N(this)?this.a.status:-1}catch(a){return -1}};g.Ha=function(){try{return 2<N(this)?this.a.statusText:""}catch(a){return E(this.b,"Can not get status: "+a.message),""}};g.V=function(){try{return this.a?this.a.responseText:""}catch(a){return E(this.b,"Can not get responseText: "+a.message),""}};
	g.eb=function(a){if(this.a){var b=this.a.responseText;a&&0==b.indexOf(a)&&(b=b.substring(a.length));a:{a=b;if(k.JSON){ try{var c=k.JSON.parse(a);break a}catch(d){} }c=Cb(a);}return c}};function id(a,b){return a.a?a.a.getResponseHeader(b):null}g.Ga=function(){return this.j};g.hb=function(){return l(this.g)?this.g:String(this.g)};function U(a,b){return b+" ["+a.K+" "+a.B+" "+a.W()+"]"}function we(a){var b="";Ca(a,function(a,d){b+=d;b+=":";b+=a;b+="\r\n";});return b}function xe(a,b,c){a:{for(d in c){var d=!1;break a}d=!0;}if(d){ return a; }c=we(c);if(l(a)){b=encodeURIComponent(String(b));c=null!=c?"="+encodeURIComponent(String(c)):"";if(b+=c){c=a.indexOf("#");0>c&&(c=a.length);d=a.indexOf("?");if(0>d||d>c){d=c;var e="";}else { e=a.substring(d+1,c); }a=[a.substr(0,d),e,a.substr(c)];c=a[1];a[1]=b?c?c+"&"+b:b:c;a=a[0]+(a[1]?"?"+a[1]:"")+a[2];}return a}R(a,b,c);return a}function ye(a){this.ya=0;this.g=[];this.a=new sc;this.I=new Wd;this.X=this.ua=this.D=this.ja=this.b=this.K=this.j=this.U=this.h=this.L=this.i=null;this.Za=this.R=0;this.Xa=!!n("internalChannelParams.failFast",a);this.ka=this.C=this.s=this.l=this.m=this.f=null;this.u=this.xa=this.N=-1;this.T=this.B=this.v=0;this.Wa=n("internalChannelParams.baseRetryDelayMs",a)||5E3;this.$a=n("internalChannelParams.retryDelaySeedMs",a)||1E4;this.Ya=n("internalChannelParams.forwardChannelMaxRetries",a)||2;this.wa=n("internalChannelParams.forwardChannelRequestTimeoutMs",
	a)||2E4;this.Ta=a&&a.Kb||void 0;this.G=void 0;this.S=a&&a.supportsCrossDomainXhr||!1;this.J="";this.c=new $d(a&&a.concurrentRequestLimit);this.la=new je;this.o=a&&void 0!==a.backgroundChannelTest?a.backgroundChannelTest:!0;(this.va=a&&a.fastHandshake||!1)&&!this.o&&(D(this.a.a,"Force backgroundChannelTest when fastHandshake is enabled."),this.o=!0);a&&a.Fa&&this.a.Fa();}g=ye.prototype;g.na=8;g.F=1;
	function ze(a){H(a.a,"disconnect()");Ae(a);if(3==a.F){var b=a.R++,c=M(a.D);R(c,"SID",a.J);R(c,"RID",b);R(c,"TYPE","terminate");Be(a,c);b=new L(a,a.a,b,void 0);b.J=2;b.h=Wc(M(c));c=!1;k.navigator&&k.navigator.sendBeacon&&(c=k.navigator.sendBeacon(b.h.toString(),""));!c&&k.Image&&((new Image).src=b.h,c=!0);c||(b.a=b.i.ca(null),b.a.fa(b.h));b.D=t();Zc(b);}Ce(a);}
	function Ae(a){a.C&&(a.C.abort(),a.C=null);a.b&&(a.b.cancel(),a.b=null);a.l&&(k.clearTimeout(a.l),a.l=null);De(a);a.c.cancel();a.m&&(k.clearTimeout(a.m),a.m=null);}function Ee(a,b){1E3==a.g.length&&J(a.a,function(){return "Already have 1000 queued maps upon queueing "+Db(b)});a.g.push(new Zd(a.Za++,b));3==a.F&&Fe(a);}g.La=function(){return 0==this.F};function Fe(a){de(a.c)||a.m||(a.m=Ec(r(a.Qa,a),0),a.v=0);}
	function Ge(a,b){var c=a.c;if((c.b?1:c.a?c.a.a.c:0)>=a.c.f-(a.m?1:0)){ return J(a.a,"Unexpected retry request is scheduled."),!1; }if(a.m){ return H(a.a,"Use the retry request that is already scheduled."),a.g=b.u.concat(a.g),!0; }if(1==a.F||2==a.F||a.v>=(a.Xa?0:a.Ya)){ return !1; }H(a.a,"Going to retry POST");a.m=Ec(r(a.Qa,a,b),He(a,a.v));a.v++;return !0}
	g.Qa=function(a){this.m=null;H(this.a,"startForwardChannel_");if(1==this.F){ if(a){ J(this.a,"Not supposed to retry the open"); }else{H(this.a,"open_()");this.R=Math.floor(1E5*Math.random());a=this.R++;var b=new L(this,this.a,a,void 0),c=this.i;this.L&&(c?(c=Fa(c),Ha(c,this.L)):c=this.L);null===this.h&&(b.j=c);var d=Ie(this,b),e=M(this.D);R(e,"RID",a);R(e,"CVER",22);this.o&&this.j&&R(e,"X-HTTP-Session-Id",this.j);Be(this,e);this.h&&c&&xe(e,this.h,c);ce(this.c,b);this.va?(R(e,"$req",d),R(e,"SID","null"),
	b.X=!0,Vc(b,e,null)):Vc(b,e,d);this.F=2;} }else { 3==this.F&&(a?Je(this,a):0==this.g.length?H(this.a,"startForwardChannel_ returned: nothing to send"):de(this.c)?J(this.a,"startForwardChannel_ returned: connection already in progress"):(Je(this),H(this.a,"startForwardChannel_ finished, sent request"))); }};
	function Je(a,b){var c;b?c=b.c:c=a.R++;var d=M(a.D);R(d,"SID",a.J);R(d,"RID",c);R(d,"AID",a.N);Be(a,d);a.h&&a.i&&xe(d,a.h,a.i);c=new L(a,a.a,c,a.v+1);null===a.h&&(c.j=a.i);b&&(a.g=b.u.concat(a.g));b=Ie(a,c);c.setTimeout(Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()));ce(a.c,c);Vc(c,d,b);}function Be(a,b){a.f&&md({},function(a,d){R(b,d,a);});}
	function Ie(a,b){var c=Math.min(a.g.length,1E3),d=a.f?r(a.f.ab,a.f,a):null;a:for(var e=a.g,f=-1;;){var h=["count="+c];-1==f?0<c?(f=e[0].a,h.push("ofs="+f)):f=0:h.push("ofs="+f);for(var m=!0,v=0;v<c;v++){var I=e[v].a,X=e[v].b;I-=f;if(0>I){ f=Math.max(0,e[v].a-100),m=!1; }else { try{ke(X,h,"req"+I+"_");}catch(Mb){d&&d(X);} }}if(m){d=h.join("&");break a}}a=a.g.splice(0,c);b.u=a;return d}function Ke(a){if(!a.b&&!a.l){a.T=1;var b=a.Pa;Tb||Ub();Wb||(Tb(),Wb=!0);Pb.add(b,a);a.B=0;}}
	function Le(a){if(a.b||a.l){ return J(a.a,"Request already in progress"),!1; }if(3<=a.B){ return !1; }H(a.a,"Going to retry GET");a.T++;a.l=Ec(r(a.Pa,a),He(a,a.B));a.B++;return !0}
	g.Pa=function(){this.l=null;H(this.a,"Creating new HttpRequest");this.b=new L(this,this.a,"rpc",this.T);null===this.h&&(this.b.j=this.i);this.b.N=0;var a=M(this.ua);R(a,"RID","rpc");R(a,"SID",this.J);R(a,"CI",this.ka?"0":"1");R(a,"AID",this.N);Be(this,a);R(a,"TYPE","xmlhttp");this.h&&this.i&&xe(a,this.h,this.i);this.G&&this.b.setTimeout(this.G);Yc(this.b,a,!0,this.X);H(this.a,"New Request created");};
	function Td(a,b,c){H(a.a,"Test Connection Finished");var d=b.l;d&&be(a.c,d);a.ka=c;a.u=b.f;H(a.a,"connectChannel_()");a.D=Me(a,a.ja);Fe(a);}function Vd(a,b){H(a.a,"Test Connection Failed");a.u=b.f;V(a,2);}
	g.Oa=function(a,b){
	var this$1 = this;
	if(0!=this.F&&(this.b==a||ee(this.c,a))){ if(this.u=a.C,!a.v&&ee(this.c,a)&&3==this.F){try{var c=this.la.a.parse(b);}catch(f){c=null;}if(p(c)&&3==c.length){ if(b=c,0==b[0]){ a:if(H(this.a,"Server claims our backchannel is missing."),this.l){ H(this.a,"But we are currently starting the request."); }else{if(this.b){ if(this.b.D+3E3<a.D){ De(this),this.b.cancel(),this.b=null; }else { break a; } }else { D(this.a.a,"We do not have a BackChannel established"); }Le(this);K(18);} }else { this.xa=b[1],a=this.xa-this.N,
	0<a&&(b=b[2],H(this.a,b+" bytes (in "+a+" arrays) are outstanding on the BackChannel"),37500>b&&this.ka&&0==this.B&&!this.s&&(this.s=Ec(r(this.ib,this),6E3))); } }else { H(this.a,"Bad POST response data returned"),V(this,11); }}else if((a.v||this.b==a)&&De(this),!xa(b)){ for(b=c=this.la.a.parse(b),c=0;c<b.length;c++){var d=b[c];this$1.N=d[0];d=d[1];if(2==this$1.F){ if("c"==d[0]){this$1.J=d[1];this$1.X=d[2];var e=d[3];null!=e&&(this$1.na=e,F(this$1.a,"VER="+this$1.na));e=d[4];null!=e&&(this$1.ya=e,F(this$1.a,"SVER="+this$1.ya));d=
	d[5];null!=d&&"number"==typeof d&&0<d&&(this$1.G=d*=1.5,F(this$1.a,"backChannelRequestTimeoutMs_="+d));this$1.o&&(d=a.a)&&((e=id(d,"X-Client-Wire-Protocol"))&&be(this$1.c,e),this$1.j&&((d=id(d,"X-HTTP-Session-Id"))?(this$1.K=d,R(this$1.D,this$1.j,d)):D(this$1.a.a,"Missing X_HTTP_SESSION_ID in the handshake response")));this$1.F=3;this$1.f&&this$1.f.Da();d=a;this$1.ua=Ud(this$1,this$1.X,this$1.ja);d.v?(H(this$1.a,"Upgrade the handshake request to a backchannel."),fe(this$1.c,d),(e=this$1.G)&&d.setTimeout(e),d.s&&(bd(d),Zc(d)),this$1.b=d):
	Ke(this$1);}else{ "stop"!=d[0]&&"close"!=d[0]||V(this$1,7); } }else { 3==this$1.F&&("stop"==d[0]||"close"==d[0]?"stop"==d[0]?V(this$1,7):ze(this$1):"noop"!=d[0]&&this$1.f&&this$1.f.Ca(d),this$1.B=0); }} } }};g.ib=function(){null!=this.s&&(this.s=null,this.b.cancel(),this.b=null,Le(this),K(19));};function De(a){null!=a.s&&(k.clearTimeout(a.s),a.s=null);}
	g.ta=function(a){H(this.a,"Request complete");var b=null;if(this.b==a){De(this);this.b=null;var c=2;}else if(ee(this.c,a)){ b=a.u,fe(this.c,a),c=1; }else { return; }this.u=a.C;if(0!=this.F){ if(a.f){ 1==c?(Dc(a.l?a.l.length:0,t()-a.D,this.v),Fe(this)):Ke(this); }else{var d=a.m;if(3==d||0==d&&0<this.u){ H(this.a,"Not retrying due to error type"); }else{var e=this;H(this.a,function(){return "Maybe retrying, last error: "+Sc(d,e.u)});if(1==c&&Ge(this,a)||2==c&&Le(this)){ return; }H(this.a,"Exceeded max number of retries");}b&&
	0<b.length&&he(this.c,b);H(this.a,"Error: HTTP request failed");switch(d){case 1:V(this,5);break;case 4:V(this,10);break;case 3:V(this,6);break;default:V(this,2);}} }};function He(a,b){var c=a.Wa+Math.floor(Math.random()*a.$a);a.qa()||(H(a.a,"Inactive channel"),c*=2);return c*b}
	function V(a,b){F(a.a,"Error code "+b);if(2==b){var c=null;a.f&&(c=null);var d=r(a.pb,a);c||(c=new Q("//www.google.com/images/cleardot.gif"),k.location&&"http"==k.location.protocol||sd(c,"https"),Wc(c));le(c.toString(),d);}else { K(2); }H(a.a,"HttpChannel: error - "+b);a.F=0;a.f&&a.f.Ba(b);Ce(a);Ae(a);}g.pb=function(a){a?(F(this.a,"Successfully pinged google.com"),K(2)):(F(this.a,"Failed to ping google.com"),K(1));};
	function Ce(a){a.F=0;a.u=-1;if(a.f){var b=ge(a.c);if(0!=b.length||0!=a.g.length){ H(a.a,function(){return "Number of undelivered maps, pending: "+b.length+", outgoing: "+a.g.length}),a.c.c.length=0,wa(a.g),a.g.length=0; }a.f.Aa();}}function Me(a,b){b=Ne(a,null,b);H(a.a,"GetForwardChannelUri: "+b);return b}function Ud(a,b,c){b=Ne(a,a.ia()?b:null,c);H(a.a,"GetBackChannelUri: "+b);return b}
	function Ne(a,b,c){var d=Hd(c);if(""!=d.b){ b&&td(d,b+"."+d.b),ud(d,d.i); }else{var e=k.location,f;b?f=b+"."+e.hostname:f=e.hostname;d=Id(e.protocol,f,e.port,c);}a.U&&Ca(a.U,function(a,b){R(d,b,a);});b=a.j;c=a.K;b&&c&&R(d,b,c);R(d,"VER",a.na);Be(a,d);return d}g.ca=function(a){if(a&&!this.S){ throw Error("Can't create secondary domain capable XhrIo object."); }a=new T(this.Ta);a.o=this.S;return a};g.qa=function(){return !!this.f&&!0};g.ia=function(){return this.S};function Oe(){}g=Oe.prototype;g.Da=function(){};
	g.Ca=function(){};g.Ba=function(){};g.Aa=function(){};g.ab=function(){};function Pe(a){
	var arguments$1 = arguments;
	for(var b=arguments[0],c=1;c<arguments.length;c++){var d=arguments$1[c];if(0==d.lastIndexOf("/",0)){ b=d; }else{var e;(e=""==b)||(e=b.length-1,e=0<=e&&b.indexOf("/",e)==e);e?b+=d:b+="/"+d;}}return b}function Qe(){if(z&&!(10<=Number(Wa))){ throw Error("Environmental error: no available transport."); }}Qe.prototype.a=function(a,b){return new W(a,b)};
	function W(a,b){B.call(this);this.a=new ye(b);this.b=a;this.o=b&&b.testUrl?b.testUrl:Pe(this.b,"test");this.c=qc("goog.labs.net.webChannel.WebChannelBaseTransport");this.g=b&&b.messageUrlParams||null;a=b&&b.messageHeaders||null;b&&b.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"});this.a.i=a;a=b&&b.initMessageHeaders||null;b&&b.messageContentType&&(a?a["X-WebChannel-Content-Type"]=b.messageContentType:a={"X-WebChannel-Content-Type":b.messageContentType});
	b&&b.Ea&&(a?a["X-WebChannel-Client-Profile"]=b.Ea:a={"X-WebChannel-Client-Profile":b.Ea});this.a.L=a;(a=b&&b.httpHeadersOverwriteParam)&&!xa(a)&&(this.a.h=a);this.l=b&&b.supportsCrossDomainXhr||!1;this.j=b&&b.sendRawJson||!1;(b=b&&b.httpSessionIdParam)&&!xa(b)&&(this.a.j=b,a=this.g,null!==a&&b in a&&(a=this.g,b in a&&delete a[b],D(this.c,"Ignore httpSessionIdParam also specified with messageUrlParams: "+b)));this.h=new Re(this);}u(W,B);g=W.prototype;
	g.addEventListener=function(a,b,c,d){W.H.addEventListener.call(this,a,b,c,d);};g.removeEventListener=function(a,b,c,d){W.H.removeEventListener.call(this,a,b,c,d);};
	g.fb=function(){this.a.f=this.h;this.l&&(this.a.S=!0);var a=this.a,b=this.o,c=this.b,d=this.g||void 0;H(a.a,"connect()");K(0);a.ja=c;a.U=d||{};a.o&&(H(a.a,"connect() bypassed channel-test."),a.I.b=[],a.I.a=!1);H(a.a,"connectTest_()");a.C=new Rd(a,a.a);null===a.h&&(a.C.i=a.i);c=b;a.h&&a.i&&(c=xe(b,a.h,a.i));a=a.C;a.m=c;b=Me(a.a,a.m);K(3);c=a.a.I.b;null!=c?(a.g=c[0],a.P=1,Sd(a)):($c(b,"MODE","init"),!a.a.o&&a.a.j&&$c(b,"X-HTTP-Session-Id",a.a.j),a.c=new L(a,a.b,void 0,void 0),a.c.j=a.i,Yc(a.c,b,!1,
	null),a.P=0);};g.close=function(){ze(this.a);};g.gb=function(a){if(l(a)){var b={};b.__data__=a;Ee(this.a,b);}else { this.j?(b={},b.__data__=Db(a),Ee(this.a,b)):Ee(this.a,a); }};g.w=function(){this.a.f=null;delete this.h;ze(this.a);delete this.a;W.H.w.call(this);};function Se(a){Mc.call(this);var b=a.__sm__;if(b){a:{for(var c in b){a=c;break a}a=void 0;}(this.c=a)?(a=this.c,this.data=null!==b&&a in b?b[a]:void 0):this.data=b;}else { this.data=a; }}u(Se,Mc);function Te(){Nc.call(this);this.status=1;}u(Te,Nc);
	function Re(a){this.a=a;}u(Re,Oe);Re.prototype.Da=function(){rc(this.a.c,"WebChannel opened on "+this.a.b);this.a.dispatchEvent("a");};Re.prototype.Ca=function(a){this.a.dispatchEvent(new Se(a));};Re.prototype.Ba=function(a){rc(this.a.c,"WebChannel aborted on "+this.a.b+" due to channel error: "+a);this.a.dispatchEvent(new Te(a));};Re.prototype.Aa=function(){rc(this.a.c,"WebChannel closed on "+this.a.b);this.a.dispatchEvent("b");};var Ue=ja(function(a,b){function c(){}c.prototype=a.prototype;var d=new c;a.apply(d,Array.prototype.slice.call(arguments,1));return d},Qe);function Ve(){this.b=[];this.a=[];}function We(a){0==a.b.length&&(a.b=a.a,a.b.reverse(),a.a=[]);return a.b.pop()}function Xe(a){return a.b.length+a.a.length}Ve.prototype.A=function(){
	var this$1 = this;
	for(var a=[],b=this.b.length-1;0<=b;--b){ a.push(this$1.b[b]); }var c=this.a.length;for(b=0;b<c;++b){ a.push(this$1.a[b]); }return a};function Ye(a,b){w.call(this);this.h=a||0;this.c=b||10;if(this.h>this.c){ throw Error(Ze); }this.a=new Ve;this.b=new Xd;this.g=null;this.aa();}u(Ye,w);var Ze="[goog.structs.Pool] Min can not be greater than max";g=Ye.prototype;g.da=function(){
	var this$1 = this;
	var a=t();if(!(null!=this.g&&0>a-this.g)){for(var b;0<Xe(this.a)&&(b=We(this.a),!this.sa(b));){ this$1.aa(); }!b&&$e(this)<this.c&&(b=this.pa());b&&(this.g=a,this.b.add(b));return b}};g.ob=function(a){return pd(this.b.a,Yd(a))?(this.ma(a),!0):!1};
	g.ma=function(a){pd(this.b.a,Yd(a));this.sa(a)&&$e(this)<this.c?this.a.a.push(a):af(a);};g.aa=function(){
	var this$1 = this;
	for(var a=this.a;$e(this)<this.h;){var b=this$1.pa();a.a.push(b);}for(;$e(this)>this.c&&0<Xe(this.a);){ af(We(a)); }};g.pa=function(){return {}};function af(a){if("function"==typeof a.$){ a.$(); }else { for(var b in a){ a[b]=null; } }}g.sa=function(a){return "function"==typeof a.bb?a.bb():!0};function $e(a){return Xe(a.a)+a.b.a.c}
	g.w=function(){Ye.H.w.call(this);if(0<this.b.a.c){ throw Error("[goog.structs.Pool] Objects not released"); }delete this.b;for(var a=this.a;0!=a.b.length||0!=a.a.length;){ af(We(a)); }delete this.a;};function bf(a,b){this.a=a;this.b=b;}function cf(a){
	var this$1 = this;
	this.a=[];if(a){ a:{if(a instanceof cf){var b=a.M();a=a.A();if(0>=this.a.length){for(var c=this.a,d=0;d<b.length;d++){ c.push(new bf(b[d],a[d])); }break a}}else { b=Ea(a),a=Da(a); }for(d=0;d<b.length;d++){ df(this$1,b[d],a[d]); }} }}function df(a,b,c){var d=a.a;d.push(new bf(b,c));b=d.length-1;a=a.a;for(c=a[b];0<b;){ if(d=b-1>>1,a[d].a>c.a){ a[b]=a[d],b=d; }else { break; } }a[b]=c;}cf.prototype.A=function(){for(var a=this.a,b=[],c=a.length,d=0;d<c;d++){ b.push(a[d].b); }return b};
	cf.prototype.M=function(){for(var a=this.a,b=[],c=a.length,d=0;d<c;d++){ b.push(a[d].a); }return b};function ef(){cf.call(this);}u(ef,cf);function Y(a,b){this.f=new ef;Ye.call(this,a,b);}u(Y,Ye);g=Y.prototype;g.da=function(a,b){if(!a){ return Y.H.da.call(this); }df(this.f,void 0!==b?b:100,a);this.ra();};g.ra=function(){
	var this$1 = this;
	for(var a=this.f;0<a.a.length;){var b=this$1.da();if(b){var c=a,d=c.a,e=d.length;var f=d[0];if(0>=e){ f=void 0; }else{if(1==e){ ua(d); }else{d[0]=d.pop();d=0;c=c.a;e=c.length;for(var h=c[d];d<e>>1;){var m=2*d+1,v=2*d+2;m=v<e&&c[v].a<c[m].a?v:m;if(c[m].a>h.a){ break; }c[d]=c[m];d=m;}c[d]=h;}f=f.b;}f.apply(this$1,[b]);}else { break }}};
	g.ma=function(a){Y.H.ma.call(this,a);this.ra();};g.aa=function(){Y.H.aa.call(this);this.ra();};g.w=function(){Y.H.w.call(this);k.clearTimeout(void 0);ua(this.f.a);this.f=null;};function Z(a,b,c,d){this.l=a;this.j=!!d;Y.call(this,b,c);}u(Z,Y);Z.prototype.pa=function(){var a=new T,b=this.l;b&&b.forEach(function(b,d){a.headers.set(d,b);});this.j&&(a.o=!0);return a};Z.prototype.sa=function(a){return !a.i&&!a.a};Qe.prototype.createWebChannel=Qe.prototype.a;W.prototype.send=W.prototype.gb;W.prototype.open=W.prototype.fb;W.prototype.close=W.prototype.close;Fc.NO_ERROR=0;Fc.TIMEOUT=8;Fc.HTTP_ERROR=6;Gc.COMPLETE="complete";Kc.EventType=Lc;Lc.OPEN="a";Lc.CLOSE="b";Lc.ERROR="c";Lc.MESSAGE="d";B.prototype.listen=B.prototype.Ia;Z.prototype.getObject=Z.prototype.da;Z.prototype.releaseObject=Z.prototype.ob;T.prototype.listenOnce=T.prototype.Ja;T.prototype.getLastError=T.prototype.hb;T.prototype.getLastErrorCode=T.prototype.Ga;
	T.prototype.getStatus=T.prototype.W;T.prototype.getStatusText=T.prototype.Ha;T.prototype.getResponseJson=T.prototype.eb;T.prototype.getResponseText=T.prototype.V;T.prototype.getResponseText=T.prototype.V;T.prototype.send=T.prototype.fa;module.exports={createWebChannelTransport:Ue,ErrorCode:Fc,EventType:Gc,WebChannel:Kc,XhrIoPool:Z};}).call(typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {});
	});
	var dist_1 = dist.createWebChannelTransport;
	var dist_2 = dist.ErrorCode;
	var dist_3 = dist.EventType;
	var dist_4 = dist.WebChannel;
	var dist_5 = dist.XhrIoPool;

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/** The semver (www.semver.org) version of the SDK. */
	var SDK_VERSION = firebase.SDK_VERSION;

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var logClient = new Logger('@firebase/firestore');
	var LogLevel$1;
	(function (LogLevel$$1) {
	    LogLevel$$1[LogLevel$$1["DEBUG"] = 0] = "DEBUG";
	    LogLevel$$1[LogLevel$$1["ERROR"] = 1] = "ERROR";
	    LogLevel$$1[LogLevel$$1["SILENT"] = 2] = "SILENT";
	})(LogLevel$1 || (LogLevel$1 = {}));
	// Helper methods are needed because variables can't be exported as read/write
	function getLogLevel() {
	    if (logClient.logLevel === LogLevel.DEBUG) {
	        return LogLevel$1.DEBUG;
	    }
	    else if (logClient.logLevel === LogLevel.SILENT) {
	        return LogLevel$1.SILENT;
	    }
	    else {
	        return LogLevel$1.ERROR;
	    }
	}
	function setLogLevel$1(newLevel) {
	    /**
	     * Map the new log level to the associated Firebase Log Level
	     */
	    switch (newLevel) {
	        case LogLevel$1.DEBUG:
	            logClient.logLevel = LogLevel.DEBUG;
	            break;
	        case LogLevel$1.ERROR:
	            logClient.logLevel = LogLevel.ERROR;
	            break;
	        case LogLevel$1.SILENT:
	            logClient.logLevel = LogLevel.SILENT;
	            break;
	        default:
	            logClient.error("Firestore (" + SDK_VERSION + "): Invalid value passed to `setLogLevel`");
	    }
	}
	function debug(tag, msg) {
	    var arguments$1 = arguments;

	    var obj = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        obj[_i - 2] = arguments$1[_i];
	    }
	    if (logClient.logLevel <= LogLevel.DEBUG) {
	        var args = obj.map(argToString);
	        logClient.debug.apply(logClient, ["Firestore (" + SDK_VERSION + ") [" + tag + "]: " + msg].concat(args));
	    }
	}
	function error$1(msg) {
	    var arguments$1 = arguments;

	    var obj = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        obj[_i - 1] = arguments$1[_i];
	    }
	    if (logClient.logLevel <= LogLevel.ERROR) {
	        var args = obj.map(argToString);
	        logClient.error.apply(logClient, ["Firestore (" + SDK_VERSION + "): " + msg].concat(args));
	    }
	}
	/**
	 * Converts an additional log parameter to a string representation.
	 */
	function argToString(obj) {
	    if (typeof obj === 'string') {
	        return obj;
	    }
	    else {
	        var platform = PlatformSupport.getPlatform();
	        try {
	            return platform.formatJSON(obj);
	        }
	        catch (e) {
	            // Converting to JSON failed, just log the object directly
	            return obj;
	        }
	    }
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Unconditionally fails, throwing an Error with the given message.
	 *
	 * Returns any so it can be used in expressions:
	 * @example
	 * let futureVar = fail('not implemented yet');
	 */
	function fail(failure) {
	    // Log the failure in addition to throw an exception, just in case the
	    // exception is swallowed.
	    var message = "FIRESTORE (" + SDK_VERSION + ") INTERNAL ASSERTION FAILED: " + failure;
	    error$1(message);
	    // NOTE: We don't use FirestoreError here because these are internal failures
	    // that cannot be handled by the user. (Also it would create a circular
	    // dependency between the error and assert modules which doesn't work.)
	    throw new Error(message);
	}
	/**
	 * Fails if the given assertion condition is false, throwing an Error with the
	 * given message if it did.
	 */
	function assert$1(assertion, message) {
	    if (!assertion) {
	        fail(message);
	    }
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Provides singleton helpers where setup code can inject a platform at runtime.
	 * setPlatform needs to be set before Firestore is used and must be set exactly
	 * once.
	 */
	var PlatformSupport = /** @class */ (function () {
	    function PlatformSupport() {
	    }
	    PlatformSupport.setPlatform = function (platform) {
	        if (PlatformSupport.platform) {
	            fail('Platform already defined');
	        }
	        PlatformSupport.platform = platform;
	    };
	    PlatformSupport.getPlatform = function () {
	        if (!PlatformSupport.platform) {
	            fail('Platform not set');
	        }
	        return PlatformSupport.platform;
	    };
	    return PlatformSupport;
	}());
	/**
	 * Returns the representation of an empty "proto" byte string for the
	 * platform.
	 */
	function emptyByteString() {
	    return PlatformSupport.getPlatform().emptyByteString;
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	// TODO(mcg): Change to a string enum once we've upgraded to typescript 2.4.
	//  tslint:disable-next-line:variable-name Intended to look like a TS 2.4 enum
	var Code = {
	    // Causes are copied from:
	    // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
	    /** Not an error; returned on success. */
	    OK: 'ok',
	    /** The operation was cancelled (typically by the caller). */
	    CANCELLED: 'cancelled',
	    /** Unknown error or an error from a different error domain. */
	    UNKNOWN: 'unknown',
	    /**
	     * Client specified an invalid argument. Note that this differs from
	     * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
	     * problematic regardless of the state of the system (e.g., a malformed file
	     * name).
	     */
	    INVALID_ARGUMENT: 'invalid-argument',
	    /**
	     * Deadline expired before operation could complete. For operations that
	     * change the state of the system, this error may be returned even if the
	     * operation has completed successfully. For example, a successful response
	     * from a server could have been delayed long enough for the deadline to
	     * expire.
	     */
	    DEADLINE_EXCEEDED: 'deadline-exceeded',
	    /** Some requested entity (e.g., file or directory) was not found. */
	    NOT_FOUND: 'not-found',
	    /**
	     * Some entity that we attempted to create (e.g., file or directory) already
	     * exists.
	     */
	    ALREADY_EXISTS: 'already-exists',
	    /**
	     * The caller does not have permission to execute the specified operation.
	     * PERMISSION_DENIED must not be used for rejections caused by exhausting
	     * some resource (use RESOURCE_EXHAUSTED instead for those errors).
	     * PERMISSION_DENIED must not be used if the caller can not be identified
	     * (use UNAUTHENTICATED instead for those errors).
	     */
	    PERMISSION_DENIED: 'permission-denied',
	    /**
	     * The request does not have valid authentication credentials for the
	     * operation.
	     */
	    UNAUTHENTICATED: 'unauthenticated',
	    /**
	     * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
	     * entire file system is out of space.
	     */
	    RESOURCE_EXHAUSTED: 'resource-exhausted',
	    /**
	     * Operation was rejected because the system is not in a state required for
	     * the operation's execution. For example, directory to be deleted may be
	     * non-empty, an rmdir operation is applied to a non-directory, etc.
	     *
	     * A litmus test that may help a service implementor in deciding
	     * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
	     *  (a) Use UNAVAILABLE if the client can retry just the failing call.
	     *  (b) Use ABORTED if the client should retry at a higher-level
	     *      (e.g., restarting a read-modify-write sequence).
	     *  (c) Use FAILED_PRECONDITION if the client should not retry until
	     *      the system state has been explicitly fixed. E.g., if an "rmdir"
	     *      fails because the directory is non-empty, FAILED_PRECONDITION
	     *      should be returned since the client should not retry unless
	     *      they have first fixed up the directory by deleting files from it.
	     *  (d) Use FAILED_PRECONDITION if the client performs conditional
	     *      REST Get/Update/Delete on a resource and the resource on the
	     *      server does not match the condition. E.g., conflicting
	     *      read-modify-write on the same resource.
	     */
	    FAILED_PRECONDITION: 'failed-precondition',
	    /**
	     * The operation was aborted, typically due to a concurrency issue like
	     * sequencer check failures, transaction aborts, etc.
	     *
	     * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
	     * and UNAVAILABLE.
	     */
	    ABORTED: 'aborted',
	    /**
	     * Operation was attempted past the valid range. E.g., seeking or reading
	     * past end of file.
	     *
	     * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
	     * if the system state changes. For example, a 32-bit file system will
	     * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
	     * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
	     * an offset past the current file size.
	     *
	     * There is a fair bit of overlap between FAILED_PRECONDITION and
	     * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
	     * when it applies so that callers who are iterating through a space can
	     * easily look for an OUT_OF_RANGE error to detect when they are done.
	     */
	    OUT_OF_RANGE: 'out-of-range',
	    /** Operation is not implemented or not supported/enabled in this service. */
	    UNIMPLEMENTED: 'unimplemented',
	    /**
	     * Internal errors. Means some invariants expected by underlying System has
	     * been broken. If you see one of these errors, Something is very broken.
	     */
	    INTERNAL: 'internal',
	    /**
	     * The service is currently unavailable. This is a most likely a transient
	     * condition and may be corrected by retrying with a backoff.
	     *
	     * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
	     * and UNAVAILABLE.
	     */
	    UNAVAILABLE: 'unavailable',
	    /** Unrecoverable data loss or corruption. */
	    DATA_LOSS: 'data-loss'
	};
	/**
	 * An error class used for Firestore-generated errors. Ideally we should be
	 * using FirebaseError, but integrating with it is overly arduous at the moment,
	 * so we define our own compatible error class (with a `name` of 'FirebaseError'
	 * and compatible `code` and `message` fields.)
	 */
	var FirestoreError = /** @class */ (function (_super) {
	    __extends(FirestoreError, _super);
	    function FirestoreError(code, message) {
	        var _this = _super.call(this, message) || this;
	        _this.code = code;
	        _this.message = message;
	        _this.name = 'FirebaseError';
	        // HACK: We write a toString property directly because Error is not a real
	        // class and so inheritance does not work correctly. We could alternatively
	        // do the same "back-door inheritance" trick that FirebaseError does.
	        _this.toString = function () { return _this.name + ": [code=" + _this.code + "]: " + _this.message; };
	        return _this;
	    }
	    return FirestoreError;
	}(Error));

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Helper function to prevent instantiation through the constructor.
	 *
	 * This method creates a new constructor that throws when it's invoked.
	 * The prototype of that constructor is then set to the prototype of the hidden
	 * "class" to expose all the prototype methods and allow for instanceof
	 * checks.
	 *
	 * To also make all the static methods available, all properties of the
	 * original constructor are copied to the new constructor.
	 */
	function makeConstructorPrivate(cls, optionalMessage) {
	    function PublicConstructor() {
	        var error = 'This constructor is private.';
	        if (optionalMessage) {
	            error += ' ';
	            error += optionalMessage;
	        }
	        throw new FirestoreError(Code.INVALID_ARGUMENT, error);
	    }
	    // Make sure instanceof checks work and all methods are exposed on the public
	    // constructor
	    PublicConstructor.prototype = cls.prototype;
	    // Copy any static methods/members
	    for (var staticProperty in cls) {
	        if (cls.hasOwnProperty(staticProperty)) {
	            PublicConstructor[staticProperty] = cls[staticProperty];
	        }
	    }
	    return PublicConstructor;
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	function contains$2(obj, key) {
	    return Object.prototype.hasOwnProperty.call(obj, key);
	}
	/** Returns the given value if it's defined or the defaultValue otherwise. */
	function defaulted(value, defaultValue) {
	    return value !== undefined ? value : defaultValue;
	}
	function forEachNumber(obj, fn) {
	    for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key)) {
	            var num = Number(key);
	            if (!isNaN(num)) {
	                fn(num, obj[key]);
	            }
	        }
	    }
	}
	function forEach$1(obj, fn) {
	    for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key)) {
	            fn(key, obj[key]);
	        }
	    }
	}
	function isEmpty$1(obj) {
	    assert$1(obj != null && typeof obj === 'object', 'isEmpty() expects object parameter.');
	    for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key)) {
	            return false;
	        }
	    }
	    return true;
	}
	function shallowCopy(obj) {
	    assert$1(obj && typeof obj === 'object', 'shallowCopy() expects object parameter.');
	    var result = {};
	    for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key)) {
	            result[key] = obj[key];
	        }
	    }
	    return result;
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Validates the invocation of functionName has the exact number of arguments.
	 *
	 * Forward the magic "arguments" variable as second parameter on which the
	 * parameter validation is performed:
	 * validateExactNumberOfArgs('myFunction', arguments, 2);
	 */
	function validateExactNumberOfArgs(functionName, args, numberOfArgs) {
	    if (args.length !== numberOfArgs) {
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + functionName + "() requires " +
	            formatPlural(numberOfArgs, 'argument') +
	            ', but was called with ' +
	            formatPlural(args.length, 'argument') +
	            '.');
	    }
	}
	/**
	 * Validates the invocation of functionName has at least the provided number of
	 * arguments (but can have many more).
	 *
	 * Forward the magic "arguments" variable as second parameter on which the
	 * parameter validation is performed:
	 * validateAtLeastNumberOfArgs('myFunction', arguments, 2);
	 */
	function validateAtLeastNumberOfArgs(functionName, args, minNumberOfArgs) {
	    if (args.length < minNumberOfArgs) {
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + functionName + "() requires at least " +
	            formatPlural(minNumberOfArgs, 'argument') +
	            ', but was called with ' +
	            formatPlural(args.length, 'argument') +
	            '.');
	    }
	}
	/**
	 * Validates the invocation of functionName has number of arguments between
	 * the values provided.
	 *
	 * Forward the magic "arguments" variable as second parameter on which the
	 * parameter validation is performed:
	 * validateBetweenNumberOfArgs('myFunction', arguments, 2, 3);
	 */
	function validateBetweenNumberOfArgs(functionName, args, minNumberOfArgs, maxNumberOfArgs) {
	    if (args.length < minNumberOfArgs || args.length > maxNumberOfArgs) {
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + functionName + "() requires between " + minNumberOfArgs + " and " +
	            (maxNumberOfArgs + " arguments, but was called with ") +
	            formatPlural(args.length, 'argument') +
	            '.');
	    }
	}
	/**
	 * Validates the provided argument is an array and has as least the expected
	 * number of elements.
	 */
	function validateNamedArrayAtLeastNumberOfElements(functionName, value, name, minNumberOfElements) {
	    if (!(value instanceof Array) || value.length < minNumberOfElements) {
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + functionName + "() requires its " + name + " argument to be an " +
	            'array with at least ' +
	            (formatPlural(minNumberOfElements, 'element') + "."));
	    }
	}
	/**
	 * Validates the provided positional argument has the native JavaScript type
	 * using typeof checks.
	 */
	function validateArgType(functionName, type, position, argument) {
	    validateType(functionName, type, ordinal(position) + " argument", argument);
	}
	/**
	 * Validates the provided argument has the native JavaScript type using
	 * typeof checks or is undefined.
	 */
	function validateOptionalArgType(functionName, type, position, argument) {
	    if (argument !== undefined) {
	        validateArgType(functionName, type, position, argument);
	    }
	}
	/**
	 * Validates the provided named option has the native JavaScript type using
	 * typeof checks.
	 */
	function validateNamedType(functionName, type, optionName, argument) {
	    validateType(functionName, type, optionName + " option", argument);
	}
	/**
	 * Validates the provided named option has the native JavaScript type using
	 * typeof checks or is undefined.
	 */
	function validateNamedOptionalType(functionName, type, optionName, argument) {
	    if (argument !== undefined) {
	        validateNamedType(functionName, type, optionName, argument);
	    }
	}
	function validateArrayElements(functionName, optionName, typeDescription, argument, validator) {
	    if (!(argument instanceof Array)) {
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + functionName + "() requires its " + optionName + " " +
	            ("option to be an array, but it was: " + valueDescription(argument)));
	    }
	    for (var i = 0; i < argument.length; ++i) {
	        if (!validator(argument[i])) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + functionName + "() requires all " + optionName + " " +
	                ("elements to be " + typeDescription + ", but the value at index " + i + " ") +
	                ("was: " + valueDescription(argument[i])));
	        }
	    }
	}
	function validateOptionalArrayElements(functionName, optionName, typeDescription, argument, validator) {
	    if (argument !== undefined) {
	        validateArrayElements(functionName, optionName, typeDescription, argument, validator);
	    }
	}
	/**
	 * Validates that the provided named option equals one of the expected values.
	 */
	function validateNamedPropertyEquals(functionName, inputName, optionName, input, expected) {
	    var expectedDescription = [];
	    for (var _i = 0, expected_1 = expected; _i < expected_1.length; _i++) {
	        var val = expected_1[_i];
	        if (val === input) {
	            return;
	        }
	        expectedDescription.push(valueDescription(val));
	    }
	    var actualDescription = valueDescription(input);
	    throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid value " + actualDescription + " provided to function " + functionName + "() for option \"" + optionName + "\". Acceptable values: " + expectedDescription.join(', '));
	}
	/**
	 * Validates that the provided named option equals one of the expected values or
	 * is undefined.
	 */
	function validateNamedOptionalPropertyEquals(functionName, inputName, optionName, input, expected) {
	    if (input !== undefined) {
	        validateNamedPropertyEquals(functionName, inputName, optionName, input, expected);
	    }
	}
	/** Helper to validate the type of a provided input. */
	function validateType(functionName, type, inputName, input) {
	    if (typeof input !== type || (type === 'object' && !isPlainObject(input))) {
	        var description = valueDescription(input);
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + functionName + "() requires its " + inputName + " " +
	            ("to be of type " + type + ", but it was: " + description));
	    }
	}
	/**
	 * Returns true if it's a non-null object without a custom prototype
	 * (i.e. excludes Array, Date, etc.).
	 */
	function isPlainObject(input) {
	    return (typeof input === 'object' &&
	        input !== null &&
	        (Object.getPrototypeOf(input) === Object.prototype ||
	            Object.getPrototypeOf(input) === null));
	}
	/** Returns a string describing the type / value of the provided input. */
	function valueDescription(input) {
	    if (input === undefined) {
	        return 'undefined';
	    }
	    else if (input === null) {
	        return 'null';
	    }
	    else if (typeof input === 'string') {
	        if (input.length > 20) {
	            input = input.substring(0, 20) + "...";
	        }
	        return JSON.stringify(input);
	    }
	    else if (typeof input === 'number' || typeof input === 'boolean') {
	        return '' + input;
	    }
	    else if (typeof input === 'object') {
	        if (input instanceof Array) {
	            return 'an array';
	        }
	        else {
	            var customObjectName = tryGetCustomObjectType(input);
	            if (customObjectName) {
	                return "a custom " + customObjectName + " object";
	            }
	            else {
	                return 'an object';
	            }
	        }
	    }
	    else if (typeof input === 'function') {
	        return 'a function';
	    }
	    else {
	        return fail('Unknown wrong type: ' + typeof input);
	    }
	}
	/** Hacky method to try to get the constructor name for an object. */
	function tryGetCustomObjectType(input) {
	    if (input.constructor) {
	        var funcNameRegex = /function\s+([^\s(]+)\s*\(/;
	        var results = funcNameRegex.exec(input.constructor.toString());
	        if (results && results.length > 1) {
	            return results[1];
	        }
	    }
	    return null;
	}
	/** Validates the provided argument is defined. */
	function validateDefined(functionName, position, argument) {
	    if (argument === undefined) {
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + functionName + "() requires a valid " + ordinal(position) + " " +
	            "argument, but it was undefined.");
	    }
	}
	/**
	 * Validates the provided positional argument is an object, and its keys and
	 * values match the expected keys and types provided in optionTypes.
	 */
	function validateOptionNames(functionName, options, optionNames) {
	    forEach$1(options, function (key, _) {
	        if (optionNames.indexOf(key) < 0) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, "Unknown option '" + key + "' passed to function " + functionName + "(). " +
	                'Available options: ' +
	                optionNames.join(', '));
	        }
	    });
	}
	/**
	 * Helper method to throw an error that the provided argument did not pass
	 * an instanceof check.
	 */
	function invalidClassError(functionName, type, position, argument) {
	    var description = valueDescription(argument);
	    return new FirestoreError(Code.INVALID_ARGUMENT, "Function " + functionName + "() requires its " + ordinal(position) + " " +
	        ("argument to be a " + type + ", but it was: " + description));
	}
	/** Converts a number to its english word representation */
	function ordinal(num) {
	    switch (num) {
	        case 1:
	            return 'first';
	        case 2:
	            return 'second';
	        case 3:
	            return 'third';
	        default:
	            return num + 'th';
	    }
	}
	/**
	 * Formats the given word as plural conditionally given the preceding number.
	 */
	function formatPlural(num, str) {
	    return num + " " + str + (num === 1 ? '' : 's');
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	// tslint:disable-next-line:class-as-namespace
	var AutoId = /** @class */ (function () {
	    function AutoId() {
	    }
	    AutoId.newId = function () {
	        // Alphanumeric characters
	        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	        var autoId = '';
	        for (var i = 0; i < 20; i++) {
	            autoId += chars.charAt(Math.floor(Math.random() * chars.length));
	        }
	        assert$1(autoId.length === 20, 'Invalid auto ID: ' + autoId);
	        return autoId;
	    };
	    return AutoId;
	}());
	function primitiveComparator(left, right) {
	    if (left < right)
	        { return -1; }
	    if (left > right)
	        { return 1; }
	    return 0;
	}
	/** Helper to compare nullable (or undefined-able) objects using isEqual(). */
	function equals(left, right) {
	    if (left !== null && left !== undefined) {
	        return !!(right && left.isEqual(right));
	    }
	    else {
	        // HACK: Explicitly cast since TypeScript's type narrowing apparently isn't
	        // smart enough.
	        return left === right;
	    }
	}
	/** Helper to compare arrays using isEqual(). */
	function arrayEquals(left, right) {
	    if (left.length !== right.length) {
	        return false;
	    }
	    for (var i = 0; i < left.length; i++) {
	        if (!left[i].isEqual(right[i])) {
	            return false;
	        }
	    }
	    return true;
	}
	/**
	 * Returns the largest lexicographically smaller string of equal or smaller
	 * length. Returns an empty string if there is no such predecessor (if the input
	 * is empty).
	 *
	 * Strings returned from this method can be invalid UTF-16 but this is sufficent
	 * in use for indexeddb because that depends on lexicographical ordering but
	 * shouldn't be used elsewhere.
	 */
	function immediatePredecessor(s) {
	    // We can decrement the last character in the string and be done
	    // unless that character is 0 (0x0000), in which case we have to erase the
	    // last character.
	    var lastIndex = s.length - 1;
	    if (s.length === 0) {
	        // Special case the empty string.
	        return '';
	    }
	    else if (s.charAt(lastIndex) === '\0') {
	        return s.substring(0, lastIndex);
	    }
	    else {
	        return (s.substring(0, lastIndex) +
	            String.fromCharCode(s.charCodeAt(lastIndex) - 1));
	    }
	}
	/**
	 * Returns the immediate lexicographically-following string. This is useful to
	 * construct an inclusive range for indexeddb iterators.
	 */
	function immediateSuccessor(s) {
	    // Return the input string, with an additional NUL byte appended.
	    return s + '\0';
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/** Helper function to assert Uint8Array is available at runtime. */
	function assertUint8ArrayAvailable() {
	    if (typeof Uint8Array === 'undefined') {
	        throw new FirestoreError(Code.UNIMPLEMENTED, 'Uint8Arrays are not available in this environment.');
	    }
	}
	/** Helper function to assert Base64 functions are available at runtime. */
	function assertBase64Available() {
	    if (!PlatformSupport.getPlatform().base64Available) {
	        throw new FirestoreError(Code.UNIMPLEMENTED, 'Blobs are unavailable in Firestore in this environment.');
	    }
	}
	/**
	 * Immutable class holding a blob (binary data).
	 * This class is directly exposed in the public API.
	 *
	 * Note that while you can't hide the constructor in JavaScript code, we are
	 * using the hack above to make sure no-one outside this module can call it.
	 */
	var Blob$1 = /** @class */ (function () {
	    function Blob(binaryString) {
	        assertBase64Available();
	        this._binaryString = binaryString;
	    }
	    Blob.fromBase64String = function (base64) {
	        validateExactNumberOfArgs('Blob.fromBase64String', arguments, 1);
	        validateArgType('Blob.fromBase64String', 'string', 1, base64);
	        assertBase64Available();
	        try {
	            var binaryString = PlatformSupport.getPlatform().atob(base64);
	            return new Blob(binaryString);
	        }
	        catch (e) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Failed to construct Blob from Base64 string: ' + e);
	        }
	    };
	    Blob.fromUint8Array = function (array) {
	        validateExactNumberOfArgs('Blob.fromUint8Array', arguments, 1);
	        assertUint8ArrayAvailable();
	        if (!(array instanceof Uint8Array)) {
	            throw invalidClassError('Blob.fromUint8Array', 'Uint8Array', 1, array);
	        }
	        // We can't call array.map directly because it expects the return type to
	        // be a Uint8Array, whereas we can convert it to a regular array by invoking
	        // map on the Array prototype.
	        var binaryString = Array.prototype.map
	            .call(array, function (char) {
	            return String.fromCharCode(char);
	        })
	            .join('');
	        return new Blob(binaryString);
	    };
	    Blob.prototype.toBase64 = function () {
	        validateExactNumberOfArgs('Blob.toBase64', arguments, 0);
	        assertBase64Available();
	        return PlatformSupport.getPlatform().btoa(this._binaryString);
	    };
	    Blob.prototype.toUint8Array = function () {
	        var this$1 = this;

	        validateExactNumberOfArgs('Blob.toUint8Array', arguments, 0);
	        assertUint8ArrayAvailable();
	        var buffer = new Uint8Array(this._binaryString.length);
	        for (var i = 0; i < this._binaryString.length; i++) {
	            buffer[i] = this$1._binaryString.charCodeAt(i);
	        }
	        return buffer;
	    };
	    Blob.prototype.toString = function () {
	        return 'Blob(base64: ' + this.toBase64() + ')';
	    };
	    Blob.prototype.isEqual = function (other) {
	        return this._binaryString === other._binaryString;
	    };
	    /**
	     * Actually private to JS consumers of our API, so this function is prefixed
	     * with an underscore.
	     */
	    Blob.prototype._compareTo = function (other) {
	        return primitiveComparator(this._binaryString, other._binaryString);
	    };
	    return Blob;
	}());
	// Public instance that disallows construction at runtime. This constructor is
	// used when exporting Blob on firebase.firestore.Blob and will be called Blob
	// publicly. Internally we still use Blob which has a type checked private
	// constructor. Note that Blob and PublicBlob can be used interchangeably in
	// instanceof checks.
	// For our internal TypeScript code PublicBlob doesn't exist as a type, and so
	// we need to use Blob as type and export it too.
	// tslint:disable-next-line:variable-name We're treating this as a class name.
	var PublicBlob = makeConstructorPrivate(Blob$1, 'Use Blob.fromUint8Array() or Blob.fromBase64String() instead.');

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Immutable class representing a geo point as latitude-longitude pair.
	 * This class is directly exposed in the public API, including its constructor.
	 */
	var GeoPoint = /** @class */ (function () {
	    function GeoPoint(latitude, longitude) {
	        validateExactNumberOfArgs('GeoPoint', arguments, 2);
	        validateArgType('GeoPoint', 'number', 1, latitude);
	        validateArgType('GeoPoint', 'number', 2, longitude);
	        if (!isFinite(latitude) || latitude < -90 || latitude > 90) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Latitude must be a number between -90 and 90, but was: ' + latitude);
	        }
	        if (!isFinite(longitude) || longitude < -180 || longitude > 180) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Longitude must be a number between -180 and 180, but was: ' + longitude);
	        }
	        this._lat = latitude;
	        this._long = longitude;
	    }
	    Object.defineProperty(GeoPoint.prototype, "latitude", {
	        /**
	         * Returns the latitude of this geo point, a number between -90 and 90.
	         */
	        get: function () {
	            return this._lat;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(GeoPoint.prototype, "longitude", {
	        /**
	         * Returns the longitude of this geo point, a number between -180 and 180.
	         */
	        get: function () {
	            return this._long;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    GeoPoint.prototype.isEqual = function (other) {
	        return this._lat === other._lat && this._long === other._long;
	    };
	    /**
	     * Actually private to JS consumers of our API, so this function is prefixed
	     * with an underscore.
	     */
	    GeoPoint.prototype._compareTo = function (other) {
	        return (primitiveComparator(this._lat, other._lat) ||
	            primitiveComparator(this._long, other._long));
	    };
	    return GeoPoint;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var Timestamp = /** @class */ (function () {
	    function Timestamp(seconds, nanoseconds) {
	        this.seconds = seconds;
	        this.nanoseconds = nanoseconds;
	        if (nanoseconds < 0) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Timestamp nanoseconds out of range: ' + nanoseconds);
	        }
	        if (nanoseconds >= 1e9) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Timestamp nanoseconds out of range: ' + nanoseconds);
	        }
	        // Midnight at the beginning of 1/1/1 is the earliest Firestore supports.
	        if (seconds < -62135596800) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Timestamp seconds out of range: ' + seconds);
	        }
	        // This will break in the year 10,000.
	        if (seconds >= 253402300800) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Timestamp seconds out of range: ' + seconds);
	        }
	    }
	    Timestamp.now = function () {
	        return Timestamp.fromMillis(Date.now());
	    };
	    Timestamp.fromDate = function (date) {
	        return Timestamp.fromMillis(date.getTime());
	    };
	    Timestamp.fromMillis = function (milliseconds) {
	        var seconds = Math.floor(milliseconds / 1000);
	        var nanos = (milliseconds - seconds * 1000) * 1e6;
	        return new Timestamp(seconds, nanos);
	    };
	    Timestamp.prototype.toDate = function () {
	        return new Date(this.toMillis());
	    };
	    Timestamp.prototype.toMillis = function () {
	        return this.seconds * 1000 + this.nanoseconds / 1e6;
	    };
	    Timestamp.prototype._compareTo = function (other) {
	        if (this.seconds === other.seconds) {
	            return primitiveComparator(this.nanoseconds, other.nanoseconds);
	        }
	        return primitiveComparator(this.seconds, other.seconds);
	    };
	    Timestamp.prototype.isEqual = function (other) {
	        return (other.seconds === this.seconds && other.nanoseconds === this.nanoseconds);
	    };
	    Timestamp.prototype.toString = function () {
	        return ('Timestamp(seconds=' +
	            this.seconds +
	            ', nanoseconds=' +
	            this.nanoseconds +
	            ')');
	    };
	    return Timestamp;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var DatabaseInfo = /** @class */ (function () {
	    /**
	     * Constructs a DatabaseInfo using the provided host, databaseId and
	     * persistenceKey.
	     *
	     * @param databaseId The database to use.
	     * @param persistenceKey A unique identifier for this Firestore's local
	     * storage (used in conjunction with the databaseId).
	     * @param host The Firestore backend host to connect to.
	     * @param ssl Whether to use SSL when connecting.
	     */
	    function DatabaseInfo(databaseId, persistenceKey, host, ssl) {
	        this.databaseId = databaseId;
	        this.persistenceKey = persistenceKey;
	        this.host = host;
	        this.ssl = ssl;
	    }
	    return DatabaseInfo;
	}());
	/** The default database name for a project. */
	var DEFAULT_DATABASE_NAME = '(default)';
	/** Represents the database ID a Firestore client is associated with. */
	var DatabaseId = /** @class */ (function () {
	    function DatabaseId(projectId, database) {
	        this.projectId = projectId;
	        this.database = database ? database : DEFAULT_DATABASE_NAME;
	    }
	    Object.defineProperty(DatabaseId.prototype, "isDefaultDatabase", {
	        get: function () {
	            return this.database === DEFAULT_DATABASE_NAME;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    DatabaseId.prototype.isEqual = function (other) {
	        return (other instanceof DatabaseId &&
	            other.projectId === this.projectId &&
	            other.database === this.database);
	    };
	    DatabaseId.prototype.compareTo = function (other) {
	        return (primitiveComparator(this.projectId, other.projectId) ||
	            primitiveComparator(this.database, other.database));
	    };
	    return DatabaseId;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var DOCUMENT_KEY_NAME = '__name__';
	/**
	 * Path represents an ordered sequence of string segments.
	 */
	var Path = /** @class */ (function () {
	    function Path(segments, offset, length) {
	        this.init(segments, offset, length);
	    }
	    /**
	     * An initialization method that can be called from outside the constructor.
	     * We need this so that we can have a non-static construct method that returns
	     * the polymorphic `this` type.
	     */
	    Path.prototype.init = function (segments, offset, length) {
	        if (offset === undefined) {
	            offset = 0;
	        }
	        else if (offset > segments.length) {
	            fail('offset ' + offset + ' out of range ' + segments.length);
	        }
	        if (length === undefined) {
	            length = segments.length - offset;
	        }
	        else if (length > segments.length - offset) {
	            fail('length ' + length + ' out of range ' + (segments.length - offset));
	        }
	        this.segments = segments;
	        this.offset = offset;
	        this.len = length;
	    };
	    /**
	     * Constructs a new instance of Path using the same concrete type as `this`.
	     * We need this instead of using the normal constructor, because polymorphic
	     * `this` doesn't work on static methods.
	     */
	    Path.prototype.construct = function (segments, offset, length) {
	        var path = Object.create(Object.getPrototypeOf(this));
	        path.init(segments, offset, length);
	        return path;
	    };
	    Object.defineProperty(Path.prototype, "length", {
	        get: function () {
	            return this.len;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Path.prototype.isEqual = function (other) {
	        return Path.comparator(this, other) === 0;
	    };
	    Path.prototype.child = function (nameOrPath) {
	        var segments = this.segments.slice(this.offset, this.limit());
	        if (nameOrPath instanceof Path) {
	            nameOrPath.forEach(function (segment) {
	                segments.push(segment);
	            });
	        }
	        else if (typeof nameOrPath === 'string') {
	            segments.push(nameOrPath);
	        }
	        else {
	            fail('Unknown parameter type for Path.child(): ' + nameOrPath);
	        }
	        return this.construct(segments);
	    };
	    /** The index of one past the last segment of the path. */
	    Path.prototype.limit = function () {
	        return this.offset + this.length;
	    };
	    Path.prototype.popFirst = function (size) {
	        size = size === undefined ? 1 : size;
	        assert$1(this.length >= size, "Can't call popFirst() with less segments");
	        return this.construct(this.segments, this.offset + size, this.length - size);
	    };
	    Path.prototype.popLast = function () {
	        assert$1(!this.isEmpty(), "Can't call popLast() on empty path");
	        return this.construct(this.segments, this.offset, this.length - 1);
	    };
	    Path.prototype.firstSegment = function () {
	        assert$1(!this.isEmpty(), "Can't call firstSegment() on empty path");
	        return this.segments[this.offset];
	    };
	    Path.prototype.lastSegment = function () {
	        assert$1(!this.isEmpty(), "Can't call lastSegment() on empty path");
	        return this.segments[this.limit() - 1];
	    };
	    Path.prototype.get = function (index) {
	        assert$1(index < this.length, 'Index out of range');
	        return this.segments[this.offset + index];
	    };
	    Path.prototype.isEmpty = function () {
	        return this.length === 0;
	    };
	    Path.prototype.isPrefixOf = function (other) {
	        var this$1 = this;

	        if (other.length < this.length) {
	            return false;
	        }
	        for (var i = 0; i < this.length; i++) {
	            if (this$1.get(i) !== other.get(i)) {
	                return false;
	            }
	        }
	        return true;
	    };
	    Path.prototype.forEach = function (fn) {
	        var this$1 = this;

	        for (var i = this.offset, end = this.limit(); i < end; i++) {
	            fn(this$1.segments[i]);
	        }
	    };
	    Path.prototype.toArray = function () {
	        return this.segments.slice(this.offset, this.limit());
	    };
	    Path.comparator = function (p1, p2) {
	        var len = Math.min(p1.length, p2.length);
	        for (var i = 0; i < len; i++) {
	            var left = p1.get(i);
	            var right = p2.get(i);
	            if (left < right)
	                { return -1; }
	            if (left > right)
	                { return 1; }
	        }
	        if (p1.length < p2.length)
	            { return -1; }
	        if (p1.length > p2.length)
	            { return 1; }
	        return 0;
	    };
	    return Path;
	}());
	/**
	 * A slash-separated path for navigating resources (documents and collections)
	 * within Firestore.
	 */
	var ResourcePath = /** @class */ (function (_super) {
	    __extends(ResourcePath, _super);
	    function ResourcePath() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    ResourcePath.prototype.canonicalString = function () {
	        // NOTE: The client is ignorant of any path segments containing escape
	        // sequences (e.g. __id123__) and just passes them through raw (they exist
	        // for legacy reasons and should not be used frequently).
	        return this.toArray().join('/');
	    };
	    ResourcePath.prototype.toString = function () {
	        return this.canonicalString();
	    };
	    /**
	     * Creates a resource path from the given slash-delimited string.
	     */
	    ResourcePath.fromString = function (path) {
	        // NOTE: The client is ignorant of any path segments containing escape
	        // sequences (e.g. __id123__) and just passes them through raw (they exist
	        // for legacy reasons and should not be used frequently).
	        if (path.indexOf('//') >= 0) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid path (" + path + "). Paths must not contain // in them.");
	        }
	        // We may still have an empty segment at the beginning or end if they had a
	        // leading or trailing slash (which we allow).
	        var segments = path.split('/').filter(function (segment) { return segment.length > 0; });
	        return new ResourcePath(segments);
	    };
	    ResourcePath.EMPTY_PATH = new ResourcePath([]);
	    return ResourcePath;
	}(Path));
	var identifierRegExp = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
	/** A dot-separated path for navigating sub-objects within a document. */
	var FieldPath = /** @class */ (function (_super) {
	    __extends(FieldPath, _super);
	    function FieldPath() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    /**
	     * Returns true if the string could be used as a segment in a field path
	     * without escaping.
	     */
	    FieldPath.isValidIdentifier = function (segment) {
	        return identifierRegExp.test(segment);
	    };
	    FieldPath.prototype.canonicalString = function () {
	        return this.toArray()
	            .map(function (str) {
	            str = str.replace('\\', '\\\\').replace('`', '\\`');
	            if (!FieldPath.isValidIdentifier(str)) {
	                str = '`' + str + '`';
	            }
	            return str;
	        })
	            .join('.');
	    };
	    FieldPath.prototype.toString = function () {
	        return this.canonicalString();
	    };
	    /**
	     * Returns true if this field references the key of a document.
	     */
	    FieldPath.prototype.isKeyField = function () {
	        return this.length === 1 && this.get(0) === DOCUMENT_KEY_NAME;
	    };
	    /**
	     * The field designating the key of a document.
	     */
	    FieldPath.keyField = function () {
	        return new FieldPath([DOCUMENT_KEY_NAME]);
	    };
	    /**
	     * Parses a field string from the given server-formatted string.
	     *
	     * - Splitting the empty string is not allowed (for now at least).
	     * - Empty segments within the string (e.g. if there are two consecutive
	     *   separators) are not allowed.
	     *
	     * TODO(b/37244157): we should make this more strict. Right now, it allows
	     * non-identifier path components, even if they aren't escaped.
	     */
	    FieldPath.fromServerFormat = function (path) {
	        var segments = [];
	        var current = '';
	        var i = 0;
	        var addCurrentSegment = function () {
	            if (current.length === 0) {
	                throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid field path (" + path + "). Paths must not be empty, begin " +
	                    "with '.', end with '.', or contain '..'");
	            }
	            segments.push(current);
	            current = '';
	        };
	        var inBackticks = false;
	        while (i < path.length) {
	            var c = path[i];
	            if (c === '\\') {
	                if (i + 1 === path.length) {
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, 'Path has trailing escape character: ' + path);
	                }
	                var next = path[i + 1];
	                if (!(next === '\\' || next === '.' || next === '`')) {
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, 'Path has invalid escape sequence: ' + path);
	                }
	                current += next;
	                i += 2;
	            }
	            else if (c === '`') {
	                inBackticks = !inBackticks;
	                i++;
	            }
	            else if (c === '.' && !inBackticks) {
	                addCurrentSegment();
	                i++;
	            }
	            else {
	                current += c;
	                i++;
	            }
	        }
	        addCurrentSegment();
	        if (inBackticks) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Unterminated ` in path: ' + path);
	        }
	        return new FieldPath(segments);
	    };
	    FieldPath.EMPTY_PATH = new FieldPath([]);
	    return FieldPath;
	}(Path));

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var DocumentKey = /** @class */ (function () {
	    function DocumentKey(path) {
	        this.path = path;
	        assert$1(DocumentKey.isDocumentKey(path), 'Invalid DocumentKey with an odd number of segments: ' +
	            path.toArray().join('/'));
	    }
	    DocumentKey.prototype.isEqual = function (other) {
	        return (other !== null && ResourcePath.comparator(this.path, other.path) === 0);
	    };
	    DocumentKey.prototype.toString = function () {
	        return this.path.toString();
	    };
	    DocumentKey.comparator = function (k1, k2) {
	        return ResourcePath.comparator(k1.path, k2.path);
	    };
	    DocumentKey.isDocumentKey = function (path) {
	        return path.length % 2 === 0;
	    };
	    /**
	     * Creates and returns a new document key with the given segments.
	     *
	     * @param path The segments of the path to the document
	     * @return A new instance of DocumentKey
	     */
	    DocumentKey.fromSegments = function (segments) {
	        return new DocumentKey(new ResourcePath(segments.slice()));
	    };
	    /**
	     * Creates and returns a new document key using '/' to split the string into
	     * segments.
	     *
	     * @param path The slash-separated path string to the document
	     * @return A new instance of DocumentKey
	     */
	    DocumentKey.fromPathString = function (path) {
	        return new DocumentKey(ResourcePath.fromString(path));
	    };
	    DocumentKey.EMPTY = new DocumentKey(new ResourcePath([]));
	    return DocumentKey;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var Document = /** @class */ (function () {
	    function Document(key, version, data, options) {
	        this.key = key;
	        this.version = version;
	        this.data = data;
	        this.hasLocalMutations = options.hasLocalMutations;
	    }
	    Document.prototype.field = function (path) {
	        return this.data.field(path);
	    };
	    Document.prototype.fieldValue = function (path) {
	        var field = this.field(path);
	        return field ? field.value() : undefined;
	    };
	    Document.prototype.value = function () {
	        return this.data.value();
	    };
	    Document.prototype.isEqual = function (other) {
	        return (other instanceof Document &&
	            this.key.isEqual(other.key) &&
	            this.version.isEqual(other.version) &&
	            this.data.isEqual(other.data) &&
	            this.hasLocalMutations === other.hasLocalMutations);
	    };
	    Document.prototype.toString = function () {
	        return ("Document(" + this.key + ", " + this.version + ", " + this.data.toString() + ", " +
	            ("{hasLocalMutations: " + this.hasLocalMutations + "})"));
	    };
	    Document.compareByKey = function (d1, d2) {
	        return DocumentKey.comparator(d1.key, d2.key);
	    };
	    Document.compareByField = function (field, d1, d2) {
	        var v1 = d1.field(field);
	        var v2 = d2.field(field);
	        if (v1 !== undefined && v2 !== undefined) {
	            return v1.compareTo(v2);
	        }
	        else {
	            return fail("Trying to compare documents on fields that don't exist");
	        }
	    };
	    return Document;
	}());
	/**
	 * A class representing a deleted document.
	 * Version is set to 0 if we don't point to any specific time, otherwise it
	 * denotes time we know it didn't exist at.
	 */
	var NoDocument = /** @class */ (function () {
	    function NoDocument(key, version) {
	        this.key = key;
	        this.version = version;
	    }
	    NoDocument.prototype.toString = function () {
	        return "NoDocument(" + this.key + ", " + this.version + ")";
	    };
	    NoDocument.prototype.isEqual = function (other) {
	        return (other &&
	            other.version.isEqual(this.version) &&
	            other.key.isEqual(this.key));
	    };
	    NoDocument.compareByKey = function (d1, d2) {
	        return DocumentKey.comparator(d1.key, d2.key);
	    };
	    return NoDocument;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	// An immutable sorted map implementation, based on a Left-leaning Red-Black
	// tree.
	var SortedMap = /** @class */ (function () {
	    function SortedMap(comparator, root) {
	        this.comparator = comparator;
	        this.root = root ? root : LLRBNode.EMPTY;
	    }
	    // Returns a copy of the map, with the specified key/value added or replaced.
	    SortedMap.prototype.insert = function (key, value) {
	        return new SortedMap(this.comparator, this.root
	            .insert(key, value, this.comparator)
	            .copy(null, null, LLRBNode.BLACK, null, null));
	    };
	    // Returns a copy of the map, with the specified key removed.
	    SortedMap.prototype.remove = function (key) {
	        return new SortedMap(this.comparator, this.root
	            .remove(key, this.comparator)
	            .copy(null, null, LLRBNode.BLACK, null, null));
	    };
	    // Returns the value of the node with the given key, or null.
	    SortedMap.prototype.get = function (key) {
	        var this$1 = this;

	        var node = this.root;
	        while (!node.isEmpty()) {
	            var cmp = this$1.comparator(key, node.key);
	            if (cmp === 0) {
	                return node.value;
	            }
	            else if (cmp < 0) {
	                node = node.left;
	            }
	            else if (cmp > 0) {
	                node = node.right;
	            }
	        }
	        return null;
	    };
	    // Returns the index of the element in this sorted map, or -1 if it doesn't
	    // exist.
	    SortedMap.prototype.indexOf = function (key) {
	        var this$1 = this;

	        // Number of nodes that were pruned when descending right
	        var prunedNodes = 0;
	        var node = this.root;
	        while (!node.isEmpty()) {
	            var cmp = this$1.comparator(key, node.key);
	            if (cmp === 0) {
	                return prunedNodes + node.left.size;
	            }
	            else if (cmp < 0) {
	                node = node.left;
	            }
	            else {
	                // Count all nodes left of the node plus the node itself
	                prunedNodes += node.left.size + 1;
	                node = node.right;
	            }
	        }
	        // Node not found
	        return -1;
	    };
	    SortedMap.prototype.isEmpty = function () {
	        return this.root.isEmpty();
	    };
	    Object.defineProperty(SortedMap.prototype, "size", {
	        // Returns the total number of nodes in the map.
	        get: function () {
	            return this.root.size;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    // Returns the minimum key in the map.
	    SortedMap.prototype.minKey = function () {
	        return this.root.minKey();
	    };
	    // Returns the maximum key in the map.
	    SortedMap.prototype.maxKey = function () {
	        return this.root.maxKey();
	    };
	    // Traverses the map in key order and calls the specified action function
	    // for each key/value pair. If action returns true, traversal is aborted.
	    // Returns the first truthy value returned by action, or the last falsey
	    // value returned by action.
	    SortedMap.prototype.inorderTraversal = function (action) {
	        return this.root.inorderTraversal(action);
	    };
	    SortedMap.prototype.forEach = function (fn) {
	        this.inorderTraversal(function (k, v) {
	            fn(k, v);
	            return false;
	        });
	    };
	    // Traverses the map in reverse key order and calls the specified action
	    // function for each key/value pair. If action returns true, traversal is
	    // aborted.
	    // Returns the first truthy value returned by action, or the last falsey
	    // value returned by action.
	    SortedMap.prototype.reverseTraversal = function (action) {
	        return this.root.reverseTraversal(action);
	    };
	    // Returns an iterator over the SortedMap.
	    SortedMap.prototype.getIterator = function () {
	        return new SortedMapIterator(this.root, null, this.comparator, false);
	    };
	    SortedMap.prototype.getIteratorFrom = function (key) {
	        return new SortedMapIterator(this.root, key, this.comparator, false);
	    };
	    SortedMap.prototype.getReverseIterator = function () {
	        return new SortedMapIterator(this.root, null, this.comparator, true);
	    };
	    SortedMap.prototype.getReverseIteratorFrom = function (key) {
	        return new SortedMapIterator(this.root, key, this.comparator, true);
	    };
	    return SortedMap;
	}()); // end SortedMap
	// An iterator over an LLRBNode.
	var SortedMapIterator = /** @class */ (function () {
	    function SortedMapIterator(node, startKey, comparator, isReverse) {
	        var this$1 = this;

	        this.isReverse = isReverse;
	        this.nodeStack = [];
	        var cmp = 1;
	        while (!node.isEmpty()) {
	            cmp = startKey ? comparator(node.key, startKey) : 1;
	            // flip the comparison if we're going in reverse
	            if (isReverse)
	                { cmp *= -1; }
	            if (cmp < 0) {
	                // This node is less than our start key. ignore it
	                if (this$1.isReverse) {
	                    node = node.left;
	                }
	                else {
	                    node = node.right;
	                }
	            }
	            else if (cmp === 0) {
	                // This node is exactly equal to our start key. Push it on the stack,
	                // but stop iterating;
	                this$1.nodeStack.push(node);
	                break;
	            }
	            else {
	                // This node is greater than our start key, add it to the stack and move
	                // to the next one
	                this$1.nodeStack.push(node);
	                if (this$1.isReverse) {
	                    node = node.right;
	                }
	                else {
	                    node = node.left;
	                }
	            }
	        }
	    }
	    SortedMapIterator.prototype.getNext = function () {
	        var this$1 = this;

	        assert$1(this.nodeStack.length > 0, 'getNext() called on iterator when hasNext() is false.');
	        var node = this.nodeStack.pop();
	        var result = { key: node.key, value: node.value };
	        if (this.isReverse) {
	            node = node.left;
	            while (!node.isEmpty()) {
	                this$1.nodeStack.push(node);
	                node = node.right;
	            }
	        }
	        else {
	            node = node.right;
	            while (!node.isEmpty()) {
	                this$1.nodeStack.push(node);
	                node = node.left;
	            }
	        }
	        return result;
	    };
	    SortedMapIterator.prototype.hasNext = function () {
	        return this.nodeStack.length > 0;
	    };
	    SortedMapIterator.prototype.peek = function () {
	        if (this.nodeStack.length === 0)
	            { return null; }
	        var node = this.nodeStack[this.nodeStack.length - 1];
	        return { key: node.key, value: node.value };
	    };
	    return SortedMapIterator;
	}()); // end SortedMapIterator
	// Represents a node in a Left-leaning Red-Black tree.
	var LLRBNode = /** @class */ (function () {
	    function LLRBNode(key, value, color, left, right) {
	        this.key = key;
	        this.value = value;
	        this.color = color != null ? color : LLRBNode.RED;
	        this.left = left != null ? left : LLRBNode.EMPTY;
	        this.right = right != null ? right : LLRBNode.EMPTY;
	        this.size = this.left.size + 1 + this.right.size;
	    }
	    // Returns a copy of the current node, optionally replacing pieces of it.
	    LLRBNode.prototype.copy = function (key, value, color, left, right) {
	        return new LLRBNode(key != null ? key : this.key, value != null ? value : this.value, color != null ? color : this.color, left != null ? left : this.left, right != null ? right : this.right);
	    };
	    LLRBNode.prototype.isEmpty = function () {
	        return false;
	    };
	    // Traverses the tree in key order and calls the specified action function
	    // for each node. If action returns true, traversal is aborted.
	    // Returns the first truthy value returned by action, or the last falsey
	    // value returned by action.
	    LLRBNode.prototype.inorderTraversal = function (action) {
	        return (this.left.inorderTraversal(action) ||
	            action(this.key, this.value) ||
	            this.right.inorderTraversal(action));
	    };
	    // Traverses the tree in reverse key order and calls the specified action
	    // function for each node. If action returns true, traversal is aborted.
	    // Returns the first truthy value returned by action, or the last falsey
	    // value returned by action.
	    LLRBNode.prototype.reverseTraversal = function (action) {
	        return (this.right.reverseTraversal(action) ||
	            action(this.key, this.value) ||
	            this.left.reverseTraversal(action));
	    };
	    // Returns the minimum node in the tree.
	    LLRBNode.prototype.min = function () {
	        if (this.left.isEmpty()) {
	            return this;
	        }
	        else {
	            return this.left.min();
	        }
	    };
	    // Returns the maximum key in the tree.
	    LLRBNode.prototype.minKey = function () {
	        return this.min().key;
	    };
	    // Returns the maximum key in the tree.
	    LLRBNode.prototype.maxKey = function () {
	        if (this.right.isEmpty()) {
	            return this.key;
	        }
	        else {
	            return this.right.maxKey();
	        }
	    };
	    // Returns new tree, with the key/value added.
	    LLRBNode.prototype.insert = function (key, value, comparator) {
	        var n = this;
	        var cmp = comparator(key, n.key);
	        if (cmp < 0) {
	            n = n.copy(null, null, null, n.left.insert(key, value, comparator), null);
	        }
	        else if (cmp === 0) {
	            n = n.copy(null, value, null, null, null);
	        }
	        else {
	            n = n.copy(null, null, null, null, n.right.insert(key, value, comparator));
	        }
	        return n.fixUp();
	    };
	    LLRBNode.prototype.removeMin = function () {
	        if (this.left.isEmpty()) {
	            return LLRBNode.EMPTY;
	        }
	        var n = this;
	        if (!n.left.isRed() && !n.left.left.isRed())
	            { n = n.moveRedLeft(); }
	        n = n.copy(null, null, null, n.left.removeMin(), null);
	        return n.fixUp();
	    };
	    // Returns new tree, with the specified item removed.
	    LLRBNode.prototype.remove = function (key, comparator) {
	        var smallest;
	        var n = this;
	        if (comparator(key, n.key) < 0) {
	            if (!n.left.isEmpty() && !n.left.isRed() && !n.left.left.isRed()) {
	                n = n.moveRedLeft();
	            }
	            n = n.copy(null, null, null, n.left.remove(key, comparator), null);
	        }
	        else {
	            if (n.left.isRed())
	                { n = n.rotateRight(); }
	            if (!n.right.isEmpty() && !n.right.isRed() && !n.right.left.isRed()) {
	                n = n.moveRedRight();
	            }
	            if (comparator(key, n.key) === 0) {
	                if (n.right.isEmpty()) {
	                    return LLRBNode.EMPTY;
	                }
	                else {
	                    smallest = n.right.min();
	                    n = n.copy(smallest.key, smallest.value, null, null, n.right.removeMin());
	                }
	            }
	            n = n.copy(null, null, null, null, n.right.remove(key, comparator));
	        }
	        return n.fixUp();
	    };
	    LLRBNode.prototype.isRed = function () {
	        return this.color;
	    };
	    // Returns new tree after performing any needed rotations.
	    LLRBNode.prototype.fixUp = function () {
	        var n = this;
	        if (n.right.isRed() && !n.left.isRed())
	            { n = n.rotateLeft(); }
	        if (n.left.isRed() && n.left.left.isRed())
	            { n = n.rotateRight(); }
	        if (n.left.isRed() && n.right.isRed())
	            { n = n.colorFlip(); }
	        return n;
	    };
	    LLRBNode.prototype.moveRedLeft = function () {
	        var n = this.colorFlip();
	        if (n.right.left.isRed()) {
	            n = n.copy(null, null, null, null, n.right.rotateRight());
	            n = n.rotateLeft();
	            n = n.colorFlip();
	        }
	        return n;
	    };
	    LLRBNode.prototype.moveRedRight = function () {
	        var n = this.colorFlip();
	        if (n.left.left.isRed()) {
	            n = n.rotateRight();
	            n = n.colorFlip();
	        }
	        return n;
	    };
	    LLRBNode.prototype.rotateLeft = function () {
	        var nl = this.copy(null, null, LLRBNode.RED, null, this.right.left);
	        return this.right.copy(null, null, this.color, nl, null);
	    };
	    LLRBNode.prototype.rotateRight = function () {
	        var nr = this.copy(null, null, LLRBNode.RED, this.left.right, null);
	        return this.left.copy(null, null, this.color, null, nr);
	    };
	    LLRBNode.prototype.colorFlip = function () {
	        var left = this.left.copy(null, null, !this.left.color, null, null);
	        var right = this.right.copy(null, null, !this.right.color, null, null);
	        return this.copy(null, null, !this.color, left, right);
	    };
	    // For testing.
	    LLRBNode.prototype.checkMaxDepth = function () {
	        var blackDepth = this.check();
	        if (Math.pow(2.0, blackDepth) <= this.size + 1) {
	            return true;
	        }
	        else {
	            return false;
	        }
	    };
	    // In a balanced RB tree, the black-depth (number of black nodes) from root to
	    // leaves is equal on both sides.  This function verifies that or asserts.
	    LLRBNode.prototype.check = function () {
	        if (this.isRed() && this.left.isRed()) {
	            throw fail('Red node has red child(' + this.key + ',' + this.value + ')');
	        }
	        if (this.right.isRed()) {
	            throw fail('Right child of (' + this.key + ',' + this.value + ') is red');
	        }
	        var blackDepth = this.left.check();
	        if (blackDepth !== this.right.check()) {
	            throw fail('Black depths differ');
	        }
	        else {
	            return blackDepth + (this.isRed() ? 0 : 1);
	        }
	    };
	    // tslint:disable-next-line:no-any Empty node is shared between all LLRB trees.
	    LLRBNode.EMPTY = null;
	    LLRBNode.RED = true;
	    LLRBNode.BLACK = false;
	    return LLRBNode;
	}()); // end LLRBNode
	// Represents an empty node (a leaf node in the Red-Black Tree).
	var LLRBEmptyNode = /** @class */ (function () {
	    function LLRBEmptyNode() {
	        this.size = 0;
	    }
	    // Returns a copy of the current node.
	    LLRBEmptyNode.prototype.copy = function (key, value, color, left, right) {
	        return this;
	    };
	    // Returns a copy of the tree, with the specified key/value added.
	    LLRBEmptyNode.prototype.insert = function (key, value, comparator) {
	        return new LLRBNode(key, value);
	    };
	    // Returns a copy of the tree, with the specified key removed.
	    LLRBEmptyNode.prototype.remove = function (key, comparator) {
	        return this;
	    };
	    LLRBEmptyNode.prototype.isEmpty = function () {
	        return true;
	    };
	    LLRBEmptyNode.prototype.inorderTraversal = function (action) {
	        return false;
	    };
	    LLRBEmptyNode.prototype.reverseTraversal = function (action) {
	        return false;
	    };
	    LLRBEmptyNode.prototype.minKey = function () {
	        return null;
	    };
	    LLRBEmptyNode.prototype.maxKey = function () {
	        return null;
	    };
	    LLRBEmptyNode.prototype.isRed = function () {
	        return false;
	    };
	    // For testing.
	    LLRBEmptyNode.prototype.checkMaxDepth = function () {
	        return true;
	    };
	    LLRBEmptyNode.prototype.check = function () {
	        return 0;
	    };
	    return LLRBEmptyNode;
	}()); // end LLRBEmptyNode
	LLRBNode.EMPTY = new LLRBEmptyNode();

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var TypeOrder;
	(function (TypeOrder) {
	    // This order is defined by the backend.
	    TypeOrder[TypeOrder["NullValue"] = 0] = "NullValue";
	    TypeOrder[TypeOrder["BooleanValue"] = 1] = "BooleanValue";
	    TypeOrder[TypeOrder["NumberValue"] = 2] = "NumberValue";
	    TypeOrder[TypeOrder["TimestampValue"] = 3] = "TimestampValue";
	    TypeOrder[TypeOrder["StringValue"] = 4] = "StringValue";
	    TypeOrder[TypeOrder["BlobValue"] = 5] = "BlobValue";
	    TypeOrder[TypeOrder["RefValue"] = 6] = "RefValue";
	    TypeOrder[TypeOrder["GeoPointValue"] = 7] = "GeoPointValue";
	    TypeOrder[TypeOrder["ArrayValue"] = 8] = "ArrayValue";
	    TypeOrder[TypeOrder["ObjectValue"] = 9] = "ObjectValue";
	})(TypeOrder || (TypeOrder = {}));
	/** Defines the return value for pending server timestamps. */
	var ServerTimestampBehavior;
	(function (ServerTimestampBehavior) {
	    ServerTimestampBehavior[ServerTimestampBehavior["Default"] = 0] = "Default";
	    ServerTimestampBehavior[ServerTimestampBehavior["Estimate"] = 1] = "Estimate";
	    ServerTimestampBehavior[ServerTimestampBehavior["Previous"] = 2] = "Previous";
	})(ServerTimestampBehavior || (ServerTimestampBehavior = {}));
	/** Holds properties that define field value deserialization options. */
	var FieldValueOptions = /** @class */ (function () {
	    function FieldValueOptions(serverTimestampBehavior, timestampsInSnapshots) {
	        this.serverTimestampBehavior = serverTimestampBehavior;
	        this.timestampsInSnapshots = timestampsInSnapshots;
	    }
	    FieldValueOptions.fromSnapshotOptions = function (options, timestampsInSnapshots) {
	        switch (options.serverTimestamps) {
	            case 'estimate':
	                return new FieldValueOptions(ServerTimestampBehavior.Estimate, timestampsInSnapshots);
	            case 'previous':
	                return new FieldValueOptions(ServerTimestampBehavior.Previous, timestampsInSnapshots);
	            case 'none': // Fall-through intended.
	            case undefined:
	                return new FieldValueOptions(ServerTimestampBehavior.Default, timestampsInSnapshots);
	            default:
	                return fail('fromSnapshotOptions() called with invalid options.');
	        }
	    };
	    return FieldValueOptions;
	}());
	/**
	 * A field value represents a datatype as stored by Firestore.
	 */
	var FieldValue = /** @class */ (function () {
	    function FieldValue() {
	    }
	    FieldValue.prototype.toString = function () {
	        var val = this.value();
	        return val === null ? 'null' : val.toString();
	    };
	    FieldValue.prototype.defaultCompareTo = function (other) {
	        assert$1(this.typeOrder !== other.typeOrder, 'Default compareTo should not be used for values of same type.');
	        var cmp = primitiveComparator(this.typeOrder, other.typeOrder);
	        return cmp;
	    };
	    return FieldValue;
	}());
	var NullValue = /** @class */ (function (_super) {
	    __extends(NullValue, _super);
	    function NullValue() {
	        var _this = _super.call(this) || this;
	        _this.typeOrder = TypeOrder.NullValue;
	        // internalValue is unused but we add it to work around
	        // https://github.com/Microsoft/TypeScript/issues/15585
	        _this.internalValue = null;
	        return _this;
	    }
	    NullValue.prototype.value = function (options) {
	        return null;
	    };
	    NullValue.prototype.isEqual = function (other) {
	        return other instanceof NullValue;
	    };
	    NullValue.prototype.compareTo = function (other) {
	        if (other instanceof NullValue) {
	            return 0;
	        }
	        return this.defaultCompareTo(other);
	    };
	    NullValue.INSTANCE = new NullValue();
	    return NullValue;
	}(FieldValue));
	var BooleanValue = /** @class */ (function (_super) {
	    __extends(BooleanValue, _super);
	    function BooleanValue(internalValue) {
	        var _this = _super.call(this) || this;
	        _this.internalValue = internalValue;
	        _this.typeOrder = TypeOrder.BooleanValue;
	        return _this;
	    }
	    BooleanValue.prototype.value = function (options) {
	        return this.internalValue;
	    };
	    BooleanValue.prototype.isEqual = function (other) {
	        return (other instanceof BooleanValue &&
	            this.internalValue === other.internalValue);
	    };
	    BooleanValue.prototype.compareTo = function (other) {
	        if (other instanceof BooleanValue) {
	            return primitiveComparator(this, other);
	        }
	        return this.defaultCompareTo(other);
	    };
	    BooleanValue.of = function (value) {
	        return value ? BooleanValue.TRUE : BooleanValue.FALSE;
	    };
	    BooleanValue.TRUE = new BooleanValue(true);
	    BooleanValue.FALSE = new BooleanValue(false);
	    return BooleanValue;
	}(FieldValue));
	/** Base class for IntegerValue and DoubleValue. */
	var NumberValue = /** @class */ (function (_super) {
	    __extends(NumberValue, _super);
	    function NumberValue(internalValue) {
	        var _this = _super.call(this) || this;
	        _this.internalValue = internalValue;
	        _this.typeOrder = TypeOrder.NumberValue;
	        return _this;
	    }
	    NumberValue.prototype.value = function (options) {
	        return this.internalValue;
	    };
	    NumberValue.prototype.compareTo = function (other) {
	        if (other instanceof NumberValue) {
	            return numericComparator(this.internalValue, other.internalValue);
	        }
	        return this.defaultCompareTo(other);
	    };
	    return NumberValue;
	}(FieldValue));
	/** Utility function to compare doubles (using Firestore semantics for NaN). */
	function numericComparator(left, right) {
	    if (left < right) {
	        return -1;
	    }
	    else if (left > right) {
	        return 1;
	    }
	    else if (left === right) {
	        return 0;
	    }
	    else {
	        // one or both are NaN.
	        if (isNaN(left)) {
	            return isNaN(right) ? 0 : -1;
	        }
	        else {
	            return 1;
	        }
	    }
	}
	/**
	 * Utility function to check numbers for equality using Firestore semantics
	 * (NaN === NaN, -0.0 !== 0.0).
	 */
	function numericEquals(left, right) {
	    // Implemented based on Object.is() polyfill from
	    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
	    if (left === right) {
	        // +0 != -0
	        return left !== 0 || 1 / left === 1 / right;
	    }
	    else {
	        // NaN == NaN
	        return left !== left && right !== right;
	    }
	}
	var IntegerValue = /** @class */ (function (_super) {
	    __extends(IntegerValue, _super);
	    function IntegerValue(internalValue) {
	        return _super.call(this, internalValue) || this;
	    }
	    IntegerValue.prototype.isEqual = function (other) {
	        // NOTE: DoubleValue and IntegerValue instances may compareTo() the same,
	        // but that doesn't make them equal via isEqual().
	        if (other instanceof IntegerValue) {
	            return numericEquals(this.internalValue, other.internalValue);
	        }
	        else {
	            return false;
	        }
	    };
	    return IntegerValue;
	}(NumberValue));
	var DoubleValue = /** @class */ (function (_super) {
	    __extends(DoubleValue, _super);
	    function DoubleValue(internalValue) {
	        var _this = _super.call(this, internalValue) || this;
	        _this.internalValue = internalValue;
	        return _this;
	    }
	    DoubleValue.prototype.isEqual = function (other) {
	        // NOTE: DoubleValue and IntegerValue instances may compareTo() the same,
	        // but that doesn't make them equal via isEqual().
	        if (other instanceof DoubleValue) {
	            return numericEquals(this.internalValue, other.internalValue);
	        }
	        else {
	            return false;
	        }
	    };
	    DoubleValue.NAN = new DoubleValue(NaN);
	    DoubleValue.POSITIVE_INFINITY = new DoubleValue(Infinity);
	    DoubleValue.NEGATIVE_INFINITY = new DoubleValue(-Infinity);
	    return DoubleValue;
	}(NumberValue));
	// TODO(b/37267885): Add truncation support
	var StringValue = /** @class */ (function (_super) {
	    __extends(StringValue, _super);
	    function StringValue(internalValue) {
	        var _this = _super.call(this) || this;
	        _this.internalValue = internalValue;
	        _this.typeOrder = TypeOrder.StringValue;
	        return _this;
	    }
	    StringValue.prototype.value = function (options) {
	        return this.internalValue;
	    };
	    StringValue.prototype.isEqual = function (other) {
	        return (other instanceof StringValue && this.internalValue === other.internalValue);
	    };
	    StringValue.prototype.compareTo = function (other) {
	        if (other instanceof StringValue) {
	            return primitiveComparator(this.internalValue, other.internalValue);
	        }
	        return this.defaultCompareTo(other);
	    };
	    return StringValue;
	}(FieldValue));
	var TimestampValue = /** @class */ (function (_super) {
	    __extends(TimestampValue, _super);
	    function TimestampValue(internalValue) {
	        var _this = _super.call(this) || this;
	        _this.internalValue = internalValue;
	        _this.typeOrder = TypeOrder.TimestampValue;
	        return _this;
	    }
	    TimestampValue.prototype.value = function (options) {
	        if (options && options.timestampsInSnapshots) {
	            return this.internalValue;
	        }
	        else {
	            return this.internalValue.toDate();
	        }
	    };
	    TimestampValue.prototype.isEqual = function (other) {
	        return (other instanceof TimestampValue &&
	            this.internalValue.isEqual(other.internalValue));
	    };
	    TimestampValue.prototype.compareTo = function (other) {
	        if (other instanceof TimestampValue) {
	            return this.internalValue._compareTo(other.internalValue);
	        }
	        else if (other instanceof ServerTimestampValue) {
	            // Concrete timestamps come before server timestamps.
	            return -1;
	        }
	        else {
	            return this.defaultCompareTo(other);
	        }
	    };
	    return TimestampValue;
	}(FieldValue));
	/**
	 * Represents a locally-applied ServerTimestamp.
	 *
	 * Notes:
	 * - ServerTimestampValue instances are created as the result of applying a
	 *   TransformMutation (see TransformMutation.applyTo()). They can only exist in
	 *   the local view of a document. Therefore they do not need to be parsed or
	 *   serialized.
	 * - When evaluated locally (e.g. for snapshot.data()), they by default
	 *   evaluate to `null`. This behavior can be configured by passing custom
	 *   FieldValueOptions to value().
	 * - With respect to other ServerTimestampValues, they sort by their
	 *   localWriteTime.
	 */
	var ServerTimestampValue = /** @class */ (function (_super) {
	    __extends(ServerTimestampValue, _super);
	    function ServerTimestampValue(localWriteTime, previousValue) {
	        var _this = _super.call(this) || this;
	        _this.localWriteTime = localWriteTime;
	        _this.previousValue = previousValue;
	        _this.typeOrder = TypeOrder.TimestampValue;
	        return _this;
	    }
	    ServerTimestampValue.prototype.value = function (options) {
	        if (options &&
	            options.serverTimestampBehavior === ServerTimestampBehavior.Estimate) {
	            return new TimestampValue(this.localWriteTime).value(options);
	        }
	        else if (options &&
	            options.serverTimestampBehavior === ServerTimestampBehavior.Previous) {
	            return this.previousValue ? this.previousValue.value(options) : null;
	        }
	        else {
	            return null;
	        }
	    };
	    ServerTimestampValue.prototype.isEqual = function (other) {
	        return (other instanceof ServerTimestampValue &&
	            this.localWriteTime.isEqual(other.localWriteTime));
	    };
	    ServerTimestampValue.prototype.compareTo = function (other) {
	        if (other instanceof ServerTimestampValue) {
	            return this.localWriteTime._compareTo(other.localWriteTime);
	        }
	        else if (other instanceof TimestampValue) {
	            // Server timestamps come after all concrete timestamps.
	            return 1;
	        }
	        else {
	            return this.defaultCompareTo(other);
	        }
	    };
	    ServerTimestampValue.prototype.toString = function () {
	        return '<ServerTimestamp localTime=' + this.localWriteTime.toString() + '>';
	    };
	    return ServerTimestampValue;
	}(FieldValue));
	var BlobValue = /** @class */ (function (_super) {
	    __extends(BlobValue, _super);
	    function BlobValue(internalValue) {
	        var _this = _super.call(this) || this;
	        _this.internalValue = internalValue;
	        _this.typeOrder = TypeOrder.BlobValue;
	        return _this;
	    }
	    BlobValue.prototype.value = function (options) {
	        return this.internalValue;
	    };
	    BlobValue.prototype.isEqual = function (other) {
	        return (other instanceof BlobValue &&
	            this.internalValue.isEqual(other.internalValue));
	    };
	    BlobValue.prototype.compareTo = function (other) {
	        if (other instanceof BlobValue) {
	            return this.internalValue._compareTo(other.internalValue);
	        }
	        return this.defaultCompareTo(other);
	    };
	    return BlobValue;
	}(FieldValue));
	var RefValue = /** @class */ (function (_super) {
	    __extends(RefValue, _super);
	    function RefValue(databaseId, key) {
	        var _this = _super.call(this) || this;
	        _this.databaseId = databaseId;
	        _this.key = key;
	        _this.typeOrder = TypeOrder.RefValue;
	        return _this;
	    }
	    RefValue.prototype.value = function (options) {
	        return this.key;
	    };
	    RefValue.prototype.isEqual = function (other) {
	        if (other instanceof RefValue) {
	            return (this.key.isEqual(other.key) && this.databaseId.isEqual(other.databaseId));
	        }
	        else {
	            return false;
	        }
	    };
	    RefValue.prototype.compareTo = function (other) {
	        if (other instanceof RefValue) {
	            var cmp = this.databaseId.compareTo(other.databaseId);
	            return cmp !== 0 ? cmp : DocumentKey.comparator(this.key, other.key);
	        }
	        return this.defaultCompareTo(other);
	    };
	    return RefValue;
	}(FieldValue));
	var GeoPointValue = /** @class */ (function (_super) {
	    __extends(GeoPointValue, _super);
	    function GeoPointValue(internalValue) {
	        var _this = _super.call(this) || this;
	        _this.internalValue = internalValue;
	        _this.typeOrder = TypeOrder.GeoPointValue;
	        return _this;
	    }
	    GeoPointValue.prototype.value = function (options) {
	        return this.internalValue;
	    };
	    GeoPointValue.prototype.isEqual = function (other) {
	        return (other instanceof GeoPointValue &&
	            this.internalValue.isEqual(other.internalValue));
	    };
	    GeoPointValue.prototype.compareTo = function (other) {
	        if (other instanceof GeoPointValue) {
	            return this.internalValue._compareTo(other.internalValue);
	        }
	        return this.defaultCompareTo(other);
	    };
	    return GeoPointValue;
	}(FieldValue));
	var ObjectValue = /** @class */ (function (_super) {
	    __extends(ObjectValue, _super);
	    function ObjectValue(internalValue) {
	        var _this = _super.call(this) || this;
	        _this.internalValue = internalValue;
	        _this.typeOrder = TypeOrder.ObjectValue;
	        return _this;
	    }
	    ObjectValue.prototype.value = function (options) {
	        var result = {};
	        this.internalValue.inorderTraversal(function (key, val) {
	            result[key] = val.value(options);
	        });
	        return result;
	    };
	    ObjectValue.prototype.forEach = function (action) {
	        this.internalValue.inorderTraversal(action);
	    };
	    ObjectValue.prototype.isEqual = function (other) {
	        if (other instanceof ObjectValue) {
	            var it1 = this.internalValue.getIterator();
	            var it2 = other.internalValue.getIterator();
	            while (it1.hasNext() && it2.hasNext()) {
	                var next1 = it1.getNext();
	                var next2 = it2.getNext();
	                if (next1.key !== next2.key || !next1.value.isEqual(next2.value)) {
	                    return false;
	                }
	            }
	            return !it1.hasNext() && !it2.hasNext();
	        }
	        return false;
	    };
	    ObjectValue.prototype.compareTo = function (other) {
	        if (other instanceof ObjectValue) {
	            var it1 = this.internalValue.getIterator();
	            var it2 = other.internalValue.getIterator();
	            while (it1.hasNext() && it2.hasNext()) {
	                var next1 = it1.getNext();
	                var next2 = it2.getNext();
	                var cmp = primitiveComparator(next1.key, next2.key) ||
	                    next1.value.compareTo(next2.value);
	                if (cmp) {
	                    return cmp;
	                }
	            }
	            // Only equal if both iterators are exhausted
	            return primitiveComparator(it1.hasNext(), it2.hasNext());
	        }
	        else {
	            return this.defaultCompareTo(other);
	        }
	    };
	    ObjectValue.prototype.set = function (path, to) {
	        assert$1(!path.isEmpty(), 'Cannot set field for empty path on ObjectValue');
	        if (path.length === 1) {
	            return this.setChild(path.firstSegment(), to);
	        }
	        else {
	            var child = this.child(path.firstSegment());
	            if (!(child instanceof ObjectValue)) {
	                child = ObjectValue.EMPTY;
	            }
	            var newChild = child.set(path.popFirst(), to);
	            return this.setChild(path.firstSegment(), newChild);
	        }
	    };
	    ObjectValue.prototype.delete = function (path) {
	        assert$1(!path.isEmpty(), 'Cannot delete field for empty path on ObjectValue');
	        if (path.length === 1) {
	            return new ObjectValue(this.internalValue.remove(path.firstSegment()));
	        }
	        else {
	            // nested field
	            var child = this.child(path.firstSegment());
	            if (child instanceof ObjectValue) {
	                var newChild = child.delete(path.popFirst());
	                return new ObjectValue(this.internalValue.insert(path.firstSegment(), newChild));
	            }
	            else {
	                // Don't actually change a primitive value to an object for a delete
	                return this;
	            }
	        }
	    };
	    ObjectValue.prototype.contains = function (path) {
	        return this.field(path) !== undefined;
	    };
	    ObjectValue.prototype.field = function (path) {
	        assert$1(!path.isEmpty(), "Can't get field of empty path");
	        var field = this;
	        path.forEach(function (pathSegment) {
	            if (field instanceof ObjectValue) {
	                field = field.internalValue.get(pathSegment) || undefined;
	            }
	            else {
	                field = undefined;
	            }
	        });
	        return field;
	    };
	    ObjectValue.prototype.toString = function () {
	        return JSON.stringify(this.value());
	    };
	    ObjectValue.prototype.child = function (childName) {
	        return this.internalValue.get(childName) || undefined;
	    };
	    ObjectValue.prototype.setChild = function (childName, value) {
	        return new ObjectValue(this.internalValue.insert(childName, value));
	    };
	    ObjectValue.EMPTY = new ObjectValue(new SortedMap(primitiveComparator));
	    return ObjectValue;
	}(FieldValue));
	var ArrayValue = /** @class */ (function (_super) {
	    __extends(ArrayValue, _super);
	    function ArrayValue(internalValue) {
	        var _this = _super.call(this) || this;
	        _this.internalValue = internalValue;
	        _this.typeOrder = TypeOrder.ArrayValue;
	        return _this;
	    }
	    ArrayValue.prototype.value = function (options) {
	        return this.internalValue.map(function (v) { return v.value(options); });
	    };
	    ArrayValue.prototype.forEach = function (action) {
	        this.internalValue.forEach(action);
	    };
	    ArrayValue.prototype.isEqual = function (other) {
	        var this$1 = this;

	        if (other instanceof ArrayValue) {
	            if (this.internalValue.length !== other.internalValue.length) {
	                return false;
	            }
	            for (var i = 0; i < this.internalValue.length; i++) {
	                if (!this$1.internalValue[i].isEqual(other.internalValue[i])) {
	                    return false;
	                }
	            }
	            return true;
	        }
	        return false;
	    };
	    ArrayValue.prototype.compareTo = function (other) {
	        var this$1 = this;

	        if (other instanceof ArrayValue) {
	            var minLength = Math.min(this.internalValue.length, other.internalValue.length);
	            for (var i = 0; i < minLength; i++) {
	                var cmp = this$1.internalValue[i].compareTo(other.internalValue[i]);
	                if (cmp) {
	                    return cmp;
	                }
	            }
	            return primitiveComparator(this.internalValue.length, other.internalValue.length);
	        }
	        else {
	            return this.defaultCompareTo(other);
	        }
	    };
	    ArrayValue.prototype.toString = function () {
	        return JSON.stringify(this.value());
	    };
	    return ArrayValue;
	}(FieldValue));

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	// Untyped Number alias we can use to check for ES6 methods / properties.
	// tslint:disable-next-line:no-any variable-name
	var NumberAsAny = Number;
	/**
	 * Minimum safe integer in Javascript because of floating point precision.
	 * Added to not rely on ES6 features.
	 */
	var MIN_SAFE_INTEGER = NumberAsAny.MIN_SAFE_INTEGER || -(Math.pow(2, 53) - 1);
	/**
	 * Maximum safe integer in Javascript because of floating point precision.
	 * Added to not rely on ES6 features.
	 */
	var MAX_SAFE_INTEGER = NumberAsAny.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;
	/**
	 * Returns whether an number is an integer, uses native implementation if
	 * available.
	 * Added to not rely on ES6 features.
	 * @param value The value to test for being an integer
	 */
	var isInteger = NumberAsAny.isInteger ||
	    (function (value) {
	        return typeof value === 'number' &&
	            isFinite(value) &&
	            Math.floor(value) === value;
	    });
	/**
	 * Returns whether a variable is either undefined or null.
	 */
	function isNullOrUndefined(value) {
	    return value === null || value === undefined;
	}
	/**
	 * Returns whether a value is an integer and in the safe integer range
	 * @param value The value to test for being an integer and in the safe range
	 */
	function isSafeInteger(value) {
	    return (isInteger(value) &&
	        value <= MAX_SAFE_INTEGER &&
	        value >= MIN_SAFE_INTEGER);
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var Query = /** @class */ (function () {
	    function Query(path, explicitOrderBy, filters, limit, startAt, endAt) {
	        if (explicitOrderBy === void 0) { explicitOrderBy = []; }
	        if (filters === void 0) { filters = []; }
	        if (limit === void 0) { limit = null; }
	        if (startAt === void 0) { startAt = null; }
	        if (endAt === void 0) { endAt = null; }
	        this.path = path;
	        this.explicitOrderBy = explicitOrderBy;
	        this.filters = filters;
	        this.limit = limit;
	        this.startAt = startAt;
	        this.endAt = endAt;
	        this.memoizedCanonicalId = null;
	        this.memoizedOrderBy = null;
	        if (this.startAt) {
	            this.assertValidBound(this.startAt);
	        }
	        if (this.endAt) {
	            this.assertValidBound(this.endAt);
	        }
	    }
	    Query.atPath = function (path) {
	        return new Query(path);
	    };
	    Object.defineProperty(Query.prototype, "orderBy", {
	        get: function () {
	            var this$1 = this;

	            if (this.memoizedOrderBy === null) {
	                var inequalityField = this.getInequalityFilterField();
	                var firstOrderByField = this.getFirstOrderByField();
	                if (inequalityField !== null && firstOrderByField === null) {
	                    // In order to implicitly add key ordering, we must also add the
	                    // inequality filter field for it to be a valid query.
	                    // Note that the default inequality field and key ordering is ascending.
	                    if (inequalityField.isKeyField()) {
	                        this.memoizedOrderBy = [KEY_ORDERING_ASC];
	                    }
	                    else {
	                        this.memoizedOrderBy = [
	                            new OrderBy(inequalityField),
	                            KEY_ORDERING_ASC
	                        ];
	                    }
	                }
	                else {
	                    assert$1(inequalityField === null ||
	                        (firstOrderByField !== null &&
	                            inequalityField.isEqual(firstOrderByField)), 'First orderBy should match inequality field.');
	                    this.memoizedOrderBy = [];
	                    var foundKeyOrdering = false;
	                    for (var _i = 0, _a = this.explicitOrderBy; _i < _a.length; _i++) {
	                        var orderBy = _a[_i];
	                        this$1.memoizedOrderBy.push(orderBy);
	                        if (orderBy.field.isKeyField()) {
	                            foundKeyOrdering = true;
	                        }
	                    }
	                    if (!foundKeyOrdering) {
	                        // The order of the implicit key ordering always matches the last
	                        // explicit order by
	                        var lastDirection = this.explicitOrderBy.length > 0
	                            ? this.explicitOrderBy[this.explicitOrderBy.length - 1].dir
	                            : Direction.ASCENDING;
	                        this.memoizedOrderBy.push(lastDirection === Direction.ASCENDING
	                            ? KEY_ORDERING_ASC
	                            : KEY_ORDERING_DESC);
	                    }
	                }
	            }
	            return this.memoizedOrderBy;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Query.prototype.addFilter = function (filter) {
	        assert$1(this.getInequalityFilterField() == null ||
	            !(filter instanceof RelationFilter) ||
	            !filter.isInequality() ||
	            filter.field.isEqual(this.getInequalityFilterField()), 'Query must only have one inequality field.');
	        assert$1(!DocumentKey.isDocumentKey(this.path), 'No filtering allowed for document query');
	        var newFilters = this.filters.concat([filter]);
	        return new Query(this.path, this.explicitOrderBy.slice(), newFilters, this.limit, this.startAt, this.endAt);
	    };
	    Query.prototype.addOrderBy = function (orderBy) {
	        assert$1(!DocumentKey.isDocumentKey(this.path), 'No ordering allowed for document query');
	        assert$1(!this.startAt && !this.endAt, 'Bounds must be set after orderBy');
	        // TODO(dimond): validate that orderBy does not list the same key twice.
	        var newOrderBy = this.explicitOrderBy.concat([orderBy]);
	        return new Query(this.path, newOrderBy, this.filters.slice(), this.limit, this.startAt, this.endAt);
	    };
	    Query.prototype.withLimit = function (limit) {
	        return new Query(this.path, this.explicitOrderBy.slice(), this.filters.slice(), limit, this.startAt, this.endAt);
	    };
	    Query.prototype.withStartAt = function (bound) {
	        return new Query(this.path, this.explicitOrderBy.slice(), this.filters.slice(), this.limit, bound, this.endAt);
	    };
	    Query.prototype.withEndAt = function (bound) {
	        return new Query(this.path, this.explicitOrderBy.slice(), this.filters.slice(), this.limit, this.startAt, bound);
	    };
	    // TODO(b/29183165): This is used to get a unique string from a query to, for
	    // example, use as a dictionary key, but the implementation is subject to
	    // collisions. Make it collision-free.
	    Query.prototype.canonicalId = function () {
	        if (this.memoizedCanonicalId === null) {
	            var canonicalId = this.path.canonicalString();
	            canonicalId += '|f:';
	            for (var _i = 0, _a = this.filters; _i < _a.length; _i++) {
	                var filter = _a[_i];
	                canonicalId += filter.canonicalId();
	                canonicalId += ',';
	            }
	            canonicalId += '|ob:';
	            // TODO(dimond): make this collision resistant
	            for (var _b = 0, _c = this.orderBy; _b < _c.length; _b++) {
	                var orderBy = _c[_b];
	                canonicalId += orderBy.canonicalId();
	                canonicalId += ',';
	            }
	            if (!isNullOrUndefined(this.limit)) {
	                canonicalId += '|l:';
	                canonicalId += this.limit;
	            }
	            if (this.startAt) {
	                canonicalId += '|lb:';
	                canonicalId += this.startAt.canonicalId();
	            }
	            if (this.endAt) {
	                canonicalId += '|ub:';
	                canonicalId += this.endAt.canonicalId();
	            }
	            this.memoizedCanonicalId = canonicalId;
	        }
	        return this.memoizedCanonicalId;
	    };
	    Query.prototype.toString = function () {
	        var str = 'Query(' + this.path.canonicalString();
	        if (this.filters.length > 0) {
	            str += ", filters: [" + this.filters.join(', ') + "]";
	        }
	        if (!isNullOrUndefined(this.limit)) {
	            str += ', limit: ' + this.limit;
	        }
	        if (this.explicitOrderBy.length > 0) {
	            str += ", orderBy: [" + this.explicitOrderBy.join(', ') + "]";
	        }
	        if (this.startAt) {
	            str += ', startAt: ' + this.startAt.canonicalId();
	        }
	        if (this.endAt) {
	            str += ', endAt: ' + this.endAt.canonicalId();
	        }
	        return str + ')';
	    };
	    Query.prototype.isEqual = function (other) {
	        var this$1 = this;

	        if (this.limit !== other.limit) {
	            return false;
	        }
	        if (this.orderBy.length !== other.orderBy.length) {
	            return false;
	        }
	        for (var i = 0; i < this.orderBy.length; i++) {
	            if (!this$1.orderBy[i].isEqual(other.orderBy[i])) {
	                return false;
	            }
	        }
	        if (this.filters.length !== other.filters.length) {
	            return false;
	        }
	        for (var i = 0; i < this.filters.length; i++) {
	            if (!this$1.filters[i].isEqual(other.filters[i])) {
	                return false;
	            }
	        }
	        if (!this.path.isEqual(other.path)) {
	            return false;
	        }
	        if (this.startAt !== null
	            ? !this.startAt.isEqual(other.startAt)
	            : other.startAt !== null) {
	            return false;
	        }
	        return this.endAt !== null
	            ? this.endAt.isEqual(other.endAt)
	            : other.endAt === null;
	    };
	    Query.prototype.docComparator = function (d1, d2) {
	        var comparedOnKeyField = false;
	        for (var _i = 0, _a = this.orderBy; _i < _a.length; _i++) {
	            var orderBy = _a[_i];
	            var comp = orderBy.compare(d1, d2);
	            if (comp !== 0)
	                { return comp; }
	            comparedOnKeyField = comparedOnKeyField || orderBy.field.isKeyField();
	        }
	        // Assert that we actually compared by key
	        assert$1(comparedOnKeyField, "orderBy used that doesn't compare on key field");
	        return 0;
	    };
	    Query.prototype.matches = function (doc) {
	        return (this.matchesAncestor(doc) &&
	            this.matchesOrderBy(doc) &&
	            this.matchesFilters(doc) &&
	            this.matchesBounds(doc));
	    };
	    Query.prototype.hasLimit = function () {
	        return !isNullOrUndefined(this.limit);
	    };
	    Query.prototype.getFirstOrderByField = function () {
	        return this.explicitOrderBy.length > 0
	            ? this.explicitOrderBy[0].field
	            : null;
	    };
	    Query.prototype.getInequalityFilterField = function () {
	        for (var _i = 0, _a = this.filters; _i < _a.length; _i++) {
	            var filter = _a[_i];
	            if (filter instanceof RelationFilter && filter.isInequality()) {
	                return filter.field;
	            }
	        }
	        return null;
	    };
	    Query.prototype.hasArrayContainsFilter = function () {
	        return (this.filters.find(function (filter) {
	            return filter instanceof RelationFilter &&
	                filter.op === RelationOp.ARRAY_CONTAINS;
	        }) !== undefined);
	    };
	    Query.prototype.isDocumentQuery = function () {
	        return DocumentKey.isDocumentKey(this.path) && this.filters.length === 0;
	    };
	    Query.prototype.matchesAncestor = function (doc) {
	        var docPath = doc.key.path;
	        if (DocumentKey.isDocumentKey(this.path)) {
	            // exact match for document queries
	            return this.path.isEqual(docPath);
	        }
	        else {
	            // shallow ancestor queries by default
	            return (this.path.isPrefixOf(docPath) && this.path.length === docPath.length - 1);
	        }
	    };
	    /**
	     * A document must have a value for every ordering clause in order to show up
	     * in the results.
	     */
	    Query.prototype.matchesOrderBy = function (doc) {
	        for (var _i = 0, _a = this.explicitOrderBy; _i < _a.length; _i++) {
	            var orderBy = _a[_i];
	            // order by key always matches
	            if (!orderBy.field.isKeyField() &&
	                doc.field(orderBy.field) === undefined) {
	                return false;
	            }
	        }
	        return true;
	    };
	    Query.prototype.matchesFilters = function (doc) {
	        for (var _i = 0, _a = this.filters; _i < _a.length; _i++) {
	            var filter = _a[_i];
	            if (!filter.matches(doc)) {
	                return false;
	            }
	        }
	        return true;
	    };
	    /**
	     * Makes sure a document is within the bounds, if provided.
	     */
	    Query.prototype.matchesBounds = function (doc) {
	        if (this.startAt && !this.startAt.sortsBeforeDocument(this.orderBy, doc)) {
	            return false;
	        }
	        if (this.endAt && this.endAt.sortsBeforeDocument(this.orderBy, doc)) {
	            return false;
	        }
	        return true;
	    };
	    Query.prototype.assertValidBound = function (bound) {
	        assert$1(bound.position.length <= this.orderBy.length, 'Bound is longer than orderBy');
	    };
	    return Query;
	}());
	var Filter = /** @class */ (function () {
	    function Filter() {
	    }
	    /**
	     * Creates a filter based on the provided arguments.
	     */
	    Filter.create = function (field, op, value) {
	        if (value.isEqual(NullValue.INSTANCE)) {
	            if (op !== RelationOp.EQUAL) {
	                throw new FirestoreError(Code.INVALID_ARGUMENT, 'Invalid query. You can only perform equals comparisons on null.');
	            }
	            return new NullFilter(field);
	        }
	        else if (value.isEqual(DoubleValue.NAN)) {
	            if (op !== RelationOp.EQUAL) {
	                throw new FirestoreError(Code.INVALID_ARGUMENT, 'Invalid query. You can only perform equals comparisons on NaN.');
	            }
	            return new NanFilter(field);
	        }
	        else {
	            return new RelationFilter(field, op, value);
	        }
	    };
	    return Filter;
	}());
	var RelationOp = /** @class */ (function () {
	    function RelationOp(name) {
	        this.name = name;
	    }
	    RelationOp.fromString = function (op) {
	        switch (op) {
	            case '<':
	                return RelationOp.LESS_THAN;
	            case '<=':
	                return RelationOp.LESS_THAN_OR_EQUAL;
	            case '==':
	                return RelationOp.EQUAL;
	            case '>=':
	                return RelationOp.GREATER_THAN_OR_EQUAL;
	            case '>':
	                return RelationOp.GREATER_THAN;
	            case 'array-contains':
	                return RelationOp.ARRAY_CONTAINS;
	            default:
	                return fail('Unknown relation: ' + op);
	        }
	    };
	    RelationOp.prototype.toString = function () {
	        return this.name;
	    };
	    RelationOp.prototype.isEqual = function (other) {
	        return this.name === other.name;
	    };
	    RelationOp.LESS_THAN = new RelationOp('<');
	    RelationOp.LESS_THAN_OR_EQUAL = new RelationOp('<=');
	    RelationOp.EQUAL = new RelationOp('==');
	    RelationOp.GREATER_THAN = new RelationOp('>');
	    RelationOp.GREATER_THAN_OR_EQUAL = new RelationOp('>=');
	    RelationOp.ARRAY_CONTAINS = new RelationOp('array-contains');
	    return RelationOp;
	}());
	var RelationFilter = /** @class */ (function (_super) {
	    __extends(RelationFilter, _super);
	    function RelationFilter(field, op, value) {
	        var _this = _super.call(this) || this;
	        _this.field = field;
	        _this.op = op;
	        _this.value = value;
	        return _this;
	    }
	    RelationFilter.prototype.matches = function (doc) {
	        if (this.field.isKeyField()) {
	            assert$1(this.value instanceof RefValue, 'Comparing on key, but filter value not a RefValue');
	            assert$1(this.op !== RelationOp.ARRAY_CONTAINS, "array-contains queries don't make sense on document keys.");
	            var refValue = this.value;
	            var comparison = DocumentKey.comparator(doc.key, refValue.key);
	            return this.matchesComparison(comparison);
	        }
	        else {
	            var val = doc.field(this.field);
	            return val !== undefined && this.matchesValue(val);
	        }
	    };
	    RelationFilter.prototype.matchesValue = function (value) {
	        var _this = this;
	        if (this.op === RelationOp.ARRAY_CONTAINS) {
	            return (value instanceof ArrayValue &&
	                value.internalValue.find(function (element) { return element.isEqual(_this.value); }) !==
	                    undefined);
	        }
	        else {
	            // Only compare types with matching backend order (such as double and int).
	            return (this.value.typeOrder === value.typeOrder &&
	                this.matchesComparison(value.compareTo(this.value)));
	        }
	    };
	    RelationFilter.prototype.matchesComparison = function (comparison) {
	        switch (this.op) {
	            case RelationOp.LESS_THAN:
	                return comparison < 0;
	            case RelationOp.LESS_THAN_OR_EQUAL:
	                return comparison <= 0;
	            case RelationOp.EQUAL:
	                return comparison === 0;
	            case RelationOp.GREATER_THAN:
	                return comparison > 0;
	            case RelationOp.GREATER_THAN_OR_EQUAL:
	                return comparison >= 0;
	            default:
	                return fail('Unknown relation op' + this.op);
	        }
	    };
	    RelationFilter.prototype.isInequality = function () {
	        return (this.op !== RelationOp.EQUAL && this.op !== RelationOp.ARRAY_CONTAINS);
	    };
	    RelationFilter.prototype.canonicalId = function () {
	        // TODO(b/29183165): Technically, this won't be unique if two values have
	        // the same description, such as the int 3 and the string "3". So we should
	        // add the types in here somehow, too.
	        return (this.field.canonicalString() + this.op.toString() + this.value.toString());
	    };
	    RelationFilter.prototype.isEqual = function (other) {
	        if (other instanceof RelationFilter) {
	            return (this.op.isEqual(other.op) &&
	                this.field.isEqual(other.field) &&
	                this.value.isEqual(other.value));
	        }
	        else {
	            return false;
	        }
	    };
	    RelationFilter.prototype.toString = function () {
	        return this.field.canonicalString() + " " + this.op + " " + this.value.value();
	    };
	    return RelationFilter;
	}(Filter));
	/**
	 * Filter that matches 'null' values.
	 */
	var NullFilter = /** @class */ (function (_super) {
	    __extends(NullFilter, _super);
	    function NullFilter(field) {
	        var _this = _super.call(this) || this;
	        _this.field = field;
	        return _this;
	    }
	    NullFilter.prototype.matches = function (doc) {
	        var val = doc.field(this.field);
	        return val !== undefined && val.value() === null;
	    };
	    NullFilter.prototype.canonicalId = function () {
	        return this.field.canonicalString() + ' IS null';
	    };
	    NullFilter.prototype.toString = function () {
	        return this.field.canonicalString() + " IS null";
	    };
	    NullFilter.prototype.isEqual = function (other) {
	        if (other instanceof NullFilter) {
	            return this.field.isEqual(other.field);
	        }
	        else {
	            return false;
	        }
	    };
	    return NullFilter;
	}(Filter));
	/**
	 * Filter that matches 'NaN' values.
	 */
	var NanFilter = /** @class */ (function (_super) {
	    __extends(NanFilter, _super);
	    function NanFilter(field) {
	        var _this = _super.call(this) || this;
	        _this.field = field;
	        return _this;
	    }
	    NanFilter.prototype.matches = function (doc) {
	        var val = doc.field(this.field).value();
	        return typeof val === 'number' && isNaN(val);
	    };
	    NanFilter.prototype.canonicalId = function () {
	        return this.field.canonicalString() + ' IS NaN';
	    };
	    NanFilter.prototype.toString = function () {
	        return this.field.canonicalString() + " IS NaN";
	    };
	    NanFilter.prototype.isEqual = function (other) {
	        if (other instanceof NanFilter) {
	            return this.field.isEqual(other.field);
	        }
	        else {
	            return false;
	        }
	    };
	    return NanFilter;
	}(Filter));
	/**
	 * The direction of sorting in an order by.
	 */
	var Direction = /** @class */ (function () {
	    function Direction(name) {
	        this.name = name;
	    }
	    Direction.prototype.toString = function () {
	        return this.name;
	    };
	    Direction.ASCENDING = new Direction('asc');
	    Direction.DESCENDING = new Direction('desc');
	    return Direction;
	}());
	/**
	 * Represents a bound of a query.
	 *
	 * The bound is specified with the given components representing a position and
	 * whether it's just before or just after the position (relative to whatever the
	 * query order is).
	 *
	 * The position represents a logical index position for a query. It's a prefix
	 * of values for the (potentially implicit) order by clauses of a query.
	 *
	 * Bound provides a function to determine whether a document comes before or
	 * after a bound. This is influenced by whether the position is just before or
	 * just after the provided values.
	 */
	var Bound = /** @class */ (function () {
	    function Bound(position, before) {
	        this.position = position;
	        this.before = before;
	    }
	    Bound.prototype.canonicalId = function () {
	        // TODO(b/29183165): Make this collision robust.
	        var canonicalId = this.before ? 'b:' : 'a:';
	        for (var _i = 0, _a = this.position; _i < _a.length; _i++) {
	            var component = _a[_i];
	            canonicalId += component.toString();
	        }
	        return canonicalId;
	    };
	    /**
	     * Returns true if a document sorts before a bound using the provided sort
	     * order.
	     */
	    Bound.prototype.sortsBeforeDocument = function (orderBy, doc) {
	        var this$1 = this;

	        assert$1(this.position.length <= orderBy.length, "Bound has more components than query's orderBy");
	        var comparison = 0;
	        for (var i = 0; i < this.position.length; i++) {
	            var orderByComponent = orderBy[i];
	            var component = this$1.position[i];
	            if (orderByComponent.field.isKeyField()) {
	                assert$1(component instanceof RefValue, 'Bound has a non-key value where the key path is being used.');
	                comparison = DocumentKey.comparator(component.key, doc.key);
	            }
	            else {
	                var docValue = doc.field(orderByComponent.field);
	                assert$1(docValue !== undefined, 'Field should exist since document matched the orderBy already.');
	                comparison = component.compareTo(docValue);
	            }
	            if (orderByComponent.dir === Direction.DESCENDING) {
	                comparison = comparison * -1;
	            }
	            if (comparison !== 0) {
	                break;
	            }
	        }
	        return this.before ? comparison <= 0 : comparison < 0;
	    };
	    Bound.prototype.isEqual = function (other) {
	        var this$1 = this;

	        if (other === null) {
	            return false;
	        }
	        if (this.before !== other.before ||
	            this.position.length !== other.position.length) {
	            return false;
	        }
	        for (var i = 0; i < this.position.length; i++) {
	            var thisPosition = this$1.position[i];
	            var otherPosition = other.position[i];
	            return thisPosition.isEqual(otherPosition);
	        }
	        return true;
	    };
	    return Bound;
	}());
	/**
	 * An ordering on a field, in some Direction. Direction defaults to ASCENDING.
	 */
	var OrderBy = /** @class */ (function () {
	    function OrderBy(field, dir) {
	        this.field = field;
	        if (dir === undefined) {
	            dir = Direction.ASCENDING;
	        }
	        this.dir = dir;
	        this.isKeyOrderBy = field.isKeyField();
	    }
	    OrderBy.prototype.compare = function (d1, d2) {
	        var comparison = this.isKeyOrderBy
	            ? Document.compareByKey(d1, d2)
	            : Document.compareByField(this.field, d1, d2);
	        switch (this.dir) {
	            case Direction.ASCENDING:
	                return comparison;
	            case Direction.DESCENDING:
	                return -1 * comparison;
	            default:
	                return fail('Unknown direction: ' + this.dir);
	        }
	    };
	    OrderBy.prototype.canonicalId = function () {
	        // TODO(b/29183165): Make this collision robust.
	        return this.field.canonicalString() + this.dir.toString();
	    };
	    OrderBy.prototype.toString = function () {
	        return this.field.canonicalString() + " (" + this.dir + ")";
	    };
	    OrderBy.prototype.isEqual = function (other) {
	        return this.dir === other.dir && this.field.isEqual(other.field);
	    };
	    return OrderBy;
	}());
	var KEY_ORDERING_ASC = new OrderBy(FieldPath.keyField(), Direction.ASCENDING);
	var KEY_ORDERING_DESC = new OrderBy(FieldPath.keyField(), Direction.DESCENDING);

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * A version of a document in Firestore. This corresponds to the version
	 * timestamp, such as update_time or read_time.
	 */
	var SnapshotVersion = /** @class */ (function () {
	    function SnapshotVersion(timestamp) {
	        this.timestamp = timestamp;
	    }
	    // TODO(b/34176344): Once we no longer need to use the old alpha protos,
	    // delete this constructor and use a timestamp-backed version everywhere.
	    SnapshotVersion.fromMicroseconds = function (value) {
	        var seconds = Math.floor(value / 1e6);
	        var nanos = (value % 1e6) * 1e3;
	        return new SnapshotVersion(new Timestamp(seconds, nanos));
	    };
	    SnapshotVersion.fromTimestamp = function (value) {
	        return new SnapshotVersion(value);
	    };
	    SnapshotVersion.forDeletedDoc = function () {
	        return SnapshotVersion.MIN;
	    };
	    SnapshotVersion.prototype.compareTo = function (other) {
	        return this.timestamp._compareTo(other.timestamp);
	    };
	    SnapshotVersion.prototype.isEqual = function (other) {
	        return this.timestamp.isEqual(other.timestamp);
	    };
	    /** Returns a number representation of the version for use in spec tests. */
	    SnapshotVersion.prototype.toMicroseconds = function () {
	        // Convert to microseconds.
	        return this.timestamp.seconds * 1e6 + this.timestamp.nanoseconds / 1000;
	    };
	    SnapshotVersion.prototype.toString = function () {
	        return 'SnapshotVersion(' + this.timestamp.toString() + ')';
	    };
	    SnapshotVersion.prototype.toTimestamp = function () {
	        return this.timestamp;
	    };
	    SnapshotVersion.MIN = new SnapshotVersion(new Timestamp(0, 0));
	    return SnapshotVersion;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/** An enumeration of the different purposes we have for queries. */
	var QueryPurpose;
	(function (QueryPurpose) {
	    /** A regular, normal query. */
	    QueryPurpose[QueryPurpose["Listen"] = 0] = "Listen";
	    /**
	     * The query was used to refill a query after an existence filter mismatch.
	     */
	    QueryPurpose[QueryPurpose["ExistenceFilterMismatch"] = 1] = "ExistenceFilterMismatch";
	    /** The query was used to resolve a limbo document. */
	    QueryPurpose[QueryPurpose["LimboResolution"] = 2] = "LimboResolution";
	})(QueryPurpose || (QueryPurpose = {}));
	/**
	 * An immutable set of metadata that the local store tracks for each query.
	 */
	var QueryData = /** @class */ (function () {
	    function QueryData(
	    /** The query being listened to. */
	    query, 
	    /**
	     * The target ID to which the query corresponds; Assigned by the
	     * LocalStore for user listens and by the SyncEngine for limbo watches.
	     */
	    targetId, 
	    /** The purpose of the query. */
	    purpose, 
	    /** The latest snapshot version seen for this target. */
	    snapshotVersion, 
	    /**
	     * An opaque, server-assigned token that allows watching a query to be
	     * resumed after disconnecting without retransmitting all the data that
	     * matches the query. The resume token essentially identifies a point in
	     * time from which the server should resume sending results.
	     */
	    resumeToken) {
	        if (snapshotVersion === void 0) { snapshotVersion = SnapshotVersion.MIN; }
	        if (resumeToken === void 0) { resumeToken = emptyByteString(); }
	        this.query = query;
	        this.targetId = targetId;
	        this.purpose = purpose;
	        this.snapshotVersion = snapshotVersion;
	        this.resumeToken = resumeToken;
	    }
	    /**
	     * Creates a new query data instance with an updated snapshot version and
	     * resume token.
	     */
	    QueryData.prototype.update = function (updated) {
	        return new QueryData(this.query, this.targetId, this.purpose, updated.snapshotVersion, updated.resumeToken);
	    };
	    QueryData.prototype.isEqual = function (other) {
	        return (this.targetId === other.targetId &&
	            this.purpose === other.purpose &&
	            this.snapshotVersion.isEqual(other.snapshotVersion) &&
	            this.resumeToken === other.resumeToken &&
	            this.query.isEqual(other.query));
	    };
	    return QueryData;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Provides a set of fields that can be used to partially patch a document.
	 * FieldMask is used in conjunction with ObjectValue.
	 * Examples:
	 *   foo - Overwrites foo entirely with the provided value. If foo is not
	 *         present in the companion ObjectValue, the field is deleted.
	 *   foo.bar - Overwrites only the field bar of the object foo.
	 *             If foo is not an object, foo is replaced with an object
	 *             containing foo
	 */
	var FieldMask = /** @class */ (function () {
	    function FieldMask(fields) {
	        this.fields = fields;
	        // TODO(dimond): validation of FieldMask
	    }
	    /**
	     * Verifies that `fieldPath` is included by at least one field in this field
	     * mask.
	     *
	     * This is an O(n) operation, where `n` is the size of the field mask.
	     */
	    FieldMask.prototype.covers = function (fieldPath) {
	        for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
	            var fieldMaskPath = _a[_i];
	            if (fieldMaskPath.isPrefixOf(fieldPath)) {
	                return true;
	            }
	        }
	        return false;
	    };
	    FieldMask.prototype.isEqual = function (other) {
	        return arrayEquals(this.fields, other.fields);
	    };
	    return FieldMask;
	}());
	/** A field path and the TransformOperation to perform upon it. */
	var FieldTransform = /** @class */ (function () {
	    function FieldTransform(field, transform) {
	        this.field = field;
	        this.transform = transform;
	    }
	    FieldTransform.prototype.isEqual = function (other) {
	        return (this.field.isEqual(other.field) && this.transform.isEqual(other.transform));
	    };
	    return FieldTransform;
	}());
	/** The result of successfully applying a mutation to the backend. */
	var MutationResult = /** @class */ (function () {
	    function MutationResult(
	    /**
	     * The version at which the mutation was committed or null for a delete.
	     */
	    version, 
	    /**
	     * The resulting fields returned from the backend after a
	     * TransformMutation has been committed. Contains one FieldValue for each
	     * FieldTransform that was in the mutation.
	     *
	     * Will be null if the mutation was not a TransformMutation.
	     */
	    transformResults) {
	        this.version = version;
	        this.transformResults = transformResults;
	    }
	    return MutationResult;
	}());
	var MutationType;
	(function (MutationType) {
	    MutationType[MutationType["Set"] = 0] = "Set";
	    MutationType[MutationType["Patch"] = 1] = "Patch";
	    MutationType[MutationType["Transform"] = 2] = "Transform";
	    MutationType[MutationType["Delete"] = 3] = "Delete";
	})(MutationType || (MutationType = {}));
	/**
	 * Encodes a precondition for a mutation. This follows the model that the
	 * backend accepts with the special case of an explicit "empty" precondition
	 * (meaning no precondition).
	 */
	var Precondition = /** @class */ (function () {
	    function Precondition(updateTime, exists) {
	        this.updateTime = updateTime;
	        this.exists = exists;
	        assert$1(updateTime === undefined || exists === undefined, 'Precondition can specify "exists" or "updateTime" but not both');
	    }
	    /** Creates a new Precondition with an exists flag. */
	    Precondition.exists = function (exists) {
	        return new Precondition(undefined, exists);
	    };
	    /** Creates a new Precondition based on a version a document exists at. */
	    Precondition.updateTime = function (version) {
	        return new Precondition(version);
	    };
	    Object.defineProperty(Precondition.prototype, "isNone", {
	        /** Returns whether this Precondition is empty. */
	        get: function () {
	            return this.updateTime === undefined && this.exists === undefined;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Returns true if the preconditions is valid for the given document
	     * (or null if no document is available).
	     */
	    Precondition.prototype.isValidFor = function (maybeDoc) {
	        if (this.updateTime !== undefined) {
	            return (maybeDoc instanceof Document &&
	                maybeDoc.version.isEqual(this.updateTime));
	        }
	        else if (this.exists !== undefined) {
	            if (this.exists) {
	                return maybeDoc instanceof Document;
	            }
	            else {
	                return maybeDoc === null || maybeDoc instanceof NoDocument;
	            }
	        }
	        else {
	            assert$1(this.isNone, 'Precondition should be empty');
	            return true;
	        }
	    };
	    Precondition.prototype.isEqual = function (other) {
	        return (equals(this.updateTime, other.updateTime) &&
	            this.exists === other.exists);
	    };
	    Precondition.NONE = new Precondition();
	    return Precondition;
	}());
	/**
	 * A mutation describes a self-contained change to a document. Mutations can
	 * create, replace, delete, and update subsets of documents.
	 *
	 * Mutations not only act on the value of the document but also it version.
	 * In the case of Set, Patch, and Transform mutations we preserve the existing
	 * version. In the case of Delete mutations, we reset the version to 0.
	 *
	 * Here's the expected transition table.
	 *
	 * MUTATION           APPLIED TO            RESULTS IN
	 *
	 * SetMutation        Document(v3)          Document(v3)
	 * SetMutation        NoDocument(v3)        Document(v0)
	 * SetMutation        null                  Document(v0)
	 * PatchMutation      Document(v3)          Document(v3)
	 * PatchMutation      NoDocument(v3)        NoDocument(v3)
	 * PatchMutation      null                  null
	 * TransformMutation  Document(v3)          Document(v3)
	 * TransformMutation  NoDocument(v3)        NoDocument(v3)
	 * TransformMutation  null                  null
	 * DeleteMutation     Document(v3)          NoDocument(v0)
	 * DeleteMutation     NoDocument(v3)        NoDocument(v0)
	 * DeleteMutation     null                  NoDocument(v0)
	 *
	 * Note that TransformMutations don't create Documents (in the case of being
	 * applied to a NoDocument), even though they would on the backend. This is
	 * because the client always combines the TransformMutation with a SetMutation
	 * or PatchMutation and we only want to apply the transform if the prior
	 * mutation resulted in a Document (always true for a SetMutation, but not
	 * necessarily for a PatchMutation).
	 *
	 * ## Subclassing Notes
	 *
	 * Subclasses of Mutation need to implement applyToRemoteDocument() and
	 * applyToLocalView() to implement the actual behavior of applying the mutation
	 * to some source document.
	 */
	var Mutation = /** @class */ (function () {
	    function Mutation() {
	    }
	    Mutation.prototype.verifyKeyMatches = function (maybeDoc) {
	        if (maybeDoc != null) {
	            assert$1(maybeDoc.key.isEqual(this.key), 'Can only apply a mutation to a document with the same key');
	        }
	    };
	    /**
	     * Returns the version from the given document for use as the result of a
	     * mutation. Mutations are defined to return the version of the base document
	     * only if it is an existing document. Deleted and unknown documents have a
	     * post-mutation version of SnapshotVersion.MIN.
	     */
	    Mutation.getPostMutationVersion = function (maybeDoc) {
	        if (maybeDoc instanceof Document) {
	            return maybeDoc.version;
	        }
	        else {
	            return SnapshotVersion.MIN;
	        }
	    };
	    return Mutation;
	}());
	/**
	 * A mutation that creates or replaces the document at the given key with the
	 * object value contents.
	 */
	var SetMutation = /** @class */ (function (_super) {
	    __extends(SetMutation, _super);
	    function SetMutation(key, value, precondition) {
	        var _this = _super.call(this) || this;
	        _this.key = key;
	        _this.value = value;
	        _this.precondition = precondition;
	        _this.type = MutationType.Set;
	        return _this;
	    }
	    SetMutation.prototype.applyToRemoteDocument = function (maybeDoc, mutationResult) {
	        this.verifyKeyMatches(maybeDoc);
	        assert$1(mutationResult.transformResults == null, 'Transform results received by SetMutation.');
	        // Unlike applyToLocalView, if we're applying a mutation to a remote
	        // document the server has accepted the mutation so the precondition must
	        // have held.
	        var version = Mutation.getPostMutationVersion(maybeDoc);
	        return new Document(this.key, version, this.value, {
	            hasLocalMutations: false
	        });
	    };
	    SetMutation.prototype.applyToLocalView = function (maybeDoc, baseDoc, localWriteTime) {
	        this.verifyKeyMatches(maybeDoc);
	        if (!this.precondition.isValidFor(maybeDoc)) {
	            return maybeDoc;
	        }
	        var version = Mutation.getPostMutationVersion(maybeDoc);
	        return new Document(this.key, version, this.value, {
	            hasLocalMutations: true
	        });
	    };
	    SetMutation.prototype.isEqual = function (other) {
	        return (other instanceof SetMutation &&
	            this.key.isEqual(other.key) &&
	            this.value.isEqual(other.value) &&
	            this.precondition.isEqual(other.precondition));
	    };
	    return SetMutation;
	}(Mutation));
	/**
	 * A mutation that modifies fields of the document at the given key with the
	 * given values. The values are applied through a field mask:
	 *
	 *  * When a field is in both the mask and the values, the corresponding field
	 *    is updated.
	 *  * When a field is in neither the mask nor the values, the corresponding
	 *    field is unmodified.
	 *  * When a field is in the mask but not in the values, the corresponding field
	 *    is deleted.
	 *  * When a field is not in the mask but is in the values, the values map is
	 *    ignored.
	 */
	var PatchMutation = /** @class */ (function (_super) {
	    __extends(PatchMutation, _super);
	    function PatchMutation(key, data, fieldMask, precondition) {
	        var _this = _super.call(this) || this;
	        _this.key = key;
	        _this.data = data;
	        _this.fieldMask = fieldMask;
	        _this.precondition = precondition;
	        _this.type = MutationType.Patch;
	        return _this;
	    }
	    PatchMutation.prototype.applyToRemoteDocument = function (maybeDoc, mutationResult) {
	        this.verifyKeyMatches(maybeDoc);
	        assert$1(mutationResult.transformResults == null, 'Transform results received by PatchMutation.');
	        // TODO(mcg): Relax enforcement of this precondition
	        //
	        // We shouldn't actually enforce the precondition since it already passed on
	        // the backend, but we may not have a local version of the document to
	        // patch, so we use the precondition to prevent incorrectly putting a
	        // partial document into our cache.
	        if (!this.precondition.isValidFor(maybeDoc)) {
	            return maybeDoc;
	        }
	        var version = Mutation.getPostMutationVersion(maybeDoc);
	        var newData = this.patchDocument(maybeDoc);
	        return new Document(this.key, version, newData, {
	            hasLocalMutations: false
	        });
	    };
	    PatchMutation.prototype.applyToLocalView = function (maybeDoc, baseDoc, localWriteTime) {
	        this.verifyKeyMatches(maybeDoc);
	        if (!this.precondition.isValidFor(maybeDoc)) {
	            return maybeDoc;
	        }
	        var version = Mutation.getPostMutationVersion(maybeDoc);
	        var newData = this.patchDocument(maybeDoc);
	        return new Document(this.key, version, newData, {
	            hasLocalMutations: true
	        });
	    };
	    PatchMutation.prototype.isEqual = function (other) {
	        return (other instanceof PatchMutation &&
	            this.key.isEqual(other.key) &&
	            this.fieldMask.isEqual(other.fieldMask) &&
	            this.precondition.isEqual(other.precondition));
	    };
	    /**
	     * Patches the data of document if available or creates a new document. Note
	     * that this does not check whether or not the precondition of this patch
	     * holds.
	     */
	    PatchMutation.prototype.patchDocument = function (maybeDoc) {
	        var data;
	        if (maybeDoc instanceof Document) {
	            data = maybeDoc.data;
	        }
	        else {
	            data = ObjectValue.EMPTY;
	        }
	        return this.patchObject(data);
	    };
	    PatchMutation.prototype.patchObject = function (data) {
	        var this$1 = this;

	        for (var _i = 0, _a = this.fieldMask.fields; _i < _a.length; _i++) {
	            var fieldPath = _a[_i];
	            var newValue = this$1.data.field(fieldPath);
	            if (newValue !== undefined) {
	                data = data.set(fieldPath, newValue);
	            }
	            else {
	                data = data.delete(fieldPath);
	            }
	        }
	        return data;
	    };
	    return PatchMutation;
	}(Mutation));
	/**
	 * A mutation that modifies specific fields of the document with transform
	 * operations. Currently the only supported transform is a server timestamp, but
	 * IP Address, increment(n), etc. could be supported in the future.
	 *
	 * It is somewhat similar to a PatchMutation in that it patches specific fields
	 * and has no effect when applied to a null or NoDocument (see comment on
	 * Mutation for rationale).
	 */
	var TransformMutation = /** @class */ (function (_super) {
	    __extends(TransformMutation, _super);
	    function TransformMutation(key, fieldTransforms) {
	        var _this = _super.call(this) || this;
	        _this.key = key;
	        _this.fieldTransforms = fieldTransforms;
	        _this.type = MutationType.Transform;
	        // NOTE: We set a precondition of exists: true as a safety-check, since we
	        // always combine TransformMutations with a SetMutation or PatchMutation which
	        // (if successful) should end up with an existing document.
	        _this.precondition = Precondition.exists(true);
	        return _this;
	    }
	    TransformMutation.prototype.applyToRemoteDocument = function (maybeDoc, mutationResult) {
	        this.verifyKeyMatches(maybeDoc);
	        assert$1(mutationResult.transformResults != null, 'Transform results missing for TransformMutation.');
	        // TODO(mcg): Relax enforcement of this precondition
	        //
	        // We shouldn't actually enforce the precondition since it already passed on
	        // the backend, but we may not have a local version of the document to
	        // patch, so we use the precondition to prevent incorrectly putting a
	        // partial document into our cache.
	        if (!this.precondition.isValidFor(maybeDoc)) {
	            return maybeDoc;
	        }
	        var doc = this.requireDocument(maybeDoc);
	        var transformResults = this.serverTransformResults(maybeDoc, mutationResult.transformResults);
	        var newData = this.transformObject(doc.data, transformResults);
	        return new Document(this.key, doc.version, newData, {
	            hasLocalMutations: false
	        });
	    };
	    TransformMutation.prototype.applyToLocalView = function (maybeDoc, baseDoc, localWriteTime) {
	        this.verifyKeyMatches(maybeDoc);
	        if (!this.precondition.isValidFor(maybeDoc)) {
	            return maybeDoc;
	        }
	        var doc = this.requireDocument(maybeDoc);
	        var transformResults = this.localTransformResults(localWriteTime, baseDoc);
	        var newData = this.transformObject(doc.data, transformResults);
	        return new Document(this.key, doc.version, newData, {
	            hasLocalMutations: true
	        });
	    };
	    TransformMutation.prototype.isEqual = function (other) {
	        return (other instanceof TransformMutation &&
	            this.key.isEqual(other.key) &&
	            arrayEquals(this.fieldTransforms, other.fieldTransforms) &&
	            this.precondition.isEqual(other.precondition));
	    };
	    /**
	     * Asserts that the given MaybeDocument is actually a Document and verifies
	     * that it matches the key for this mutation. Since we only support
	     * transformations with precondition exists this method is guaranteed to be
	     * safe.
	     */
	    TransformMutation.prototype.requireDocument = function (maybeDoc) {
	        assert$1(maybeDoc instanceof Document, 'Unknown MaybeDocument type ' + maybeDoc);
	        var doc = maybeDoc;
	        assert$1(doc.key.isEqual(this.key), 'Can only transform a document with the same key');
	        return doc;
	    };
	    /**
	     * Creates a list of "transform results" (a transform result is a field value
	     * representing the result of applying a transform) for use after a
	     * TransformMutation has been acknowledged by the server.
	     *
	     * @param baseDoc The document prior to applying this mutation batch.
	     * @param serverTransformResults The transform results received by the server.
	     * @return The transform results list.
	     */
	    TransformMutation.prototype.serverTransformResults = function (baseDoc, serverTransformResults) {
	        var this$1 = this;

	        var transformResults = [];
	        assert$1(this.fieldTransforms.length === serverTransformResults.length, "server transform result count (" + serverTransformResults.length + ") " +
	            ("should match field transform count (" + this.fieldTransforms.length + ")"));
	        for (var i = 0; i < serverTransformResults.length; i++) {
	            var fieldTransform = this$1.fieldTransforms[i];
	            var transform = fieldTransform.transform;
	            var previousValue = null;
	            if (baseDoc instanceof Document) {
	                previousValue = baseDoc.field(fieldTransform.field) || null;
	            }
	            transformResults.push(transform.applyToRemoteDocument(previousValue, serverTransformResults[i]));
	        }
	        return transformResults;
	    };
	    /**
	     * Creates a list of "transform results" (a transform result is a field value
	     * representing the result of applying a transform) for use when applying a
	     * TransformMutation locally.
	     *
	     * @param localWriteTime The local time of the transform mutation (used to
	     *     generate ServerTimestampValues).
	     * @param baseDoc The document prior to applying this mutation batch.
	     * @return The transform results list.
	     */
	    TransformMutation.prototype.localTransformResults = function (localWriteTime, baseDoc) {
	        var transformResults = [];
	        for (var _i = 0, _a = this.fieldTransforms; _i < _a.length; _i++) {
	            var fieldTransform = _a[_i];
	            var transform = fieldTransform.transform;
	            var previousValue = null;
	            if (baseDoc instanceof Document) {
	                previousValue = baseDoc.field(fieldTransform.field) || null;
	            }
	            transformResults.push(transform.applyToLocalView(previousValue, localWriteTime));
	        }
	        return transformResults;
	    };
	    TransformMutation.prototype.transformObject = function (data, transformResults) {
	        var this$1 = this;

	        assert$1(transformResults.length === this.fieldTransforms.length, 'TransformResults length mismatch.');
	        for (var i = 0; i < this.fieldTransforms.length; i++) {
	            var fieldTransform = this$1.fieldTransforms[i];
	            var fieldPath = fieldTransform.field;
	            data = data.set(fieldPath, transformResults[i]);
	        }
	        return data;
	    };
	    return TransformMutation;
	}(Mutation));
	/** A mutation that deletes the document at the given key. */
	var DeleteMutation = /** @class */ (function (_super) {
	    __extends(DeleteMutation, _super);
	    function DeleteMutation(key, precondition) {
	        var _this = _super.call(this) || this;
	        _this.key = key;
	        _this.precondition = precondition;
	        _this.type = MutationType.Delete;
	        return _this;
	    }
	    DeleteMutation.prototype.applyToRemoteDocument = function (maybeDoc, mutationResult) {
	        this.verifyKeyMatches(maybeDoc);
	        assert$1(mutationResult.transformResults == null, 'Transform results received by DeleteMutation.');
	        // Unlike applyToLocalView, if we're applying a mutation to a remote
	        // document the server has accepted the mutation so the precondition must
	        // have held.
	        return new NoDocument(this.key, SnapshotVersion.MIN);
	    };
	    DeleteMutation.prototype.applyToLocalView = function (maybeDoc, baseDoc, localWriteTime) {
	        this.verifyKeyMatches(maybeDoc);
	        if (!this.precondition.isValidFor(maybeDoc)) {
	            return maybeDoc;
	        }
	        if (maybeDoc) {
	            assert$1(maybeDoc.key.isEqual(this.key), 'Can only apply mutation to document with same key');
	        }
	        return new NoDocument(this.key, SnapshotVersion.forDeletedDoc());
	    };
	    DeleteMutation.prototype.isEqual = function (other) {
	        return (other instanceof DeleteMutation &&
	            this.key.isEqual(other.key) &&
	            this.precondition.isEqual(other.precondition));
	    };
	    return DeleteMutation;
	}(Mutation));

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var ExistenceFilter = /** @class */ (function () {
	    // TODO(b/33078163): just use simplest form of existence filter for now
	    function ExistenceFilter(count) {
	        this.count = count;
	    }
	    ExistenceFilter.prototype.isEqual = function (other) {
	        return other && other.count === this.count;
	    };
	    return ExistenceFilter;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Error Codes describing the different ways GRPC can fail. These are copied
	 * directly from GRPC's sources here:
	 *
	 * https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
	 *
	 * Important! The names of these identifiers matter because the string forms
	 * are used for reverse lookups from the webchannel stream. Do NOT change the
	 * names of these identifiers.
	 */
	var RpcCode;
	(function (RpcCode) {
	    RpcCode[RpcCode["OK"] = 0] = "OK";
	    RpcCode[RpcCode["CANCELLED"] = 1] = "CANCELLED";
	    RpcCode[RpcCode["UNKNOWN"] = 2] = "UNKNOWN";
	    RpcCode[RpcCode["INVALID_ARGUMENT"] = 3] = "INVALID_ARGUMENT";
	    RpcCode[RpcCode["DEADLINE_EXCEEDED"] = 4] = "DEADLINE_EXCEEDED";
	    RpcCode[RpcCode["NOT_FOUND"] = 5] = "NOT_FOUND";
	    RpcCode[RpcCode["ALREADY_EXISTS"] = 6] = "ALREADY_EXISTS";
	    RpcCode[RpcCode["PERMISSION_DENIED"] = 7] = "PERMISSION_DENIED";
	    RpcCode[RpcCode["UNAUTHENTICATED"] = 16] = "UNAUTHENTICATED";
	    RpcCode[RpcCode["RESOURCE_EXHAUSTED"] = 8] = "RESOURCE_EXHAUSTED";
	    RpcCode[RpcCode["FAILED_PRECONDITION"] = 9] = "FAILED_PRECONDITION";
	    RpcCode[RpcCode["ABORTED"] = 10] = "ABORTED";
	    RpcCode[RpcCode["OUT_OF_RANGE"] = 11] = "OUT_OF_RANGE";
	    RpcCode[RpcCode["UNIMPLEMENTED"] = 12] = "UNIMPLEMENTED";
	    RpcCode[RpcCode["INTERNAL"] = 13] = "INTERNAL";
	    RpcCode[RpcCode["UNAVAILABLE"] = 14] = "UNAVAILABLE";
	    RpcCode[RpcCode["DATA_LOSS"] = 15] = "DATA_LOSS";
	})(RpcCode || (RpcCode = {}));
	function isPermanentError(code) {
	    switch (code) {
	        case Code.OK:
	            return fail('Treated status OK as error');
	        case Code.CANCELLED:
	        case Code.UNKNOWN:
	        case Code.DEADLINE_EXCEEDED:
	        case Code.RESOURCE_EXHAUSTED:
	        case Code.INTERNAL:
	        case Code.UNAVAILABLE:
	        // Unauthenticated means something went wrong with our token and we need
	        // to retry with new credentials which will happen automatically.
	        case Code.UNAUTHENTICATED:
	            return false;
	        case Code.INVALID_ARGUMENT:
	        case Code.NOT_FOUND:
	        case Code.ALREADY_EXISTS:
	        case Code.PERMISSION_DENIED:
	        case Code.FAILED_PRECONDITION:
	        // Aborted might be retried in some scenarios, but that is dependant on
	        // the context and should handled individually by the calling code.
	        // See https://cloud.google.com/apis/design/errors.
	        case Code.ABORTED:
	        case Code.OUT_OF_RANGE:
	        case Code.UNIMPLEMENTED:
	        case Code.DATA_LOSS:
	            return true;
	        default:
	            return fail('Unknown status code: ' + code);
	    }
	}
	/**
	 * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
	 *
	 * @returns The Code equivalent to the given status string or undefined if
	 *     there is no match.
	 */
	function mapCodeFromRpcStatus(status) {
	    // tslint:disable-next-line:no-any lookup by string
	    var code = RpcCode[status];
	    if (code === undefined) {
	        return undefined;
	    }
	    return mapCodeFromRpcCode(code);
	}
	/**
	 * Maps an error Code from GRPC status code number, like 0, 1, or 14. These
	 * are not the same as HTTP status codes.
	 *
	 * @returns The Code equivalent to the given GRPC status code. Fails if there
	 *     is no match.
	 */
	function mapCodeFromRpcCode(code) {
	    if (code === undefined) {
	        // This shouldn't normally happen, but in certain error cases (like trying
	        // to send invalid proto messages) we may get an error with no GRPC code.
	        error$1('GRPC error has no .code');
	        return Code.UNKNOWN;
	    }
	    switch (code) {
	        case RpcCode.OK:
	            return Code.OK;
	        case RpcCode.CANCELLED:
	            return Code.CANCELLED;
	        case RpcCode.UNKNOWN:
	            return Code.UNKNOWN;
	        case RpcCode.DEADLINE_EXCEEDED:
	            return Code.DEADLINE_EXCEEDED;
	        case RpcCode.RESOURCE_EXHAUSTED:
	            return Code.RESOURCE_EXHAUSTED;
	        case RpcCode.INTERNAL:
	            return Code.INTERNAL;
	        case RpcCode.UNAVAILABLE:
	            return Code.UNAVAILABLE;
	        case RpcCode.UNAUTHENTICATED:
	            return Code.UNAUTHENTICATED;
	        case RpcCode.INVALID_ARGUMENT:
	            return Code.INVALID_ARGUMENT;
	        case RpcCode.NOT_FOUND:
	            return Code.NOT_FOUND;
	        case RpcCode.ALREADY_EXISTS:
	            return Code.ALREADY_EXISTS;
	        case RpcCode.PERMISSION_DENIED:
	            return Code.PERMISSION_DENIED;
	        case RpcCode.FAILED_PRECONDITION:
	            return Code.FAILED_PRECONDITION;
	        case RpcCode.ABORTED:
	            return Code.ABORTED;
	        case RpcCode.OUT_OF_RANGE:
	            return Code.OUT_OF_RANGE;
	        case RpcCode.UNIMPLEMENTED:
	            return Code.UNIMPLEMENTED;
	        case RpcCode.DATA_LOSS:
	            return Code.DATA_LOSS;
	        default:
	            return fail('Unknown status code: ' + code);
	    }
	}
	/**
	 * Maps an RPC code from a Code. This is the reverse operation from
	 * mapCodeFromRpcCode and should really only be used in tests.
	 */
	function mapRpcCodeFromCode(code) {
	    if (code === undefined) {
	        return RpcCode.OK;
	    }
	    switch (code) {
	        case Code.OK:
	            return RpcCode.OK;
	        case Code.CANCELLED:
	            return RpcCode.CANCELLED;
	        case Code.UNKNOWN:
	            return RpcCode.UNKNOWN;
	        case Code.DEADLINE_EXCEEDED:
	            return RpcCode.DEADLINE_EXCEEDED;
	        case Code.RESOURCE_EXHAUSTED:
	            return RpcCode.RESOURCE_EXHAUSTED;
	        case Code.INTERNAL:
	            return RpcCode.INTERNAL;
	        case Code.UNAVAILABLE:
	            return RpcCode.UNAVAILABLE;
	        case Code.UNAUTHENTICATED:
	            return RpcCode.UNAUTHENTICATED;
	        case Code.INVALID_ARGUMENT:
	            return RpcCode.INVALID_ARGUMENT;
	        case Code.NOT_FOUND:
	            return RpcCode.NOT_FOUND;
	        case Code.ALREADY_EXISTS:
	            return RpcCode.ALREADY_EXISTS;
	        case Code.PERMISSION_DENIED:
	            return RpcCode.PERMISSION_DENIED;
	        case Code.FAILED_PRECONDITION:
	            return RpcCode.FAILED_PRECONDITION;
	        case Code.ABORTED:
	            return RpcCode.ABORTED;
	        case Code.OUT_OF_RANGE:
	            return RpcCode.OUT_OF_RANGE;
	        case Code.UNIMPLEMENTED:
	            return RpcCode.UNIMPLEMENTED;
	        case Code.DATA_LOSS:
	            return RpcCode.DATA_LOSS;
	        default:
	            return fail('Unknown status code: ' + code);
	    }
	}
	/**
	 * Converts an HTTP Status Code to the equivalent error code.
	 *
	 * @param status An HTTP Status Code, like 200, 404, 503, etc.
	 * @returns The equivalent Code. Unknown status codes are mapped to
	 *     Code.UNKNOWN.
	 */
	function mapCodeFromHttpStatus(status) {
	    // The canonical error codes for Google APIs [1] specify mapping onto HTTP
	    // status codes but the mapping is not bijective. In each case of ambiguity
	    // this function chooses a primary error.
	    //
	    // [1]
	    // https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
	    switch (status) {
	        case 200: // OK
	            return Code.OK;
	        case 400: // Bad Request
	            return Code.INVALID_ARGUMENT;
	        // Other possibilities based on the forward mapping
	        // return Code.FAILED_PRECONDITION;
	        // return Code.OUT_OF_RANGE;
	        case 401: // Unauthorized
	            return Code.UNAUTHENTICATED;
	        case 403: // Forbidden
	            return Code.PERMISSION_DENIED;
	        case 404: // Not Found
	            return Code.NOT_FOUND;
	        case 409: // Conflict
	            return Code.ABORTED;
	        // Other possibilities:
	        // return Code.ALREADY_EXISTS;
	        case 416: // Range Not Satisfiable
	            return Code.OUT_OF_RANGE;
	        case 429: // Too Many Requests
	            return Code.RESOURCE_EXHAUSTED;
	        case 499: // Client Closed Request
	            return Code.CANCELLED;
	        case 500: // Internal Server Error
	            return Code.UNKNOWN;
	        // Other possibilities:
	        // return Code.INTERNAL;
	        // return Code.DATA_LOSS;
	        case 501: // Unimplemented
	            return Code.UNIMPLEMENTED;
	        case 503: // Service Unavailable
	            return Code.UNAVAILABLE;
	        case 504: // Gateway Timeout
	            return Code.DEADLINE_EXCEEDED;
	        default:
	            if (status >= 200 && status < 300)
	                { return Code.OK; }
	            if (status >= 400 && status < 500)
	                { return Code.FAILED_PRECONDITION; }
	            if (status >= 500 && status < 600)
	                { return Code.INTERNAL; }
	            return Code.UNKNOWN;
	    }
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * SortedSet is an immutable (copy-on-write) collection that holds elements
	 * in order specified by the provided comparator.
	 *
	 * NOTE: if provided comparator returns 0 for two elements, we consider them to
	 * be equal!
	 */
	var SortedSet = /** @class */ (function () {
	    function SortedSet(comparator) {
	        this.comparator = comparator;
	        this.data = new SortedMap(this.comparator);
	    }
	    /**
	     * Creates a SortedSet from the keys of the map.
	     * This is currently implemented as an O(n) copy.
	     */
	    SortedSet.fromMapKeys = function (map) {
	        var keys = new SortedSet(map.comparator);
	        map.forEach(function (key) {
	            keys = keys.add(key);
	        });
	        return keys;
	    };
	    SortedSet.prototype.has = function (elem) {
	        return this.data.get(elem) !== null;
	    };
	    SortedSet.prototype.first = function () {
	        return this.data.minKey();
	    };
	    SortedSet.prototype.last = function () {
	        return this.data.maxKey();
	    };
	    Object.defineProperty(SortedSet.prototype, "size", {
	        get: function () {
	            return this.data.size;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    SortedSet.prototype.indexOf = function (elem) {
	        return this.data.indexOf(elem);
	    };
	    /** Iterates elements in order defined by "comparator" */
	    SortedSet.prototype.forEach = function (cb) {
	        this.data.inorderTraversal(function (k, v) {
	            cb(k);
	            return false;
	        });
	    };
	    /** Iterates over `elem`s such that: range[0] <= elem < range[1]. */
	    SortedSet.prototype.forEachInRange = function (range, cb) {
	        var this$1 = this;

	        var iter = this.data.getIteratorFrom(range[0]);
	        while (iter.hasNext()) {
	            var elem = iter.getNext();
	            if (this$1.comparator(elem.key, range[1]) >= 0)
	                { return; }
	            cb(elem.key);
	        }
	    };
	    /**
	     * Iterates over `elem`s such that: start <= elem until false is returned.
	     */
	    SortedSet.prototype.forEachWhile = function (cb, start) {
	        var iter;
	        if (start !== undefined) {
	            iter = this.data.getIteratorFrom(start);
	        }
	        else {
	            iter = this.data.getIterator();
	        }
	        while (iter.hasNext()) {
	            var elem = iter.getNext();
	            var result = cb(elem.key);
	            if (!result)
	                { return; }
	        }
	    };
	    /** Finds the least element greater than or equal to `elem`. */
	    SortedSet.prototype.firstAfterOrEqual = function (elem) {
	        var iter = this.data.getIteratorFrom(elem);
	        return iter.hasNext() ? iter.getNext().key : null;
	    };
	    /** Inserts or updates an element */
	    SortedSet.prototype.add = function (elem) {
	        return this.copy(this.data.remove(elem).insert(elem, true));
	    };
	    /** Deletes an element */
	    SortedSet.prototype.delete = function (elem) {
	        if (!this.has(elem))
	            { return this; }
	        return this.copy(this.data.remove(elem));
	    };
	    SortedSet.prototype.isEmpty = function () {
	        return this.data.isEmpty();
	    };
	    SortedSet.prototype.unionWith = function (other) {
	        var result = this;
	        other.forEach(function (elem) {
	            result = result.add(elem);
	        });
	        return result;
	    };
	    SortedSet.prototype.isEqual = function (other) {
	        var this$1 = this;

	        if (!(other instanceof SortedSet))
	            { return false; }
	        if (this.size !== other.size)
	            { return false; }
	        var thisIt = this.data.getIterator();
	        var otherIt = other.data.getIterator();
	        while (thisIt.hasNext()) {
	            var thisElem = thisIt.getNext().key;
	            var otherElem = otherIt.getNext().key;
	            if (this$1.comparator(thisElem, otherElem) !== 0)
	                { return false; }
	        }
	        return true;
	    };
	    SortedSet.prototype.toString = function () {
	        var result = [];
	        this.forEach(function (elem) { return result.push(elem); });
	        return 'SortedSet(' + result.toString() + ')';
	    };
	    SortedSet.prototype.copy = function (data) {
	        var result = new SortedSet(this.comparator);
	        result.data = data;
	        return result;
	    };
	    return SortedSet;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var EMPTY_MAYBE_DOCUMENT_MAP = new SortedMap(DocumentKey.comparator);
	function maybeDocumentMap() {
	    return EMPTY_MAYBE_DOCUMENT_MAP;
	}
	var EMPTY_DOCUMENT_MAP = new SortedMap(DocumentKey.comparator);
	function documentMap() {
	    return EMPTY_DOCUMENT_MAP;
	}
	var EMPTY_DOCUMENT_VERSION_MAP = new SortedMap(DocumentKey.comparator);
	function documentVersionMap() {
	    return EMPTY_DOCUMENT_VERSION_MAP;
	}
	var EMPTY_DOCUMENT_KEY_SET = new SortedSet(DocumentKey.comparator);
	function documentKeySet() {
	    return EMPTY_DOCUMENT_KEY_SET;
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * An event from the RemoteStore. It is split into targetChanges (changes to the
	 * state or the set of documents in our watched targets) and documentUpdates
	 * (changes to the actual documents).
	 */
	var RemoteEvent = /** @class */ (function () {
	    function RemoteEvent(
	    /**
	     * The snapshot version this event brings us up to, or MIN if not set.
	     */
	    snapshotVersion, 
	    /**
	     * A map from target to changes to the target. See TargetChange.
	     */
	    targetChanges, 
	    /**
	     * A set of targets that is known to be inconsistent. Listens for these
	     * targets should be re-established without resume tokens.
	     */
	    targetMismatches, 
	    /**
	     * A set of which documents have changed or been deleted, along with the
	     * doc's new values (if not deleted).
	     */
	    documentUpdates, 
	    /**
	     * A set of which document updates are due only to limbo resolution targets.
	     */
	    resolvedLimboDocuments) {
	        this.snapshotVersion = snapshotVersion;
	        this.targetChanges = targetChanges;
	        this.targetMismatches = targetMismatches;
	        this.documentUpdates = documentUpdates;
	        this.resolvedLimboDocuments = resolvedLimboDocuments;
	    }
	    return RemoteEvent;
	}());
	/**
	 * A TargetChange specifies the set of changes for a specific target as part of
	 * a RemoteEvent. These changes track which documents are added, modified or
	 * removed, as well as the target's resume token and whether the target is
	 * marked CURRENT.
	 * The actual changes *to* documents are not part of the TargetChange since
	 * documents may be part of multiple targets.
	 */
	var TargetChange = /** @class */ (function () {
	    function TargetChange(
	    /**
	     * An opaque, server-assigned token that allows watching a query to be resumed
	     * after disconnecting without retransmitting all the data that matches the
	     * query. The resume token essentially identifies a point in time from which
	     * the server should resume sending results.
	     */
	    resumeToken, 
	    /**
	     * The "current" (synced) status of this target. Note that "current"
	     * has special meaning in the RPC protocol that implies that a target is
	     * both up-to-date and consistent with the rest of the watch stream.
	     */
	    current, 
	    /**
	     * The set of documents that were newly assigned to this target as part of
	     * this remote event.
	     */
	    addedDocuments, 
	    /**
	     * The set of documents that were already assigned to this target but received
	     * an update during this remote event.
	     */
	    modifiedDocuments, 
	    /**
	     * The set of documents that were removed from this target as part of this
	     * remote event.
	     */
	    removedDocuments) {
	        this.resumeToken = resumeToken;
	        this.current = current;
	        this.addedDocuments = addedDocuments;
	        this.modifiedDocuments = modifiedDocuments;
	        this.removedDocuments = removedDocuments;
	    }
	    return TargetChange;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var ChangeType;
	(function (ChangeType) {
	    ChangeType[ChangeType["Added"] = 0] = "Added";
	    ChangeType[ChangeType["Removed"] = 1] = "Removed";
	    ChangeType[ChangeType["Modified"] = 2] = "Modified";
	    ChangeType[ChangeType["Metadata"] = 3] = "Metadata";
	})(ChangeType || (ChangeType = {}));
	var SyncState;
	(function (SyncState) {
	    SyncState[SyncState["Local"] = 0] = "Local";
	    SyncState[SyncState["Synced"] = 1] = "Synced";
	})(SyncState || (SyncState = {}));
	/**
	 * DocumentChangeSet keeps track of a set of changes to docs in a query, merging
	 * duplicate events for the same doc.
	 */
	var DocumentChangeSet = /** @class */ (function () {
	    function DocumentChangeSet() {
	        this.changeMap = new SortedMap(DocumentKey.comparator);
	    }
	    DocumentChangeSet.prototype.track = function (change) {
	        var key = change.doc.key;
	        var oldChange = this.changeMap.get(key);
	        if (!oldChange) {
	            this.changeMap = this.changeMap.insert(key, change);
	            return;
	        }
	        // Merge the new change with the existing change.
	        if (change.type !== ChangeType.Added &&
	            oldChange.type === ChangeType.Metadata) {
	            this.changeMap = this.changeMap.insert(key, change);
	        }
	        else if (change.type === ChangeType.Metadata &&
	            oldChange.type !== ChangeType.Removed) {
	            this.changeMap = this.changeMap.insert(key, {
	                type: oldChange.type,
	                doc: change.doc
	            });
	        }
	        else if (change.type === ChangeType.Modified &&
	            oldChange.type === ChangeType.Modified) {
	            this.changeMap = this.changeMap.insert(key, {
	                type: ChangeType.Modified,
	                doc: change.doc
	            });
	        }
	        else if (change.type === ChangeType.Modified &&
	            oldChange.type === ChangeType.Added) {
	            this.changeMap = this.changeMap.insert(key, {
	                type: ChangeType.Added,
	                doc: change.doc
	            });
	        }
	        else if (change.type === ChangeType.Removed &&
	            oldChange.type === ChangeType.Added) {
	            this.changeMap = this.changeMap.remove(key);
	        }
	        else if (change.type === ChangeType.Removed &&
	            oldChange.type === ChangeType.Modified) {
	            this.changeMap = this.changeMap.insert(key, {
	                type: ChangeType.Removed,
	                doc: oldChange.doc
	            });
	        }
	        else if (change.type === ChangeType.Added &&
	            oldChange.type === ChangeType.Removed) {
	            this.changeMap = this.changeMap.insert(key, {
	                type: ChangeType.Modified,
	                doc: change.doc
	            });
	        }
	        else {
	            // This includes these cases, which don't make sense:
	            // Added->Added
	            // Removed->Removed
	            // Modified->Added
	            // Removed->Modified
	            // Metadata->Added
	            // Removed->Metadata
	            fail('unsupported combination of changes: ' +
	                JSON.stringify(change) +
	                ' after ' +
	                JSON.stringify(oldChange));
	        }
	    };
	    DocumentChangeSet.prototype.getChanges = function () {
	        var changes = [];
	        this.changeMap.inorderTraversal(function (key, change) {
	            changes.push(change);
	        });
	        return changes;
	    };
	    return DocumentChangeSet;
	}());
	var ViewSnapshot = /** @class */ (function () {
	    function ViewSnapshot(query, docs, oldDocs, docChanges, fromCache, hasPendingWrites, syncStateChanged, excludesMetadataChanges) {
	        this.query = query;
	        this.docs = docs;
	        this.oldDocs = oldDocs;
	        this.docChanges = docChanges;
	        this.fromCache = fromCache;
	        this.hasPendingWrites = hasPendingWrites;
	        this.syncStateChanged = syncStateChanged;
	        this.excludesMetadataChanges = excludesMetadataChanges;
	    }
	    ViewSnapshot.prototype.isEqual = function (other) {
	        if (this.fromCache !== other.fromCache ||
	            this.hasPendingWrites !== other.hasPendingWrites ||
	            this.syncStateChanged !== other.syncStateChanged ||
	            !this.query.isEqual(other.query) ||
	            !this.docs.isEqual(other.docs) ||
	            !this.oldDocs.isEqual(other.oldDocs)) {
	            return false;
	        }
	        var changes = this.docChanges;
	        var otherChanges = other.docChanges;
	        if (changes.length !== otherChanges.length) {
	            return false;
	        }
	        for (var i = 0; i < changes.length; i++) {
	            if (changes[i].type !== otherChanges[i].type ||
	                !changes[i].doc.isEqual(otherChanges[i].doc)) {
	                return false;
	            }
	        }
	        return true;
	    };
	    return ViewSnapshot;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Represents a changed document and a list of target ids to which this change
	 * applies.
	 *
	 * If document has been deleted NoDocument will be provided.
	 */
	var DocumentWatchChange = /** @class */ (function () {
	    function DocumentWatchChange(
	    /** The new document applies to all of these targets. */
	    updatedTargetIds, 
	    /** The new document is removed from all of these targets. */
	    removedTargetIds, 
	    /** The key of the document for this change. */
	    key, 
	    /**
	     * The new document or NoDocument if it was deleted. Is null if the
	     * document went out of view without the server sending a new document.
	     */
	    newDoc) {
	        this.updatedTargetIds = updatedTargetIds;
	        this.removedTargetIds = removedTargetIds;
	        this.key = key;
	        this.newDoc = newDoc;
	    }
	    return DocumentWatchChange;
	}());
	var ExistenceFilterChange = /** @class */ (function () {
	    function ExistenceFilterChange(targetId, existenceFilter) {
	        this.targetId = targetId;
	        this.existenceFilter = existenceFilter;
	    }
	    return ExistenceFilterChange;
	}());
	var WatchTargetChangeState;
	(function (WatchTargetChangeState) {
	    WatchTargetChangeState[WatchTargetChangeState["NoChange"] = 0] = "NoChange";
	    WatchTargetChangeState[WatchTargetChangeState["Added"] = 1] = "Added";
	    WatchTargetChangeState[WatchTargetChangeState["Removed"] = 2] = "Removed";
	    WatchTargetChangeState[WatchTargetChangeState["Current"] = 3] = "Current";
	    WatchTargetChangeState[WatchTargetChangeState["Reset"] = 4] = "Reset";
	})(WatchTargetChangeState || (WatchTargetChangeState = {}));
	var WatchTargetChange = /** @class */ (function () {
	    function WatchTargetChange(
	    /** What kind of change occurred to the watch target. */
	    state, 
	    /** The target IDs that were added/removed/set. */
	    targetIds, 
	    /**
	     * An opaque, server-assigned token that allows watching a query to be
	     * resumed after disconnecting without retransmitting all the data that
	     * matches the query. The resume token essentially identifies a point in
	     * time from which the server should resume sending results.
	     */
	    resumeToken, 
	    /** An RPC error indicating why the watch failed. */
	    cause) {
	        if (resumeToken === void 0) { resumeToken = emptyByteString(); }
	        if (cause === void 0) { cause = null; }
	        this.state = state;
	        this.targetIds = targetIds;
	        this.resumeToken = resumeToken;
	        this.cause = cause;
	    }
	    return WatchTargetChange;
	}());
	/** Tracks the internal state of a Watch target. */
	var TargetState = /** @class */ (function () {
	    function TargetState() {
	        /**
	         * The number of pending responses (adds or removes) that we are waiting on.
	         * We only consider targets active that have no pending responses.
	         */
	        this.pendingResponses = 0;
	        /**
	         * Keeps track of the document changes since the last raised snapshot.
	         *
	         * These changes are continuously updated as we receive document updates and
	         * always reflect the current set of changes against the last issued snapshot.
	         */
	        this.documentChanges = snapshotChangesMap();
	        /** See public getters for explanations of these fields. */
	        this._resumeToken = emptyByteString();
	        this._current = false;
	        /**
	         * Whether this target state should be included in the next snapshot. We
	         * initialize to true so that newly-added targets are included in the next
	         * RemoteEvent.
	         */
	        this._hasPendingChanges = true;
	    }
	    Object.defineProperty(TargetState.prototype, "current", {
	        /**
	         * Whether this target has been marked 'current'.
	         *
	         * 'Current' has special meaning in the RPC protocol: It implies that the
	         * Watch backend has sent us all changes up to the point at which the target
	         * was added and that the target is consistent with the rest of the watch
	         * stream.
	         */
	        get: function () {
	            return this._current;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(TargetState.prototype, "resumeToken", {
	        /** The last resume token sent to us for this target. */
	        get: function () {
	            return this._resumeToken;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(TargetState.prototype, "isPending", {
	        /** Whether this target has pending target adds or target removes. */
	        get: function () {
	            return this.pendingResponses !== 0;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(TargetState.prototype, "hasPendingChanges", {
	        /** Whether we have modified any state that should trigger a snapshot. */
	        get: function () {
	            return this._hasPendingChanges;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Applies the resume token to the TargetChange, but only when it has a new
	     * value. Empty resumeTokens are discarded.
	     */
	    TargetState.prototype.updateResumeToken = function (resumeToken) {
	        if (resumeToken.length > 0) {
	            this._hasPendingChanges = true;
	            this._resumeToken = resumeToken;
	        }
	    };
	    /**
	     * Creates a target change from the current set of changes.
	     *
	     * To reset the document changes after raising this snapshot, call
	     * `clearPendingChanges()`.
	     */
	    TargetState.prototype.toTargetChange = function () {
	        var addedDocuments = documentKeySet();
	        var modifiedDocuments = documentKeySet();
	        var removedDocuments = documentKeySet();
	        this.documentChanges.forEach(function (key, changeType) {
	            switch (changeType) {
	                case ChangeType.Added:
	                    addedDocuments = addedDocuments.add(key);
	                    break;
	                case ChangeType.Modified:
	                    modifiedDocuments = modifiedDocuments.add(key);
	                    break;
	                case ChangeType.Removed:
	                    removedDocuments = removedDocuments.add(key);
	                    break;
	                default:
	                    fail('Encountered invalid change type: ' + changeType);
	            }
	        });
	        return new TargetChange(this._resumeToken, this._current, addedDocuments, modifiedDocuments, removedDocuments);
	    };
	    /**
	     * Resets the document changes and sets `hasPendingChanges` to false.
	     */
	    TargetState.prototype.clearPendingChanges = function () {
	        this._hasPendingChanges = false;
	        this.documentChanges = snapshotChangesMap();
	    };
	    TargetState.prototype.addDocumentChange = function (key, changeType) {
	        this._hasPendingChanges = true;
	        this.documentChanges = this.documentChanges.insert(key, changeType);
	    };
	    TargetState.prototype.removeDocumentChange = function (key) {
	        this._hasPendingChanges = true;
	        this.documentChanges = this.documentChanges.remove(key);
	    };
	    TargetState.prototype.recordPendingTargetRequest = function () {
	        this.pendingResponses += 1;
	    };
	    TargetState.prototype.recordTargetResponse = function () {
	        this.pendingResponses -= 1;
	    };
	    TargetState.prototype.markCurrent = function () {
	        this._hasPendingChanges = true;
	        this._current = true;
	    };
	    return TargetState;
	}());
	/**
	 * A helper class to accumulate watch changes into a RemoteEvent.
	 */
	var WatchChangeAggregator = /** @class */ (function () {
	    function WatchChangeAggregator(metadataProvider) {
	        this.metadataProvider = metadataProvider;
	        /** The internal state of all tracked targets. */
	        this.targetStates = {};
	        /** Keeps track of the documents to update since the last raised snapshot. */
	        this.pendingDocumentUpdates = maybeDocumentMap();
	        /** A mapping of document keys to their set of target IDs. */
	        this.pendingDocumentTargetMapping = documentTargetMap();
	        /**
	         * A list of targets with existence filter mismatches. These targets are
	         * known to be inconsistent and their listens needs to be re-established by
	         * RemoteStore.
	         */
	        this.pendingTargetResets = new SortedSet(primitiveComparator);
	    }
	    /**
	     * Processes and adds the DocumentWatchChange to the current set of changes.
	     */
	    WatchChangeAggregator.prototype.handleDocumentChange = function (docChange) {
	        var this$1 = this;

	        for (var _i = 0, _a = docChange.updatedTargetIds; _i < _a.length; _i++) {
	            var targetId = _a[_i];
	            if (docChange.newDoc instanceof Document) {
	                this$1.addDocumentToTarget(targetId, docChange.newDoc);
	            }
	            else if (docChange.newDoc instanceof NoDocument) {
	                this$1.removeDocumentFromTarget(targetId, docChange.key, docChange.newDoc);
	            }
	        }
	        for (var _b = 0, _c = docChange.removedTargetIds; _b < _c.length; _b++) {
	            var targetId = _c[_b];
	            this$1.removeDocumentFromTarget(targetId, docChange.key, docChange.newDoc);
	        }
	    };
	    /** Processes and adds the WatchTargetChange to the current set of changes. */
	    WatchChangeAggregator.prototype.handleTargetChange = function (targetChange) {
	        var _this = this;
	        targetChange.targetIds.forEach(function (targetId) {
	            var targetState = _this.ensureTargetState(targetId);
	            switch (targetChange.state) {
	                case WatchTargetChangeState.NoChange:
	                    if (_this.isActiveTarget(targetId)) {
	                        targetState.updateResumeToken(targetChange.resumeToken);
	                    }
	                    break;
	                case WatchTargetChangeState.Added:
	                    // We need to decrement the number of pending acks needed from watch
	                    // for this targetId.
	                    targetState.recordTargetResponse();
	                    if (!targetState.isPending) {
	                        // We have a freshly added target, so we need to reset any state
	                        // that we had previously. This can happen e.g. when remove and add
	                        // back a target for existence filter mismatches.
	                        targetState.clearPendingChanges();
	                    }
	                    targetState.updateResumeToken(targetChange.resumeToken);
	                    break;
	                case WatchTargetChangeState.Removed:
	                    // We need to keep track of removed targets to we can post-filter and
	                    // remove any target changes.
	                    // We need to decrement the number of pending acks needed from watch
	                    // for this targetId.
	                    targetState.recordTargetResponse();
	                    if (!targetState.isPending) {
	                        _this.removeTarget(targetId);
	                    }
	                    assert$1(!targetChange.cause, 'WatchChangeAggregator does not handle errored targets');
	                    break;
	                case WatchTargetChangeState.Current:
	                    if (_this.isActiveTarget(targetId)) {
	                        targetState.markCurrent();
	                        targetState.updateResumeToken(targetChange.resumeToken);
	                    }
	                    break;
	                case WatchTargetChangeState.Reset:
	                    if (_this.isActiveTarget(targetId)) {
	                        // Reset the target and synthesizes removes for all existing
	                        // documents. The backend will re-add any documents that still
	                        // match the target before it sends the next global snapshot.
	                        _this.resetTarget(targetId);
	                        targetState.updateResumeToken(targetChange.resumeToken);
	                    }
	                    break;
	                default:
	                    fail('Unknown target watch change state: ' + targetChange.state);
	            }
	        });
	    };
	    /**
	     * Handles existence filters and synthesizes deletes for filter mismatches.
	     * Targets that are invalidated by filter mismatches are added to
	     * `pendingTargetResets`.
	     */
	    WatchChangeAggregator.prototype.handleExistenceFilter = function (watchChange) {
	        var targetId = watchChange.targetId;
	        var expectedCount = watchChange.existenceFilter.count;
	        var queryData = this.queryDataForActiveTarget(targetId);
	        if (queryData) {
	            var query = queryData.query;
	            if (query.isDocumentQuery()) {
	                if (expectedCount === 0) {
	                    // The existence filter told us the document does not exist. We deduce
	                    // that this document does not exist and apply a deleted document to
	                    // our updates. Without applying this deleted document there might be
	                    // another query that will raise this document as part of a snapshot
	                    // until it is resolved, essentially exposing inconsistency between
	                    // queries.
	                    var key = new DocumentKey(query.path);
	                    this.removeDocumentFromTarget(targetId, key, new NoDocument(key, SnapshotVersion.forDeletedDoc()));
	                }
	                else {
	                    assert$1(expectedCount === 1, 'Single document existence filter with count: ' + expectedCount);
	                }
	            }
	            else {
	                var currentSize = this.getCurrentDocumentCountForTarget(targetId);
	                if (currentSize !== expectedCount) {
	                    // Existence filter mismatch: We reset the mapping and raise a new
	                    // snapshot with `isFromCache:true`.
	                    this.resetTarget(targetId);
	                    this.pendingTargetResets = this.pendingTargetResets.add(targetId);
	                }
	            }
	        }
	    };
	    /**
	     * Converts the currently accumulated state into a remote event at the
	     * provided snapshot version. Resets the accumulated changes before returning.
	     */
	    WatchChangeAggregator.prototype.createRemoteEvent = function (snapshotVersion) {
	        var _this = this;
	        var targetChanges = {};
	        forEachNumber(this.targetStates, function (targetId, targetState) {
	            var queryData = _this.queryDataForActiveTarget(targetId);
	            if (queryData) {
	                if (targetState.current && queryData.query.isDocumentQuery()) {
	                    // Document queries for document that don't exist can produce an empty
	                    // result set. To update our local cache, we synthesize a document
	                    // delete if we have not previously received the document. This
	                    // resolves the limbo state of the document, removing it from
	                    // limboDocumentRefs.
	                    //
	                    // TODO(dimond): Ideally we would have an explicit lookup query
	                    // instead resulting in an explicit delete message and we could
	                    // remove this special logic.
	                    var key = new DocumentKey(queryData.query.path);
	                    if (_this.pendingDocumentUpdates.get(key) === null &&
	                        !_this.targetContainsDocument(targetId, key)) {
	                        _this.removeDocumentFromTarget(targetId, key, new NoDocument(key, snapshotVersion));
	                    }
	                }
	                if (targetState.hasPendingChanges) {
	                    targetChanges[targetId] = targetState.toTargetChange();
	                    targetState.clearPendingChanges();
	                }
	            }
	        });
	        var resolvedLimboDocuments = documentKeySet();
	        // We extract the set of limbo-only document updates as the GC logic
	        // special-cases documents that do not appear in the query cache.
	        //
	        // TODO(gsoltis): Expand on this comment once GC is available in the JS
	        // client.
	        this.pendingDocumentTargetMapping.forEach(function (key, targets) {
	            var isOnlyLimboTarget = true;
	            targets.forEachWhile(function (targetId) {
	                var queryData = _this.queryDataForActiveTarget(targetId);
	                if (queryData && queryData.purpose !== QueryPurpose.LimboResolution) {
	                    isOnlyLimboTarget = false;
	                    return false;
	                }
	                return true;
	            });
	            if (isOnlyLimboTarget) {
	                resolvedLimboDocuments = resolvedLimboDocuments.add(key);
	            }
	        });
	        var remoteEvent = new RemoteEvent(snapshotVersion, targetChanges, this.pendingTargetResets, this.pendingDocumentUpdates, resolvedLimboDocuments);
	        this.pendingDocumentUpdates = maybeDocumentMap();
	        this.pendingDocumentTargetMapping = documentTargetMap();
	        this.pendingTargetResets = new SortedSet(primitiveComparator);
	        return remoteEvent;
	    };
	    /**
	     * Adds the provided document to the internal list of document updates and
	     * its document key to the given target's mapping.
	     */
	    // Visible for testing.
	    WatchChangeAggregator.prototype.addDocumentToTarget = function (targetId, document) {
	        if (!this.isActiveTarget(targetId)) {
	            return;
	        }
	        var changeType = this.targetContainsDocument(targetId, document.key)
	            ? ChangeType.Modified
	            : ChangeType.Added;
	        var targetState = this.ensureTargetState(targetId);
	        targetState.addDocumentChange(document.key, changeType);
	        this.pendingDocumentUpdates = this.pendingDocumentUpdates.insert(document.key, document);
	        this.pendingDocumentTargetMapping = this.pendingDocumentTargetMapping.insert(document.key, this.ensureDocumentTargetMapping(document.key).add(targetId));
	    };
	    /**
	     * Removes the provided document from the target mapping. If the
	     * document no longer matches the target, but the document's state is still
	     * known (e.g. we know that the document was deleted or we received the change
	     * that caused the filter mismatch), the new document can be provided
	     * to update the remote document cache.
	     */
	    // Visible for testing.
	    WatchChangeAggregator.prototype.removeDocumentFromTarget = function (targetId, key, updatedDocument) {
	        if (!this.isActiveTarget(targetId)) {
	            return;
	        }
	        var targetState = this.ensureTargetState(targetId);
	        if (this.targetContainsDocument(targetId, key)) {
	            targetState.addDocumentChange(key, ChangeType.Removed);
	        }
	        else {
	            // The document may have entered and left the target before we raised a
	            // snapshot, so we can just ignore the change.
	            targetState.removeDocumentChange(key);
	        }
	        this.pendingDocumentTargetMapping = this.pendingDocumentTargetMapping.insert(key, this.ensureDocumentTargetMapping(key).delete(targetId));
	        if (updatedDocument) {
	            this.pendingDocumentUpdates = this.pendingDocumentUpdates.insert(key, updatedDocument);
	        }
	    };
	    WatchChangeAggregator.prototype.removeTarget = function (targetId) {
	        delete this.targetStates[targetId];
	    };
	    /**
	     * Returns the current count of documents in the target. This includes both
	     * the number of documents that the LocalStore considers to be part of the
	     * target as well as any accumulated changes.
	     */
	    WatchChangeAggregator.prototype.getCurrentDocumentCountForTarget = function (targetId) {
	        var targetState = this.ensureTargetState(targetId);
	        var targetChange = targetState.toTargetChange();
	        return (this.metadataProvider.getRemoteKeysForTarget(targetId).size +
	            targetChange.addedDocuments.size -
	            targetChange.removedDocuments.size);
	    };
	    /**
	     * Increment the number of acks needed from watch before we can consider the
	     * server to be 'in-sync' with the client's active targets.
	     */
	    WatchChangeAggregator.prototype.recordPendingTargetRequest = function (targetId) {
	        // For each request we get we need to record we need a response for it.
	        var targetState = this.ensureTargetState(targetId);
	        targetState.recordPendingTargetRequest();
	    };
	    WatchChangeAggregator.prototype.ensureTargetState = function (targetId) {
	        if (!this.targetStates[targetId]) {
	            this.targetStates[targetId] = new TargetState();
	        }
	        return this.targetStates[targetId];
	    };
	    WatchChangeAggregator.prototype.ensureDocumentTargetMapping = function (key) {
	        var targetMapping = this.pendingDocumentTargetMapping.get(key);
	        if (!targetMapping) {
	            targetMapping = new SortedSet(primitiveComparator);
	            this.pendingDocumentTargetMapping = this.pendingDocumentTargetMapping.insert(key, targetMapping);
	        }
	        return targetMapping;
	    };
	    /**
	     * Verifies that the user is still interested in this target (by calling
	     * `getQueryDataForTarget()`) and that we are not waiting for pending ADDs
	     * from watch.
	     */
	    WatchChangeAggregator.prototype.isActiveTarget = function (targetId) {
	        return this.queryDataForActiveTarget(targetId) !== null;
	    };
	    /**
	     * Returns the QueryData for an active target (i.e. a target that the user
	     * is still interested in that has no outstanding target change requests).
	     */
	    WatchChangeAggregator.prototype.queryDataForActiveTarget = function (targetId) {
	        var targetState = this.targetStates[targetId];
	        return targetState && targetState.isPending
	            ? null
	            : this.metadataProvider.getQueryDataForTarget(targetId);
	    };
	    /**
	     * Resets the state of a Watch target to its initial state (e.g. sets
	     * 'current' to false, clears the resume token and removes its target mapping
	     * from all documents).
	     */
	    WatchChangeAggregator.prototype.resetTarget = function (targetId) {
	        var _this = this;
	        assert$1(!this.targetStates[targetId].isPending, 'Should only reset active targets');
	        this.targetStates[targetId] = new TargetState();
	        // Trigger removal for any documents currently mapped to this target.
	        // These removals will be part of the initial snapshot if Watch does not
	        // resend these documents.
	        var existingKeys = this.metadataProvider.getRemoteKeysForTarget(targetId);
	        existingKeys.forEach(function (key) {
	            _this.removeDocumentFromTarget(targetId, key);
	        });
	    };
	    /**
	     * Returns whether the LocalStore considers the document to be part of the
	     * specified target.
	     */
	    WatchChangeAggregator.prototype.targetContainsDocument = function (targetId, key) {
	        var existingKeys = this.metadataProvider.getRemoteKeysForTarget(targetId);
	        return existingKeys.has(key);
	    };
	    return WatchChangeAggregator;
	}());
	function documentTargetMap() {
	    return new SortedMap(DocumentKey.comparator);
	}
	function snapshotChangesMap() {
	    return new SortedMap(DocumentKey.comparator);
	}

	/**
	 * Copyright 2018 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/** Transforms a value into a server-generated timestamp. */
	var ServerTimestampTransform = /** @class */ (function () {
	    function ServerTimestampTransform() {
	    }
	    ServerTimestampTransform.prototype.applyToLocalView = function (previousValue, localWriteTime) {
	        return new ServerTimestampValue(localWriteTime, previousValue);
	    };
	    ServerTimestampTransform.prototype.applyToRemoteDocument = function (previousValue, transformResult) {
	        return transformResult;
	    };
	    ServerTimestampTransform.prototype.isEqual = function (other) {
	        return other instanceof ServerTimestampTransform;
	    };
	    ServerTimestampTransform.instance = new ServerTimestampTransform();
	    return ServerTimestampTransform;
	}());
	/** Transforms an array value via a union operation. */
	var ArrayUnionTransformOperation = /** @class */ (function () {
	    function ArrayUnionTransformOperation(elements) {
	        this.elements = elements;
	    }
	    ArrayUnionTransformOperation.prototype.applyToLocalView = function (previousValue, localWriteTime) {
	        return this.apply(previousValue);
	    };
	    ArrayUnionTransformOperation.prototype.applyToRemoteDocument = function (previousValue, transformResult) {
	        // The server just sends null as the transform result for array operations,
	        // so we have to calculate a result the same as we do for local
	        // applications.
	        return this.apply(previousValue);
	    };
	    ArrayUnionTransformOperation.prototype.apply = function (previousValue) {
	        var result = coercedFieldValuesArray(previousValue);
	        var _loop_1 = function (toUnion) {
	            if (!result.find(function (element) { return element.isEqual(toUnion); })) {
	                result.push(toUnion);
	            }
	        };
	        for (var _i = 0, _a = this.elements; _i < _a.length; _i++) {
	            var toUnion = _a[_i];
	            _loop_1(toUnion);
	        }
	        return new ArrayValue(result);
	    };
	    ArrayUnionTransformOperation.prototype.isEqual = function (other) {
	        return (other instanceof ArrayUnionTransformOperation &&
	            arrayEquals(other.elements, this.elements));
	    };
	    return ArrayUnionTransformOperation;
	}());
	/** Transforms an array value via a remove operation. */
	var ArrayRemoveTransformOperation = /** @class */ (function () {
	    function ArrayRemoveTransformOperation(elements) {
	        this.elements = elements;
	    }
	    ArrayRemoveTransformOperation.prototype.applyToLocalView = function (previousValue, localWriteTime) {
	        return this.apply(previousValue);
	    };
	    ArrayRemoveTransformOperation.prototype.applyToRemoteDocument = function (previousValue, transformResult) {
	        // The server just sends null as the transform result for array operations,
	        // so we have to calculate a result the same as we do for local
	        // applications.
	        return this.apply(previousValue);
	    };
	    ArrayRemoveTransformOperation.prototype.apply = function (previousValue) {
	        var result = coercedFieldValuesArray(previousValue);
	        var _loop_2 = function (toRemove) {
	            result = result.filter(function (element) { return !element.isEqual(toRemove); });
	        };
	        for (var _i = 0, _a = this.elements; _i < _a.length; _i++) {
	            var toRemove = _a[_i];
	            _loop_2(toRemove);
	        }
	        return new ArrayValue(result);
	    };
	    ArrayRemoveTransformOperation.prototype.isEqual = function (other) {
	        return (other instanceof ArrayRemoveTransformOperation &&
	            arrayEquals(other.elements, this.elements));
	    };
	    return ArrayRemoveTransformOperation;
	}());
	function coercedFieldValuesArray(value) {
	    if (value instanceof ArrayValue) {
	        return value.internalValue.slice();
	    }
	    else {
	        // coerce to empty array.
	        return [];
	    }
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var DIRECTIONS = (function () {
	    var dirs = {};
	    dirs[Direction.ASCENDING.name] = 'ASCENDING';
	    dirs[Direction.DESCENDING.name] = 'DESCENDING';
	    return dirs;
	})();
	var OPERATORS = (function () {
	    var ops = {};
	    ops[RelationOp.LESS_THAN.name] = 'LESS_THAN';
	    ops[RelationOp.LESS_THAN_OR_EQUAL.name] = 'LESS_THAN_OR_EQUAL';
	    ops[RelationOp.GREATER_THAN.name] = 'GREATER_THAN';
	    ops[RelationOp.GREATER_THAN_OR_EQUAL.name] = 'GREATER_THAN_OR_EQUAL';
	    ops[RelationOp.EQUAL.name] = 'EQUAL';
	    ops[RelationOp.ARRAY_CONTAINS.name] = 'ARRAY_CONTAINS';
	    return ops;
	})();
	// A RegExp matching ISO 8601 UTC timestamps with optional fraction.
	var ISO_REG_EXP = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
	function assertPresent(value, description) {
	    assert$1(!isNullOrUndefined(value), description + ' is missing');
	}
	function parseInt64(value) {
	    // TODO(bjornick): Handle int64 greater than 53 bits.
	    if (typeof value === 'number') {
	        return value;
	    }
	    else if (typeof value === 'string') {
	        return Number(value);
	    }
	    else {
	        return fail("can't parse " + value);
	    }
	}
	/**
	 * Generates JsonObject values for the Datastore API suitable for sending to
	 * either GRPC stub methods or via the JSON/HTTP REST API.
	 * TODO(klimt): We can remove the databaseId argument if we keep the full
	 * resource name in documents.
	 */
	var JsonProtoSerializer = /** @class */ (function () {
	    function JsonProtoSerializer(databaseId, options) {
	        this.databaseId = databaseId;
	        this.options = options;
	    }
	    JsonProtoSerializer.prototype.emptyByteString = function () {
	        if (this.options.useProto3Json) {
	            return '';
	        }
	        else {
	            return new Uint8Array(0);
	        }
	    };
	    JsonProtoSerializer.prototype.unsafeCastProtoByteString = function (byteString) {
	        // byteStrings can be either string or UInt8Array, but the typings say
	        // it's always a string. Cast as string to avoid type check failing
	        return byteString;
	    };
	    JsonProtoSerializer.prototype.fromRpcStatus = function (status) {
	        var code = status.code === undefined
	            ? Code.UNKNOWN
	            : mapCodeFromRpcCode(status.code);
	        return new FirestoreError(code, status.message || '');
	    };
	    /**
	     * Returns a value for a number (or undefined) that's appropriate to put into
	     * a google.protobuf.Int32Value proto.
	     * DO NOT USE THIS FOR ANYTHING ELSE.
	     * This method cheats. It's typed as returning "number" because that's what
	     * our generated proto interfaces say Int32Value must be. But GRPC actually
	     * expects a { value: <number> } struct.
	     */
	    JsonProtoSerializer.prototype.toInt32Value = function (val) {
	        if (!isNullOrUndefined(val)) {
	            // tslint:disable-next-line:no-any We need to match generated Proto types.
	            return { value: val };
	        }
	        else {
	            return undefined;
	        }
	    };
	    /**
	     * Returns a number (or null) from a google.protobuf.Int32Value proto.
	     * DO NOT USE THIS FOR ANYTHING ELSE.
	     * This method cheats. It's typed as accepting "number" because that's what
	     * our generated proto interfaces say Int32Value must be, but it actually
	     * accepts { value: number } to match our serialization in toInt32Value().
	     */
	    JsonProtoSerializer.prototype.fromInt32Value = function (val) {
	        var result;
	        if (typeof val === 'object') {
	            // tslint:disable-next-line:no-any We need to match generated Proto types.
	            result = val.value;
	        }
	        else {
	            // We accept raw numbers (without the {value: ... } wrapper) for
	            // compatibility with legacy persisted data.
	            result = val;
	        }
	        return isNullOrUndefined(result) ? null : result;
	    };
	    /**
	     * Returns a value for a Date that's appropriate to put into a proto.
	     * DO NOT USE THIS FOR ANYTHING ELSE.
	     * This method cheats. It's typed as returning "string" because that's what
	     * our generated proto interfaces say dates must be. But it's easier and safer
	     * to actually return a Timestamp proto.
	     */
	    JsonProtoSerializer.prototype.toTimestamp = function (timestamp) {
	        return {
	            seconds: timestamp.seconds,
	            nanos: timestamp.nanoseconds
	            // tslint:disable-next-line:no-any
	        };
	    };
	    JsonProtoSerializer.prototype.fromTimestamp = function (date) {
	        // The json interface (for the browser) will return an iso timestamp string,
	        // while the proto js library (for node) will return a
	        // google.protobuf.Timestamp instance.
	        if (typeof date === 'string') {
	            // TODO(b/37282237): Use strings for Proto3 timestamps
	            // assert(this.options.useProto3Json,
	            //   'The timestamp string format requires Proto3.');
	            return this.fromIso8601String(date);
	        }
	        else {
	            assert$1(!!date, 'Cannot deserialize null or undefined timestamp.');
	            // TODO(b/37282237): Use strings for Proto3 timestamps
	            // assert(!this.options.useProto3Json,
	            //   'The timestamp instance format requires Proto JS.');
	            var seconds = parseInt64(date.seconds || '0');
	            var nanos = date.nanos || 0;
	            return new Timestamp(seconds, nanos);
	        }
	    };
	    JsonProtoSerializer.prototype.fromIso8601String = function (utc) {
	        // The date string can have higher precision (nanos) than the Date class
	        // (millis), so we do some custom parsing here.
	        // Parse the nanos right out of the string.
	        var nanos = 0;
	        var fraction = ISO_REG_EXP.exec(utc);
	        assert$1(!!fraction, 'invalid timestamp: ' + utc);
	        if (fraction[1]) {
	            // Pad the fraction out to 9 digits (nanos).
	            var nanoStr = fraction[1];
	            nanoStr = (nanoStr + '000000000').substr(0, 9);
	            nanos = Number(nanoStr);
	        }
	        // Parse the date to get the seconds.
	        var date = new Date(utc);
	        var seconds = Math.floor(date.getTime() / 1000);
	        return new Timestamp(seconds, nanos);
	    };
	    /**
	     * Returns a value for bytes that's appropriate to put in a proto.
	     * DO NOT USE THIS FOR ANYTHING ELSE.
	     * This method cheats. It's typed as returning "string" because that's what
	     * our generated proto interfaces say bytes must be. But it should return
	     * an Uint8Array in Node.
	     */
	    JsonProtoSerializer.prototype.toBytes = function (bytes) {
	        if (this.options.useProto3Json) {
	            return bytes.toBase64();
	        }
	        else {
	            // The typings say it's a string, but it needs to be a Uint8Array in Node.
	            return this.unsafeCastProtoByteString(bytes.toUint8Array());
	        }
	    };
	    /**
	     * Parse the blob from the protos into the internal Blob class. Note that the
	     * typings assume all blobs are strings, but they are actually Uint8Arrays
	     * on Node.
	     */
	    JsonProtoSerializer.prototype.fromBlob = function (blob) {
	        if (typeof blob === 'string') {
	            assert$1(this.options.useProto3Json, 'Expected bytes to be passed in as Uint8Array, but got a string instead.');
	            return Blob$1.fromBase64String(blob);
	        }
	        else {
	            assert$1(!this.options.useProto3Json, 'Expected bytes to be passed in as string, but got something else instead.');
	            return Blob$1.fromUint8Array(blob);
	        }
	    };
	    JsonProtoSerializer.prototype.toVersion = function (version) {
	        return this.toTimestamp(version.toTimestamp());
	    };
	    JsonProtoSerializer.prototype.fromVersion = function (version) {
	        assert$1(!!version, "Trying to deserialize version that isn't set");
	        return SnapshotVersion.fromTimestamp(this.fromTimestamp(version));
	    };
	    JsonProtoSerializer.prototype.toResourceName = function (databaseId, path) {
	        return this.fullyQualifiedPrefixPath(databaseId)
	            .child('documents')
	            .child(path)
	            .canonicalString();
	    };
	    JsonProtoSerializer.prototype.fromResourceName = function (name) {
	        var resource = ResourcePath.fromString(name);
	        assert$1(this.isValidResourceName(resource), 'Tried to deserialize invalid key ' + resource.toString());
	        return resource;
	    };
	    JsonProtoSerializer.prototype.toName = function (key) {
	        return this.toResourceName(this.databaseId, key.path);
	    };
	    JsonProtoSerializer.prototype.fromName = function (name) {
	        var resource = this.fromResourceName(name);
	        assert$1(resource.get(1) === this.databaseId.projectId, 'Tried to deserialize key from different project: ' +
	            resource.get(1) +
	            ' vs ' +
	            this.databaseId.projectId);
	        assert$1((!resource.get(3) && !this.databaseId.database) ||
	            resource.get(3) === this.databaseId.database, 'Tried to deserialize key from different database: ' +
	            resource.get(3) +
	            ' vs ' +
	            this.databaseId.database);
	        return new DocumentKey(this.extractLocalPathFromResourceName(resource));
	    };
	    JsonProtoSerializer.prototype.toQueryPath = function (path) {
	        if (path.length === 0) {
	            // If the path is empty, the backend requires we leave off the /documents
	            // at the end.
	            return this.encodedDatabaseId;
	        }
	        return this.toResourceName(this.databaseId, path);
	    };
	    JsonProtoSerializer.prototype.fromQueryPath = function (name) {
	        var resourceName = this.fromResourceName(name);
	        if (resourceName.length === 4) {
	            return ResourcePath.EMPTY_PATH;
	        }
	        return this.extractLocalPathFromResourceName(resourceName);
	    };
	    Object.defineProperty(JsonProtoSerializer.prototype, "encodedDatabaseId", {
	        get: function () {
	            var path = new ResourcePath([
	                'projects',
	                this.databaseId.projectId,
	                'databases',
	                this.databaseId.database
	            ]);
	            return path.canonicalString();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    JsonProtoSerializer.prototype.fullyQualifiedPrefixPath = function (databaseId) {
	        return new ResourcePath([
	            'projects',
	            databaseId.projectId,
	            'databases',
	            databaseId.database
	        ]);
	    };
	    JsonProtoSerializer.prototype.extractLocalPathFromResourceName = function (resourceName) {
	        assert$1(resourceName.length > 4 && resourceName.get(4) === 'documents', 'tried to deserialize invalid key ' + resourceName.toString());
	        return resourceName.popFirst(5);
	    };
	    JsonProtoSerializer.prototype.isValidResourceName = function (path) {
	        // Resource names have at least 4 components (project ID, database ID)
	        return (path.length >= 4 &&
	            path.get(0) === 'projects' &&
	            path.get(2) === 'databases');
	    };
	    JsonProtoSerializer.prototype.toValue = function (val) {
	        if (val instanceof NullValue) {
	            return { nullValue: 'NULL_VALUE' };
	        }
	        else if (val instanceof BooleanValue) {
	            return { booleanValue: val.value() };
	        }
	        else if (val instanceof IntegerValue) {
	            return { integerValue: '' + val.value() };
	        }
	        else if (val instanceof DoubleValue) {
	            var doubleValue = val.value();
	            if (this.options.useProto3Json) {
	                // Proto 3 let's us encode NaN and Infinity as string values as
	                // expected by the backend. This is currently not checked by our unit
	                // tests because they rely on protobuf.js.
	                if (isNaN(doubleValue)) {
	                    return { doubleValue: 'NaN' };
	                }
	                else if (doubleValue === Infinity) {
	                    return { doubleValue: 'Infinity' };
	                }
	                else if (doubleValue === -Infinity) {
	                    return { doubleValue: '-Infinity' };
	                }
	            }
	            return { doubleValue: val.value() };
	        }
	        else if (val instanceof StringValue) {
	            return { stringValue: val.value() };
	        }
	        else if (val instanceof ObjectValue) {
	            return { mapValue: this.toMapValue(val) };
	        }
	        else if (val instanceof ArrayValue) {
	            return { arrayValue: this.toArrayValue(val) };
	        }
	        else if (val instanceof TimestampValue) {
	            return {
	                timestampValue: this.toTimestamp(val.internalValue)
	            };
	        }
	        else if (val instanceof GeoPointValue) {
	            return {
	                geoPointValue: {
	                    latitude: val.value().latitude,
	                    longitude: val.value().longitude
	                }
	            };
	        }
	        else if (val instanceof BlobValue) {
	            return {
	                bytesValue: this.toBytes(val.value())
	            };
	        }
	        else if (val instanceof RefValue) {
	            return {
	                referenceValue: this.toResourceName(val.databaseId, val.key.path)
	            };
	        }
	        else {
	            return fail('Unknown FieldValue ' + JSON.stringify(val));
	        }
	    };
	    JsonProtoSerializer.prototype.fromValue = function (obj) {
	        var _this = this;
	        // tslint:disable-next-line:no-any
	        var type = obj['value_type'];
	        if (hasTag(obj, type, 'nullValue')) {
	            return NullValue.INSTANCE;
	        }
	        else if (hasTag(obj, type, 'booleanValue')) {
	            return BooleanValue.of(obj.booleanValue);
	        }
	        else if (hasTag(obj, type, 'integerValue')) {
	            return new IntegerValue(parseInt64(obj.integerValue));
	        }
	        else if (hasTag(obj, type, 'doubleValue')) {
	            if (this.options.useProto3Json) {
	                // Proto 3 uses the string values 'NaN' and 'Infinity'.
	                if (obj.doubleValue === 'NaN') {
	                    return DoubleValue.NAN;
	                }
	                else if (obj.doubleValue === 'Infinity') {
	                    return DoubleValue.POSITIVE_INFINITY;
	                }
	                else if (obj.doubleValue === '-Infinity') {
	                    return DoubleValue.NEGATIVE_INFINITY;
	                }
	            }
	            return new DoubleValue(obj.doubleValue);
	        }
	        else if (hasTag(obj, type, 'stringValue')) {
	            return new StringValue(obj.stringValue);
	        }
	        else if (hasTag(obj, type, 'mapValue')) {
	            return this.fromFields(obj.mapValue.fields || {});
	        }
	        else if (hasTag(obj, type, 'arrayValue')) {
	            // "values" is not present if the array is empty
	            assertPresent(obj.arrayValue, 'arrayValue');
	            var values = obj.arrayValue.values || [];
	            return new ArrayValue(values.map(function (v) { return _this.fromValue(v); }));
	        }
	        else if (hasTag(obj, type, 'timestampValue')) {
	            assertPresent(obj.timestampValue, 'timestampValue');
	            return new TimestampValue(this.fromTimestamp(obj.timestampValue));
	        }
	        else if (hasTag(obj, type, 'geoPointValue')) {
	            assertPresent(obj.geoPointValue, 'geoPointValue');
	            var latitude = obj.geoPointValue.latitude || 0;
	            var longitude = obj.geoPointValue.longitude || 0;
	            return new GeoPointValue(new GeoPoint(latitude, longitude));
	        }
	        else if (hasTag(obj, type, 'bytesValue')) {
	            assertPresent(obj.bytesValue, 'bytesValue');
	            var blob = this.fromBlob(obj.bytesValue);
	            return new BlobValue(blob);
	        }
	        else if (hasTag(obj, type, 'referenceValue')) {
	            assertPresent(obj.referenceValue, 'referenceValue');
	            var resourceName = this.fromResourceName(obj.referenceValue);
	            var dbId = new DatabaseId(resourceName.get(1), resourceName.get(3));
	            var key = new DocumentKey(this.extractLocalPathFromResourceName(resourceName));
	            return new RefValue(dbId, key);
	        }
	        else {
	            return fail('Unknown Value proto ' + JSON.stringify(obj));
	        }
	    };
	    /** Creates an api.Document from key and fields (but no create/update time) */
	    JsonProtoSerializer.prototype.toMutationDocument = function (key, fields) {
	        return {
	            name: this.toName(key),
	            fields: this.toFields(fields)
	        };
	    };
	    JsonProtoSerializer.prototype.toDocument = function (document) {
	        assert$1(!document.hasLocalMutations, "Can't serialize documents with mutations.");
	        return {
	            name: this.toName(document.key),
	            fields: this.toFields(document.data),
	            updateTime: this.toTimestamp(document.version.toTimestamp())
	        };
	    };
	    JsonProtoSerializer.prototype.fromDocument = function (document) {
	        return new Document(this.fromName(document.name), this.fromVersion(document.updateTime), this.fromFields(document.fields || {}), { hasLocalMutations: false });
	    };
	    JsonProtoSerializer.prototype.toFields = function (fields) {
	        var _this = this;
	        var result = {};
	        fields.forEach(function (key, value) {
	            result[key] = _this.toValue(value);
	        });
	        return result;
	    };
	    JsonProtoSerializer.prototype.fromFields = function (object) {
	        var _this = this;
	        // Proto map<string, Value> gets mapped to Object, so cast it.
	        var map = object;
	        var result = ObjectValue.EMPTY;
	        forEach$1(map, function (key, value) {
	            result = result.set(new FieldPath([key]), _this.fromValue(value));
	        });
	        return result;
	    };
	    JsonProtoSerializer.prototype.toMapValue = function (map) {
	        return {
	            fields: this.toFields(map)
	        };
	    };
	    JsonProtoSerializer.prototype.toArrayValue = function (array) {
	        var _this = this;
	        var result = [];
	        array.forEach(function (value) {
	            result.push(_this.toValue(value));
	        });
	        return { values: result };
	    };
	    JsonProtoSerializer.prototype.fromFound = function (doc) {
	        assert$1(!!doc.found, 'Tried to deserialize a found document from a missing document.');
	        assertPresent(doc.found.name, 'doc.found.name');
	        assertPresent(doc.found.updateTime, 'doc.found.updateTime');
	        var key = this.fromName(doc.found.name);
	        var version = this.fromVersion(doc.found.updateTime);
	        var fields = this.fromFields(doc.found.fields || {});
	        return new Document(key, version, fields, { hasLocalMutations: false });
	    };
	    JsonProtoSerializer.prototype.fromMissing = function (result) {
	        assert$1(!!result.missing, 'Tried to deserialize a missing document from a found document.');
	        assert$1(!!result.readTime, 'Tried to deserialize a missing document without a read time.');
	        var key = this.fromName(result.missing);
	        var version = this.fromVersion(result.readTime);
	        return new NoDocument(key, version);
	    };
	    JsonProtoSerializer.prototype.fromMaybeDocument = function (result) {
	        // tslint:disable-next-line:no-any
	        var type = result['result'];
	        if (hasTag(result, type, 'found')) {
	            return this.fromFound(result);
	        }
	        else if (hasTag(result, type, 'missing')) {
	            return this.fromMissing(result);
	        }
	        return fail('invalid batch get response: ' + JSON.stringify(result));
	    };
	    JsonProtoSerializer.prototype.toWatchTargetChangeState = function (state) {
	        switch (state) {
	            case WatchTargetChangeState.Added:
	                return 'ADD';
	            case WatchTargetChangeState.Current:
	                return 'CURRENT';
	            case WatchTargetChangeState.NoChange:
	                return 'NO_CHANGE';
	            case WatchTargetChangeState.Removed:
	                return 'REMOVE';
	            case WatchTargetChangeState.Reset:
	                return 'RESET';
	            default:
	                return fail('Unknown WatchTargetChangeState: ' + state);
	        }
	    };
	    JsonProtoSerializer.prototype.toTestWatchChange = function (watchChange) {
	        if (watchChange instanceof ExistenceFilterChange) {
	            return {
	                filter: {
	                    count: watchChange.existenceFilter.count,
	                    targetId: watchChange.targetId
	                }
	            };
	        }
	        if (watchChange instanceof DocumentWatchChange) {
	            if (watchChange.newDoc instanceof Document) {
	                var doc = watchChange.newDoc;
	                return {
	                    documentChange: {
	                        document: {
	                            name: this.toName(doc.key),
	                            fields: this.toFields(doc.data),
	                            updateTime: this.toVersion(doc.version)
	                        },
	                        targetIds: watchChange.updatedTargetIds,
	                        removedTargetIds: watchChange.removedTargetIds
	                    }
	                };
	            }
	            else if (watchChange.newDoc instanceof NoDocument) {
	                var doc = watchChange.newDoc;
	                return {
	                    documentDelete: {
	                        document: this.toName(doc.key),
	                        readTime: this.toVersion(doc.version),
	                        removedTargetIds: watchChange.removedTargetIds
	                    }
	                };
	            }
	            else if (watchChange.newDoc === null) {
	                return {
	                    documentRemove: {
	                        document: this.toName(watchChange.key),
	                        removedTargetIds: watchChange.removedTargetIds
	                    }
	                };
	            }
	        }
	        if (watchChange instanceof WatchTargetChange) {
	            var cause = undefined;
	            if (watchChange.cause) {
	                cause = {
	                    code: mapRpcCodeFromCode(watchChange.cause.code),
	                    message: watchChange.cause.message
	                };
	            }
	            return {
	                targetChange: {
	                    targetChangeType: this.toWatchTargetChangeState(watchChange.state),
	                    targetIds: watchChange.targetIds,
	                    resumeToken: this.unsafeCastProtoByteString(watchChange.resumeToken),
	                    cause: cause
	                }
	            };
	        }
	        return fail('Unrecognized watch change: ' + JSON.stringify(watchChange));
	    };
	    JsonProtoSerializer.prototype.fromWatchChange = function (change) {
	        // tslint:disable-next-line:no-any
	        var type = change['response_type'];
	        var watchChange;
	        if (hasTag(change, type, 'targetChange')) {
	            assertPresent(change.targetChange, 'targetChange');
	            // proto3 default value is unset in JSON (undefined), so use 'NO_CHANGE'
	            // if unset
	            var state = this.fromWatchTargetChangeState(change.targetChange.targetChangeType || 'NO_CHANGE');
	            var targetIds = change.targetChange.targetIds || [];
	            var resumeToken = change.targetChange.resumeToken || this.emptyByteString();
	            var causeProto = change.targetChange.cause;
	            var cause = causeProto && this.fromRpcStatus(causeProto);
	            watchChange = new WatchTargetChange(state, targetIds, resumeToken, cause || null);
	        }
	        else if (hasTag(change, type, 'documentChange')) {
	            assertPresent(change.documentChange, 'documentChange');
	            assertPresent(change.documentChange.document, 'documentChange.name');
	            assertPresent(change.documentChange.document.name, 'documentChange.document.name');
	            assertPresent(change.documentChange.document.updateTime, 'documentChange.document.updateTime');
	            var entityChange = change.documentChange;
	            var key = this.fromName(entityChange.document.name);
	            var version = this.fromVersion(entityChange.document.updateTime);
	            var fields = this.fromFields(entityChange.document.fields || {});
	            var doc = new Document(key, version, fields, {
	                hasLocalMutations: false
	            });
	            var updatedTargetIds = entityChange.targetIds || [];
	            var removedTargetIds = entityChange.removedTargetIds || [];
	            watchChange = new DocumentWatchChange(updatedTargetIds, removedTargetIds, doc.key, doc);
	        }
	        else if (hasTag(change, type, 'documentDelete')) {
	            assertPresent(change.documentDelete, 'documentDelete');
	            assertPresent(change.documentDelete.document, 'documentDelete.document');
	            var docDelete = change.documentDelete;
	            var key = this.fromName(docDelete.document);
	            var version = docDelete.readTime
	                ? this.fromVersion(docDelete.readTime)
	                : SnapshotVersion.forDeletedDoc();
	            var doc = new NoDocument(key, version);
	            var removedTargetIds = docDelete.removedTargetIds || [];
	            watchChange = new DocumentWatchChange([], removedTargetIds, doc.key, doc);
	        }
	        else if (hasTag(change, type, 'documentRemove')) {
	            assertPresent(change.documentRemove, 'documentRemove');
	            assertPresent(change.documentRemove.document, 'documentRemove');
	            var docRemove = change.documentRemove;
	            var key = this.fromName(docRemove.document);
	            var removedTargetIds = docRemove.removedTargetIds || [];
	            watchChange = new DocumentWatchChange([], removedTargetIds, key, null);
	        }
	        else if (hasTag(change, type, 'filter')) {
	            // TODO(dimond): implement existence filter parsing with strategy.
	            assertPresent(change.filter, 'filter');
	            assertPresent(change.filter.targetId, 'filter.targetId');
	            var filter = change.filter;
	            var count = filter.count || 0;
	            var existenceFilter = new ExistenceFilter(count);
	            var targetId = filter.targetId;
	            watchChange = new ExistenceFilterChange(targetId, existenceFilter);
	        }
	        else {
	            return fail('Unknown change type ' + JSON.stringify(change));
	        }
	        return watchChange;
	    };
	    JsonProtoSerializer.prototype.fromWatchTargetChangeState = function (state) {
	        if (state === 'NO_CHANGE') {
	            return WatchTargetChangeState.NoChange;
	        }
	        else if (state === 'ADD') {
	            return WatchTargetChangeState.Added;
	        }
	        else if (state === 'REMOVE') {
	            return WatchTargetChangeState.Removed;
	        }
	        else if (state === 'CURRENT') {
	            return WatchTargetChangeState.Current;
	        }
	        else if (state === 'RESET') {
	            return WatchTargetChangeState.Reset;
	        }
	        else {
	            return fail('Got unexpected TargetChange.state: ' + state);
	        }
	    };
	    JsonProtoSerializer.prototype.versionFromListenResponse = function (change) {
	        // We have only reached a consistent snapshot for the entire stream if there
	        // is a read_time set and it applies to all targets (i.e. the list of
	        // targets is empty). The backend is guaranteed to send such responses.
	        // tslint:disable-next-line:no-any
	        var type = change['response_type'];
	        if (!hasTag(change, type, 'targetChange')) {
	            return SnapshotVersion.MIN;
	        }
	        var targetChange = change.targetChange;
	        if (targetChange.targetIds && targetChange.targetIds.length) {
	            return SnapshotVersion.MIN;
	        }
	        if (!targetChange.readTime) {
	            return SnapshotVersion.MIN;
	        }
	        return this.fromVersion(targetChange.readTime);
	    };
	    JsonProtoSerializer.prototype.toMutation = function (mutation) {
	        var _this = this;
	        var result;
	        if (mutation instanceof SetMutation) {
	            result = {
	                update: this.toMutationDocument(mutation.key, mutation.value)
	            };
	        }
	        else if (mutation instanceof DeleteMutation) {
	            result = { delete: this.toName(mutation.key) };
	        }
	        else if (mutation instanceof PatchMutation) {
	            result = {
	                update: this.toMutationDocument(mutation.key, mutation.data),
	                updateMask: this.toDocumentMask(mutation.fieldMask)
	            };
	        }
	        else if (mutation instanceof TransformMutation) {
	            result = {
	                transform: {
	                    document: this.toName(mutation.key),
	                    fieldTransforms: mutation.fieldTransforms.map(function (transform) {
	                        return _this.toFieldTransform(transform);
	                    })
	                }
	            };
	        }
	        else {
	            return fail('Unknown mutation type ' + mutation.type);
	        }
	        if (!mutation.precondition.isNone) {
	            result.currentDocument = this.toPrecondition(mutation.precondition);
	        }
	        return result;
	    };
	    JsonProtoSerializer.prototype.fromMutation = function (proto) {
	        var _this = this;
	        var precondition = proto.currentDocument
	            ? this.fromPrecondition(proto.currentDocument)
	            : Precondition.NONE;
	        if (proto.update) {
	            assertPresent(proto.update.name, 'name');
	            var key = this.fromName(proto.update.name);
	            var value = this.fromFields(proto.update.fields || {});
	            if (proto.updateMask) {
	                var fieldMask = this.fromDocumentMask(proto.updateMask);
	                return new PatchMutation(key, value, fieldMask, precondition);
	            }
	            else {
	                return new SetMutation(key, value, precondition);
	            }
	        }
	        else if (proto.delete) {
	            var key = this.fromName(proto.delete);
	            return new DeleteMutation(key, precondition);
	        }
	        else if (proto.transform) {
	            var key = this.fromName(proto.transform.document);
	            var fieldTransforms = proto.transform.fieldTransforms.map(function (transform) {
	                return _this.fromFieldTransform(transform);
	            });
	            assert$1(precondition.exists === true, 'Transforms only support precondition "exists == true"');
	            return new TransformMutation(key, fieldTransforms);
	        }
	        else {
	            return fail('unknown mutation proto: ' + JSON.stringify(proto));
	        }
	    };
	    JsonProtoSerializer.prototype.toPrecondition = function (precondition) {
	        assert$1(!precondition.isNone, "Can't serialize an empty precondition");
	        if (precondition.updateTime !== undefined) {
	            return {
	                updateTime: this.toVersion(precondition.updateTime)
	            };
	        }
	        else if (precondition.exists !== undefined) {
	            return { exists: precondition.exists };
	        }
	        else {
	            return fail('Unknown precondition');
	        }
	    };
	    JsonProtoSerializer.prototype.fromPrecondition = function (precondition) {
	        if (precondition.updateTime !== undefined) {
	            return Precondition.updateTime(this.fromVersion(precondition.updateTime));
	        }
	        else if (precondition.exists !== undefined) {
	            return Precondition.exists(precondition.exists);
	        }
	        else {
	            return Precondition.NONE;
	        }
	    };
	    JsonProtoSerializer.prototype.fromWriteResult = function (proto) {
	        var _this = this;
	        // NOTE: Deletes don't have an updateTime.
	        var version = proto.updateTime
	            ? this.fromVersion(proto.updateTime)
	            : null;
	        var transformResults = null;
	        if (proto.transformResults && proto.transformResults.length > 0) {
	            transformResults = proto.transformResults.map(function (result) {
	                return _this.fromValue(result);
	            });
	        }
	        return new MutationResult(version, transformResults);
	    };
	    JsonProtoSerializer.prototype.fromWriteResults = function (protos) {
	        var _this = this;
	        return (protos || []).map(function (proto) { return _this.fromWriteResult(proto); });
	    };
	    JsonProtoSerializer.prototype.toFieldTransform = function (fieldTransform) {
	        var _this = this;
	        var transform = fieldTransform.transform;
	        if (transform instanceof ServerTimestampTransform) {
	            return {
	                fieldPath: fieldTransform.field.canonicalString(),
	                setToServerValue: 'REQUEST_TIME'
	            };
	        }
	        else if (transform instanceof ArrayUnionTransformOperation) {
	            return {
	                fieldPath: fieldTransform.field.canonicalString(),
	                appendMissingElements: {
	                    values: transform.elements.map(function (v) { return _this.toValue(v); })
	                }
	            };
	        }
	        else if (transform instanceof ArrayRemoveTransformOperation) {
	            return {
	                fieldPath: fieldTransform.field.canonicalString(),
	                removeAllFromArray: {
	                    values: transform.elements.map(function (v) { return _this.toValue(v); })
	                }
	            };
	        }
	        else {
	            fail('Unknown transform: ' + fieldTransform.transform);
	        }
	    };
	    JsonProtoSerializer.prototype.fromFieldTransform = function (proto) {
	        var _this = this;
	        // tslint:disable-next-line:no-any We need to match generated Proto types.
	        var type = proto['transform_type'];
	        var transform = null;
	        if (hasTag(proto, type, 'setToServerValue')) {
	            assert$1(proto.setToServerValue === 'REQUEST_TIME', 'Unknown server value transform proto: ' + JSON.stringify(proto));
	            transform = ServerTimestampTransform.instance;
	        }
	        else if (hasTag(proto, type, 'appendMissingElements')) {
	            var values = proto.appendMissingElements.values || [];
	            transform = new ArrayUnionTransformOperation(values.map(function (v) { return _this.fromValue(v); }));
	        }
	        else if (hasTag(proto, type, 'removeAllFromArray')) {
	            var values = proto.removeAllFromArray.values || [];
	            transform = new ArrayRemoveTransformOperation(values.map(function (v) { return _this.fromValue(v); }));
	        }
	        else {
	            fail('Unknown transform proto: ' + JSON.stringify(proto));
	        }
	        var fieldPath = FieldPath.fromServerFormat(proto.fieldPath);
	        return new FieldTransform(fieldPath, transform);
	    };
	    JsonProtoSerializer.prototype.toDocumentsTarget = function (query) {
	        return { documents: [this.toQueryPath(query.path)] };
	    };
	    JsonProtoSerializer.prototype.fromDocumentsTarget = function (documentsTarget) {
	        var count = documentsTarget.documents.length;
	        assert$1(count === 1, 'DocumentsTarget contained other than 1 document: ' + count);
	        var name = documentsTarget.documents[0];
	        return Query.atPath(this.fromQueryPath(name));
	    };
	    JsonProtoSerializer.prototype.toQueryTarget = function (query) {
	        // Dissect the path into parent, collectionId, and optional key filter.
	        var result = { structuredQuery: {} };
	        if (query.path.isEmpty()) {
	            result.parent = this.toQueryPath(ResourcePath.EMPTY_PATH);
	        }
	        else {
	            var path = query.path;
	            assert$1(path.length % 2 !== 0, 'Document queries with filters are not supported.');
	            result.parent = this.toQueryPath(path.popLast());
	            result.structuredQuery.from = [{ collectionId: path.lastSegment() }];
	        }
	        var where = this.toFilter(query.filters);
	        if (where) {
	            result.structuredQuery.where = where;
	        }
	        var orderBy = this.toOrder(query.orderBy);
	        if (orderBy) {
	            result.structuredQuery.orderBy = orderBy;
	        }
	        var limit = this.toInt32Value(query.limit);
	        if (limit !== undefined) {
	            result.structuredQuery.limit = limit;
	        }
	        if (query.startAt) {
	            result.structuredQuery.startAt = this.toCursor(query.startAt);
	        }
	        if (query.endAt) {
	            result.structuredQuery.endAt = this.toCursor(query.endAt);
	        }
	        return result;
	    };
	    JsonProtoSerializer.prototype.fromQueryTarget = function (target) {
	        var path = this.fromQueryPath(target.parent);
	        var query = target.structuredQuery;
	        var fromCount = query.from ? query.from.length : 0;
	        if (fromCount > 0) {
	            assert$1(fromCount === 1, 'StructuredQuery.from with more than one collection is not supported.');
	            var from = query.from[0];
	            path = path.child(from.collectionId);
	        }
	        var filterBy = [];
	        if (query.where) {
	            filterBy = this.fromFilter(query.where);
	        }
	        var orderBy = [];
	        if (query.orderBy) {
	            orderBy = this.fromOrder(query.orderBy);
	        }
	        var limit = null;
	        if (query.limit) {
	            limit = this.fromInt32Value(query.limit);
	        }
	        var startAt = null;
	        if (query.startAt) {
	            startAt = this.fromCursor(query.startAt);
	        }
	        var endAt = null;
	        if (query.endAt) {
	            endAt = this.fromCursor(query.endAt);
	        }
	        return new Query(path, orderBy, filterBy, limit, startAt, endAt);
	    };
	    JsonProtoSerializer.prototype.toListenRequestLabels = function (queryData) {
	        var value = this.toLabel(queryData.purpose);
	        if (value == null) {
	            return null;
	        }
	        else {
	            return {
	                'goog-listen-tags': value
	            };
	        }
	    };
	    JsonProtoSerializer.prototype.toLabel = function (purpose) {
	        switch (purpose) {
	            case QueryPurpose.Listen:
	                return null;
	            case QueryPurpose.ExistenceFilterMismatch:
	                return 'existence-filter-mismatch';
	            case QueryPurpose.LimboResolution:
	                return 'limbo-document';
	            default:
	                return fail('Unrecognized query purpose: ' + purpose);
	        }
	    };
	    JsonProtoSerializer.prototype.toTarget = function (queryData) {
	        var result;
	        var query = queryData.query;
	        if (query.isDocumentQuery()) {
	            result = { documents: this.toDocumentsTarget(query) };
	        }
	        else {
	            result = { query: this.toQueryTarget(query) };
	        }
	        result.targetId = queryData.targetId;
	        if (queryData.resumeToken.length > 0) {
	            result.resumeToken = this.unsafeCastProtoByteString(queryData.resumeToken);
	        }
	        return result;
	    };
	    JsonProtoSerializer.prototype.toFilter = function (filters) {
	        var _this = this;
	        if (filters.length === 0)
	            { return; }
	        var protos = filters.map(function (filter) {
	            return filter instanceof RelationFilter
	                ? _this.toRelationFilter(filter)
	                : _this.toUnaryFilter(filter);
	        });
	        if (protos.length === 1) {
	            return protos[0];
	        }
	        return { compositeFilter: { op: 'AND', filters: protos } };
	    };
	    JsonProtoSerializer.prototype.fromFilter = function (filter) {
	        var _this = this;
	        if (!filter) {
	            return [];
	        }
	        else if (filter.unaryFilter !== undefined) {
	            return [this.fromUnaryFilter(filter)];
	        }
	        else if (filter.fieldFilter !== undefined) {
	            return [this.fromRelationFilter(filter)];
	        }
	        else if (filter.compositeFilter !== undefined) {
	            return filter.compositeFilter
	                .filters.map(function (f) { return _this.fromFilter(f); })
	                .reduce(function (accum, current) { return accum.concat(current); });
	        }
	        else {
	            return fail('Unknown filter: ' + JSON.stringify(filter));
	        }
	    };
	    JsonProtoSerializer.prototype.toOrder = function (orderBys) {
	        var _this = this;
	        if (orderBys.length === 0)
	            { return; }
	        return orderBys.map(function (order) { return _this.toPropertyOrder(order); });
	    };
	    JsonProtoSerializer.prototype.fromOrder = function (orderBys) {
	        var _this = this;
	        return orderBys.map(function (order) { return _this.fromPropertyOrder(order); });
	    };
	    JsonProtoSerializer.prototype.toCursor = function (cursor) {
	        var _this = this;
	        return {
	            before: cursor.before,
	            values: cursor.position.map(function (component) { return _this.toValue(component); })
	        };
	    };
	    JsonProtoSerializer.prototype.fromCursor = function (cursor) {
	        var _this = this;
	        var before = !!cursor.before;
	        var position = cursor.values.map(function (component) { return _this.fromValue(component); });
	        return new Bound(position, before);
	    };
	    // visible for testing
	    JsonProtoSerializer.prototype.toDirection = function (dir) {
	        return DIRECTIONS[dir.name];
	    };
	    // visible for testing
	    JsonProtoSerializer.prototype.fromDirection = function (dir) {
	        switch (dir) {
	            case 'ASCENDING':
	                return Direction.ASCENDING;
	            case 'DESCENDING':
	                return Direction.DESCENDING;
	            default:
	                return undefined;
	        }
	    };
	    // visible for testing
	    JsonProtoSerializer.prototype.toOperatorName = function (op) {
	        return OPERATORS[op.name];
	    };
	    JsonProtoSerializer.prototype.fromOperatorName = function (op) {
	        switch (op) {
	            case 'EQUAL':
	                return RelationOp.EQUAL;
	            case 'GREATER_THAN':
	                return RelationOp.GREATER_THAN;
	            case 'GREATER_THAN_OR_EQUAL':
	                return RelationOp.GREATER_THAN_OR_EQUAL;
	            case 'LESS_THAN':
	                return RelationOp.LESS_THAN;
	            case 'LESS_THAN_OR_EQUAL':
	                return RelationOp.LESS_THAN_OR_EQUAL;
	            case 'ARRAY_CONTAINS':
	                return RelationOp.ARRAY_CONTAINS;
	            case 'OPERATOR_UNSPECIFIED':
	                return fail('Unspecified relation');
	            default:
	                return fail('Unknown relation');
	        }
	    };
	    JsonProtoSerializer.prototype.toFieldPathReference = function (path) {
	        return { fieldPath: path.canonicalString() };
	    };
	    JsonProtoSerializer.prototype.fromFieldPathReference = function (fieldReference) {
	        return FieldPath.fromServerFormat(fieldReference.fieldPath);
	    };
	    // visible for testing
	    JsonProtoSerializer.prototype.toPropertyOrder = function (orderBy) {
	        return {
	            field: this.toFieldPathReference(orderBy.field),
	            direction: this.toDirection(orderBy.dir)
	        };
	    };
	    JsonProtoSerializer.prototype.fromPropertyOrder = function (orderBy) {
	        return new OrderBy(this.fromFieldPathReference(orderBy.field), this.fromDirection(orderBy.direction));
	    };
	    // visible for testing
	    JsonProtoSerializer.prototype.toRelationFilter = function (filter) {
	        if (filter instanceof RelationFilter) {
	            return {
	                fieldFilter: {
	                    field: this.toFieldPathReference(filter.field),
	                    op: this.toOperatorName(filter.op),
	                    value: this.toValue(filter.value)
	                }
	            };
	        }
	        else {
	            return fail('Unrecognized filter: ' + JSON.stringify(filter));
	        }
	    };
	    JsonProtoSerializer.prototype.fromRelationFilter = function (filter) {
	        return new RelationFilter(this.fromFieldPathReference(filter.fieldFilter.field), this.fromOperatorName(filter.fieldFilter.op), this.fromValue(filter.fieldFilter.value));
	    };
	    // visible for testing
	    JsonProtoSerializer.prototype.toUnaryFilter = function (filter) {
	        if (filter instanceof NanFilter) {
	            return {
	                unaryFilter: {
	                    field: this.toFieldPathReference(filter.field),
	                    op: 'IS_NAN'
	                }
	            };
	        }
	        else if (filter instanceof NullFilter) {
	            return {
	                unaryFilter: {
	                    field: this.toFieldPathReference(filter.field),
	                    op: 'IS_NULL'
	                }
	            };
	        }
	        else {
	            return fail('Unrecognized filter: ' + JSON.stringify(filter));
	        }
	    };
	    JsonProtoSerializer.prototype.fromUnaryFilter = function (filter) {
	        switch (filter.unaryFilter.op) {
	            case 'IS_NAN':
	                var nanField = this.fromFieldPathReference(filter.unaryFilter.field);
	                return new NanFilter(nanField);
	            case 'IS_NULL':
	                var nullField = this.fromFieldPathReference(filter.unaryFilter.field);
	                return new NullFilter(nullField);
	            case 'OPERATOR_UNSPECIFIED':
	                return fail('Unspecified filter');
	            default:
	                return fail('Unknown filter');
	        }
	    };
	    JsonProtoSerializer.prototype.toDocumentMask = function (fieldMask) {
	        return {
	            fieldPaths: fieldMask.fields.map(function (field) { return field.canonicalString(); })
	        };
	    };
	    JsonProtoSerializer.prototype.fromDocumentMask = function (proto) {
	        var paths = proto.fieldPaths || [];
	        var fields = paths.map(function (path) { return FieldPath.fromServerFormat(path); });
	        return new FieldMask(fields);
	    };
	    return JsonProtoSerializer;
	}());
	/**
	 * Checks for a specific oneof tag in a protocol buffer message.
	 *
	 * This intentionally accommodates two distinct cases:
	 *
	 * 1) Messages containing a type tag: these are the format produced by GRPC in
	 * return values. These may contain default-value mappings for all tags in the
	 * oneof but the type tag specifies which one was actually set.
	 *
	 * 2) Messages that don't contain a type tag: these are the format required by
	 * GRPC as inputs. If we emitted objects with type tags, ProtoBuf.js would
	 * choke claiming that the tags aren't fields in the Message.
	 *
	 * Allowing both formats here makes the serializer able to consume the outputs
	 * it produces: for all messages it supports, fromX(toX(value)) == value.
	 *
	 * Note that case 2 suffers from ambiguity: if multiple tags are present
	 * without a type tag then the callers are structured in such a way that the
	 * first invocation will win. Since we only parse in this mode when parsing
	 * the output of a serialize method this works, but it's not a general
	 * solution.
	 *
	 * Unfortunately there is no general solution here because proto3 makes it
	 * impossible to distinguish unset from explicitly set fields: both have the
	 * default value for the type. Without the type tag but multiple value tags
	 * it's possible to have default values for each tag in the oneof and not be
	 * able to know which was actually in effect.
	 */
	function hasTag(obj, type, tag) {
	    return type === tag || (!type && tag in obj);
	}

	/**
	 * Detect React Native.
	 *
	 * @return {boolean} True if ReactNative environment is detected.
	 */
	var isReactNative$1 = function () {
	    return (typeof navigator === 'object' && navigator['product'] === 'ReactNative');
	};

	var ERROR_NAME$1 = 'FirebaseError';
	var captureStackTrace$1 = Error
	    .captureStackTrace;
	var FirebaseError$1 = /** @class */ (function () {
	    function FirebaseError(code, message) {
	        this.code = code;
	        this.message = message;
	        // We want the stack value, if implemented by Error
	        if (captureStackTrace$1) {
	            // Patches this.stack, omitted calls above ErrorFactory#create
	            captureStackTrace$1(this, ErrorFactory$1.prototype.create);
	        }
	        else {
	            try {
	                // In case of IE11, stack will be set only after error is raised.
	                // https://docs.microsoft.com/en-us/scripting/javascript/reference/stack-property-error-javascript
	                throw Error.apply(this, arguments);
	            }
	            catch (err) {
	                this.name = ERROR_NAME$1;
	                // Make non-enumerable getter for the property.
	                Object.defineProperty(this, 'stack', {
	                    get: function () {
	                        return err.stack;
	                    }
	                });
	            }
	        }
	    }
	    return FirebaseError;
	}());
	// Back-door inheritance
	FirebaseError$1.prototype = Object.create(Error.prototype);
	FirebaseError$1.prototype.constructor = FirebaseError$1;
	FirebaseError$1.prototype.name = ERROR_NAME$1;
	var ErrorFactory$1 = /** @class */ (function () {
	    function ErrorFactory(service, serviceName, errors) {
	        this.service = service;
	        this.serviceName = serviceName;
	        this.errors = errors;
	        // Matches {$name}, by default.
	        this.pattern = /\{\$([^}]+)}/g;
	        // empty
	    }
	    ErrorFactory.prototype.create = function (code, data) {
	        if (data === undefined) {
	            data = {};
	        }
	        var template = this.errors[code];
	        var fullCode = this.service + '/' + code;
	        var message;
	        if (template === undefined) {
	            message = 'Error';
	        }
	        else {
	            message = template.replace(this.pattern, function (match, key) {
	                var value = data[key];
	                return value !== undefined ? value.toString() : '<' + key + '?>';
	            });
	        }
	        // Service: Error message (service/code).
	        message = this.serviceName + ': ' + message + ' (' + fullCode + ').';
	        var err = new FirebaseError$1(fullCode, message);
	        // Populate the Error object with message parts for programmatic
	        // accesses (e.g., e.file).
	        for (var prop in data) {
	            if (!data.hasOwnProperty(prop) || prop.slice(-1) === '_') {
	                continue;
	            }
	            err[prop] = data[prop];
	        }
	        return err;
	    };
	    return ErrorFactory;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	// Copyright 2011 The Closure Library Authors. All Rights Reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//      http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS-IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	/**
	 * @fileoverview Abstract cryptographic hash interface.
	 *
	 * See Sha1 and Md5 for sample implementations.
	 *
	 */
	/**
	 * Create a cryptographic hash instance.
	 *
	 * @constructor
	 * @struct
	 */
	var Hash$1 = /** @class */ (function () {
	    function Hash() {
	        /**
	         * The block size for the hasher.
	         * @type {number}
	         */
	        this.blockSize = -1;
	    }
	    return Hash;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * @fileoverview SHA-1 cryptographic hash.
	 * Variable names follow the notation in FIPS PUB 180-3:
	 * http://csrc.nist.gov/publications/fips/fips180-3/fips180-3_final.pdf.
	 *
	 * Usage:
	 *   var sha1 = new sha1();
	 *   sha1.update(bytes);
	 *   var hash = sha1.digest();
	 *
	 * Performance:
	 *   Chrome 23:   ~400 Mbit/s
	 *   Firefox 16:  ~250 Mbit/s
	 *
	 */
	/**
	 * SHA-1 cryptographic hash constructor.
	 *
	 * The properties declared here are discussed in the above algorithm document.
	 * @constructor
	 * @extends {Hash}
	 * @final
	 * @struct
	 */
	var Sha1$1 = /** @class */ (function (_super) {
	    __extends(Sha1, _super);
	    function Sha1() {
	        var _this = _super.call(this) || this;
	        /**
	         * Holds the previous values of accumulated variables a-e in the compress_
	         * function.
	         * @type {!Array<number>}
	         * @private
	         */
	        _this.chain_ = [];
	        /**
	         * A buffer holding the partially computed hash result.
	         * @type {!Array<number>}
	         * @private
	         */
	        _this.buf_ = [];
	        /**
	         * An array of 80 bytes, each a part of the message to be hashed.  Referred to
	         * as the message schedule in the docs.
	         * @type {!Array<number>}
	         * @private
	         */
	        _this.W_ = [];
	        /**
	         * Contains data needed to pad messages less than 64 bytes.
	         * @type {!Array<number>}
	         * @private
	         */
	        _this.pad_ = [];
	        /**
	         * @private {number}
	         */
	        _this.inbuf_ = 0;
	        /**
	         * @private {number}
	         */
	        _this.total_ = 0;
	        _this.blockSize = 512 / 8;
	        _this.pad_[0] = 128;
	        for (var i = 1; i < _this.blockSize; ++i) {
	            _this.pad_[i] = 0;
	        }
	        _this.reset();
	        return _this;
	    }
	    Sha1.prototype.reset = function () {
	        this.chain_[0] = 0x67452301;
	        this.chain_[1] = 0xefcdab89;
	        this.chain_[2] = 0x98badcfe;
	        this.chain_[3] = 0x10325476;
	        this.chain_[4] = 0xc3d2e1f0;
	        this.inbuf_ = 0;
	        this.total_ = 0;
	    };
	    /**
	     * Internal compress helper function.
	     * @param {!Array<number>|!Uint8Array|string} buf Block to compress.
	     * @param {number=} opt_offset Offset of the block in the buffer.
	     * @private
	     */
	    Sha1.prototype.compress_ = function (buf, opt_offset) {
	        if (!opt_offset) {
	            opt_offset = 0;
	        }
	        var W = this.W_;
	        // get 16 big endian words
	        if (typeof buf === 'string') {
	            for (var i = 0; i < 16; i++) {
	                // TODO(user): [bug 8140122] Recent versions of Safari for Mac OS and iOS
	                // have a bug that turns the post-increment ++ operator into pre-increment
	                // during JIT compilation.  We have code that depends heavily on SHA-1 for
	                // correctness and which is affected by this bug, so I've removed all uses
	                // of post-increment ++ in which the result value is used.  We can revert
	                // this change once the Safari bug
	                // (https://bugs.webkit.org/show_bug.cgi?id=109036) has been fixed and
	                // most clients have been updated.
	                W[i] =
	                    (buf.charCodeAt(opt_offset) << 24) |
	                        (buf.charCodeAt(opt_offset + 1) << 16) |
	                        (buf.charCodeAt(opt_offset + 2) << 8) |
	                        buf.charCodeAt(opt_offset + 3);
	                opt_offset += 4;
	            }
	        }
	        else {
	            for (var i = 0; i < 16; i++) {
	                W[i] =
	                    (buf[opt_offset] << 24) |
	                        (buf[opt_offset + 1] << 16) |
	                        (buf[opt_offset + 2] << 8) |
	                        buf[opt_offset + 3];
	                opt_offset += 4;
	            }
	        }
	        // expand to 80 words
	        for (var i = 16; i < 80; i++) {
	            var t = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
	            W[i] = ((t << 1) | (t >>> 31)) & 0xffffffff;
	        }
	        var a = this.chain_[0];
	        var b = this.chain_[1];
	        var c = this.chain_[2];
	        var d = this.chain_[3];
	        var e = this.chain_[4];
	        var f, k;
	        // TODO(user): Try to unroll this loop to speed up the computation.
	        for (var i = 0; i < 80; i++) {
	            if (i < 40) {
	                if (i < 20) {
	                    f = d ^ (b & (c ^ d));
	                    k = 0x5a827999;
	                }
	                else {
	                    f = b ^ c ^ d;
	                    k = 0x6ed9eba1;
	                }
	            }
	            else {
	                if (i < 60) {
	                    f = (b & c) | (d & (b | c));
	                    k = 0x8f1bbcdc;
	                }
	                else {
	                    f = b ^ c ^ d;
	                    k = 0xca62c1d6;
	                }
	            }
	            var t = (((a << 5) | (a >>> 27)) + f + e + k + W[i]) & 0xffffffff;
	            e = d;
	            d = c;
	            c = ((b << 30) | (b >>> 2)) & 0xffffffff;
	            b = a;
	            a = t;
	        }
	        this.chain_[0] = (this.chain_[0] + a) & 0xffffffff;
	        this.chain_[1] = (this.chain_[1] + b) & 0xffffffff;
	        this.chain_[2] = (this.chain_[2] + c) & 0xffffffff;
	        this.chain_[3] = (this.chain_[3] + d) & 0xffffffff;
	        this.chain_[4] = (this.chain_[4] + e) & 0xffffffff;
	    };
	    Sha1.prototype.update = function (bytes, opt_length) {
	        var this$1 = this;

	        // TODO(johnlenz): tighten the function signature and remove this check
	        if (bytes == null) {
	            return;
	        }
	        if (opt_length === undefined) {
	            opt_length = bytes.length;
	        }
	        var lengthMinusBlock = opt_length - this.blockSize;
	        var n = 0;
	        // Using local instead of member variables gives ~5% speedup on Firefox 16.
	        var buf = this.buf_;
	        var inbuf = this.inbuf_;
	        // The outer while loop should execute at most twice.
	        while (n < opt_length) {
	            // When we have no data in the block to top up, we can directly process the
	            // input buffer (assuming it contains sufficient data). This gives ~25%
	            // speedup on Chrome 23 and ~15% speedup on Firefox 16, but requires that
	            // the data is provided in large chunks (or in multiples of 64 bytes).
	            if (inbuf == 0) {
	                while (n <= lengthMinusBlock) {
	                    this$1.compress_(bytes, n);
	                    n += this$1.blockSize;
	                }
	            }
	            if (typeof bytes === 'string') {
	                while (n < opt_length) {
	                    buf[inbuf] = bytes.charCodeAt(n);
	                    ++inbuf;
	                    ++n;
	                    if (inbuf == this$1.blockSize) {
	                        this$1.compress_(buf);
	                        inbuf = 0;
	                        // Jump to the outer loop so we use the full-block optimization.
	                        break;
	                    }
	                }
	            }
	            else {
	                while (n < opt_length) {
	                    buf[inbuf] = bytes[n];
	                    ++inbuf;
	                    ++n;
	                    if (inbuf == this$1.blockSize) {
	                        this$1.compress_(buf);
	                        inbuf = 0;
	                        // Jump to the outer loop so we use the full-block optimization.
	                        break;
	                    }
	                }
	            }
	        }
	        this.inbuf_ = inbuf;
	        this.total_ += opt_length;
	    };
	    /** @override */
	    Sha1.prototype.digest = function () {
	        var this$1 = this;

	        var digest = [];
	        var totalBits = this.total_ * 8;
	        // Add pad 0x80 0x00*.
	        if (this.inbuf_ < 56) {
	            this.update(this.pad_, 56 - this.inbuf_);
	        }
	        else {
	            this.update(this.pad_, this.blockSize - (this.inbuf_ - 56));
	        }
	        // Add # bits.
	        for (var i = this.blockSize - 1; i >= 56; i--) {
	            this$1.buf_[i] = totalBits & 255;
	            totalBits /= 256; // Don't use bit-shifting here!
	        }
	        this.compress_(this.buf_);
	        var n = 0;
	        for (var i = 0; i < 5; i++) {
	            for (var j = 24; j >= 0; j -= 8) {
	                digest[n] = (this$1.chain_[i] >> j) & 255;
	                ++n;
	            }
	        }
	        return digest;
	    };
	    return Sha1;
	}(Hash$1));

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Provides a simple helper class that implements the Stream interface to
	 * bridge to other implementations that are streams but do not implement the
	 * interface. The stream callbacks are invoked with the callOn... methods.
	 */
	var StreamBridge = /** @class */ (function () {
	    function StreamBridge(args) {
	        this.sendFn = args.sendFn;
	        this.closeFn = args.closeFn;
	    }
	    StreamBridge.prototype.onOpen = function (callback) {
	        assert$1(!this.wrappedOnOpen, 'Called onOpen on stream twice!');
	        this.wrappedOnOpen = callback;
	    };
	    StreamBridge.prototype.onClose = function (callback) {
	        assert$1(!this.wrappedOnClose, 'Called onClose on stream twice!');
	        this.wrappedOnClose = callback;
	    };
	    StreamBridge.prototype.onMessage = function (callback) {
	        assert$1(!this.wrappedOnMessage, 'Called onMessage on stream twice!');
	        this.wrappedOnMessage = callback;
	    };
	    StreamBridge.prototype.close = function () {
	        this.closeFn();
	    };
	    StreamBridge.prototype.send = function (msg) {
	        this.sendFn(msg);
	    };
	    StreamBridge.prototype.callOnOpen = function () {
	        assert$1(this.wrappedOnOpen !== undefined, 'Cannot call onOpen because no callback was set');
	        this.wrappedOnOpen();
	    };
	    StreamBridge.prototype.callOnClose = function (err) {
	        assert$1(this.wrappedOnClose !== undefined, 'Cannot call onClose because no callback was set');
	        this.wrappedOnClose(err);
	    };
	    StreamBridge.prototype.callOnMessage = function (msg) {
	        assert$1(this.wrappedOnMessage !== undefined, 'Cannot call onMessage because no callback was set');
	        this.wrappedOnMessage(msg);
	    };
	    return StreamBridge;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG = 'Connection';
	var RPC_STREAM_SERVICE = 'google.firestore.v1beta1.Firestore';
	var RPC_URL_VERSION = 'v1beta1';
	/** Maps RPC names to the corresponding REST endpoint name. */
	var RPC_NAME_REST_MAPPING = {
	    BatchGetDocuments: 'batchGet',
	    Commit: 'commit'
	};
	// TODO(b/38203344): The SDK_VERSION is set independently from Firebase because
	// we are doing out-of-band releases. Once we release as part of Firebase, we
	// should use the Firebase version instead.
	var X_GOOG_API_CLIENT_VALUE = 'gl-js/ fire/' + SDK_VERSION;
	var XHR_TIMEOUT_SECS = 15;
	var WebChannelConnection = /** @class */ (function () {
	    function WebChannelConnection(info) {
	        this.databaseId = info.databaseId;
	        this.pool = new dist_5();
	        var proto = info.ssl ? 'https' : 'http';
	        this.baseUrl = proto + '://' + info.host;
	    }
	    /**
	     * Modifies the headers for a request, adding any authorization token if
	     * present and any additional headers for the request.
	     */
	    WebChannelConnection.prototype.modifyHeadersForRequest = function (headers, token) {
	        if (token) {
	            for (var header in token.authHeaders) {
	                if (token.authHeaders.hasOwnProperty(header)) {
	                    headers[header] = token.authHeaders[header];
	                }
	            }
	        }
	        headers['X-Goog-Api-Client'] = X_GOOG_API_CLIENT_VALUE;
	    };
	    WebChannelConnection.prototype.invokeRPC = function (rpcName, request, token) {
	        var _this = this;
	        var url = this.makeUrl(rpcName);
	        return new Promise(function (resolve, reject) {
	            // tslint:disable-next-line:no-any XhrIoPool doesn't have TS typings.
	            _this.pool.getObject(function (xhr) {
	                xhr.listenOnce(dist_3.COMPLETE, function () {
	                    try {
	                        switch (xhr.getLastErrorCode()) {
	                            case dist_2.NO_ERROR:
	                                var json = xhr.getResponseJson();
	                                debug(LOG_TAG, 'XHR received:', JSON.stringify(json));
	                                resolve(json);
	                                break;
	                            case dist_2.TIMEOUT:
	                                debug(LOG_TAG, 'RPC "' + rpcName + '" timed out');
	                                reject(new FirestoreError(Code.DEADLINE_EXCEEDED, 'Request time out'));
	                                break;
	                            case dist_2.HTTP_ERROR:
	                                var status_1 = xhr.getStatus();
	                                debug(LOG_TAG, 'RPC "' + rpcName + '" failed with status:', status_1, 'response text:', xhr.getResponseText());
	                                if (status_1 > 0) {
	                                    reject(new FirestoreError(mapCodeFromHttpStatus(status_1), 'Server responded with status ' + xhr.getStatusText()));
	                                }
	                                else {
	                                    // If we received an HTTP_ERROR but there's no status code,
	                                    // it's most probably a connection issue
	                                    debug(LOG_TAG, 'RPC "' + rpcName + '" failed');
	                                    reject(new FirestoreError(Code.UNAVAILABLE, 'Connection failed.'));
	                                }
	                                break;
	                            default:
	                                fail('RPC "' +
	                                    rpcName +
	                                    '" failed with unanticipated ' +
	                                    'webchannel error ' +
	                                    xhr.getLastErrorCode() +
	                                    ': ' +
	                                    xhr.getLastError() +
	                                    ', giving up.');
	                        }
	                    }
	                    finally {
	                        debug(LOG_TAG, 'RPC "' + rpcName + '" completed.');
	                        _this.pool.releaseObject(xhr);
	                    }
	                });
	                var requestString = JSON.stringify(request);
	                debug(LOG_TAG, 'XHR sending: ', url + ' ' + requestString);
	                // Content-Type: text/plain will avoid preflight requests which might
	                // mess with CORS and redirects by proxies. If we add custom headers
	                // we will need to change this code to potentially use the
	                // $httpOverwrite parameter supported by ESF to avoid
	                // triggering preflight requests.
	                var headers = { 'Content-Type': 'text/plain' };
	                _this.modifyHeadersForRequest(headers, token);
	                xhr.send(url, 'POST', requestString, headers, XHR_TIMEOUT_SECS);
	            });
	        });
	    };
	    WebChannelConnection.prototype.invokeStreamingRPC = function (rpcName, request, token) {
	        // The REST API automatically aggregates all of the streamed results, so we
	        // can just use the normal invoke() method.
	        return this.invokeRPC(rpcName, request, token);
	    };
	    WebChannelConnection.prototype.openStream = function (rpcName, token) {
	        var urlParts = [
	            this.baseUrl,
	            '/',
	            RPC_STREAM_SERVICE,
	            '/',
	            rpcName,
	            '/channel'
	        ];
	        var webchannelTransport = dist_1();
	        var request = {
	            // Background channel test avoids the initial two test calls and decreases
	            // initial cold start time.
	            // TODO(dimond): wenboz@ mentioned this might affect use with proxies and
	            // we should monitor closely for any reports.
	            backgroundChannelTest: true,
	            // Required for backend stickiness, routing behavior is based on this
	            // parameter.
	            httpSessionIdParam: 'gsessionid',
	            initMessageHeaders: {},
	            messageUrlParams: {
	                // This param is used to improve routing and project isolation by the
	                // backend and must be included in every request.
	                database: "projects/" + this.databaseId.projectId + "/databases/" + this.databaseId.database
	            },
	            sendRawJson: true,
	            supportsCrossDomainXhr: true
	        };
	        this.modifyHeadersForRequest(request.initMessageHeaders, token);
	        // Sending the custom headers we just added to request.initMessageHeaders
	        // (Authorization, etc.) will trigger the browser to make a CORS preflight
	        // request because the XHR will no longer meet the criteria for a "simple"
	        // CORS request:
	        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
	        //
	        // Therefore to avoid the CORS preflight request (an extra network
	        // roundtrip), we use the httpHeadersOverwriteParam option to specify that
	        // the headers should instead be encoded into a special "$httpHeaders" query
	        // parameter, which is recognized by the webchannel backend. This is
	        // formally defined here:
	        // https://github.com/google/closure-library/blob/b0e1815b13fb92a46d7c9b3c30de5d6a396a3245/closure/goog/net/rpc/httpcors.js#L32
	        //
	        // But for some unclear reason (see
	        // https://github.com/firebase/firebase-js-sdk/issues/703), this breaks
	        // ReactNative and so we exclude it, which just means ReactNative may be
	        // subject to the extra network roundtrip for CORS preflight.
	        if (!isReactNative$1()) {
	            request['httpHeadersOverwriteParam'] = '$httpHeaders';
	        }
	        var url = urlParts.join('');
	        debug(LOG_TAG, 'Creating WebChannel: ' + url + ' ' + request);
	        // tslint:disable-next-line:no-any Because listen isn't defined on it.
	        var channel = webchannelTransport.createWebChannel(url, request);
	        // WebChannel supports sending the first message with the handshake - saving
	        // a network round trip. However, it will have to call send in the same
	        // JS event loop as open. In order to enforce this, we delay actually
	        // opening the WebChannel until send is called. Whether we have called
	        // open is tracked with this variable.
	        var opened = false;
	        // A flag to determine whether the stream was closed (by us or through an
	        // error/close event) to avoid delivering multiple close events or sending
	        // on a closed stream
	        var closed = false;
	        var streamBridge = new StreamBridge({
	            sendFn: function (msg) {
	                if (!closed) {
	                    if (!opened) {
	                        debug(LOG_TAG, 'Opening WebChannel transport.');
	                        channel.open();
	                        opened = true;
	                    }
	                    debug(LOG_TAG, 'WebChannel sending:', msg);
	                    channel.send(msg);
	                }
	                else {
	                    debug(LOG_TAG, 'Not sending because WebChannel is closed:', msg);
	                }
	            },
	            closeFn: function () { return channel.close(); }
	        });
	        // Closure events are guarded and exceptions are swallowed, so catch any
	        // exception and rethrow using a setTimeout so they become visible again.
	        // Note that eventually this function could go away if we are confident
	        // enough the code is exception free.
	        var unguardedEventListen = function (type, fn) {
	            // TODO(dimond): closure typing seems broken because WebChannel does
	            // not implement goog.events.Listenable
	            channel.listen(type, function (param) {
	                try {
	                    fn(param);
	                }
	                catch (e) {
	                    setTimeout(function () {
	                        throw e;
	                    }, 0);
	                }
	            });
	        };
	        unguardedEventListen(dist_4.EventType.OPEN, function () {
	            if (!closed) {
	                debug(LOG_TAG, 'WebChannel transport opened.');
	            }
	        });
	        unguardedEventListen(dist_4.EventType.CLOSE, function () {
	            if (!closed) {
	                closed = true;
	                debug(LOG_TAG, 'WebChannel transport closed');
	                streamBridge.callOnClose();
	            }
	        });
	        unguardedEventListen(dist_4.EventType.ERROR, function (err) {
	            if (!closed) {
	                closed = true;
	                debug(LOG_TAG, 'WebChannel transport errored:', err);
	                streamBridge.callOnClose(new FirestoreError(Code.UNAVAILABLE, 'The operation could not be completed'));
	            }
	        });
	        unguardedEventListen(dist_4.EventType.MESSAGE, function (msg) {
	            if (!closed) {
	                var msgData = msg.data[0];
	                assert$1(!!msgData, 'Got a webchannel message without data.');
	                // TODO(b/35143891): There is a bug in One Platform that caused errors
	                // (and only errors) to be wrapped in an extra array. To be forward
	                // compatible with the bug we need to check either condition. The latter
	                // can be removed once the fix has been rolled out.
	                var error$$1 = 
	                // tslint:disable-next-line:no-any msgData.error is not typed.
	                msgData.error || (msgData[0] && msgData[0].error);
	                if (error$$1) {
	                    debug(LOG_TAG, 'WebChannel received error:', error$$1);
	                    // error.status will be a string like 'OK' or 'NOT_FOUND'.
	                    var status_2 = error$$1.status;
	                    var code = mapCodeFromRpcStatus(status_2);
	                    var message = error$$1.message;
	                    if (code === undefined) {
	                        code = Code.INTERNAL;
	                        message =
	                            'Unknown error status: ' +
	                                status_2 +
	                                ' with message ' +
	                                error$$1.message;
	                    }
	                    // Mark closed so no further events are propagated
	                    closed = true;
	                    streamBridge.callOnClose(new FirestoreError(code, message));
	                    channel.close();
	                }
	                else {
	                    debug(LOG_TAG, 'WebChannel received:', msgData);
	                    streamBridge.callOnMessage(msgData);
	                }
	            }
	        });
	        setTimeout(function () {
	            // Technically we could/should wait for the WebChannel opened event,
	            // but because we want to send the first message with the WebChannel
	            // handshake we pretend the channel opened here (asynchronously), and
	            // then delay the actual open until the first message is sent.
	            streamBridge.callOnOpen();
	        }, 0);
	        return streamBridge;
	    };
	    // visible for testing
	    WebChannelConnection.prototype.makeUrl = function (rpcName) {
	        var urlRpcName = RPC_NAME_REST_MAPPING[rpcName];
	        assert$1(urlRpcName !== undefined, 'Unknown REST mapping for: ' + rpcName);
	        var url = [this.baseUrl, '/', RPC_URL_VERSION];
	        url.push('/projects/');
	        url.push(this.databaseId.projectId);
	        url.push('/databases/');
	        url.push(this.databaseId.database);
	        url.push('/documents');
	        url.push(':');
	        url.push(urlRpcName);
	        return url.join('');
	    };
	    return WebChannelConnection;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var BrowserPlatform = /** @class */ (function () {
	    function BrowserPlatform() {
	        this.emptyByteString = '';
	        this.base64Available = typeof atob !== 'undefined';
	    }
	    BrowserPlatform.prototype.loadConnection = function (databaseInfo) {
	        return Promise.resolve(new WebChannelConnection(databaseInfo));
	    };
	    BrowserPlatform.prototype.newSerializer = function (databaseId) {
	        return new JsonProtoSerializer(databaseId, { useProto3Json: true });
	    };
	    BrowserPlatform.prototype.formatJSON = function (value) {
	        return JSON.stringify(value);
	    };
	    BrowserPlatform.prototype.atob = function (encoded) {
	        return atob(encoded);
	    };
	    BrowserPlatform.prototype.btoa = function (raw) {
	        return btoa(raw);
	    };
	    return BrowserPlatform;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * This code needs to run before Firestore is used. This can be achieved in
	 * several ways:
	 *   1) Through the JSCompiler compiling this code and then (automatically)
	 *      executing it before exporting the Firestore symbols.
	 *   2) Through importing this module first in a Firestore main module
	 */
	PlatformSupport.setPlatform(new BrowserPlatform());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	// The objects that are a part of this API are exposed to third-parties as
	// compiled javascript so we want to flag our private members with a leading
	// underscore to discourage their use.
	// tslint:disable:strip-private-property-underscore
	/**
	 * A FieldPath refers to a field in a document. The path may consist of a single
	 * field name (referring to a top-level field in the document), or a list of
	 * field names (referring to a nested field in the document).
	 */
	var FieldPath$1 = /** @class */ (function () {
	    /**
	     * Creates a FieldPath from the provided field names. If more than one field
	     * name is provided, the path will point to a nested field in a document.
	     *
	     * @param fieldNames A list of field names.
	     */
	    function FieldPath$$1() {
	        var arguments$1 = arguments;

	        var fieldNames = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            fieldNames[_i] = arguments$1[_i];
	        }
	        validateNamedArrayAtLeastNumberOfElements('FieldPath', fieldNames, 'fieldNames', 1);
	        for (var i = 0; i < fieldNames.length; ++i) {
	            validateArgType('FieldPath', 'string', i, fieldNames[i]);
	            if (fieldNames[i].length === 0) {
	                throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). " +
	                    'Field names must not be empty.');
	            }
	        }
	        this._internalPath = new FieldPath(fieldNames);
	    }
	    FieldPath$$1.documentId = function () {
	        return FieldPath$$1._DOCUMENT_ID;
	    };
	    FieldPath$$1.prototype.isEqual = function (other) {
	        if (!(other instanceof FieldPath$$1)) {
	            throw invalidClassError('isEqual', 'FieldPath', 1, other);
	        }
	        return this._internalPath.isEqual(other._internalPath);
	    };
	    /**
	     * Internal Note: The backend doesn't technically support querying by
	     * document ID. Instead it queries by the entire document name (full path
	     * included), but in the cases we currently support documentId(), the net
	     * effect is the same.
	     */
	    FieldPath$$1._DOCUMENT_ID = new FieldPath$$1(FieldPath.keyField().canonicalString());
	    return FieldPath$$1;
	}());
	/**
	 * Matches any characters in a field path string that are reserved.
	 */
	var RESERVED = new RegExp('[~\\*/\\[\\]]');
	/**
	 * Parses a field path string into a FieldPath, treating dots as separators.
	 */
	function fromDotSeparatedString(path) {
	    var found = path.search(RESERVED);
	    if (found >= 0) {
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid field path (" + path + "). Paths must not contain " +
	            "'~', '*', '/', '[', or ']'");
	    }
	    try {
	        return new (FieldPath$1.bind.apply(FieldPath$1, [void 0].concat(path.split('.'))))();
	    }
	    catch (e) {
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid field path (" + path + "). Paths must not be empty, " +
	            "begin with '.', end with '.', or contain '..'");
	    }
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Describes the online state of the Firestore client. Note that this does not
	 * indicate whether or not the remote store is trying to connect or not. This is
	 * primarily used by the View / EventManager code to change their behavior while
	 * offline (e.g. get() calls shouldn't wait for data from the server and
	 * snapshot events should set metadata.isFromCache=true).
	 */
	var OnlineState;
	(function (OnlineState) {
	    /**
	     * The Firestore client is in an unknown online state. This means the client
	     * is either not actively trying to establish a connection or it is currently
	     * trying to establish a connection, but it has not succeeded or failed yet.
	     * Higher-level components should not operate in offline mode.
	     */
	    OnlineState[OnlineState["Unknown"] = 0] = "Unknown";
	    /**
	     * The client is connected and the connections are healthy. This state is
	     * reached after a successful connection and there has been at least one
	     * successful message received from the backends.
	     */
	    OnlineState[OnlineState["Online"] = 1] = "Online";
	    /**
	     * The client is either trying to establish a connection but failing, or it
	     * has been explicitly marked offline via a call to disableNetwork().
	     * Higher-level components should operate in offline mode.
	     */
	    OnlineState[OnlineState["Offline"] = 2] = "Offline";
	})(OnlineState || (OnlineState = {}));

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * DocumentSet is an immutable (copy-on-write) collection that holds documents
	 * in order specified by the provided comparator. We always add a document key
	 * comparator on top of what is provided to guarantee document equality based on
	 * the key.
	 */
	var DocumentSet = /** @class */ (function () {
	    /** The default ordering is by key if the comparator is omitted */
	    function DocumentSet(comp) {
	        // We are adding document key comparator to the end as it's the only
	        // guaranteed unique property of a document.
	        if (comp) {
	            this.comparator = function (d1, d2) {
	                return comp(d1, d2) || DocumentKey.comparator(d1.key, d2.key);
	            };
	        }
	        else {
	            this.comparator = function (d1, d2) {
	                return DocumentKey.comparator(d1.key, d2.key);
	            };
	        }
	        this.keyedMap = documentMap();
	        this.sortedSet = new SortedMap(this.comparator);
	    }
	    /**
	     * Returns an empty copy of the existing DocumentSet, using the same
	     * comparator.
	     */
	    DocumentSet.emptySet = function (oldSet) {
	        return new DocumentSet(oldSet.comparator);
	    };
	    DocumentSet.prototype.has = function (key) {
	        return this.keyedMap.get(key) != null;
	    };
	    DocumentSet.prototype.get = function (key) {
	        return this.keyedMap.get(key);
	    };
	    DocumentSet.prototype.first = function () {
	        return this.sortedSet.minKey();
	    };
	    DocumentSet.prototype.last = function () {
	        return this.sortedSet.maxKey();
	    };
	    DocumentSet.prototype.isEmpty = function () {
	        return this.sortedSet.isEmpty();
	    };
	    /**
	     * Returns the index of the provided key in the document set, or -1 if the
	     * document key is not present in the set;
	     */
	    DocumentSet.prototype.indexOf = function (key) {
	        var doc = this.keyedMap.get(key);
	        return doc ? this.sortedSet.indexOf(doc) : -1;
	    };
	    Object.defineProperty(DocumentSet.prototype, "size", {
	        get: function () {
	            return this.sortedSet.size;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /** Iterates documents in order defined by "comparator" */
	    DocumentSet.prototype.forEach = function (cb) {
	        this.sortedSet.inorderTraversal(function (k, v) {
	            cb(k);
	            return false;
	        });
	    };
	    /** Inserts or updates a document with the same key */
	    DocumentSet.prototype.add = function (doc) {
	        // First remove the element if we have it.
	        var set = this.delete(doc.key);
	        return set.copy(set.keyedMap.insert(doc.key, doc), set.sortedSet.insert(doc, null));
	    };
	    /** Deletes a document with a given key */
	    DocumentSet.prototype.delete = function (key) {
	        var doc = this.get(key);
	        if (!doc) {
	            return this;
	        }
	        return this.copy(this.keyedMap.remove(key), this.sortedSet.remove(doc));
	    };
	    DocumentSet.prototype.isEqual = function (other) {
	        if (!(other instanceof DocumentSet))
	            { return false; }
	        if (this.size !== other.size)
	            { return false; }
	        var thisIt = this.sortedSet.getIterator();
	        var otherIt = other.sortedSet.getIterator();
	        while (thisIt.hasNext()) {
	            var thisDoc = thisIt.getNext().key;
	            var otherDoc = otherIt.getNext().key;
	            if (!thisDoc.isEqual(otherDoc))
	                { return false; }
	        }
	        return true;
	    };
	    DocumentSet.prototype.toString = function () {
	        var docStrings = [];
	        this.forEach(function (doc) {
	            docStrings.push(doc.toString());
	        });
	        if (docStrings.length === 0) {
	            return 'DocumentSet ()';
	        }
	        else {
	            return 'DocumentSet (\n  ' + docStrings.join('  \n') + '\n)';
	        }
	    };
	    DocumentSet.prototype.copy = function (keyedMap, sortedSet) {
	        var newSet = new DocumentSet();
	        newSet.comparator = this.comparator;
	        newSet.keyedMap = keyedMap;
	        newSet.sortedSet = sortedSet;
	        return newSet;
	    };
	    return DocumentSet;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * A map implementation that uses objects as keys. Objects must implement the
	 * Equatable interface and must be immutable. Entries in the map are stored
	 * together with the key being produced from the mapKeyFn. This map
	 * automatically handles collisions of keys.
	 */
	var ObjectMap = /** @class */ (function () {
	    function ObjectMap(mapKeyFn) {
	        this.mapKeyFn = mapKeyFn;
	        /**
	         * The inner map for a key -> value pair. Due to the possibility of
	         * collisions we keep a list of entries that we do a linear search through
	         * to find an actual match. Note that collisions should be rare, so we still
	         * expect near constant time lookups in practice.
	         */
	        this.inner = {};
	    }
	    /** Get a value for this key, or undefined if it does not exist. */
	    ObjectMap.prototype.get = function (key) {
	        var id = this.mapKeyFn(key);
	        var matches = this.inner[id];
	        if (matches === undefined) {
	            return undefined;
	        }
	        for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
	            var _a = matches_1[_i], otherKey = _a[0], value = _a[1];
	            if (otherKey.isEqual(key)) {
	                return value;
	            }
	        }
	        return undefined;
	    };
	    ObjectMap.prototype.has = function (key) {
	        return this.get(key) !== undefined;
	    };
	    /** Put this key and value in the map. */
	    ObjectMap.prototype.set = function (key, value) {
	        var id = this.mapKeyFn(key);
	        var matches = this.inner[id];
	        if (matches === undefined) {
	            this.inner[id] = [[key, value]];
	            return;
	        }
	        for (var i = 0; i < matches.length; i++) {
	            if (matches[i][0].isEqual(key)) {
	                matches[i] = [key, value];
	                return;
	            }
	        }
	        matches.push([key, value]);
	    };
	    /**
	     * Remove this key from the map. Returns a boolean if anything was deleted.
	     */
	    ObjectMap.prototype.delete = function (key) {
	        var this$1 = this;

	        var id = this.mapKeyFn(key);
	        var matches = this.inner[id];
	        if (matches === undefined) {
	            return false;
	        }
	        for (var i = 0; i < matches.length; i++) {
	            if (matches[i][0].isEqual(key)) {
	                if (matches.length === 1) {
	                    delete this$1.inner[id];
	                }
	                else {
	                    matches.splice(i, 1);
	                }
	                return true;
	            }
	        }
	        return false;
	    };
	    ObjectMap.prototype.forEach = function (fn) {
	        forEach$1(this.inner, function (_, entries) {
	            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
	                var _a = entries_1[_i], k = _a[0], v = _a[1];
	                fn(k, v);
	            }
	        });
	    };
	    ObjectMap.prototype.isEmpty = function () {
	        return isEmpty$1(this.inner);
	    };
	    return ObjectMap;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Holds the listeners and the last received ViewSnapshot for a query being
	 * tracked by EventManager.
	 */
	var QueryListenersInfo = /** @class */ (function () {
	    function QueryListenersInfo() {
	        this.listeners = [];
	    }
	    return QueryListenersInfo;
	}());
	/**
	 * EventManager is responsible for mapping queries to query event emitters.
	 * It handles "fan-out". -- Identical queries will re-use the same watch on the
	 * backend.
	 */
	var EventManager = /** @class */ (function () {
	    function EventManager(syncEngine) {
	        this.syncEngine = syncEngine;
	        this.queries = new ObjectMap(function (q) {
	            return q.canonicalId();
	        });
	        this.onlineState = OnlineState.Unknown;
	        this.syncEngine.subscribe(this.onChange.bind(this), this.onError.bind(this));
	    }
	    EventManager.prototype.listen = function (listener) {
	        var query = listener.query;
	        var firstListen = false;
	        var queryInfo = this.queries.get(query);
	        if (!queryInfo) {
	            firstListen = true;
	            queryInfo = new QueryListenersInfo();
	            this.queries.set(query, queryInfo);
	        }
	        queryInfo.listeners.push(listener);
	        listener.applyOnlineStateChange(this.onlineState);
	        if (queryInfo.viewSnap)
	            { listener.onViewSnapshot(queryInfo.viewSnap); }
	        if (firstListen) {
	            return this.syncEngine.listen(query).then(function (targetId) {
	                queryInfo.targetId = targetId;
	                return targetId;
	            });
	        }
	        else {
	            return Promise.resolve(queryInfo.targetId);
	        }
	    };
	    EventManager.prototype.unlisten = function (listener) {
	        return __awaiter(this, void 0, void 0, function () {
	            var query, lastListen, queryInfo, i;
	            return __generator(this, function (_a) {
	                query = listener.query;
	                lastListen = false;
	                queryInfo = this.queries.get(query);
	                if (queryInfo) {
	                    i = queryInfo.listeners.indexOf(listener);
	                    if (i >= 0) {
	                        queryInfo.listeners.splice(i, 1);
	                        lastListen = queryInfo.listeners.length === 0;
	                    }
	                }
	                if (lastListen) {
	                    this.queries.delete(query);
	                    return [2 /*return*/, this.syncEngine.unlisten(query)];
	                }
	                return [2 /*return*/];
	            });
	        });
	    };
	    EventManager.prototype.onChange = function (viewSnaps) {
	        var this$1 = this;

	        for (var _i = 0, viewSnaps_1 = viewSnaps; _i < viewSnaps_1.length; _i++) {
	            var viewSnap = viewSnaps_1[_i];
	            var query = viewSnap.query;
	            var queryInfo = this$1.queries.get(query);
	            if (queryInfo) {
	                for (var _a = 0, _b = queryInfo.listeners; _a < _b.length; _a++) {
	                    var listener = _b[_a];
	                    listener.onViewSnapshot(viewSnap);
	                }
	                queryInfo.viewSnap = viewSnap;
	            }
	        }
	    };
	    EventManager.prototype.onError = function (query, error) {
	        var queryInfo = this.queries.get(query);
	        if (queryInfo) {
	            for (var _i = 0, _a = queryInfo.listeners; _i < _a.length; _i++) {
	                var listener = _a[_i];
	                listener.onError(error);
	            }
	        }
	        // Remove all listeners. NOTE: We don't need to call syncEngine.unlisten()
	        // after an error.
	        this.queries.delete(query);
	    };
	    EventManager.prototype.applyOnlineStateChange = function (onlineState) {
	        this.onlineState = onlineState;
	        this.queries.forEach(function (_, queryInfo) {
	            for (var _i = 0, _a = queryInfo.listeners; _i < _a.length; _i++) {
	                var listener = _a[_i];
	                listener.applyOnlineStateChange(onlineState);
	            }
	        });
	    };
	    return EventManager;
	}());
	/**
	 * QueryListener takes a series of internal view snapshots and determines
	 * when to raise the event.
	 *
	 * It uses an Observer to dispatch events.
	 */
	var QueryListener = /** @class */ (function () {
	    function QueryListener(query, queryObserver, options) {
	        this.query = query;
	        this.queryObserver = queryObserver;
	        /**
	         * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
	         * observer. This flag is set to true once we've actually raised an event.
	         */
	        this.raisedInitialEvent = false;
	        this.onlineState = OnlineState.Unknown;
	        this.options = options || {};
	    }
	    QueryListener.prototype.onViewSnapshot = function (snap) {
	        assert$1(snap.docChanges.length > 0 || snap.syncStateChanged, 'We got a new snapshot with no changes?');
	        if (!this.options.includeMetadataChanges) {
	            // Remove the metadata only changes.
	            var docChanges = [];
	            for (var _i = 0, _a = snap.docChanges; _i < _a.length; _i++) {
	                var docChange = _a[_i];
	                if (docChange.type !== ChangeType.Metadata) {
	                    docChanges.push(docChange);
	                }
	            }
	            snap = new ViewSnapshot(snap.query, snap.docs, snap.oldDocs, docChanges, snap.fromCache, snap.hasPendingWrites, snap.syncStateChanged, 
	            /* excludesMetadataChanges= */ true);
	        }
	        if (!this.raisedInitialEvent) {
	            if (this.shouldRaiseInitialEvent(snap, this.onlineState)) {
	                this.raiseInitialEvent(snap);
	            }
	        }
	        else if (this.shouldRaiseEvent(snap)) {
	            this.queryObserver.next(snap);
	        }
	        this.snap = snap;
	    };
	    QueryListener.prototype.onError = function (error) {
	        this.queryObserver.error(error);
	    };
	    QueryListener.prototype.applyOnlineStateChange = function (onlineState) {
	        this.onlineState = onlineState;
	        if (this.snap &&
	            !this.raisedInitialEvent &&
	            this.shouldRaiseInitialEvent(this.snap, onlineState)) {
	            this.raiseInitialEvent(this.snap);
	        }
	    };
	    QueryListener.prototype.shouldRaiseInitialEvent = function (snap, onlineState) {
	        assert$1(!this.raisedInitialEvent, 'Determining whether to raise first event but already had first event');
	        // Always raise the first event when we're synced
	        if (!snap.fromCache) {
	            return true;
	        }
	        // NOTE: We consider OnlineState.Unknown as online (it should become Offline
	        // or Online if we wait long enough).
	        var maybeOnline = onlineState !== OnlineState.Offline;
	        // Don't raise the event if we're online, aren't synced yet (checked
	        // above) and are waiting for a sync.
	        if (this.options.waitForSyncWhenOnline && maybeOnline) {
	            assert$1(snap.fromCache, 'Waiting for sync, but snapshot is not from cache');
	            return false;
	        }
	        // Raise data from cache if we have any documents or we are offline
	        return !snap.docs.isEmpty() || onlineState === OnlineState.Offline;
	    };
	    QueryListener.prototype.shouldRaiseEvent = function (snap) {
	        // We don't need to handle includeDocumentMetadataChanges here because
	        // the Metadata only changes have already been stripped out if needed.
	        // At this point the only changes we will see are the ones we should
	        // propagate.
	        if (snap.docChanges.length > 0) {
	            return true;
	        }
	        var hasPendingWritesChanged = this.snap && this.snap.hasPendingWrites !== snap.hasPendingWrites;
	        if (snap.syncStateChanged || hasPendingWritesChanged) {
	            return this.options.includeMetadataChanges === true;
	        }
	        // Generally we should have hit one of the cases above, but it's possible
	        // to get here if there were only metadata docChanges and they got
	        // stripped out.
	        return false;
	    };
	    QueryListener.prototype.raiseInitialEvent = function (snap) {
	        assert$1(!this.raisedInitialEvent, 'Trying to raise initial events for second time');
	        snap = new ViewSnapshot(snap.query, snap.docs, DocumentSet.emptySet(snap.docs), QueryListener.getInitialViewChanges(snap), snap.fromCache, snap.hasPendingWrites, 
	        /* syncChangesState= */ true, 
	        /* excludesMetadataChanges= */ false);
	        this.raisedInitialEvent = true;
	        this.queryObserver.next(snap);
	    };
	    /** Returns changes as if all documents in the snap were added. */
	    QueryListener.getInitialViewChanges = function (snap) {
	        var result = [];
	        snap.docs.forEach(function (doc) {
	            result.push({ type: ChangeType.Added, doc: doc });
	        });
	        return result;
	    };
	    return QueryListener;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * PersistencePromise<> is essentially a re-implementation of Promise<> except
	 * it has a .next() method instead of .then() and .next() and .catch() callbacks
	 * are executed synchronously when a PersistencePromise resolves rather than
	 * asynchronously (Promise<> implementations use setImmediate() or similar).
	 *
	 * This is necessary to interoperate with IndexedDB which will automatically
	 * commit transactions if control is returned to the event loop without
	 * synchronously initiating another operation on the transaction.
	 *
	 * NOTE: .then() and .catch() only allow a single consumer, unlike normal
	 * Promises.
	 */
	var PersistencePromise = /** @class */ (function () {
	    function PersistencePromise(callback) {
	        var _this = this;
	        // NOTE: next/catchCallback will always point to our own wrapper functions,
	        // not the user's raw next() or catch() callbacks.
	        // tslint:disable-next-line:no-any Accept any result type for the next call in the Promise chain.
	        this.nextCallback = null;
	        // tslint:disable-next-line:no-any Accept any result type for the error handler.
	        this.catchCallback = null;
	        // When the operation resolves, we'll set result or error and mark isDone.
	        this.result = undefined;
	        this.error = undefined;
	        this.isDone = false;
	        // Set to true when .then() or .catch() are called and prevents additional
	        // chaining.
	        this.callbackAttached = false;
	        callback(function (value) {
	            _this.isDone = true;
	            _this.result = value;
	            if (_this.nextCallback) {
	                // value should be defined unless T is Void, but we can't express
	                // that in the type system.
	                _this.nextCallback(value);
	            }
	        }, function (error) {
	            _this.isDone = true;
	            _this.error = error;
	            if (_this.catchCallback) {
	                _this.catchCallback(error);
	            }
	        });
	    }
	    PersistencePromise.prototype.catch = function (fn) {
	        return this.next(undefined, fn);
	    };
	    PersistencePromise.prototype.next = function (nextFn, catchFn) {
	        var _this = this;
	        if (this.callbackAttached) {
	            fail('Called next() or catch() twice for PersistencePromise');
	        }
	        this.callbackAttached = true;
	        if (this.isDone) {
	            if (!this.error) {
	                return this.wrapSuccess(nextFn, this.result);
	            }
	            else {
	                return this.wrapFailure(catchFn, this.error);
	            }
	        }
	        else {
	            return new PersistencePromise(function (resolve, reject) {
	                _this.nextCallback = function (value) {
	                    _this.wrapSuccess(nextFn, value).next(resolve, reject);
	                };
	                _this.catchCallback = function (error) {
	                    _this.wrapFailure(catchFn, error).next(resolve, reject);
	                };
	            });
	        }
	    };
	    PersistencePromise.prototype.toPromise = function () {
	        var _this = this;
	        return new Promise(function (resolve, reject) {
	            _this.next(resolve, reject);
	        });
	    };
	    PersistencePromise.prototype.wrapUserFunction = function (fn) {
	        try {
	            var result = fn();
	            if (result instanceof PersistencePromise) {
	                return result;
	            }
	            else {
	                return PersistencePromise.resolve(result);
	            }
	        }
	        catch (e) {
	            return PersistencePromise.reject(e);
	        }
	    };
	    PersistencePromise.prototype.wrapSuccess = function (nextFn, value) {
	        if (nextFn) {
	            return this.wrapUserFunction(function () { return nextFn(value); });
	        }
	        else {
	            // If there's no nextFn, then R must be the same as T but we
	            // can't express that in the type system.
	            // tslint:disable-next-line:no-any
	            return PersistencePromise.resolve(value);
	        }
	    };
	    PersistencePromise.prototype.wrapFailure = function (catchFn, error) {
	        if (catchFn) {
	            return this.wrapUserFunction(function () { return catchFn(error); });
	        }
	        else {
	            return PersistencePromise.reject(error);
	        }
	    };
	    PersistencePromise.resolve = function (result) {
	        return new PersistencePromise(function (resolve, reject) {
	            resolve(result);
	        });
	    };
	    PersistencePromise.reject = function (error) {
	        return new PersistencePromise(function (resolve, reject) {
	            reject(error);
	        });
	    };
	    PersistencePromise.waitFor = function (
	    // tslint:disable-next-line:no-any Accept all Promise types in waitFor().
	    all) {
	        var expectedCount = all.length;
	        if (expectedCount === 0) {
	            return PersistencePromise.resolve();
	        }
	        var resolvedCount = 0;
	        return new PersistencePromise(function (resolve, reject) {
	            for (var _i = 0, all_1 = all; _i < all_1.length; _i++) {
	                var promise = all_1[_i];
	                promise.next(function () {
	                    ++resolvedCount;
	                    if (resolvedCount === expectedCount) {
	                        resolve();
	                    }
	                }, function (err) { return reject(err); });
	            }
	        });
	    };
	    PersistencePromise.map = function (all) {
	        var results = [];
	        var promises = [];
	        var _loop_1 = function (i) {
	            promises[i] = all[i].next(function (result) {
	                results[i] = result;
	            });
	        };
	        for (var i = 0; i < all.length; ++i) {
	            _loop_1(i);
	        }
	        return PersistencePromise.waitFor(promises).next(function () {
	            return results;
	        });
	    };
	    return PersistencePromise;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * A garbage collector implementation that eagerly collects documents as soon as
	 * they're no longer referenced in any of its registered GarbageSources.
	 *
	 * This implementation keeps track of a set of keys that are potentially garbage
	 * without keeping an exact reference count. During collectGarbage, the
	 * collector verifies that all potential garbage keys actually have no
	 * references by consulting its list of garbage sources.
	 */
	var EagerGarbageCollector = /** @class */ (function () {
	    function EagerGarbageCollector() {
	        this.isEager = true;
	        /**
	         * The garbage collectible sources to double-check during garbage collection.
	         */
	        this.sources = [];
	        /**
	         * A set of potentially garbage keys.
	         * PORTING NOTE: This would be a mutable set if Javascript had one.
	         */
	        this.potentialGarbage = documentKeySet();
	    }
	    EagerGarbageCollector.prototype.addGarbageSource = function (garbageSource) {
	        this.sources.push(garbageSource);
	        garbageSource.setGarbageCollector(this);
	    };
	    EagerGarbageCollector.prototype.removeGarbageSource = function (garbageSource) {
	        this.sources.splice(this.sources.indexOf(garbageSource), 1);
	        garbageSource.setGarbageCollector(null);
	    };
	    EagerGarbageCollector.prototype.addPotentialGarbageKey = function (key) {
	        this.potentialGarbage = this.potentialGarbage.add(key);
	    };
	    EagerGarbageCollector.prototype.collectGarbage = function (txn) {
	        var _this = this;
	        var promises = [];
	        var garbageKeys = documentKeySet();
	        this.potentialGarbage.forEach(function (key) {
	            var hasRefsPromise = _this.documentHasAnyReferences(txn, key);
	            promises.push(hasRefsPromise.next(function (hasRefs) {
	                // If there are no references, get the key.
	                if (!hasRefs) {
	                    garbageKeys = garbageKeys.add(key);
	                }
	                return PersistencePromise.resolve();
	            }));
	        });
	        // Clear locally retained potential keys and returned confirmed garbage.
	        this.potentialGarbage = documentKeySet();
	        return PersistencePromise.waitFor(promises).next(function () { return garbageKeys; });
	    };
	    EagerGarbageCollector.prototype.documentHasAnyReferences = function (txn, key) {
	        var initial = PersistencePromise.resolve(false);
	        return this.sources
	            .map(function (source) { return function () { return source.containsKey(txn, key); }; })
	            .reduce(function (promise, nextPromise) {
	            return promise.next(function (result) {
	                if (result) {
	                    return PersistencePromise.resolve(true);
	                }
	                else {
	                    return nextPromise();
	                }
	            });
	        }, initial);
	    };
	    return EagerGarbageCollector;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * A set of changes to what documents are currently in view and out of view for
	 * a given query. These changes are sent to the LocalStore by the View (via
	 * the SyncEngine) and are used to pin / unpin documents as appropriate.
	 */
	var LocalViewChanges = /** @class */ (function () {
	    function LocalViewChanges(query, addedKeys, removedKeys) {
	        this.query = query;
	        this.addedKeys = addedKeys;
	        this.removedKeys = removedKeys;
	    }
	    LocalViewChanges.fromSnapshot = function (viewSnapshot) {
	        var addedKeys = documentKeySet();
	        var removedKeys = documentKeySet();
	        for (var _i = 0, _a = viewSnapshot.docChanges; _i < _a.length; _i++) {
	            var docChange = _a[_i];
	            switch (docChange.type) {
	                case ChangeType.Added:
	                    addedKeys = addedKeys.add(docChange.doc.key);
	                    break;
	                case ChangeType.Removed:
	                    removedKeys = removedKeys.add(docChange.doc.key);
	                    break;
	                default:
	                // do nothing
	            }
	        }
	        return new LocalViewChanges(viewSnapshot.query, addedKeys, removedKeys);
	    };
	    return LocalViewChanges;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * A collection of references to a document from some kind of numbered entity
	 * (either a target ID or batch ID). As references are added to or removed from
	 * the set corresponding events are emitted to a registered garbage collector.
	 *
	 * Each reference is represented by a DocumentReference object. Each of them
	 * contains enough information to uniquely identify the reference. They are all
	 * stored primarily in a set sorted by key. A document is considered garbage if
	 * there's no references in that set (this can be efficiently checked thanks to
	 * sorting by key).
	 *
	 * ReferenceSet also keeps a secondary set that contains references sorted by
	 * IDs. This one is used to efficiently implement removal of all references by
	 * some target ID.
	 */
	var ReferenceSet = /** @class */ (function () {
	    function ReferenceSet() {
	        // A set of outstanding references to a document sorted by key.
	        this.refsByKey = new SortedSet(DocReference.compareByKey);
	        // A set of outstanding references to a document sorted by target id.
	        this.refsByTarget = new SortedSet(DocReference.compareByTargetId);
	        /** Keeps track of keys that have references */
	        this.garbageCollector = null;
	    }
	    /** Returns true if the reference set contains no references. */
	    ReferenceSet.prototype.isEmpty = function () {
	        return this.refsByKey.isEmpty();
	    };
	    /** Adds a reference to the given document key for the given ID. */
	    ReferenceSet.prototype.addReference = function (key, id) {
	        var ref = new DocReference(key, id);
	        this.refsByKey = this.refsByKey.add(ref);
	        this.refsByTarget = this.refsByTarget.add(ref);
	    };
	    /** Add references to the given document keys for the given ID. */
	    ReferenceSet.prototype.addReferences = function (keys, id) {
	        var _this = this;
	        keys.forEach(function (key) { return _this.addReference(key, id); });
	    };
	    /**
	     * Removes a reference to the given document key for the given
	     * ID.
	     */
	    ReferenceSet.prototype.removeReference = function (key, id) {
	        this.removeRef(new DocReference(key, id));
	    };
	    ReferenceSet.prototype.removeReferences = function (keys, id) {
	        var _this = this;
	        keys.forEach(function (key) { return _this.removeReference(key, id); });
	    };
	    /**
	     * Clears all references with a given ID. Calls removeRef() for each key
	     * removed.
	     */
	    ReferenceSet.prototype.removeReferencesForId = function (id) {
	        var _this = this;
	        var emptyKey = DocumentKey.EMPTY;
	        var startRef = new DocReference(emptyKey, id);
	        var endRef = new DocReference(emptyKey, id + 1);
	        this.refsByTarget.forEachInRange([startRef, endRef], function (ref) {
	            _this.removeRef(ref);
	        });
	    };
	    ReferenceSet.prototype.removeAllReferences = function () {
	        var _this = this;
	        this.refsByKey.forEach(function (ref) { return _this.removeRef(ref); });
	    };
	    ReferenceSet.prototype.removeRef = function (ref) {
	        this.refsByKey = this.refsByKey.delete(ref);
	        this.refsByTarget = this.refsByTarget.delete(ref);
	        if (this.garbageCollector !== null) {
	            this.garbageCollector.addPotentialGarbageKey(ref.key);
	        }
	    };
	    ReferenceSet.prototype.referencesForId = function (id) {
	        var emptyKey = DocumentKey.EMPTY;
	        var startRef = new DocReference(emptyKey, id);
	        var endRef = new DocReference(emptyKey, id + 1);
	        var keys = documentKeySet();
	        this.refsByTarget.forEachInRange([startRef, endRef], function (ref) {
	            keys = keys.add(ref.key);
	        });
	        return keys;
	    };
	    ReferenceSet.prototype.setGarbageCollector = function (garbageCollector) {
	        this.garbageCollector = garbageCollector;
	    };
	    ReferenceSet.prototype.containsKey = function (txn, key) {
	        var ref = new DocReference(key, 0);
	        var firstRef = this.refsByKey.firstAfterOrEqual(ref);
	        return PersistencePromise.resolve(firstRef !== null && key.isEqual(firstRef.key));
	    };
	    return ReferenceSet;
	}());
	var DocReference = /** @class */ (function () {
	    function DocReference(key, targetOrBatchId) {
	        this.key = key;
	        this.targetOrBatchId = targetOrBatchId;
	    }
	    /** Compare by key then by ID */
	    DocReference.compareByKey = function (left, right) {
	        return (DocumentKey.comparator(left.key, right.key) ||
	            primitiveComparator(left.targetOrBatchId, right.targetOrBatchId));
	    };
	    /** Compare by ID then by key */
	    DocReference.compareByTargetId = function (left, right) {
	        return (primitiveComparator(left.targetOrBatchId, right.targetOrBatchId) ||
	            DocumentKey.comparator(left.key, right.key));
	    };
	    return DocReference;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var RESERVED_BITS = 1;
	var GeneratorIds;
	(function (GeneratorIds) {
	    GeneratorIds[GeneratorIds["LocalStore"] = 0] = "LocalStore";
	    GeneratorIds[GeneratorIds["SyncEngine"] = 1] = "SyncEngine";
	})(GeneratorIds || (GeneratorIds = {}));
	/**
	 * TargetIdGenerator generates monotonically increasing integer IDs. There are
	 * separate generators for different scopes. While these generators will operate
	 * independently of each other, they are scoped, such that no two generators
	 * will ever produce the same ID. This is useful, because sometimes the backend
	 * may group IDs from separate parts of the client into the same ID space.
	 */
	var TargetIdGenerator = /** @class */ (function () {
	    function TargetIdGenerator(generatorId, initAfter) {
	        if (initAfter === void 0) { initAfter = 0; }
	        this.generatorId = generatorId;
	        // Replace the generator part of initAfter with this generator's ID.
	        var afterWithoutGenerator = (initAfter >> RESERVED_BITS) << RESERVED_BITS;
	        var afterGenerator = initAfter - afterWithoutGenerator;
	        if (afterGenerator >= generatorId) {
	            // For example, if:
	            //   this.generatorId = 0b0000
	            //   after = 0b1011
	            //   afterGenerator = 0b0001
	            // Then:
	            //   previous = 0b1010
	            //   next = 0b1100
	            this.previousId = afterWithoutGenerator | this.generatorId;
	        }
	        else {
	            // For example, if:
	            //   this.generatorId = 0b0001
	            //   after = 0b1010
	            //   afterGenerator = 0b0000
	            // Then:
	            //   previous = 0b1001
	            //   next = 0b1011
	            this.previousId =
	                (afterWithoutGenerator | this.generatorId) - (1 << RESERVED_BITS);
	        }
	    }
	    TargetIdGenerator.prototype.next = function () {
	        this.previousId += 1 << RESERVED_BITS;
	        return this.previousId;
	    };
	    TargetIdGenerator.forLocalStore = function (initAfter) {
	        if (initAfter === void 0) { initAfter = 0; }
	        return new TargetIdGenerator(GeneratorIds.LocalStore, initAfter);
	    };
	    TargetIdGenerator.forSyncEngine = function () {
	        return new TargetIdGenerator(GeneratorIds.SyncEngine);
	    };
	    return TargetIdGenerator;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var AddedLimboDocument = /** @class */ (function () {
	    function AddedLimboDocument(key) {
	        this.key = key;
	    }
	    return AddedLimboDocument;
	}());
	var RemovedLimboDocument = /** @class */ (function () {
	    function RemovedLimboDocument(key) {
	        this.key = key;
	    }
	    return RemovedLimboDocument;
	}());
	/**
	 * View is responsible for computing the final merged truth of what docs are in
	 * a query. It gets notified of local and remote changes to docs, and applies
	 * the query filters and limits to determine the most correct possible results.
	 */
	var View = /** @class */ (function () {
	    function View(query, 
	    /** Documents included in the remote target */
	    _syncedDocuments) {
	        this.query = query;
	        this._syncedDocuments = _syncedDocuments;
	        this.syncState = null;
	        /**
	         * A flag whether the view is current with the backend. A view is considered
	         * current after it has seen the current flag from the backend and did not
	         * lose consistency within the watch stream (e.g. because of an existence
	         * filter mismatch).
	         */
	        this.current = false;
	        /** Documents in the view but not in the remote target */
	        this.limboDocuments = documentKeySet();
	        /** Document Keys that have local changes */
	        this.mutatedKeys = documentKeySet();
	        this.documentSet = new DocumentSet(query.docComparator.bind(query));
	    }
	    Object.defineProperty(View.prototype, "syncedDocuments", {
	        /**
	         * The set of remote documents that the server has told us belongs to the target associated with
	         * this view.
	         */
	        get: function () {
	            return this._syncedDocuments;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Iterates over a set of doc changes, applies the query limit, and computes
	     * what the new results should be, what the changes were, and whether we may
	     * need to go back to the local cache for more results. Does not make any
	     * changes to the view.
	     * @param docChanges The doc changes to apply to this view.
	     * @param previousChanges If this is being called with a refill, then start
	     *        with this set of docs and changes instead of the current view.
	     * @return a new set of docs, changes, and refill flag.
	     */
	    View.prototype.computeDocChanges = function (docChanges, previousChanges) {
	        var _this = this;
	        var changeSet = previousChanges
	            ? previousChanges.changeSet
	            : new DocumentChangeSet();
	        var oldDocumentSet = previousChanges
	            ? previousChanges.documentSet
	            : this.documentSet;
	        var newMutatedKeys = previousChanges
	            ? previousChanges.mutatedKeys
	            : this.mutatedKeys;
	        var newDocumentSet = oldDocumentSet;
	        var needsRefill = false;
	        // Track the last doc in a (full) limit. This is necessary, because some
	        // update (a delete, or an update moving a doc past the old limit) might
	        // mean there is some other document in the local cache that either should
	        // come (1) between the old last limit doc and the new last document, in the
	        // case of updates, or (2) after the new last document, in the case of
	        // deletes. So we keep this doc at the old limit to compare the updates to.
	        //
	        // Note that this should never get used in a refill (when previousChanges is
	        // set), because there will only be adds -- no deletes or updates.
	        var lastDocInLimit = this.query.hasLimit() && oldDocumentSet.size === this.query.limit
	            ? oldDocumentSet.last()
	            : null;
	        docChanges.inorderTraversal(function (key, newMaybeDoc) {
	            var oldDoc = oldDocumentSet.get(key);
	            var newDoc = newMaybeDoc instanceof Document ? newMaybeDoc : null;
	            if (newDoc) {
	                assert$1(key.isEqual(newDoc.key), 'Mismatching keys found in document changes: ' +
	                    key +
	                    ' != ' +
	                    newDoc.key);
	                newDoc = _this.query.matches(newDoc) ? newDoc : null;
	            }
	            if (newDoc) {
	                newDocumentSet = newDocumentSet.add(newDoc);
	                if (newDoc.hasLocalMutations) {
	                    newMutatedKeys = newMutatedKeys.add(key);
	                }
	                else {
	                    newMutatedKeys = newMutatedKeys.delete(key);
	                }
	            }
	            else {
	                newDocumentSet = newDocumentSet.delete(key);
	                newMutatedKeys = newMutatedKeys.delete(key);
	            }
	            // Calculate change
	            if (oldDoc && newDoc) {
	                var docsEqual = oldDoc.data.isEqual(newDoc.data);
	                if (!docsEqual ||
	                    oldDoc.hasLocalMutations !== newDoc.hasLocalMutations) {
	                    // only report a change if document actually changed
	                    if (docsEqual) {
	                        changeSet.track({ type: ChangeType.Metadata, doc: newDoc });
	                    }
	                    else {
	                        changeSet.track({ type: ChangeType.Modified, doc: newDoc });
	                    }
	                    if (lastDocInLimit &&
	                        _this.query.docComparator(newDoc, lastDocInLimit) > 0) {
	                        // This doc moved from inside the limit to after the limit.
	                        // That means there may be some doc in the local cache that's
	                        // actually less than this one.
	                        needsRefill = true;
	                    }
	                }
	            }
	            else if (!oldDoc && newDoc) {
	                changeSet.track({ type: ChangeType.Added, doc: newDoc });
	            }
	            else if (oldDoc && !newDoc) {
	                changeSet.track({ type: ChangeType.Removed, doc: oldDoc });
	                if (lastDocInLimit) {
	                    // A doc was removed from a full limit query. We'll need to
	                    // requery from the local cache to see if we know about some other
	                    // doc that should be in the results.
	                    needsRefill = true;
	                }
	            }
	        });
	        if (this.query.hasLimit()) {
	            // TODO(klimt): Make DocumentSet size be constant time.
	            while (newDocumentSet.size > this.query.limit) {
	                var oldDoc = newDocumentSet.last();
	                newDocumentSet = newDocumentSet.delete(oldDoc.key);
	                changeSet.track({ type: ChangeType.Removed, doc: oldDoc });
	            }
	        }
	        assert$1(!needsRefill || !previousChanges, 'View was refilled using docs that themselves needed refilling.');
	        return {
	            documentSet: newDocumentSet,
	            changeSet: changeSet,
	            needsRefill: needsRefill,
	            mutatedKeys: newMutatedKeys
	        };
	    };
	    /**
	     * Updates the view with the given ViewDocumentChanges and updates limbo docs
	     * and sync state from the given (optional) target change.
	     * @param docChanges The set of changes to make to the view's docs.
	     * @param targetChange A target change to apply for computing limbo docs and
	     *        sync state.
	     * @return A new ViewChange with the given docs, changes, and sync state.
	     */
	    View.prototype.applyChanges = function (docChanges, targetChange) {
	        var _this = this;
	        assert$1(!docChanges.needsRefill, 'Cannot apply changes that need a refill');
	        var oldDocs = this.documentSet;
	        this.documentSet = docChanges.documentSet;
	        this.mutatedKeys = docChanges.mutatedKeys;
	        // Sort changes based on type and query comparator
	        var changes = docChanges.changeSet.getChanges();
	        changes.sort(function (c1, c2) {
	            return (compareChangeType(c1.type, c2.type) ||
	                _this.query.docComparator(c1.doc, c2.doc));
	        });
	        this.applyTargetChange(targetChange);
	        var limboChanges = this.updateLimboDocuments();
	        var synced = this.limboDocuments.size === 0 && this.current;
	        var newSyncState = synced ? SyncState.Synced : SyncState.Local;
	        var syncStateChanged = newSyncState !== this.syncState;
	        this.syncState = newSyncState;
	        if (changes.length === 0 && !syncStateChanged) {
	            // no changes
	            return { limboChanges: limboChanges };
	        }
	        else {
	            var snap = new ViewSnapshot(this.query, docChanges.documentSet, oldDocs, changes, newSyncState === SyncState.Local, !docChanges.mutatedKeys.isEmpty(), syncStateChanged, 
	            /* excludesMetadataChanges= */ false);
	            return {
	                snapshot: snap,
	                limboChanges: limboChanges
	            };
	        }
	    };
	    /**
	     * Applies an OnlineState change to the view, potentially generating a
	     * ViewChange if the view's syncState changes as a result.
	     */
	    View.prototype.applyOnlineStateChange = function (onlineState) {
	        if (this.current && onlineState === OnlineState.Offline) {
	            // If we're offline, set `current` to false and then call applyChanges()
	            // to refresh our syncState and generate a ViewChange as appropriate. We
	            // are guaranteed to get a new TargetChange that sets `current` back to
	            // true once the client is back online.
	            this.current = false;
	            return this.applyChanges({
	                documentSet: this.documentSet,
	                changeSet: new DocumentChangeSet(),
	                mutatedKeys: this.mutatedKeys,
	                needsRefill: false
	            });
	        }
	        else {
	            // No effect, just return a no-op ViewChange.
	            return { limboChanges: [] };
	        }
	    };
	    /**
	     * Returns whether the doc for the given key should be in limbo.
	     */
	    View.prototype.shouldBeInLimbo = function (key) {
	        // If the remote end says it's part of this query, it's not in limbo.
	        if (this._syncedDocuments.has(key)) {
	            return false;
	        }
	        // The local store doesn't think it's a result, so it shouldn't be in limbo.
	        if (!this.documentSet.has(key)) {
	            return false;
	        }
	        // If there are local changes to the doc, they might explain why the server
	        // doesn't know that it's part of the query. So don't put it in limbo.
	        // TODO(klimt): Ideally, we would only consider changes that might actually
	        // affect this specific query.
	        if (this.documentSet.get(key).hasLocalMutations) {
	            return false;
	        }
	        // Everything else is in limbo.
	        return true;
	    };
	    /**
	     * Updates syncedDocuments, current, and limbo docs based on the given change.
	     * Returns the list of changes to which docs are in limbo.
	     */
	    View.prototype.applyTargetChange = function (targetChange) {
	        var _this = this;
	        if (targetChange) {
	            targetChange.addedDocuments.forEach(function (key) { return (_this._syncedDocuments = _this._syncedDocuments.add(key)); });
	            targetChange.modifiedDocuments.forEach(function (key) {
	                return assert$1(_this._syncedDocuments.has(key), "Modified document " + key + " not found in view.");
	            });
	            targetChange.removedDocuments.forEach(function (key) { return (_this._syncedDocuments = _this._syncedDocuments.delete(key)); });
	            this.current = targetChange.current;
	        }
	    };
	    View.prototype.updateLimboDocuments = function () {
	        var _this = this;
	        // We can only determine limbo documents when we're in-sync with the server.
	        if (!this.current) {
	            return [];
	        }
	        // TODO(klimt): Do this incrementally so that it's not quadratic when
	        // updating many documents.
	        var oldLimboDocuments = this.limboDocuments;
	        this.limboDocuments = documentKeySet();
	        this.documentSet.forEach(function (doc) {
	            if (_this.shouldBeInLimbo(doc.key)) {
	                _this.limboDocuments = _this.limboDocuments.add(doc.key);
	            }
	        });
	        // Diff the new limbo docs with the old limbo docs.
	        var changes = [];
	        oldLimboDocuments.forEach(function (key) {
	            if (!_this.limboDocuments.has(key)) {
	                changes.push(new RemovedLimboDocument(key));
	            }
	        });
	        this.limboDocuments.forEach(function (key) {
	            if (!oldLimboDocuments.has(key)) {
	                changes.push(new AddedLimboDocument(key));
	            }
	        });
	        return changes;
	    };
	    return View;
	}());
	function compareChangeType(c1, c2) {
	    var order = function (change) {
	        switch (change) {
	            case ChangeType.Added:
	                return 1;
	            case ChangeType.Modified:
	                return 2;
	            case ChangeType.Metadata:
	                // A metadata change is converted to a modified change at the public
	                // api layer.  Since we sort by document key and then change type,
	                // metadata and modified changes must be sorted equivalently.
	                return 2;
	            case ChangeType.Removed:
	                return 0;
	            default:
	                return fail('Unknown ChangeType: ' + change);
	        }
	    };
	    return order(c1) - order(c2);
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG$1 = 'SyncEngine';
	/**
	 * QueryView contains all of the data that SyncEngine needs to keep track of for
	 * a particular query.
	 */
	var QueryView = /** @class */ (function () {
	    function QueryView(
	    /**
	     * The query itself.
	     */
	    query, 
	    /**
	     * The target number created by the client that is used in the watch
	     * stream to identify this query.
	     */
	    targetId, 
	    /**
	     * An identifier from the datastore backend that indicates the last state
	     * of the results that was received. This can be used to indicate where
	     * to continue receiving new doc changes for the query.
	     */
	    resumeToken, 
	    /**
	     * The view is responsible for computing the final merged truth of what
	     * docs are in the query. It gets notified of local and remote changes,
	     * and applies the query filters and limits to determine the most correct
	     * possible results.
	     */
	    view) {
	        this.query = query;
	        this.targetId = targetId;
	        this.resumeToken = resumeToken;
	        this.view = view;
	    }
	    return QueryView;
	}());
	/** Tracks a limbo resolution. */
	var LimboResolution = /** @class */ (function () {
	    function LimboResolution(key) {
	        this.key = key;
	    }
	    return LimboResolution;
	}());
	/**
	 * SyncEngine is the central controller in the client SDK architecture. It is
	 * the glue code between the EventManager, LocalStore, and RemoteStore. Some of
	 * SyncEngine's responsibilities include:
	 * 1. Coordinating client requests and remote events between the EventManager
	 *    and the local and remote data stores.
	 * 2. Managing a View object for each query, providing the unified view between
	 *    the local and remote data stores.
	 * 3. Notifying the RemoteStore when the LocalStore has new mutations in its
	 *    queue that need sending to the backend.
	 *
	 * The SyncEngine’s methods should only ever be called by methods running in the
	 * global async queue.
	 */
	var SyncEngine = /** @class */ (function () {
	    function SyncEngine(localStore, remoteStore, currentUser) {
	        this.localStore = localStore;
	        this.remoteStore = remoteStore;
	        this.currentUser = currentUser;
	        this.viewHandler = null;
	        this.errorHandler = null;
	        this.queryViewsByQuery = new ObjectMap(function (q) {
	            return q.canonicalId();
	        });
	        this.queryViewsByTarget = {};
	        this.limboTargetsByKey = new SortedMap(DocumentKey.comparator);
	        this.limboResolutionsByTarget = {};
	        this.limboDocumentRefs = new ReferenceSet();
	        this.limboCollector = new EagerGarbageCollector();
	        /** Stores user completion handlers, indexed by User and BatchId. */
	        this.mutationUserCallbacks = {};
	        this.targetIdGenerator = TargetIdGenerator.forSyncEngine();
	        this.limboCollector.addGarbageSource(this.limboDocumentRefs);
	    }
	    /** Subscribes view and error handler. Can be called only once. */
	    SyncEngine.prototype.subscribe = function (viewHandler, errorHandler) {
	        assert$1(viewHandler !== null && errorHandler !== null, 'View and error handlers cannot be null');
	        assert$1(this.viewHandler === null && this.errorHandler === null, 'SyncEngine already has a subscriber.');
	        this.viewHandler = viewHandler;
	        this.errorHandler = errorHandler;
	    };
	    /**
	     * Initiates the new listen, resolves promise when listen enqueued to the
	     * server. All the subsequent view snapshots or errors are sent to the
	     * subscribed handlers. Returns the targetId of the query.
	     */
	    SyncEngine.prototype.listen = function (query) {
	        var _this = this;
	        this.assertSubscribed('listen()');
	        assert$1(!this.queryViewsByQuery.has(query), 'We already listen to the query: ' + query);
	        return this.localStore.allocateQuery(query).then(function (queryData) {
	            return _this.localStore
	                .executeQuery(query)
	                .then(function (docs) {
	                return _this.localStore
	                    .remoteDocumentKeys(queryData.targetId)
	                    .then(function (remoteKeys) {
	                    var view = new View(query, remoteKeys);
	                    var viewDocChanges = view.computeDocChanges(docs);
	                    var viewChange = view.applyChanges(viewDocChanges);
	                    assert$1(viewChange.limboChanges.length === 0, 'View returned limbo docs before target ack from the server.');
	                    assert$1(!!viewChange.snapshot, 'applyChanges for new view should always return a snapshot');
	                    var data = new QueryView(query, queryData.targetId, queryData.resumeToken, view);
	                    _this.queryViewsByQuery.set(query, data);
	                    _this.queryViewsByTarget[queryData.targetId] = data;
	                    _this.viewHandler([viewChange.snapshot]);
	                    _this.remoteStore.listen(queryData);
	                });
	            })
	                .then(function () {
	                return queryData.targetId;
	            });
	        });
	    };
	    /** Stops listening to the query. */
	    SyncEngine.prototype.unlisten = function (query) {
	        var _this = this;
	        this.assertSubscribed('unlisten()');
	        var queryView = this.queryViewsByQuery.get(query);
	        assert$1(!!queryView, 'Trying to unlisten on query not found:' + query);
	        return this.localStore.releaseQuery(query).then(function () {
	            _this.remoteStore.unlisten(queryView.targetId);
	            return _this.removeAndCleanupQuery(queryView).then(function () {
	                return _this.localStore.collectGarbage();
	            });
	        });
	    };
	    /**
	     * Initiates the write of local mutation batch which involves adding the
	     * writes to the mutation queue, notifying the remote store about new
	     * mutations and raising events for any changes this write caused.
	     *
	     * The promise returned by this call is resolved when the above steps
	     * have completed, *not* when the write was acked by the backend. The
	     * userCallback is resolved once the write was acked/rejected by the
	     * backend (or failed locally for any other reason).
	     */
	    SyncEngine.prototype.write = function (batch, userCallback) {
	        var _this = this;
	        this.assertSubscribed('write()');
	        return this.localStore
	            .localWrite(batch)
	            .then(function (result) {
	            _this.addMutationCallback(result.batchId, userCallback);
	            return _this.emitNewSnapsAndNotifyLocalStore(result.changes);
	        })
	            .then(function () {
	            return _this.remoteStore.fillWritePipeline();
	        });
	    };
	    // TODO(klimt): Wrap the given error in a standard Firestore error object.
	    SyncEngine.prototype.wrapUpdateFunctionError = function (error$$1) {
	        return error$$1;
	    };
	    /**
	     * Takes an updateFunction in which a set of reads and writes can be performed
	     * atomically. In the updateFunction, the client can read and write values
	     * using the supplied transaction object. After the updateFunction, all
	     * changes will be committed. If some other client has changed any of the data
	     * referenced, then the updateFunction will be called again. If the
	     * updateFunction still fails after the given number of retries, then the
	     * transaction will be rejection.
	     *
	     * The transaction object passed to the updateFunction contains methods for
	     * accessing documents and collections. Unlike other datastore access, data
	     * accessed with the transaction will not reflect local changes that have not
	     * been committed. For this reason, it is required that all reads are
	     * performed before any writes. Transactions must be performed while online.
	     *
	     * The promise returned is resolved when the transaction is fully committed.
	     */
	    SyncEngine.prototype.runTransaction = function (updateFunction, retries) {
	        var _this = this;
	        if (retries === void 0) { retries = 5; }
	        assert$1(retries >= 0, 'Got negative number of retries for transaction.');
	        var transaction = this.remoteStore.createTransaction();
	        var wrappedUpdateFunction = function () {
	            try {
	                var userPromise = updateFunction(transaction);
	                if (isNullOrUndefined(userPromise) ||
	                    !userPromise.catch ||
	                    !userPromise.then) {
	                    return Promise.reject(Error('Transaction callback must return a Promise'));
	                }
	                return userPromise.catch(function (e) {
	                    return Promise.reject(_this.wrapUpdateFunctionError(e));
	                });
	            }
	            catch (e) {
	                return Promise.reject(_this.wrapUpdateFunctionError(e));
	            }
	        };
	        return wrappedUpdateFunction().then(function (result) {
	            return transaction
	                .commit()
	                .then(function () {
	                return result;
	            })
	                .catch(function (error$$1) {
	                if (retries === 0) {
	                    return Promise.reject(error$$1);
	                }
	                // TODO(klimt): Put in a retry delay?
	                return _this.runTransaction(updateFunction, retries - 1);
	            });
	        });
	    };
	    SyncEngine.prototype.applyRemoteEvent = function (remoteEvent) {
	        var _this = this;
	        this.assertSubscribed('applyRemoteEvent()');
	        // Update `receivedDocument` as appropriate for any limbo targets.
	        forEach$1(remoteEvent.targetChanges, function (targetId, targetChange) {
	            var limboResolution = _this.limboResolutionsByTarget[targetId];
	            if (limboResolution) {
	                // Since this is a limbo resolution lookup, it's for a single document
	                // and it could be added, modified, or removed, but not a combination.
	                assert$1(targetChange.addedDocuments.size +
	                    targetChange.modifiedDocuments.size +
	                    targetChange.removedDocuments.size <=
	                    1, 'Limbo resolution for single document contains multiple changes.');
	                if (targetChange.addedDocuments.size > 0) {
	                    limboResolution.receivedDocument = true;
	                }
	                else if (targetChange.modifiedDocuments.size > 0) {
	                    assert$1(limboResolution.receivedDocument, 'Received change for limbo target document without add.');
	                }
	                else if (targetChange.removedDocuments.size > 0) {
	                    assert$1(limboResolution.receivedDocument, 'Received remove for limbo target document without add.');
	                    limboResolution.receivedDocument = false;
	                }
	            }
	        });
	        return this.localStore.applyRemoteEvent(remoteEvent).then(function (changes) {
	            return _this.emitNewSnapsAndNotifyLocalStore(changes, remoteEvent);
	        });
	    };
	    /**
	     * Applies an OnlineState change to the sync engine and notifies any views of
	     * the change.
	     */
	    SyncEngine.prototype.applyOnlineStateChange = function (onlineState) {
	        var newViewSnapshots = [];
	        this.queryViewsByQuery.forEach(function (query, queryView) {
	            var viewChange = queryView.view.applyOnlineStateChange(onlineState);
	            assert$1(viewChange.limboChanges.length === 0, 'OnlineState should not affect limbo documents.');
	            if (viewChange.snapshot) {
	                newViewSnapshots.push(viewChange.snapshot);
	            }
	        });
	        this.viewHandler(newViewSnapshots);
	    };
	    SyncEngine.prototype.rejectListen = function (targetId, err) {
	        var _this = this;
	        this.assertSubscribed('rejectListens()');
	        var limboResolution = this.limboResolutionsByTarget[targetId];
	        var limboKey = limboResolution && limboResolution.key;
	        if (limboKey) {
	            // Since this query failed, we won't want to manually unlisten to it.
	            // So go ahead and remove it from bookkeeping.
	            this.limboTargetsByKey = this.limboTargetsByKey.remove(limboKey);
	            delete this.limboResolutionsByTarget[targetId];
	            // TODO(klimt): We really only should do the following on permission
	            // denied errors, but we don't have the cause code here.
	            // It's a limbo doc. Create a synthetic event saying it was deleted.
	            // This is kind of a hack. Ideally, we would have a method in the local
	            // store to purge a document. However, it would be tricky to keep all of
	            // the local store's invariants with another method.
	            var documentUpdates = new SortedMap(DocumentKey.comparator);
	            documentUpdates = documentUpdates.insert(limboKey, new NoDocument(limboKey, SnapshotVersion.forDeletedDoc()));
	            var resolvedLimboDocuments = documentKeySet().add(limboKey);
	            var event_1 = new RemoteEvent(SnapshotVersion.MIN, 
	            /* targetChanges= */ {}, 
	            /* targetMismatches= */ new SortedSet(primitiveComparator), documentUpdates, resolvedLimboDocuments);
	            return this.applyRemoteEvent(event_1);
	        }
	        else {
	            var queryView_1 = this.queryViewsByTarget[targetId];
	            assert$1(!!queryView_1, 'Unknown targetId: ' + targetId);
	            return this.localStore.releaseQuery(queryView_1.query).then(function () {
	                return _this.removeAndCleanupQuery(queryView_1).then(function () {
	                    _this.errorHandler(queryView_1.query, err);
	                });
	            });
	        }
	    };
	    SyncEngine.prototype.applySuccessfulWrite = function (mutationBatchResult) {
	        var _this = this;
	        this.assertSubscribed('applySuccessfulWrite()');
	        // The local store may or may not be able to apply the write result and
	        // raise events immediately (depending on whether the watcher is caught
	        // up), so we raise user callbacks first so that they consistently happen
	        // before listen events.
	        this.processUserCallback(mutationBatchResult.batch.batchId, 
	        /*error=*/ null);
	        return this.localStore
	            .acknowledgeBatch(mutationBatchResult)
	            .then(function (changes) {
	            return _this.emitNewSnapsAndNotifyLocalStore(changes);
	        });
	    };
	    SyncEngine.prototype.rejectFailedWrite = function (batchId, error$$1) {
	        var _this = this;
	        this.assertSubscribed('rejectFailedWrite()');
	        // The local store may or may not be able to apply the write result and
	        // raise events immediately (depending on whether the watcher is caught up),
	        // so we raise user callbacks first so that they consistently happen before
	        // listen events.
	        this.processUserCallback(batchId, error$$1);
	        return this.localStore.rejectBatch(batchId).then(function (changes) {
	            return _this.emitNewSnapsAndNotifyLocalStore(changes);
	        });
	    };
	    SyncEngine.prototype.addMutationCallback = function (batchId, callback) {
	        var newCallbacks = this.mutationUserCallbacks[this.currentUser.toKey()];
	        if (!newCallbacks) {
	            newCallbacks = new SortedMap(primitiveComparator);
	        }
	        newCallbacks = newCallbacks.insert(batchId, callback);
	        this.mutationUserCallbacks[this.currentUser.toKey()] = newCallbacks;
	    };
	    /**
	     * Resolves or rejects the user callback for the given batch and then discards
	     * it.
	     */
	    SyncEngine.prototype.processUserCallback = function (batchId, error$$1) {
	        var newCallbacks = this.mutationUserCallbacks[this.currentUser.toKey()];
	        // NOTE: Mutations restored from persistence won't have callbacks, so it's
	        // okay for there to be no callback for this ID.
	        if (newCallbacks) {
	            var callback = newCallbacks.get(batchId);
	            if (callback) {
	                assert$1(batchId === newCallbacks.minKey(), 'Mutation callbacks processed out-of-order?');
	                if (error$$1) {
	                    callback.reject(error$$1);
	                }
	                else {
	                    callback.resolve();
	                }
	                newCallbacks = newCallbacks.remove(batchId);
	            }
	            this.mutationUserCallbacks[this.currentUser.toKey()] = newCallbacks;
	        }
	    };
	    SyncEngine.prototype.removeAndCleanupQuery = function (queryView) {
	        this.queryViewsByQuery.delete(queryView.query);
	        delete this.queryViewsByTarget[queryView.targetId];
	        this.limboDocumentRefs.removeReferencesForId(queryView.targetId);
	        return this.gcLimboDocuments();
	    };
	    SyncEngine.prototype.updateTrackedLimbos = function (targetId, limboChanges) {
	        var this$1 = this;

	        for (var _i = 0, limboChanges_1 = limboChanges; _i < limboChanges_1.length; _i++) {
	            var limboChange = limboChanges_1[_i];
	            if (limboChange instanceof AddedLimboDocument) {
	                this$1.limboDocumentRefs.addReference(limboChange.key, targetId);
	                this$1.trackLimboChange(limboChange);
	            }
	            else if (limboChange instanceof RemovedLimboDocument) {
	                debug(LOG_TAG$1, 'Document no longer in limbo: ' + limboChange.key);
	                this$1.limboDocumentRefs.removeReference(limboChange.key, targetId);
	            }
	            else {
	                fail('Unknown limbo change: ' + JSON.stringify(limboChange));
	            }
	        }
	        return this.gcLimboDocuments();
	    };
	    SyncEngine.prototype.trackLimboChange = function (limboChange) {
	        var key = limboChange.key;
	        if (!this.limboTargetsByKey.get(key)) {
	            debug(LOG_TAG$1, 'New document in limbo: ' + key);
	            var limboTargetId = this.targetIdGenerator.next();
	            var query = Query.atPath(key.path);
	            this.limboResolutionsByTarget[limboTargetId] = new LimboResolution(key);
	            this.remoteStore.listen(new QueryData(query, limboTargetId, QueryPurpose.LimboResolution));
	            this.limboTargetsByKey = this.limboTargetsByKey.insert(key, limboTargetId);
	        }
	    };
	    SyncEngine.prototype.gcLimboDocuments = function () {
	        var _this = this;
	        // HACK: We can use a null transaction here, because we know that the
	        // reference set is entirely within memory and doesn't need a store engine.
	        return this.limboCollector
	            .collectGarbage(null)
	            .next(function (keys) {
	            keys.forEach(function (key) {
	                var limboTargetId = _this.limboTargetsByKey.get(key);
	                if (limboTargetId === null) {
	                    // This target already got removed, because the query failed.
	                    return;
	                }
	                _this.remoteStore.unlisten(limboTargetId);
	                _this.limboTargetsByKey = _this.limboTargetsByKey.remove(key);
	                delete _this.limboResolutionsByTarget[limboTargetId];
	            });
	        })
	            .toPromise();
	    };
	    // Visible for testing
	    SyncEngine.prototype.currentLimboDocs = function () {
	        return this.limboTargetsByKey;
	    };
	    SyncEngine.prototype.emitNewSnapsAndNotifyLocalStore = function (changes, remoteEvent) {
	        var _this = this;
	        var newSnaps = [];
	        var docChangesInAllViews = [];
	        var queriesProcessed = [];
	        this.queryViewsByQuery.forEach(function (_, queryView) {
	            queriesProcessed.push(Promise.resolve()
	                .then(function () {
	                var viewDocChanges = queryView.view.computeDocChanges(changes);
	                if (!viewDocChanges.needsRefill) {
	                    return viewDocChanges;
	                }
	                // The query has a limit and some docs were removed, so we need
	                // to re-run the query against the local store to make sure we
	                // didn't lose any good docs that had been past the limit.
	                return _this.localStore.executeQuery(queryView.query).then(function (docs) {
	                    return queryView.view.computeDocChanges(docs, viewDocChanges);
	                });
	            })
	                .then(function (viewDocChanges) {
	                var targetChange = remoteEvent && remoteEvent.targetChanges[queryView.targetId];
	                var viewChange = queryView.view.applyChanges(viewDocChanges, targetChange);
	                return _this.updateTrackedLimbos(queryView.targetId, viewChange.limboChanges).then(function () {
	                    if (viewChange.snapshot) {
	                        newSnaps.push(viewChange.snapshot);
	                        var docChanges = LocalViewChanges.fromSnapshot(viewChange.snapshot);
	                        docChangesInAllViews.push(docChanges);
	                    }
	                });
	            }));
	        });
	        return Promise.all(queriesProcessed)
	            .then(function () {
	            _this.viewHandler(newSnaps);
	            return _this.localStore.notifyLocalViewChanges(docChangesInAllViews);
	        })
	            .then(function () {
	            return _this.localStore.collectGarbage();
	        });
	    };
	    SyncEngine.prototype.assertSubscribed = function (fnName) {
	        assert$1(this.viewHandler !== null && this.errorHandler !== null, 'Trying to call ' + fnName + ' before calling subscribe().');
	    };
	    SyncEngine.prototype.handleUserChange = function (user) {
	        var _this = this;
	        this.currentUser = user;
	        return this.localStore
	            .handleUserChange(user)
	            .then(function (changes) {
	            return _this.emitNewSnapsAndNotifyLocalStore(changes);
	        })
	            .then(function () {
	            return _this.remoteStore.handleUserChange(user);
	        });
	    };
	    SyncEngine.prototype.getRemoteKeysForTarget = function (targetId) {
	        var limboResolution = this.limboResolutionsByTarget[targetId];
	        if (limboResolution && limboResolution.receivedDocument) {
	            return documentKeySet().add(limboResolution.key);
	        }
	        else {
	            return this.queryViewsByTarget[targetId]
	                ? this.queryViewsByTarget[targetId].view.syncedDocuments
	                : documentKeySet();
	        }
	    };
	    return SyncEngine;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var BATCHID_UNKNOWN = -1;
	/**
	 * A batch of mutations that will be sent as one unit to the backend.
	 */
	var MutationBatch = /** @class */ (function () {
	    function MutationBatch(batchId, localWriteTime, mutations) {
	        this.batchId = batchId;
	        this.localWriteTime = localWriteTime;
	        this.mutations = mutations;
	    }
	    /**
	     * Applies all the mutations in this MutationBatch to the specified document
	     * to create a new remote document
	     *
	     * @param docKey The key of the document to apply mutations to.
	     * @param maybeDoc The document to apply mutations to.
	     * @param batchResult The result of applying the MutationBatch to the
	     * backend.
	     */
	    MutationBatch.prototype.applyToRemoteDocument = function (docKey, maybeDoc, batchResult) {
	        var this$1 = this;

	        if (maybeDoc) {
	            assert$1(maybeDoc.key.isEqual(docKey), "applyToRemoteDocument: key " + docKey + " should match maybeDoc key\n        " + maybeDoc.key);
	        }
	        var mutationResults = batchResult.mutationResults;
	        assert$1(mutationResults.length === this.mutations.length, "Mismatch between mutations length\n      (" + this.mutations.length + ") and mutation results length\n      (" + mutationResults.length + ").");
	        for (var i = 0; i < this.mutations.length; i++) {
	            var mutation = this$1.mutations[i];
	            if (mutation.key.isEqual(docKey)) {
	                var mutationResult = mutationResults[i];
	                maybeDoc = mutation.applyToRemoteDocument(maybeDoc, mutationResult);
	            }
	        }
	        return maybeDoc;
	    };
	    /**
	     * Computes the local view of a document given all the mutations in this
	     * batch.
	     *
	     * @param docKey The key of the document to apply mutations to.
	     * @param maybeDoc The document to apply mutations to.
	     */
	    MutationBatch.prototype.applyToLocalView = function (docKey, maybeDoc) {
	        var this$1 = this;

	        if (maybeDoc) {
	            assert$1(maybeDoc.key.isEqual(docKey), "applyToLocalDocument: key " + docKey + " should match maybeDoc key\n        " + maybeDoc.key);
	        }
	        var baseDoc = maybeDoc;
	        for (var i = 0; i < this.mutations.length; i++) {
	            var mutation = this$1.mutations[i];
	            if (mutation.key.isEqual(docKey)) {
	                maybeDoc = mutation.applyToLocalView(maybeDoc, baseDoc, this$1.localWriteTime);
	            }
	        }
	        return maybeDoc;
	    };
	    MutationBatch.prototype.keys = function () {
	        var keySet = documentKeySet();
	        for (var _i = 0, _a = this.mutations; _i < _a.length; _i++) {
	            var mutation = _a[_i];
	            keySet = keySet.add(mutation.key);
	        }
	        return keySet;
	    };
	    MutationBatch.prototype.isEqual = function (other) {
	        return (this.batchId === other.batchId &&
	            arrayEquals(this.mutations, other.mutations));
	    };
	    /**
	     * Returns true if this mutation batch has already been removed from the
	     * mutation queue.
	     *
	     * Note that not all implementations of the MutationQueue necessarily use
	     * tombstones as part of their implementation and generally speaking no code
	     * outside the mutation queues should really care about this.
	     */
	    MutationBatch.prototype.isTombstone = function () {
	        return this.mutations.length === 0;
	    };
	    /** Converts this batch into a tombstone */
	    MutationBatch.prototype.toTombstone = function () {
	        return new MutationBatch(this.batchId, this.localWriteTime, []);
	    };
	    return MutationBatch;
	}());
	/** The result of applying a mutation batch to the backend. */
	var MutationBatchResult = /** @class */ (function () {
	    function MutationBatchResult(batch, commitVersion, mutationResults, streamToken, 
	    /**
	     * A pre-computed mapping from each mutated document to the resulting
	     * version.
	     */
	    docVersions) {
	        this.batch = batch;
	        this.commitVersion = commitVersion;
	        this.mutationResults = mutationResults;
	        this.streamToken = streamToken;
	        this.docVersions = docVersions;
	    }
	    /**
	     * Creates a new MutationBatchResult for the given batch and results. There
	     * must be one result for each mutation in the batch. This static factory
	     * caches a document=>version mapping (docVersions).
	     */
	    MutationBatchResult.from = function (batch, commitVersion, results, streamToken) {
	        assert$1(batch.mutations.length === results.length, 'Mutations sent ' +
	            batch.mutations.length +
	            ' must equal results received ' +
	            results.length);
	        var versionMap = documentVersionMap();
	        var mutations = batch.mutations;
	        for (var i = 0; i < mutations.length; i++) {
	            var version = results[i].version;
	            if (version === null) {
	                // deletes don't have a version, so we substitute the commitVersion
	                // of the entire batch.
	                version = commitVersion;
	            }
	            versionMap = versionMap.insert(mutations[i].key, version);
	        }
	        return new MutationBatchResult(batch, commitVersion, results, streamToken, versionMap);
	    };
	    return MutationBatchResult;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var escapeChar = '\u0001';
	var encodedSeparatorChar = '\u0001';
	var encodedNul = '\u0010';
	var encodedEscape = '\u0011';
	/**
	 * Encodes a resource path into a IndexedDb-compatible string form.
	 */
	function encode(path) {
	    var result = '';
	    for (var i = 0; i < path.length; i++) {
	        if (result.length > 0) {
	            result = encodeSeparator(result);
	        }
	        result = encodeSegment(path.get(i), result);
	    }
	    return encodeSeparator(result);
	}
	/** Encodes a single segment of a resource path into the given result */
	function encodeSegment(segment, resultBuf) {
	    var result = resultBuf;
	    var length = segment.length;
	    for (var i = 0; i < length; i++) {
	        var c = segment.charAt(i);
	        switch (c) {
	            case '\0':
	                result += escapeChar + encodedNul;
	                break;
	            case escapeChar:
	                result += escapeChar + encodedEscape;
	                break;
	            default:
	                result += c;
	        }
	    }
	    return result;
	}
	/** Encodes a path separator into the given result */
	function encodeSeparator(result) {
	    return result + escapeChar + encodedSeparatorChar;
	}
	/**
	 * Decodes the given IndexedDb-compatible string form of a resource path into
	 * a ResourcePath instance. Note that this method is not suitable for use with
	 * decoding resource names from the server; those are One Platform format
	 * strings.
	 */
	function decode$1(path) {
	    // Event the empty path must encode as a path of at least length 2. A path
	    // with exactly 2 must be the empty path.
	    var length = path.length;
	    assert$1(length >= 2, 'Invalid path ' + path);
	    if (length === 2) {
	        assert$1(path.charAt(0) === escapeChar && path.charAt(1) === encodedSeparatorChar, 'Non-empty path ' + path + ' had length 2');
	        return ResourcePath.EMPTY_PATH;
	    }
	    // Escape characters cannot exist past the second-to-last position in the
	    // source value.
	    var lastReasonableEscapeIndex = length - 2;
	    var segments = [];
	    var segmentBuilder = '';
	    for (var start = 0; start < length;) {
	        // The last two characters of a valid encoded path must be a separator, so
	        // there must be an end to this segment.
	        var end = path.indexOf(escapeChar, start);
	        if (end < 0 || end > lastReasonableEscapeIndex) {
	            fail('Invalid encoded resource path: "' + path + '"');
	        }
	        var next = path.charAt(end + 1);
	        switch (next) {
	            case encodedSeparatorChar:
	                var currentPiece = path.substring(start, end);
	                var segment = void 0;
	                if (segmentBuilder.length === 0) {
	                    // Avoid copying for the common case of a segment that excludes \0
	                    // and \001
	                    segment = currentPiece;
	                }
	                else {
	                    segmentBuilder += currentPiece;
	                    segment = segmentBuilder;
	                    segmentBuilder = '';
	                }
	                segments.push(segment);
	                break;
	            case encodedNul:
	                segmentBuilder += path.substring(start, end);
	                segmentBuilder += '\0';
	                break;
	            case encodedEscape:
	                // The escape character can be used in the output to encode itself.
	                segmentBuilder += path.substring(start, end + 1);
	                break;
	            default:
	                fail('Invalid encoded resource path: "' + path + '"');
	        }
	        start = end + 2;
	    }
	    return new ResourcePath(segments);
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Schema Version for the Web client:
	 * 1. Initial version including Mutation Queue, Query Cache, and Remote Document
	 *    Cache
	 * 2. Used to ensure a targetGlobal object exists and add targetCount to it. No
	 *    longer required because migration 3 unconditionally clears it.
	 * 3. Dropped and re-created Query Cache to deal with cache corruption related
	 *    to limbo resolution. Addresses
	 *    https://github.com/firebase/firebase-ios-sdk/issues/1548
	 */
	var SCHEMA_VERSION = 3;
	/**
	 * Performs database creation and schema upgrades.
	 *
	 * Note that in production, this method is only ever used to upgrade the schema
	 * to SCHEMA_VERSION. Different values of toVersion are only used for testing
	 * and local feature development.
	 */
	function createOrUpgradeDb(db, txn, fromVersion, toVersion) {
	    assert$1(fromVersion < toVersion && fromVersion >= 0 && toVersion <= SCHEMA_VERSION, 'Unexpected schema upgrade from v${fromVersion} to v{toVersion}.');
	    if (fromVersion < 1 && toVersion >= 1) {
	        createOwnerStore(db);
	        createMutationQueue(db);
	        createQueryCache(db);
	        createRemoteDocumentCache(db);
	    }
	    // Migration 2 to populate the targetGlobal object no longer needed since
	    // migration 3 unconditionally clears it.
	    var p = PersistencePromise.resolve();
	    if (fromVersion < 3 && toVersion >= 3) {
	        // Brand new clients don't need to drop and recreate--only clients that
	        // potentially have corrupt data.
	        if (fromVersion !== 0) {
	            dropQueryCache(db);
	            createQueryCache(db);
	        }
	        p = p.next(function () { return writeEmptyTargetGlobalEntry(txn); });
	    }
	    return p;
	}
	/**
	 * Wrapper class to store timestamps (seconds and nanos) in IndexedDb objects.
	 */
	var DbTimestamp = /** @class */ (function () {
	    function DbTimestamp(seconds, nanoseconds) {
	        this.seconds = seconds;
	        this.nanoseconds = nanoseconds;
	    }
	    return DbTimestamp;
	}());
	/**
	 * A singleton object to be stored in the 'owner' store in IndexedDb.
	 *
	 * A given database can be owned by a single tab at a given time. That tab
	 * must validate that it is still the owner before every write operation and
	 * should regularly write an updated timestamp to prevent other tabs from
	 * "stealing" ownership of the db.
	 */
	var DbOwner = /** @class */ (function () {
	    function DbOwner(ownerId, leaseTimestampMs) {
	        this.ownerId = ownerId;
	        this.leaseTimestampMs = leaseTimestampMs;
	    }
	    /** Name of the IndexedDb object store. */
	    DbOwner.store = 'owner';
	    return DbOwner;
	}());
	function createOwnerStore(db) {
	    db.createObjectStore(DbOwner.store);
	}
	/**
	 * An object to be stored in the 'mutationQueues' store in IndexedDb.
	 *
	 * Each user gets a single queue of MutationBatches to apply to the server.
	 * DbMutationQueue tracks the metadata about the queue.
	 */
	var DbMutationQueue = /** @class */ (function () {
	    function DbMutationQueue(
	    /**
	     * The normalized user ID to which this queue belongs.
	     */
	    userId, 
	    /**
	     * An identifier for the highest numbered batch that has been acknowledged
	     * by the server. All MutationBatches in this queue with batchIds less
	     * than or equal to this value are considered to have been acknowledged by
	     * the server.
	     */
	    lastAcknowledgedBatchId, 
	    /**
	     * A stream token that was previously sent by the server.
	     *
	     * See StreamingWriteRequest in datastore.proto for more details about
	     * usage.
	     *
	     * After sending this token, earlier tokens may not be used anymore so
	     * only a single stream token is retained.
	     */
	    lastStreamToken) {
	        this.userId = userId;
	        this.lastAcknowledgedBatchId = lastAcknowledgedBatchId;
	        this.lastStreamToken = lastStreamToken;
	    }
	    /** Name of the IndexedDb object store.  */
	    DbMutationQueue.store = 'mutationQueues';
	    /** Keys are automatically assigned via the userId property. */
	    DbMutationQueue.keyPath = 'userId';
	    return DbMutationQueue;
	}());
	/**
	 * An object to be stored in the 'mutations' store in IndexedDb.
	 *
	 * Represents a batch of user-level mutations intended to be sent to the server
	 * in a single write. Each user-level batch gets a separate DbMutationBatch
	 * with a new batchId.
	 */
	var DbMutationBatch = /** @class */ (function () {
	    function DbMutationBatch(
	    /**
	     * The normalized user ID to which this batch belongs.
	     */
	    userId, 
	    /**
	     * An identifier for this batch, allocated by the mutation queue in a
	     * monotonically increasing manner.
	     */
	    batchId, 
	    /**
	     * The local write time of the batch, stored as milliseconds since the
	     * epoch.
	     */
	    localWriteTimeMs, 
	    /**
	     * A list of mutations to apply. All mutations will be applied atomically.
	     *
	     * Mutations are serialized via JsonProtoSerializer.toMutation().
	     */
	    mutations) {
	        this.userId = userId;
	        this.batchId = batchId;
	        this.localWriteTimeMs = localWriteTimeMs;
	        this.mutations = mutations;
	    }
	    /** Name of the IndexedDb object store.  */
	    DbMutationBatch.store = 'mutations';
	    /** Keys are automatically assigned via the userId, batchId properties. */
	    DbMutationBatch.keyPath = ['userId', 'batchId'];
	    return DbMutationBatch;
	}());
	function createMutationQueue(db) {
	    db.createObjectStore(DbMutationQueue.store, {
	        keyPath: DbMutationQueue.keyPath
	    });
	    db.createObjectStore(DbMutationBatch.store, {
	        keyPath: DbMutationBatch.keyPath
	    });
	    db.createObjectStore(DbDocumentMutation.store);
	}
	/**
	 * An object to be stored in the 'documentMutations' store in IndexedDb.
	 *
	 * A manually maintained index of all the mutation batches that affect a given
	 * document key. The rows in this table are references based on the contents of
	 * DbMutationBatch.mutations.
	 */
	var DbDocumentMutation = /** @class */ (function () {
	    function DbDocumentMutation() {
	    }
	    /**
	     * Creates a [userId] key for use in the DbDocumentMutations index to iterate
	     * over all of a user's document mutations.
	     */
	    DbDocumentMutation.prefixForUser = function (userId) {
	        return [userId];
	    };
	    /**
	     * Creates a [userId, encodedPath] key for use in the DbDocumentMutations
	     * index to iterate over all at document mutations for a given path or lower.
	     */
	    DbDocumentMutation.prefixForPath = function (userId, path) {
	        return [userId, encode(path)];
	    };
	    /**
	     * Creates a full index key of [userId, encodedPath, batchId] for inserting
	     * and deleting into the DbDocumentMutations index.
	     */
	    DbDocumentMutation.key = function (userId, path, batchId) {
	        return [userId, encode(path), batchId];
	    };
	    DbDocumentMutation.store = 'documentMutations';
	    /**
	     * Because we store all the useful information for this store in the key,
	     * there is no useful information to store as the value. The raw (unencoded)
	     * path cannot be stored because IndexedDb doesn't store prototype
	     * information.
	     */
	    DbDocumentMutation.PLACEHOLDER = new DbDocumentMutation();
	    return DbDocumentMutation;
	}());
	function createRemoteDocumentCache(db) {
	    db.createObjectStore(DbRemoteDocument.store);
	}
	/**
	 * Represents the known absence of a document at a particular version.
	 * Stored in IndexedDb as part of a DbRemoteDocument object.
	 */
	var DbNoDocument = /** @class */ (function () {
	    function DbNoDocument(path, readTime) {
	        this.path = path;
	        this.readTime = readTime;
	    }
	    return DbNoDocument;
	}());
	/**
	 * An object to be stored in the 'remoteDocuments' store in IndexedDb. It
	 * represents either a cached document (if it exists) or a cached "no-document"
	 * (if it is known to not exist).
	 *
	 * Note: This is the persisted equivalent of a MaybeDocument and could perhaps
	 * be made more general if necessary.
	 */
	var DbRemoteDocument = /** @class */ (function () {
	    function DbRemoteDocument(
	    /**
	     * Set to an instance of a DbNoDocument if it is known that no document
	     * exists.
	     */
	    noDocument, 
	    /**
	     * Set to an instance of a Document if there's a cached version of the
	     * document.
	     */
	    document) {
	        this.noDocument = noDocument;
	        this.document = document;
	    }
	    DbRemoteDocument.store = 'remoteDocuments';
	    return DbRemoteDocument;
	}());
	/**
	 * An object to be stored in the 'targets' store in IndexedDb.
	 *
	 * This is based on and should be kept in sync with the proto used in the iOS
	 * client.
	 *
	 * Each query the client listens to against the server is tracked on disk so
	 * that the query can be efficiently resumed on restart.
	 */
	var DbTarget = /** @class */ (function () {
	    function DbTarget(
	    /**
	     * An auto-generated sequential numeric identifier for the query.
	     *
	     * Queries are stored using their canonicalId as the key, but these
	     * canonicalIds can be quite long so we additionally assign a unique
	     * queryId which can be used by referenced data structures (e.g.
	     * indexes) to minimize the on-disk cost.
	     */
	    targetId, 
	    /**
	     * The canonical string representing this query. This is not unique.
	     */
	    canonicalId, 
	    /**
	     * The last readTime received from the Watch Service for this query.
	     *
	     * This is the same value as TargetChange.read_time in the protos.
	     */
	    readTime, 
	    /**
	     * An opaque, server-assigned token that allows watching a query to be
	     * resumed after disconnecting without retransmitting all the data
	     * that matches the query. The resume token essentially identifies a
	     * point in time from which the server should resume sending results.
	     *
	     * This is related to the snapshotVersion in that the resumeToken
	     * effectively also encodes that value, but the resumeToken is opaque
	     * and sometimes encodes additional information.
	     *
	     * A consequence of this is that the resumeToken should be used when
	     * asking the server to reason about where this client is in the watch
	     * stream, but the client should use the snapshotVersion for its own
	     * purposes.
	     *
	     * This is the same value as TargetChange.resume_token in the protos.
	     */
	    resumeToken, 
	    /**
	     * A sequence number representing the last time this query was
	     * listened to, used for garbage collection purposes.
	     *
	     * Conventionally this would be a timestamp value, but device-local
	     * clocks are unreliable and they must be able to create new listens
	     * even while disconnected. Instead this should be a monotonically
	     * increasing number that's incremented on each listen call.
	     *
	     * This is different from the queryId since the queryId is an
	     * immutable identifier assigned to the Query on first use while
	     * lastListenSequenceNumber is updated every time the query is
	     * listened to.
	     */
	    lastListenSequenceNumber, 
	    /**
	     * The query for this target.
	     *
	     * Because canonical ids are not unique we must store the actual query. We
	     * use the proto to have an object we can persist without having to
	     * duplicate translation logic to and from a `Query` object.
	     */
	    query) {
	        this.targetId = targetId;
	        this.canonicalId = canonicalId;
	        this.readTime = readTime;
	        this.resumeToken = resumeToken;
	        this.lastListenSequenceNumber = lastListenSequenceNumber;
	        this.query = query;
	    }
	    DbTarget.store = 'targets';
	    /** Keys are automatically assigned via the targetId property. */
	    DbTarget.keyPath = 'targetId';
	    /** The name of the queryTargets index. */
	    DbTarget.queryTargetsIndexName = 'queryTargetsIndex';
	    /**
	     * The index of all canonicalIds to the targets that they match. This is not
	     * a unique mapping because canonicalId does not promise a unique name for all
	     * possible queries, so we append the targetId to make the mapping unique.
	     */
	    DbTarget.queryTargetsKeyPath = ['canonicalId', 'targetId'];
	    return DbTarget;
	}());
	/**
	 * An object representing an association between a target and a document.
	 * Stored in the targetDocument object store to store the documents tracked by a
	 * particular target.
	 */
	var DbTargetDocument = /** @class */ (function () {
	    function DbTargetDocument(
	    /**
	     * The targetId identifying a target.
	     */
	    targetId, 
	    /**
	     * The path to the document, as encoded in the key.
	     */
	    path) {
	        this.targetId = targetId;
	        this.path = path;
	    }
	    /** Name of the IndexedDb object store.  */
	    DbTargetDocument.store = 'targetDocuments';
	    /** Keys are automatically assigned via the targetId, path properties. */
	    DbTargetDocument.keyPath = ['targetId', 'path'];
	    /** The index name for the reverse index. */
	    DbTargetDocument.documentTargetsIndex = 'documentTargetsIndex';
	    /** We also need to create the reverse index for these properties. */
	    DbTargetDocument.documentTargetsKeyPath = ['path', 'targetId'];
	    return DbTargetDocument;
	}());
	/**
	 * A record of global state tracked across all Targets, tracked separately
	 * to avoid the need for extra indexes.
	 *
	 * This should be kept in-sync with the proto used in the iOS client.
	 */
	var DbTargetGlobal = /** @class */ (function () {
	    function DbTargetGlobal(
	    /**
	     * The highest numbered target id across all targets.
	     *
	     * See DbTarget.targetId.
	     */
	    highestTargetId, 
	    /**
	     * The highest numbered lastListenSequenceNumber across all targets.
	     *
	     * See DbTarget.lastListenSequenceNumber.
	     */
	    highestListenSequenceNumber, 
	    /**
	     * A global snapshot version representing the last consistent snapshot we
	     * received from the backend. This is monotonically increasing and any
	     * snapshots received from the backend prior to this version (e.g. for
	     * targets resumed with a resumeToken) should be suppressed (buffered)
	     * until the backend has caught up to this snapshot version again. This
	     * prevents our cache from ever going backwards in time.
	     */
	    lastRemoteSnapshotVersion, 
	    /**
	     * The number of targets persisted.
	     */
	    targetCount) {
	        this.highestTargetId = highestTargetId;
	        this.highestListenSequenceNumber = highestListenSequenceNumber;
	        this.lastRemoteSnapshotVersion = lastRemoteSnapshotVersion;
	        this.targetCount = targetCount;
	    }
	    /**
	     * The key string used for the single object that exists in the
	     * DbTargetGlobal store.
	     */
	    DbTargetGlobal.key = 'targetGlobalKey';
	    DbTargetGlobal.store = 'targetGlobal';
	    return DbTargetGlobal;
	}());
	function createQueryCache(db) {
	    var targetDocumentsStore = db.createObjectStore(DbTargetDocument.store, {
	        keyPath: DbTargetDocument.keyPath
	    });
	    targetDocumentsStore.createIndex(DbTargetDocument.documentTargetsIndex, DbTargetDocument.documentTargetsKeyPath, { unique: true });
	    var targetStore = db.createObjectStore(DbTarget.store, {
	        keyPath: DbTarget.keyPath
	    });
	    // NOTE: This is unique only because the TargetId is the suffix.
	    targetStore.createIndex(DbTarget.queryTargetsIndexName, DbTarget.queryTargetsKeyPath, { unique: true });
	    db.createObjectStore(DbTargetGlobal.store);
	}
	function dropQueryCache(db) {
	    db.deleteObjectStore(DbTargetDocument.store);
	    db.deleteObjectStore(DbTarget.store);
	    db.deleteObjectStore(DbTargetGlobal.store);
	}
	/**
	 * Creates the target global singleton row.
	 *
	 * @param {IDBTransaction} txn The version upgrade transaction for indexeddb
	 */
	function writeEmptyTargetGlobalEntry(txn) {
	    var globalStore = txn.store(DbTargetGlobal.store);
	    var metadata = new DbTargetGlobal(
	    /*highestTargetId=*/ 0, 
	    /*lastListenSequenceNumber=*/ 0, SnapshotVersion.MIN.toTimestamp(), 
	    /*targetCount=*/ 0);
	    return globalStore.put(DbTargetGlobal.key, metadata);
	}
	/**
	 * The list of all default IndexedDB stores used throughout the SDK. This is
	 * used when creating transactions so that access across all stores is done
	 * atomically.
	 */
	var ALL_STORES = [
	    DbMutationQueue.store,
	    DbMutationBatch.store,
	    DbDocumentMutation.store,
	    DbRemoteDocument.store,
	    DbTarget.store,
	    DbOwner.store,
	    DbTargetGlobal.store,
	    DbTargetDocument.store
	];

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var Deferred$1 = /** @class */ (function () {
	    function Deferred() {
	        var _this = this;
	        this.promise = new Promise(function (resolve, reject) {
	            _this.resolve = resolve;
	            _this.reject = reject;
	        });
	    }
	    return Deferred;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG$2 = 'SimpleDb';
	/**
	 * Provides a wrapper around IndexedDb with a simplified interface that uses
	 * Promise-like return values to chain operations. Real promises cannot be used
	 * since .then() continuations are executed asynchronously (e.g. via
	 * .setImmediate), which would cause IndexedDB to end the transaction.
	 * See PersistencePromise for more details.
	 */
	var SimpleDb = /** @class */ (function () {
	    function SimpleDb(db) {
	        this.db = db;
	    }
	    /** Opens the specified database, creating or upgrading it if necessary. */
	    SimpleDb.openOrCreate = function (name, version, runUpgrade) {
	        assert$1(SimpleDb.isAvailable(), 'IndexedDB not supported in current environment.');
	        debug(LOG_TAG$2, 'Opening database:', name);
	        return new PersistencePromise(function (resolve, reject) {
	            // TODO(mikelehen): Investigate browser compatibility.
	            // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
	            // suggests IE9 and older WebKit browsers handle upgrade
	            // differently. They expect setVersion, as described here:
	            // https://developer.mozilla.org/en-US/docs/Web/API/IDBVersionChangeRequest/setVersion
	            var request = window.indexedDB.open(name, version);
	            request.onsuccess = function (event) {
	                var db = event.target.result;
	                resolve(new SimpleDb(db));
	            };
	            request.onblocked = function () {
	                reject(new FirestoreError(Code.FAILED_PRECONDITION, 'Cannot upgrade IndexedDB schema while another tab is open. ' +
	                    'Close all tabs that access Firestore and reload this page to proceed.'));
	            };
	            request.onerror = function (event) {
	                reject(event.target.error);
	            };
	            request.onupgradeneeded = function (event) {
	                debug(LOG_TAG$2, 'Database "' + name + '" requires upgrade from version:', event.oldVersion);
	                var db = event.target.result;
	                // We are provided a version upgrade transaction from the request, so
	                // we wrap that in a SimpleDbTransaction to allow use of our friendlier
	                // API for schema migration operations.
	                var txn = new SimpleDbTransaction(request.transaction);
	                runUpgrade(db, txn, event.oldVersion, SCHEMA_VERSION).next(function () {
	                    debug(LOG_TAG$2, 'Database upgrade to version ' + SCHEMA_VERSION + ' complete');
	                });
	            };
	        }).toPromise();
	    };
	    /** Deletes the specified database. */
	    SimpleDb.delete = function (name) {
	        debug(LOG_TAG$2, 'Removing database:', name);
	        return wrapRequest(window.indexedDB.deleteDatabase(name)).toPromise();
	    };
	    /** Returns true if IndexedDB is available in the current environment. */
	    SimpleDb.isAvailable = function () {
	        if (typeof window === 'undefined' || window.indexedDB == null) {
	            return false;
	        }
	        // We extensively use indexed array values and compound keys,
	        // which IE and Edge do not support. However, they still have indexedDB
	        // defined on the window, so we need to check for them here and make sure
	        // to return that persistence is not enabled for those browsers.
	        // For tracking support of this feature, see here:
	        // https://developer.microsoft.com/en-us/microsoft-edge/platform/status/indexeddbarraysandmultientrysupport/
	        // If we are running in Node using the IndexedDBShim, `window` is defined,
	        // but `window.navigator` is not. In this case, we support IndexedDB and
	        // return `true`.
	        if (window.navigator === undefined) {
	            return process.env.USE_MOCK_PERSISTENCE === 'YES';
	        }
	        // Check the UA string to find out the browser.
	        // TODO(mikelehen): Move this logic into packages/util/environment.ts
	        var ua = window.navigator.userAgent;
	        // IE 10
	        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
	        // IE 11
	        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
	        // Edge
	        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML,
	        // like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
	        if (ua.indexOf('MSIE ') > 0 ||
	            ua.indexOf('Trident/') > 0 ||
	            ua.indexOf('Edge/') > 0) {
	            return false;
	        }
	        else {
	            return true;
	        }
	    };
	    /** Helper to get a typed SimpleDbStore from a transaction. */
	    SimpleDb.getStore = function (txn, store) {
	        if (txn instanceof SimpleDbTransaction) {
	            return txn.store(store);
	        }
	        else {
	            return fail('Invalid transaction object provided!');
	        }
	    };
	    SimpleDb.prototype.runTransaction = function (mode, objectStores, transactionFn) {
	        var transaction = SimpleDbTransaction.open(this.db, mode, objectStores);
	        var transactionFnResult = transactionFn(transaction)
	            .catch(function (error$$1) {
	            // Abort the transaction if there was an error.
	            transaction.abort(error$$1);
	        })
	            .toPromise();
	        // Wait for the transaction to complete (i.e. IndexedDb's onsuccess event to
	        // fire), but still return the original transactionFnResult back to the
	        // caller.
	        return transaction.completionPromise.then(function () { return transactionFnResult; });
	    };
	    SimpleDb.prototype.close = function () {
	        this.db.close();
	    };
	    return SimpleDb;
	}());
	/**
	 * A controller for iterating over a key range or index. It allows an iterate
	 * callback to delete the currently-referenced object, or jump to a new key
	 * within the key range or index.
	 */
	var IterationController = /** @class */ (function () {
	    function IterationController(dbCursor) {
	        this.dbCursor = dbCursor;
	        this.shouldStop = false;
	        this.nextKey = null;
	    }
	    Object.defineProperty(IterationController.prototype, "isDone", {
	        get: function () {
	            return this.shouldStop;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(IterationController.prototype, "skipToKey", {
	        get: function () {
	            return this.nextKey;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(IterationController.prototype, "cursor", {
	        set: function (value) {
	            this.dbCursor = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * This function can be called to stop iteration at any point.
	     */
	    IterationController.prototype.done = function () {
	        this.shouldStop = true;
	    };
	    /**
	     * This function can be called to skip to that next key, which could be
	     * an index or a primary key.
	     */
	    IterationController.prototype.skip = function (key) {
	        this.nextKey = key;
	    };
	    /**
	     * Delete the current cursor value from the object store.
	     *
	     * NOTE: You CANNOT do this with a keysOnly query.
	     */
	    IterationController.prototype.delete = function () {
	        return wrapRequest(this.dbCursor.delete());
	    };
	    return IterationController;
	}());
	/**
	 * Wraps an IDBTransaction and exposes a store() method to get a handle to a
	 * specific object store.
	 */
	var SimpleDbTransaction = /** @class */ (function () {
	    function SimpleDbTransaction(transaction) {
	        var _this = this;
	        this.transaction = transaction;
	        this.aborted = false;
	        /**
	         * A promise that resolves with the result of the IndexedDb transaction.
	         */
	        this.completionDeferred = new Deferred$1();
	        this.transaction.oncomplete = function () {
	            _this.completionDeferred.resolve();
	        };
	        this.transaction.onabort = function () {
	            if (transaction.error) {
	                _this.completionDeferred.reject(transaction.error);
	            }
	            else {
	                _this.completionDeferred.resolve();
	            }
	        };
	        this.transaction.onerror = function (event) {
	            _this.completionDeferred.reject(event.target.error);
	        };
	    }
	    SimpleDbTransaction.open = function (db, mode, objectStoreNames) {
	        return new SimpleDbTransaction(db.transaction(objectStoreNames, mode));
	    };
	    Object.defineProperty(SimpleDbTransaction.prototype, "completionPromise", {
	        get: function () {
	            return this.completionDeferred.promise;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    SimpleDbTransaction.prototype.abort = function (error$$1) {
	        if (error$$1) {
	            this.completionDeferred.reject(error$$1);
	        }
	        if (!this.aborted) {
	            debug(LOG_TAG$2, 'Aborting transaction: %s', error$$1 ? error$$1.message : 'Client-initiated abort');
	            this.aborted = true;
	            this.transaction.abort();
	        }
	    };
	    /**
	     * Returns a SimpleDbStore<KeyType, ValueType> for the specified store. All
	     * operations performed on the SimpleDbStore happen within the context of this
	     * transaction and it cannot be used anymore once the transaction is
	     * completed.
	     *
	     * Note that we can't actually enforce that the KeyType and ValueType are
	     * correct, but they allow type safety through the rest of the consuming code.
	     */
	    SimpleDbTransaction.prototype.store = function (storeName) {
	        var store = this.transaction.objectStore(storeName);
	        assert$1(!!store, 'Object store not part of transaction: ' + storeName);
	        return new SimpleDbStore(store);
	    };
	    return SimpleDbTransaction;
	}());
	/**
	 * A wrapper around an IDBObjectStore providing an API that:
	 *
	 * 1) Has generic KeyType / ValueType parameters to provide strongly-typed
	 * methods for acting against the object store.
	 * 2) Deals with IndexedDB's onsuccess / onerror event callbacks, making every
	 * method return a PersistencePromise instead.
	 * 3) Provides a higher-level API to avoid needing to do excessive wrapping of
	 * intermediate IndexedDB types (IDBCursorWithValue, etc.)
	 */
	var SimpleDbStore = /** @class */ (function () {
	    function SimpleDbStore(store) {
	        this.store = store;
	    }
	    SimpleDbStore.prototype.put = function (keyOrValue, value) {
	        var request;
	        if (value !== undefined) {
	            debug(LOG_TAG$2, 'PUT', this.store.name, keyOrValue, value);
	            request = this.store.put(value, keyOrValue);
	        }
	        else {
	            debug(LOG_TAG$2, 'PUT', this.store.name, '<auto-key>', keyOrValue);
	            request = this.store.put(keyOrValue);
	        }
	        return wrapRequest(request);
	    };
	    /**
	     * Gets the object with the specified key from the specified store, or null
	     * if no object exists with the specified key.
	     *
	     * @key The key of the object to get.
	     * @return The object with the specified key or null if no object exists.
	     */
	    SimpleDbStore.prototype.get = function (key) {
	        var _this = this;
	        var request = this.store.get(key);
	        // tslint:disable-next-line:no-any We're doing an unsafe cast to ValueType.
	        return wrapRequest(request).next(function (result) {
	            // Normalize nonexistence to null.
	            if (result === undefined) {
	                result = null;
	            }
	            debug(LOG_TAG$2, 'GET', _this.store.name, key, result);
	            return result;
	        });
	    };
	    SimpleDbStore.prototype.delete = function (key) {
	        debug(LOG_TAG$2, 'DELETE', this.store.name, key);
	        var request = this.store.delete(key);
	        return wrapRequest(request);
	    };
	    /**
	     * If we ever need more of the count variants, we can add overloads. For now,
	     * all we need is to count everything in a store.
	     *
	     * Returns the number of rows in the store.
	     */
	    SimpleDbStore.prototype.count = function () {
	        debug(LOG_TAG$2, 'COUNT', this.store.name);
	        var request = this.store.count();
	        return wrapRequest(request);
	    };
	    SimpleDbStore.prototype.loadAll = function (indexOrRange, range) {
	        var cursor = this.cursor(this.options(indexOrRange, range));
	        var results = [];
	        return this.iterateCursor(cursor, function (key, value) {
	            results.push(value);
	        }).next(function () {
	            return results;
	        });
	    };
	    SimpleDbStore.prototype.deleteAll = function (indexOrRange, range) {
	        debug(LOG_TAG$2, 'DELETE ALL', this.store.name);
	        var options = this.options(indexOrRange, range);
	        options.keysOnly = false;
	        var cursor = this.cursor(options);
	        return this.iterateCursor(cursor, function (key, value, control) {
	            // NOTE: Calling delete() on a cursor is documented as more efficient than
	            // calling delete() on an object store with a single key
	            // (https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/delete),
	            // however, this requires us *not* to use a keysOnly cursor
	            // (https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor/delete). We
	            // may want to compare the performance of each method.
	            return control.delete();
	        });
	    };
	    SimpleDbStore.prototype.iterate = function (optionsOrCallback, callback) {
	        var options;
	        if (!callback) {
	            options = {};
	            callback = optionsOrCallback;
	        }
	        else {
	            options = optionsOrCallback;
	        }
	        var cursor = this.cursor(options);
	        return this.iterateCursor(cursor, callback);
	    };
	    SimpleDbStore.prototype.iterateCursor = function (cursorRequest, fn) {
	        var results = [];
	        return new PersistencePromise(function (resolve, reject) {
	            cursorRequest.onerror = function (event) {
	                reject(event.target.error);
	            };
	            cursorRequest.onsuccess = function (event) {
	                var cursor = event.target.result;
	                if (!cursor) {
	                    resolve();
	                    return;
	                }
	                var controller = new IterationController(cursor);
	                var userResult = fn(cursor.primaryKey, cursor.value, controller);
	                if (userResult instanceof PersistencePromise) {
	                    results.push(userResult);
	                }
	                if (controller.isDone) {
	                    resolve();
	                }
	                else if (controller.skipToKey === null) {
	                    cursor.continue();
	                }
	                else {
	                    cursor.continue(controller.skipToKey);
	                }
	            };
	        }).next(function () {
	            return PersistencePromise.waitFor(results);
	        });
	    };
	    SimpleDbStore.prototype.options = function (indexOrRange, range) {
	        var indexName = undefined;
	        if (indexOrRange !== undefined) {
	            if (typeof indexOrRange === 'string') {
	                indexName = indexOrRange;
	            }
	            else {
	                assert$1(range === undefined, '3rd argument must not be defined if 2nd is a range.');
	                range = indexOrRange;
	            }
	        }
	        return { index: indexName, range: range };
	    };
	    SimpleDbStore.prototype.cursor = function (options) {
	        var direction = 'next';
	        if (options.reverse) {
	            direction = 'prev';
	        }
	        if (options.index) {
	            var index = this.store.index(options.index);
	            if (options.keysOnly) {
	                return index.openKeyCursor(options.range, direction);
	            }
	            else {
	                return index.openCursor(options.range, direction);
	            }
	        }
	        else {
	            return this.store.openCursor(options.range, direction);
	        }
	    };
	    return SimpleDbStore;
	}());
	/**
	 * Wraps an IDBRequest in a PersistencePromise, using the onsuccess / onerror
	 * handlers to resolve / reject the PersistencePromise as appropriate.
	 */
	function wrapRequest(request) {
	    return new PersistencePromise(function (resolve, reject) {
	        request.onsuccess = function (event) {
	            var result = event.target.result;
	            resolve(result);
	        };
	        request.onerror = function (event) {
	            reject(event.target.error);
	        };
	    });
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/** A mutation queue for a specific user, backed by IndexedDB. */
	var IndexedDbMutationQueue = /** @class */ (function () {
	    function IndexedDbMutationQueue(
	    /**
	     * The normalized userId (e.g. null UID => "" userId) used to store /
	     * retrieve mutations.
	     */
	    userId, serializer) {
	        this.userId = userId;
	        this.serializer = serializer;
	        this.garbageCollector = null;
	    }
	    /**
	     * Creates a new mutation queue for the given user.
	     * @param user The user for which to create a mutation queue.
	     * @param serializer The serializer to use when persisting to IndexedDb.
	     */
	    IndexedDbMutationQueue.forUser = function (user, serializer) {
	        // TODO(mcg): Figure out what constraints there are on userIDs
	        // In particular, are there any reserved characters? are empty ids allowed?
	        // For the moment store these together in the same mutations table assuming
	        // that empty userIDs aren't allowed.
	        assert$1(user.uid !== '', 'UserID must not be an empty string.');
	        var userId = user.isAuthenticated() ? user.uid : '';
	        return new IndexedDbMutationQueue(userId, serializer);
	    };
	    IndexedDbMutationQueue.prototype.start = function (transaction) {
	        var _this = this;
	        return IndexedDbMutationQueue.loadNextBatchIdFromDb(transaction)
	            .next(function (nextBatchId) {
	            _this.nextBatchId = nextBatchId;
	            return mutationQueuesStore(transaction).get(_this.userId);
	        })
	            .next(function (metadata) {
	            if (!metadata) {
	                metadata = new DbMutationQueue(_this.userId, BATCHID_UNKNOWN, 
	                /*lastStreamToken=*/ '');
	            }
	            _this.metadata = metadata;
	            // On restart, nextBatchId may end up lower than
	            // lastAcknowledgedBatchId since it's computed from the queue
	            // contents, and there may be no mutations in the queue. In this
	            // case, we need to reset lastAcknowledgedBatchId (which is safe
	            // since the queue must be empty).
	            if (_this.metadata.lastAcknowledgedBatchId >= _this.nextBatchId) {
	                return _this.checkEmpty(transaction).next(function (empty) {
	                    assert$1(empty, 'Reset nextBatchID is only possible when the queue is empty');
	                    _this.metadata.lastAcknowledgedBatchId = BATCHID_UNKNOWN;
	                    return mutationQueuesStore(transaction).put(_this.metadata);
	                });
	            }
	            else {
	                return PersistencePromise.resolve();
	            }
	        });
	    };
	    /**
	     * Returns one larger than the largest batch ID that has been stored. If there
	     * are no mutations returns 0. Note that batch IDs are global.
	     */
	    IndexedDbMutationQueue.loadNextBatchIdFromDb = function (txn) {
	        var maxBatchId = BATCHID_UNKNOWN;
	        return mutationsStore(txn)
	            .iterate({ reverse: true }, function (key, batch, control) {
	            var userId = key[0], batchId = key[1];
	            if (batchId > maxBatchId) {
	                maxBatchId = batch.batchId;
	            }
	            if (userId === '') {
	                // We can't compute a predecessor for the empty string, since it
	                // is lexographically first. That also means that no other
	                // userIds can come before this one, so we can just exit early.
	                control.done();
	            }
	            else {
	                var nextUser = immediatePredecessor(userId);
	                control.skip([nextUser]);
	            }
	        })
	            .next(function () { return maxBatchId + 1; });
	    };
	    IndexedDbMutationQueue.prototype.checkEmpty = function (transaction) {
	        var empty = true;
	        var range = IDBKeyRange.bound(this.keyForBatchId(Number.NEGATIVE_INFINITY), this.keyForBatchId(Number.POSITIVE_INFINITY));
	        return mutationsStore(transaction)
	            .iterate({ range: range }, function (key, value, control) {
	            empty = false;
	            control.done();
	        })
	            .next(function () { return empty; });
	    };
	    IndexedDbMutationQueue.prototype.getNextBatchId = function (transaction) {
	        return PersistencePromise.resolve(this.nextBatchId);
	    };
	    IndexedDbMutationQueue.prototype.getHighestAcknowledgedBatchId = function (transaction) {
	        return PersistencePromise.resolve(this.metadata.lastAcknowledgedBatchId);
	    };
	    IndexedDbMutationQueue.prototype.acknowledgeBatch = function (transaction, batch, streamToken) {
	        var batchId = batch.batchId;
	        assert$1(batchId > this.metadata.lastAcknowledgedBatchId, 'Mutation batchIDs must be acknowledged in order');
	        this.metadata.lastAcknowledgedBatchId = batchId;
	        this.metadata.lastStreamToken = convertStreamToken(streamToken);
	        return mutationQueuesStore(transaction).put(this.metadata);
	    };
	    IndexedDbMutationQueue.prototype.getLastStreamToken = function (transaction) {
	        return PersistencePromise.resolve(this.metadata.lastStreamToken);
	    };
	    IndexedDbMutationQueue.prototype.setLastStreamToken = function (transaction, streamToken) {
	        this.metadata.lastStreamToken = convertStreamToken(streamToken);
	        return mutationQueuesStore(transaction).put(this.metadata);
	    };
	    IndexedDbMutationQueue.prototype.addMutationBatch = function (transaction, localWriteTime, mutations) {
	        var _this = this;
	        var batchId = this.nextBatchId;
	        this.nextBatchId++;
	        var batch = new MutationBatch(batchId, localWriteTime, mutations);
	        var dbBatch = this.serializer.toDbMutationBatch(this.userId, batch);
	        return mutationsStore(transaction)
	            .put(dbBatch)
	            .next(function () {
	            var promises = [];
	            for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
	                var mutation = mutations_1[_i];
	                var indexKey = DbDocumentMutation.key(_this.userId, mutation.key.path, batchId);
	                promises.push(documentMutationsStore(transaction).put(indexKey, DbDocumentMutation.PLACEHOLDER));
	            }
	            return PersistencePromise.waitFor(promises);
	        })
	            .next(function () {
	            return batch;
	        });
	    };
	    IndexedDbMutationQueue.prototype.lookupMutationBatch = function (transaction, batchId) {
	        var _this = this;
	        return mutationsStore(transaction)
	            .get(this.keyForBatchId(batchId))
	            .next(function (dbBatch) {
	            return dbBatch ? _this.serializer.fromDbMutationBatch(dbBatch) : null;
	        });
	    };
	    IndexedDbMutationQueue.prototype.getNextMutationBatchAfterBatchId = function (transaction, batchId) {
	        var _this = this;
	        // All batches with batchId <= this.metadata.lastAcknowledgedBatchId have
	        // been acknowledged so the first unacknowledged batch after batchID will
	        // have a batchID larger than both of these values.
	        var nextBatchId = Math.max(batchId, this.metadata.lastAcknowledgedBatchId) + 1;
	        var range = IDBKeyRange.lowerBound(this.keyForBatchId(nextBatchId));
	        var foundBatch = null;
	        return mutationsStore(transaction)
	            .iterate({ range: range }, function (key, dbBatch, control) {
	            if (dbBatch.userId === _this.userId) {
	                assert$1(dbBatch.batchId >= nextBatchId, 'Should have found mutation after ' + nextBatchId);
	                foundBatch = _this.serializer.fromDbMutationBatch(dbBatch);
	            }
	            control.done();
	        })
	            .next(function () { return foundBatch; });
	    };
	    IndexedDbMutationQueue.prototype.getAllMutationBatches = function (transaction) {
	        var _this = this;
	        var range = IDBKeyRange.bound(this.keyForBatchId(BATCHID_UNKNOWN), this.keyForBatchId(Number.POSITIVE_INFINITY));
	        return mutationsStore(transaction)
	            .loadAll(range)
	            .next(function (dbBatches) {
	            return dbBatches.map(function (dbBatch) { return _this.serializer.fromDbMutationBatch(dbBatch); });
	        });
	    };
	    IndexedDbMutationQueue.prototype.getAllMutationBatchesThroughBatchId = function (transaction, batchId) {
	        var _this = this;
	        var range = IDBKeyRange.bound(this.keyForBatchId(BATCHID_UNKNOWN), this.keyForBatchId(batchId));
	        return mutationsStore(transaction)
	            .loadAll(range)
	            .next(function (dbBatches) {
	            return dbBatches.map(function (dbBatch) { return _this.serializer.fromDbMutationBatch(dbBatch); });
	        });
	    };
	    IndexedDbMutationQueue.prototype.getAllMutationBatchesAffectingDocumentKey = function (transaction, documentKey) {
	        var _this = this;
	        // Scan the document-mutation index starting with a prefix starting with
	        // the given documentKey.
	        var indexPrefix = DbDocumentMutation.prefixForPath(this.userId, documentKey.path);
	        var indexStart = IDBKeyRange.lowerBound(indexPrefix);
	        var results = [];
	        return documentMutationsStore(transaction)
	            .iterate({ range: indexStart }, function (indexKey, _, control) {
	            var userID = indexKey[0], encodedPath = indexKey[1], batchID = indexKey[2];
	            // Only consider rows matching exactly the specific key of
	            // interest. Note that because we order by path first, and we
	            // order terminators before path separators, we'll encounter all
	            // the index rows for documentKey contiguously. In particular, all
	            // the rows for documentKey will occur before any rows for
	            // documents nested in a subcollection beneath documentKey so we
	            // can stop as soon as we hit any such row.
	            var path = decode$1(encodedPath);
	            if (userID !== _this.userId || !documentKey.path.isEqual(path)) {
	                control.done();
	                return;
	            }
	            var mutationKey = _this.keyForBatchId(batchID);
	            // Look up the mutation batch in the store.
	            // PORTING NOTE: because iteration is callback driven in the web,
	            // we just look up the key instead of keeping an open iterator
	            // like iOS.
	            return mutationsStore(transaction)
	                .get(mutationKey)
	                .next(function (dbBatch) {
	                if (dbBatch === null) {
	                    fail('Dangling document-mutation reference found: ' +
	                        indexKey +
	                        ' which points to ' +
	                        mutationKey);
	                }
	                results.push(_this.serializer.fromDbMutationBatch(dbBatch));
	            });
	        })
	            .next(function () { return results; });
	    };
	    IndexedDbMutationQueue.prototype.getAllMutationBatchesAffectingQuery = function (transaction, query) {
	        var _this = this;
	        assert$1(!query.isDocumentQuery(), "Document queries shouldn't go down this path");
	        var queryPath = query.path;
	        var immediateChildrenLength = queryPath.length + 1;
	        // TODO(mcg): Actually implement a single-collection query
	        //
	        // This is actually executing an ancestor query, traversing the whole
	        // subtree below the collection which can be horrifically inefficient for
	        // some structures. The right way to solve this is to implement the full
	        // value index, but that's not in the cards in the near future so this is
	        // the best we can do for the moment.
	        //
	        // Since we don't yet index the actual properties in the mutations, our
	        // current approach is to just return all mutation batches that affect
	        // documents in the collection being queried.
	        var indexPrefix = DbDocumentMutation.prefixForPath(this.userId, queryPath);
	        var indexStart = IDBKeyRange.lowerBound(indexPrefix);
	        // Collect up unique batchIDs encountered during a scan of the index. Use a
	        // SortedSet to accumulate batch IDs so they can be traversed in order in a
	        // scan of the main table.
	        var uniqueBatchIDs = new SortedSet(primitiveComparator);
	        return documentMutationsStore(transaction)
	            .iterate({ range: indexStart }, function (indexKey, _, control) {
	            var userID = indexKey[0], encodedPath = indexKey[1], batchID = indexKey[2];
	            var path = decode$1(encodedPath);
	            if (userID !== _this.userId || !queryPath.isPrefixOf(path)) {
	                control.done();
	                return;
	            }
	            // Rows with document keys more than one segment longer than the
	            // query path can't be matches. For example, a query on 'rooms'
	            // can't match the document /rooms/abc/messages/xyx.
	            // TODO(mcg): we'll need a different scanner when we implement
	            // ancestor queries.
	            if (path.length !== immediateChildrenLength) {
	                return;
	            }
	            uniqueBatchIDs = uniqueBatchIDs.add(batchID);
	        })
	            .next(function () {
	            var results = [];
	            var promises = [];
	            // TODO(rockwood): Implement this using iterate.
	            uniqueBatchIDs.forEach(function (batchID) {
	                var mutationKey = _this.keyForBatchId(batchID);
	                promises.push(mutationsStore(transaction)
	                    .get(mutationKey)
	                    .next(function (mutation) {
	                    if (mutation === null) {
	                        fail('Dangling document-mutation reference found, ' +
	                            'which points to ' +
	                            mutationKey);
	                    }
	                    results.push(_this.serializer.fromDbMutationBatch(mutation));
	                }));
	            });
	            return PersistencePromise.waitFor(promises).next(function () { return results; });
	        });
	    };
	    IndexedDbMutationQueue.prototype.removeMutationBatches = function (transaction, batches) {
	        var txn = mutationsStore(transaction);
	        var indexTxn = documentMutationsStore(transaction);
	        var promises = [];
	        var _loop_1 = function (batch) {
	            var range = IDBKeyRange.only(this_1.keyForBatchId(batch.batchId));
	            var numDeleted = 0;
	            var removePromise = txn.iterate({ range: range }, function (key, value, control) {
	                numDeleted++;
	                return control.delete();
	            });
	            promises.push(removePromise.next(function () {
	                assert$1(numDeleted === 1, 'Dangling document-mutation reference found: Missing batch ' +
	                    batch.batchId);
	            }));
	            for (var _i = 0, _a = batch.mutations; _i < _a.length; _i++) {
	                var mutation = _a[_i];
	                var indexKey = DbDocumentMutation.key(this_1.userId, mutation.key.path, batch.batchId);
	                promises.push(indexTxn.delete(indexKey));
	                if (this_1.garbageCollector !== null) {
	                    this_1.garbageCollector.addPotentialGarbageKey(mutation.key);
	                }
	            }
	        };
	        var this_1 = this;
	        for (var _i = 0, batches_1 = batches; _i < batches_1.length; _i++) {
	            var batch = batches_1[_i];
	            _loop_1(batch);
	        }
	        return PersistencePromise.waitFor(promises);
	    };
	    IndexedDbMutationQueue.prototype.performConsistencyCheck = function (txn) {
	        var _this = this;
	        return this.checkEmpty(txn).next(function (empty) {
	            if (!empty) {
	                return PersistencePromise.resolve();
	            }
	            // Verify that there are no entries in the documentMutations index if
	            // the queue is empty.
	            var startRange = IDBKeyRange.lowerBound(DbDocumentMutation.prefixForUser(_this.userId));
	            var danglingMutationReferences = [];
	            return documentMutationsStore(txn)
	                .iterate({ range: startRange }, function (key, _, control) {
	                var userID = key[0];
	                if (userID !== _this.userId) {
	                    control.done();
	                    return;
	                }
	                else {
	                    var path = decode$1(key[1]);
	                    danglingMutationReferences.push(path);
	                }
	            })
	                .next(function () {
	                assert$1(danglingMutationReferences.length === 0, 'Document leak -- detected dangling mutation references when queue is empty. Dangling keys: ' +
	                    danglingMutationReferences.map(function (p) { return p.canonicalString(); }));
	            });
	        });
	    };
	    IndexedDbMutationQueue.prototype.setGarbageCollector = function (gc) {
	        this.garbageCollector = gc;
	    };
	    IndexedDbMutationQueue.prototype.containsKey = function (txn, key) {
	        var _this = this;
	        var indexKey = DbDocumentMutation.prefixForPath(this.userId, key.path);
	        var encodedPath = indexKey[1];
	        var startRange = IDBKeyRange.lowerBound(indexKey);
	        var containsKey = false;
	        return documentMutationsStore(txn)
	            .iterate({ range: startRange, keysOnly: true }, function (key, value, control) {
	            var userID = key[0], keyPath = key[1], /*batchID*/ _ = key[2];
	            if (userID === _this.userId && keyPath === encodedPath) {
	                containsKey = true;
	            }
	            control.done();
	        })
	            .next(function () { return containsKey; });
	    };
	    /**
	     * Creates a [userId, batchId] key for use with the DbMutationQueue object
	     * store.
	     */
	    IndexedDbMutationQueue.prototype.keyForBatchId = function (batchId) {
	        return [this.userId, batchId];
	    };
	    return IndexedDbMutationQueue;
	}());
	function convertStreamToken(token) {
	    if (token instanceof Uint8Array) {
	        // TODO(b/78771403): Convert tokens to strings during deserialization
	        assert$1(process.env.USE_MOCK_PERSISTENCE === 'YES', 'Persisting non-string stream tokens is only supported with mock persistence .');
	        return token.toString();
	    }
	    else {
	        return token;
	    }
	}
	/**
	 * Helper to get a typed SimpleDbStore for the mutations object store.
	 */
	function mutationsStore(txn) {
	    return SimpleDb.getStore(txn, DbMutationBatch.store);
	}
	/**
	 * Helper to get a typed SimpleDbStore for the mutationQueues object store.
	 */
	function documentMutationsStore(txn) {
	    return SimpleDb.getStore(txn, DbDocumentMutation.store);
	}
	/**
	 * Helper to get a typed SimpleDbStore for the mutationQueues object store.
	 */
	function mutationQueuesStore(txn) {
	    return SimpleDb.getStore(txn, DbMutationQueue.store);
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var IndexedDbQueryCache = /** @class */ (function () {
	    function IndexedDbQueryCache(serializer) {
	        this.serializer = serializer;
	        /**
	         * The last received snapshot version. We store this seperately from the
	         * metadata to avoid the extra conversion to/from DbTimestamp.
	         */
	        this.lastRemoteSnapshotVersion = SnapshotVersion.MIN;
	        /**
	         * A cached copy of the metadata for the query cache.
	         */
	        this.metadata = null;
	        /** The garbage collector to notify about potential garbage keys. */
	        this.garbageCollector = null;
	    }
	    IndexedDbQueryCache.prototype.start = function (transaction) {
	        var _this = this;
	        return globalTargetStore(transaction)
	            .get(DbTargetGlobal.key)
	            .next(function (metadata) {
	            assert$1(metadata !== null, 'Missing metadata row that should be added by schema migration.');
	            _this.metadata = metadata;
	            var lastSavedVersion = metadata.lastRemoteSnapshotVersion;
	            _this.lastRemoteSnapshotVersion = SnapshotVersion.fromTimestamp(new Timestamp(lastSavedVersion.seconds, lastSavedVersion.nanoseconds));
	            return PersistencePromise.resolve();
	        });
	    };
	    IndexedDbQueryCache.prototype.getHighestTargetId = function () {
	        return this.metadata.highestTargetId;
	    };
	    IndexedDbQueryCache.prototype.getLastRemoteSnapshotVersion = function () {
	        return this.lastRemoteSnapshotVersion;
	    };
	    IndexedDbQueryCache.prototype.setLastRemoteSnapshotVersion = function (transaction, snapshotVersion) {
	        this.lastRemoteSnapshotVersion = snapshotVersion;
	        this.metadata.lastRemoteSnapshotVersion = snapshotVersion.toTimestamp();
	        return globalTargetStore(transaction).put(DbTargetGlobal.key, this.metadata);
	    };
	    IndexedDbQueryCache.prototype.addQueryData = function (transaction, queryData) {
	        var _this = this;
	        return this.saveQueryData(transaction, queryData).next(function () {
	            _this.metadata.targetCount += 1;
	            _this.updateMetadataFromQueryData(queryData);
	            return _this.saveMetadata(transaction);
	        });
	    };
	    IndexedDbQueryCache.prototype.updateQueryData = function (transaction, queryData) {
	        var _this = this;
	        return this.saveQueryData(transaction, queryData).next(function () {
	            if (_this.updateMetadataFromQueryData(queryData)) {
	                return _this.saveMetadata(transaction);
	            }
	            else {
	                return PersistencePromise.resolve();
	            }
	        });
	    };
	    IndexedDbQueryCache.prototype.removeQueryData = function (transaction, queryData) {
	        var _this = this;
	        assert$1(this.metadata.targetCount > 0, 'Removing from an empty query cache');
	        return this.removeMatchingKeysForTargetId(transaction, queryData.targetId)
	            .next(function () { return targetsStore(transaction).delete(queryData.targetId); })
	            .next(function () {
	            _this.metadata.targetCount -= 1;
	            return _this.saveMetadata(transaction);
	        });
	    };
	    IndexedDbQueryCache.prototype.saveMetadata = function (transaction) {
	        return globalTargetStore(transaction).put(DbTargetGlobal.key, this.metadata);
	    };
	    IndexedDbQueryCache.prototype.saveQueryData = function (transaction, queryData) {
	        return targetsStore(transaction).put(this.serializer.toDbTarget(queryData));
	    };
	    /**
	     * Updates the in-memory version of the metadata to account for values in the
	     * given QueryData. Saving is done separately. Returns true if there were any
	     * changes to the metadata.
	     */
	    IndexedDbQueryCache.prototype.updateMetadataFromQueryData = function (queryData) {
	        var needsUpdate = false;
	        if (queryData.targetId > this.metadata.highestTargetId) {
	            this.metadata.highestTargetId = queryData.targetId;
	            needsUpdate = true;
	        }
	        // TODO(GC): add sequence number check
	        return needsUpdate;
	    };
	    Object.defineProperty(IndexedDbQueryCache.prototype, "count", {
	        get: function () {
	            return this.metadata.targetCount;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    IndexedDbQueryCache.prototype.getQueryData = function (transaction, query) {
	        var _this = this;
	        // Iterating by the canonicalId may yield more than one result because
	        // canonicalId values are not required to be unique per target. This query
	        // depends on the queryTargets index to be efficent.
	        var canonicalId = query.canonicalId();
	        var range = IDBKeyRange.bound([canonicalId, Number.NEGATIVE_INFINITY], [canonicalId, Number.POSITIVE_INFINITY]);
	        var result = null;
	        return targetsStore(transaction)
	            .iterate({ range: range, index: DbTarget.queryTargetsIndexName }, function (key, value, control) {
	            var found = _this.serializer.fromDbTarget(value);
	            // After finding a potential match, check that the query is
	            // actually equal to the requested query.
	            if (query.isEqual(found.query)) {
	                result = found;
	                control.done();
	            }
	        })
	            .next(function () { return result; });
	    };
	    IndexedDbQueryCache.prototype.addMatchingKeys = function (txn, keys, targetId) {
	        // PORTING NOTE: The reverse index (documentsTargets) is maintained by
	        // Indexeddb.
	        var promises = [];
	        var store = documentTargetStore(txn);
	        keys.forEach(function (key) {
	            var path = encode(key.path);
	            promises.push(store.put(new DbTargetDocument(targetId, path)));
	        });
	        return PersistencePromise.waitFor(promises);
	    };
	    IndexedDbQueryCache.prototype.removeMatchingKeys = function (txn, keys, targetId) {
	        var _this = this;
	        // PORTING NOTE: The reverse index (documentsTargets) is maintained by
	        // IndexedDb.
	        var promises = [];
	        var store = documentTargetStore(txn);
	        keys.forEach(function (key) {
	            var path = encode(key.path);
	            promises.push(store.delete([targetId, path]));
	            if (_this.garbageCollector !== null) {
	                _this.garbageCollector.addPotentialGarbageKey(key);
	            }
	        });
	        return PersistencePromise.waitFor(promises);
	    };
	    IndexedDbQueryCache.prototype.removeMatchingKeysForTargetId = function (txn, targetId) {
	        var store = documentTargetStore(txn);
	        var range = IDBKeyRange.bound([targetId], [targetId + 1], 
	        /*lowerOpen=*/ false, 
	        /*upperOpen=*/ true);
	        return this.notifyGCForRemovedKeys(txn, range).next(function () {
	            return store.delete(range);
	        });
	    };
	    IndexedDbQueryCache.prototype.notifyGCForRemovedKeys = function (txn, range) {
	        var _this = this;
	        var store = documentTargetStore(txn);
	        if (this.garbageCollector !== null && this.garbageCollector.isEager) {
	            // In order to generate garbage events properly, we need to read these
	            // keys before deleting.
	            return store.iterate({ range: range, keysOnly: true }, function (key, _, control) {
	                var path = decode$1(key[1]);
	                var docKey = new DocumentKey(path);
	                // Paranoid assertion in case the the collector is set to null
	                // during the iteration.
	                assert$1(_this.garbageCollector !== null, 'GarbageCollector for query cache set to null during key removal.');
	                _this.garbageCollector.addPotentialGarbageKey(docKey);
	            });
	        }
	        else {
	            return PersistencePromise.resolve();
	        }
	    };
	    IndexedDbQueryCache.prototype.getMatchingKeysForTargetId = function (txn, targetId) {
	        var range = IDBKeyRange.bound([targetId], [targetId + 1], 
	        /*lowerOpen=*/ false, 
	        /*upperOpen=*/ true);
	        var store = documentTargetStore(txn);
	        var result = documentKeySet();
	        return store
	            .iterate({ range: range, keysOnly: true }, function (key, _, control) {
	            var path = decode$1(key[1]);
	            var docKey = new DocumentKey(path);
	            result = result.add(docKey);
	        })
	            .next(function () { return result; });
	    };
	    IndexedDbQueryCache.prototype.setGarbageCollector = function (gc) {
	        this.garbageCollector = gc;
	    };
	    IndexedDbQueryCache.prototype.containsKey = function (txn, key) {
	        assert$1(txn !== null, 'Persistence Transaction cannot be null for query cache containsKey');
	        var path = encode(key.path);
	        var range = IDBKeyRange.bound([path], [immediateSuccessor(path)], 
	        /*lowerOpen=*/ false, 
	        /*upperOpen=*/ true);
	        var count = 0;
	        return documentTargetStore(txn)
	            .iterate({
	            index: DbTargetDocument.documentTargetsIndex,
	            keysOnly: true,
	            range: range
	        }, function (key, _, control) {
	            count++;
	            control.done();
	        })
	            .next(function () { return count > 0; });
	    };
	    return IndexedDbQueryCache;
	}());
	/**
	 * Helper to get a typed SimpleDbStore for the queries object store.
	 */
	function targetsStore(txn) {
	    return SimpleDb.getStore(txn, DbTarget.store);
	}
	/**
	 * Helper to get a typed SimpleDbStore for the target globals object store.
	 */
	function globalTargetStore(txn) {
	    return SimpleDb.getStore(txn, DbTargetGlobal.store);
	}
	/**
	 * Helper to get a typed SimpleDbStore for the document target object store.
	 */
	function documentTargetStore(txn) {
	    return SimpleDb.getStore(txn, DbTargetDocument.store);
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var IndexedDbRemoteDocumentCache = /** @class */ (function () {
	    function IndexedDbRemoteDocumentCache(serializer) {
	        this.serializer = serializer;
	    }
	    IndexedDbRemoteDocumentCache.prototype.addEntry = function (transaction, maybeDocument) {
	        return remoteDocumentsStore(transaction).put(dbKey(maybeDocument.key), this.serializer.toDbRemoteDocument(maybeDocument));
	    };
	    IndexedDbRemoteDocumentCache.prototype.removeEntry = function (transaction, documentKey) {
	        return remoteDocumentsStore(transaction).delete(dbKey(documentKey));
	    };
	    IndexedDbRemoteDocumentCache.prototype.getEntry = function (transaction, documentKey) {
	        var _this = this;
	        return remoteDocumentsStore(transaction)
	            .get(dbKey(documentKey))
	            .next(function (dbRemoteDoc) {
	            return dbRemoteDoc
	                ? _this.serializer.fromDbRemoteDocument(dbRemoteDoc)
	                : null;
	        });
	    };
	    IndexedDbRemoteDocumentCache.prototype.getDocumentsMatchingQuery = function (transaction, query) {
	        var _this = this;
	        var results = documentMap();
	        // Documents are ordered by key, so we can use a prefix scan to narrow down
	        // the documents we need to match the query against.
	        var startKey = query.path.toArray();
	        var range = IDBKeyRange.lowerBound(startKey);
	        return remoteDocumentsStore(transaction)
	            .iterate({ range: range }, function (key, dbRemoteDoc, control) {
	            var maybeDoc = _this.serializer.fromDbRemoteDocument(dbRemoteDoc);
	            if (!query.path.isPrefixOf(maybeDoc.key.path)) {
	                control.done();
	            }
	            else if (maybeDoc instanceof Document && query.matches(maybeDoc)) {
	                results = results.insert(maybeDoc.key, maybeDoc);
	            }
	        })
	            .next(function () { return results; });
	    };
	    return IndexedDbRemoteDocumentCache;
	}());
	/**
	 * Helper to get a typed SimpleDbStore for the remoteDocuments object store.
	 */
	function remoteDocumentsStore(txn) {
	    return SimpleDb.getStore(txn, DbRemoteDocument.store);
	}
	function dbKey(docKey) {
	    return docKey.path.toArray();
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/** Serializer for values stored in the LocalStore. */
	var LocalSerializer = /** @class */ (function () {
	    function LocalSerializer(remoteSerializer) {
	        this.remoteSerializer = remoteSerializer;
	    }
	    /** Decodes a remote document from storage locally to a Document. */
	    LocalSerializer.prototype.fromDbRemoteDocument = function (remoteDoc) {
	        if (remoteDoc.document) {
	            return this.remoteSerializer.fromDocument(remoteDoc.document);
	        }
	        else if (remoteDoc.noDocument) {
	            var key = DocumentKey.fromSegments(remoteDoc.noDocument.path);
	            var readTime = remoteDoc.noDocument.readTime;
	            var timestamp = new Timestamp(readTime.seconds, readTime.nanoseconds);
	            return new NoDocument(key, SnapshotVersion.fromTimestamp(timestamp));
	        }
	        else {
	            return fail('Unexpected DbRemoteDocument');
	        }
	    };
	    /** Encodes a document for storage locally. */
	    LocalSerializer.prototype.toDbRemoteDocument = function (maybeDoc) {
	        if (maybeDoc instanceof Document) {
	            var doc = this.remoteSerializer.toDocument(maybeDoc);
	            return new DbRemoteDocument(null, doc);
	        }
	        else {
	            var path = maybeDoc.key.path.toArray();
	            var timestamp = maybeDoc.version.toTimestamp();
	            var readTime = new DbTimestamp(timestamp.seconds, timestamp.nanoseconds);
	            return new DbRemoteDocument(new DbNoDocument(path, readTime), null);
	        }
	    };
	    /** Encodes a batch of mutations into a DbMutationBatch for local storage. */
	    LocalSerializer.prototype.toDbMutationBatch = function (userId, batch) {
	        var _this = this;
	        var serializedMutations = batch.mutations.map(function (m) {
	            return _this.remoteSerializer.toMutation(m);
	        });
	        return new DbMutationBatch(userId, batch.batchId, batch.localWriteTime.toMillis(), serializedMutations);
	    };
	    /** Decodes a DbMutationBatch into a MutationBatch */
	    LocalSerializer.prototype.fromDbMutationBatch = function (dbBatch) {
	        var _this = this;
	        var mutations = dbBatch.mutations.map(function (m) {
	            return _this.remoteSerializer.fromMutation(m);
	        });
	        var timestamp = Timestamp.fromMillis(dbBatch.localWriteTimeMs);
	        return new MutationBatch(dbBatch.batchId, timestamp, mutations);
	    };
	    /** Decodes a DbTarget into QueryData */
	    LocalSerializer.prototype.fromDbTarget = function (dbTarget) {
	        var readTime = new Timestamp(dbTarget.readTime.seconds, dbTarget.readTime.nanoseconds);
	        var version = SnapshotVersion.fromTimestamp(readTime);
	        var query;
	        if (isDocumentQuery(dbTarget.query)) {
	            query = this.remoteSerializer.fromDocumentsTarget(dbTarget.query);
	        }
	        else {
	            query = this.remoteSerializer.fromQueryTarget(dbTarget.query);
	        }
	        return new QueryData(query, dbTarget.targetId, QueryPurpose.Listen, version, dbTarget.resumeToken);
	    };
	    /** Encodes QueryData into a DbTarget for storage locally. */
	    LocalSerializer.prototype.toDbTarget = function (queryData) {
	        assert$1(QueryPurpose.Listen === queryData.purpose, 'Only queries with purpose ' +
	            QueryPurpose.Listen +
	            ' may be stored, got ' +
	            queryData.purpose);
	        var timestamp = queryData.snapshotVersion.toTimestamp();
	        var dbTimestamp = new DbTimestamp(timestamp.seconds, timestamp.nanoseconds);
	        var queryProto;
	        if (queryData.query.isDocumentQuery()) {
	            queryProto = this.remoteSerializer.toDocumentsTarget(queryData.query);
	        }
	        else {
	            queryProto = this.remoteSerializer.toQueryTarget(queryData.query);
	        }
	        var resumeToken;
	        if (queryData.resumeToken instanceof Uint8Array) {
	            // TODO(b/78771403): Convert tokens to strings during deserialization
	            assert$1(process.env.USE_MOCK_PERSISTENCE === 'YES', 'Persisting non-string stream tokens is only supported with mock persistence .');
	            resumeToken = queryData.resumeToken.toString();
	        }
	        else {
	            resumeToken = queryData.resumeToken;
	        }
	        // lastListenSequenceNumber is always 0 until we do real GC.
	        return new DbTarget(queryData.targetId, queryData.query.canonicalId(), dbTimestamp, resumeToken, 0, queryProto);
	    };
	    return LocalSerializer;
	}());
	/**
	 * A helper function for figuring out what kind of query has been stored.
	 */
	function isDocumentQuery(dbQuery) {
	    return dbQuery.documents !== undefined;
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG$3 = 'IndexedDbPersistence';
	/** If the owner lease is older than 5 seconds, try to take ownership. */
	var OWNER_LEASE_MAX_AGE_MS = 5000;
	/** Refresh the owner lease every 4 seconds while owner. */
	var OWNER_LEASE_REFRESH_INTERVAL_MS = 4000;
	/** LocalStorage location to indicate a zombied ownerId (see class comment). */
	var ZOMBIE_OWNER_LOCALSTORAGE_SUFFIX = 'zombiedOwnerId';
	/** Error when the owner lease cannot be acquired or is lost. */
	var EXISTING_OWNER_ERROR_MSG = 'There is another tab open with offline' +
	    ' persistence enabled. Only one such tab is allowed at a time. The' +
	    ' other tab must be closed or persistence must be disabled.';
	var UNSUPPORTED_PLATFORM_ERROR_MSG = 'This platform is either missing' +
	    ' IndexedDB or is known to have an incomplete implementation. Offline' +
	    ' persistence has been disabled.';
	/**
	 * An IndexedDB-backed instance of Persistence. Data is stored persistently
	 * across sessions.
	 *
	 * Currently the Firestore SDK only supports a single consumer of the database,
	 * but browsers obviously support multiple tabs. IndexedDbPersistence ensures a
	 * single consumer of the database via an "owner lease" stored in the database.
	 *
	 * On startup, IndexedDbPersistence assigns itself a random "ownerId" and writes
	 * it to a special "owner" object in the database (if no entry exists already or
	 * the current entry is expired). This owner lease is then verified inside every
	 * transaction to ensure the lease has not been lost.
	 *
	 * If a tab opts not to acquire the owner lease (because there's an existing
	 * non-expired owner) or loses the owner lease, IndexedDbPersistence enters a
	 * failed state and all subsequent operations will automatically fail.
	 *
	 * The current owner regularly refreshes the owner lease with new timestamps to
	 * prevent newly-opened tabs from taking over ownership.
	 *
	 * Additionally there is an optimization so that when a tab is closed, the owner
	 * lease is released immediately (this is especially important to make sure that
	 * a refreshed tab is able to immediately re-acquire the owner lease).
	 * Unfortunately, IndexedDB cannot be reliably used in window.unload since it is
	 * an asynchronous API. So in addition to attempting to give up the lease,
	 * the owner writes its ownerId to a "zombiedOwnerId" entry in LocalStorage
	 * which acts as an indicator that another tab should go ahead and take the
	 * owner lease immediately regardless of the current lease timestamp.
	 */
	var IndexedDbPersistence = /** @class */ (function () {
	    function IndexedDbPersistence(prefix, serializer) {
	        this.ownerId = this.generateOwnerId();
	        this.dbName = prefix + IndexedDbPersistence.MAIN_DATABASE;
	        this.serializer = new LocalSerializer(serializer);
	        this.localStoragePrefix = prefix;
	    }
	    IndexedDbPersistence.prototype.start = function () {
	        var _this = this;
	        if (!IndexedDbPersistence.isAvailable()) {
	            this.persistenceError = new FirestoreError(Code.UNIMPLEMENTED, UNSUPPORTED_PLATFORM_ERROR_MSG);
	            return Promise.reject(this.persistenceError);
	        }
	        assert$1(!this.started, 'IndexedDbPersistence double-started!');
	        this.started = true;
	        return SimpleDb.openOrCreate(this.dbName, SCHEMA_VERSION, createOrUpgradeDb)
	            .then(function (db) {
	            _this.simpleDb = db;
	        })
	            .then(function () { return _this.tryAcquireOwnerLease(); })
	            .then(function () {
	            _this.scheduleOwnerLeaseRefreshes();
	            _this.attachWindowUnloadHook();
	        });
	    };
	    IndexedDbPersistence.prototype.shutdown = function (deleteData) {
	        var _this = this;
	        assert$1(this.started, 'IndexedDbPersistence shutdown without start!');
	        this.started = false;
	        this.detachWindowUnloadHook();
	        this.stopOwnerLeaseRefreshes();
	        return this.releaseOwnerLease().then(function () {
	            _this.simpleDb.close();
	            if (deleteData) {
	                return SimpleDb.delete(_this.dbName);
	            }
	        });
	    };
	    IndexedDbPersistence.prototype.getMutationQueue = function (user) {
	        return IndexedDbMutationQueue.forUser(user, this.serializer);
	    };
	    IndexedDbPersistence.prototype.getQueryCache = function () {
	        return new IndexedDbQueryCache(this.serializer);
	    };
	    IndexedDbPersistence.prototype.getRemoteDocumentCache = function () {
	        return new IndexedDbRemoteDocumentCache(this.serializer);
	    };
	    IndexedDbPersistence.prototype.runTransaction = function (action, operation) {
	        var _this = this;
	        if (this.persistenceError) {
	            return Promise.reject(this.persistenceError);
	        }
	        debug(LOG_TAG$3, 'Starting transaction:', action);
	        // Do all transactions as readwrite against all object stores, since we
	        // are the only reader/writer.
	        return this.simpleDb.runTransaction('readwrite', ALL_STORES, function (txn) {
	            // Verify that we still have the owner lease as part of every transaction.
	            return _this.ensureOwnerLease(txn).next(function () { return operation(txn); });
	        });
	    };
	    IndexedDbPersistence.isAvailable = function () {
	        return SimpleDb.isAvailable();
	    };
	    /**
	     * Generates a string used as a prefix when storing data in IndexedDB and
	     * LocalStorage.
	     */
	    IndexedDbPersistence.buildStoragePrefix = function (databaseInfo) {
	        // Use two different prefix formats:
	        //
	        //   * firestore / persistenceKey / projectID . databaseID / ...
	        //   * firestore / persistenceKey / projectID / ...
	        //
	        // projectIDs are DNS-compatible names and cannot contain dots
	        // so there's no danger of collisions.
	        var database = databaseInfo.databaseId.projectId;
	        if (!databaseInfo.databaseId.isDefaultDatabase) {
	            database += '.' + databaseInfo.databaseId.database;
	        }
	        return 'firestore/' + databaseInfo.persistenceKey + '/' + database + '/';
	    };
	    /**
	     * Acquires the owner lease if there's no valid owner. Else returns a rejected
	     * promise.
	     */
	    IndexedDbPersistence.prototype.tryAcquireOwnerLease = function () {
	        var _this = this;
	        // NOTE: Don't use this.runTransaction, since it requires us to already
	        // have the lease.
	        return this.simpleDb.runTransaction('readwrite', [DbOwner.store], function (txn) {
	            var store = txn.store(DbOwner.store);
	            return store.get('owner').next(function (dbOwner) {
	                if (!_this.validOwner(dbOwner)) {
	                    var newDbOwner = new DbOwner(_this.ownerId, Date.now());
	                    debug(LOG_TAG$3, 'No valid owner. Acquiring owner lease. Current owner:', dbOwner, 'New owner:', newDbOwner);
	                    return store.put('owner', newDbOwner);
	                }
	                else {
	                    debug(LOG_TAG$3, 'Valid owner already. Failing. Current owner:', dbOwner);
	                    _this.persistenceError = new FirestoreError(Code.FAILED_PRECONDITION, EXISTING_OWNER_ERROR_MSG);
	                    return PersistencePromise.reject(_this.persistenceError);
	                }
	            });
	        });
	    };
	    /** Checks the owner lease and deletes it if we are the current owner. */
	    IndexedDbPersistence.prototype.releaseOwnerLease = function () {
	        var _this = this;
	        // NOTE: Don't use this.runTransaction, since it requires us to already
	        // have the lease.
	        return this.simpleDb.runTransaction('readwrite', [DbOwner.store], function (txn) {
	            var store = txn.store(DbOwner.store);
	            return store.get('owner').next(function (dbOwner) {
	                if (dbOwner !== null && dbOwner.ownerId === _this.ownerId) {
	                    debug(LOG_TAG$3, 'Releasing owner lease.');
	                    return store.delete('owner');
	                }
	                else {
	                    return PersistencePromise.resolve();
	                }
	            });
	        });
	    };
	    /**
	     * Checks the owner lease and returns a rejected promise if we are not the
	     * current owner. This should be included in every transaction to guard
	     * against losing the owner lease.
	     */
	    IndexedDbPersistence.prototype.ensureOwnerLease = function (txn) {
	        var _this = this;
	        var store = txn.store(DbOwner.store);
	        return store.get('owner').next(function (dbOwner) {
	            if (dbOwner === null || dbOwner.ownerId !== _this.ownerId) {
	                _this.persistenceError = new FirestoreError(Code.FAILED_PRECONDITION, EXISTING_OWNER_ERROR_MSG);
	                return PersistencePromise.reject(_this.persistenceError);
	            }
	            else {
	                return PersistencePromise.resolve();
	            }
	        });
	    };
	    /**
	     * Returns true if the provided owner exists, has a recent timestamp, and
	     * isn't zombied.
	     *
	     * NOTE: To determine if the owner is zombied, this method reads from
	     * LocalStorage which could be mildly expensive.
	     */
	    IndexedDbPersistence.prototype.validOwner = function (dbOwner) {
	        var now = Date.now();
	        var minAcceptable = now - OWNER_LEASE_MAX_AGE_MS;
	        var maxAcceptable = now;
	        if (dbOwner === null) {
	            return false; // no owner.
	        }
	        else if (dbOwner.leaseTimestampMs < minAcceptable) {
	            return false; // owner lease has expired.
	        }
	        else if (dbOwner.leaseTimestampMs > maxAcceptable) {
	            error$1('Persistence owner-lease is in the future. Discarding.', dbOwner);
	            return false;
	        }
	        else if (dbOwner.ownerId === this.getZombiedOwnerId()) {
	            return false; // owner's tab closed.
	        }
	        else {
	            return true;
	        }
	    };
	    /**
	     * Schedules a recurring timer to update the owner lease timestamp to prevent
	     * other tabs from taking the lease.
	     */
	    IndexedDbPersistence.prototype.scheduleOwnerLeaseRefreshes = function () {
	        var _this = this;
	        // NOTE: This doesn't need to be scheduled on the async queue and doing so
	        // would increase the chances of us not refreshing on time if the queue is
	        // backed up for some reason.
	        this.ownerLeaseRefreshHandle = setInterval(function () {
	            var txResult = _this.runTransaction('Refresh owner timestamp', function (txn) {
	                // NOTE: We don't need to validate the current owner contents, since
	                // runTransaction does that automatically.
	                var store = txn.store(DbOwner.store);
	                return store.put('owner', new DbOwner(_this.ownerId, Date.now()));
	            });
	            txResult.catch(function (reason) {
	                // Probably means we lost the lease. Report the error and stop trying to
	                // refresh the lease.
	                error$1(reason);
	                _this.stopOwnerLeaseRefreshes();
	            });
	        }, OWNER_LEASE_REFRESH_INTERVAL_MS);
	    };
	    IndexedDbPersistence.prototype.stopOwnerLeaseRefreshes = function () {
	        if (this.ownerLeaseRefreshHandle) {
	            clearInterval(this.ownerLeaseRefreshHandle);
	            this.ownerLeaseRefreshHandle = null;
	        }
	    };
	    /**
	     * Attaches a window.unload handler that will synchronously write our
	     * ownerId to a "zombie owner id" location in localstorage. This can be used
	     * by tabs trying to acquire the lease to determine that the lease should be
	     * acquired immediately even if the timestamp is recent. This is particularly
	     * important for the refresh case (so the tab correctly re-acquires the owner
	     * lease). LocalStorage is used for this rather than IndexedDb because it is
	     * a synchronous API and so can be used reliably from an unload handler.
	     */
	    IndexedDbPersistence.prototype.attachWindowUnloadHook = function () {
	        var _this = this;
	        if (typeof window === 'object' &&
	            typeof window.addEventListener === 'function') {
	            this.windowUnloadHandler = function () {
	                // Record that we're zombied.
	                _this.setZombiedOwnerId(_this.ownerId);
	                // Attempt graceful shutdown (including releasing our owner lease), but
	                // there's no guarantee it will complete.
	                _this.shutdown();
	            };
	            window.addEventListener('unload', this.windowUnloadHandler);
	        }
	    };
	    IndexedDbPersistence.prototype.detachWindowUnloadHook = function () {
	        if (this.windowUnloadHandler) {
	            assert$1(typeof window === 'object' &&
	                typeof window.removeEventListener === 'function', "Expected 'window.removeEventListener' to be a function");
	            window.removeEventListener('unload', this.windowUnloadHandler);
	            this.windowUnloadHandler = null;
	        }
	    };
	    /**
	     * Returns any recorded "zombied owner" (i.e. a previous owner that became
	     * zombied due to their tab closing) from LocalStorage, or null if no such
	     * record exists.
	     */
	    IndexedDbPersistence.prototype.getZombiedOwnerId = function () {
	        try {
	            var zombiedOwnerId = window.localStorage.getItem(this.zombiedOwnerLocalStorageKey());
	            debug(LOG_TAG$3, 'Zombied ownerID from LocalStorage:', zombiedOwnerId);
	            return zombiedOwnerId;
	        }
	        catch (e) {
	            // Gracefully handle if LocalStorage isn't available / working.
	            error$1('Failed to get zombie owner id.', e);
	            return null;
	        }
	    };
	    /**
	     * Records a zombied owner (an owner that had its tab closed) in LocalStorage
	     * or, if passed null, deletes any recorded zombied owner.
	     */
	    IndexedDbPersistence.prototype.setZombiedOwnerId = function (zombieOwnerId) {
	        try {
	            if (zombieOwnerId === null) {
	                window.localStorage.removeItem(this.zombiedOwnerLocalStorageKey());
	            }
	            else {
	                window.localStorage.setItem(this.zombiedOwnerLocalStorageKey(), zombieOwnerId);
	            }
	        }
	        catch (e) {
	            // Gracefully handle if LocalStorage isn't available / working.
	            error$1('Failed to set zombie owner id.', e);
	        }
	    };
	    IndexedDbPersistence.prototype.zombiedOwnerLocalStorageKey = function () {
	        return this.localStoragePrefix + ZOMBIE_OWNER_LOCALSTORAGE_SUFFIX;
	    };
	    IndexedDbPersistence.prototype.generateOwnerId = function () {
	        // For convenience, just use an AutoId.
	        return AutoId.newId();
	    };
	    /**
	     * The name of the main (and currently only) IndexedDB database. this name is
	     * appended to the prefix provided to the IndexedDbPersistence constructor.
	     */
	    IndexedDbPersistence.MAIN_DATABASE = 'main';
	    return IndexedDbPersistence;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * A readonly view of the local state of all documents we're tracking (i.e. we
	 * have a cached version in remoteDocumentCache or local mutations for the
	 * document). The view is computed by applying the mutations in the
	 * MutationQueue to the RemoteDocumentCache.
	 */
	var LocalDocumentsView = /** @class */ (function () {
	    function LocalDocumentsView(remoteDocumentCache, mutationQueue) {
	        this.remoteDocumentCache = remoteDocumentCache;
	        this.mutationQueue = mutationQueue;
	    }
	    /**
	     * Get the local view of the document identified by `key`.
	     *
	     * @return Local view of the document or null if we don't have any cached
	     * state for it.
	     */
	    LocalDocumentsView.prototype.getDocument = function (transaction, key) {
	        var _this = this;
	        return this.remoteDocumentCache
	            .getEntry(transaction, key)
	            .next(function (remoteDoc) {
	            return _this.computeLocalDocument(transaction, key, remoteDoc);
	        });
	    };
	    /**
	     * Gets the local view of the documents identified by `keys`.
	     *
	     * If we don't have cached state for a document in `keys`, a NoDocument will
	     * be stored for that key in the resulting set.
	     */
	    LocalDocumentsView.prototype.getDocuments = function (transaction, keys) {
	        var _this = this;
	        var promises = [];
	        var results = maybeDocumentMap();
	        keys.forEach(function (key) {
	            promises.push(_this.getDocument(transaction, key).next(function (maybeDoc) {
	                // TODO(http://b/32275378): Don't conflate missing / deleted.
	                if (!maybeDoc) {
	                    maybeDoc = new NoDocument(key, SnapshotVersion.forDeletedDoc());
	                }
	                results = results.insert(key, maybeDoc);
	            }));
	        });
	        return PersistencePromise.waitFor(promises).next(function () { return results; });
	    };
	    /** Performs a query against the local view of all documents. */
	    LocalDocumentsView.prototype.getDocumentsMatchingQuery = function (transaction, query) {
	        if (DocumentKey.isDocumentKey(query.path)) {
	            return this.getDocumentsMatchingDocumentQuery(transaction, query.path);
	        }
	        else {
	            return this.getDocumentsMatchingCollectionQuery(transaction, query);
	        }
	    };
	    LocalDocumentsView.prototype.getDocumentsMatchingDocumentQuery = function (transaction, docPath) {
	        // Just do a simple document lookup.
	        return this.getDocument(transaction, new DocumentKey(docPath)).next(function (maybeDoc) {
	            var result = documentMap();
	            if (maybeDoc instanceof Document) {
	                result = result.insert(maybeDoc.key, maybeDoc);
	            }
	            return result;
	        });
	    };
	    LocalDocumentsView.prototype.getDocumentsMatchingCollectionQuery = function (transaction, query) {
	        var _this = this;
	        // Query the remote documents and overlay mutations.
	        // TODO(mikelehen): There may be significant overlap between the mutations
	        // affecting these remote documents and the
	        // getAllMutationBatchesAffectingQuery() mutations. Consider optimizing.
	        var results;
	        return this.remoteDocumentCache
	            .getDocumentsMatchingQuery(transaction, query)
	            .next(function (queryResults) {
	            return _this.computeLocalDocuments(transaction, queryResults);
	        })
	            .next(function (promisedResults) {
	            results = promisedResults;
	            // Now use the mutation queue to discover any other documents that may
	            // match the query after applying mutations.
	            return _this.mutationQueue.getAllMutationBatchesAffectingQuery(transaction, query);
	        })
	            .next(function (matchingMutationBatches) {
	            var matchingKeys = documentKeySet();
	            for (var _i = 0, matchingMutationBatches_1 = matchingMutationBatches; _i < matchingMutationBatches_1.length; _i++) {
	                var batch = matchingMutationBatches_1[_i];
	                for (var _a = 0, _b = batch.mutations; _a < _b.length; _a++) {
	                    var mutation = _b[_a];
	                    // TODO(mikelehen): PERF: Check if this mutation actually
	                    // affects the query to reduce work.
	                    if (!results.get(mutation.key)) {
	                        matchingKeys = matchingKeys.add(mutation.key);
	                    }
	                }
	            }
	            // Now add in the results for the matchingKeys.
	            var promises = [];
	            matchingKeys.forEach(function (key) {
	                promises.push(_this.getDocument(transaction, key).next(function (doc) {
	                    if (doc instanceof Document) {
	                        results = results.insert(doc.key, doc);
	                    }
	                }));
	            });
	            return PersistencePromise.waitFor(promises);
	        })
	            .next(function () {
	            // Finally, filter out any documents that don't actually match
	            // the query.
	            results.forEach(function (key, doc) {
	                if (!query.matches(doc)) {
	                    results = results.remove(key);
	                }
	            });
	            return results;
	        });
	    };
	    /**
	     * Takes a remote document and applies local mutations to generate the local
	     * view of the document.
	     * @param transaction The transaction in which to perform any persistence
	     *     operations.
	     * @param documentKey The key of the document (necessary when remoteDocument
	     *     is null).
	     * @param document The base remote document to apply mutations to or null.
	     */
	    LocalDocumentsView.prototype.computeLocalDocument = function (transaction, documentKey, document) {
	        return this.mutationQueue
	            .getAllMutationBatchesAffectingDocumentKey(transaction, documentKey)
	            .next(function (batches) {
	            for (var _i = 0, batches_1 = batches; _i < batches_1.length; _i++) {
	                var batch = batches_1[_i];
	                document = batch.applyToLocalView(documentKey, document);
	            }
	            return document;
	        });
	    };
	    /**
	     * Takes a set of remote documents and applies local mutations to generate the
	     * local view of the documents.
	     * @param transaction The transaction in which to perform any persistence
	     *     operations.
	     * @param documents The base remote documents to apply mutations to.
	     * @return The local view of the documents.
	     */
	    LocalDocumentsView.prototype.computeLocalDocuments = function (transaction, documents) {
	        var _this = this;
	        var promises = [];
	        documents.forEach(function (key, doc) {
	            promises.push(_this.computeLocalDocument(transaction, key, doc).next(function (mutatedDoc) {
	                if (mutatedDoc instanceof Document) {
	                    documents = documents.insert(mutatedDoc.key, mutatedDoc);
	                }
	                else if (mutatedDoc instanceof NoDocument) {
	                    documents = documents.remove(mutatedDoc.key);
	                }
	                else {
	                    fail('Unknown MaybeDocument: ' + mutatedDoc);
	                }
	            }));
	        });
	        return PersistencePromise.waitFor(promises).next(function () { return documents; });
	    };
	    return LocalDocumentsView;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * An in-memory buffer of entries to be written to a RemoteDocumentCache.
	 * It can be used to batch up a set of changes to be written to the cache, but
	 * additionally supports reading entries back with the `getEntry()` method,
	 * falling back to the underlying RemoteDocumentCache if no entry is
	 * buffered.
	 *
	 * NOTE: This class was introduced in iOS to work around a limitation in
	 * LevelDB. Given IndexedDb has full transaction support with
	 * read-your-own-writes capability, this class is not technically needed, but
	 * has been preserved as a convenience and to aid portability.
	 */
	var RemoteDocumentChangeBuffer = /** @class */ (function () {
	    function RemoteDocumentChangeBuffer(remoteDocumentCache) {
	        this.remoteDocumentCache = remoteDocumentCache;
	        this.changes = maybeDocumentMap();
	    }
	    /** Buffers a `RemoteDocumentCache.addEntry()` call. */
	    RemoteDocumentChangeBuffer.prototype.addEntry = function (maybeDocument) {
	        var changes = this.assertChanges();
	        this.changes = changes.insert(maybeDocument.key, maybeDocument);
	    };
	    // NOTE: removeEntry() is not presently necessary and so is omitted.
	    /**
	     * Looks up an entry in the cache. The buffered changes will first be checked,
	     * and if no buffered change applies, this will forward to
	     * `RemoteDocumentCache.getEntry()`.
	     *
	     * @param transaction The transaction in which to perform any persistence
	     *     operations.
	     * @param documentKey The key of the entry to look up.
	     * @return The cached Document or NoDocument entry, or null if we have nothing
	     * cached.
	     */
	    RemoteDocumentChangeBuffer.prototype.getEntry = function (transaction, documentKey) {
	        var changes = this.assertChanges();
	        var bufferedEntry = changes.get(documentKey);
	        if (bufferedEntry) {
	            return PersistencePromise.resolve(bufferedEntry);
	        }
	        else {
	            return this.remoteDocumentCache.getEntry(transaction, documentKey);
	        }
	    };
	    /**
	     * Applies buffered changes to the underlying RemoteDocumentCache, using
	     * the provided transaction.
	     */
	    RemoteDocumentChangeBuffer.prototype.apply = function (transaction) {
	        var _this = this;
	        var changes = this.assertChanges();
	        var promises = [];
	        changes.forEach(function (key, maybeDoc) {
	            promises.push(_this.remoteDocumentCache.addEntry(transaction, maybeDoc));
	        });
	        // We should not be used to buffer any more changes.
	        this.changes = null;
	        return PersistencePromise.waitFor(promises);
	    };
	    /** Helper to assert this.changes is not null and return it. */
	    RemoteDocumentChangeBuffer.prototype.assertChanges = function () {
	        assert$1(this.changes !== null, 'Changes have already been applied.');
	        return this.changes;
	    };
	    return RemoteDocumentChangeBuffer;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG$4 = 'LocalStore';
	/**
	 * Local storage in the Firestore client. Coordinates persistence components
	 * like the mutation queue and remote document cache to present a
	 * latency-compensated view of stored data.
	 *
	 * The LocalStore is responsible for accepting mutations from the Sync Engine.
	 * Writes from the client are put into a queue as provisional Mutations until
	 * they are processed by the RemoteStore and confirmed as having been written
	 * to the server.
	 *
	 * The local store provides the local version of documents that have been
	 * modified locally. It maintains the constraint:
	 *
	 *   LocalDocument = RemoteDocument + Active(LocalMutations)
	 *
	 * (Active mutations are those that are enqueued and have not been previously
	 * acknowledged or rejected).
	 *
	 * The RemoteDocument ("ground truth") state is provided via the
	 * applyChangeBatch method. It will be some version of a server-provided
	 * document OR will be a server-provided document PLUS acknowledged mutations:
	 *
	 *   RemoteDocument' = RemoteDocument + Acknowledged(LocalMutations)
	 *
	 * Note that this "dirty" version of a RemoteDocument will not be identical to a
	 * server base version, since it has LocalMutations added to it pending getting
	 * an authoritative copy from the server.
	 *
	 * Since LocalMutations can be rejected by the server, we have to be able to
	 * revert a LocalMutation that has already been applied to the LocalDocument
	 * (typically done by replaying all remaining LocalMutations to the
	 * RemoteDocument to re-apply).
	 *
	 * The LocalStore is responsible for the garbage collection of the documents it
	 * contains. For now, it every doc referenced by a view, the mutation queue, or
	 * the RemoteStore.
	 *
	 * It also maintains the persistence of mapping queries to resume tokens and
	 * target ids. It needs to know this data about queries to properly know what
	 * docs it would be allowed to garbage collect.
	 *
	 * The LocalStore must be able to efficiently execute queries against its local
	 * cache of the documents, to provide the initial set of results before any
	 * remote changes have been received.
	 *
	 * Note: In TypeScript, most methods return Promises since the implementation
	 * may rely on fetching data from IndexedDB which is async.
	 * These Promises will only be rejected on an I/O error or other internal
	 * (unexpected) failure (e.g. failed assert) and always represent an
	 * unrecoverable error (should be caught / reported by the async_queue).
	 */
	var LocalStore = /** @class */ (function () {
	    function LocalStore(
	    /** Manages our in-memory or durable persistence. */
	    persistence, initialUser, 
	    /**
	     * The garbage collector collects documents that should no longer be
	     * cached (e.g. if they are no longer retained by the above reference sets
	     * and the garbage collector is performing eager collection).
	     */
	    garbageCollector) {
	        this.persistence = persistence;
	        this.garbageCollector = garbageCollector;
	        /**
	         * The set of document references maintained by any local views.
	         */
	        this.localViewReferences = new ReferenceSet();
	        /** Maps a targetID to data about its query. */
	        this.targetIds = {};
	        /** Used to generate targetIDs for queries tracked locally. */
	        this.targetIdGenerator = TargetIdGenerator.forLocalStore();
	        /**
	         * A heldBatchResult is a mutation batch result (from a write acknowledgement)
	         * that arrived before the watch stream got notified of a snapshot that
	         * includes the write. So we "hold" it until the watch stream catches up. It
	         * ensures that the local write remains visible (latency compensation) and
	         * doesn't temporarily appear reverted because the watch stream is slower than
	         * the write stream and so wasn't reflecting it.
	         *
	         * NOTE: Eventually we want to move this functionality into the remote store.
	         */
	        this.heldBatchResults = [];
	        this.mutationQueue = persistence.getMutationQueue(initialUser);
	        this.remoteDocuments = persistence.getRemoteDocumentCache();
	        this.queryCache = persistence.getQueryCache();
	        this.localDocuments = new LocalDocumentsView(this.remoteDocuments, this.mutationQueue);
	        this.garbageCollector.addGarbageSource(this.localViewReferences);
	        this.garbageCollector.addGarbageSource(this.queryCache);
	        this.garbageCollector.addGarbageSource(this.mutationQueue);
	    }
	    /** Performs any initial startup actions required by the local store. */
	    LocalStore.prototype.start = function () {
	        var _this = this;
	        return this.persistence.runTransaction('Start LocalStore', function (txn) {
	            return _this.startMutationQueue(txn).next(function () { return _this.startQueryCache(txn); });
	        });
	    };
	    /**
	     * Tells the LocalStore that the currently authenticated user has changed.
	     *
	     * In response the local store switches the mutation queue to the new user and
	     * returns any resulting document changes.
	     */
	    LocalStore.prototype.handleUserChange = function (user) {
	        var _this = this;
	        return this.persistence.runTransaction('Handle user change', function (txn) {
	            // Swap out the mutation queue, grabbing the pending mutation batches
	            // before and after.
	            var oldBatches;
	            return _this.mutationQueue
	                .getAllMutationBatches(txn)
	                .next(function (promisedOldBatches) {
	                oldBatches = promisedOldBatches;
	                _this.garbageCollector.removeGarbageSource(_this.mutationQueue);
	                _this.mutationQueue = _this.persistence.getMutationQueue(user);
	                _this.garbageCollector.addGarbageSource(_this.mutationQueue);
	                return _this.startMutationQueue(txn);
	            })
	                .next(function () {
	                // Recreate our LocalDocumentsView using the new
	                // MutationQueue.
	                _this.localDocuments = new LocalDocumentsView(_this.remoteDocuments, _this.mutationQueue);
	                return _this.mutationQueue.getAllMutationBatches(txn);
	            })
	                .next(function (newBatches) {
	                // Union the old/new changed keys.
	                var changedKeys = documentKeySet();
	                for (var _i = 0, _a = [oldBatches, newBatches]; _i < _a.length; _i++) {
	                    var batches = _a[_i];
	                    for (var _b = 0, batches_1 = batches; _b < batches_1.length; _b++) {
	                        var batch = batches_1[_b];
	                        for (var _c = 0, _d = batch.mutations; _c < _d.length; _c++) {
	                            var mutation = _d[_c];
	                            changedKeys = changedKeys.add(mutation.key);
	                        }
	                    }
	                }
	                // Return the set of all (potentially) changed documents as the
	                // result of the user change.
	                return _this.localDocuments.getDocuments(txn, changedKeys);
	            });
	        });
	    };
	    LocalStore.prototype.startQueryCache = function (txn) {
	        var _this = this;
	        return this.queryCache.start(txn).next(function () {
	            var targetId = _this.queryCache.getHighestTargetId();
	            _this.targetIdGenerator = TargetIdGenerator.forLocalStore(targetId);
	        });
	    };
	    LocalStore.prototype.startMutationQueue = function (txn) {
	        var _this = this;
	        return this.mutationQueue
	            .start(txn)
	            .next(function () {
	            // If we have any leftover mutation batch results from a prior run,
	            // just drop them.
	            // TODO(http://b/33446471): We probably need to repopulate
	            // heldBatchResults or similar instead, but that is not
	            // straightforward since we're not persisting the write ack versions.
	            _this.heldBatchResults = [];
	            return _this.mutationQueue.getHighestAcknowledgedBatchId(txn);
	        })
	            .next(function (highestAck) {
	            // TODO(mikelehen): This is the only usage of
	            // getAllMutationBatchesThroughBatchId(). Consider removing it in
	            // favor of a getAcknowledgedBatches() method.
	            if (highestAck !== BATCHID_UNKNOWN) {
	                return _this.mutationQueue.getAllMutationBatchesThroughBatchId(txn, highestAck);
	            }
	            else {
	                return PersistencePromise.resolve([]);
	            }
	        })
	            .next(function (ackedBatches) {
	            if (ackedBatches.length > 0) {
	                return _this.mutationQueue.removeMutationBatches(txn, ackedBatches);
	            }
	            else {
	                return PersistencePromise.resolve();
	            }
	        });
	    };
	    /* Accept locally generated Mutations and commit them to storage. */
	    LocalStore.prototype.localWrite = function (mutations) {
	        var _this = this;
	        return this.persistence.runTransaction('Locally write mutations', function (txn) {
	            var batch;
	            var localWriteTime = Timestamp.now();
	            return _this.mutationQueue
	                .addMutationBatch(txn, localWriteTime, mutations)
	                .next(function (promisedBatch) {
	                batch = promisedBatch;
	                // TODO(koss): This is doing an N^2 update by replaying ALL the
	                // mutations on each document (instead of just the ones added) in
	                // this batch.
	                var keys = batch.keys();
	                return _this.localDocuments.getDocuments(txn, keys);
	            })
	                .next(function (changedDocuments) {
	                return { batchId: batch.batchId, changes: changedDocuments };
	            });
	        });
	    };
	    /**
	     * Acknowledge the given batch.
	     *
	     * On the happy path when a batch is acknowledged, the local store will
	     *
	     *  + remove the batch from the mutation queue;
	     *  + apply the changes to the remote document cache;
	     *  + recalculate the latency compensated view implied by those changes (there
	     *    may be mutations in the queue that affect the documents but haven't been
	     *    acknowledged yet); and
	     *  + give the changed documents back the sync engine
	     *
	     * @returns The resulting (modified) documents.
	     */
	    LocalStore.prototype.acknowledgeBatch = function (batchResult) {
	        var _this = this;
	        return this.persistence.runTransaction('Acknowledge batch', function (txn) {
	            var affected;
	            return _this.mutationQueue
	                .acknowledgeBatch(txn, batchResult.batch, batchResult.streamToken)
	                .next(function () {
	                if (_this.shouldHoldBatchResult(batchResult.commitVersion)) {
	                    _this.heldBatchResults.push(batchResult);
	                    affected = documentKeySet();
	                    return PersistencePromise.resolve();
	                }
	                else {
	                    var documentBuffer_1 = new RemoteDocumentChangeBuffer(_this.remoteDocuments);
	                    return _this.releaseBatchResults(txn, [batchResult], documentBuffer_1).next(function (promisedAffectedKeys) {
	                        affected = promisedAffectedKeys;
	                        return documentBuffer_1.apply(txn);
	                    });
	                }
	            })
	                .next(function () {
	                return _this.mutationQueue.performConsistencyCheck(txn);
	            })
	                .next(function () {
	                return _this.localDocuments.getDocuments(txn, affected);
	            });
	        });
	    };
	    /**
	     * Remove mutations from the MutationQueue for the specified batch;
	     * LocalDocuments will be recalculated.
	     *
	     * @returns The resulting modified documents.
	     */
	    LocalStore.prototype.rejectBatch = function (batchId) {
	        var _this = this;
	        return this.persistence.runTransaction('Reject batch', function (txn) {
	            var toReject;
	            var affectedKeys;
	            return _this.mutationQueue
	                .lookupMutationBatch(txn, batchId)
	                .next(function (promisedToReject) {
	                assert$1(promisedToReject != null, 'Attempt to reject nonexistent batch!');
	                toReject = promisedToReject;
	                return _this.mutationQueue
	                    .getHighestAcknowledgedBatchId(txn)
	                    .next(function (lastAcked) {
	                    assert$1(batchId > lastAcked, "Acknowledged batches can't be rejected.");
	                    return toReject;
	                });
	            })
	                .next(function () {
	                return _this.removeMutationBatch(txn, toReject);
	            })
	                .next(function (promisedAffectedKeys) {
	                affectedKeys = promisedAffectedKeys;
	                return _this.mutationQueue.performConsistencyCheck(txn);
	            })
	                .next(function () {
	                return _this.localDocuments.getDocuments(txn, affectedKeys);
	            });
	        });
	    };
	    /** Returns the last recorded stream token for the current user. */
	    LocalStore.prototype.getLastStreamToken = function () {
	        var _this = this;
	        return this.persistence.runTransaction('Get last stream token', function (txn) {
	            return _this.mutationQueue.getLastStreamToken(txn);
	        });
	    };
	    /**
	     * Sets the stream token for the current user without acknowledging any
	     * mutation batch. This is usually only useful after a stream handshake or in
	     * response to an error that requires clearing the stream token.
	     */
	    LocalStore.prototype.setLastStreamToken = function (streamToken) {
	        var _this = this;
	        return this.persistence.runTransaction('Set last stream token', function (txn) {
	            return _this.mutationQueue.setLastStreamToken(txn, streamToken);
	        });
	    };
	    /**
	     * Returns the last consistent snapshot processed (used by the RemoteStore to
	     * determine whether to buffer incoming snapshots from the backend).
	     */
	    LocalStore.prototype.getLastRemoteSnapshotVersion = function () {
	        return this.queryCache.getLastRemoteSnapshotVersion();
	    };
	    /**
	     * Update the "ground-state" (remote) documents. We assume that the remote
	     * event reflects any write batches that have been acknowledged or rejected
	     * (i.e. we do not re-apply local mutations to updates from this event).
	     *
	     * LocalDocuments are re-calculated if there are remaining mutations in the
	     * queue.
	     */
	    LocalStore.prototype.applyRemoteEvent = function (remoteEvent) {
	        var _this = this;
	        var documentBuffer = new RemoteDocumentChangeBuffer(this.remoteDocuments);
	        return this.persistence.runTransaction('Apply remote event', function (txn) {
	            var promises = [];
	            var authoritativeUpdates = documentKeySet();
	            forEachNumber(remoteEvent.targetChanges, function (targetId, change) {
	                // Do not ref/unref unassigned targetIds - it may lead to leaks.
	                var queryData = _this.targetIds[targetId];
	                if (!queryData)
	                    { return; }
	                // When a global snapshot contains updates (either add or modify) we
	                // can completely trust these updates as authoritative and blindly
	                // apply them to our cache (as a defensive measure to promote
	                // self-healing in the unfortunate case that our cache is ever somehow
	                // corrupted / out-of-sync).
	                //
	                // If the document is only updated while removing it from a target
	                // then watch isn't obligated to send the absolute latest version: it
	                // can send the first version that caused the document not to match.
	                change.addedDocuments.forEach(function (key) {
	                    authoritativeUpdates = authoritativeUpdates.add(key);
	                });
	                change.modifiedDocuments.forEach(function (key) {
	                    authoritativeUpdates = authoritativeUpdates.add(key);
	                });
	                promises.push(_this.queryCache
	                    .removeMatchingKeys(txn, change.removedDocuments, targetId)
	                    .next(function () {
	                    return _this.queryCache.addMatchingKeys(txn, change.addedDocuments, targetId);
	                }));
	                // Update the resume token if the change includes one. Don't clear
	                // any preexisting value.
	                var resumeToken = change.resumeToken;
	                if (resumeToken.length > 0) {
	                    queryData = queryData.update({
	                        resumeToken: resumeToken,
	                        snapshotVersion: remoteEvent.snapshotVersion
	                    });
	                    _this.targetIds[targetId] = queryData;
	                    promises.push(_this.queryCache.updateQueryData(txn, queryData));
	                }
	            });
	            var changedDocKeys = documentKeySet();
	            remoteEvent.documentUpdates.forEach(function (key, doc) {
	                changedDocKeys = changedDocKeys.add(key);
	                promises.push(documentBuffer.getEntry(txn, key).next(function (existingDoc) {
	                    // If a document update isn't authoritative, make sure we don't
	                    // apply an old document version to the remote cache. We make an
	                    // exception for SnapshotVersion.MIN which can happen for
	                    // manufactured events (e.g. in the case of a limbo document
	                    // resolution failing).
	                    if (existingDoc == null ||
	                        doc.version.isEqual(SnapshotVersion.MIN) ||
	                        authoritativeUpdates.has(doc.key) ||
	                        doc.version.compareTo(existingDoc.version) >= 0) {
	                        documentBuffer.addEntry(doc);
	                    }
	                    else {
	                        debug(LOG_TAG$4, 'Ignoring outdated watch update for ', key, '. Current version:', existingDoc.version, ' Watch version:', doc.version);
	                    }
	                    // The document might be garbage because it was unreferenced by
	                    // everything. Make sure to mark it as garbage if it is...
	                    _this.garbageCollector.addPotentialGarbageKey(key);
	                }));
	            });
	            // HACK: The only reason we allow a null snapshot version is so that we
	            // can synthesize remote events when we get permission denied errors while
	            // trying to resolve the state of a locally cached document that is in
	            // limbo.
	            var lastRemoteVersion = _this.queryCache.getLastRemoteSnapshotVersion();
	            var remoteVersion = remoteEvent.snapshotVersion;
	            if (!remoteVersion.isEqual(SnapshotVersion.MIN)) {
	                assert$1(remoteVersion.compareTo(lastRemoteVersion) >= 0, 'Watch stream reverted to previous snapshot?? ' +
	                    remoteVersion +
	                    ' < ' +
	                    lastRemoteVersion);
	                promises.push(_this.queryCache.setLastRemoteSnapshotVersion(txn, remoteVersion));
	            }
	            var releasedWriteKeys;
	            return PersistencePromise.waitFor(promises)
	                .next(function () { return _this.releaseHeldBatchResults(txn, documentBuffer); })
	                .next(function (promisedReleasedWriteKeys) {
	                releasedWriteKeys = promisedReleasedWriteKeys;
	                return documentBuffer.apply(txn);
	            })
	                .next(function () {
	                return _this.localDocuments.getDocuments(txn, changedDocKeys.unionWith(releasedWriteKeys));
	            });
	        });
	    };
	    /**
	     * Notify local store of the changed views to locally pin documents.
	     */
	    LocalStore.prototype.notifyLocalViewChanges = function (viewChanges) {
	        var _this = this;
	        return this.persistence.runTransaction('Notify local view changes', function (txn) {
	            var promises = [];
	            var _loop_1 = function (view) {
	                promises.push(_this.queryCache
	                    .getQueryData(txn, view.query)
	                    .next(function (queryData) {
	                    assert$1(queryData !== null, 'Local view changes contain unallocated query.');
	                    var targetId = queryData.targetId;
	                    _this.localViewReferences.addReferences(view.addedKeys, targetId);
	                    _this.localViewReferences.removeReferences(view.removedKeys, targetId);
	                }));
	            };
	            for (var _i = 0, viewChanges_1 = viewChanges; _i < viewChanges_1.length; _i++) {
	                var view = viewChanges_1[_i];
	                _loop_1(view);
	            }
	            return PersistencePromise.waitFor(promises);
	        });
	    };
	    /**
	     * Gets the mutation batch after the passed in batchId in the mutation queue
	     * or null if empty.
	     * @param afterBatchId If provided, the batch to search after.
	     * @returns The next mutation or null if there wasn't one.
	     */
	    LocalStore.prototype.nextMutationBatch = function (afterBatchId) {
	        var _this = this;
	        return this.persistence.runTransaction('Get next mutation batch', function (txn) {
	            if (afterBatchId === undefined) {
	                afterBatchId = BATCHID_UNKNOWN;
	            }
	            return _this.mutationQueue.getNextMutationBatchAfterBatchId(txn, afterBatchId);
	        });
	    };
	    /**
	     * Read the current value of a Document with a given key or null if not
	     * found - used for testing.
	     */
	    LocalStore.prototype.readDocument = function (key) {
	        var _this = this;
	        return this.persistence.runTransaction('read document', function (txn) {
	            return _this.localDocuments.getDocument(txn, key);
	        });
	    };
	    /**
	     * Assigns the given query an internal ID so that its results can be pinned so
	     * they don't get GC'd. A query must be allocated in the local store before
	     * the store can be used to manage its view.
	     */
	    LocalStore.prototype.allocateQuery = function (query) {
	        var _this = this;
	        return this.persistence.runTransaction('Allocate query', function (txn) {
	            var queryData;
	            return _this.queryCache
	                .getQueryData(txn, query)
	                .next(function (cached) {
	                if (cached) {
	                    // This query has been listened to previously, so reuse the
	                    // previous targetID.
	                    // TODO(mcg): freshen last accessed date?
	                    queryData = cached;
	                    return PersistencePromise.resolve();
	                }
	                else {
	                    var targetId = _this.targetIdGenerator.next();
	                    queryData = new QueryData(query, targetId, QueryPurpose.Listen);
	                    return _this.queryCache.addQueryData(txn, queryData);
	                }
	            })
	                .next(function () {
	                assert$1(!_this.targetIds[queryData.targetId], 'Tried to allocate an already allocated query: ' + query);
	                _this.targetIds[queryData.targetId] = queryData;
	                return queryData;
	            });
	        });
	    };
	    /** Unpin all the documents associated with the given query. */
	    LocalStore.prototype.releaseQuery = function (query) {
	        var _this = this;
	        return this.persistence.runTransaction('Release query', function (txn) {
	            return _this.queryCache
	                .getQueryData(txn, query)
	                .next(function (queryData) {
	                assert$1(queryData != null, 'Tried to release nonexistent query: ' + query);
	                _this.localViewReferences.removeReferencesForId(queryData.targetId);
	                delete _this.targetIds[queryData.targetId];
	                if (_this.garbageCollector.isEager) {
	                    return _this.queryCache.removeQueryData(txn, queryData);
	                }
	                else {
	                    return PersistencePromise.resolve();
	                }
	            })
	                .next(function () {
	                // If this was the last watch target, then we won't get any more
	                // watch snapshots, so we should release any held batch results.
	                if (isEmpty$1(_this.targetIds)) {
	                    var documentBuffer_2 = new RemoteDocumentChangeBuffer(_this.remoteDocuments);
	                    return _this.releaseHeldBatchResults(txn, documentBuffer_2).next(function () {
	                        documentBuffer_2.apply(txn);
	                    });
	                }
	                else {
	                    return PersistencePromise.resolve();
	                }
	            });
	        });
	    };
	    /**
	     * Runs the specified query against all the documents in the local store and
	     * returns the results.
	     */
	    LocalStore.prototype.executeQuery = function (query) {
	        var _this = this;
	        return this.persistence.runTransaction('Execute query', function (txn) {
	            return _this.localDocuments.getDocumentsMatchingQuery(txn, query);
	        });
	    };
	    /**
	     * Returns the keys of the documents that are associated with the given
	     * target id in the remote table.
	     */
	    LocalStore.prototype.remoteDocumentKeys = function (targetId) {
	        var _this = this;
	        return this.persistence.runTransaction('Remote document keys', function (txn) {
	            return _this.queryCache.getMatchingKeysForTargetId(txn, targetId);
	        });
	    };
	    /**
	     * Collect garbage if necessary.
	     * Should be called periodically by Sync Engine to recover resources. The
	     * implementation must guarantee that GC won't happen in other places than
	     * this method call.
	     */
	    LocalStore.prototype.collectGarbage = function () {
	        var _this = this;
	        // Call collectGarbage regardless of whether isGCEnabled so the referenceSet
	        // doesn't continue to accumulate the garbage keys.
	        return this.persistence.runTransaction('Garbage collection', function (txn) {
	            return _this.garbageCollector.collectGarbage(txn).next(function (garbage) {
	                var promises = [];
	                garbage.forEach(function (key) {
	                    promises.push(_this.remoteDocuments.removeEntry(txn, key));
	                });
	                return PersistencePromise.waitFor(promises);
	            });
	        });
	    };
	    LocalStore.prototype.releaseHeldBatchResults = function (txn, documentBuffer) {
	        var this$1 = this;

	        var toRelease = [];
	        for (var _i = 0, _a = this.heldBatchResults; _i < _a.length; _i++) {
	            var batchResult = _a[_i];
	            if (!this$1.isRemoteUpToVersion(batchResult.commitVersion)) {
	                break;
	            }
	            toRelease.push(batchResult);
	        }
	        if (toRelease.length === 0) {
	            return PersistencePromise.resolve(documentKeySet());
	        }
	        else {
	            this.heldBatchResults.splice(0, toRelease.length);
	            return this.releaseBatchResults(txn, toRelease, documentBuffer);
	        }
	    };
	    LocalStore.prototype.isRemoteUpToVersion = function (version) {
	        // If there are no watch targets, then we won't get remote snapshots, and
	        // we are always "up-to-date."
	        var lastRemoteVersion = this.queryCache.getLastRemoteSnapshotVersion();
	        return (version.compareTo(lastRemoteVersion) <= 0 ||
	            isEmpty$1(this.targetIds));
	    };
	    LocalStore.prototype.shouldHoldBatchResult = function (version) {
	        // Check if watcher isn't up to date or prior results are already held.
	        return (!this.isRemoteUpToVersion(version) || this.heldBatchResults.length > 0);
	    };
	    LocalStore.prototype.releaseBatchResults = function (txn, batchResults, documentBuffer) {
	        var _this = this;
	        var promiseChain = PersistencePromise.resolve();
	        var _loop_2 = function (batchResult) {
	            promiseChain = promiseChain.next(function () {
	                return _this.applyWriteToRemoteDocuments(txn, batchResult, documentBuffer);
	            });
	        };
	        for (var _i = 0, batchResults_1 = batchResults; _i < batchResults_1.length; _i++) {
	            var batchResult = batchResults_1[_i];
	            _loop_2(batchResult);
	        }
	        return promiseChain.next(function () {
	            return _this.removeMutationBatches(txn, batchResults.map(function (result) { return result.batch; }));
	        });
	    };
	    LocalStore.prototype.removeMutationBatch = function (txn, batch) {
	        return this.removeMutationBatches(txn, [batch]);
	    };
	    /** Removes all the mutation batches named in the given array. */
	    LocalStore.prototype.removeMutationBatches = function (txn, batches) {
	        var affectedDocs = documentKeySet();
	        for (var _i = 0, batches_2 = batches; _i < batches_2.length; _i++) {
	            var batch = batches_2[_i];
	            for (var _a = 0, _b = batch.mutations; _a < _b.length; _a++) {
	                var mutation = _b[_a];
	                var key = mutation.key;
	                affectedDocs = affectedDocs.add(key);
	            }
	        }
	        return this.mutationQueue
	            .removeMutationBatches(txn, batches)
	            .next(function () { return affectedDocs; });
	    };
	    LocalStore.prototype.applyWriteToRemoteDocuments = function (txn, batchResult, documentBuffer) {
	        var batch = batchResult.batch;
	        var docKeys = batch.keys();
	        var promiseChain = PersistencePromise.resolve();
	        docKeys.forEach(function (docKey) {
	            promiseChain = promiseChain
	                .next(function () {
	                return documentBuffer.getEntry(txn, docKey);
	            })
	                .next(function (remoteDoc) {
	                var doc = remoteDoc;
	                var ackVersion = batchResult.docVersions.get(docKey);
	                assert$1(ackVersion !== null, 'ackVersions should contain every doc in the write.');
	                if (!doc || doc.version.compareTo(ackVersion) < 0) {
	                    doc = batch.applyToRemoteDocument(docKey, doc, batchResult);
	                    if (!doc) {
	                        assert$1(!remoteDoc, 'Mutation batch ' +
	                            batch +
	                            ' applied to document ' +
	                            remoteDoc +
	                            ' resulted in null');
	                    }
	                    else {
	                        documentBuffer.addEntry(doc);
	                    }
	                }
	            });
	        });
	        return promiseChain;
	    };
	    return LocalStore;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var MemoryMutationQueue = /** @class */ (function () {
	    function MemoryMutationQueue() {
	        /**
	         * The set of all mutations that have been sent but not yet been applied to
	         * the backend.
	         */
	        this.mutationQueue = [];
	        /** Next value to use when assigning sequential IDs to each mutation batch. */
	        this.nextBatchId = 1;
	        /** The highest acknowledged mutation in the queue. */
	        this.highestAcknowledgedBatchId = BATCHID_UNKNOWN;
	        /** The last received stream token from the server, used to acknowledge which
	         * responses the client has processed. Stream tokens are opaque checkpoint
	         * markers whose only real value is their inclusion in the next request.
	         */
	        this.lastStreamToken = emptyByteString();
	        /** The garbage collector to notify about potential garbage keys. */
	        this.garbageCollector = null;
	        /** An ordered mapping between documents and the mutations batch IDs. */
	        this.batchesByDocumentKey = new SortedSet(DocReference.compareByKey);
	    }
	    MemoryMutationQueue.prototype.start = function (transaction) {
	        // NOTE: The queue may be shutdown / started multiple times, since we
	        // maintain the queue for the duration of the app session in case a user
	        // logs out / back in. To behave like the LevelDB-backed MutationQueue (and
	        // accommodate tests that expect as much), we reset nextBatchId and
	        // highestAcknowledgedBatchId if the queue is empty.
	        if (this.mutationQueue.length === 0) {
	            this.nextBatchId = 1;
	            this.highestAcknowledgedBatchId = BATCHID_UNKNOWN;
	        }
	        assert$1(this.highestAcknowledgedBatchId < this.nextBatchId, 'highestAcknowledgedBatchId must be less than the nextBatchId');
	        return PersistencePromise.resolve();
	    };
	    MemoryMutationQueue.prototype.checkEmpty = function (transaction) {
	        return PersistencePromise.resolve(this.mutationQueue.length === 0);
	    };
	    MemoryMutationQueue.prototype.getNextBatchId = function (transaction) {
	        return PersistencePromise.resolve(this.nextBatchId);
	    };
	    MemoryMutationQueue.prototype.getHighestAcknowledgedBatchId = function (transaction) {
	        return PersistencePromise.resolve(this.highestAcknowledgedBatchId);
	    };
	    MemoryMutationQueue.prototype.acknowledgeBatch = function (transaction, batch, streamToken) {
	        var batchId = batch.batchId;
	        assert$1(batchId > this.highestAcknowledgedBatchId, 'Mutation batchIDs must be acknowledged in order');
	        var batchIndex = this.indexOfExistingBatchId(batchId, 'acknowledged');
	        // Verify that the batch in the queue is the one to be acknowledged.
	        var check = this.mutationQueue[batchIndex];
	        assert$1(batchId === check.batchId, 'Queue ordering failure: expected batch ' +
	            batchId +
	            ', got batch ' +
	            check.batchId);
	        assert$1(!check.isTombstone(), "Can't acknowledge a previously removed batch");
	        this.highestAcknowledgedBatchId = batchId;
	        this.lastStreamToken = streamToken;
	        return PersistencePromise.resolve();
	    };
	    MemoryMutationQueue.prototype.getLastStreamToken = function (transaction) {
	        return PersistencePromise.resolve(this.lastStreamToken);
	    };
	    MemoryMutationQueue.prototype.setLastStreamToken = function (transaction, streamToken) {
	        this.lastStreamToken = streamToken;
	        return PersistencePromise.resolve();
	    };
	    MemoryMutationQueue.prototype.addMutationBatch = function (transaction, localWriteTime, mutations) {
	        var this$1 = this;

	        assert$1(mutations.length !== 0, 'Mutation batches should not be empty');
	        var batchId = this.nextBatchId;
	        this.nextBatchId++;
	        if (this.mutationQueue.length > 0) {
	            var prior = this.mutationQueue[this.mutationQueue.length - 1];
	            assert$1(prior.batchId < batchId, 'Mutation batchIDs must be monotonically increasing order');
	        }
	        var batch = new MutationBatch(batchId, localWriteTime, mutations);
	        this.mutationQueue.push(batch);
	        // Track references by document key.
	        for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
	            var mutation = mutations_1[_i];
	            this$1.batchesByDocumentKey = this$1.batchesByDocumentKey.add(new DocReference(mutation.key, batchId));
	        }
	        return PersistencePromise.resolve(batch);
	    };
	    MemoryMutationQueue.prototype.lookupMutationBatch = function (transaction, batchId) {
	        return PersistencePromise.resolve(this.findMutationBatch(batchId));
	    };
	    MemoryMutationQueue.prototype.getNextMutationBatchAfterBatchId = function (transaction, batchId) {
	        var this$1 = this;

	        var size = this.mutationQueue.length;
	        // All batches with batchId <= this.highestAcknowledgedBatchId have been
	        // acknowledged so the first unacknowledged batch after batchID will have a
	        // batchID larger than both of these values.
	        var nextBatchId = Math.max(batchId, this.highestAcknowledgedBatchId) + 1;
	        // The requested batchId may still be out of range so normalize it to the
	        // start of the queue.
	        var rawIndex = this.indexOfBatchId(nextBatchId);
	        var index = rawIndex < 0 ? 0 : rawIndex;
	        // Finally return the first non-tombstone batch.
	        for (; index < size; index++) {
	            var batch = this$1.mutationQueue[index];
	            if (!batch.isTombstone()) {
	                return PersistencePromise.resolve(batch);
	            }
	        }
	        return PersistencePromise.resolve(null);
	    };
	    MemoryMutationQueue.prototype.getAllMutationBatches = function (transaction) {
	        return PersistencePromise.resolve(this.getAllLiveMutationBatchesBeforeIndex(this.mutationQueue.length));
	    };
	    MemoryMutationQueue.prototype.getAllMutationBatchesThroughBatchId = function (transaction, batchId) {
	        var count = this.mutationQueue.length;
	        var endIndex = this.indexOfBatchId(batchId);
	        if (endIndex < 0) {
	            endIndex = 0;
	        }
	        else if (endIndex >= count) {
	            endIndex = count;
	        }
	        else {
	            // The endIndex is in the queue so increment to pull everything in the
	            // queue including it.
	            endIndex++;
	        }
	        return PersistencePromise.resolve(this.getAllLiveMutationBatchesBeforeIndex(endIndex));
	    };
	    MemoryMutationQueue.prototype.getAllMutationBatchesAffectingDocumentKey = function (transaction, documentKey) {
	        var _this = this;
	        var start = new DocReference(documentKey, 0);
	        var end = new DocReference(documentKey, Number.POSITIVE_INFINITY);
	        var result = [];
	        this.batchesByDocumentKey.forEachInRange([start, end], function (ref) {
	            assert$1(documentKey.isEqual(ref.key), "Should only iterate over a single key's batches");
	            var batch = _this.findMutationBatch(ref.targetOrBatchId);
	            assert$1(batch !== null, 'Batches in the index must exist in the main table');
	            result.push(batch);
	        });
	        return PersistencePromise.resolve(result);
	    };
	    MemoryMutationQueue.prototype.getAllMutationBatchesAffectingQuery = function (transaction, query) {
	        var _this = this;
	        // Use the query path as a prefix for testing if a document matches the
	        // query.
	        var prefix = query.path;
	        var immediateChildrenPathLength = prefix.length + 1;
	        // Construct a document reference for actually scanning the index. Unlike
	        // the prefix the document key in this reference must have an even number of
	        // segments. The empty segment can be used a suffix of the query path
	        // because it precedes all other segments in an ordered traversal.
	        var startPath = prefix;
	        if (!DocumentKey.isDocumentKey(startPath)) {
	            startPath = startPath.child('');
	        }
	        var start = new DocReference(new DocumentKey(startPath), 0);
	        // Find unique batchIDs referenced by all documents potentially matching the
	        // query.
	        var uniqueBatchIDs = new SortedSet(primitiveComparator);
	        this.batchesByDocumentKey.forEachWhile(function (ref) {
	            var rowKeyPath = ref.key.path;
	            if (!prefix.isPrefixOf(rowKeyPath)) {
	                return false;
	            }
	            else {
	                // Rows with document keys more than one segment longer than the query
	                // path can't be matches. For example, a query on 'rooms' can't match
	                // the document /rooms/abc/messages/xyx.
	                // TODO(mcg): we'll need a different scanner when we implement
	                // ancestor queries.
	                if (rowKeyPath.length === immediateChildrenPathLength) {
	                    uniqueBatchIDs = uniqueBatchIDs.add(ref.targetOrBatchId);
	                }
	                return true;
	            }
	        }, start);
	        // Construct an array of matching batches, sorted by batchID to ensure that
	        // multiple mutations affecting the same document key are applied in order.
	        var result = [];
	        uniqueBatchIDs.forEach(function (batchId) {
	            var batch = _this.findMutationBatch(batchId);
	            if (batch !== null) {
	                result.push(batch);
	            }
	        });
	        return PersistencePromise.resolve(result);
	    };
	    MemoryMutationQueue.prototype.removeMutationBatches = function (transaction, batches) {
	        var this$1 = this;

	        var batchCount = batches.length;
	        assert$1(batchCount > 0, 'Should not remove mutations when none exist.');
	        var firstBatchId = batches[0].batchId;
	        var queueCount = this.mutationQueue.length;
	        // Find the position of the first batch for removal. This need not be the
	        // first entry in the queue.
	        var startIndex = this.indexOfExistingBatchId(firstBatchId, 'removed');
	        assert$1(this.mutationQueue[startIndex].batchId === firstBatchId, 'Removed batches must exist in the queue');
	        // Check that removed batches are contiguous (while excluding tombstones).
	        var batchIndex = 1;
	        var queueIndex = startIndex + 1;
	        while (batchIndex < batchCount && queueIndex < queueCount) {
	            var batch = this$1.mutationQueue[queueIndex];
	            if (batch.isTombstone()) {
	                queueIndex++;
	                continue;
	            }
	            assert$1(batch.batchId === batches[batchIndex].batchId, 'Removed batches must be contiguous in the queue');
	            batchIndex++;
	            queueIndex++;
	        }
	        // Only actually remove batches if removing at the front of the queue.
	        // Previously rejected batches may have left tombstones in the queue, so
	        // expand the removal range to include any tombstones.
	        if (startIndex === 0) {
	            for (; queueIndex < queueCount; queueIndex++) {
	                var batch = this$1.mutationQueue[queueIndex];
	                if (!batch.isTombstone()) {
	                    break;
	                }
	            }
	            var length_1 = queueIndex - startIndex;
	            this.mutationQueue.splice(startIndex, length_1);
	        }
	        else {
	            // Mark the tombstones
	            for (var i = startIndex; i < queueIndex; i++) {
	                this$1.mutationQueue[i] = this$1.mutationQueue[i].toTombstone();
	            }
	        }
	        var references = this.batchesByDocumentKey;
	        for (var _i = 0, batches_1 = batches; _i < batches_1.length; _i++) {
	            var batch = batches_1[_i];
	            var batchId = batch.batchId;
	            for (var _a = 0, _b = batch.mutations; _a < _b.length; _a++) {
	                var mutation = _b[_a];
	                var key = mutation.key;
	                if (this$1.garbageCollector !== null) {
	                    this$1.garbageCollector.addPotentialGarbageKey(key);
	                }
	                var ref = new DocReference(key, batchId);
	                references = references.delete(ref);
	            }
	        }
	        this.batchesByDocumentKey = references;
	        return PersistencePromise.resolve();
	    };
	    MemoryMutationQueue.prototype.setGarbageCollector = function (garbageCollector) {
	        this.garbageCollector = garbageCollector;
	    };
	    MemoryMutationQueue.prototype.containsKey = function (txn, key) {
	        var ref = new DocReference(key, 0);
	        var firstRef = this.batchesByDocumentKey.firstAfterOrEqual(ref);
	        return PersistencePromise.resolve(key.isEqual(firstRef && firstRef.key));
	    };
	    MemoryMutationQueue.prototype.performConsistencyCheck = function (txn) {
	        if (this.mutationQueue.length === 0) {
	            assert$1(this.batchesByDocumentKey.isEmpty(), 'Document leak -- detected dangling mutation references when queue is empty.');
	        }
	        return PersistencePromise.resolve();
	    };
	    /**
	     * A private helper that collects all the mutations batches in the queue up to
	     * but not including the given endIndex. All tombstones in the queue are
	     * excluded.
	     */
	    MemoryMutationQueue.prototype.getAllLiveMutationBatchesBeforeIndex = function (endIndex) {
	        var this$1 = this;

	        var result = [];
	        for (var i = 0; i < endIndex; i++) {
	            var batch = this$1.mutationQueue[i];
	            if (!batch.isTombstone()) {
	                result.push(batch);
	            }
	        }
	        return result;
	    };
	    /**
	     * Finds the index of the given batchId in the mutation queue and asserts that
	     * the resulting index is within the bounds of the queue.
	     *
	     * @param batchId The batchId to search for
	     * @param action A description of what the caller is doing, phrased in passive
	     * form (e.g. "acknowledged" in a routine that acknowledges batches).
	     */
	    MemoryMutationQueue.prototype.indexOfExistingBatchId = function (batchId, action) {
	        var index = this.indexOfBatchId(batchId);
	        assert$1(index >= 0 && index < this.mutationQueue.length, 'Batches must exist to be ' + action);
	        return index;
	    };
	    /**
	     * Finds the index of the given batchId in the mutation queue. This operation
	     * is O(1).
	     *
	     * @return The computed index of the batch with the given batchId, based on
	     * the state of the queue. Note this index can be negative if the requested
	     * batchId has already been remvoed from the queue or past the end of the
	     * queue if the batchId is larger than the last added batch.
	     */
	    MemoryMutationQueue.prototype.indexOfBatchId = function (batchId) {
	        if (this.mutationQueue.length === 0) {
	            // As an index this is past the end of the queue
	            return 0;
	        }
	        // Examine the front of the queue to figure out the difference between the
	        // batchId and indexes in the array. Note that since the queue is ordered
	        // by batchId, if the first batch has a larger batchId then the requested
	        // batchId doesn't exist in the queue.
	        var firstBatchId = this.mutationQueue[0].batchId;
	        return batchId - firstBatchId;
	    };
	    /**
	     * A version of lookupMutationBatch that doesn't return a promise, this makes
	     * other functions that uses this code easier to read and more efficent.
	     */
	    MemoryMutationQueue.prototype.findMutationBatch = function (batchId) {
	        var index = this.indexOfBatchId(batchId);
	        if (index < 0 || index >= this.mutationQueue.length) {
	            return null;
	        }
	        var batch = this.mutationQueue[index];
	        assert$1(batch.batchId === batchId, 'If found batch must match');
	        return batch.isTombstone() ? null : batch;
	    };
	    return MemoryMutationQueue;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var MemoryQueryCache = /** @class */ (function () {
	    function MemoryQueryCache() {
	        /**
	         * Maps a query to the data about that query
	         */
	        this.queries = new ObjectMap(function (q) { return q.canonicalId(); });
	        /** The last received snapshot version. */
	        this.lastRemoteSnapshotVersion = SnapshotVersion.MIN;
	        /** The highest numbered target ID encountered. */
	        this.highestTargetId = 0;
	        /**
	         * A ordered bidirectional mapping between documents and the remote target
	         * IDs.
	         */
	        this.references = new ReferenceSet();
	        this.targetCount = 0;
	    }
	    MemoryQueryCache.prototype.start = function (transaction) {
	        // Nothing to do.
	        return PersistencePromise.resolve();
	    };
	    MemoryQueryCache.prototype.getLastRemoteSnapshotVersion = function () {
	        return this.lastRemoteSnapshotVersion;
	    };
	    MemoryQueryCache.prototype.getHighestTargetId = function () {
	        return this.highestTargetId;
	    };
	    MemoryQueryCache.prototype.setLastRemoteSnapshotVersion = function (transaction, snapshotVersion) {
	        this.lastRemoteSnapshotVersion = snapshotVersion;
	        return PersistencePromise.resolve();
	    };
	    MemoryQueryCache.prototype.saveQueryData = function (queryData) {
	        this.queries.set(queryData.query, queryData);
	        var targetId = queryData.targetId;
	        if (targetId > this.highestTargetId) {
	            this.highestTargetId = targetId;
	        }
	        // TODO(GC): track sequence number
	    };
	    MemoryQueryCache.prototype.addQueryData = function (transaction, queryData) {
	        assert$1(!this.queries.has(queryData.query), 'Adding a query that already exists');
	        this.saveQueryData(queryData);
	        this.targetCount += 1;
	        return PersistencePromise.resolve();
	    };
	    MemoryQueryCache.prototype.updateQueryData = function (transaction, queryData) {
	        assert$1(this.queries.has(queryData.query), 'Updating a non-existent query');
	        this.saveQueryData(queryData);
	        return PersistencePromise.resolve();
	    };
	    MemoryQueryCache.prototype.removeQueryData = function (transaction, queryData) {
	        assert$1(this.targetCount > 0, 'Removing a target from an empty cache');
	        assert$1(this.queries.has(queryData.query), 'Removing a non-existent target from the cache');
	        this.queries.delete(queryData.query);
	        this.references.removeReferencesForId(queryData.targetId);
	        this.targetCount -= 1;
	        return PersistencePromise.resolve();
	    };
	    Object.defineProperty(MemoryQueryCache.prototype, "count", {
	        get: function () {
	            return this.targetCount;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    MemoryQueryCache.prototype.getQueryData = function (transaction, query) {
	        var queryData = this.queries.get(query) || null;
	        return PersistencePromise.resolve(queryData);
	    };
	    MemoryQueryCache.prototype.addMatchingKeys = function (txn, keys, targetId) {
	        this.references.addReferences(keys, targetId);
	        return PersistencePromise.resolve();
	    };
	    MemoryQueryCache.prototype.removeMatchingKeys = function (txn, keys, targetId) {
	        this.references.removeReferences(keys, targetId);
	        return PersistencePromise.resolve();
	    };
	    MemoryQueryCache.prototype.removeMatchingKeysForTargetId = function (txn, targetId) {
	        this.references.removeReferencesForId(targetId);
	        return PersistencePromise.resolve();
	    };
	    MemoryQueryCache.prototype.getMatchingKeysForTargetId = function (txn, targetId) {
	        var matchingKeys = this.references.referencesForId(targetId);
	        return PersistencePromise.resolve(matchingKeys);
	    };
	    MemoryQueryCache.prototype.setGarbageCollector = function (gc) {
	        this.references.setGarbageCollector(gc);
	    };
	    MemoryQueryCache.prototype.containsKey = function (txn, key) {
	        return this.references.containsKey(txn, key);
	    };
	    return MemoryQueryCache;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var MemoryRemoteDocumentCache = /** @class */ (function () {
	    function MemoryRemoteDocumentCache() {
	        this.docs = maybeDocumentMap();
	    }
	    MemoryRemoteDocumentCache.prototype.addEntry = function (transaction, maybeDocument) {
	        this.docs = this.docs.insert(maybeDocument.key, maybeDocument);
	        return PersistencePromise.resolve();
	    };
	    MemoryRemoteDocumentCache.prototype.removeEntry = function (transaction, documentKey) {
	        this.docs = this.docs.remove(documentKey);
	        return PersistencePromise.resolve();
	    };
	    MemoryRemoteDocumentCache.prototype.getEntry = function (transaction, documentKey) {
	        return PersistencePromise.resolve(this.docs.get(documentKey));
	    };
	    MemoryRemoteDocumentCache.prototype.getDocumentsMatchingQuery = function (transaction, query) {
	        var results = documentMap();
	        // Documents are ordered by key, so we can use a prefix scan to narrow down
	        // the documents we need to match the query against.
	        var prefix = new DocumentKey(query.path.child(''));
	        var iterator = this.docs.getIteratorFrom(prefix);
	        while (iterator.hasNext()) {
	            var _a = iterator.getNext(), key = _a.key, maybeDoc = _a.value;
	            if (!query.path.isPrefixOf(key.path)) {
	                break;
	            }
	            if (maybeDoc instanceof Document && query.matches(maybeDoc)) {
	                results = results.insert(maybeDoc.key, maybeDoc);
	            }
	        }
	        return PersistencePromise.resolve(results);
	    };
	    return MemoryRemoteDocumentCache;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG$5 = 'MemoryPersistence';
	/**
	 * A memory-backed instance of Persistence. Data is stored only in RAM and
	 * not persisted across sessions.
	 */
	var MemoryPersistence = /** @class */ (function () {
	    function MemoryPersistence() {
	        /**
	         * Note that these are retained here to make it easier to write tests
	         * affecting both the in-memory and IndexedDB-backed persistence layers. Tests
	         * can create a new LocalStore wrapping this Persistence instance and this
	         * will make the in-memory persistence layer behave as if it were actually
	         * persisting values.
	         */
	        this.mutationQueues = {};
	        this.remoteDocumentCache = new MemoryRemoteDocumentCache();
	        this.queryCache = new MemoryQueryCache();
	        this.started = false;
	    }
	    MemoryPersistence.prototype.start = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                // No durable state to read on startup.
	                assert$1(!this.started, 'MemoryPersistence double-started!');
	                this.started = true;
	                return [2 /*return*/];
	            });
	        });
	    };
	    MemoryPersistence.prototype.shutdown = function (deleteData) {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                // No durable state to ensure is closed on shutdown.
	                assert$1(this.started, 'MemoryPersistence shutdown without start!');
	                this.started = false;
	                return [2 /*return*/];
	            });
	        });
	    };
	    MemoryPersistence.prototype.getMutationQueue = function (user) {
	        var queue = this.mutationQueues[user.toKey()];
	        if (!queue) {
	            queue = new MemoryMutationQueue();
	            this.mutationQueues[user.toKey()] = queue;
	        }
	        return queue;
	    };
	    MemoryPersistence.prototype.getQueryCache = function () {
	        return this.queryCache;
	    };
	    MemoryPersistence.prototype.getRemoteDocumentCache = function () {
	        return this.remoteDocumentCache;
	    };
	    MemoryPersistence.prototype.runTransaction = function (action, operation) {
	        debug(LOG_TAG$5, 'Starting transaction:', action);
	        return operation(new MemoryPersistenceTransaction()).toPromise();
	    };
	    return MemoryPersistence;
	}());
	/** Dummy class since memory persistence doesn't actually use transactions. */
	var MemoryPersistenceTransaction = /** @class */ (function () {
	    function MemoryPersistenceTransaction() {
	    }
	    return MemoryPersistenceTransaction;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * A garbage collector implementation that does absolutely nothing. It ignores
	 * all addGarbageSource and addPotentialGarbageKey messages and and never
	 * produces any garbage.
	 */
	var NoOpGarbageCollector = /** @class */ (function () {
	    function NoOpGarbageCollector() {
	        this.isEager = false;
	    }
	    NoOpGarbageCollector.prototype.addGarbageSource = function (garbageSource) {
	        // Not tracking garbage so don't track sources.
	    };
	    NoOpGarbageCollector.prototype.removeGarbageSource = function (garbageSource) {
	        // Not tracking garbage so don't track sources.
	    };
	    NoOpGarbageCollector.prototype.addPotentialGarbageKey = function (key) {
	        // Not tracking garbage so ignore.
	    };
	    NoOpGarbageCollector.prototype.collectGarbage = function (txn) {
	        return PersistencePromise.resolve(documentKeySet());
	    };
	    return NoOpGarbageCollector;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Wellknown "timer" IDs used when scheduling delayed operations on the
	 * AsyncQueue. These IDs can then be used from tests to check for the presence
	 * of operations or to run them early.
	 *
	 * The string values are used when encoding these timer IDs in JSON spec tests.
	 */
	var TimerId;
	(function (TimerId) {
	    /** All can be used with runDelayedOperationsEarly() to run all timers. */
	    TimerId["All"] = "all";
	    /**
	     * The following 4 timers are used in persistent_stream.ts for the listen and
	     * write streams. The "Idle" timer is used to close the stream due to
	     * inactivity. The "ConnectionBackoff" timer is used to restart a stream once
	     * the appropriate backoff delay has elapsed.
	     */
	    TimerId["ListenStreamIdle"] = "listen_stream_idle";
	    TimerId["ListenStreamConnectionBackoff"] = "listen_stream_connection_backoff";
	    TimerId["WriteStreamIdle"] = "write_stream_idle";
	    TimerId["WriteStreamConnectionBackoff"] = "write_stream_connection_backoff";
	    /**
	     * A timer used in online_state_tracker.ts to transition from
	     * OnlineState.Unknown to Offline after a set timeout, rather than waiting
	     * indefinitely for success or failure.
	     */
	    TimerId["OnlineStateTimeout"] = "online_state_timeout";
	})(TimerId || (TimerId = {}));
	/**
	 * Represents an operation scheduled to be run in the future on an AsyncQueue.
	 *
	 * It is created via DelayedOperation.createAndSchedule().
	 *
	 * Supports cancellation (via cancel()) and early execution (via skipDelay()).
	 */
	var DelayedOperation = /** @class */ (function () {
	    function DelayedOperation(asyncQueue, timerId, targetTimeMs, op, removalCallback) {
	        this.asyncQueue = asyncQueue;
	        this.timerId = timerId;
	        this.targetTimeMs = targetTimeMs;
	        this.op = op;
	        this.removalCallback = removalCallback;
	        this.deferred = new Deferred$1();
	        this.then = this.deferred.promise.then.bind(this.deferred.promise);
	        this.catch = this.deferred.promise.catch.bind(this.deferred.promise);
	        // It's normal for the deferred promise to be canceled (due to cancellation)
	        // and so we attach a dummy catch callback to avoid
	        // 'UnhandledPromiseRejectionWarning' log spam.
	        this.deferred.promise.catch(function (err) { });
	    }
	    /**
	     * Creates and returns a DelayedOperation that has been scheduled to be
	     * executed on the provided asyncQueue after the provided delayMs.
	     *
	     * @param asyncQueue The queue to schedule the operation on.
	     * @param id A Timer ID identifying the type of operation this is.
	     * @param delayMs The delay (ms) before the operation should be scheduled.
	     * @param op The operation to run.
	     * @param removalCallback A callback to be called synchronously once the
	     *   operation is executed or canceled, notifying the AsyncQueue to remove it
	     *   from its delayedOperations list.
	     *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
	     *   the DelayedOperation class public.
	     */
	    DelayedOperation.createAndSchedule = function (asyncQueue, timerId, delayMs, op, removalCallback) {
	        var targetTime = Date.now() + delayMs;
	        var delayedOp = new DelayedOperation(asyncQueue, timerId, targetTime, op, removalCallback);
	        delayedOp.start(delayMs);
	        return delayedOp;
	    };
	    /**
	     * Starts the timer. This is called immediately after construction by
	     * createAndSchedule().
	     */
	    DelayedOperation.prototype.start = function (delayMs) {
	        var _this = this;
	        this.timerHandle = setTimeout(function () { return _this.handleDelayElapsed(); }, delayMs);
	    };
	    /**
	     * Queues the operation to run immediately (if it hasn't already been run or
	     * canceled).
	     */
	    DelayedOperation.prototype.skipDelay = function () {
	        return this.handleDelayElapsed();
	    };
	    /**
	     * Cancels the operation if it hasn't already been executed or canceled. The
	     * promise will be rejected.
	     *
	     * As long as the operation has not yet been run, calling cancel() provides a
	     * guarantee that the operation will not be run.
	     */
	    DelayedOperation.prototype.cancel = function (reason) {
	        if (this.timerHandle !== null) {
	            this.clearTimeout();
	            this.deferred.reject(new FirestoreError(Code.CANCELLED, 'Operation cancelled' + (reason ? ': ' + reason : '')));
	        }
	    };
	    DelayedOperation.prototype.handleDelayElapsed = function () {
	        var _this = this;
	        this.asyncQueue.enqueue(function () {
	            if (_this.timerHandle !== null) {
	                _this.clearTimeout();
	                return _this.op().then(function (result) {
	                    return _this.deferred.resolve(result);
	                });
	            }
	            else {
	                return Promise.resolve();
	            }
	        });
	    };
	    DelayedOperation.prototype.clearTimeout = function () {
	        if (this.timerHandle !== null) {
	            this.removalCallback(this);
	            clearTimeout(this.timerHandle);
	            this.timerHandle = null;
	        }
	    };
	    return DelayedOperation;
	}());
	var AsyncQueue = /** @class */ (function () {
	    function AsyncQueue() {
	        // The last promise in the queue.
	        this.tail = Promise.resolve();
	        // Operations scheduled to be queued in the future. Operations are
	        // automatically removed after they are run or canceled.
	        this.delayedOperations = [];
	        // Flag set while there's an outstanding AsyncQueue operation, used for
	        // assertion sanity-checks.
	        this.operationInProgress = false;
	    }
	    /**
	     * Adds a new operation to the queue. Returns a promise that will be resolved
	     * when the promise returned by the new operation is (with its value).
	     */
	    AsyncQueue.prototype.enqueue = function (op) {
	        var _this = this;
	        this.verifyNotFailed();
	        var newTail = this.tail.then(function () {
	            _this.operationInProgress = true;
	            return op()
	                .catch(function (error$$1) {
	                _this.failure = error$$1;
	                _this.operationInProgress = false;
	                var message = error$$1.stack || error$$1.message || '';
	                error$1('INTERNAL UNHANDLED ERROR: ', message);
	                // Escape the promise chain and throw the error globally so that
	                // e.g. any global crash reporting library detects and reports it.
	                // (but not for simulated errors in our tests since this breaks mocha)
	                if (message.indexOf('Firestore Test Simulated Error') < 0) {
	                    setTimeout(function () {
	                        throw error$$1;
	                    }, 0);
	                }
	                // Re-throw the error so that this.tail becomes a rejected Promise and
	                // all further attempts to chain (via .then) will just short-circuit
	                // and return the rejected Promise.
	                throw error$$1;
	            })
	                .then(function (result) {
	                _this.operationInProgress = false;
	                return result;
	            });
	        });
	        this.tail = newTail;
	        return newTail;
	    };
	    /**
	     * Schedules an operation to be queued on the AsyncQueue once the specified
	     * `delayMs` has elapsed. The returned CancelablePromise can be used to cancel
	     * the operation prior to its running.
	     */
	    AsyncQueue.prototype.enqueueAfterDelay = function (timerId, delayMs, op) {
	        var _this = this;
	        this.verifyNotFailed();
	        // While not necessarily harmful, we currently don't expect to have multiple
	        // ops with the same timer id in the queue, so defensively reject them.
	        assert$1(!this.containsDelayedOperation(timerId), "Attempted to schedule multiple operations with timer id " + timerId + ".");
	        var delayedOp = DelayedOperation.createAndSchedule(this, timerId, delayMs, op, function (op) { return _this.removeDelayedOperation(op); });
	        this.delayedOperations.push(delayedOp);
	        return delayedOp;
	    };
	    AsyncQueue.prototype.verifyNotFailed = function () {
	        if (this.failure) {
	            fail('AsyncQueue is already failed: ' +
	                (this.failure.stack || this.failure.message));
	        }
	    };
	    /**
	     * Verifies there's an operation currently in-progress on the AsyncQueue.
	     * Unfortunately we can't verify that the running code is in the promise chain
	     * of that operation, so this isn't a foolproof check, but it should be enough
	     * to catch some bugs.
	     */
	    AsyncQueue.prototype.verifyOperationInProgress = function () {
	        assert$1(this.operationInProgress, 'verifyOpInProgress() called when no op in progress on this queue.');
	    };
	    /**
	     * Waits until all currently queued tasks are finished executing. Delayed
	     * operations are not run.
	     */
	    AsyncQueue.prototype.drain = function () {
	        return this.enqueue(function () { return Promise.resolve(); });
	    };
	    /**
	     * For Tests: Determine if a delayed operation with a particular TimerId
	     * exists.
	     */
	    AsyncQueue.prototype.containsDelayedOperation = function (timerId) {
	        return this.delayedOperations.findIndex(function (op) { return op.timerId === timerId; }) >= 0;
	    };
	    /**
	     * For Tests: Runs some or all delayed operations early.
	     *
	     * @param lastTimerId Delayed operations up to and including this TimerId will
	     *  be drained. Throws if no such operation exists. Pass TimerId.All to run
	     *  all delayed operations.
	     * @returns a Promise that resolves once all operations have been run.
	     */
	    AsyncQueue.prototype.runDelayedOperationsEarly = function (lastTimerId) {
	        var _this = this;
	        // Note that draining may generate more delayed ops, so we do that first.
	        return this.drain().then(function () {
	            assert$1(lastTimerId === TimerId.All ||
	                _this.containsDelayedOperation(lastTimerId), "Attempted to drain to missing operation " + lastTimerId);
	            // Run ops in the same order they'd run if they ran naturally.
	            _this.delayedOperations.sort(function (a, b) { return a.targetTimeMs - b.targetTimeMs; });
	            for (var _i = 0, _a = _this.delayedOperations; _i < _a.length; _i++) {
	                var op = _a[_i];
	                op.skipDelay();
	                if (lastTimerId !== TimerId.All && op.timerId === lastTimerId) {
	                    break;
	                }
	            }
	            return _this.drain();
	        });
	    };
	    /** Called once a DelayedOperation is run or canceled. */
	    AsyncQueue.prototype.removeDelayedOperation = function (op) {
	        // NOTE: indexOf / slice are O(n), but delayedOperations is expected to be small.
	        var index = this.delayedOperations.indexOf(op);
	        assert$1(index >= 0, 'Delayed operation not found.');
	        this.delayedOperations.splice(index, 1);
	    };
	    return AsyncQueue;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG$6 = 'ExponentialBackoff';
	/**
	 * A helper for running delayed tasks following an exponential backoff curve
	 * between attempts.
	 *
	 * Each delay is made up of a "base" delay which follows the exponential
	 * backoff curve, and a +/- 50% "jitter" that is calculated and added to the
	 * base delay. This prevents clients from accidentally synchronizing their
	 * delays causing spikes of load to the backend.
	 */
	var ExponentialBackoff = /** @class */ (function () {
	    function ExponentialBackoff(
	    /**
	     * The AsyncQueue to run backoff operations on.
	     */
	    queue, 
	    /**
	     * The ID to use when scheduling backoff operations on the AsyncQueue.
	     */
	    timerId, 
	    /**
	     * The initial delay (used as the base delay on the first retry attempt).
	     * Note that jitter will still be applied, so the actual delay could be as
	     * little as 0.5*initialDelayMs.
	     */
	    initialDelayMs, 
	    /**
	     * The multiplier to use to determine the extended base delay after each
	     * attempt.
	     */
	    backoffFactor, 
	    /**
	     * The maximum base delay after which no further backoff is performed.
	     * Note that jitter will still be applied, so the actual delay could be as
	     * much as 1.5*maxDelayMs.
	     */
	    maxDelayMs) {
	        this.queue = queue;
	        this.timerId = timerId;
	        this.initialDelayMs = initialDelayMs;
	        this.backoffFactor = backoffFactor;
	        this.maxDelayMs = maxDelayMs;
	        this.timerPromise = null;
	        this.reset();
	    }
	    /**
	     * Resets the backoff delay.
	     *
	     * The very next backoffAndWait() will have no delay. If it is called again
	     * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
	     * subsequent ones will increase according to the backoffFactor.
	     */
	    ExponentialBackoff.prototype.reset = function () {
	        this.currentBaseMs = 0;
	    };
	    /**
	     * Resets the backoff delay to the maximum delay (e.g. for use after a
	     * RESOURCE_EXHAUSTED error).
	     */
	    ExponentialBackoff.prototype.resetToMax = function () {
	        this.currentBaseMs = this.maxDelayMs;
	    };
	    /**
	     * Returns a promise that resolves after currentDelayMs, and increases the
	     * delay for any subsequent attempts. If there was a pending backoff operation
	     * already, it will be canceled.
	     */
	    ExponentialBackoff.prototype.backoffAndRun = function (op) {
	        // Cancel any pending backoff operation.
	        this.cancel();
	        // First schedule using the current base (which may be 0 and should be
	        // honored as such).
	        var delayWithJitterMs = this.currentBaseMs + this.jitterDelayMs();
	        if (this.currentBaseMs > 0) {
	            debug(LOG_TAG$6, "Backing off for " + delayWithJitterMs + " ms " +
	                ("(base delay: " + this.currentBaseMs + " ms)"));
	        }
	        this.timerPromise = this.queue.enqueueAfterDelay(this.timerId, delayWithJitterMs, op);
	        // Apply backoff factor to determine next delay and ensure it is within
	        // bounds.
	        this.currentBaseMs *= this.backoffFactor;
	        if (this.currentBaseMs < this.initialDelayMs) {
	            this.currentBaseMs = this.initialDelayMs;
	        }
	        if (this.currentBaseMs > this.maxDelayMs) {
	            this.currentBaseMs = this.maxDelayMs;
	        }
	    };
	    ExponentialBackoff.prototype.cancel = function () {
	        if (this.timerPromise !== null) {
	            this.timerPromise.cancel();
	            this.timerPromise = null;
	        }
	    };
	    /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */
	    ExponentialBackoff.prototype.jitterDelayMs = function () {
	        return (Math.random() - 0.5) * this.currentBaseMs;
	    };
	    return ExponentialBackoff;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG$7 = 'PersistentStream';
	var PersistentStreamState;
	(function (PersistentStreamState) {
	    /**
	     * The streaming RPC is not running and there's no error condition.
	     * Calling `start` will start the stream immediately without backoff.
	     * While in this state isStarted will return false.
	     */
	    PersistentStreamState[PersistentStreamState["Initial"] = 0] = "Initial";
	    /**
	     * The stream is starting, and is waiting for an auth token to attach to
	     * the initial request. While in this state, isStarted will return
	     * true but isOpen will return false.
	     */
	    PersistentStreamState[PersistentStreamState["Auth"] = 1] = "Auth";
	    /**
	     * The streaming RPC is up and running. Requests and responses can flow
	     * freely. Both isStarted and isOpen will return true.
	     */
	    PersistentStreamState[PersistentStreamState["Open"] = 2] = "Open";
	    /**
	     * The stream encountered an error. The next start attempt will back off.
	     * While in this state isStarted() will return false.
	     *
	     */
	    PersistentStreamState[PersistentStreamState["Error"] = 3] = "Error";
	    /**
	     * An in-between state after an error where the stream is waiting before
	     * re-starting. After
	     * waiting is complete, the stream will try to open. While in this
	     * state isStarted() will return YES but isOpen will return false.
	     */
	    PersistentStreamState[PersistentStreamState["Backoff"] = 4] = "Backoff";
	    /**
	     * The stream has been explicitly stopped; no further events will be emitted.
	     */
	    PersistentStreamState[PersistentStreamState["Stopped"] = 5] = "Stopped";
	})(PersistentStreamState || (PersistentStreamState = {}));
	/**
	 * Initial backoff time in milliseconds after an error.
	 * Set to 1s according to https://cloud.google.com/apis/design/errors.
	 */
	var BACKOFF_INITIAL_DELAY_MS = 1000;
	/** Maximum backoff time in milliseconds */
	var BACKOFF_MAX_DELAY_MS = 60 * 1000;
	var BACKOFF_FACTOR = 1.5;
	/** The time a stream stays open after it is marked idle. */
	var IDLE_TIMEOUT_MS = 60 * 1000;
	/**
	 * A PersistentStream is an abstract base class that represents a streaming RPC
	 * to the Firestore backend. It's built on top of the connections own support
	 * for streaming RPCs, and adds several critical features for our clients:
	 *
	 *   - Exponential backoff on failure
	 *   - Authentication via CredentialsProvider
	 *   - Dispatching all callbacks into the shared worker queue
	 *
	 * Subclasses of PersistentStream implement serialization of models to and
	 * from the JSON representation of the protocol buffers for a specific
	 * streaming RPC.
	 *
	 * ## Starting and Stopping
	 *
	 * Streaming RPCs are stateful and need to be `start`ed before messages can
	 * be sent and received. The PersistentStream will call the onOpen function
	 * of the listener once the stream is ready to accept requests.
	 *
	 * Should a `start` fail, PersistentStream will call the registered
	 * onClose with a FirestoreError indicating what went wrong.
	 *
	 * A PersistentStream can be started and stopped repeatedly.
	 *
	 * Generic types:
	 *  SendType: The type of the outgoing message of the underlying
	 *    connection stream
	 *  ReceiveType: The type of the incoming message of the underlying
	 *    connection stream
	 *  ListenerType: The type of the listener that will be used for callbacks
	 */
	var PersistentStream = /** @class */ (function () {
	    function PersistentStream(queue, connectionTimerId, idleTimerId, connection, credentialsProvider) {
	        this.queue = queue;
	        this.idleTimerId = idleTimerId;
	        this.connection = connection;
	        this.credentialsProvider = credentialsProvider;
	        this.inactivityTimerPromise = null;
	        this.stream = null;
	        this.listener = null;
	        this.backoff = new ExponentialBackoff(queue, connectionTimerId, BACKOFF_INITIAL_DELAY_MS, BACKOFF_FACTOR, BACKOFF_MAX_DELAY_MS);
	        this.state = PersistentStreamState.Initial;
	    }
	    /**
	     * Returns true if `start` has been called and no error has occurred. True
	     * indicates the stream is open or in the process of opening (which
	     * encompasses respecting backoff, getting auth tokens, and starting the
	     * actual RPC). Use `isOpen` to determine if the stream is open and ready for
	     * outbound requests.
	     */
	    PersistentStream.prototype.isStarted = function () {
	        return (this.state === PersistentStreamState.Backoff ||
	            this.state === PersistentStreamState.Auth ||
	            this.state === PersistentStreamState.Open);
	    };
	    /**
	     * Returns true if the underlying RPC is open (the openHandler has been
	     * called) and the stream is ready for outbound requests.
	     */
	    PersistentStream.prototype.isOpen = function () {
	        return this.state === PersistentStreamState.Open;
	    };
	    /**
	     * Starts the RPC. Only allowed if isStarted returns false. The stream is
	     * not immediately ready for use: onOpen will be invoked when the RPC is ready
	     * for outbound requests, at which point isOpen will return true.
	     *
	     *  When start returns, isStarted will return true.
	     */
	    PersistentStream.prototype.start = function (listener) {
	        if (this.state === PersistentStreamState.Error) {
	            this.performBackoff(listener);
	            return;
	        }
	        assert$1(this.state === PersistentStreamState.Initial, 'Already started');
	        this.listener = listener;
	        this.auth();
	    };
	    /**
	     * Stops the RPC. This call is idempotent and allowed regardless of the
	     * current isStarted state.
	     *
	     * When stop returns, isStarted and isOpen will both return false.
	     */
	    PersistentStream.prototype.stop = function () {
	        if (this.isStarted()) {
	            this.close(PersistentStreamState.Stopped);
	        }
	    };
	    /**
	     * After an error the stream will usually back off on the next attempt to
	     * start it. If the error warrants an immediate restart of the stream, the
	     * sender can use this to indicate that the receiver should not back off.
	     *
	     * Each error will call the onClose function. That function can decide to
	     * inhibit backoff if required.
	     */
	    PersistentStream.prototype.inhibitBackoff = function () {
	        assert$1(!this.isStarted(), 'Can only inhibit backoff in a stopped state');
	        this.state = PersistentStreamState.Initial;
	        this.backoff.reset();
	    };
	    /**
	     * Marks this stream as idle. If no further actions are performed on the
	     * stream for one minute, the stream will automatically close itself and
	     * notify the stream's onClose() handler with Status.OK. The stream will then
	     * be in a !isStarted() state, requiring the caller to start the stream again
	     * before further use.
	     *
	     * Only streams that are in state 'Open' can be marked idle, as all other
	     * states imply pending network operations.
	     */
	    PersistentStream.prototype.markIdle = function () {
	        var _this = this;
	        // Starts the idle time if we are in state 'Open' and are not yet already
	        // running a timer (in which case the previous idle timeout still applies).
	        if (this.isOpen() && this.inactivityTimerPromise === null) {
	            this.inactivityTimerPromise = this.queue.enqueueAfterDelay(this.idleTimerId, IDLE_TIMEOUT_MS, function () { return _this.handleIdleCloseTimer(); });
	        }
	    };
	    /** Sends a message to the underlying stream. */
	    PersistentStream.prototype.sendRequest = function (msg) {
	        this.cancelIdleCheck();
	        this.stream.send(msg);
	    };
	    /** Called by the idle timer when the stream should close due to inactivity. */
	    PersistentStream.prototype.handleIdleCloseTimer = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                if (this.isOpen()) {
	                    // When timing out an idle stream there's no reason to force the stream into backoff when
	                    // it restarts so set the stream state to Initial instead of Error.
	                    return [2 /*return*/, this.close(PersistentStreamState.Initial)];
	                }
	                return [2 /*return*/];
	            });
	        });
	    };
	    /** Marks the stream as active again. */
	    PersistentStream.prototype.cancelIdleCheck = function () {
	        if (this.inactivityTimerPromise) {
	            this.inactivityTimerPromise.cancel();
	            this.inactivityTimerPromise = null;
	        }
	    };
	    /**
	     * Closes the stream and cleans up as necessary:
	     *
	     * * closes the underlying GRPC stream;
	     * * calls the onClose handler with the given 'error';
	     * * sets internal stream state to 'finalState';
	     * * adjusts the backoff timer based on the error
	     *
	     * A new stream can be opened by calling `start` unless `finalState` is set to
	     * `PersistentStreamState.Stopped`.
	     *
	     * @param finalState the intended state of the stream after closing.
	     * @param error the error the connection was closed with.
	     */
	    PersistentStream.prototype.close = function (finalState, error$$1) {
	        return __awaiter(this, void 0, void 0, function () {
	            var listener;
	            return __generator(this, function (_a) {
	                assert$1(finalState === PersistentStreamState.Error || isNullOrUndefined(error$$1), "Can't provide an error when not in an error state.");
	                // The stream will be closed so we don't need our idle close timer anymore.
	                this.cancelIdleCheck();
	                // Ensure we don't leave a pending backoff operation queued (in case close()
	                // was called while we were waiting to reconnect).
	                this.backoff.cancel();
	                if (finalState !== PersistentStreamState.Error) {
	                    // If this is an intentional close ensure we don't delay our next connection attempt.
	                    this.backoff.reset();
	                }
	                else if (error$$1 && error$$1.code === Code.RESOURCE_EXHAUSTED) {
	                    // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
	                    error$1(error$$1.toString());
	                    error$1('Using maximum backoff delay to prevent overloading the backend.');
	                    this.backoff.resetToMax();
	                }
	                else if (error$$1 && error$$1.code === Code.UNAUTHENTICATED) {
	                    // "unauthenticated" error means the token was rejected. Try force refreshing it in case it
	                    // just expired.
	                    this.credentialsProvider.invalidateToken();
	                }
	                // Clean up the underlying stream because we are no longer interested in events.
	                if (this.stream !== null) {
	                    this.tearDown();
	                    this.stream.close();
	                    this.stream = null;
	                }
	                // This state must be assigned before calling onClose() to allow the callback to
	                // inhibit backoff or otherwise manipulate the state in its non-started state.
	                this.state = finalState;
	                listener = this.listener;
	                // Clear the listener to avoid bleeding of events from the underlying streams.
	                this.listener = null;
	                // If the caller explicitly requested a stream stop, don't notify them of a closing stream (it
	                // could trigger undesirable recovery logic, etc.).
	                if (finalState !== PersistentStreamState.Stopped) {
	                    return [2 /*return*/, listener.onClose(error$$1)];
	                }
	                return [2 /*return*/];
	            });
	        });
	    };
	    /**
	     * Can be overridden to perform additional cleanup before the stream is closed.
	     * Calling super.tearDown() is not required.
	     */
	    PersistentStream.prototype.tearDown = function () { };
	    PersistentStream.prototype.auth = function () {
	        var _this = this;
	        assert$1(this.state === PersistentStreamState.Initial, 'Must be in initial state to auth');
	        this.state = PersistentStreamState.Auth;
	        this.credentialsProvider.getToken().then(function (token) {
	            // Normally we'd have to schedule the callback on the AsyncQueue.
	            // However, the following calls are safe to be called outside the
	            // AsyncQueue since they don't chain asynchronous calls
	            _this.startStream(token);
	        }, function (error$$1) {
	            _this.queue.enqueue(function () { return __awaiter(_this, void 0, void 0, function () {
	                var rpcError;
	                return __generator(this, function (_a) {
	                    if (this.state !== PersistentStreamState.Stopped) {
	                        rpcError = new FirestoreError(Code.UNKNOWN, 'Fetching auth token failed: ' + error$$1.message);
	                        return [2 /*return*/, this.handleStreamClose(rpcError)];
	                    }
	                    return [2 /*return*/];
	                });
	            }); });
	        });
	    };
	    PersistentStream.prototype.startStream = function (token) {
	        var _this = this;
	        if (this.state === PersistentStreamState.Stopped) {
	            // Stream can be stopped while waiting for authorization.
	            return;
	        }
	        assert$1(this.state === PersistentStreamState.Auth, 'Trying to start stream in a non-auth state');
	        // Helper function to dispatch to AsyncQueue and make sure that any
	        // close will seem instantaneous and events are prevented from being
	        // raised after the close call
	        var dispatchIfStillActive = function (stream, fn) {
	            _this.queue.enqueue(function () { return __awaiter(_this, void 0, void 0, function () {
	                return __generator(this, function (_a) {
	                    // Only raise events if the stream instance has not changed
	                    if (this.stream === stream) {
	                        return [2 /*return*/, fn()];
	                    }
	                    return [2 /*return*/];
	                });
	            }); });
	        };
	        // Only start stream if listener has not changed
	        if (this.listener !== null) {
	            var currentStream_1 = this.startRpc(token);
	            this.stream = currentStream_1;
	            this.stream.onOpen(function () {
	                dispatchIfStillActive(currentStream_1, function () {
	                    assert$1(_this.state === PersistentStreamState.Auth, 'Expected stream to be in state auth, but was ' + _this.state);
	                    _this.state = PersistentStreamState.Open;
	                    return _this.listener.onOpen();
	                });
	            });
	            this.stream.onClose(function (error$$1) {
	                dispatchIfStillActive(currentStream_1, function () {
	                    return _this.handleStreamClose(error$$1);
	                });
	            });
	            this.stream.onMessage(function (msg) {
	                dispatchIfStillActive(currentStream_1, function () {
	                    return _this.onMessage(msg);
	                });
	            });
	        }
	    };
	    PersistentStream.prototype.performBackoff = function (listener) {
	        var _this = this;
	        assert$1(this.state === PersistentStreamState.Error, 'Should only perform backoff in an error case');
	        this.state = PersistentStreamState.Backoff;
	        this.backoff.backoffAndRun(function () { return __awaiter(_this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                if (this.state === PersistentStreamState.Stopped) {
	                    // We should have canceled the backoff timer when the stream was
	                    // closed, but just in case we make this a no-op.
	                    return [2 /*return*/];
	                }
	                this.state = PersistentStreamState.Initial;
	                this.start(listener);
	                assert$1(this.isStarted(), 'PersistentStream should have started');
	                return [2 /*return*/];
	            });
	        }); });
	    };
	    // Visible for tests
	    PersistentStream.prototype.handleStreamClose = function (error$$1) {
	        assert$1(this.isStarted(), "Can't handle server close on non-started stream");
	        debug(LOG_TAG$7, "close with error: " + error$$1);
	        this.stream = null;
	        // In theory the stream could close cleanly, however, in our current model
	        // we never expect this to happen because if we stop a stream ourselves,
	        // this callback will never be called. To prevent cases where we retry
	        // without a backoff accidentally, we set the stream to error in all cases.
	        return this.close(PersistentStreamState.Error, error$$1);
	    };
	    return PersistentStream;
	}());
	/**
	 * A PersistentStream that implements the Listen RPC.
	 *
	 * Once the Listen stream has called the openHandler, any number of listen and
	 * unlisten calls calls can be sent to control what changes will be sent from
	 * the server for ListenResponses.
	 */
	var PersistentListenStream = /** @class */ (function (_super) {
	    __extends(PersistentListenStream, _super);
	    function PersistentListenStream(queue, connection, credentials, serializer) {
	        var _this = _super.call(this, queue, TimerId.ListenStreamConnectionBackoff, TimerId.ListenStreamIdle, connection, credentials) || this;
	        _this.serializer = serializer;
	        return _this;
	    }
	    PersistentListenStream.prototype.startRpc = function (token) {
	        return this.connection.openStream('Listen', token);
	    };
	    PersistentListenStream.prototype.onMessage = function (watchChangeProto) {
	        // A successful response means the stream is healthy
	        this.backoff.reset();
	        var watchChange = this.serializer.fromWatchChange(watchChangeProto);
	        var snapshot = this.serializer.versionFromListenResponse(watchChangeProto);
	        return this.listener.onWatchChange(watchChange, snapshot);
	    };
	    /**
	     * Registers interest in the results of the given query. If the query
	     * includes a resumeToken it will be included in the request. Results that
	     * affect the query will be streamed back as WatchChange messages that
	     * reference the targetId.
	     */
	    PersistentListenStream.prototype.watch = function (queryData) {
	        var request = {};
	        request.database = this.serializer.encodedDatabaseId;
	        request.addTarget = this.serializer.toTarget(queryData);
	        var labels = this.serializer.toListenRequestLabels(queryData);
	        if (labels) {
	            request.labels = labels;
	        }
	        this.sendRequest(request);
	    };
	    /**
	     * Unregisters interest in the results of the query associated with the
	     * given targetId.
	     */
	    PersistentListenStream.prototype.unwatch = function (targetId) {
	        var request = {};
	        request.database = this.serializer.encodedDatabaseId;
	        request.removeTarget = targetId;
	        this.sendRequest(request);
	    };
	    return PersistentListenStream;
	}(PersistentStream));
	/**
	 * A Stream that implements the Write RPC.
	 *
	 * The Write RPC requires the caller to maintain special streamToken
	 * state in between calls, to help the server understand which responses the
	 * client has processed by the time the next request is made. Every response
	 * will contain a streamToken; this value must be passed to the next
	 * request.
	 *
	 * After calling start() on this stream, the next request must be a handshake,
	 * containing whatever streamToken is on hand. Once a response to this
	 * request is received, all pending mutations may be submitted. When
	 * submitting multiple batches of mutations at the same time, it's
	 * okay to use the same streamToken for the calls to writeMutations.
	 *
	 * TODO(b/33271235): Use proto types
	 */
	var PersistentWriteStream = /** @class */ (function (_super) {
	    __extends(PersistentWriteStream, _super);
	    function PersistentWriteStream(queue, connection, credentials, serializer) {
	        var _this = _super.call(this, queue, TimerId.WriteStreamConnectionBackoff, TimerId.WriteStreamIdle, connection, credentials) || this;
	        _this.serializer = serializer;
	        _this.handshakeComplete_ = false;
	        return _this;
	    }
	    Object.defineProperty(PersistentWriteStream.prototype, "handshakeComplete", {
	        /**
	         * Tracks whether or not a handshake has been successfully exchanged and
	         * the stream is ready to accept mutations.
	         */
	        get: function () {
	            return this.handshakeComplete_;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    // Override of PersistentStream.start
	    PersistentWriteStream.prototype.start = function (listener) {
	        this.handshakeComplete_ = false;
	        _super.prototype.start.call(this, listener);
	    };
	    PersistentWriteStream.prototype.tearDown = function () {
	        if (this.handshakeComplete_) {
	            this.writeMutations([]);
	        }
	    };
	    PersistentWriteStream.prototype.startRpc = function (token) {
	        return this.connection.openStream('Write', token);
	    };
	    PersistentWriteStream.prototype.onMessage = function (responseProto) {
	        // Always capture the last stream token.
	        assert$1(!!responseProto.streamToken, 'Got a write response without a stream token');
	        this.lastStreamToken = responseProto.streamToken;
	        if (!this.handshakeComplete_) {
	            // The first response is always the handshake response
	            assert$1(!responseProto.writeResults || responseProto.writeResults.length === 0, 'Got mutation results for handshake');
	            this.handshakeComplete_ = true;
	            return this.listener.onHandshakeComplete();
	        }
	        else {
	            // A successful first write response means the stream is healthy,
	            // Note, that we could consider a successful handshake healthy, however,
	            // the write itself might be causing an error we want to back off from.
	            this.backoff.reset();
	            var results = this.serializer.fromWriteResults(responseProto.writeResults);
	            var commitVersion = this.serializer.fromVersion(responseProto.commitTime);
	            return this.listener.onMutationResult(commitVersion, results);
	        }
	    };
	    /**
	     * Sends an initial streamToken to the server, performing the handshake
	     * required to make the StreamingWrite RPC work. Subsequent
	     * calls should wait until onHandshakeComplete was called.
	     */
	    PersistentWriteStream.prototype.writeHandshake = function () {
	        assert$1(this.isOpen(), 'Writing handshake requires an opened stream');
	        assert$1(!this.handshakeComplete_, 'Handshake already completed');
	        // TODO(dimond): Support stream resumption. We intentionally do not set the
	        // stream token on the handshake, ignoring any stream token we might have.
	        var request = {};
	        request.database = this.serializer.encodedDatabaseId;
	        this.sendRequest(request);
	    };
	    /** Sends a group of mutations to the Firestore backend to apply. */
	    PersistentWriteStream.prototype.writeMutations = function (mutations) {
	        var _this = this;
	        assert$1(this.isOpen(), 'Writing mutations requires an opened stream');
	        assert$1(this.handshakeComplete_, 'Handshake must be complete before writing mutations');
	        assert$1(this.lastStreamToken.length > 0, 'Trying to write mutation without a token');
	        var request = {
	            // Protos are typed with string, but we support UInt8Array on Node
	            // tslint:disable-next-line:no-any
	            streamToken: this.lastStreamToken,
	            writes: mutations.map(function (mutation) { return _this.serializer.toMutation(mutation); })
	        };
	        this.sendRequest(request);
	    };
	    return PersistentWriteStream;
	}(PersistentStream));

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Datastore is a wrapper around the external Google Cloud Datastore grpc API,
	 * which provides an interface that is more convenient for the rest of the
	 * client SDK architecture to consume.
	 */
	var Datastore = /** @class */ (function () {
	    function Datastore(queue, connection, credentials, serializer) {
	        this.queue = queue;
	        this.connection = connection;
	        this.credentials = credentials;
	        this.serializer = serializer;
	    }
	    Datastore.prototype.newPersistentWriteStream = function () {
	        return new PersistentWriteStream(this.queue, this.connection, this.credentials, this.serializer);
	    };
	    Datastore.prototype.newPersistentWatchStream = function () {
	        return new PersistentListenStream(this.queue, this.connection, this.credentials, this.serializer);
	    };
	    Datastore.prototype.commit = function (mutations) {
	        var _this = this;
	        var params = {
	            database: this.serializer.encodedDatabaseId,
	            writes: mutations.map(function (m) { return _this.serializer.toMutation(m); })
	        };
	        return this.invokeRPC('Commit', params).then(function (response) {
	            return _this.serializer.fromWriteResults(response.writeResults);
	        });
	    };
	    Datastore.prototype.lookup = function (keys) {
	        var _this = this;
	        var params = {
	            database: this.serializer.encodedDatabaseId,
	            documents: keys.map(function (k) { return _this.serializer.toName(k); })
	        };
	        return this.invokeStreamingRPC('BatchGetDocuments', params).then(function (response) {
	            var docs = maybeDocumentMap();
	            response.forEach(function (proto) {
	                var doc = _this.serializer.fromMaybeDocument(proto);
	                docs = docs.insert(doc.key, doc);
	            });
	            var result = [];
	            keys.forEach(function (key) {
	                var doc = docs.get(key);
	                assert$1(!!doc, 'Missing entity in write response for ' + key);
	                result.push(doc);
	            });
	            return result;
	        });
	    };
	    /** Gets an auth token and invokes the provided RPC. */
	    Datastore.prototype.invokeRPC = function (rpcName, request) {
	        var _this = this;
	        return this.credentials
	            .getToken()
	            .then(function (token) {
	            return _this.connection.invokeRPC(rpcName, request, token);
	        })
	            .catch(function (error) {
	            if (error.code === Code.UNAUTHENTICATED) {
	                _this.credentials.invalidateToken();
	            }
	            throw error;
	        });
	    };
	    /** Gets an auth token and invokes the provided RPC with streamed results. */
	    Datastore.prototype.invokeStreamingRPC = function (rpcName, request) {
	        var _this = this;
	        return this.credentials
	            .getToken()
	            .then(function (token) {
	            return _this.connection.invokeStreamingRPC(rpcName, request, token);
	        })
	            .catch(function (error) {
	            if (error.code === Code.UNAUTHENTICATED) {
	                _this.credentials.invalidateToken();
	            }
	            throw error;
	        });
	    };
	    return Datastore;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Internal transaction object responsible for accumulating the mutations to
	 * perform and the base versions for any documents read.
	 */
	var Transaction = /** @class */ (function () {
	    function Transaction(datastore) {
	        this.datastore = datastore;
	        // The version of each document that was read during this transaction.
	        this.readVersions = documentVersionMap();
	        this.mutations = [];
	        this.committed = false;
	    }
	    Transaction.prototype.recordVersion = function (doc) {
	        var docVersion = doc.version;
	        if (doc instanceof NoDocument) {
	            // For deleted docs, we must use baseVersion 0 when we overwrite them.
	            docVersion = SnapshotVersion.forDeletedDoc();
	        }
	        var existingVersion = this.readVersions.get(doc.key);
	        if (existingVersion !== null) {
	            if (!docVersion.isEqual(existingVersion)) {
	                // This transaction will fail no matter what.
	                throw new FirestoreError(Code.ABORTED, 'Document version changed between two reads.');
	            }
	        }
	        else {
	            this.readVersions = this.readVersions.insert(doc.key, docVersion);
	        }
	    };
	    Transaction.prototype.lookup = function (keys) {
	        var _this = this;
	        if (this.committed) {
	            return Promise.reject('Transaction has already completed.');
	        }
	        if (this.mutations.length > 0) {
	            return Promise.reject('Transactions lookups are invalid after writes.');
	        }
	        return this.datastore.lookup(keys).then(function (docs) {
	            docs.forEach(function (doc) { return _this.recordVersion(doc); });
	            return docs;
	        });
	    };
	    Transaction.prototype.write = function (mutations) {
	        if (this.committed) {
	            throw new FirestoreError(Code.FAILED_PRECONDITION, 'Transaction has already completed.');
	        }
	        this.mutations = this.mutations.concat(mutations);
	    };
	    /**
	     * Returns the version of this document when it was read in this transaction,
	     * as a precondition, or no precondition if it was not read.
	     */
	    Transaction.prototype.precondition = function (key) {
	        var version = this.readVersions.get(key);
	        if (version) {
	            return Precondition.updateTime(version);
	        }
	        else {
	            return Precondition.NONE;
	        }
	    };
	    /**
	     * Returns the precondition for a document if the operation is an update.
	     */
	    Transaction.prototype.preconditionForUpdate = function (key) {
	        var version = this.readVersions.get(key);
	        if (version && version.isEqual(SnapshotVersion.forDeletedDoc())) {
	            // The document doesn't exist, so fail the transaction.
	            throw new FirestoreError(Code.FAILED_PRECONDITION, "Can't update a document that doesn't exist.");
	        }
	        else if (version) {
	            // Document exists, base precondition on document update time.
	            return Precondition.updateTime(version);
	        }
	        else {
	            // Document was not read, so we just use the preconditions for a blind
	            // update.
	            return Precondition.exists(true);
	        }
	    };
	    Transaction.prototype.set = function (key, data) {
	        this.write(data.toMutations(key, this.precondition(key)));
	    };
	    Transaction.prototype.update = function (key, data) {
	        this.write(data.toMutations(key, this.preconditionForUpdate(key)));
	    };
	    Transaction.prototype.delete = function (key) {
	        this.write([new DeleteMutation(key, this.precondition(key))]);
	        // Since the delete will be applied before all following writes, we need to
	        // ensure that the precondition for the next write will be exists: false.
	        this.readVersions = this.readVersions.insert(key, SnapshotVersion.forDeletedDoc());
	    };
	    Transaction.prototype.commit = function () {
	        var _this = this;
	        var unwritten = this.readVersions;
	        // For each mutation, note that the doc was written.
	        this.mutations.forEach(function (mutation) {
	            unwritten = unwritten.remove(mutation.key);
	        });
	        if (!unwritten.isEmpty()) {
	            return Promise.reject(Error('Every document read in a transaction must also be written.'));
	        }
	        return this.datastore.commit(this.mutations).then(function () {
	            _this.committed = true;
	        });
	    };
	    return Transaction;
	}());

	/**
	 * Copyright 2018 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG$8 = 'OnlineStateTracker';
	// To deal with transient failures, we allow multiple stream attempts before
	// giving up and transitioning from OnlineState.Unknown to Offline.
	var MAX_WATCH_STREAM_FAILURES = 2;
	// To deal with stream attempts that don't succeed or fail in a timely manner,
	// we have a timeout for OnlineState to reach Online or Offline.
	// If the timeout is reached, we transition to Offline rather than waiting
	// indefinitely.
	var ONLINE_STATE_TIMEOUT_MS = 10 * 1000;
	/**
	 * A component used by the RemoteStore to track the OnlineState (that is,
	 * whether or not the client as a whole should be considered to be online or
	 * offline), implementing the appropriate heuristics.
	 *
	 * In particular, when the client is trying to connect to the backend, we
	 * allow up to MAX_WATCH_STREAM_FAILURES within ONLINE_STATE_TIMEOUT_MS for
	 * a connection to succeed. If we have too many failures or the timeout elapses,
	 * then we set the OnlineState to Offline, and the client will behave as if
	 * it is offline (get()s will return cached data, etc.).
	 */
	var OnlineStateTracker = /** @class */ (function () {
	    function OnlineStateTracker(asyncQueue, onlineStateHandler) {
	        this.asyncQueue = asyncQueue;
	        this.onlineStateHandler = onlineStateHandler;
	        /** The current OnlineState. */
	        this.state = OnlineState.Unknown;
	        /**
	         * A count of consecutive failures to open the stream. If it reaches the
	         * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
	         * Offline.
	         */
	        this.watchStreamFailures = 0;
	        /**
	         * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
	         * transition from OnlineState.Unknown to OnlineState.Offline without waiting
	         * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
	         */
	        this.onlineStateTimer = null;
	        /**
	         * Whether the client should log a warning message if it fails to connect to
	         * the backend (initially true, cleared after a successful stream, or if we've
	         * logged the message already).
	         */
	        this.shouldWarnClientIsOffline = true;
	    }
	    /**
	     * Called by RemoteStore when a watch stream is started (including on each
	     * backoff attempt).
	     *
	     * If this is the first attempt, it sets the OnlineState to Unknown and starts
	     * the onlineStateTimer.
	     */
	    OnlineStateTracker.prototype.handleWatchStreamStart = function () {
	        var _this = this;
	        if (this.watchStreamFailures === 0) {
	            this.setAndBroadcast(OnlineState.Unknown);
	            assert$1(this.onlineStateTimer === null, "onlineStateTimer shouldn't be started yet");
	            this.onlineStateTimer = this.asyncQueue.enqueueAfterDelay(TimerId.OnlineStateTimeout, ONLINE_STATE_TIMEOUT_MS, function () {
	                _this.onlineStateTimer = null;
	                assert$1(_this.state === OnlineState.Unknown, 'Timer should be canceled if we transitioned to a different state.');
	                _this.logClientOfflineWarningIfNecessary("Backend didn't respond within " + ONLINE_STATE_TIMEOUT_MS / 1000 + " " +
	                    "seconds.");
	                _this.setAndBroadcast(OnlineState.Offline);
	                // NOTE: handleWatchStreamFailure() will continue to increment
	                // watchStreamFailures even though we are already marked Offline,
	                // but this is non-harmful.
	                return Promise.resolve();
	            });
	        }
	    };
	    /**
	     * Updates our OnlineState as appropriate after the watch stream reports a
	     * failure. The first failure moves us to the 'Unknown' state. We then may
	     * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
	     * actually transition to the 'Offline' state.
	     */
	    OnlineStateTracker.prototype.handleWatchStreamFailure = function (error$$1) {
	        if (this.state === OnlineState.Online) {
	            this.setAndBroadcast(OnlineState.Unknown);
	            // To get to OnlineState.Online, set() must have been called which would
	            // have reset our heuristics.
	            assert$1(this.watchStreamFailures === 0, 'watchStreamFailures must be 0');
	            assert$1(this.onlineStateTimer === null, 'onlineStateTimer must be null');
	        }
	        else {
	            this.watchStreamFailures++;
	            if (this.watchStreamFailures >= MAX_WATCH_STREAM_FAILURES) {
	                this.clearOnlineStateTimer();
	                this.logClientOfflineWarningIfNecessary("Connection failed " + MAX_WATCH_STREAM_FAILURES + " " +
	                    ("times. Most recent error: " + error$$1.toString()));
	                this.setAndBroadcast(OnlineState.Offline);
	            }
	        }
	    };
	    /**
	     * Explicitly sets the OnlineState to the specified state.
	     *
	     * Note that this resets our timers / failure counters, etc. used by our
	     * Offline heuristics, so must not be used in place of
	     * handleWatchStreamStart() and handleWatchStreamFailure().
	     */
	    OnlineStateTracker.prototype.set = function (newState) {
	        this.clearOnlineStateTimer();
	        this.watchStreamFailures = 0;
	        if (newState === OnlineState.Online) {
	            // We've connected to watch at least once. Don't warn the developer
	            // about being offline going forward.
	            this.shouldWarnClientIsOffline = false;
	        }
	        this.setAndBroadcast(newState);
	    };
	    OnlineStateTracker.prototype.setAndBroadcast = function (newState) {
	        if (newState !== this.state) {
	            this.state = newState;
	            this.onlineStateHandler(newState);
	        }
	    };
	    OnlineStateTracker.prototype.logClientOfflineWarningIfNecessary = function (details) {
	        var message = "Could not reach Cloud Firestore backend. " + details + "\n" +
	            "This typically indicates that your device does not have a healthy " +
	            "Internet connection at the moment. The client will operate in offline " +
	            "mode until it is able to successfully connect to the backend.";
	        if (this.shouldWarnClientIsOffline) {
	            error$1(message);
	            this.shouldWarnClientIsOffline = false;
	        }
	        else {
	            debug(LOG_TAG$8, message);
	        }
	    };
	    OnlineStateTracker.prototype.clearOnlineStateTimer = function () {
	        if (this.onlineStateTimer !== null) {
	            this.onlineStateTimer.cancel();
	            this.onlineStateTimer = null;
	        }
	    };
	    return OnlineStateTracker;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG$9 = 'RemoteStore';
	// TODO(b/35853402): Negotiate this with the stream.
	var MAX_PENDING_WRITES = 10;
	/**
	 * RemoteStore - An interface to remotely stored data, basically providing a
	 * wrapper around the Datastore that is more reliable for the rest of the
	 * system.
	 *
	 * RemoteStore is responsible for maintaining the connection to the server.
	 * - maintaining a list of active listens.
	 * - reconnecting when the connection is dropped.
	 * - resuming all the active listens on reconnect.
	 *
	 * RemoteStore handles all incoming events from the Datastore.
	 * - listening to the watch stream and repackaging the events as RemoteEvents
	 * - notifying SyncEngine of any changes to the active listens.
	 *
	 * RemoteStore takes writes from other components and handles them reliably.
	 * - pulling pending mutations from LocalStore and sending them to Datastore.
	 * - retrying mutations that failed because of network problems.
	 * - acking mutations to the SyncEngine once they are accepted or rejected.
	 */
	var RemoteStore = /** @class */ (function () {
	    function RemoteStore(
	    /**
	     * The local store, used to fill the write pipeline with outbound mutations.
	     */
	    localStore, 
	    /** The client-side proxy for interacting with the backend. */
	    datastore, asyncQueue, onlineStateHandler) {
	        this.localStore = localStore;
	        this.datastore = datastore;
	        /**
	         * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
	         * LocalStore via fillWritePipeline() and have or will send to the write
	         * stream.
	         *
	         * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
	         * restart the write stream. When the stream is established the writes in the
	         * pipeline will be sent in order.
	         *
	         * Writes remain in writePipeline until they are acknowledged by the backend
	         * and thus will automatically be re-sent if the stream is interrupted /
	         * restarted before they're acknowledged.
	         *
	         * Write responses from the backend are linked to their originating request
	         * purely based on order, and so we can just shift() writes from the front of
	         * the writePipeline as we receive responses.
	         */
	        this.writePipeline = [];
	        /**
	         * A mapping of watched targets that the client cares about tracking and the
	         * user has explicitly called a 'listen' for this target.
	         *
	         * These targets may or may not have been sent to or acknowledged by the
	         * server. On re-establishing the listen stream, these targets should be sent
	         * to the server. The targets removed with unlistens are removed eagerly
	         * without waiting for confirmation from the listen stream.
	         */
	        this.listenTargets = {};
	        this.watchStream = null;
	        this.writeStream = null;
	        this.watchChangeAggregator = null;
	        this.onlineStateTracker = new OnlineStateTracker(asyncQueue, onlineStateHandler);
	    }
	    /**
	     * Starts up the remote store, creating streams, restoring state from
	     * LocalStore, etc.
	     */
	    RemoteStore.prototype.start = function () {
	        return this.enableNetwork();
	    };
	    RemoteStore.prototype.isNetworkEnabled = function () {
	        assert$1((this.watchStream == null) === (this.writeStream == null), 'WatchStream and WriteStream should both be null or non-null');
	        return this.watchStream != null;
	    };
	    /** Re-enables the network. Idempotent. */
	    RemoteStore.prototype.enableNetwork = function () {
	        var _this = this;
	        if (this.isNetworkEnabled()) {
	            return Promise.resolve();
	        }
	        // Create new streams (but note they're not started yet).
	        this.watchStream = this.datastore.newPersistentWatchStream();
	        this.writeStream = this.datastore.newPersistentWriteStream();
	        // Load any saved stream token from persistent storage
	        return this.localStore.getLastStreamToken().then(function (token) {
	            _this.writeStream.lastStreamToken = token;
	            if (_this.shouldStartWatchStream()) {
	                _this.startWatchStream();
	            }
	            else {
	                _this.onlineStateTracker.set(OnlineState.Unknown);
	            }
	            return _this.fillWritePipeline(); // This may start the writeStream.
	        });
	    };
	    /**
	     * Temporarily disables the network. The network can be re-enabled using
	     * enableNetwork().
	     */
	    RemoteStore.prototype.disableNetwork = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                this.disableNetworkInternal();
	                // Set the OnlineState to Offline so get()s return from cache, etc.
	                this.onlineStateTracker.set(OnlineState.Offline);
	                return [2 /*return*/];
	            });
	        });
	    };
	    /**
	     * Disables the network, if it is currently enabled.
	     */
	    RemoteStore.prototype.disableNetworkInternal = function () {
	        if (this.isNetworkEnabled()) {
	            // NOTE: We're guaranteed not to get any further events from these streams (not even a close
	            // event).
	            this.watchStream.stop();
	            this.writeStream.stop();
	            this.cleanUpWatchStreamState();
	            debug(LOG_TAG$9, 'Stopping write stream with ' +
	                this.writePipeline.length +
	                ' pending writes');
	            // TODO(mikelehen): We only actually need to clear the write pipeline if
	            // this is being called as part of handleUserChange(). Consider reworking.
	            this.writePipeline = [];
	            this.writeStream = null;
	            this.watchStream = null;
	        }
	    };
	    RemoteStore.prototype.shutdown = function () {
	        debug(LOG_TAG$9, 'RemoteStore shutting down.');
	        this.disableNetworkInternal();
	        // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
	        // triggering spurious listener events with cached data, etc.
	        this.onlineStateTracker.set(OnlineState.Unknown);
	        return Promise.resolve();
	    };
	    /** Starts new listen for the given query. Uses resume token if provided */
	    RemoteStore.prototype.listen = function (queryData) {
	        assert$1(!contains$2(this.listenTargets, queryData.targetId), 'listen called with duplicate targetId!');
	        // Mark this as something the client is currently listening for.
	        this.listenTargets[queryData.targetId] = queryData;
	        if (this.shouldStartWatchStream()) {
	            // The listen will be sent in onWatchStreamOpen
	            this.startWatchStream();
	        }
	        else if (this.isNetworkEnabled() && this.watchStream.isOpen()) {
	            this.sendWatchRequest(queryData);
	        }
	    };
	    /** Removes the listen from server */
	    RemoteStore.prototype.unlisten = function (targetId) {
	        assert$1(contains$2(this.listenTargets, targetId), 'unlisten called without assigned target ID!');
	        delete this.listenTargets[targetId];
	        if (this.isNetworkEnabled() && this.watchStream.isOpen()) {
	            this.sendUnwatchRequest(targetId);
	            if (isEmpty$1(this.listenTargets)) {
	                this.watchStream.markIdle();
	            }
	        }
	    };
	    /** {@link TargetMetadataProvider.getQueryDataForTarget} */
	    RemoteStore.prototype.getQueryDataForTarget = function (targetId) {
	        return this.listenTargets[targetId] || null;
	    };
	    /** {@link TargetMetadataProvider.getRemoteKeysForTarget} */
	    RemoteStore.prototype.getRemoteKeysForTarget = function (targetId) {
	        return this.syncEngine.getRemoteKeysForTarget(targetId);
	    };
	    /**
	     * We need to increment the the expected number of pending responses we're due
	     * from watch so we wait for the ack to process any messages from this target.
	     */
	    RemoteStore.prototype.sendWatchRequest = function (queryData) {
	        this.watchChangeAggregator.recordPendingTargetRequest(queryData.targetId);
	        this.watchStream.watch(queryData);
	    };
	    /**
	     * We need to increment the expected number of pending responses we're due
	     * from watch so we wait for the removal on the server before we process any
	     * messages from this target.
	     */
	    RemoteStore.prototype.sendUnwatchRequest = function (targetId) {
	        this.watchChangeAggregator.recordPendingTargetRequest(targetId);
	        this.watchStream.unwatch(targetId);
	    };
	    RemoteStore.prototype.startWatchStream = function () {
	        assert$1(this.shouldStartWatchStream(), 'startWriteStream() called when shouldStartWatchStream() is false.');
	        this.watchChangeAggregator = new WatchChangeAggregator(this);
	        this.watchStream.start({
	            onOpen: this.onWatchStreamOpen.bind(this),
	            onClose: this.onWatchStreamClose.bind(this),
	            onWatchChange: this.onWatchStreamChange.bind(this)
	        });
	        this.onlineStateTracker.handleWatchStreamStart();
	    };
	    /**
	     * Returns whether the watch stream should be started because it's necessary
	     * and has not yet been started.
	     */
	    RemoteStore.prototype.shouldStartWatchStream = function () {
	        return (this.isNetworkEnabled() &&
	            !this.watchStream.isStarted() &&
	            !isEmpty$1(this.listenTargets));
	    };
	    RemoteStore.prototype.cleanUpWatchStreamState = function () {
	        this.watchChangeAggregator = null;
	    };
	    RemoteStore.prototype.onWatchStreamOpen = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var _this = this;
	            return __generator(this, function (_a) {
	                // TODO(b/35852690): close the stream again (with some timeout?) if no watch
	                // targets are active
	                forEachNumber(this.listenTargets, function (targetId, queryData) {
	                    _this.sendWatchRequest(queryData);
	                });
	                return [2 /*return*/];
	            });
	        });
	    };
	    RemoteStore.prototype.onWatchStreamClose = function (error$$1) {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                assert$1(this.isNetworkEnabled(), 'onWatchStreamClose() should only be called when the network is enabled');
	                this.cleanUpWatchStreamState();
	                // If we still need the watch stream, retry the connection.
	                if (this.shouldStartWatchStream()) {
	                    // There should generally be an error if the watch stream was closed when
	                    // it's still needed, but it's not quite worth asserting.
	                    if (error$$1) {
	                        this.onlineStateTracker.handleWatchStreamFailure(error$$1);
	                    }
	                    this.startWatchStream();
	                }
	                else {
	                    // No need to restart watch stream because there are no active targets.
	                    // The online state is set to unknown because there is no active attempt
	                    // at establishing a connection
	                    this.onlineStateTracker.set(OnlineState.Unknown);
	                }
	                return [2 /*return*/];
	            });
	        });
	    };
	    RemoteStore.prototype.onWatchStreamChange = function (watchChange, snapshotVersion) {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        // Mark the client as online since we got a message from the server
	                        this.onlineStateTracker.set(OnlineState.Online);
	                        if (watchChange instanceof WatchTargetChange &&
	                            watchChange.state === WatchTargetChangeState.Removed &&
	                            watchChange.cause) {
	                            // There was an error on a target, don't wait for a consistent snapshot
	                            // to raise events
	                            return [2 /*return*/, this.handleTargetError(watchChange)];
	                        }
	                        if (watchChange instanceof DocumentWatchChange) {
	                            this.watchChangeAggregator.handleDocumentChange(watchChange);
	                        }
	                        else if (watchChange instanceof ExistenceFilterChange) {
	                            this.watchChangeAggregator.handleExistenceFilter(watchChange);
	                        }
	                        else {
	                            assert$1(watchChange instanceof WatchTargetChange, 'Expected watchChange to be an instance of WatchTargetChange');
	                            this.watchChangeAggregator.handleTargetChange(watchChange);
	                        }
	                        if (!(!snapshotVersion.isEqual(SnapshotVersion.MIN) &&
	                            snapshotVersion.compareTo(this.localStore.getLastRemoteSnapshotVersion()) >= 0)) { return [3 /*break*/, 2]; }
	                        // We have received a target change with a global snapshot if the snapshot
	                        // version is not equal to SnapshotVersion.MIN.
	                        return [4 /*yield*/, this.raiseWatchSnapshot(snapshotVersion)];
	                    case 1:
	                        // We have received a target change with a global snapshot if the snapshot
	                        // version is not equal to SnapshotVersion.MIN.
	                        _a.sent();
	                        _a.label = 2;
	                    case 2: return [2 /*return*/];
	                }
	            });
	        });
	    };
	    /**
	     * Takes a batch of changes from the Datastore, repackages them as a
	     * RemoteEvent, and passes that on to the listener, which is typically the
	     * SyncEngine.
	     */
	    RemoteStore.prototype.raiseWatchSnapshot = function (snapshotVersion) {
	        var _this = this;
	        assert$1(!snapshotVersion.isEqual(SnapshotVersion.MIN), "Can't raise event for unknown SnapshotVersion");
	        var remoteEvent = this.watchChangeAggregator.createRemoteEvent(snapshotVersion);
	        // Update in-memory resume tokens. LocalStore will update the
	        // persistent view of these when applying the completed RemoteEvent.
	        forEachNumber(remoteEvent.targetChanges, function (targetId, change) {
	            if (change.resumeToken.length > 0) {
	                var queryData = _this.listenTargets[targetId];
	                // A watched target might have been removed already.
	                if (queryData) {
	                    _this.listenTargets[targetId] = queryData.update({
	                        resumeToken: change.resumeToken,
	                        snapshotVersion: snapshotVersion
	                    });
	                }
	            }
	        });
	        // Re-establish listens for the targets that have been invalidated by
	        // existence filter mismatches.
	        remoteEvent.targetMismatches.forEach(function (targetId) {
	            var queryData = _this.listenTargets[targetId];
	            if (!queryData) {
	                // A watched target might have been removed already.
	                return;
	            }
	            // Clear the resume token for the query, since we're in a known mismatch
	            // state.
	            queryData.resumeToken = emptyByteString();
	            // Cause a hard reset by unwatching and rewatching immediately, but
	            // deliberately don't send a resume token so that we get a full update.
	            _this.sendUnwatchRequest(targetId);
	            // Mark the query we send as being on behalf of an existence filter
	            // mismatch, but don't actually retain that in listenTargets. This ensures
	            // that we flag the first re-listen this way without impacting future
	            // listens of this target (that might happen e.g. on reconnect).
	            var requestQueryData = new QueryData(queryData.query, targetId, QueryPurpose.ExistenceFilterMismatch);
	            _this.sendWatchRequest(requestQueryData);
	        });
	        // Finally raise remote event
	        return this.syncEngine.applyRemoteEvent(remoteEvent);
	    };
	    /** Handles an error on a target */
	    RemoteStore.prototype.handleTargetError = function (watchChange) {
	        var _this = this;
	        assert$1(!!watchChange.cause, 'Handling target error without a cause');
	        var error$$1 = watchChange.cause;
	        var promiseChain = Promise.resolve();
	        watchChange.targetIds.forEach(function (targetId) {
	            promiseChain = promiseChain.then(function () { return __awaiter(_this, void 0, void 0, function () {
	                return __generator(this, function (_a) {
	                    // A watched target might have been removed already.
	                    if (contains$2(this.listenTargets, targetId)) {
	                        delete this.listenTargets[targetId];
	                        this.watchChangeAggregator.removeTarget(targetId);
	                        return [2 /*return*/, this.syncEngine.rejectListen(targetId, error$$1)];
	                    }
	                    return [2 /*return*/];
	                });
	            }); });
	        });
	        return promiseChain;
	    };
	    /**
	     * Attempts to fill our write pipeline with writes from the LocalStore.
	     *
	     * Called internally to bootstrap or refill the write pipeline and by
	     * SyncEngine whenever there are new mutations to process.
	     *
	     * Starts the write stream if necessary.
	     */
	    RemoteStore.prototype.fillWritePipeline = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var _this = this;
	            var lastBatchIdRetrieved;
	            return __generator(this, function (_a) {
	                if (this.canAddToWritePipeline()) {
	                    lastBatchIdRetrieved = this.writePipeline.length > 0
	                        ? this.writePipeline[this.writePipeline.length - 1].batchId
	                        : BATCHID_UNKNOWN;
	                    return [2 /*return*/, this.localStore
	                            .nextMutationBatch(lastBatchIdRetrieved)
	                            .then(function (batch) {
	                            if (batch === null) {
	                                if (_this.writePipeline.length === 0) {
	                                    _this.writeStream.markIdle();
	                                }
	                            }
	                            else {
	                                _this.addToWritePipeline(batch);
	                                return _this.fillWritePipeline();
	                            }
	                        })];
	                }
	                return [2 /*return*/];
	            });
	        });
	    };
	    /**
	     * Returns true if we can add to the write pipeline (i.e. it is not full and
	     * the network is enabled).
	     */
	    RemoteStore.prototype.canAddToWritePipeline = function () {
	        return (this.isNetworkEnabled() && this.writePipeline.length < MAX_PENDING_WRITES);
	    };
	    // For testing
	    RemoteStore.prototype.outstandingWrites = function () {
	        return this.writePipeline.length;
	    };
	    /**
	     * Queues additional writes to be sent to the write stream, sending them
	     * immediately if the write stream is established, else starting the write
	     * stream if it is not yet started.
	     */
	    RemoteStore.prototype.addToWritePipeline = function (batch) {
	        assert$1(this.canAddToWritePipeline(), 'addToWritePipeline called when pipeline is full');
	        this.writePipeline.push(batch);
	        if (this.shouldStartWriteStream()) {
	            this.startWriteStream();
	        }
	        else if (this.isNetworkEnabled() && this.writeStream.handshakeComplete) {
	            this.writeStream.writeMutations(batch.mutations);
	        }
	    };
	    RemoteStore.prototype.shouldStartWriteStream = function () {
	        return (this.isNetworkEnabled() &&
	            !this.writeStream.isStarted() &&
	            this.writePipeline.length > 0);
	    };
	    RemoteStore.prototype.startWriteStream = function () {
	        assert$1(this.shouldStartWriteStream(), 'startWriteStream() called when shouldStartWriteStream() is false.');
	        this.writeStream.start({
	            onOpen: this.onWriteStreamOpen.bind(this),
	            onClose: this.onWriteStreamClose.bind(this),
	            onHandshakeComplete: this.onWriteHandshakeComplete.bind(this),
	            onMutationResult: this.onMutationResult.bind(this)
	        });
	    };
	    RemoteStore.prototype.onWriteStreamOpen = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                this.writeStream.writeHandshake();
	                return [2 /*return*/];
	            });
	        });
	    };
	    RemoteStore.prototype.onWriteHandshakeComplete = function () {
	        var _this = this;
	        // Record the stream token.
	        return this.localStore
	            .setLastStreamToken(this.writeStream.lastStreamToken)
	            .then(function () {
	            // Send the write pipeline now that the stream is established.
	            for (var _i = 0, _a = _this.writePipeline; _i < _a.length; _i++) {
	                var batch = _a[_i];
	                _this.writeStream.writeMutations(batch.mutations);
	            }
	        });
	    };
	    RemoteStore.prototype.onMutationResult = function (commitVersion, results) {
	        var _this = this;
	        // This is a response to a write containing mutations and should be
	        // correlated to the first write in our write pipeline.
	        assert$1(this.writePipeline.length > 0, 'Got result for empty write pipeline');
	        var batch = this.writePipeline.shift();
	        var success = MutationBatchResult.from(batch, commitVersion, results, this.writeStream.lastStreamToken);
	        return this.syncEngine.applySuccessfulWrite(success).then(function () {
	            // It's possible that with the completion of this mutation another
	            // slot has freed up.
	            return _this.fillWritePipeline();
	        });
	    };
	    RemoteStore.prototype.onWriteStreamClose = function (error$$1) {
	        return __awaiter(this, void 0, void 0, function () {
	            var _this = this;
	            var errorHandling;
	            return __generator(this, function (_a) {
	                assert$1(this.isNetworkEnabled(), 'onWriteStreamClose() should only be called when the network is enabled');
	                // If the write stream closed due to an error, invoke the error callbacks if
	                // there are pending writes.
	                if (error$$1 && this.writePipeline.length > 0) {
	                    errorHandling = void 0;
	                    if (this.writeStream.handshakeComplete) {
	                        // This error affects the actual write.
	                        errorHandling = this.handleWriteError(error$$1);
	                    }
	                    else {
	                        // If there was an error before the handshake has finished, it's
	                        // possible that the server is unable to process the stream token
	                        // we're sending. (Perhaps it's too old?)
	                        errorHandling = this.handleHandshakeError(error$$1);
	                    }
	                    return [2 /*return*/, errorHandling.then(function () {
	                            // The write stream might have been started by refilling the write
	                            // pipeline for failed writes
	                            if (_this.shouldStartWriteStream()) {
	                                _this.startWriteStream();
	                            }
	                        })];
	                }
	                return [2 /*return*/];
	            });
	        });
	    };
	    RemoteStore.prototype.handleHandshakeError = function (error$$1) {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                // Reset the token if it's a permanent error or the error code is
	                // ABORTED, signaling the write stream is no longer valid.
	                if (isPermanentError(error$$1.code) || error$$1.code === Code.ABORTED) {
	                    debug(LOG_TAG$9, 'RemoteStore error before completed handshake; resetting stream token: ', this.writeStream.lastStreamToken);
	                    this.writeStream.lastStreamToken = emptyByteString();
	                    return [2 /*return*/, this.localStore.setLastStreamToken(emptyByteString())];
	                }
	                return [2 /*return*/];
	            });
	        });
	    };
	    RemoteStore.prototype.handleWriteError = function (error$$1) {
	        return __awaiter(this, void 0, void 0, function () {
	            var _this = this;
	            var batch;
	            return __generator(this, function (_a) {
	                if (isPermanentError(error$$1.code)) {
	                    batch = this.writePipeline.shift();
	                    // In this case it's also unlikely that the server itself is melting
	                    // down -- this was just a bad request so inhibit backoff on the next
	                    // restart.
	                    this.writeStream.inhibitBackoff();
	                    return [2 /*return*/, this.syncEngine
	                            .rejectFailedWrite(batch.batchId, error$$1)
	                            .then(function () {
	                            // It's possible that with the completion of this mutation
	                            // another slot has freed up.
	                            return _this.fillWritePipeline();
	                        })];
	                }
	                return [2 /*return*/];
	            });
	        });
	    };
	    RemoteStore.prototype.createTransaction = function () {
	        return new Transaction(this.datastore);
	    };
	    RemoteStore.prototype.handleUserChange = function (user) {
	        debug(LOG_TAG$9, 'RemoteStore changing users: uid=', user.uid);
	        // If the network has been explicitly disabled, make sure we don't
	        // accidentally re-enable it.
	        if (this.isNetworkEnabled()) {
	            // Tear down and re-create our network streams. This will ensure we get a fresh auth token
	            // for the new user and re-fill the write pipeline with new mutations from the LocalStore
	            // (since mutations are per-user).
	            this.disableNetworkInternal();
	            this.onlineStateTracker.set(OnlineState.Unknown);
	            return this.enableNetwork();
	        }
	    };
	    return RemoteStore;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LOG_TAG$10 = 'FirestoreClient';
	/** The DOMException code for an aborted operation. */
	var DOM_EXCEPTION_ABORTED = 20;
	/** The DOMException code for quota exceeded. */
	var DOM_EXCEPTION_QUOTA_EXCEEDED = 22;
	/**
	 * FirestoreClient is a top-level class that constructs and owns all of the
	 * pieces of the client SDK architecture. It is responsible for creating the
	 * async queue that is shared by all of the other components in the system.
	 */
	var FirestoreClient = /** @class */ (function () {
	    function FirestoreClient(platform, databaseInfo, credentials, 
	    /**
	     * Asynchronous queue responsible for all of our internal processing. When
	     * we get incoming work from the user (via public API) or the network
	     * (incoming GRPC messages), we should always schedule onto this queue.
	     * This ensures all of our work is properly serialized (e.g. we don't
	     * start processing a new operation while the previous one is waiting for
	     * an async I/O to complete).
	     */
	    asyncQueue) {
	        this.platform = platform;
	        this.databaseInfo = databaseInfo;
	        this.credentials = credentials;
	        this.asyncQueue = asyncQueue;
	    }
	    /**
	     * Starts up the FirestoreClient, returning only whether or not enabling
	     * persistence succeeded.
	     *
	     * The intent here is to "do the right thing" as far as users are concerned.
	     * Namely, in cases where offline persistence is requested and possible,
	     * enable it, but otherwise fall back to persistence disabled. For the most
	     * part we expect this to succeed one way or the other so we don't expect our
	     * users to actually wait on the firestore.enablePersistence Promise since
	     * they generally won't care.
	     *
	     * Of course some users actually do care about whether or not persistence
	     * was successfully enabled, so the Promise returned from this method
	     * indicates this outcome.
	     *
	     * This presents a problem though: even before enablePersistence resolves or
	     * rejects, users may have made calls to e.g. firestore.collection() which
	     * means that the FirestoreClient in there will be available and will be
	     * enqueuing actions on the async queue.
	     *
	     * Meanwhile any failure of an operation on the async queue causes it to
	     * panic and reject any further work, on the premise that unhandled errors
	     * are fatal.
	     *
	     * Consequently the fallback is handled internally here in start, and if the
	     * fallback succeeds we signal success to the async queue even though the
	     * start() itself signals failure.
	     *
	     * @param usePersistence Whether or not to attempt to enable persistence.
	     * @returns A deferred result indicating the user-visible result of enabling
	     *     offline persistence. This method will reject this if IndexedDB fails to
	     *     start for any reason. If usePersistence is false this is
	     *     unconditionally resolved.
	     */
	    FirestoreClient.prototype.start = function (usePersistence) {
	        var _this = this;
	        // We defer our initialization until we get the current user from
	        // setUserChangeListener(). We block the async queue until we got the
	        // initial user and the initialization is completed. This will prevent
	        // any scheduled work from happening before initialization is completed.
	        //
	        // If initializationDone resolved then the FirestoreClient is in a usable
	        // state.
	        var initializationDone = new Deferred$1();
	        // If usePersistence is true, certain classes of errors while starting are
	        // recoverable but only by falling back to persistence disabled.
	        //
	        // If there's an error in the first case but not in recovery we cannot
	        // reject the promise blocking the async queue because this will cause the
	        // async queue to panic.
	        var persistenceResult = new Deferred$1();
	        var initialized = false;
	        this.credentials.setUserChangeListener(function (user) {
	            if (!initialized) {
	                initialized = true;
	                _this.initializePersistence(usePersistence, persistenceResult)
	                    .then(function () { return _this.initializeRest(user); })
	                    .then(initializationDone.resolve, initializationDone.reject);
	            }
	            else {
	                _this.asyncQueue.enqueue(function () {
	                    return _this.handleUserChange(user);
	                });
	            }
	        });
	        // Block the async queue until initialization is done
	        this.asyncQueue.enqueue(function () {
	            return initializationDone.promise;
	        });
	        // Return only the result of enabling persistence. Note that this does not
	        // need to await the completion of initializationDone because the result of
	        // this method should not reflect any other kind of failure to start.
	        return persistenceResult.promise;
	    };
	    /** Enables the network connection and requeues all pending operations. */
	    FirestoreClient.prototype.enableNetwork = function () {
	        var _this = this;
	        return this.asyncQueue.enqueue(function () {
	            return _this.remoteStore.enableNetwork();
	        });
	    };
	    /**
	     * Initializes persistent storage, attempting to use IndexedDB if
	     * usePersistence is true or memory-only if false.
	     *
	     * If IndexedDB fails because it's already open in another tab or because the
	     * platform can't possibly support our implementation then this method rejects
	     * the persistenceResult and falls back on memory-only persistence.
	     *
	     * @param usePersistence indicates whether or not to use offline persistence
	     * @param persistenceResult A deferred result indicating the user-visible
	     *     result of enabling offline persistence. This method will reject this if
	     *     IndexedDB fails to start for any reason. If usePersistence is false
	     *     this is unconditionally resolved.
	     * @returns a Promise indicating whether or not initialization should
	     *     continue, i.e. that one of the persistence implementations actually
	     *     succeeded.
	     */
	    FirestoreClient.prototype.initializePersistence = function (usePersistence, persistenceResult) {
	        var _this = this;
	        if (usePersistence) {
	            return this.startIndexedDbPersistence()
	                .then(persistenceResult.resolve)
	                .catch(function (error$$1) {
	                // Regardless of whether or not the retry succeeds, from an user
	                // perspective, offline persistence has failed.
	                persistenceResult.reject(error$$1);
	                // An unknown failure on the first stage shuts everything down.
	                if (!_this.canFallback(error$$1)) {
	                    return Promise.reject(error$$1);
	                }
	                console.warn('Error enabling offline storage. Falling back to' +
	                    ' storage disabled: ' +
	                    error$$1);
	                return _this.startMemoryPersistence();
	            });
	        }
	        else {
	            // When usePersistence == false, enabling offline persistence is defined
	            // to unconditionally succeed. This allows start() to have the same
	            // signature for both cases, despite the fact that the returned promise
	            // is only used in the enablePersistence call.
	            persistenceResult.resolve();
	            return this.startMemoryPersistence();
	        }
	    };
	    /**
	     * Decides whether the provided error allows us to gracefully disable
	     * persistence (as opposed to crashing the client).
	     */
	    FirestoreClient.prototype.canFallback = function (error$$1) {
	        if (error$$1 instanceof FirestoreError) {
	            return (error$$1.code === Code.FAILED_PRECONDITION ||
	                error$$1.code === Code.UNIMPLEMENTED);
	        }
	        else if (typeof DOMException !== 'undefined' &&
	            error$$1 instanceof DOMException) {
	            // We fall back to memory persistence if we cannot acquire an owner lease.
	            // This can happen can during a schema migration, or during the initial
	            // write of the `owner` lease.
	            // For both the `QuotaExceededError` and the  `AbortError`, it is safe to
	            // fall back to memory persistence since all modifications to IndexedDb
	            // failed to commit.
	            return (error$$1.code === DOM_EXCEPTION_QUOTA_EXCEEDED ||
	                error$$1.code === DOM_EXCEPTION_ABORTED);
	        }
	        return true;
	    };
	    /**
	     * Starts IndexedDB-based persistence.
	     *
	     * @returns A promise indicating success or failure.
	     */
	    FirestoreClient.prototype.startIndexedDbPersistence = function () {
	        // TODO(http://b/33384523): For now we just disable garbage collection
	        // when persistence is enabled.
	        this.garbageCollector = new NoOpGarbageCollector();
	        var storagePrefix = IndexedDbPersistence.buildStoragePrefix(this.databaseInfo);
	        // Opt to use proto3 JSON in case the platform doesn't support Uint8Array.
	        var serializer = new JsonProtoSerializer(this.databaseInfo.databaseId, {
	            useProto3Json: true
	        });
	        this.persistence = new IndexedDbPersistence(storagePrefix, serializer);
	        return this.persistence.start();
	    };
	    /**
	     * Starts Memory-backed persistence. In practice this cannot fail.
	     *
	     * @returns A promise that will successfully resolve.
	     */
	    FirestoreClient.prototype.startMemoryPersistence = function () {
	        this.garbageCollector = new EagerGarbageCollector();
	        this.persistence = new MemoryPersistence();
	        return this.persistence.start();
	    };
	    /**
	     * Initializes the rest of the FirestoreClient, assuming the initial user
	     * has been obtained from the credential provider and some persistence
	     * implementation is available in this.persistence.
	     */
	    FirestoreClient.prototype.initializeRest = function (user) {
	        var _this = this;
	        return this.platform
	            .loadConnection(this.databaseInfo)
	            .then(function (connection) {
	            _this.localStore = new LocalStore(_this.persistence, user, _this.garbageCollector);
	            var serializer = _this.platform.newSerializer(_this.databaseInfo.databaseId);
	            var datastore = new Datastore(_this.asyncQueue, connection, _this.credentials, serializer);
	            var onlineStateChangedHandler = function (onlineState) {
	                _this.syncEngine.applyOnlineStateChange(onlineState);
	                _this.eventMgr.applyOnlineStateChange(onlineState);
	            };
	            _this.remoteStore = new RemoteStore(_this.localStore, datastore, _this.asyncQueue, onlineStateChangedHandler);
	            _this.syncEngine = new SyncEngine(_this.localStore, _this.remoteStore, user);
	            // Setup wiring between sync engine and remote store
	            _this.remoteStore.syncEngine = _this.syncEngine;
	            _this.eventMgr = new EventManager(_this.syncEngine);
	            // NOTE: RemoteStore depends on LocalStore (for persisting stream
	            // tokens, refilling mutation queue, etc.) so must be started after
	            // LocalStore.
	            return _this.localStore.start();
	        })
	            .then(function () {
	            return _this.remoteStore.start();
	        });
	    };
	    FirestoreClient.prototype.handleUserChange = function (user) {
	        this.asyncQueue.verifyOperationInProgress();
	        debug(LOG_TAG$10, 'User Changed: ' + user.uid);
	        return this.syncEngine.handleUserChange(user);
	    };
	    /** Disables the network connection. Pending operations will not complete. */
	    FirestoreClient.prototype.disableNetwork = function () {
	        var _this = this;
	        return this.asyncQueue.enqueue(function () {
	            return _this.remoteStore.disableNetwork();
	        });
	    };
	    FirestoreClient.prototype.shutdown = function (options) {
	        var _this = this;
	        return this.asyncQueue
	            .enqueue(function () {
	            _this.credentials.removeUserChangeListener();
	            return _this.remoteStore.shutdown();
	        })
	            .then(function () {
	            // PORTING NOTE: LocalStore does not need an explicit shutdown on web.
	            return _this.persistence.shutdown(options && options.purgePersistenceWithDataLoss);
	        });
	    };
	    FirestoreClient.prototype.listen = function (query, observer, options) {
	        var _this = this;
	        var listener = new QueryListener(query, observer, options);
	        this.asyncQueue.enqueue(function () {
	            return _this.eventMgr.listen(listener);
	        });
	        return listener;
	    };
	    FirestoreClient.prototype.unlisten = function (listener) {
	        var _this = this;
	        this.asyncQueue.enqueue(function () {
	            return _this.eventMgr.unlisten(listener);
	        });
	    };
	    FirestoreClient.prototype.getDocumentFromLocalCache = function (docKey) {
	        var _this = this;
	        return this.asyncQueue
	            .enqueue(function () {
	            return _this.localStore.readDocument(docKey);
	        })
	            .then(function (maybeDoc) {
	            if (maybeDoc instanceof Document) {
	                return maybeDoc;
	            }
	            else {
	                throw new FirestoreError(Code.UNAVAILABLE, 'Failed to get document from cache. (However, this document may ' +
	                    "exist on the server. Run again without setting 'source' in " +
	                    'the GetOptions to attempt to retrieve the document from the ' +
	                    'server.)');
	            }
	        });
	    };
	    FirestoreClient.prototype.getDocumentsFromLocalCache = function (query) {
	        var _this = this;
	        return this.asyncQueue
	            .enqueue(function () {
	            return _this.localStore.executeQuery(query);
	        })
	            .then(function (docs) {
	            var remoteKeys = documentKeySet();
	            var view = new View(query, remoteKeys);
	            var viewDocChanges = view.computeDocChanges(docs);
	            return view.applyChanges(viewDocChanges).snapshot;
	        });
	    };
	    FirestoreClient.prototype.write = function (mutations) {
	        var _this = this;
	        var deferred = new Deferred$1();
	        this.asyncQueue.enqueue(function () { return _this.syncEngine.write(mutations, deferred); });
	        return deferred.promise;
	    };
	    FirestoreClient.prototype.databaseId = function () {
	        return this.databaseInfo.databaseId;
	    };
	    FirestoreClient.prototype.transaction = function (updateFunction) {
	        var _this = this;
	        // We have to wait for the async queue to be sure syncEngine is initialized.
	        return this.asyncQueue
	            .enqueue(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
	            return [2 /*return*/];
	        }); }); })
	            .then(function () { return _this.syncEngine.runTransaction(updateFunction); });
	    };
	    return FirestoreClient;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/*
	 * A wrapper implementation of Observer<T> that will dispatch events
	 * asynchronously. To allow immediate silencing, a mute call is added which
	 * causes events scheduled to no longer be raised.
	 */
	var AsyncObserver = /** @class */ (function () {
	    function AsyncObserver(observer) {
	        this.observer = observer;
	        /**
	         * When set to true, will not raise future events. Necessary to deal with
	         * async detachment of listener.
	         */
	        this.muted = false;
	    }
	    AsyncObserver.prototype.next = function (value) {
	        this.scheduleEvent(this.observer.next, value);
	    };
	    AsyncObserver.prototype.error = function (error) {
	        this.scheduleEvent(this.observer.error, error);
	    };
	    AsyncObserver.prototype.mute = function () {
	        this.muted = true;
	    };
	    AsyncObserver.prototype.scheduleEvent = function (eventHandler, event) {
	        var _this = this;
	        if (!this.muted) {
	            setTimeout(function () {
	                if (!_this.muted) {
	                    eventHandler(event);
	                }
	            }, 0);
	        }
	    };
	    return AsyncObserver;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * Simple wrapper around a nullable UID. Mostly exists to make code more
	 * readable.
	 */
	var User = /** @class */ (function () {
	    function User(uid) {
	        this.uid = uid;
	    }
	    User.prototype.isAuthenticated = function () {
	        return this.uid != null;
	    };
	    /**
	     * Returns a key representing this user, suitable for inclusion in a
	     * dictionary.
	     */
	    User.prototype.toKey = function () {
	        if (this.isAuthenticated()) {
	            return 'uid:' + this.uid;
	        }
	        else {
	            return 'anonymous-user';
	        }
	    };
	    User.prototype.isEqual = function (otherUser) {
	        return otherUser.uid === this.uid;
	    };
	    /** A user with a null UID. */
	    User.UNAUTHENTICATED = new User(null);
	    // TODO(mikelehen): Look into getting a proper uid-equivalent for
	    // non-FirebaseAuth providers.
	    User.GOOGLE_CREDENTIALS = new User('google-credentials-uid');
	    User.FIRST_PARTY = new User('first-party-uid');
	    return User;
	}());

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var OAuthToken = /** @class */ (function () {
	    function OAuthToken(value, user) {
	        this.user = user;
	        this.type = 'OAuth';
	        this.authHeaders = { Authorization: "Bearer " + value };
	    }
	    return OAuthToken;
	}());
	/** A CredentialsProvider that always yields an empty token. */
	var EmptyCredentialsProvider = /** @class */ (function () {
	    function EmptyCredentialsProvider() {
	        /**
	         * Stores the User listener registered with setUserChangeListener()
	         * This isn't actually necessary since the UID never changes, but we use this
	         * to verify the listen contract is adhered to in tests.
	         */
	        this.userListener = null;
	    }
	    EmptyCredentialsProvider.prototype.getToken = function () {
	        return Promise.resolve(null);
	    };
	    EmptyCredentialsProvider.prototype.invalidateToken = function () { };
	    EmptyCredentialsProvider.prototype.setUserChangeListener = function (listener) {
	        assert$1(!this.userListener, 'Can only call setUserChangeListener() once.');
	        this.userListener = listener;
	        // Fire with initial user.
	        listener(User.UNAUTHENTICATED);
	    };
	    EmptyCredentialsProvider.prototype.removeUserChangeListener = function () {
	        assert$1(this.userListener !== null, 'removeUserChangeListener() when no listener registered');
	        this.userListener = null;
	    };
	    return EmptyCredentialsProvider;
	}());
	var FirebaseCredentialsProvider = /** @class */ (function () {
	    function FirebaseCredentialsProvider(app) {
	        var _this = this;
	        this.app = app;
	        /**
	         * The auth token listener registered with FirebaseApp, retained here so we
	         * can unregister it.
	         */
	        this.tokenListener = null;
	        /**
	         * Counter used to detect if the user changed while a getToken request was
	         * outstanding.
	         */
	        this.userCounter = 0;
	        /** The User listener registered with setUserChangeListener(). */
	        this.userListener = null;
	        this.forceRefresh = false;
	        // We listen for token changes but all we really care about is knowing when
	        // the uid may have changed.
	        this.tokenListener = function () {
	            var newUser = _this.getUser();
	            if (!_this.currentUser || !newUser.isEqual(_this.currentUser)) {
	                _this.currentUser = newUser;
	                _this.userCounter++;
	                if (_this.userListener) {
	                    _this.userListener(_this.currentUser);
	                }
	            }
	        };
	        this.userCounter = 0;
	        // Will fire at least once where we set this.currentUser
	        this.app.INTERNAL.addAuthTokenListener(this.tokenListener);
	    }
	    FirebaseCredentialsProvider.prototype.getToken = function () {
	        var _this = this;
	        assert$1(this.tokenListener != null, 'getToken cannot be called after listener removed.');
	        // Take note of the current value of the userCounter so that this method can
	        // fail (with an ABORTED error) if there is a user change while the request
	        // is outstanding.
	        var initialUserCounter = this.userCounter;
	        var forceRefresh = this.forceRefresh;
	        this.forceRefresh = false;
	        return this.app.INTERNAL.getToken(forceRefresh).then(function (tokenData) {
	            // Cancel the request since the user changed while the request was
	            // outstanding so the response is likely for a previous user (which
	            // user, we can't be sure).
	            if (_this.userCounter !== initialUserCounter) {
	                throw new FirestoreError(Code.ABORTED, 'getToken aborted due to uid change.');
	            }
	            else {
	                if (tokenData) {
	                    assert$1(typeof tokenData.accessToken === 'string', 'Invalid tokenData returned from getToken():' + tokenData);
	                    return new OAuthToken(tokenData.accessToken, _this.currentUser);
	                }
	                else {
	                    return null;
	                }
	            }
	        });
	    };
	    FirebaseCredentialsProvider.prototype.invalidateToken = function () {
	        this.forceRefresh = true;
	    };
	    FirebaseCredentialsProvider.prototype.setUserChangeListener = function (listener) {
	        assert$1(!this.userListener, 'Can only call setUserChangeListener() once.');
	        this.userListener = listener;
	        // Fire the initial event, but only if we received the initial user
	        if (this.currentUser) {
	            listener(this.currentUser);
	        }
	    };
	    FirebaseCredentialsProvider.prototype.removeUserChangeListener = function () {
	        assert$1(this.tokenListener != null, 'removeUserChangeListener() called twice');
	        assert$1(this.userListener !== null, 'removeUserChangeListener() called when no listener registered');
	        this.app.INTERNAL.removeAuthTokenListener(this.tokenListener);
	        this.tokenListener = null;
	        this.userListener = null;
	    };
	    FirebaseCredentialsProvider.prototype.getUser = function () {
	        // TODO(mikelehen): Remove this check once we're shipping with firebase.js.
	        if (typeof this.app.INTERNAL.getUid !== 'function') {
	            fail('This version of the Firestore SDK requires at least version' +
	                ' 3.7.0 of firebase.js.');
	        }
	        var currentUid = this.app.INTERNAL.getUid();
	        assert$1(currentUid === null || typeof currentUid === 'string', 'Received invalid UID: ' + currentUid);
	        return new User(currentUid);
	    };
	    return FirebaseCredentialsProvider;
	}());
	/*
	 * FirstPartyToken provides a fresh token each time its value
	 * is requested, because if the token is too old, requests will be rejected.
	 * TODO(b/33147818) this implementation violates the current assumption that
	 * tokens are immutable.  We need to either revisit this assumption or come
	 * up with some way for FPA to use the listen/unlisten interface.
	 */
	var FirstPartyToken = /** @class */ (function () {
	    function FirstPartyToken(gapi, sessionIndex) {
	        this.gapi = gapi;
	        this.sessionIndex = sessionIndex;
	        this.type = 'FirstParty';
	        this.user = User.FIRST_PARTY;
	        assert$1(this.gapi &&
	            this.gapi['auth'] &&
	            this.gapi['auth']['getAuthHeaderValueForFirstParty'], 'unexpected gapi interface');
	    }
	    Object.defineProperty(FirstPartyToken.prototype, "authHeaders", {
	        get: function () {
	            return {
	                Authorization: this.gapi['auth']['getAuthHeaderValueForFirstParty']([]),
	                'X-Goog-AuthUser': this.sessionIndex
	            };
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return FirstPartyToken;
	}());
	/*
	 * Provides user credentials required for the Firestore JavaScript SDK
	 * to authenticate the user, using technique that is only available
	 * to applications hosted by Google.
	 */
	var FirstPartyCredentialsProvider = /** @class */ (function () {
	    function FirstPartyCredentialsProvider(gapi, sessionIndex) {
	        this.gapi = gapi;
	        this.sessionIndex = sessionIndex;
	        assert$1(this.gapi &&
	            this.gapi['auth'] &&
	            this.gapi['auth']['getAuthHeaderValueForFirstParty'], 'unexpected gapi interface');
	    }
	    FirstPartyCredentialsProvider.prototype.getToken = function () {
	        return Promise.resolve(new FirstPartyToken(this.gapi, this.sessionIndex));
	    };
	    // TODO(33108925): can someone switch users w/o a page refresh?
	    // TODO(33110621): need to understand token/session lifecycle
	    FirstPartyCredentialsProvider.prototype.setUserChangeListener = function (listener) {
	        // Fire with initial uid.
	        listener(User.FIRST_PARTY);
	    };
	    FirstPartyCredentialsProvider.prototype.removeUserChangeListener = function () { };
	    FirstPartyCredentialsProvider.prototype.invalidateToken = function () { };
	    return FirstPartyCredentialsProvider;
	}());
	/**
	 * Builds a CredentialsProvider depending on the type of
	 * the credentials passed in.
	 */
	function makeCredentialsProvider(credentials) {
	    if (!credentials) {
	        return new EmptyCredentialsProvider();
	    }
	    switch (credentials.type) {
	        case 'gapi':
	            return new FirstPartyCredentialsProvider(credentials.client, credentials.sessionIndex || '0');
	        case 'provider':
	            return credentials.client;
	        default:
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'makeCredentialsProvider failed due to invalid credential type');
	    }
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	function isPartialObserver(obj) {
	    return implementsAnyMethods$1(obj, ['next', 'error', 'complete']);
	}
	/**
	 * Returns true if obj is an object and contains at least one of the specified
	 * methods.
	 */
	function implementsAnyMethods$1(obj, methods) {
	    if (typeof obj !== 'object' || obj === null) {
	        return false;
	    }
	    var object = obj;
	    for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
	        var method = methods_1[_i];
	        if (method in object && typeof object[method] === 'function') {
	            return true;
	        }
	    }
	    return false;
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/**
	 * An opaque base class for FieldValue sentinel objects in our public API,
	 * with public static methods for creating said sentinel objects.
	 */
	// tslint:disable-next-line:class-as-namespace  We use this as a base class.
	var FieldValueImpl = /** @class */ (function () {
	    function FieldValueImpl(methodName) {
	        this.methodName = methodName;
	    }
	    FieldValueImpl.delete = function () {
	        return DeleteFieldValueImpl.instance;
	    };
	    FieldValueImpl.serverTimestamp = function () {
	        return ServerTimestampFieldValueImpl.instance;
	    };
	    FieldValueImpl.arrayUnion = function () {
	        var arguments$1 = arguments;

	        var elements = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            elements[_i] = arguments$1[_i];
	        }
	        validateAtLeastNumberOfArgs('FieldValue.arrayUnion', arguments, 1);
	        // NOTE: We don't actually parse the data until it's used in set() or
	        // update() since we need access to the Firestore instance.
	        return new ArrayUnionFieldValueImpl(elements);
	    };
	    FieldValueImpl.arrayRemove = function () {
	        var arguments$1 = arguments;

	        var elements = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            elements[_i] = arguments$1[_i];
	        }
	        validateAtLeastNumberOfArgs('FieldValue.arrayRemove', arguments, 1);
	        // NOTE: We don't actually parse the data until it's used in set() or
	        // update() since we need access to the Firestore instance.
	        return new ArrayRemoveFieldValueImpl(elements);
	    };
	    FieldValueImpl.prototype.isEqual = function (other) {
	        return this === other;
	    };
	    return FieldValueImpl;
	}());
	var DeleteFieldValueImpl = /** @class */ (function (_super) {
	    __extends(DeleteFieldValueImpl, _super);
	    function DeleteFieldValueImpl() {
	        return _super.call(this, 'FieldValue.delete') || this;
	    }
	    /** Singleton instance. */
	    DeleteFieldValueImpl.instance = new DeleteFieldValueImpl();
	    return DeleteFieldValueImpl;
	}(FieldValueImpl));
	var ServerTimestampFieldValueImpl = /** @class */ (function (_super) {
	    __extends(ServerTimestampFieldValueImpl, _super);
	    function ServerTimestampFieldValueImpl() {
	        return _super.call(this, 'FieldValue.serverTimestamp') || this;
	    }
	    /** Singleton instance. */
	    ServerTimestampFieldValueImpl.instance = new ServerTimestampFieldValueImpl();
	    return ServerTimestampFieldValueImpl;
	}(FieldValueImpl));
	var ArrayUnionFieldValueImpl = /** @class */ (function (_super) {
	    __extends(ArrayUnionFieldValueImpl, _super);
	    function ArrayUnionFieldValueImpl(_elements) {
	        var _this = _super.call(this, 'FieldValue.arrayUnion') || this;
	        _this._elements = _elements;
	        return _this;
	    }
	    return ArrayUnionFieldValueImpl;
	}(FieldValueImpl));
	var ArrayRemoveFieldValueImpl = /** @class */ (function (_super) {
	    __extends(ArrayRemoveFieldValueImpl, _super);
	    function ArrayRemoveFieldValueImpl(_elements) {
	        var _this = _super.call(this, 'FieldValue.arrayRemove') || this;
	        _this._elements = _elements;
	        return _this;
	    }
	    return ArrayRemoveFieldValueImpl;
	}(FieldValueImpl));
	// Public instance that disallows construction at runtime. This constructor is
	// used when exporting FieldValueImpl on firebase.firestore.FieldValue and will
	// be called FieldValue publicly. Internally we still use FieldValueImpl which
	// has a type-checked private constructor. Note that FieldValueImpl and
	// PublicFieldValue can be used interchangeably in instanceof checks.
	// For our internal TypeScript code PublicFieldValue doesn't exist as a type,
	// and so we need to use FieldValueImpl as type and export it too.
	// tslint:disable-next-line:variable-name  We treat this as a class name.
	var PublicFieldValue = makeConstructorPrivate(FieldValueImpl, 'Use FieldValue.<field>() instead.');

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var RESERVED_FIELD_REGEX = /^__.*__$/;
	/** The result of parsing document data (e.g. for a setData call). */
	var ParsedSetData = /** @class */ (function () {
	    function ParsedSetData(data, fieldMask, fieldTransforms) {
	        this.data = data;
	        this.fieldMask = fieldMask;
	        this.fieldTransforms = fieldTransforms;
	    }
	    ParsedSetData.prototype.toMutations = function (key, precondition) {
	        var mutations = [];
	        if (this.fieldMask !== null) {
	            mutations.push(new PatchMutation(key, this.data, this.fieldMask, precondition));
	        }
	        else {
	            mutations.push(new SetMutation(key, this.data, precondition));
	        }
	        if (this.fieldTransforms.length > 0) {
	            mutations.push(new TransformMutation(key, this.fieldTransforms));
	        }
	        return mutations;
	    };
	    return ParsedSetData;
	}());
	/** The result of parsing "update" data (i.e. for an updateData call). */
	var ParsedUpdateData = /** @class */ (function () {
	    function ParsedUpdateData(data, fieldMask, fieldTransforms) {
	        this.data = data;
	        this.fieldMask = fieldMask;
	        this.fieldTransforms = fieldTransforms;
	    }
	    ParsedUpdateData.prototype.toMutations = function (key, precondition) {
	        var mutations = [
	            new PatchMutation(key, this.data, this.fieldMask, precondition)
	        ];
	        if (this.fieldTransforms.length > 0) {
	            mutations.push(new TransformMutation(key, this.fieldTransforms));
	        }
	        return mutations;
	    };
	    return ParsedUpdateData;
	}());
	/*
	 * Represents what type of API method provided the data being parsed; useful
	 * for determining which error conditions apply during parsing and providing
	 * better error messages.
	 */
	var UserDataSource;
	(function (UserDataSource) {
	    UserDataSource[UserDataSource["Set"] = 0] = "Set";
	    UserDataSource[UserDataSource["Update"] = 1] = "Update";
	    UserDataSource[UserDataSource["MergeSet"] = 2] = "MergeSet";
	    /**
	     * Indicates the source is a where clause, cursor bound, arrayUnion()
	     * element, etc. Of note, isWrite(source) will return false.
	     */
	    UserDataSource[UserDataSource["Argument"] = 3] = "Argument";
	})(UserDataSource || (UserDataSource = {}));
	function isWrite(dataSource) {
	    switch (dataSource) {
	        case UserDataSource.Set: // fall through
	        case UserDataSource.MergeSet: // fall through
	        case UserDataSource.Update:
	            return true;
	        case UserDataSource.Argument:
	            return false;
	        default:
	            throw fail("Unexpected case for UserDataSource: " + dataSource);
	    }
	}
	/** A "context" object passed around while parsing user data. */
	var ParseContext = /** @class */ (function () {
	    /**
	     * Initializes a ParseContext with the given source and path.
	     *
	     * @param dataSource Indicates what kind of API method this data came from.
	     * @param methodName The name of the method the user called to create this
	     *     ParseContext.
	     * @param path A path within the object being parsed. This could be an empty
	     *     path (in which case the context represents the root of the data being
	     *     parsed), or a nonempty path (indicating the context represents a nested
	     *     location within the data).
	     * @param arrayElement Whether or not this context corresponds to an element
	     *     of an array.
	     * @param fieldTransforms A mutable list of field transforms encountered while
	     *     parsing the data.
	     * @param fieldMask A mutable list of field paths encountered while parsing
	     *     the data.
	     *
	     * TODO(b/34871131): We don't support array paths right now, so path can be
	     * null to indicate the context represents any location within an array (in
	     * which case certain features will not work and errors will be somewhat
	     * compromised).
	     */
	    function ParseContext(dataSource, methodName, path, arrayElement, fieldTransforms, fieldMask) {
	        this.dataSource = dataSource;
	        this.methodName = methodName;
	        this.path = path;
	        this.arrayElement = arrayElement;
	        // Minor hack: If fieldTransforms is undefined, we assume this is an
	        // external call and we need to validate the entire path.
	        if (fieldTransforms === undefined) {
	            this.validatePath();
	        }
	        this.arrayElement = arrayElement !== undefined ? arrayElement : false;
	        this.fieldTransforms = fieldTransforms || [];
	        this.fieldMask = fieldMask || [];
	    }
	    ParseContext.prototype.childContextForField = function (field) {
	        var childPath = this.path == null ? null : this.path.child(field);
	        var context = new ParseContext(this.dataSource, this.methodName, childPath, 
	        /*arrayElement=*/ false, this.fieldTransforms, this.fieldMask);
	        context.validatePathSegment(field);
	        return context;
	    };
	    ParseContext.prototype.childContextForFieldPath = function (field) {
	        var childPath = this.path == null ? null : this.path.child(field);
	        var context = new ParseContext(this.dataSource, this.methodName, childPath, 
	        /*arrayElement=*/ false, this.fieldTransforms, this.fieldMask);
	        context.validatePath();
	        return context;
	    };
	    ParseContext.prototype.childContextForArray = function (index) {
	        // TODO(b/34871131): We don't support array paths right now; so make path
	        // null.
	        return new ParseContext(this.dataSource, this.methodName, 
	        /*path=*/ null, 
	        /*arrayElement=*/ true, this.fieldTransforms, this.fieldMask);
	    };
	    ParseContext.prototype.createError = function (reason) {
	        var fieldDescription = this.path === null || this.path.isEmpty()
	            ? ''
	            : " (found in field " + this.path.toString() + ")";
	        return new FirestoreError(Code.INVALID_ARGUMENT, "Function " + this.methodName + "() called with invalid data. " +
	            reason +
	            fieldDescription);
	    };
	    /** Returns 'true' if 'fieldPath' was traversed when creating this context. */
	    ParseContext.prototype.contains = function (fieldPath) {
	        return (this.fieldMask.find(function (field) { return fieldPath.isPrefixOf(field); }) !== undefined ||
	            this.fieldTransforms.find(function (transform) {
	                return fieldPath.isPrefixOf(transform.field);
	            }) !== undefined);
	    };
	    ParseContext.prototype.validatePath = function () {
	        var this$1 = this;

	        // TODO(b/34871131): Remove null check once we have proper paths for fields
	        // within arrays.
	        if (this.path === null) {
	            return;
	        }
	        for (var i = 0; i < this.path.length; i++) {
	            this$1.validatePathSegment(this$1.path.get(i));
	        }
	    };
	    ParseContext.prototype.validatePathSegment = function (segment) {
	        if (isWrite(this.dataSource) && RESERVED_FIELD_REGEX.test(segment)) {
	            throw this.createError('Document fields cannot begin and end with __');
	        }
	    };
	    return ParseContext;
	}());
	/**
	 * A placeholder object for DocumentReferences in this file, in order to
	 * avoid a circular dependency. See the comments for `DataPreConverter` for
	 * the full context.
	 */
	var DocumentKeyReference = /** @class */ (function () {
	    function DocumentKeyReference(databaseId, key) {
	        this.databaseId = databaseId;
	        this.key = key;
	    }
	    return DocumentKeyReference;
	}());
	/**
	 * Helper for parsing raw user input (provided via the API) into internal model
	 * classes.
	 */
	var UserDataConverter = /** @class */ (function () {
	    function UserDataConverter(preConverter) {
	        this.preConverter = preConverter;
	    }
	    /** Parse document data from a non-merge set() call. */
	    UserDataConverter.prototype.parseSetData = function (methodName, input) {
	        var context = new ParseContext(UserDataSource.Set, methodName, FieldPath.EMPTY_PATH);
	        validatePlainObject('Data must be an object, but it was:', context, input);
	        var updateData = this.parseData(input, context);
	        return new ParsedSetData(updateData, 
	        /* fieldMask= */ null, context.fieldTransforms);
	    };
	    /** Parse document data from a set() call with '{merge:true}'. */
	    UserDataConverter.prototype.parseMergeData = function (methodName, input, fieldPaths) {
	        var context = new ParseContext(UserDataSource.MergeSet, methodName, FieldPath.EMPTY_PATH);
	        validatePlainObject('Data must be an object, but it was:', context, input);
	        var updateData = this.parseData(input, context);
	        var fieldMask;
	        var fieldTransforms;
	        if (!fieldPaths) {
	            fieldMask = new FieldMask(context.fieldMask);
	            fieldTransforms = context.fieldTransforms;
	        }
	        else {
	            var validatedFieldPaths = [];
	            for (var _i = 0, fieldPaths_1 = fieldPaths; _i < fieldPaths_1.length; _i++) {
	                var stringOrFieldPath = fieldPaths_1[_i];
	                var fieldPath = void 0;
	                if (stringOrFieldPath instanceof FieldPath$1) {
	                    fieldPath = stringOrFieldPath;
	                }
	                else if (typeof stringOrFieldPath === 'string') {
	                    fieldPath = fieldPathFromDotSeparatedString(methodName, stringOrFieldPath);
	                }
	                else {
	                    fail('Expected stringOrFieldPath to be a string or a FieldPath');
	                }
	                if (!context.contains(fieldPath)) {
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, "Field '" + fieldPath + "' is specified in your field mask but missing from your input data.");
	                }
	                validatedFieldPaths.push(fieldPath);
	            }
	            fieldMask = new FieldMask(validatedFieldPaths);
	            fieldTransforms = context.fieldTransforms.filter(function (transform) {
	                return fieldMask.covers(transform.field);
	            });
	        }
	        return new ParsedSetData(updateData, fieldMask, fieldTransforms);
	    };
	    /** Parse update data from an update() call. */
	    UserDataConverter.prototype.parseUpdateData = function (methodName, input) {
	        var _this = this;
	        var context = new ParseContext(UserDataSource.Update, methodName, FieldPath.EMPTY_PATH);
	        validatePlainObject('Data must be an object, but it was:', context, input);
	        var fieldMaskPaths = [];
	        var updateData = ObjectValue.EMPTY;
	        forEach$1(input, function (key, value) {
	            var path = fieldPathFromDotSeparatedString(methodName, key);
	            var childContext = context.childContextForFieldPath(path);
	            value = _this.runPreConverter(value, childContext);
	            if (value instanceof DeleteFieldValueImpl) {
	                // Add it to the field mask, but don't add anything to updateData.
	                fieldMaskPaths.push(path);
	            }
	            else {
	                var parsedValue = _this.parseData(value, childContext);
	                if (parsedValue != null) {
	                    fieldMaskPaths.push(path);
	                    updateData = updateData.set(path, parsedValue);
	                }
	            }
	        });
	        var mask = new FieldMask(fieldMaskPaths);
	        return new ParsedUpdateData(updateData, mask, context.fieldTransforms);
	    };
	    /** Parse update data from a list of field/value arguments. */
	    UserDataConverter.prototype.parseUpdateVarargs = function (methodName, field, value, moreFieldsAndValues) {
	        var this$1 = this;

	        var context = new ParseContext(UserDataSource.Update, methodName, FieldPath.EMPTY_PATH);
	        var keys = [fieldPathFromArgument(methodName, field)];
	        var values = [value];
	        if (moreFieldsAndValues.length % 2 !== 0) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + methodName + "() needs to be called with an even number " +
	                'of arguments that alternate between field names and values.');
	        }
	        for (var i = 0; i < moreFieldsAndValues.length; i += 2) {
	            keys.push(fieldPathFromArgument(methodName, moreFieldsAndValues[i]));
	            values.push(moreFieldsAndValues[i + 1]);
	        }
	        var fieldMaskPaths = [];
	        var updateData = ObjectValue.EMPTY;
	        for (var i = 0; i < keys.length; ++i) {
	            var path = keys[i];
	            var childContext = context.childContextForFieldPath(path);
	            var value_1 = this$1.runPreConverter(values[i], childContext);
	            if (value_1 instanceof DeleteFieldValueImpl) {
	                // Add it to the field mask, but don't add anything to updateData.
	                fieldMaskPaths.push(path);
	            }
	            else {
	                var parsedValue = this$1.parseData(value_1, childContext);
	                if (parsedValue != null) {
	                    fieldMaskPaths.push(path);
	                    updateData = updateData.set(path, parsedValue);
	                }
	            }
	        }
	        var mask = new FieldMask(fieldMaskPaths);
	        return new ParsedUpdateData(updateData, mask, context.fieldTransforms);
	    };
	    /**
	     * Parse a "query value" (e.g. value in a where filter or a value in a cursor
	     * bound).
	     */
	    UserDataConverter.prototype.parseQueryValue = function (methodName, input) {
	        var context = new ParseContext(UserDataSource.Argument, methodName, FieldPath.EMPTY_PATH);
	        var parsed = this.parseData(input, context);
	        assert$1(parsed != null, 'Parsed data should not be null.');
	        assert$1(context.fieldTransforms.length === 0, 'Field transforms should have been disallowed.');
	        return parsed;
	    };
	    /** Sends data through this.preConverter, handling any thrown errors. */
	    UserDataConverter.prototype.runPreConverter = function (input, context) {
	        try {
	            return this.preConverter(input);
	        }
	        catch (e) {
	            var message = errorMessage(e);
	            throw context.createError(message);
	        }
	    };
	    /**
	     * Internal helper for parsing user data.
	     *
	     * @param input Data to be parsed.
	     * @param context A context object representing the current path being parsed,
	     * the source of the data being parsed, etc.
	     * @return The parsed value, or null if the value was a FieldValue sentinel
	     * that should not be included in the resulting parsed data.
	     */
	    UserDataConverter.prototype.parseData = function (input, context) {
	        input = this.runPreConverter(input, context);
	        if (looksLikeJsonObject(input)) {
	            validatePlainObject('Unsupported field value:', context, input);
	            return this.parseObject(input, context);
	        }
	        else if (input instanceof FieldValueImpl) {
	            // FieldValues usually parse into transforms (except FieldValue.delete())
	            // in which case we do not want to include this field in our parsed data
	            // (as doing so will overwrite the field directly prior to the transform
	            // trying to transform it). So we don't add this location to
	            // context.fieldMask and we return null as our parsing result.
	            this.parseSentinelFieldValue(input, context);
	            return null;
	        }
	        else {
	            // If context.path is null we are inside an array and we don't support
	            // field mask paths more granular than the top-level array.
	            if (context.path) {
	                context.fieldMask.push(context.path);
	            }
	            if (input instanceof Array) {
	                // TODO(b/34871131): Include the path containing the array in the error
	                // message.
	                if (context.arrayElement) {
	                    throw context.createError('Nested arrays are not supported');
	                }
	                return this.parseArray(input, context);
	            }
	            else {
	                return this.parseScalarValue(input, context);
	            }
	        }
	    };
	    UserDataConverter.prototype.parseObject = function (obj, context) {
	        var _this = this;
	        var result = new SortedMap(primitiveComparator);
	        forEach$1(obj, function (key, val) {
	            var parsedValue = _this.parseData(val, context.childContextForField(key));
	            if (parsedValue != null) {
	                result = result.insert(key, parsedValue);
	            }
	        });
	        return new ObjectValue(result);
	    };
	    UserDataConverter.prototype.parseArray = function (array, context) {
	        var this$1 = this;

	        var result = [];
	        var entryIndex = 0;
	        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
	            var entry = array_1[_i];
	            var parsedEntry = this$1.parseData(entry, context.childContextForArray(entryIndex));
	            if (parsedEntry == null) {
	                // Just include nulls in the array for fields being replaced with a
	                // sentinel.
	                parsedEntry = NullValue.INSTANCE;
	            }
	            result.push(parsedEntry);
	            entryIndex++;
	        }
	        return new ArrayValue(result);
	    };
	    /**
	     * "Parses" the provided FieldValueImpl, adding any necessary transforms to
	     * context.fieldTransforms.
	     */
	    UserDataConverter.prototype.parseSentinelFieldValue = function (value, context) {
	        // Sentinels are only supported with writes, and not within arrays.
	        if (!isWrite(context.dataSource)) {
	            throw context.createError(value.methodName + "() can only be used with update() and set()");
	        }
	        if (context.path === null) {
	            throw context.createError(value.methodName + "() is not currently supported inside arrays");
	        }
	        if (value instanceof DeleteFieldValueImpl) {
	            if (context.dataSource === UserDataSource.MergeSet) {
	                // No transform to add for a delete, but we need to add it to our
	                // fieldMask so it gets deleted.
	                context.fieldMask.push(context.path);
	            }
	            else if (context.dataSource === UserDataSource.Update) {
	                assert$1(context.path.length > 0, 'FieldValue.delete() at the top level should have already' +
	                    ' been handled.');
	                throw context.createError('FieldValue.delete() can only appear at the top level ' +
	                    'of your update data');
	            }
	            else {
	                // We shouldn't encounter delete sentinels for queries or non-merge set() calls.
	                throw context.createError('FieldValue.delete() cannot be used with set() unless you pass ' +
	                    '{merge:true}');
	            }
	        }
	        else if (value instanceof ServerTimestampFieldValueImpl) {
	            context.fieldTransforms.push(new FieldTransform(context.path, ServerTimestampTransform.instance));
	        }
	        else if (value instanceof ArrayUnionFieldValueImpl) {
	            var parsedElements = this.parseArrayTransformElements(value.methodName, value._elements);
	            var arrayUnion = new ArrayUnionTransformOperation(parsedElements);
	            context.fieldTransforms.push(new FieldTransform(context.path, arrayUnion));
	        }
	        else if (value instanceof ArrayRemoveFieldValueImpl) {
	            var parsedElements = this.parseArrayTransformElements(value.methodName, value._elements);
	            var arrayRemove = new ArrayRemoveTransformOperation(parsedElements);
	            context.fieldTransforms.push(new FieldTransform(context.path, arrayRemove));
	        }
	        else {
	            fail('Unknown FieldValue type: ' + value);
	        }
	    };
	    /**
	     * Helper to parse a scalar value (i.e. not an Object, Array, or FieldValue)
	     *
	     * @return The parsed value
	     */
	    UserDataConverter.prototype.parseScalarValue = function (value, context) {
	        if (value === null) {
	            return NullValue.INSTANCE;
	        }
	        else if (typeof value === 'number') {
	            if (isSafeInteger(value)) {
	                return new IntegerValue(value);
	            }
	            else {
	                return new DoubleValue(value);
	            }
	        }
	        else if (typeof value === 'boolean') {
	            return BooleanValue.of(value);
	        }
	        else if (typeof value === 'string') {
	            return new StringValue(value);
	        }
	        else if (value instanceof Date) {
	            return new TimestampValue(Timestamp.fromDate(value));
	        }
	        else if (value instanceof Timestamp) {
	            // Firestore backend truncates precision down to microseconds. To ensure
	            // offline mode works the same with regards to truncation, perform the
	            // truncation immediately without waiting for the backend to do that.
	            return new TimestampValue(new Timestamp(value.seconds, Math.floor(value.nanoseconds / 1000) * 1000));
	        }
	        else if (value instanceof GeoPoint) {
	            return new GeoPointValue(value);
	        }
	        else if (value instanceof Blob$1) {
	            return new BlobValue(value);
	        }
	        else if (value instanceof DocumentKeyReference) {
	            return new RefValue(value.databaseId, value.key);
	        }
	        else {
	            throw context.createError("Unsupported field value: " + valueDescription(value));
	        }
	    };
	    UserDataConverter.prototype.parseArrayTransformElements = function (methodName, elements) {
	        var _this = this;
	        return elements.map(function (element, i) {
	            // Although array transforms are used with writes, the actual elements
	            // being unioned or removed are not considered writes since they cannot
	            // contain any FieldValue sentinels, etc.
	            var context = new ParseContext(UserDataSource.Argument, methodName, FieldPath.EMPTY_PATH);
	            return _this.parseData(element, context.childContextForArray(i));
	        });
	    };
	    return UserDataConverter;
	}());
	/**
	 * Checks whether an object looks like a JSON object that should be converted
	 * into a struct. Normal class/prototype instances are considered to look like
	 * JSON objects since they should be converted to a struct value. Arrays, Dates,
	 * GeoPoints, etc. are not considered to look like JSON objects since they map
	 * to specific FieldValue types other than ObjectValue.
	 */
	function looksLikeJsonObject(input) {
	    return (typeof input === 'object' &&
	        input !== null &&
	        !(input instanceof Array) &&
	        !(input instanceof Date) &&
	        !(input instanceof Timestamp) &&
	        !(input instanceof GeoPoint) &&
	        !(input instanceof Blob$1) &&
	        !(input instanceof DocumentKeyReference) &&
	        !(input instanceof FieldValueImpl));
	}
	function validatePlainObject(message, context, input) {
	    if (!looksLikeJsonObject(input) || !isPlainObject(input)) {
	        var description = valueDescription(input);
	        if (description === 'an object') {
	            // Massage the error if it was an object.
	            throw context.createError(message + ' a custom object');
	        }
	        else {
	            throw context.createError(message + ' ' + description);
	        }
	    }
	}
	/**
	 * Helper that calls fromDotSeparatedString() but wraps any error thrown.
	 */
	function fieldPathFromArgument(methodName, path) {
	    if (path instanceof FieldPath$1) {
	        return path._internalPath;
	    }
	    else if (typeof path === 'string') {
	        return fieldPathFromDotSeparatedString(methodName, path);
	    }
	    else {
	        var message = 'Field path arguments must be of type string or FieldPath.';
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + methodName + "() called with invalid data. " + message);
	    }
	}
	/**
	 * Wraps fromDotSeparatedString with an error message about the method that
	 * was thrown.
	 * @param methodName The publicly visible method name
	 * @param path The dot-separated string form of a field path which will be split
	 * on dots.
	 */
	function fieldPathFromDotSeparatedString(methodName, path) {
	    try {
	        return fromDotSeparatedString(path)._internalPath;
	    }
	    catch (e) {
	        var message = errorMessage(e);
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Function " + methodName + "() called with invalid data. " + message);
	    }
	}
	/**
	 * Extracts the message from a caught exception, which should be an Error object
	 * though JS doesn't guarantee that.
	 */
	function errorMessage(error) {
	    return error instanceof Error ? error.message : error.toString();
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	// The objects that are a part of this API are exposed to third-parties as
	// compiled javascript so we want to flag our private members with a leading
	// underscore to discourage their use.
	// tslint:disable:strip-private-property-underscore
	var DEFAULT_HOST = 'firestore.googleapis.com';
	var DEFAULT_SSL = true;
	var DEFAULT_TIMESTAMPS_IN_SNAPSHOTS = false;
	/**
	 * A concrete type describing all the values that can be applied via a
	 * user-supplied firestore.Settings object. This is a separate type so that
	 * defaults can be supplied and the value can be checked for equality.
	 */
	var FirestoreSettings = /** @class */ (function () {
	    function FirestoreSettings(settings) {
	        if (settings.host === undefined) {
	            if (settings.ssl !== undefined) {
	                throw new FirestoreError(Code.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
	            }
	            this.host = DEFAULT_HOST;
	            this.ssl = DEFAULT_SSL;
	        }
	        else {
	            validateNamedType('settings', 'string', 'host', settings.host);
	            this.host = settings.host;
	            validateNamedOptionalType('settings', 'boolean', 'ssl', settings.ssl);
	            this.ssl = defaulted(settings.ssl, DEFAULT_SSL);
	        }
	        validateOptionNames('settings', settings, [
	            'host',
	            'ssl',
	            'credentials',
	            'timestampsInSnapshots'
	        ]);
	        validateNamedOptionalType('settings', 'object', 'credentials', settings.credentials);
	        this.credentials = settings.credentials;
	        validateNamedOptionalType('settings', 'boolean', 'timestampsInSnapshots', settings.timestampsInSnapshots);
	        this.timestampsInSnapshots = defaulted(settings.timestampsInSnapshots, DEFAULT_TIMESTAMPS_IN_SNAPSHOTS);
	    }
	    FirestoreSettings.prototype.isEqual = function (other) {
	        return (this.host === other.host &&
	            this.ssl === other.ssl &&
	            this.timestampsInSnapshots === other.timestampsInSnapshots &&
	            this.credentials === other.credentials);
	    };
	    return FirestoreSettings;
	}());
	var FirestoreConfig = /** @class */ (function () {
	    function FirestoreConfig() {
	    }
	    return FirestoreConfig;
	}());
	/**
	 * The root reference to the database.
	 */
	var Firestore = /** @class */ (function () {
	    function Firestore(databaseIdOrApp) {
	        var _this = this;
	        // Public for use in tests.
	        // TODO(mikelehen): Use modularized initialization instead.
	        this._queue = new AsyncQueue();
	        this.INTERNAL = {
	            delete: function (options) { return __awaiter(_this, void 0, void 0, function () {
	                return __generator(this, function (_a) {
	                    if (this._firestoreClient) {
	                        return [2 /*return*/, this._firestoreClient.shutdown(options)];
	                    }
	                    return [2 /*return*/];
	                });
	            }); }
	        };
	        var config = new FirestoreConfig();
	        if (typeof databaseIdOrApp.options === 'object') {
	            // This is very likely a Firebase app object
	            // TODO(b/34177605): Can we somehow use instanceof?
	            var app = databaseIdOrApp;
	            config.firebaseApp = app;
	            config.databaseId = Firestore.databaseIdFromApp(app);
	            config.persistenceKey = config.firebaseApp.name;
	            config.credentials = new FirebaseCredentialsProvider(app);
	        }
	        else {
	            var external_1 = databaseIdOrApp;
	            if (!external_1.projectId) {
	                throw new FirestoreError(Code.INVALID_ARGUMENT, 'Must provide projectId');
	            }
	            config.databaseId = new DatabaseId(external_1.projectId, external_1.database);
	            // Use a default persistenceKey that lines up with FirebaseApp.
	            config.persistenceKey = '[DEFAULT]';
	            config.credentials = new EmptyCredentialsProvider();
	        }
	        config.settings = new FirestoreSettings({});
	        this._config = config;
	        this._databaseId = config.databaseId;
	    }
	    Firestore.prototype.settings = function (settingsLiteral) {
	        validateExactNumberOfArgs('Firestore.settings', arguments, 1);
	        validateArgType('Firestore.settings', 'object', 1, settingsLiteral);
	        if (contains$2(settingsLiteral, 'persistence')) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, '"persistence" is now specified with a separate call to ' +
	                'firestore.enablePersistence().');
	        }
	        var newSettings = new FirestoreSettings(settingsLiteral);
	        if (this._firestoreClient && !this._config.settings.isEqual(newSettings)) {
	            throw new FirestoreError(Code.FAILED_PRECONDITION, 'Firestore has already been started and its settings can no longer ' +
	                'be changed. You can only call settings() before calling any other ' +
	                'methods on a Firestore object.');
	        }
	        this._config.settings = newSettings;
	        if (newSettings.credentials !== undefined) {
	            this._config.credentials = makeCredentialsProvider(newSettings.credentials);
	        }
	    };
	    Firestore.prototype.enableNetwork = function () {
	        this.ensureClientConfigured();
	        return this._firestoreClient.enableNetwork();
	    };
	    Firestore.prototype.disableNetwork = function () {
	        this.ensureClientConfigured();
	        return this._firestoreClient.disableNetwork();
	    };
	    Firestore.prototype.enablePersistence = function () {
	        if (this._firestoreClient) {
	            throw new FirestoreError(Code.FAILED_PRECONDITION, 'Firestore has already been started and persistence can no longer ' +
	                'be enabled. You can only call enablePersistence() before calling ' +
	                'any other methods on a Firestore object.');
	        }
	        return this.configureClient(/* persistence= */ true);
	    };
	    Firestore.prototype.ensureClientConfigured = function () {
	        if (!this._firestoreClient) {
	            this.configureClient(/* persistence= */ false);
	        }
	        return this._firestoreClient;
	    };
	    Firestore.prototype.configureClient = function (persistence) {
	        var _this = this;
	        assert$1(!!this._config.settings.host, 'FirestoreSettings.host cannot be falsey');
	        if (!this._config.settings.timestampsInSnapshots) {
	            error$1("\nThe behavior for Date objects stored in Firestore is going to change\nAND YOUR APP MAY BREAK.\nTo hide this warning and ensure your app does not break, you need to add the\nfollowing code to your app before calling any other Cloud Firestore methods:\n\n  const firestore = firebase.firestore();\n  const settings = {/* your settings... */ timestampsInSnapshots: true};\n  firestore.settings(settings);\n\nWith this change, timestamps stored in Cloud Firestore will be read back as\nFirebase Timestamp objects instead of as system Date objects. So you will also\nneed to update code expecting a Date to instead expect a Timestamp. For example:\n\n  // Old:\n  const date = snapshot.get('created_at');\n  // New:\n  const timestamp = snapshot.get('created_at');\n  const date = timestamp.toDate();\n\nPlease audit all existing usages of Date when you enable the new behavior. In a\nfuture release, the behavior will change to the new behavior, so if you do not\nfollow these steps, YOUR APP MAY BREAK.");
	        }
	        assert$1(!this._firestoreClient, 'configureClient() called multiple times');
	        var databaseInfo = new DatabaseInfo(this._config.databaseId, this._config.persistenceKey, this._config.settings.host, this._config.settings.ssl);
	        var preConverter = function (value) {
	            if (value instanceof DocumentReference) {
	                var thisDb = _this._config.databaseId;
	                var otherDb = value.firestore._config.databaseId;
	                if (!otherDb.isEqual(thisDb)) {
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, 'Document reference is for database ' +
	                        (otherDb.projectId + "/" + otherDb.database + " but should be ") +
	                        ("for database " + thisDb.projectId + "/" + thisDb.database));
	                }
	                return new DocumentKeyReference(_this._config.databaseId, value._key);
	            }
	            else {
	                return value;
	            }
	        };
	        this._dataConverter = new UserDataConverter(preConverter);
	        this._firestoreClient = new FirestoreClient(PlatformSupport.getPlatform(), databaseInfo, this._config.credentials, this._queue);
	        return this._firestoreClient.start(persistence);
	    };
	    Firestore.databaseIdFromApp = function (app) {
	        var options = app.options;
	        if (!contains$2(options, 'projectId')) {
	            // TODO(b/62673263): We can safely remove the special handling of
	            // 'firestoreId' once alpha testers have upgraded.
	            if (contains$2(options, 'firestoreId')) {
	                throw new FirestoreError(Code.INVALID_ARGUMENT, '"firestoreId" is now specified as "projectId" in ' +
	                    'firebase.initializeApp.');
	            }
	            throw new FirestoreError(Code.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
	        }
	        if (contains$2(options, 'firestoreOptions')) {
	            // TODO(b/62673263): We can safely remove the special handling of
	            // 'firestoreOptions' once alpha testers have upgraded.
	            throw new FirestoreError(Code.INVALID_ARGUMENT, '"firestoreOptions" values are now specified with ' +
	                'Firestore.settings()');
	        }
	        var projectId = options['projectId'];
	        if (!projectId || typeof projectId !== 'string') {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'projectId must be a string in FirebaseApp.options');
	        }
	        return new DatabaseId(projectId);
	    };
	    Object.defineProperty(Firestore.prototype, "app", {
	        get: function () {
	            if (!this._config.firebaseApp) {
	                throw new FirestoreError(Code.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is " +
	                    'not available');
	            }
	            return this._config.firebaseApp;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Firestore.prototype.collection = function (pathString) {
	        validateExactNumberOfArgs('Firestore.collection', arguments, 1);
	        validateArgType('Firestore.collection', 'string', 1, pathString);
	        if (!pathString) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Must provide a non-empty collection path to collection()');
	        }
	        this.ensureClientConfigured();
	        return new CollectionReference(ResourcePath.fromString(pathString), this);
	    };
	    Firestore.prototype.doc = function (pathString) {
	        validateExactNumberOfArgs('Firestore.doc', arguments, 1);
	        validateArgType('Firestore.doc', 'string', 1, pathString);
	        if (!pathString) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Must provide a non-empty document path to doc()');
	        }
	        this.ensureClientConfigured();
	        return DocumentReference.forPath(ResourcePath.fromString(pathString), this);
	    };
	    Firestore.prototype.runTransaction = function (updateFunction) {
	        var _this = this;
	        validateExactNumberOfArgs('Firestore.runTransaction', arguments, 1);
	        validateArgType('Firestore.runTransaction', 'function', 1, updateFunction);
	        return this.ensureClientConfigured().transaction(function (transaction) {
	            return updateFunction(new Transaction$1(_this, transaction));
	        });
	    };
	    Firestore.prototype.batch = function () {
	        this.ensureClientConfigured();
	        return new WriteBatch(this);
	    };
	    Object.defineProperty(Firestore, "logLevel", {
	        get: function () {
	            switch (getLogLevel()) {
	                case LogLevel$1.DEBUG:
	                    return 'debug';
	                case LogLevel$1.ERROR:
	                    return 'error';
	                case LogLevel$1.SILENT:
	                    return 'silent';
	                default:
	                    return fail('Unknown log level: ' + getLogLevel());
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Firestore.setLogLevel = function (level) {
	        validateExactNumberOfArgs('Firestore.setLogLevel', arguments, 1);
	        validateArgType('Firestore.setLogLevel', 'string', 1, level);
	        switch (level) {
	            case 'debug':
	                setLogLevel$1(LogLevel$1.DEBUG);
	                break;
	            case 'error':
	                setLogLevel$1(LogLevel$1.ERROR);
	                break;
	            case 'silent':
	                setLogLevel$1(LogLevel$1.SILENT);
	                break;
	            default:
	                throw new FirestoreError(Code.INVALID_ARGUMENT, 'Invalid log level: ' + level);
	        }
	    };
	    // Note: this is not a property because the minifier can't work correctly with
	    // the way TypeScript compiler outputs properties.
	    Firestore.prototype._areTimestampsInSnapshotsEnabled = function () {
	        return this._config.settings.timestampsInSnapshots;
	    };
	    return Firestore;
	}());
	/**
	 * A reference to a transaction.
	 */
	var Transaction$1 = /** @class */ (function () {
	    function Transaction(_firestore, _transaction) {
	        this._firestore = _firestore;
	        this._transaction = _transaction;
	    }
	    Transaction.prototype.get = function (documentRef) {
	        var _this = this;
	        validateExactNumberOfArgs('Transaction.get', arguments, 1);
	        var ref = validateReference('Transaction.get', documentRef, this._firestore);
	        return this._transaction
	            .lookup([ref._key])
	            .then(function (docs) {
	            if (!docs || docs.length !== 1) {
	                return fail('Mismatch in docs returned from document lookup.');
	            }
	            var doc = docs[0];
	            if (doc instanceof NoDocument) {
	                return new DocumentSnapshot(_this._firestore, ref._key, null, false);
	            }
	            return new DocumentSnapshot(_this._firestore, ref._key, doc, false);
	        });
	    };
	    Transaction.prototype.set = function (documentRef, value, options) {
	        validateBetweenNumberOfArgs('Transaction.set', arguments, 2, 3);
	        var ref = validateReference('Transaction.set', documentRef, this._firestore);
	        options = validateSetOptions('Transaction.set', options);
	        var parsed = options.merge || options.mergeFields
	            ? this._firestore._dataConverter.parseMergeData('Transaction.set', value, options.mergeFields)
	            : this._firestore._dataConverter.parseSetData('Transaction.set', value);
	        this._transaction.set(ref._key, parsed);
	        return this;
	    };
	    Transaction.prototype.update = function (documentRef, fieldOrUpdateData, value) {
	        var arguments$1 = arguments;

	        var moreFieldsAndValues = [];
	        for (var _i = 3; _i < arguments.length; _i++) {
	            moreFieldsAndValues[_i - 3] = arguments$1[_i];
	        }
	        var ref;
	        var parsed;
	        if (typeof fieldOrUpdateData === 'string' ||
	            fieldOrUpdateData instanceof FieldPath$1) {
	            validateAtLeastNumberOfArgs('Transaction.update', arguments, 3);
	            ref = validateReference('Transaction.update', documentRef, this._firestore);
	            parsed = this._firestore._dataConverter.parseUpdateVarargs('Transaction.update', fieldOrUpdateData, value, moreFieldsAndValues);
	        }
	        else {
	            validateExactNumberOfArgs('Transaction.update', arguments, 2);
	            ref = validateReference('Transaction.update', documentRef, this._firestore);
	            parsed = this._firestore._dataConverter.parseUpdateData('Transaction.update', fieldOrUpdateData);
	        }
	        this._transaction.update(ref._key, parsed);
	        return this;
	    };
	    Transaction.prototype.delete = function (documentRef) {
	        validateExactNumberOfArgs('Transaction.delete', arguments, 1);
	        var ref = validateReference('Transaction.delete', documentRef, this._firestore);
	        this._transaction.delete(ref._key);
	        return this;
	    };
	    return Transaction;
	}());
	var WriteBatch = /** @class */ (function () {
	    function WriteBatch(_firestore) {
	        this._firestore = _firestore;
	        this._mutations = [];
	        this._committed = false;
	    }
	    WriteBatch.prototype.set = function (documentRef, value, options) {
	        validateBetweenNumberOfArgs('WriteBatch.set', arguments, 2, 3);
	        this.verifyNotCommitted();
	        var ref = validateReference('WriteBatch.set', documentRef, this._firestore);
	        options = validateSetOptions('WriteBatch.set', options);
	        var parsed = options.merge || options.mergeFields
	            ? this._firestore._dataConverter.parseMergeData('WriteBatch.set', value, options.mergeFields)
	            : this._firestore._dataConverter.parseSetData('WriteBatch.set', value);
	        this._mutations = this._mutations.concat(parsed.toMutations(ref._key, Precondition.NONE));
	        return this;
	    };
	    WriteBatch.prototype.update = function (documentRef, fieldOrUpdateData, value) {
	        var arguments$1 = arguments;

	        var moreFieldsAndValues = [];
	        for (var _i = 3; _i < arguments.length; _i++) {
	            moreFieldsAndValues[_i - 3] = arguments$1[_i];
	        }
	        this.verifyNotCommitted();
	        var ref;
	        var parsed;
	        if (typeof fieldOrUpdateData === 'string' ||
	            fieldOrUpdateData instanceof FieldPath$1) {
	            validateAtLeastNumberOfArgs('WriteBatch.update', arguments, 3);
	            ref = validateReference('WriteBatch.update', documentRef, this._firestore);
	            parsed = this._firestore._dataConverter.parseUpdateVarargs('WriteBatch.update', fieldOrUpdateData, value, moreFieldsAndValues);
	        }
	        else {
	            validateExactNumberOfArgs('WriteBatch.update', arguments, 2);
	            ref = validateReference('WriteBatch.update', documentRef, this._firestore);
	            parsed = this._firestore._dataConverter.parseUpdateData('WriteBatch.update', fieldOrUpdateData);
	        }
	        this._mutations = this._mutations.concat(parsed.toMutations(ref._key, Precondition.exists(true)));
	        return this;
	    };
	    WriteBatch.prototype.delete = function (documentRef) {
	        validateExactNumberOfArgs('WriteBatch.delete', arguments, 1);
	        this.verifyNotCommitted();
	        var ref = validateReference('WriteBatch.delete', documentRef, this._firestore);
	        this._mutations = this._mutations.concat(new DeleteMutation(ref._key, Precondition.NONE));
	        return this;
	    };
	    WriteBatch.prototype.commit = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                this.verifyNotCommitted();
	                this._committed = true;
	                if (this._mutations.length > 0) {
	                    return [2 /*return*/, this._firestore.ensureClientConfigured().write(this._mutations)];
	                }
	                return [2 /*return*/];
	            });
	        });
	    };
	    WriteBatch.prototype.verifyNotCommitted = function () {
	        if (this._committed) {
	            throw new FirestoreError(Code.FAILED_PRECONDITION, 'A write batch can no longer be used after commit() ' +
	                'has been called.');
	        }
	    };
	    return WriteBatch;
	}());
	/**
	 * A reference to a particular document in a collection in the database.
	 */
	var DocumentReference = /** @class */ (function () {
	    function DocumentReference(_key, firestore) {
	        this._key = _key;
	        this.firestore = firestore;
	        this._firestoreClient = this.firestore.ensureClientConfigured();
	    }
	    DocumentReference.forPath = function (path, firestore) {
	        if (path.length % 2 !== 0) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Invalid document reference. Document ' +
	                'references must have an even number of segments, but ' +
	                (path.canonicalString() + " has " + path.length));
	        }
	        return new DocumentReference(new DocumentKey(path), firestore);
	    };
	    Object.defineProperty(DocumentReference.prototype, "id", {
	        get: function () {
	            return this._key.path.lastSegment();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DocumentReference.prototype, "parent", {
	        get: function () {
	            return new CollectionReference(this._key.path.popLast(), this.firestore);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DocumentReference.prototype, "path", {
	        get: function () {
	            return this._key.path.canonicalString();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    DocumentReference.prototype.collection = function (pathString) {
	        validateExactNumberOfArgs('DocumentReference.collection', arguments, 1);
	        validateArgType('DocumentReference.collection', 'string', 1, pathString);
	        if (!pathString) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Must provide a non-empty collection name to collection()');
	        }
	        var path = ResourcePath.fromString(pathString);
	        return new CollectionReference(this._key.path.child(path), this.firestore);
	    };
	    DocumentReference.prototype.isEqual = function (other) {
	        if (!(other instanceof DocumentReference)) {
	            throw invalidClassError('isEqual', 'DocumentReference', 1, other);
	        }
	        return this.firestore === other.firestore && this._key.isEqual(other._key);
	    };
	    DocumentReference.prototype.set = function (value, options) {
	        validateBetweenNumberOfArgs('DocumentReference.set', arguments, 1, 2);
	        options = validateSetOptions('DocumentReference.set', options);
	        var parsed = options.merge || options.mergeFields
	            ? this.firestore._dataConverter.parseMergeData('DocumentReference.set', value, options.mergeFields)
	            : this.firestore._dataConverter.parseSetData('DocumentReference.set', value);
	        return this._firestoreClient.write(parsed.toMutations(this._key, Precondition.NONE));
	    };
	    DocumentReference.prototype.update = function (fieldOrUpdateData, value) {
	        var arguments$1 = arguments;

	        var moreFieldsAndValues = [];
	        for (var _i = 2; _i < arguments.length; _i++) {
	            moreFieldsAndValues[_i - 2] = arguments$1[_i];
	        }
	        var parsed;
	        if (typeof fieldOrUpdateData === 'string' ||
	            fieldOrUpdateData instanceof FieldPath$1) {
	            validateAtLeastNumberOfArgs('DocumentReference.update', arguments, 2);
	            parsed = this.firestore._dataConverter.parseUpdateVarargs('DocumentReference.update', fieldOrUpdateData, value, moreFieldsAndValues);
	        }
	        else {
	            validateExactNumberOfArgs('DocumentReference.update', arguments, 1);
	            parsed = this.firestore._dataConverter.parseUpdateData('DocumentReference.update', fieldOrUpdateData);
	        }
	        return this._firestoreClient.write(parsed.toMutations(this._key, Precondition.exists(true)));
	    };
	    DocumentReference.prototype.delete = function () {
	        validateExactNumberOfArgs('DocumentReference.delete', arguments, 0);
	        return this._firestoreClient.write([
	            new DeleteMutation(this._key, Precondition.NONE)
	        ]);
	    };
	    DocumentReference.prototype.onSnapshot = function () {
	        var arguments$1 = arguments;

	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments$1[_i];
	        }
	        validateBetweenNumberOfArgs('DocumentReference.onSnapshot', arguments, 1, 4);
	        var options = {
	            includeMetadataChanges: false
	        };
	        var observer;
	        var currArg = 0;
	        if (typeof args[currArg] === 'object' &&
	            !isPartialObserver(args[currArg])) {
	            options = args[currArg];
	            validateOptionNames('DocumentReference.onSnapshot', options, [
	                'includeMetadataChanges'
	            ]);
	            validateNamedOptionalType('DocumentReference.onSnapshot', 'boolean', 'includeMetadataChanges', options.includeMetadataChanges);
	            currArg++;
	        }
	        var internalOptions = {
	            includeMetadataChanges: options.includeMetadataChanges
	        };
	        if (isPartialObserver(args[currArg])) {
	            observer = args[currArg];
	        }
	        else {
	            validateArgType('DocumentReference.onSnapshot', 'function', currArg, args[currArg]);
	            validateOptionalArgType('DocumentReference.onSnapshot', 'function', currArg + 1, args[currArg + 1]);
	            validateOptionalArgType('DocumentReference.onSnapshot', 'function', currArg + 2, args[currArg + 2]);
	            observer = {
	                next: args[currArg],
	                error: args[currArg + 1],
	                complete: args[currArg + 2]
	            };
	        }
	        return this.onSnapshotInternal(internalOptions, observer);
	    };
	    DocumentReference.prototype.onSnapshotInternal = function (options, observer) {
	        var _this = this;
	        var errHandler = function (err) {
	            console.error('Uncaught Error in onSnapshot:', err);
	        };
	        if (observer.error) {
	            errHandler = observer.error.bind(observer);
	        }
	        var asyncObserver = new AsyncObserver({
	            next: function (snapshot) {
	                if (observer.next) {
	                    assert$1(snapshot.docs.size <= 1, 'Too many documents returned on a document query');
	                    var doc = snapshot.docs.get(_this._key);
	                    observer.next(new DocumentSnapshot(_this.firestore, _this._key, doc, snapshot.fromCache));
	                }
	            },
	            error: errHandler
	        });
	        var internalListener = this._firestoreClient.listen(Query.atPath(this._key.path), asyncObserver, options);
	        return function () {
	            asyncObserver.mute();
	            _this._firestoreClient.unlisten(internalListener);
	        };
	    };
	    DocumentReference.prototype.get = function (options) {
	        var _this = this;
	        validateOptionNames('DocumentReference.get', options, ['source']);
	        if (options) {
	            validateNamedOptionalPropertyEquals('DocumentReference.get', 'options', 'source', options.source, ['default', 'server', 'cache']);
	        }
	        return new Promise(function (resolve, reject) {
	            if (options && options.source === 'cache') {
	                _this.firestore
	                    .ensureClientConfigured()
	                    .getDocumentFromLocalCache(_this._key)
	                    .then(function (doc) {
	                    resolve(new DocumentSnapshot(_this.firestore, _this._key, doc, 
	                    /*fromCache=*/ true));
	                }, reject);
	            }
	            else {
	                _this.getViaSnapshotListener(resolve, reject, options);
	            }
	        });
	    };
	    DocumentReference.prototype.getViaSnapshotListener = function (resolve, reject, options) {
	        var unlisten = this.onSnapshotInternal({
	            includeMetadataChanges: true,
	            waitForSyncWhenOnline: true
	        }, {
	            next: function (snap) {
	                // Remove query first before passing event to user to avoid
	                // user actions affecting the now stale query.
	                unlisten();
	                if (!snap.exists && snap.metadata.fromCache) {
	                    // TODO(dimond): If we're online and the document doesn't
	                    // exist then we resolve with a doc.exists set to false. If
	                    // we're offline however, we reject the Promise in this
	                    // case. Two options: 1) Cache the negative response from
	                    // the server so we can deliver that even when you're
	                    // offline 2) Actually reject the Promise in the online case
	                    // if the document doesn't exist.
	                    reject(new FirestoreError(Code.UNAVAILABLE, 'Failed to get document because the client is ' + 'offline.'));
	                }
	                else if (snap.exists &&
	                    snap.metadata.fromCache &&
	                    options &&
	                    options.source === 'server') {
	                    reject(new FirestoreError(Code.UNAVAILABLE, 'Failed to get document from server. (However, this ' +
	                        'document does exist in the local cache. Run again ' +
	                        'without setting source to "server" to ' +
	                        'retrieve the cached document.)'));
	                }
	                else {
	                    resolve(snap);
	                }
	            },
	            error: reject
	        });
	    };
	    return DocumentReference;
	}());
	var SnapshotMetadata = /** @class */ (function () {
	    function SnapshotMetadata(hasPendingWrites, fromCache) {
	        this.hasPendingWrites = hasPendingWrites;
	        this.fromCache = fromCache;
	    }
	    SnapshotMetadata.prototype.isEqual = function (other) {
	        return (this.hasPendingWrites === other.hasPendingWrites &&
	            this.fromCache === other.fromCache);
	    };
	    return SnapshotMetadata;
	}());
	var DocumentSnapshot = /** @class */ (function () {
	    function DocumentSnapshot(_firestore, _key, _document, _fromCache) {
	        this._firestore = _firestore;
	        this._key = _key;
	        this._document = _document;
	        this._fromCache = _fromCache;
	    }
	    DocumentSnapshot.prototype.data = function (options) {
	        validateBetweenNumberOfArgs('DocumentSnapshot.data', arguments, 0, 1);
	        options = validateSnapshotOptions('DocumentSnapshot.data', options);
	        return !this._document
	            ? undefined
	            : this.convertObject(this._document.data, FieldValueOptions.fromSnapshotOptions(options, this._firestore._areTimestampsInSnapshotsEnabled()));
	    };
	    DocumentSnapshot.prototype.get = function (fieldPath, options) {
	        validateBetweenNumberOfArgs('DocumentSnapshot.get', arguments, 1, 2);
	        options = validateSnapshotOptions('DocumentSnapshot.get', options);
	        if (this._document) {
	            var value = this._document.data.field(fieldPathFromArgument('DocumentSnapshot.get', fieldPath));
	            if (value !== undefined) {
	                return this.convertValue(value, FieldValueOptions.fromSnapshotOptions(options, this._firestore._areTimestampsInSnapshotsEnabled()));
	            }
	        }
	        return undefined;
	    };
	    Object.defineProperty(DocumentSnapshot.prototype, "id", {
	        get: function () {
	            return this._key.path.lastSegment();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DocumentSnapshot.prototype, "ref", {
	        get: function () {
	            return new DocumentReference(this._key, this._firestore);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DocumentSnapshot.prototype, "exists", {
	        get: function () {
	            return this._document !== null;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(DocumentSnapshot.prototype, "metadata", {
	        get: function () {
	            return new SnapshotMetadata(this._document !== null && this._document.hasLocalMutations, this._fromCache);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    DocumentSnapshot.prototype.isEqual = function (other) {
	        if (!(other instanceof DocumentSnapshot)) {
	            throw invalidClassError('isEqual', 'DocumentSnapshot', 1, other);
	        }
	        return (this._firestore === other._firestore &&
	            this._fromCache === other._fromCache &&
	            this._key.isEqual(other._key) &&
	            (this._document === null
	                ? other._document === null
	                : this._document.isEqual(other._document)));
	    };
	    DocumentSnapshot.prototype.convertObject = function (data, options) {
	        var _this = this;
	        var result = {};
	        data.forEach(function (key, value) {
	            result[key] = _this.convertValue(value, options);
	        });
	        return result;
	    };
	    DocumentSnapshot.prototype.convertValue = function (value, options) {
	        if (value instanceof ObjectValue) {
	            return this.convertObject(value, options);
	        }
	        else if (value instanceof ArrayValue) {
	            return this.convertArray(value, options);
	        }
	        else if (value instanceof RefValue) {
	            var key = value.value(options);
	            var database = this._firestore.ensureClientConfigured().databaseId();
	            if (!value.databaseId.isEqual(database)) {
	                // TODO(b/64130202): Somehow support foreign references.
	                error$1("Document " + this._key.path + " contains a document " +
	                    "reference within a different database (" +
	                    (value.databaseId.projectId + "/" + value.databaseId.database + ") which is not ") +
	                    "supported. It will be treated as a reference in the current " +
	                    ("database (" + database.projectId + "/" + database.database + ") ") +
	                    "instead.");
	            }
	            return new DocumentReference(key, this._firestore);
	        }
	        else {
	            return value.value(options);
	        }
	    };
	    DocumentSnapshot.prototype.convertArray = function (data, options) {
	        var _this = this;
	        return data.internalValue.map(function (value) {
	            return _this.convertValue(value, options);
	        });
	    };
	    return DocumentSnapshot;
	}());
	var QueryDocumentSnapshot = /** @class */ (function (_super) {
	    __extends(QueryDocumentSnapshot, _super);
	    function QueryDocumentSnapshot(firestore, key, document, fromCache) {
	        return _super.call(this, firestore, key, document, fromCache) || this;
	    }
	    QueryDocumentSnapshot.prototype.data = function (options) {
	        var data = _super.prototype.data.call(this, options);
	        assert$1(typeof data === 'object', 'Document in a QueryDocumentSnapshot should exist');
	        return data;
	    };
	    return QueryDocumentSnapshot;
	}(DocumentSnapshot));
	var Query$1 = /** @class */ (function () {
	    function Query$$1(_query, firestore) {
	        this._query = _query;
	        this.firestore = firestore;
	    }
	    Query$$1.prototype.where = function (field, opStr, value) {
	        validateExactNumberOfArgs('Query.where', arguments, 3);
	        validateArgType('Query.where', 'string', 2, opStr);
	        validateDefined('Query.where', 3, value);
	        var fieldValue;
	        var fieldPath = fieldPathFromArgument('Query.where', field);
	        var relationOp = RelationOp.fromString(opStr);
	        if (fieldPath.isKeyField()) {
	            if (relationOp === RelationOp.ARRAY_CONTAINS) {
	                throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid Query. You can't perform array-contains queries on " +
	                    'FieldPath.documentId() since document IDs are not arrays.');
	            }
	            if (typeof value === 'string') {
	                if (value.indexOf('/') !== -1) {
	                    // TODO(dimond): Allow slashes once ancestor queries are supported
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, 'Function Query.where() requires its third parameter to be a ' +
	                        'valid document ID if the first parameter is ' +
	                        'FieldPath.documentId(), but it contains a slash.');
	                }
	                if (value === '') {
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, 'Function Query.where() requires its third parameter to be a ' +
	                        'valid document ID if the first parameter is ' +
	                        'FieldPath.documentId(), but it was an empty string.');
	                }
	                var path = this._query.path.child(new ResourcePath([value]));
	                assert$1(path.length % 2 === 0, 'Path should be a document key');
	                fieldValue = new RefValue(this.firestore._databaseId, new DocumentKey(path));
	            }
	            else if (value instanceof DocumentReference) {
	                var ref = value;
	                fieldValue = new RefValue(this.firestore._databaseId, ref._key);
	            }
	            else {
	                throw new FirestoreError(Code.INVALID_ARGUMENT, "Function Query.where() requires its third parameter to be a " +
	                    "string or a DocumentReference if the first parameter is " +
	                    "FieldPath.documentId(), but it was: " +
	                    (valueDescription(value) + "."));
	            }
	        }
	        else {
	            fieldValue = this.firestore._dataConverter.parseQueryValue('Query.where', value);
	        }
	        var filter = Filter.create(fieldPath, relationOp, fieldValue);
	        this.validateNewFilter(filter);
	        return new Query$$1(this._query.addFilter(filter), this.firestore);
	    };
	    Query$$1.prototype.orderBy = function (field, directionStr) {
	        validateBetweenNumberOfArgs('Query.orderBy', arguments, 1, 2);
	        validateOptionalArgType('Query.orderBy', 'string', 2, directionStr);
	        var direction;
	        if (directionStr === undefined || directionStr === 'asc') {
	            direction = Direction.ASCENDING;
	        }
	        else if (directionStr === 'desc') {
	            direction = Direction.DESCENDING;
	        }
	        else {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, "Function Query.orderBy() has unknown direction '" + directionStr + "', " +
	                "expected 'asc' or 'desc'.");
	        }
	        if (this._query.startAt !== null) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Invalid query. You must not call Query.startAt() or ' +
	                'Query.startAfter() before calling Query.orderBy().');
	        }
	        if (this._query.endAt !== null) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Invalid query. You must not call Query.endAt() or ' +
	                'Query.endBefore() before calling Query.orderBy().');
	        }
	        var fieldPath = fieldPathFromArgument('Query.orderBy', field);
	        var orderBy = new OrderBy(fieldPath, direction);
	        this.validateNewOrderBy(orderBy);
	        return new Query$$1(this._query.addOrderBy(orderBy), this.firestore);
	    };
	    Query$$1.prototype.limit = function (n) {
	        validateExactNumberOfArgs('Query.limit', arguments, 1);
	        validateArgType('Query.limit', 'number', 1, n);
	        if (n <= 0) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid Query. Query limit (" + n + ") is invalid. Limit must be " +
	                'positive.');
	        }
	        return new Query$$1(this._query.withLimit(n), this.firestore);
	    };
	    Query$$1.prototype.startAt = function (docOrField) {
	        var arguments$1 = arguments;

	        var fields = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            fields[_i - 1] = arguments$1[_i];
	        }
	        validateAtLeastNumberOfArgs('Query.startAt', arguments, 1);
	        var bound = this.boundFromDocOrFields('Query.startAt', docOrField, fields, 
	        /*before=*/ true);
	        return new Query$$1(this._query.withStartAt(bound), this.firestore);
	    };
	    Query$$1.prototype.startAfter = function (docOrField) {
	        var arguments$1 = arguments;

	        var fields = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            fields[_i - 1] = arguments$1[_i];
	        }
	        validateAtLeastNumberOfArgs('Query.startAfter', arguments, 1);
	        var bound = this.boundFromDocOrFields('Query.startAfter', docOrField, fields, 
	        /*before=*/ false);
	        return new Query$$1(this._query.withStartAt(bound), this.firestore);
	    };
	    Query$$1.prototype.endBefore = function (docOrField) {
	        var arguments$1 = arguments;

	        var fields = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            fields[_i - 1] = arguments$1[_i];
	        }
	        validateAtLeastNumberOfArgs('Query.endBefore', arguments, 1);
	        var bound = this.boundFromDocOrFields('Query.endBefore', docOrField, fields, 
	        /*before=*/ true);
	        return new Query$$1(this._query.withEndAt(bound), this.firestore);
	    };
	    Query$$1.prototype.endAt = function (docOrField) {
	        var arguments$1 = arguments;

	        var fields = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            fields[_i - 1] = arguments$1[_i];
	        }
	        validateAtLeastNumberOfArgs('Query.endAt', arguments, 1);
	        var bound = this.boundFromDocOrFields('Query.endAt', docOrField, fields, 
	        /*before=*/ false);
	        return new Query$$1(this._query.withEndAt(bound), this.firestore);
	    };
	    Query$$1.prototype.isEqual = function (other) {
	        if (!(other instanceof Query$$1)) {
	            throw invalidClassError('isEqual', 'Query', 1, other);
	        }
	        return (this.firestore === other.firestore && this._query.isEqual(other._query));
	    };
	    /** Helper function to create a bound from a document or fields */
	    Query$$1.prototype.boundFromDocOrFields = function (methodName, docOrField, fields, before) {
	        validateDefined(methodName, 1, docOrField);
	        if (docOrField instanceof DocumentSnapshot) {
	            if (fields.length > 0) {
	                throw new FirestoreError(Code.INVALID_ARGUMENT, "Too many arguments provided to " + methodName + "().");
	            }
	            var snap = docOrField;
	            if (!snap.exists) {
	                throw new FirestoreError(Code.NOT_FOUND, "Can't use a DocumentSnapshot that doesn't exist for " +
	                    (methodName + "()."));
	            }
	            return this.boundFromDocument(methodName, snap._document, before);
	        }
	        else {
	            var allFields = [docOrField].concat(fields);
	            return this.boundFromFields(methodName, allFields, before);
	        }
	    };
	    /**
	     * Create a Bound from a query and a document.
	     *
	     * Note that the Bound will always include the key of the document
	     * and so only the provided document will compare equal to the returned
	     * position.
	     *
	     * Will throw if the document does not contain all fields of the order by
	     * of the query.
	     */
	    Query$$1.prototype.boundFromDocument = function (methodName, doc, before) {
	        var this$1 = this;

	        var components = [];
	        // Because people expect to continue/end a query at the exact document
	        // provided, we need to use the implicit sort order rather than the explicit
	        // sort order, because it's guaranteed to contain the document key. That way
	        // the position becomes unambiguous and the query continues/ends exactly at
	        // the provided document. Without the key (by using the explicit sort
	        // orders), multiple documents could match the position, yielding duplicate
	        // results.
	        for (var _i = 0, _a = this._query.orderBy; _i < _a.length; _i++) {
	            var orderBy = _a[_i];
	            if (orderBy.field.isKeyField()) {
	                components.push(new RefValue(this$1.firestore._databaseId, doc.key));
	            }
	            else {
	                var value = doc.field(orderBy.field);
	                if (value !== undefined) {
	                    components.push(value);
	                }
	                else {
	                    var field = orderBy.field.canonicalString();
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid query. You are trying to start or end a query using a " +
	                        ("document for which the field '" + field + "' (used as the ") +
	                        "orderBy) does not exist.");
	                }
	            }
	        }
	        return new Bound(components, before);
	    };
	    /**
	     * Converts a list of field values to a Bound for the given query.
	     */
	    Query$$1.prototype.boundFromFields = function (methodName, values, before) {
	        var this$1 = this;

	        // Use explicit order by's because it has to match the query the user made
	        var orderBy = this._query.explicitOrderBy;
	        if (values.length > orderBy.length) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, "Too many arguments provided to " + methodName + "(). " +
	                "The number of arguments must be less than or equal to the " +
	                "number of Query.orderBy() clauses");
	        }
	        var components = [];
	        for (var i = 0; i < values.length; i++) {
	            var rawValue = values[i];
	            var orderByComponent = orderBy[i];
	            if (orderByComponent.field.isKeyField()) {
	                if (typeof rawValue !== 'string') {
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid query. Expected a string for document ID in " +
	                        (methodName + "(), but got a " + typeof rawValue));
	                }
	                if (rawValue.indexOf('/') !== -1) {
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid query. Document ID '" + rawValue + "' contains a slash in " +
	                        (methodName + "()"));
	                }
	                var key = new DocumentKey(this$1._query.path.child(rawValue));
	                components.push(new RefValue(this$1.firestore._databaseId, key));
	            }
	            else {
	                var wrapped = this$1.firestore._dataConverter.parseQueryValue(methodName, rawValue);
	                components.push(wrapped);
	            }
	        }
	        return new Bound(components, before);
	    };
	    Query$$1.prototype.onSnapshot = function () {
	        var arguments$1 = arguments;

	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments$1[_i];
	        }
	        validateBetweenNumberOfArgs('Query.onSnapshot', arguments, 1, 4);
	        var options = {};
	        var observer;
	        var currArg = 0;
	        if (typeof args[currArg] === 'object' &&
	            !isPartialObserver(args[currArg])) {
	            options = args[currArg];
	            validateOptionNames('Query.onSnapshot', options, [
	                'includeMetadataChanges'
	            ]);
	            validateNamedOptionalType('Query.onSnapshot', 'boolean', 'includeMetadataChanges', options.includeMetadataChanges);
	            currArg++;
	        }
	        if (isPartialObserver(args[currArg])) {
	            observer = args[currArg];
	        }
	        else {
	            validateArgType('Query.onSnapshot', 'function', currArg, args[currArg]);
	            validateOptionalArgType('Query.onSnapshot', 'function', currArg + 1, args[currArg + 1]);
	            validateOptionalArgType('Query.onSnapshot', 'function', currArg + 2, args[currArg + 2]);
	            observer = {
	                next: args[currArg],
	                error: args[currArg + 1],
	                complete: args[currArg + 2]
	            };
	        }
	        return this.onSnapshotInternal(options, observer);
	    };
	    Query$$1.prototype.onSnapshotInternal = function (options, observer) {
	        var _this = this;
	        var errHandler = function (err) {
	            console.error('Uncaught Error in onSnapshot:', err);
	        };
	        if (observer.error) {
	            errHandler = observer.error.bind(observer);
	        }
	        var asyncObserver = new AsyncObserver({
	            next: function (result) {
	                if (observer.next) {
	                    observer.next(new QuerySnapshot(_this.firestore, _this._query, result));
	                }
	            },
	            error: errHandler
	        });
	        var firestoreClient = this.firestore.ensureClientConfigured();
	        var internalListener = firestoreClient.listen(this._query, asyncObserver, options);
	        return function () {
	            asyncObserver.mute();
	            firestoreClient.unlisten(internalListener);
	        };
	    };
	    Query$$1.prototype.get = function (options) {
	        var _this = this;
	        validateBetweenNumberOfArgs('Query.get', arguments, 0, 1);
	        return new Promise(function (resolve, reject) {
	            if (options && options.source === 'cache') {
	                _this.firestore
	                    .ensureClientConfigured()
	                    .getDocumentsFromLocalCache(_this._query)
	                    .then(function (viewSnap) {
	                    resolve(new QuerySnapshot(_this.firestore, _this._query, viewSnap));
	                }, reject);
	            }
	            else {
	                _this.getViaSnapshotListener(resolve, reject, options);
	            }
	        });
	    };
	    Query$$1.prototype.getViaSnapshotListener = function (resolve, reject, options) {
	        var unlisten = this.onSnapshotInternal({
	            includeMetadataChanges: true,
	            waitForSyncWhenOnline: true
	        }, {
	            next: function (result) {
	                // Remove query first before passing event to user to avoid
	                // user actions affecting the now stale query.
	                unlisten();
	                if (result.metadata.fromCache &&
	                    options &&
	                    options.source === 'server') {
	                    reject(new FirestoreError(Code.UNAVAILABLE, 'Failed to get documents from server. (However, these ' +
	                        'documents may exist in the local cache. Run again ' +
	                        'without setting source to "server" to ' +
	                        'retrieve the cached documents.)'));
	                }
	                else {
	                    resolve(result);
	                }
	            },
	            error: reject
	        });
	    };
	    Query$$1.prototype.validateNewFilter = function (filter) {
	        if (filter instanceof RelationFilter) {
	            if (filter.isInequality()) {
	                var existingField = this._query.getInequalityFilterField();
	                if (existingField !== null && !existingField.isEqual(filter.field)) {
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, 'Invalid query. All where filters with an inequality' +
	                        ' (<, <=, >, or >=) must be on the same field. But you have' +
	                        (" inequality filters on '" + existingField.toString() + "'") +
	                        (" and '" + filter.field.toString() + "'"));
	                }
	                var firstOrderByField = this._query.getFirstOrderByField();
	                if (firstOrderByField !== null) {
	                    this.validateOrderByAndInequalityMatch(filter.field, firstOrderByField);
	                }
	            }
	            else if (filter.op === RelationOp.ARRAY_CONTAINS) {
	                if (this._query.hasArrayContainsFilter()) {
	                    throw new FirestoreError(Code.INVALID_ARGUMENT, 'Invalid query. Queries only support a single array-contains ' +
	                        'filter.');
	                }
	            }
	        }
	    };
	    Query$$1.prototype.validateNewOrderBy = function (orderBy) {
	        if (this._query.getFirstOrderByField() === null) {
	            // This is the first order by. It must match any inequality.
	            var inequalityField = this._query.getInequalityFilterField();
	            if (inequalityField !== null) {
	                this.validateOrderByAndInequalityMatch(inequalityField, orderBy.field);
	            }
	        }
	    };
	    Query$$1.prototype.validateOrderByAndInequalityMatch = function (inequality, orderBy) {
	        if (!orderBy.isEqual(inequality)) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid query. You have a where filter with an inequality " +
	                ("(<, <=, >, or >=) on field '" + inequality.toString() + "' ") +
	                ("and so you must also use '" + inequality.toString() + "' ") +
	                "as your first Query.orderBy(), but your first Query.orderBy() " +
	                ("is on field '" + orderBy.toString() + "' instead."));
	        }
	    };
	    return Query$$1;
	}());
	var QuerySnapshot = /** @class */ (function () {
	    function QuerySnapshot(_firestore, _originalQuery, _snapshot) {
	        this._firestore = _firestore;
	        this._originalQuery = _originalQuery;
	        this._snapshot = _snapshot;
	        this._cachedChanges = null;
	        this._cachedChangesIncludeMetadataChanges = null;
	        this.metadata = new SnapshotMetadata(_snapshot.hasPendingWrites, _snapshot.fromCache);
	    }
	    Object.defineProperty(QuerySnapshot.prototype, "docs", {
	        get: function () {
	            var result = [];
	            this.forEach(function (doc) { return result.push(doc); });
	            return result;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(QuerySnapshot.prototype, "empty", {
	        get: function () {
	            return this._snapshot.docs.isEmpty();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(QuerySnapshot.prototype, "size", {
	        get: function () {
	            return this._snapshot.docs.size;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    QuerySnapshot.prototype.forEach = function (callback, thisArg) {
	        var _this = this;
	        validateBetweenNumberOfArgs('QuerySnapshot.forEach', arguments, 1, 2);
	        validateArgType('QuerySnapshot.forEach', 'function', 1, callback);
	        this._snapshot.docs.forEach(function (doc) {
	            callback.call(thisArg, _this.convertToDocumentImpl(doc));
	        });
	    };
	    Object.defineProperty(QuerySnapshot.prototype, "query", {
	        get: function () {
	            return new Query$1(this._originalQuery, this._firestore);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    QuerySnapshot.prototype.docChanges = function (options) {
	        validateOptionNames('QuerySnapshot.docChanges', options, [
	            'includeMetadataChanges'
	        ]);
	        if (options) {
	            validateNamedOptionalType('QuerySnapshot.docChanges', 'boolean', 'includeMetadataChanges', options.includeMetadataChanges);
	        }
	        var includeMetadataChanges = options && options.includeMetadataChanges;
	        if (includeMetadataChanges && this._snapshot.excludesMetadataChanges) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'To include metadata changes with your document changes, you must ' +
	                'also pass { includeMetadataChanges:true } to onSnapshot().');
	        }
	        if (!this._cachedChanges ||
	            this._cachedChangesIncludeMetadataChanges !== includeMetadataChanges) {
	            this._cachedChanges = changesFromSnapshot(this._firestore, includeMetadataChanges, this._snapshot);
	            this._cachedChangesIncludeMetadataChanges = includeMetadataChanges;
	        }
	        return this._cachedChanges;
	    };
	    /** Check the equality. The call can be very expensive. */
	    QuerySnapshot.prototype.isEqual = function (other) {
	        if (!(other instanceof QuerySnapshot)) {
	            throw invalidClassError('isEqual', 'QuerySnapshot', 1, other);
	        }
	        return (this._firestore === other._firestore &&
	            this._originalQuery.isEqual(other._originalQuery) &&
	            this._snapshot.isEqual(other._snapshot));
	    };
	    QuerySnapshot.prototype.convertToDocumentImpl = function (doc) {
	        return new QueryDocumentSnapshot(this._firestore, doc.key, doc, this.metadata.fromCache);
	    };
	    return QuerySnapshot;
	}());
	// TODO(2018/11/01): As of 2018/04/17 we're changing docChanges from an array
	// into a method. Because this is a runtime breaking change and somewhat subtle
	// (both Array and Function have a .length, etc.), we'll replace commonly-used
	// properties (including Symbol.iterator) to throw a custom error message. In
	// ~6 months we can delete the custom error as most folks will have hopefully
	// migrated.
	function throwDocChangesMethodError() {
	    throw new FirestoreError(Code.INVALID_ARGUMENT, 'QuerySnapshot.docChanges has been changed from a property into a ' +
	        'method, so usages like "querySnapshot.docChanges" should become ' +
	        '"querySnapshot.docChanges()"');
	}
	var docChangesPropertiesToOverride = [
	    'length',
	    'forEach',
	    'map'
	].concat((typeof Symbol !== 'undefined' ? [Symbol.iterator] : []));
	docChangesPropertiesToOverride.forEach(function (property) {
	    /**
	     * We are (re-)defining properties on QuerySnapshot.prototype.docChanges which
	     * is a Function. This could fail, in particular in the case of 'length' which
	     * already exists on Function.prototype and on IE11 is improperly defined with
	     * `{ configurable: false }`. So we wrap this in a try/catch to ensure that we
	     * still have a functional SDK.
	     */
	    try {
	        Object.defineProperty(QuerySnapshot.prototype.docChanges, property, {
	            get: function () { return throwDocChangesMethodError(); }
	        });
	    }
	    catch (err) { } // Ignore this failure intentionally
	});
	var CollectionReference = /** @class */ (function (_super) {
	    __extends(CollectionReference, _super);
	    function CollectionReference(path, firestore) {
	        var _this = _super.call(this, Query.atPath(path), firestore) || this;
	        if (path.length % 2 !== 1) {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Invalid collection reference. Collection ' +
	                'references must have an odd number of segments, but ' +
	                (path.canonicalString() + " has " + path.length));
	        }
	        return _this;
	    }
	    Object.defineProperty(CollectionReference.prototype, "id", {
	        get: function () {
	            return this._query.path.lastSegment();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CollectionReference.prototype, "parent", {
	        get: function () {
	            var parentPath = this._query.path.popLast();
	            if (parentPath.isEmpty()) {
	                return null;
	            }
	            else {
	                return new DocumentReference(new DocumentKey(parentPath), this.firestore);
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CollectionReference.prototype, "path", {
	        get: function () {
	            return this._query.path.canonicalString();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    CollectionReference.prototype.doc = function (pathString) {
	        validateBetweenNumberOfArgs('CollectionReference.doc', arguments, 0, 1);
	        // We allow omission of 'pathString' but explicitly prohibit passing in both
	        // 'undefined' and 'null'.
	        if (arguments.length === 0) {
	            pathString = AutoId.newId();
	        }
	        validateArgType('CollectionReference.doc', 'string', 1, pathString);
	        if (pathString === '') {
	            throw new FirestoreError(Code.INVALID_ARGUMENT, 'Document path must be a non-empty string');
	        }
	        var path = ResourcePath.fromString(pathString);
	        return DocumentReference.forPath(this._query.path.child(path), this.firestore);
	    };
	    CollectionReference.prototype.add = function (value) {
	        validateExactNumberOfArgs('CollectionReference.add', arguments, 1);
	        validateArgType('CollectionReference.add', 'object', 1, value);
	        var docRef = this.doc();
	        return docRef.set(value).then(function () { return docRef; });
	    };
	    return CollectionReference;
	}(Query$1));
	function validateSetOptions(methodName, options) {
	    if (options === undefined) {
	        return {
	            merge: false
	        };
	    }
	    validateOptionNames(methodName, options, ['merge', 'mergeFields']);
	    validateNamedOptionalType(methodName, 'boolean', 'merge', options.merge);
	    validateOptionalArrayElements(methodName, 'mergeFields', 'a string or a FieldPath', options.mergeFields, function (element) {
	        return typeof element === 'string' || element instanceof FieldPath$1;
	    });
	    if (options.mergeFields !== undefined && options.merge !== undefined) {
	        throw new FirestoreError(Code.INVALID_ARGUMENT, "Invalid options passed to function " + methodName + "(): You cannot specify both \"merge\" and \"mergeFields\".");
	    }
	    return options;
	}
	function validateSnapshotOptions(methodName, options) {
	    if (options === undefined) {
	        return {};
	    }
	    validateOptionNames(methodName, options, ['serverTimestamps']);
	    validateNamedOptionalPropertyEquals(methodName, 'options', 'serverTimestamps', options.serverTimestamps, ['estimate', 'previous', 'none']);
	    return options;
	}
	function validateReference(methodName, documentRef, firestore) {
	    if (!(documentRef instanceof DocumentReference)) {
	        throw invalidClassError(methodName, 'DocumentReference', 1, documentRef);
	    }
	    else if (documentRef.firestore !== firestore) {
	        throw new FirestoreError(Code.INVALID_ARGUMENT, 'Provided document reference is from a different Firestore instance.');
	    }
	    else {
	        return documentRef;
	    }
	}
	/**
	 * Calculates the array of firestore.DocumentChange's for a given ViewSnapshot.
	 *
	 * Exported for testing.
	 */
	function changesFromSnapshot(firestore, includeMetadataChanges, snapshot) {
	    if (snapshot.oldDocs.isEmpty()) {
	        // Special case the first snapshot because index calculation is easy and
	        // fast
	        var lastDoc_1;
	        var index_1 = 0;
	        return snapshot.docChanges.map(function (change) {
	            var doc = new QueryDocumentSnapshot(firestore, change.doc.key, change.doc, snapshot.fromCache);
	            assert$1(change.type === ChangeType.Added, 'Invalid event type for first snapshot');
	            assert$1(!lastDoc_1 || snapshot.query.docComparator(lastDoc_1, change.doc) < 0, 'Got added events in wrong order');
	            lastDoc_1 = change.doc;
	            return {
	                type: 'added',
	                doc: doc,
	                oldIndex: -1,
	                newIndex: index_1++
	            };
	        });
	    }
	    else {
	        // A DocumentSet that is updated incrementally as changes are applied to use
	        // to lookup the index of a document.
	        var indexTracker_1 = snapshot.oldDocs;
	        return snapshot.docChanges
	            .filter(function (change) { return includeMetadataChanges || change.type !== ChangeType.Metadata; })
	            .map(function (change) {
	            var doc = new QueryDocumentSnapshot(firestore, change.doc.key, change.doc, snapshot.fromCache);
	            var oldIndex = -1;
	            var newIndex = -1;
	            if (change.type !== ChangeType.Added) {
	                oldIndex = indexTracker_1.indexOf(change.doc.key);
	                assert$1(oldIndex >= 0, 'Index for document not found');
	                indexTracker_1 = indexTracker_1.delete(change.doc.key);
	            }
	            if (change.type !== ChangeType.Removed) {
	                indexTracker_1 = indexTracker_1.add(change.doc);
	                newIndex = indexTracker_1.indexOf(change.doc.key);
	            }
	            return { type: resultChangeType(change.type), doc: doc, oldIndex: oldIndex, newIndex: newIndex };
	        });
	    }
	}
	function resultChangeType(type) {
	    switch (type) {
	        case ChangeType.Added:
	            return 'added';
	        case ChangeType.Modified:
	        case ChangeType.Metadata:
	            return 'modified';
	        case ChangeType.Removed:
	            return 'removed';
	        default:
	            return fail('Unknown change type: ' + type);
	    }
	}
	// Export the classes with a private constructor (it will fail if invoked
	// at runtime). Note that this still allows instanceof checks.
	// We're treating the variables as class names, so disable checking for lower
	// case variable names.
	// tslint:disable:variable-name
	var PublicFirestore = makeConstructorPrivate(Firestore, 'Use firebase.firestore() instead.');
	var PublicTransaction = makeConstructorPrivate(Transaction$1, 'Use firebase.firestore().runTransaction() instead.');
	var PublicWriteBatch = makeConstructorPrivate(WriteBatch, 'Use firebase.firestore().batch() instead.');
	var PublicDocumentReference = makeConstructorPrivate(DocumentReference, 'Use firebase.firestore().doc() instead.');
	var PublicDocumentSnapshot = makeConstructorPrivate(DocumentSnapshot);
	var PublicQueryDocumentSnapshot = makeConstructorPrivate(QueryDocumentSnapshot);
	var PublicQuery = makeConstructorPrivate(Query$1);
	var PublicQuerySnapshot = makeConstructorPrivate(QuerySnapshot);
	var PublicCollectionReference = makeConstructorPrivate(CollectionReference, 'Use firebase.firestore().collection() instead.');
	// tslint:enable:variable-name

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var firestoreNamespace = {
	    Firestore: PublicFirestore,
	    GeoPoint: GeoPoint,
	    Timestamp: Timestamp,
	    Blob: PublicBlob,
	    Transaction: PublicTransaction,
	    WriteBatch: PublicWriteBatch,
	    DocumentReference: PublicDocumentReference,
	    DocumentSnapshot: PublicDocumentSnapshot,
	    Query: PublicQuery,
	    QueryDocumentSnapshot: PublicQueryDocumentSnapshot,
	    QuerySnapshot: PublicQuerySnapshot,
	    CollectionReference: PublicCollectionReference,
	    FieldPath: FieldPath$1,
	    FieldValue: PublicFieldValue,
	    setLogLevel: Firestore.setLogLevel
	};
	/**
	 * Configures Firestore as part of the Firebase SDK by calling registerService.
	 */
	function configureForFirebase(firebase$$1) {
	    firebase$$1.INTERNAL.registerService('firestore', function (app) { return new Firestore(app); }, shallowCopy(firestoreNamespace));
	}

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	function registerFirestore(instance) {
	    configureForFirebase(instance);
	}
	registerFirestore(firebase);

	/**
	 * Copyright 2017 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	// import 'firebase/auth';

	var Firebase = {
	    db: null,
	    auth: null,

	    init: function init(config) {
	        firebase.initializeApp(config);
	        this.db = firebase.firestore();
	        // this.auth = firebase.auth();
	    }
	};

	var FIREBASE_CONFIG = {
	    projectId: 'egg-profiles',
	    apikey: 'AIzaSyB8lThKBHmL3dHARvI8mxA8WgGYDBYH4v4',
	    authDomain: 'egg-profiles.firebaseapp.com',
	    databaseURL: 'https://egg-profiles.firebaseio.com/',
	    storageBucket: 'egg-profiles.appspot.com',
	    messagingSenderId: '356833125001',
	};

	var Layout = {
	    view: function view(ref) {
	        var children = ref.children;

	        return mithril('.clearfix', [
	            mithril('a.mx3', { href: '/' }, 'dash'),
	            mithril('a.mx3', { href: '/profiles' }, 'profiles'),

	            children
	        ]);
	    }
	};

	var stream = createCommonjsModule(function (module) {
	(function() {
	/* eslint-enable */

	var guid = 0, HALT = {};
	function createStream() {
		function stream() {
			if (arguments.length > 0 && arguments[0] !== HALT) { updateStream(stream, arguments[0]); }
			return stream._state.value
		}
		initStream(stream);

		if (arguments.length > 0 && arguments[0] !== HALT) { updateStream(stream, arguments[0]); }

		return stream
	}
	function initStream(stream) {
		stream.constructor = createStream;
		stream._state = {id: guid++, value: undefined, state: 0, derive: undefined, recover: undefined, deps: {}, parents: [], endStream: undefined, unregister: undefined};
		stream.map = stream["fantasy-land/map"] = map, stream["fantasy-land/ap"] = ap, stream["fantasy-land/of"] = createStream;
		stream.valueOf = valueOf, stream.toJSON = toJSON, stream.toString = valueOf;

		Object.defineProperties(stream, {
			end: {get: function() {
				if (!stream._state.endStream) {
					var endStream = createStream();
					endStream.map(function(value) {
						if (value === true) {
							unregisterStream(stream);
							endStream._state.unregister = function(){unregisterStream(endStream);};
						}
						return value
					});
					stream._state.endStream = endStream;
				}
				return stream._state.endStream
			}}
		});
	}
	function updateStream(stream, value) {
		updateState(stream, value);
		for (var id in stream._state.deps) { updateDependency(stream._state.deps[id], false); }
		if (stream._state.unregister != null) { stream._state.unregister(); }
		finalize(stream);
	}
	function updateState(stream, value) {
		stream._state.value = value;
		stream._state.changed = true;
		if (stream._state.state !== 2) { stream._state.state = 1; }
	}
	function updateDependency(stream, mustSync) {
		var state = stream._state, parents = state.parents;
		if (parents.length > 0 && parents.every(active) && (mustSync || parents.some(changed))) {
			var value = stream._state.derive();
			if (value === HALT) { return false }
			updateState(stream, value);
		}
	}
	function finalize(stream) {
		stream._state.changed = false;
		for (var id in stream._state.deps) { stream._state.deps[id]._state.changed = false; }
	}

	function combine(fn, streams) {
		if (!streams.every(valid)) { throw new Error("Ensure that each item passed to stream.combine/stream.merge is a stream") }
		return initDependency(createStream(), streams, function() {
			return fn.apply(this, streams.concat([streams.filter(changed)]))
		})
	}

	function initDependency(dep, streams, derive) {
		var state = dep._state;
		state.derive = derive;
		state.parents = streams.filter(notEnded);

		registerDependency(dep, state.parents);
		updateDependency(dep, true);

		return dep
	}
	function registerDependency(stream, parents) {
		for (var i = 0; i < parents.length; i++) {
			parents[i]._state.deps[stream._state.id] = stream;
			registerDependency(stream, parents[i]._state.parents);
		}
	}
	function unregisterStream(stream) {
		for (var i = 0; i < stream._state.parents.length; i++) {
			var parent = stream._state.parents[i];
			delete parent._state.deps[stream._state.id];
		}
		for (var id in stream._state.deps) {
			var dependent = stream._state.deps[id];
			var index = dependent._state.parents.indexOf(stream);
			if (index > -1) { dependent._state.parents.splice(index, 1); }
		}
		stream._state.state = 2; //ended
		stream._state.deps = {};
	}

	function map(fn) {return combine(function(stream) {return fn(stream())}, [this])}
	function ap(stream) {return combine(function(s1, s2) {return s1()(s2())}, [stream, this])}
	function valueOf() {return this._state.value}
	function toJSON() {return this._state.value != null && typeof this._state.value.toJSON === "function" ? this._state.value.toJSON() : this._state.value}

	function valid(stream) {return stream._state }
	function active(stream) {return stream._state.state === 1}
	function changed(stream) {return stream._state.changed}
	function notEnded(stream) {return stream._state.state !== 2}

	function merge(streams) {
		return combine(function() {
			return streams.map(function(s) {return s()})
		}, streams)
	}

	function scan(reducer, seed, stream) {
		var newStream = combine(function (s) {
			return seed = reducer(seed, s._state.value)
		}, [stream]);

		if (newStream._state.state === 0) { newStream(seed); }

		return newStream
	}

	function scanMerge(tuples, seed) {
		var streams = tuples.map(function(tuple) {
			var stream = tuple[0];
			if (stream._state.state === 0) { stream(undefined); }
			return stream
		});

		var newStream = combine(function() {
			var changed = arguments[arguments.length - 1];

			streams.forEach(function(stream, idx) {
				if (changed.indexOf(stream) > -1) {
					seed = tuples[idx][1](seed, stream._state.value);
				}
			});

			return seed
		}, streams);

		return newStream
	}

	createStream["fantasy-land/of"] = createStream;
	createStream.merge = merge;
	createStream.combine = combine;
	createStream.scan = scan;
	createStream.scanMerge = scanMerge;
	createStream.HALT = HALT;

	{ module["exports"] = createStream; }

	}());
	});

	var stream$1 = stream;

	var SignUpForm = {
	    email: null,
	    pwd: null,
	    confirmPwd: null,

	    isFormValid: null,
	    message: null,
	    
	    oninit: function oninit(ref) {
	        var state = ref.state;

	        state.email = stream$1('');
	        state.pwd = stream$1('');
	        state.confirmPwd = stream$1('');

	        state.isFormValid = stream$1.combine(function (email, pwd, confirmPwd) {
	            return  (email() && pwd() && confirmPwd())
	                && (pwd() === confirmPwd())
	            ;
	        }, [state.email, state.pwd, state.confirmPwd]);

	        state.message = stream$1.combine(function (email, pwd, confirmPwd) {
	            if (!email() && !pwd() && !confirmPwd())
	                { return null; }
	            if (!email())
	                { return 'Please enter valid email address.'; }
	            if (!pwd())
	                { return 'Please enter password'; }
	            if (!confirmPwd())
	                { return 'Please confirm password'; }
	            if (confirmPwd() !== pwd())
	                { return 'Passwords must match.'; }

	            return null;
	        }, [state.email, state.pwd, state.confirmPwd]);
	    },

	    view: function view(ref) {
	        var state = ref.state;

	        return [
	            mithril('h3', 'Sign Up'),

	            mithril('label', 'email:'),
	            mithril('input.input.bg-black.white.my1', {
	                placeholder: 'joe@website.com',
	                oninput: mithril.withAttr('value', state.email)
	            }),

	            mithril('label', 'password:'),
	            mithril('input.input.bg-black.white.my1', {
	                type: 'password',
	                oninput: mithril.withAttr('value', state.pwd)
	            }),

	            mithril('label', 'confirm password:'),
	            mithril('input.input.bg-black.white.my1', {
	                type: 'password',
	                oninput: mithril.withAttr('value', state.confirmPwd)
	            }),

	            state.message()
	                ? mithril('p.p2.rounded.bg-lighten', state.message())
	                : null
	            ,

	            mithril('button.btn.btn-outline.my1', {
	                onclick: function () { return signUpAction(state.email(), state.pwd()); },
	                disabled: !state.isFormValid()
	            }, 'Submit')
	        ];
	    }
	};

	function signUpAction(email, pwd) {
	    console.log('email', email);
	    console.log('pwd', pwd);
	}

	var SignInForm = {
	    email: null,
	    pwd: null,
	    
	    oninit: function oninit(ref) {
	        var state = ref.state;

	        state.email = stream$1('');
	        state.pwd = stream$1('');
	    },

	    view: function view(ref) {
	        var state = ref.state;

	        return [
	            mithril('h3', 'Sign In'),

	            mithril('label', 'email:'),
	            mithril('input.input.bg-black.white.my1', {
	                placeholder: 'joe@website.com',
	                oninput: mithril.withAttr('value', state.email)
	            }),

	            mithril('label', 'password:'),
	            mithril('input.input.bg-black.white.my1', {
	                type: 'password',
	                oninput: mithril.withAttr('value', state.pwd)
	            })
	        ];
	    }
	};

	var Index = {
	    view: function view() {
	        return [
	            mithril('p', 'index page'),
	            mithril(SignUpForm),
	            mithril(SignInForm)
	        ];
	    }
	};

	var Profiles = {
	    view: function view() {
	        return mithril('p', 'this is the profiles page');
	    }
	};

	Firebase.init(FIREBASE_CONFIG);
	mithril.route.prefix('');

	mithril.route(document.getElementById('app'), '/', {
	    '/': {
	        render: function () { return mithril(Layout, mithril(Index)); }
	    },

	    '/profiles': {
	        render: function () { return mithril(Layout, mithril(Profiles)); }
	    }
	});

}());
