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

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	function _extendableBuiltin(cls) {
	  function ExtendableBuiltin() {
	    var instance = Reflect.construct(cls, Array.from(arguments));
	    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
	    return instance;
	  }

	  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
	    constructor: {
	      value: cls,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });

	  if (Object.setPrototypeOf) {
	    Object.setPrototypeOf(ExtendableBuiltin, cls);
	  } else {
	    ExtendableBuiltin.__proto__ = cls;
	  }

	  return ExtendableBuiltin;
	}

	var FunctionTreeError = function (_extendableBuiltin2) {
	  _inherits(FunctionTreeError, _extendableBuiltin2);

	  function FunctionTreeError(error) {
	    _classCallCheck(this, FunctionTreeError);

	    var _this = _possibleConstructorReturn(this, (FunctionTreeError.__proto__ || Object.getPrototypeOf(FunctionTreeError)).call(this, error.message || error));

	    _this.name = 'FunctionTreeError';
	    return _this;
	  }

	  _createClass(FunctionTreeError, [{
	    key: 'toJSON',
	    value: function toJSON() {
	      return {
	        name: this.name,
	        message: this.message,
	        stack: this.stack
	      };
	    }
	  }]);

	  return FunctionTreeError;
	}(_extendableBuiltin(Error));

	var FunctionTreeExecutionError = function (_FunctionTreeError) {
	  _inherits(FunctionTreeExecutionError, _FunctionTreeError);

	  function FunctionTreeExecutionError(execution, funcDetails, payload, error) {
	    _classCallCheck(this, FunctionTreeExecutionError);

	    var _this2 = _possibleConstructorReturn(this, (FunctionTreeExecutionError.__proto__ || Object.getPrototypeOf(FunctionTreeExecutionError)).call(this, error));

	    _this2.name = 'FunctionTreeExecutionError';
	    _this2.execution = execution;
	    _this2.funcDetails = funcDetails;
	    _this2.payload = payload;
	    return _this2;
	  }

	  _createClass(FunctionTreeExecutionError, [{
	    key: 'toJSON',
	    value: function toJSON() {
	      return {
	        name: this.name,
	        message: this.message,
	        execution: {
	          name: this.execution.name
	        },
	        funcDetails: {
	          name: this.funcDetails.name,
	          functionIndex: this.funcDetails.functionIndex
	        },
	        payload: this.payload,
	        stack: this.stack
	      };
	    }
	  }]);

	  return FunctionTreeExecutionError;
	}(FunctionTreeError);
	//# sourceMappingURL=errors.js.map

	var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Primitive = function () {
	  function Primitive(type) {
	    _classCallCheck$1(this, Primitive);

	    this.type = type;

	    if (typeof (arguments.length <= 1 ? undefined : arguments[1]) === 'string') {
	      this.name = arguments.length <= 1 ? undefined : arguments[1];
	      this.items = arguments.length <= 2 ? undefined : arguments[2];
	    } else {
	      this.name = null;
	      this.items = arguments.length <= 1 ? undefined : arguments[1];
	    }

	    if (!Array.isArray(this.items)) {
	      throw new FunctionTreeError('You have not passed an array of functions to ' + type);
	    }
	  }

	  _createClass$1(Primitive, [{
	    key: 'toJSON',
	    value: function toJSON() {
	      return {
	        name: this.name,
	        _functionTreePrimitive: true,
	        type: this.type,
	        items: this.items
	      };
	    }
	  }]);

	  return Primitive;
	}();

	var Sequence = function (_Primitive) {
	  _inherits$1(Sequence, _Primitive);

	  function Sequence() {
	    var arguments$1 = arguments;

	    var _ref;

	    _classCallCheck$1(this, Sequence);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments$1[_key];
	    }

	    return _possibleConstructorReturn$1(this, (_ref = Sequence.__proto__ || Object.getPrototypeOf(Sequence)).call.apply(_ref, [this, 'sequence'].concat(args)));
	  }

	  return Sequence;
	}(Primitive);

	var Parallel = function (_Primitive2) {
	  _inherits$1(Parallel, _Primitive2);

	  function Parallel() {
	    var arguments$1 = arguments;

	    var _ref2;

	    _classCallCheck$1(this, Parallel);

	    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments$1[_key2];
	    }

	    return _possibleConstructorReturn$1(this, (_ref2 = Parallel.__proto__ || Object.getPrototypeOf(Parallel)).call.apply(_ref2, [this, 'parallel'].concat(args)));
	  }

	  return Parallel;
	}(Primitive);
	//# sourceMappingURL=primitives.js.map

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function getFunctionName(fn) {
	  if (fn.displayName) { return fn.displayName; }
	  if (fn.name) { return fn.name; }

	  var ret = fn.toString();

	  var startNameMatch = void 0;
	  if (ret.indexOf('async function') === 0) { startNameMatch = 'async function '; }else if (ret.indexOf('function') === 0) { startNameMatch = 'function '; }

	  ret = ret.substr(startNameMatch ? startNameMatch.length : 0);
	  ret = ret.substr(0, ret.indexOf('('));

	  return ret;
	}

	function isPaths(item) {
	  return item && !Array.isArray(item) && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && !(item instanceof Primitive);
	}

	function stringifyInvalidTreeItem(items, invalidItem) {
	  return '\n[\n' + items.map(function (item) {
	    if (item === invalidItem) {
	      return '  ' + (typeof invalidItem === 'undefined' ? 'undefined' : _typeof(invalidItem)) + ', <-- PROBLEM';
	    }
	    if (typeof item === 'function') {
	      return '  ' + getFunctionName(item) + ',';
	    }
	    if (item instanceof Primitive) {
	      return '  [ ' + item.type.toUpperCase() + ' ],';
	    }
	    if (Array.isArray(item)) {
	      return '  [ SEQUENCE ],';
	    }

	    return '  { PATHS },';
	  }).join('\n') + '\n]\n  ';
	}

	function analyze(name, functions, item, isParallel) {
	  if (item instanceof Primitive) {
	    var instance = item.toJSON();

	    return Object.assign(instance, {
	      items: analyze(name, functions, instance.items, item instanceof Parallel).items
	    });
	  } else if (Array.isArray(item)) {
	    return new Sequence(item.reduce(function (allItems, subItem, index) {
	      if (subItem instanceof Primitive) {
	        var _instance = subItem.toJSON();

	        return allItems.concat(Object.assign(_instance, {
	          items: analyze(name, functions, _instance.items, subItem instanceof Parallel).items
	        }));
	      } else if (typeof subItem === 'function') {
	        var funcDetails = {
	          name: subItem.displayName || getFunctionName(subItem),
	          functionIndex: functions.push(subItem) - 1,
	          function: subItem
	        };
	        var nextItem = item[index + 1];

	        if (isPaths(nextItem)) {
	          funcDetails.outputs = {};
	          Object.keys(nextItem).forEach(function (key) {
	            if (subItem.outputs && !~subItem.outputs.indexOf(key)) {
	              throw new FunctionTreeError('Outputs object doesn\'t match list of possible outputs defined for function.');
	            }
	            funcDetails.outputs[key] = analyze(name, functions, typeof nextItem[key] === 'function' ? [nextItem[key]] : nextItem[key]);
	          });
	        }

	        return allItems.concat(funcDetails);
	      } else if (isPaths(subItem)) {
	        return allItems;
	      } else if (Array.isArray(subItem)) {
	        var items = analyze(name, functions, subItem);

	        return allItems.concat(items);
	      } else {
	        throw new FunctionTreeError('Unexpected entry in "' + name + '". ' + stringifyInvalidTreeItem(item, subItem));
	      }
	    }, [])).toJSON();
	  } else {
	    throw new FunctionTreeError('Unexpected entry in tree');
	  }
	}

	var createStaticTree = (function (name, tree) {
	  var functions = [];

	  return analyze(name, functions, typeof tree === 'function' ? [tree] : tree);
	});
	//# sourceMappingURL=staticTree.js.map

	var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Path = function () {
	  function Path(path, payload) {
	    _classCallCheck$2(this, Path);

	    this.path = path;
	    this.payload = payload;
	  }

	  _createClass$2(Path, [{
	    key: "toJSON",
	    value: function toJSON() {
	      return {
	        path: this.path,
	        payload: this.payload,
	        _functionTreePath: true
	      };
	    }
	  }]);

	  return Path;
	}();
	//# sourceMappingURL=Path.js.map

	var eventemitter3 = createCommonjsModule(function (module) {

	var has = Object.prototype.hasOwnProperty
	  , prefix = '~';

	/**
	 * Constructor to create a storage for our `EE` objects.
	 * An `Events` instance is a plain object whose properties are event names.
	 *
	 * @constructor
	 * @api private
	 */
	function Events() {}

	//
	// We try to not inherit from `Object.prototype`. In some engines creating an
	// instance in this way is faster than calling `Object.create(null)` directly.
	// If `Object.create(null)` is not supported we prefix the event names with a
	// character to make sure that the built-in object properties are not
	// overridden or used as an attack vector.
	//
	if (Object.create) {
	  Events.prototype = Object.create(null);

	  //
	  // This hack is needed because the `__proto__` property is still inherited in
	  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
	  //
	  if (!new Events().__proto__) { prefix = false; }
	}

	/**
	 * Representation of a single event listener.
	 *
	 * @param {Function} fn The listener function.
	 * @param {Mixed} context The context to invoke the listener with.
	 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
	 * @constructor
	 * @api private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}

	/**
	 * Minimal `EventEmitter` interface that is molded against the Node.js
	 * `EventEmitter` interface.
	 *
	 * @constructor
	 * @api public
	 */
	function EventEmitter() {
	  this._events = new Events();
	  this._eventsCount = 0;
	}

	/**
	 * Return an array listing the events for which the emitter has registered
	 * listeners.
	 *
	 * @returns {Array}
	 * @api public
	 */
	EventEmitter.prototype.eventNames = function eventNames() {
	  var this$1 = this;

	  var names = []
	    , events
	    , name;

	  if (this._eventsCount === 0) { return names; }

	  for (name in (events = this$1._events)) {
	    if (has.call(events, name)) { names.push(prefix ? name.slice(1) : name); }
	  }

	  if (Object.getOwnPropertySymbols) {
	    return names.concat(Object.getOwnPropertySymbols(events));
	  }

	  return names;
	};

	/**
	 * Return the listeners registered for a given event.
	 *
	 * @param {String|Symbol} event The event name.
	 * @param {Boolean} exists Only check if there are listeners.
	 * @returns {Array|Boolean}
	 * @api public
	 */
	EventEmitter.prototype.listeners = function listeners(event, exists) {
	  var evt = prefix ? prefix + event : event
	    , available = this._events[evt];

	  if (exists) { return !!available; }
	  if (!available) { return []; }
	  if (available.fn) { return [available.fn]; }

	  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
	    ee[i] = available[i].fn;
	  }

	  return ee;
	};

	/**
	 * Calls each of the listeners registered for a given event.
	 *
	 * @param {String|Symbol} event The event name.
	 * @returns {Boolean} `true` if the event had listeners, else `false`.
	 * @api public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  var arguments$1 = arguments;
	  var this$1 = this;

	  var evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) { return false; }

	  var listeners = this._events[evt]
	    , len = arguments.length
	    , args
	    , i;

	  if (listeners.fn) {
	    if (listeners.once) { this.removeListener(event, listeners.fn, undefined, true); }

	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }

	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments$1[i];
	    }

	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;

	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) { this$1.removeListener(event, listeners[i].fn, undefined, true); }

	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
	        default:
	          if (!args) { for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments$1[j];
	          } }

	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }

	  return true;
	};

	/**
	 * Add a listener for a given event.
	 *
	 * @param {String|Symbol} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {Mixed} [context=this] The context to invoke the listener with.
	 * @returns {EventEmitter} `this`.
	 * @api public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  var listener = new EE(fn, context || this)
	    , evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) { this._events[evt] = listener, this._eventsCount++; }
	  else if (!this._events[evt].fn) { this._events[evt].push(listener); }
	  else { this._events[evt] = [this._events[evt], listener]; }

	  return this;
	};

	/**
	 * Add a one-time listener for a given event.
	 *
	 * @param {String|Symbol} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {Mixed} [context=this] The context to invoke the listener with.
	 * @returns {EventEmitter} `this`.
	 * @api public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  var listener = new EE(fn, context || this, true)
	    , evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) { this._events[evt] = listener, this._eventsCount++; }
	  else if (!this._events[evt].fn) { this._events[evt].push(listener); }
	  else { this._events[evt] = [this._events[evt], listener]; }

	  return this;
	};

	/**
	 * Remove the listeners of a given event.
	 *
	 * @param {String|Symbol} event The event name.
	 * @param {Function} fn Only remove the listeners that match this function.
	 * @param {Mixed} context Only remove the listeners that have this context.
	 * @param {Boolean} once Only remove one-time listeners.
	 * @returns {EventEmitter} `this`.
	 * @api public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) { return this; }
	  if (!fn) {
	    if (--this._eventsCount === 0) { this._events = new Events(); }
	    else { delete this._events[evt]; }
	    return this;
	  }

	  var listeners = this._events[evt];

	  if (listeners.fn) {
	    if (
	         listeners.fn === fn
	      && (!once || listeners.once)
	      && (!context || listeners.context === context)
	    ) {
	      if (--this._eventsCount === 0) { this._events = new Events(); }
	      else { delete this._events[evt]; }
	    }
	  } else {
	    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
	      if (
	           listeners[i].fn !== fn
	        || (once && !listeners[i].once)
	        || (context && listeners[i].context !== context)
	      ) {
	        events.push(listeners[i]);
	      }
	    }

	    //
	    // Reset the array, or remove it completely if we have no more listeners.
	    //
	    if (events.length) { this._events[evt] = events.length === 1 ? events[0] : events; }
	    else if (--this._eventsCount === 0) { this._events = new Events(); }
	    else { delete this._events[evt]; }
	  }

	  return this;
	};

	/**
	 * Remove all listeners, or those of the specified event.
	 *
	 * @param {String|Symbol} [event] The event name.
	 * @returns {EventEmitter} `this`.
	 * @api public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  var evt;

	  if (event) {
	    evt = prefix ? prefix + event : event;
	    if (this._events[evt]) {
	      if (--this._eventsCount === 0) { this._events = new Events(); }
	      else { delete this._events[evt]; }
	    }
	  } else {
	    this._events = new Events();
	    this._eventsCount = 0;
	  }

	  return this;
	};

	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;

	//
	// This function doesn't apply anymore.
	//
	EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
	  return this;
	};

	//
	// Expose the prefix.
	//
	EventEmitter.prefixed = prefix;

	//
	// Allow `EventEmitter` to be imported as module namespace.
	//
	EventEmitter.EventEmitter = EventEmitter;

	//
	// Expose the module.
	//
	{
	  module.exports = EventEmitter;
	}
	});

	function isPrimitive(primitive, type) {
	  return primitive._functionTreePrimitive && primitive.type === type;
	}

	/*
	  Runs through the tree providing a "next" callback to process next step
	  of execution
	*/
	function executeTree(execution, initialPayload, executeBranchWrapper, branchStart, branchEnd, parallelStart, parallelProgress, parallelEnd, end) {
	  function runBranch(branch, index, payload, prevPayload, nextBranch) {
	    executeBranchWrapper(function () {
	      function runNextItem(result) {
	        runBranch(branch, index + 1, result, payload, nextBranch);
	      }

	      function processFunctionOutput(funcDetails, outputResult) {
	        return function (result) {
	          var newPayload = Object.assign({}, payload, result ? result.payload : {});

	          if (result && funcDetails.outputs) {
	            var outputs = Object.keys(funcDetails.outputs);

	            if (~outputs.indexOf(result.path)) {
	              branchStart(funcDetails, result.path, newPayload);
	              runBranch(funcDetails.outputs[result.path].items, 0, newPayload, payload, outputResult);
	            } else {
	              throw new FunctionTreeExecutionError(execution, funcDetails, payload, 'function ' + funcDetails.name + ' must use one of its possible outputs: ' + outputs.join(', ') + '.');
	            }
	          } else {
	            outputResult(newPayload);
	          }
	        };
	      }

	      var currentItem = branch[index];

	      if (!currentItem) {
	        if (branch !== execution.staticTree) {
	          branchEnd(payload);
	        }
	        nextBranch(payload);
	      } else if (isPrimitive(currentItem, 'sequence')) {
	        runBranch(currentItem.items, 0, payload, prevPayload, runNextItem);
	      } else if (isPrimitive(currentItem, 'parallel')) {
	        var itemLength = currentItem.items.length;
	        var payloads = [];

	        parallelStart(payload, itemLength);
	        currentItem.items.forEach(function (func, index) {
	          if (func.function) {
	            execution.runFunction(func, payload, prevPayload, processFunctionOutput(func, function (payload) {
	              payloads.push(payload);
	              if (payloads.length === itemLength) {
	                parallelEnd(payload, itemLength);
	                runNextItem(Object.assign.apply(Object, [{}].concat(payloads)));
	              } else {
	                parallelProgress(payload, itemLength - payloads.length);
	              }
	            }));
	          } else {
	            runBranch(func.items, 0, payload, prevPayload, function (payload) {
	              payloads.push(payload);
	              if (payloads.length === itemLength) {
	                parallelEnd(payload, itemLength);
	                runNextItem(Object.assign.apply(Object, [{}].concat(payloads)));
	              } else {
	                parallelProgress(payload, itemLength - payloads.length);
	              }
	            });
	          }

	          return payloads;
	        });
	      } else {
	        execution.runFunction(currentItem, payload, prevPayload, processFunctionOutput(currentItem, runNextItem));
	      }
	    });
	  }

	  runBranch([execution.staticTree], 0, initialPayload, null, end);
	}
	//# sourceMappingURL=executeTree.js.map

	var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/*
	   If it walks like a duck and quacks like a duck...
	 */
	function isPromise(result) {
	  return result && (result instanceof Promise || typeof result.then === 'function' && typeof result.catch === 'function');
	}

	function isPlainValue(value) {
	  if (value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof$1(value)) === 'object' && !Array.isArray(value) && value.constructor !== Object) {
	    return false;
	  }

	  return true;
	}
	//# sourceMappingURL=utils.js.map

	var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Provider = function () {
	  function Provider(definition) {
	    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	        _ref$wrap = _ref.wrap,
	        wrap = _ref$wrap === undefined ? true : _ref$wrap,
	        _ref$ignoreDefinition = _ref.ignoreDefinition,
	        ignoreDefinition = _ref$ignoreDefinition === undefined ? false : _ref$ignoreDefinition;

	    _classCallCheck$3(this, Provider);

	    this.definition = definition;

	    if (typeof definition === 'function') {
	      return;
	    }

	    if (!ignoreDefinition) {
	      this.verifyDefinition(definition);
	    }

	    this.wrap = wrap;

	    this.ProviderConstructor = function (context) {
	      this.context = context;
	    };
	    this.ProviderConstructor.prototype = definition;

	    this.WrappedProviderConstructor = function (name, context) {
	      this.context = context;
	      this.providerName = name;
	    };
	    this.WrappedProviderConstructor.prototype = Object.keys(ignoreDefinition ? {} : definition).reduce(function (wrappedProvider, key) {
	      var originalFunc = definition[key];

	      wrappedProvider[key] = function () {
	        var arguments$1 = arguments;

	        var _this = this;

	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	          args[_key] = arguments$1[_key];
	        }

	        var providerResult = originalFunc.apply(this, args);

	        if (isPromise(providerResult)) {
	          return providerResult.then(function (result) {
	            _this.context.debugger.send({
	              method: _this.providerName + '.' + key,
	              args: args,
	              isPromise: true,
	              isRejected: false,
	              returnValue: isPlainValue(result) ? result : '[CAN_NOT_SERIALIZE]'
	            });

	            return result;
	          }).catch(function (error) {
	            _this.context.debugger.send({
	              method: _this.providerName + '.' + key,
	              args: args,
	              isPromise: true,
	              isRejected: true
	            });

	            throw error;
	          });
	        }

	        this.context.debugger.send({
	          method: this.providerName + '.' + key,
	          args: args,
	          returnValue: isPlainValue(providerResult) ? providerResult : '[CAN_NOT_SERIALIZE]'
	        });

	        return providerResult;
	      };

	      return wrappedProvider;
	    }, {});
	  }

	  _createClass$3(Provider, [{
	    key: 'verifyDefinition',
	    value: function verifyDefinition(definition) {
	      if (this.ignoreDefinition) {
	        return;
	      }

	      if ((typeof definition === 'undefined' ? 'undefined' : _typeof$2(definition)) !== 'object' || definition === null) {
	        throw new Error('The definition passed as Provider is not valid');
	      }

	      Object.keys(definition).forEach(function (key) {
	        if (typeof definition[key] !== 'function') {
	          throw new Error('The property ' + key + ' passed to Provider is not a method');
	        }
	      });
	    }
	  }, {
	    key: 'get',
	    value: function get(context) {
	      if (typeof this.definition === 'function') {
	        return this.definition(context);
	      }

	      return new this.ProviderConstructor(context);
	    }
	  }, {
	    key: 'getWrapped',
	    value: function getWrapped(name, context) {
	      if (typeof this.definition === 'function') {
	        return this.definition(context);
	      }

	      return new this.WrappedProviderConstructor(name, context);
	    }
	  }]);

	  return Provider;
	}();
	//# sourceMappingURL=Provider.js.map

	var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ResolveValue = function () {
	  function ResolveValue() {
	    _classCallCheck$4(this, ResolveValue);
	  }

	  _createClass$4(ResolveValue, [{
	    key: 'getValue',

	    // "getValue" should receive a context to extract the value
	    value: function getValue() {
	      throw new Error('Extending ResolveValue requires you to add a "getValue" method');
	    }
	  }]);

	  return ResolveValue;
	}();

	var ResolveObject = function (_ResolveValue) {
	  _inherits$2(ResolveObject, _ResolveValue);

	  function ResolveObject(cvalue) {
	    _classCallCheck$4(this, ResolveObject);

	    var _this = _possibleConstructorReturn$2(this, (ResolveObject.__proto__ || Object.getPrototypeOf(ResolveObject)).call(this));

	    _this.cvalue = cvalue;
	    return _this;
	  }

	  _createClass$4(ResolveObject, [{
	    key: 'getValue',
	    value: function getValue(_ref) {
	      var resolve = _ref.resolve;

	      var cvalue = this.cvalue;
	      if (resolve.isResolveValue(cvalue)) {
	        return resolve.value(cvalue);
	      }

	      return Object.keys(cvalue).reduce(function (convertedObject, key) {
	        convertedObject[key] = resolve.value(cvalue[key]);

	        return convertedObject;
	      }, {});
	    }
	  }]);

	  return ResolveObject;
	}(ResolveValue);
	//# sourceMappingURL=ResolveValue.js.map

	var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$3(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$3(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	/*
	  Creates tag for targetting things with a path in Cerebral
	*/
	var Tag = function (_ResolveValue) {
	  _inherits$3(Tag, _ResolveValue);

	  function Tag(type, getter, strings, values) {
	    _classCallCheck$5(this, Tag);

	    var _this = _possibleConstructorReturn$3(this, (Tag.__proto__ || Object.getPrototypeOf(Tag)).call(this));

	    _this.type = type;
	    _this.getter = getter;
	    _this.strings = strings;
	    _this.values = values;
	    return _this;
	  }
	  /*
	    Returns all tags, also nested to identify nested state dependencies
	    in components
	  */


	  _createClass$5(Tag, [{
	    key: 'getTags',
	    value: function getTags() {
	      return [this].concat(this.getNestedTags());
	    }
	    /*
	      Gets the path of the tag, where nested tags are evaluated
	    */

	  }, {
	    key: 'getPath',
	    value: function getPath(context) {
	      var _this2 = this;

	      return this.strings.reduce(function (currentPath, string, idx) {
	        var valueTemplate = _this2.values[idx];

	        if (valueTemplate instanceof ResolveValue) {
	          return currentPath + string + valueTemplate.getValue(context);
	        }

	        return currentPath + string + (valueTemplate !== undefined ? valueTemplate : '');
	      }, '');
	    }
	  }, {
	    key: 'getValue',
	    value: function getValue(context) {
	      return this.getter(this.getPath(context), context);
	    }
	    /*
	      Grab nested tags from the tags current path
	    */

	  }, {
	    key: 'getNestedTags',
	    value: function getNestedTags() {
	      var _this3 = this;

	      return this.strings.reduce(function (currentPaths, string, idx) {
	        var valueTemplate = _this3.values[idx];

	        if (valueTemplate instanceof Tag) {
	          return currentPaths.concat(valueTemplate);
	        }

	        return currentPaths;
	      }, []);
	    }
	    /*
	      Produces a string representation of the tag
	    */

	  }, {
	    key: 'toString',
	    value: function toString() {
	      return this.type + '`' + this.pathToString() + '`';
	    }
	    /*
	      Produces a string representation of the path
	    */

	  }, {
	    key: 'pathToString',
	    value: function pathToString() {
	      var _this4 = this;

	      return this.strings.reduce(function (currentPath, string, idx) {
	        var valueTemplate = _this4.values[idx];

	        if (valueTemplate instanceof Tag) {
	          return currentPath + string + '${' + valueTemplate.toString() + '}';
	        }

	        return currentPath + string + (valueTemplate !== undefined ? valueTemplate : '');
	      }, '');
	    }
	  }]);

	  return Tag;
	}(ResolveValue);
	//# sourceMappingURL=Tag.js.map

	var resolveProvider = new Provider({
	  isTag: function isTag(arg) {
	    var arguments$1 = arguments;

	    if (!(arg instanceof Tag)) {
	      return false;
	    }

	    for (var _len = arguments.length, types = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      types[_key - 1] = arguments$1[_key];
	    }

	    if (types.length) {
	      return types.reduce(function (isType, type) {
	        return isType || type === arg.type;
	      }, false);
	    }

	    return true;
	  },
	  isResolveValue: function isResolveValue(arg) {
	    return arg instanceof ResolveValue;
	  },
	  value: function value(arg) {
	    var overrides = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    if (arg instanceof ResolveValue) {
	      return arg.getValue(overrides ? Object.assign({}, this.context, overrides) : this.context);
	    }

	    return arg;
	  },
	  path: function path(arg) {
	    if (arg instanceof Tag) {
	      return arg.getPath(this.context);
	    }

	    throw new Error('You are extracting a path from an argument that is not a Tag.');
	  }
	}, {
	  wrap: false
	});
	//# sourceMappingURL=Resolve.js.map

	var _createClass$6 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	var _typeof$3 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function _possibleConstructorReturn$4(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$4(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	  Need to create a unique ID for each execution to identify it
	  in debugger
	*/
	function createUniqueId() {
	  return Date.now() + '_' + Math.floor(Math.random() * 10000);
	}

	/*
	  Validate any returned value from a function. Has
	  to be nothing or an object
	*/
	function isValidResult(result) {
	  return !result || (typeof result === 'undefined' ? 'undefined' : _typeof$3(result)) === 'object' && !Array.isArray(result);
	}

	/*
	  Create an error with execution details
	*/
	function createErrorObject(error, execution, functionDetails, payload) {
	  var errorToReturn = error;

	  errorToReturn.execution = execution;
	  errorToReturn.functionDetails = functionDetails;
	  errorToReturn.payload = Object.assign({}, payload, {
	    _execution: {
	      id: execution.id,
	      functionIndex: functionDetails.functionIndex
	    },
	    error: error.toJSON ? error.toJSON() : {
	      name: error.name,
	      message: error.message,
	      stack: error.stack
	    }
	  });

	  return errorToReturn;
	}

	var FunctionTreeExecution = function () {
	  function FunctionTreeExecution(name, staticTree, functionTree, errorCallback) {
	    _classCallCheck$6(this, FunctionTreeExecution);

	    this.id = createUniqueId();
	    this.name = name || staticTree.name || this.id;
	    this.staticTree = staticTree;
	    this.functionTree = functionTree;
	    this.datetime = Date.now();
	    this.errorCallback = errorCallback;
	    this.hasThrown = false;
	    this.isAsync = false;

	    this.runFunction = this.runFunction.bind(this);
	  }

	  /*
	    Creates the context for the current function to be run,
	    emits events and handles its returned value. Also handles
	    the returned value being a promise
	  */


	  _createClass$6(FunctionTreeExecution, [{
	    key: 'runFunction',
	    value: function runFunction(funcDetails, payload, prevPayload, next) {
	      if (this.hasThrown) {
	        return;
	      }

	      var context = this.createContext(funcDetails, payload, prevPayload);
	      var functionTree = this.functionTree;
	      var errorCallback = this.errorCallback;
	      var execution = this;
	      var result = void 0;

	      functionTree.emit('functionStart', execution, funcDetails, payload);
	      try {
	        result = funcDetails.function(context);
	      } catch (error) {
	        this.hasThrown = true;

	        return errorCallback(createErrorObject(error, execution, funcDetails, payload), execution, funcDetails, payload);
	      }

	      /*
	        If result is a promise we want to emit an event and wait for it to resolve to
	        move on
	      */
	      if (isPromise(result)) {
	        functionTree.emit('asyncFunction', execution, funcDetails, payload, result);
	        this.isAsync = true;
	        result.then(function (result) {
	          if (result instanceof Path) {
	            functionTree.emit('functionEnd', execution, funcDetails, payload, result);
	            next(result.toJSON());
	          } else if (funcDetails.outputs) {
	            functionTree.emit('functionEnd', execution, funcDetails, payload, result);
	            throw new FunctionTreeExecutionError(execution, funcDetails, payload, new Error('The result ' + JSON.stringify(result) + ' from function ' + funcDetails.name + ' needs to be a path of either ' + Object.keys(funcDetails.outputs)));
	          } else if (isValidResult(result)) {
	            functionTree.emit('functionEnd', execution, funcDetails, payload, result);
	            next({
	              payload: result
	            });
	          } else {
	            functionTree.emit('functionEnd', execution, funcDetails, payload, result);
	            throw new FunctionTreeExecutionError(execution, funcDetails, payload, new Error('The result ' + JSON.stringify(result) + ' from function ' + funcDetails.name + ' is not a valid result'));
	          }
	        }).catch(function (result) {
	          if (execution.hasThrown) {
	            return;
	          }

	          if (result instanceof Error) {
	            execution.hasThrown = true;
	            errorCallback(createErrorObject(result, execution, funcDetails, payload), execution, funcDetails, payload);
	          } else if (result instanceof Path) {
	            functionTree.emit('functionEnd', execution, funcDetails, payload, result);
	            next(result.toJSON());
	          } else if (funcDetails.outputs) {
	            var error = new FunctionTreeExecutionError(execution, funcDetails, payload, new Error('The result ' + JSON.stringify(result) + ' from function ' + funcDetails.name + ' needs to be a path of either ' + Object.keys(funcDetails.outputs)));

	            execution.hasThrown = true;
	            errorCallback(createErrorObject(error, execution, funcDetails, payload), execution, funcDetails, payload);
	          } else if (isValidResult(result)) {
	            functionTree.emit('functionEnd', execution, funcDetails, payload, result);
	            next({
	              payload: result
	            });
	          } else {
	            var _error = new FunctionTreeExecutionError(execution, funcDetails, payload, new Error('The result ' + JSON.stringify(result) + ' from function ' + funcDetails.name + ' is not a valid result'));
	            execution.hasThrown = true;

	            errorCallback(createErrorObject(_error, execution, funcDetails, payload), execution, funcDetails, payload);
	          }
	        });
	      } else if (result instanceof Path) {
	        functionTree.emit('functionEnd', execution, funcDetails, payload, result);
	        next(result.toJSON());
	      } else if (funcDetails.outputs) {
	        var error = new FunctionTreeExecutionError(execution, funcDetails, payload, new Error('The result ' + JSON.stringify(result) + ' from function ' + funcDetails.name + ' needs to be a path of either ' + Object.keys(funcDetails.outputs)));

	        this.hasThrown = true;
	        errorCallback(createErrorObject(error, execution, funcDetails, payload), execution, funcDetails, payload);
	      } else if (isValidResult(result)) {
	        functionTree.emit('functionEnd', execution, funcDetails, payload, result);
	        next({
	          payload: result
	        });
	      } else {
	        var _error2 = new FunctionTreeExecutionError(execution, funcDetails, payload, new Error('The result ' + JSON.stringify(result) + ' from function ' + funcDetails.name + ' is not a valid result'));
	        this.hasThrown = true;

	        errorCallback(createErrorObject(_error2, execution, funcDetails, payload), execution, funcDetails, payload);
	      }
	    }

	    /*
	      Creates the context for the next running function
	    */

	  }, {
	    key: 'createContext',
	    value: function createContext(functionDetails, payload, prevPayload) {
	      var contextProviders = this.functionTree.contextProviders;
	      var newContext = {
	        execution: this,
	        props: payload || {},
	        functionDetails: functionDetails,
	        path: functionDetails.outputs ? Object.keys(functionDetails.outputs).reduce(function (output, outputPath) {
	          output[outputPath] = function (payload) {
	            return new Path(outputPath, payload);
	          };

	          return output;
	        }, {}) : null
	      };

	      var debuggerProvider = contextProviders.debugger && contextProviders.debugger.get(newContext, functionDetails, payload, prevPayload);

	      var context = Object.keys(contextProviders).reduce(function (currentContext, name) {
	        var provider = contextProviders[name];

	        if (provider instanceof Provider) {
	          currentContext[name] = provider.get(currentContext, functionDetails, payload, prevPayload);
	        } else {
	          currentContext[name] = provider;
	        }

	        return currentContext;
	      }, newContext);

	      if (debuggerProvider) {
	        return Object.keys(context).reduce(function (currentContext, name) {
	          var provider = contextProviders[name];

	          if (provider && provider instanceof Provider && provider.wrap) {
	            currentContext[name] = typeof provider.wrap === 'function' ? provider.wrap(context, functionDetails) : provider.getWrapped(name, context);
	          } else {
	            currentContext[name] = context[name];
	          }

	          return currentContext;
	        }, {});
	      }

	      return context;
	    }
	  }]);

	  return FunctionTreeExecution;
	}();

	var FunctionTree = function (_EventEmitter) {
	  _inherits$4(FunctionTree, _EventEmitter);

	  function FunctionTree() {
	    var contextProviders = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    _classCallCheck$6(this, FunctionTree);

	    var _this = _possibleConstructorReturn$4(this, (FunctionTree.__proto__ || Object.getPrototypeOf(FunctionTree)).call(this));

	    _this.cachedTrees = [];
	    _this.cachedStaticTrees = [];
	    _this.executeBranchWrapper = options.executeBranchWrapper || function (cb) {
	      cb();
	    };

	    if ((typeof contextProviders === 'undefined' ? 'undefined' : _typeof$3(contextProviders)) !== 'object' || contextProviders === null || Array.isArray(contextProviders)) {
	      throw new Error('You have to pass an object of context providers to FunctionTree');
	    }

	    var providerKeys = Object.keys(contextProviders);

	    if (providerKeys.indexOf('props') >= 0 || providerKeys.indexOf('path') >= 0 || providerKeys.indexOf('resolve') >= 0 || providerKeys.indexOf('execution') >= 0 || providerKeys.indexOf('debugger') >= 0) {
	      throw new Error('You are trying to add a provider with protected key. "props", "path", "resolve", "execution" and "debugger" are protected');
	    }

	    _this.contextProviders = Object.assign({}, contextProviders, {
	      resolve: resolveProvider
	    });

	    _this.run = _this.run.bind(_this);
	    return _this;
	  }

	  /*
	    Analyses the tree to identify paths and its validity. This analysis
	    is cached. Then the method creates an execution for the tree to run.
	  */


	  _createClass$6(FunctionTree, [{
	    key: 'run',
	    value: function run() {
	      var _this2 = this;

	      var name = void 0;
	      var tree = void 0;
	      var payload = void 0;
	      var cb = void 0;
	      var staticTree = void 0;
	      var args = [].slice.call(arguments);
	      args.forEach(function (arg) {
	        if (typeof arg === 'string') {
	          name = arg;
	        } else if (Array.isArray(arg) || arg instanceof Primitive) {
	          tree = arg;
	        } else if (!tree && typeof arg === 'function') {
	          tree = arg;
	        } else if (typeof arg === 'function') {
	          cb = arg;
	        } else {
	          payload = arg;
	        }
	      });

	      if (!tree) {
	        throw new Error('function-tree - You did not pass in a function tree');
	      }

	      var withResolveAndReject = function withResolveAndReject(resolve, reject) {
	        var treeIdx = _this2.cachedTrees.indexOf(tree);
	        if (treeIdx === -1) {
	          staticTree = createStaticTree(name, tree);
	          _this2.cachedTrees.push(tree);
	          _this2.cachedStaticTrees.push(staticTree);
	        } else {
	          staticTree = _this2.cachedStaticTrees[treeIdx];
	        }
	        var execution = new FunctionTreeExecution(name, staticTree, _this2, function (error, execution, funcDetails, finalPayload) {
	          _this2.emit('error', error, execution, funcDetails, finalPayload);
	          reject(error);
	        });

	        _this2.emit('start', execution, payload);
	        executeTree(execution, payload, _this2.executeBranchWrapper, function (funcDetails, path, currentPayload) {
	          _this2.emit('pathStart', path, execution, funcDetails, currentPayload);
	        }, function (currentPayload) {
	          _this2.emit('pathEnd', execution, currentPayload);
	        }, function (currentPayload, functionsToResolve) {
	          _this2.emit('parallelStart', execution, currentPayload, functionsToResolve);
	        }, function (currentPayload, functionsResolved) {
	          _this2.emit('parallelProgress', execution, currentPayload, functionsResolved);
	        }, function (currentPayload, functionsResolved) {
	          _this2.emit('parallelEnd', execution, currentPayload, functionsResolved);
	        }, function (finalPayload) {
	          _this2.emit('end', execution, finalPayload);
	          resolve === reject ? resolve(null, finalPayload) : resolve(finalPayload);
	        });
	      };

	      if (cb) {
	        withResolveAndReject(cb, cb);
	      } else {
	        return new Promise(withResolveAndReject);
	      }
	    }
	  }]);

	  return FunctionTree;
	}(eventemitter3);
	//# sourceMappingURL=FunctionTree.js.map

	//# sourceMappingURL=index.js.map

	//# sourceMappingURL=index.js.map

	var _createClass$7 = function () { function defineProperties(target, props$$1) { for (var i = 0; i < props$$1.length; i++) { var descriptor = props$$1[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$5(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$5(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	var Compute = function (_ResolveValue) {
	  _inherits$5(Compute, _ResolveValue);

	  function Compute(args) {
	    _classCallCheck$7(this, Compute);

	    var _this = _possibleConstructorReturn$5(this, (Compute.__proto__ || Object.getPrototypeOf(Compute)).call(this));

	    _this.args = args;
	    _this.value = null;
	    return _this;
	  }

	  _createClass$7(Compute, [{
	    key: 'getValue',
	    value: function getValue(context) {
	      var computeGet = function computeGet(tag) {
	        return tag.getValue(context);
	      };
	      var result = this.args.reduce(function (details, arg, index) {
	        if (arg instanceof Tag) {
	          var path = arg.getPath(context);

	          if (path.indexOf('.*') > 0) {
	            var value = arg.getValue(context);

	            details.results.push(value ? Object.keys(value) : []);
	          } else {
	            details.results.push(arg.getValue(context));
	          }

	          return details;
	        } else if (arg instanceof ResolveValue) {
	          details.results.push(arg.getValue(context));

	          return details;
	        } else if (typeof arg === 'function') {
	          details.results.push(arg.apply(undefined, _toConsumableArray(details.results.slice(details.previousFuncIndex, index)).concat([computeGet])));
	          details.previousFuncIndex = index;

	          return details;
	        }

	        details.results.push(arg);

	        return details;
	      }, {
	        results: [],
	        previousFuncIndex: 0
	      });

	      return result.results[result.results.length - 1];
	    }
	  }]);

	  return Compute;
	}(ResolveValue);
	//# sourceMappingURL=Compute.js.map

	var _typeof$4 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function getChangedProps() {
	  var propsA = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var propsB = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	  var propsAKeys = Object.keys(propsA);
	  var propsBKeys = Object.keys(propsB);
	  var changedProps = [];

	  for (var i = 0; i < propsAKeys.length; i++) {
	    if (propsA[propsAKeys[i]] !== propsB[propsAKeys[i]]) {
	      changedProps.push({ path: [propsAKeys[i]] });
	    }
	  }

	  for (var _i = 0; _i < propsBKeys.length; _i++) {
	    if (propsA[propsBKeys[_i]] !== propsB[propsBKeys[_i]]) {
	      changedProps.push({ path: [propsBKeys[_i]] });
	    }
	  }

	  return changedProps;
	}

	function cleanPath(path) {
	  return typeof path === 'string' ? path.replace(/\.\*\*|\.\*/, '') : path;
	}

	function isObject(obj) {
	  return (typeof obj === 'undefined' ? 'undefined' : _typeof$4(obj)) === 'object' && obj !== null && !Array.isArray(obj);
	}

	function isComplexObject(obj) {
	  return (typeof obj === 'undefined' ? 'undefined' : _typeof$4(obj)) === 'object' && obj !== null;
	}

	function isSerializable(value) {
	  var additionalTypes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

	  var validType = additionalTypes.reduce(function (currentValid, type) {
	    if (currentValid || value instanceof type) {
	      return true;
	    }

	    return currentValid;
	  }, false);

	  if (value !== undefined && (validType || isObject(value) && Object.prototype.toString.call(value) === '[object Object]' && (value.constructor === Object || Object.getPrototypeOf(value) === null) || typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean' || value === null || Array.isArray(value))) {
	    return true;
	  }
	  return false;
	}

	function ensurePath() {
	  var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

	  if (Array.isArray(path)) {
	    return path;
	  } else if (typeof path === 'string') {
	    return path.split('.');
	  }

	  return [];
	}

	function throwError(message) {
	  throw new Error('Cerebral - ' + message);
	}

	function isDeveloping() {
	  return "production" !== 'production';
	}

	function forceSerializable(value) {
	  if (value && !isSerializable(value)) {
	    var name = value.constructor.name;

	    try {
	      Object.defineProperty(value, 'toJSON', {
	        value: function value() {
	          return '[' + name + ']';
	        }
	      });
	    } catch (e) {}
	  }

	  return value;
	}

	function getProviders(module) {
	  return Object.assign(module.providers || {}, Object.keys(module.modules || {}).reduce(function (nestedProviders, moduleKey) {
	    return Object.assign(nestedProviders, getProviders(module.modules[moduleKey]));
	  }, {}));
	}

	function extractAllChildMatches(children) {
	  return Object.keys(children).reduce(function (matches, key) {
	    if (children[key].children) {
	      return matches.concat(children[key]).concat(extractAllChildMatches(children[key].children));
	    }

	    return matches.concat(children[key]);
	  }, []);
	}

	function dependencyMatch(changes, dependencyMap) {
	  var currentMatches = [];

	  for (var changeIndex = 0; changeIndex < changes.length; changeIndex++) {
	    var currentDependencyMapLevel = dependencyMap;
	    for (var pathKeyIndex = 0; pathKeyIndex < changes[changeIndex].path.length; pathKeyIndex++) {
	      if (!currentDependencyMapLevel) {
	        break;
	      }

	      if (currentDependencyMapLevel['**']) {
	        currentMatches.push(currentDependencyMapLevel['**']);
	      }

	      if (pathKeyIndex === changes[changeIndex].path.length - 1) {
	        var dependency = currentDependencyMapLevel[changes[changeIndex].path[pathKeyIndex]];
	        if (dependency) {
	          currentMatches.push(dependency);

	          if (dependency.children) {
	            if (changes[changeIndex].forceChildPathUpdates) {
	              currentMatches = currentMatches.concat(extractAllChildMatches(dependency.children));
	            } else {
	              if (dependency.children['**']) {
	                currentMatches.push(dependency.children['**']);
	              }

	              if (dependency.children['*']) {
	                currentMatches.push(dependency.children['*']);
	              }
	            }
	          }
	        }

	        if (currentDependencyMapLevel['*']) {
	          currentMatches.push(currentDependencyMapLevel['*']);
	        }
	      }

	      if (!currentDependencyMapLevel[changes[changeIndex].path[pathKeyIndex]]) {
	        currentDependencyMapLevel = null;
	        break;
	      }

	      currentDependencyMapLevel = currentDependencyMapLevel[changes[changeIndex].path[pathKeyIndex]].children;
	    }
	  }

	  return currentMatches;
	}

	function getWithPath(obj) {
	  return function (path) {
	    return path.split('.').reduce(function (currentValue, key, index) {
	      if (index > 0 && currentValue === undefined) {
	        throwError('You are extracting with path "' + path + '", but it is not valid for this object');
	      }

	      return currentValue[key];
	    }, obj);
	  };
	}

	function ensureStrictPath(path, value) {
	  if (isComplexObject(value) && path.indexOf('*') === -1) {
	    return path + '.**';
	  }

	  return path;
	}

	function createResolver(getters) {
	  return {
	    isTag: function isTag(arg) {
	      var arguments$1 = arguments;

	      if (!(arg instanceof Tag)) {
	        return false;
	      }

	      for (var _len2 = arguments.length, types = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        types[_key2 - 1] = arguments$1[_key2];
	      }

	      if (types.length) {
	        return types.reduce(function (isType, type) {
	          return isType || type === arg.type;
	        }, false);
	      }

	      return true;
	    },
	    isCompute: function isCompute(arg) {
	      return arg instanceof Compute;
	    },
	    value: function value(arg, overrideProps) {
	      if (arg instanceof Tag || arg instanceof Compute) {
	        return arg.getValue(overrideProps ? Object.assign({}, getters, { props: overrideProps }) : getters);
	      }

	      return arg;
	    },
	    path: function path(arg) {
	      if (arg instanceof Tag) {
	        return arg.getPath(getters);
	      }

	      throwError('You are extracting a path from an argument that is not a Tag');
	    }
	  };
	}

	var noop = function noop() {};

	function addCerebralStateKey(object) {
	  if (isComplexObject(object)) {
	    for (var key in object) {
	      addCerebralStateKey(object[key]);
	    }

	    !object.__CerebralState && Object.defineProperty(object, '__CerebralState', {
	      value: true
	    });
	  }

	  return object;
	}

	function getStateTreeProp() {
	  var props$$1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  return Object.keys(props$$1).reduce(function (hit, key) {
	    if (!hit && isComplexObject(props$$1[key]) && '__CerebralState' in props$$1[key]) {
	      return key;
	    }

	    return hit;
	  }, null);
	}

	function getModule(path, modules) {
	  var pathArray = Array.isArray(path) ? path : ensurePath(path);
	  return pathArray.reduce(function (currentModule, key) {
	    if (!currentModule.modules[key]) {
	      throwError('The path "' + pathArray.join('.') + '" is invalid, can not find module. Does the path "' + pathArray.splice(0, path.length - 1).join('.') + '" exist?');
	    }
	    return currentModule.modules[key];
	  }, modules);
	}

	function extractModuleProp(module, prop, transform) {
	  var extracted = Object.keys(module.modules || {}).reduce(function (additionalExtracted, subModuleKey) {
	    additionalExtracted[subModuleKey] = extractModuleProp(module.modules[subModuleKey], prop, transform);

	    return additionalExtracted;
	  }, {});

	  if (module[prop]) {
	    var extracedWithGetters = Object.keys(module[prop]).reduce(function (currentExtracted, key) {
	      var propertyDescriptor = Object.getOwnPropertyDescriptor(module[prop], key);
	      if (propertyDescriptor && 'get' in propertyDescriptor) {
	        Object.defineProperty(currentExtracted, key, propertyDescriptor);
	      } else {
	        currentExtracted[key] = module[prop][key];
	      }

	      return currentExtracted;
	    }, extracted);

	    return transform ? transform(extracedWithGetters, module) : extracedWithGetters;
	  }

	  return extracted;
	}
	//# sourceMappingURL=utils.js.map

	var _createClass$8 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$8(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var DependencyStore = function () {
	  function DependencyStore() {
	    _classCallCheck$8(this, DependencyStore);

	    this.map = {};
	  }
	  /*
	    Adds the entity to all the depending paths
	  */


	  _createClass$8(DependencyStore, [{
	    key: 'addEntity',
	    value: function addEntity(entity, depsMap) {
	      var _this = this;

	      var _loop = function _loop(depsMapKey) {
	        var path = depsMapKey.split('.');

	        path.reduce(function (currentMapLevel, key, index) {
	          if (!currentMapLevel[key]) {
	            currentMapLevel[key] = {};
	          }

	          if (index < path.length - 1) {
	            currentMapLevel[key].children = currentMapLevel[key].children || {};

	            return currentMapLevel[key].children;
	          }

	          currentMapLevel[key].entities = currentMapLevel[key].entities ? currentMapLevel[key].entities.concat(entity) : [entity];

	          return currentMapLevel;
	        }, _this.map);
	      };

	      for (var depsMapKey in depsMap) {
	        _loop(depsMapKey);
	      }
	    }
	    /*
	      Removes the entity from all depending paths
	    */

	  }, {
	    key: 'removeEntity',
	    value: function removeEntity(entity, depsMap) {
	      var _this2 = this;

	      var _loop2 = function _loop2(depsMapKey) {
	        var path = depsMapKey.split('.');
	        path.reduce(function (currentMapLevel, key, index) {
	          if (index === path.length - 1) {
	            currentMapLevel[key].entities.splice(currentMapLevel[key].entities.indexOf(entity), 1);

	            if (!currentMapLevel[key].entities.length) {
	              delete currentMapLevel[key].entities;
	            }
	          }

	          return currentMapLevel[key].children;
	        }, _this2.map);
	      };

	      for (var depsMapKey in depsMap) {
	        _loop2(depsMapKey);
	      }
	    }
	    /*
	      Updates entity based on changed dependencies
	    */

	  }, {
	    key: 'updateEntity',
	    value: function updateEntity(entity, prevDepsMap, nextDepsMap) {
	      var toRemove = Object.keys(prevDepsMap).reduce(function (removeDepsMap, prevDepsMapKey) {
	        if (!nextDepsMap[prevDepsMapKey]) {
	          removeDepsMap[prevDepsMapKey] = true;
	        }

	        return removeDepsMap;
	      }, {});
	      var toAdd = Object.keys(nextDepsMap).reduce(function (addDepsMap, nextDepsMapKey) {
	        if (!prevDepsMap[nextDepsMapKey]) {
	          addDepsMap[nextDepsMapKey] = true;
	        }

	        return addDepsMap;
	      }, {});

	      this.removeEntity(entity, toRemove);

	      this.addEntity(entity, toAdd);
	    }
	    /*
	      As same entity can appear in multiple paths, this method returns
	      all unique entities. Used by view to render all components
	    */

	  }, {
	    key: 'getAllUniqueEntities',
	    value: function getAllUniqueEntities() {
	      var entities = [];

	      function traverseChildren(children) {
	        for (var childKey in children) {
	          if (children[childKey].entities) {
	            for (var y = 0; y < children[childKey].entities.length; y++) {
	              if (entities.indexOf(children[childKey].entities[y]) === -1) {
	                entities.push(children[childKey].entities[y]);
	              }
	            }
	          }

	          if (children[childKey].children) {
	            traverseChildren(children[childKey].children);
	          }
	        }
	      }
	      traverseChildren(this.map);

	      return entities;
	    }
	    /*
	      Returns entities based on a change map returned from
	      the model flush method.
	    */

	  }, {
	    key: 'getUniqueEntities',
	    value: function getUniqueEntities(changesMap) {
	      return dependencyMatch(changesMap, this.map).reduce(function (unique, match) {
	        return (match.entities || []).reduce(function (currentUnique, entity) {
	          if (currentUnique.indexOf(entity) === -1) {
	            return currentUnique.concat(entity);
	          }

	          return currentUnique;
	        }, unique);
	      }, []);
	    }
	  }]);

	  return DependencyStore;
	}();
	//# sourceMappingURL=DependencyStore.js.map

	var _createClass$9 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$9(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Module = function () {
	  function Module(moduleDescription) {
	    _classCallCheck$9(this, Module);

	    this.moduleDescription = moduleDescription;
	  }

	  _createClass$9(Module, [{
	    key: 'create',
	    value: function create(controller, path) {
	      var stringPath = path.join('.');
	      var moduleStub = {
	        controller: controller,
	        path: stringPath,
	        name: path.slice().pop()
	      };

	      var module = typeof this.moduleDescription === 'function' ? this.moduleDescription(moduleStub) : Object.assign({}, this.moduleDescription);

	      /* Convert arrays to actually runable signals */
	      module.signals = Object.keys(module.signals || {}).reduce(function (currentSignals, signalKey) {
	        var signal = module.signals[signalKey];
	        if (!(signal && (Array.isArray(signal) || typeof signal === 'function' || signal instanceof Primitive))) {
	          throwError('Signal with name "' + signalKey + '" is not correctly defined. Please check that the signal is either a sequence, an array or a function.');
	        }
	        currentSignals[signalKey] = {
	          signal: signal,
	          run: function run(payload) {
	            controller.runSignal(path.concat(signalKey).join('.'), signal, payload);
	          }
	        };

	        return currentSignals;
	      }, {});

	      /* Instantiate submodules */
	      module.modules = Object.keys(module.modules || {}).reduce(function (registered, moduleKey) {
	        if (!module.modules[moduleKey].create) {
	          throw new Error('You are not using the Module factory on module "' + moduleKey + '"');
	        }

	        registered[moduleKey] = module.modules[moduleKey].create(controller, path.concat(moduleKey));

	        return registered;
	      }, {});

	      return module;
	    }
	  }]);

	  return Module;
	}();
	//# sourceMappingURL=Module.js.map

	function DebuggerProvider(devtools) {
	  return Provider$1({
	    send: function send(debuggerData) {
	      devtools.sendExecutionData(debuggerData, this.context.execution, this.context.functionDetails, this.context.props);
	    },
	    wrapProvider: function wrapProvider(name, provider) {
	      var _this = this;

	      return Object.keys(provider).reduce(function (wrappedProvider, key) {
	        var originalFunc = provider[key];

	        wrappedProvider[key] = function () {
	          var arguments$1 = arguments;

	          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments$1[_key];
	          }

	          _this.context.debugger.send({
	            method: name + '.' + key,
	            args: args
	          });

	          console.log(provider.context);
	          return originalFunc.apply(provider, args);
	        };

	        return wrappedProvider;
	      }, {});
	    }
	  }, {
	    wrap: false
	  });
	}
	//# sourceMappingURL=Debugger.js.map

	var Provider$1 = (function () {
	  var arguments$1 = arguments;

	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments$1[_key];
	  }

	  return new (Function.prototype.bind.apply(Provider, [null].concat(args)))();
	});
	//# sourceMappingURL=Provider.js.map

	function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	var methods = ['concat', 'get', 'increment', 'merge', 'pop', 'push', 'set', 'shift', 'splice', 'toggle', 'unset', 'unshift'];

	function StateProviderFactory(devtools) {
	  var asyncTimeout = null;

	  return Provider$1(methods.reduce(function (currentState, methodKey) {
	    currentState[methodKey] = function () {
	      var arguments$1 = arguments;

	      var _this = this;

	      var model = this.context.controller.model;

	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments$1[_key];
	      }

	      var path = ensurePath(cleanPath(args.shift()));

	      if (methodKey === 'get') {
	        return model.get(path);
	      }

	      if (this.context.controller.flush) {
	        clearTimeout(asyncTimeout);
	        asyncTimeout = setTimeout(function () {
	          return _this.context.controller.flush();
	        });
	      }

	      return model[methodKey].apply(model, [path].concat(args));
	    };

	    return currentState;
	  }, {}), {
	    wrap: devtools ? function (context, functionDetails) {
	      var asyncTimeout = null;

	      return methods.reduce(function (currentState, methodKey) {
	        if (methodKey === 'get' || methodKey === 'compute') {
	          currentState[methodKey] = function (path) {
	            return context.controller.model[methodKey](ensurePath(cleanPath(path)));
	          };
	        } else {
	          var originFunc = context.controller.model[methodKey];

	          currentState[methodKey] = function () {
	            var arguments$1 = arguments;

	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	              args[_key2] = arguments$1[_key2];
	            }

	            var argsCopy = args.slice();
	            var path = ensurePath(argsCopy.shift());

	            context.debugger.send({
	              datetime: Date.now(),
	              type: 'mutation',
	              color: '#333',
	              method: methodKey,
	              args: [path].concat(_toConsumableArray$1(argsCopy))
	            });

	            if (context.controller.flush) {
	              clearTimeout(asyncTimeout);
	              asyncTimeout = setTimeout(function () {
	                return context.controller.flush();
	              });
	            }

	            try {
	              originFunc.apply(context.controller.model, [path].concat(_toConsumableArray$1(argsCopy)));
	            } catch (e) {
	              var signalName = context.execution.name;
	              throwError('The Signal "' + signalName + '" with action "' + functionDetails.name + '" has an error: ' + e.message);
	            }
	          };
	        }

	        return currentState;
	      }, {});
	    } : false
	  });
	}
	//# sourceMappingURL=State.js.map

	function _toConsumableArray$2(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function ModuleProviderFactory(devtools) {
	  return Provider$1(methods.reduce(function (currentState, methodKey) {
	    currentState[methodKey] = function () {
	      var arguments$1 = arguments;

	      var _context$state;

	      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

	      path = ensurePath(path);
	      var signalPath = this.context.execution.name.split('.');
	      var modulePath = signalPath.splice(0, signalPath.length - 1);

	      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments$1[_key];
	      }

	      return (_context$state = this.context.state)[methodKey].apply(_context$state, [modulePath.concat(path)].concat(args));
	    };

	    return currentState;
	  }, {}), {
	    wrap: devtools ? function (context, functionDetails) {
	      return methods.reduce(function (currentState, methodKey) {
	        if (methodKey === 'get' || methodKey === 'compute') {
	          currentState[methodKey] = function (path) {
	            path = ensurePath(path);
	            var signalPath = context.execution.name.split('.');
	            var modulePath = signalPath.splice(0, signalPath.length - 1);

	            path = modulePath.concat(path);

	            return context.state[methodKey](path);
	          };
	        } else {
	          var originFunc = context.state[methodKey];

	          currentState[methodKey] = function () {
	            var arguments$1 = arguments;

	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	              args[_key2] = arguments$1[_key2];
	            }

	            var argsCopy = args.slice();
	            var path = ensurePath(argsCopy.shift());
	            var signalPath = context.execution.name.split('.');
	            var modulePath = signalPath.splice(0, signalPath.length - 1);

	            path = modulePath.concat(path);

	            context.debugger.send({
	              datetime: Date.now(),
	              type: 'mutation',
	              color: '#333',
	              method: 'module.' + methodKey,
	              args: [path].concat(_toConsumableArray$2(argsCopy))
	            });

	            try {
	              originFunc.apply(context.state, [path].concat(_toConsumableArray$2(argsCopy)));
	            } catch (e) {
	              var signalName = context.execution.name;
	              throwError('The Signal "' + signalName + '" with action "' + functionDetails.name + '" has an error: ' + e.message);
	            }
	          };
	        }

	        return currentState;
	      }, {});
	    } : false
	  });
	}
	//# sourceMappingURL=Module.js.map

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) { break; } } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) { _i["return"](); } } finally { if (_d) { throw _e; } } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _createClass$a = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$a(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$6(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$6(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	/*
	  The controller is where everything is attached. The devtools
	  is attached directly. Also a top level module is created.
	  The controller creates the function tree that will run all signals,
	  based on top level providers and providers defined in modules
	*/

	var BaseController = function (_FunctionTree) {
	  _inherits$6(BaseController, _FunctionTree);

	  function BaseController(rootModule, options, functionTreeOptions) {
	    _classCallCheck$a(this, BaseController);

	    var _this = _possibleConstructorReturn$6(this, (BaseController.__proto__ || Object.getPrototypeOf(BaseController)).call(this, {}, functionTreeOptions));

	    var Model = options.Model,
	        _options$devtools = options.devtools,
	        devtools = _options$devtools === undefined ? null : _options$devtools,
	        _options$stateChanges = options.stateChanges,
	        stateChanges = _options$stateChanges === undefined ? typeof window !== 'undefined' && window.CEREBRAL_STATE : _options$stateChanges,
	        _options$throwToConso = options.throwToConsole,
	        throwToConsole = _options$throwToConso === undefined ? true : _options$throwToConso,
	        _options$preventIniti = options.preventInitialize,
	        preventInitialize = _options$preventIniti === undefined ? false : _options$preventIniti;

	    var getSignal = _this.getSignal;
	    var getSignals = _this.getSignals;

	    _this.getSignal = function () {
	      throwError('You are grabbing a signal before controller has initialized, please wait for "initialized" event');
	    };

	    _this.getSignals = function () {
	      throwError('You are grabbing a signals before controller has initialized, please wait for "initialized" event');
	    };

	    if (!(rootModule instanceof Module)) {
	      throwError('You did not pass a root module to the controller. The first argument has to be a module');
	    }

	    _this.throwToConsole = throwToConsole;

	    _this.devtools = devtools;
	    _this.module = rootModule.create(_this, []);
	    _this.model = new Model(_this);

	    if (!preventInitialize) {
	      _this.emit('initialized:model');
	    }

	    _this.contextProviders = Object.assign(_this.contextProviders, getProviders(_this.module), {
	      controller: _this,
	      state: _this.model.StateProvider(_this.devtools),
	      module: ModuleProviderFactory(_this.devtools)
	    }, _this.devtools ? {
	      debugger: DebuggerProvider(_this.devtools)
	    } : {});

	    if (stateChanges) {
	      Object.keys(stateChanges).forEach(function (statePath) {
	        _this.model.set(ensurePath(statePath), stateChanges[statePath]);
	      });
	    }

	    if (_this.devtools) {
	      _this.devtools.init(_this);
	    }

	    if (!_this.devtools && isDeveloping() && typeof navigator !== 'undefined' && /Chrome/.test(navigator.userAgent)) {
	      console.warn('You are not using the Cerebral devtools. It is highly recommended to use it in combination with the debugger: https://cerebraljs.com/docs/introduction/debugger.html');
	    }

	    _this.getSignal = getSignal;
	    _this.getSignals = getSignals;

	    if (!preventInitialize) {
	      _this.emit('initialized');
	    }
	    return _this;
	  }
	  /*
	    Conveniance method for grabbing the model
	  */


	  _createClass$a(BaseController, [{
	    key: 'getModel',
	    value: function getModel() {
	      return this.model;
	    }
	    /*
	      Method called by view to grab state
	    */

	  }, {
	    key: 'getState',
	    value: function getState(path) {
	      return this.model.get(ensurePath(cleanPath(path)));
	    }
	    /*
	      Uses function tree to run the array and optional
	      payload passed in. The payload will be checkd
	    */

	  }, {
	    key: 'runSignal',
	    value: function runSignal(name, signal) {
	      var _this2 = this;

	      var payload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	      if (this.devtools && (!isObject(payload) || !isSerializable(payload))) {
	        console.warn('You passed an invalid payload to signal "' + name + '". Only serializable payloads can be passed to a signal. The payload has been ignored. This is the object:', payload);
	        payload = {};
	      }

	      if (this.devtools) {
	        payload = Object.keys(payload).reduce(function (currentPayload, key) {
	          if (!isSerializable(payload[key], _this2.devtools.allowedTypes)) {
	            console.warn('You passed an invalid payload to signal "' + name + '", on key "' + key + '". Only serializable values like Object, Array, String, Number and Boolean can be passed in. Also these special value types:', _this2.devtools.allowedTypes);

	            return currentPayload;
	          }

	          currentPayload[key] = forceSerializable(payload[key]);

	          return currentPayload;
	        }, {});
	      }

	      this.run(name, signal, payload, function (error) {
	        if (error) {
	          var signalPath = ensurePath(error.execution.name);
	          var catchingResult = signalPath.reduce(function (details, key, index) {
	            if (details.currentModule.catch) {
	              details.catchingModule = details.currentModule;
	            }

	            details.currentModule = details.currentModule.modules[key];

	            return details;
	          }, {
	            currentModule: _this2.module,
	            catchingModule: null
	          });

	          if (catchingResult.catchingModule) {
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	              for (var _iterator = catchingResult.catchingModule.catch[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                var _step$value = _slicedToArray(_step.value, 2),
	                    errorType = _step$value[0],
	                    signalChain = _step$value[1];

	                if (error instanceof errorType) {
	                  _this2.runSignal('catch', signalChain, error.payload);

	                  // Throw the error to console even if handling it
	                  if (_this2.throwToConsole) {
	                    setTimeout(function () {
	                      console.log('Cerebral is handling error "' + error.name + ': ' + error.message + '" thrown by signal "' + error.execution.name + '". Check debugger for more information.');
	                    });
	                  }

	                  return;
	                }
	              }
	            } catch (err) {
	              _didIteratorError = true;
	              _iteratorError = err;
	            } finally {
	              try {
	                if (!_iteratorNormalCompletion && _iterator.return) {
	                  _iterator.return();
	                }
	              } finally {
	                if (_didIteratorError) {
	                  throw _iteratorError;
	                }
	              }
	            }
	          }

	          if (error.execution.isAsync) {
	            setTimeout(function () {
	              throw error;
	            });
	          } else {
	            throw error;
	          }
	        }
	      });
	    }
	    /*
	      Returns a function which binds the name/path of signal,
	      and the array. This allows view layer to just call it with
	      an optional payload and it will run
	    */

	  }, {
	    key: 'getSignal',
	    value: function getSignal(path) {
	      var pathArray = ensurePath(path);
	      var signalKey = pathArray.pop();
	      var module = pathArray.reduce(function (currentModule, key) {
	        return currentModule ? currentModule.modules[key] : undefined;
	      }, this.module);
	      var signal = module && module.signals[signalKey];

	      if (!signal) {
	        throwError('The signal on path "' + path + '" does not exist, please check path');
	      }

	      return signal && signal.run;
	    }
	  }, {
	    key: 'getSignals',
	    value: function getSignals(modulePath) {
	      var pathArray = ensurePath(modulePath);
	      var module = pathArray.reduce(function (currentModule, key) {
	        return currentModule ? currentModule.modules[key] : undefined;
	      }, this.module);

	      var signals = module && module.signals;

	      if (!signals) {
	        return undefined;
	      }

	      var callableSignals = {};
	      for (var name in signals) {
	        var signal = signals[name].run;
	        callableSignals[name] = signal;
	      }

	      return callableSignals;
	    }
	  }, {
	    key: 'addModule',
	    value: function addModule(path, module) {
	      var pathArray = ensurePath(path);
	      var moduleKey = pathArray.pop();
	      var parentModule = getModule(pathArray, this.module);
	      var newModule = module.create(this, ensurePath(path));
	      parentModule.modules[moduleKey] = newModule;

	      if (newModule.providers) {
	        Object.assign(this.contextProviders, newModule.providers);
	      }

	      this.emit('moduleAdded', path.split('.'), newModule);

	      this.flush();
	    }
	  }, {
	    key: 'removeModule',
	    value: function removeModule(path) {
	      var _this3 = this;

	      if (!path) {
	        console.warn('Controller.removeModule requires a Module Path');
	        return null;
	      }

	      var pathArray = ensurePath(path);
	      var moduleKey = pathArray.pop();
	      var parentModule = getModule(pathArray, this.module);

	      var module = parentModule.modules[moduleKey];

	      if (module.providers) {
	        Object.keys(module.providers).forEach(function (provider) {
	          delete _this3.contextProviders[provider];
	        });
	      }

	      delete parentModule.modules[moduleKey];

	      this.emit('moduleRemoved', ensurePath(path), module);

	      this.flush();
	    }
	  }]);

	  return BaseController;
	}(FunctionTree);
	//# sourceMappingURL=BaseController.js.map

	var _createClass$b = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$b(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var BaseModel = function () {
	  function BaseModel(controller) {
	    _classCallCheck$b(this, BaseModel);

	    this.initialState = extractModuleProp(controller.module, 'state');
	    this.StateProvider = StateProviderFactory;
	    this.changedPaths = [];

	    controller.on('moduleAdded', this.onModuleAdded.bind(this));
	    controller.on('moduleRemoved', this.onModuleRemoved.bind(this));
	  }

	  _createClass$b(BaseModel, [{
	    key: 'onModuleAdded',
	    value: function onModuleAdded(path, module) {
	      this.set(path, module.state);
	    }
	  }, {
	    key: 'onModuleRemoved',
	    value: function onModuleRemoved(path) {
	      this.unset(path);
	    }
	  }, {
	    key: 'flush',
	    value: function flush() {
	      var changes = this.changedPaths.slice();

	      this.changedPaths = [];

	      return changes;
	    }
	  }]);

	  return BaseModel;
	}();
	//# sourceMappingURL=BaseModel.js.map

	var _typeof$5 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass$c = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$c(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$7(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$7(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	var Model = function (_BaseModel) {
	  _inherits$7(Model, _BaseModel);

	  function Model(controller) {
	    _classCallCheck$c(this, Model);

	    var _this = _possibleConstructorReturn$7(this, (Model.__proto__ || Object.getPrototypeOf(Model)).call(this, controller));

	    _this.controller = controller;
	    _this.devtools = controller.devtools;
	    _this.state = _this.devtools && _this.devtools.warnStateProps ? addCerebralStateKey(_this.initialState) : _this.initialState;

	    controller.on('initialized', function () {
	      _this.flush();
	    });
	    return _this;
	  }

	  _createClass$c(Model, [{
	    key: 'updateIn',
	    value: function updateIn(path, cb) {
	      var _this2 = this;

	      var forceChildPathUpdates = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	      if (!path.length) {
	        cb(this.state, this, 'state');

	        return;
	      }

	      path.reduce(function (currentState, key, index) {
	        if (index === path.length - 1) {
	          if (!Array.isArray(currentState) && !isObject(currentState)) {
	            throwError('The path "' + path.join('.') + '" is invalid. Path: "' + path.slice(0, path.length - 1).join('.') + '" is type of "' + (currentState === null ? 'null' : typeof currentState === 'undefined' ? 'undefined' : _typeof$5(currentState)) + '"');
	          }

	          var currentValue = currentState[key];

	          cb(currentState[key], currentState, key);
	          if (currentState[key] !== currentValue || isComplexObject(currentState[key]) && isComplexObject(currentValue)) {
	            _this2.changedPaths.push({
	              path: path,
	              forceChildPathUpdates: forceChildPathUpdates
	            });
	          }
	        } else if (!currentState[key]) {
	          currentState[key] = {};
	        }

	        return currentState[key];
	      }, this.state);
	    }
	  }, {
	    key: 'verifyValue',
	    value: function verifyValue(value, path) {
	      if (this.devtools && !isSerializable(value, this.devtools.allowedTypes)) {
	        throwError('You are passing a non serializable value into the state tree on path "' + path.join('.') + '"');
	      }
	      if (this.devtools) {
	        forceSerializable(value);
	      }
	      if (this.devtools && this.devtools.warnStateProps) {
	        addCerebralStateKey(value);
	      }
	    }
	  }, {
	    key: 'verifyValues',
	    value: function verifyValues(values, path) {
	      var _this3 = this;

	      if (this.devtools) {
	        values.forEach(function (value) {
	          _this3.verifyValue(value, path);
	        });
	      }
	    }
	  }, {
	    key: 'emitMutationEvent',
	    value: function emitMutationEvent(method, path) {
	      var arguments$1 = arguments;

	      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	        args[_key - 2] = arguments$1[_key];
	      }

	      this.controller.emit('mutation', {
	        method: method,
	        path: path,
	        args: args
	      });
	    }
	  }, {
	    key: 'get',
	    value: function get() {
	      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

	      return path.reduce(function (currentState, key) {
	        return currentState ? currentState[key] : undefined;
	      }, this.state);
	    }
	  }, {
	    key: 'set',
	    value: function set(path, value) {
	      this.verifyValue(value, path);
	      this.updateIn(path, function (_, parent, key) {
	        parent[key] = value;
	      }, true);
	      this.emitMutationEvent('set', path, value);
	    }
	  }, {
	    key: 'toggle',
	    value: function toggle(path) {
	      this.updateIn(path, function (value, parent, key) {
	        parent[key] = !value;
	      });
	      this.emitMutationEvent('toggle', path);
	    }
	  }, {
	    key: 'push',
	    value: function push(path, value) {
	      this.verifyValue(value, path);
	      this.updateIn(path, function (array) {
	        array.push(value);
	      });
	      this.emitMutationEvent('push', path, value);
	    }
	  }, {
	    key: 'merge',
	    value: function merge(path) {
	      var arguments$1 = arguments;
	      var this$1 = this;

	      for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        values[_key2 - 1] = arguments$1[_key2];
	      }

	      var value = Object.assign.apply(Object, values);

	      // If we already have an object we make it behave
	      // like multiple sets, indicating a change to very key.
	      // If no value it should indicate that we are setting
	      // a new object
	      if (this.get(path)) {
	        for (var prop in value) {
	          this$1.set(path.concat(prop), value[prop]);
	        }
	      } else {
	        this.set(path, value);
	      }
	      this.emitMutationEvent.apply(this, ['merge', path].concat(values));
	    }
	  }, {
	    key: 'pop',
	    value: function pop(path) {
	      this.updateIn(path, function (array) {
	        array.pop();
	      });
	      this.emitMutationEvent('pop', path);
	    }
	  }, {
	    key: 'shift',
	    value: function shift(path) {
	      this.updateIn(path, function (array) {
	        array.shift();
	      });
	      this.emitMutationEvent('shift', path);
	    }
	  }, {
	    key: 'unshift',
	    value: function unshift(path, value) {
	      this.verifyValue(value, path);
	      this.updateIn(path, function (array) {
	        array.unshift(value);
	      });
	      this.emitMutationEvent('unshift', path, value);
	    }
	  }, {
	    key: 'splice',
	    value: function splice(path) {
	      var arguments$1 = arguments;

	      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
	        args[_key3 - 1] = arguments$1[_key3];
	      }

	      this.verifyValues(args, path);
	      this.updateIn(path, function (array) {
	        array.splice.apply(array, args);
	      });
	      this.emitMutationEvent.apply(this, ['splice', path].concat(args));
	    }
	  }, {
	    key: 'unset',
	    value: function unset(path) {
	      this.updateIn(path, function (_, parent, key) {
	        delete parent[key];
	      }, true);
	      this.emitMutationEvent('unset', path);
	    }
	  }, {
	    key: 'concat',
	    value: function concat(path, value) {
	      this.verifyValue(value, path);
	      this.updateIn(path, function (array, parent, key) {
	        parent[key] = array.concat(value);
	      });
	      this.emitMutationEvent('concat', path, value);
	    }
	  }, {
	    key: 'increment',
	    value: function increment(path) {
	      var delta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

	      if (!Number.isInteger(delta)) {
	        throw new Error('Cerebral state.increment: you must increment with integer values.');
	      }
	      this.updateIn(path, function (value, parent, key) {
	        if (!Number.isInteger(value)) {
	          throw new Error('Cerebral state.increment: you must increment integer values.');
	        }
	        parent[key] = value + delta;
	      });
	      this.emitMutationEvent('increment', path, delta);
	    }
	  }]);

	  return Model;
	}(BaseModel);
	//# sourceMappingURL=Model.js.map

	var _createClass$d = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$d(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$8(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$8(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	/*
	  The controller is where everything is attached. The devtools
	  is attached directly. Also a top level module is created.
	  The controller creates the function tree that will run all signals,
	  based on top level providers and providers defined in modules
	*/

	var Controller = function (_BaseController) {
	  _inherits$8(Controller, _BaseController);

	  function Controller(rootModule, options) {
	    _classCallCheck$d(this, Controller);

	    var _this = _possibleConstructorReturn$8(this, (Controller.__proto__ || Object.getPrototypeOf(Controller)).call(this, rootModule, Object.assign({
	      Model: Model
	    }, options)));

	    _this.componentDependencyStore = new DependencyStore();
	    _this.flush = _this.flush.bind(_this);

	    _this.on('asyncFunction', function (execution, funcDetails) {
	      if (!funcDetails.isParallel) {
	        _this.flush();
	      }
	    });
	    _this.on('parallelStart', function () {
	      return _this.flush();
	    });
	    _this.on('parallelProgress', function (execution, currentPayload, functionsResolving) {
	      if (functionsResolving === 1) {
	        _this.flush();
	      }
	    });
	    _this.on('end', function () {
	      return _this.flush();
	    });
	    return _this;
	  }
	  /*
	    Whenever components needs to be updated, this method
	    can be called
	  */


	  _createClass$d(Controller, [{
	    key: 'flush',
	    value: function flush(force) {
	      var changes = this.model.flush();

	      if (!force && !Object.keys(changes).length) {
	        return;
	      }

	      this.updateComponents(changes, force);
	      this.emit('flush', changes, Boolean(force));
	    }
	  }, {
	    key: 'updateComponents',
	    value: function updateComponents(changes, force) {
	      var _this2 = this;

	      var componentsToRender = [];

	      if (force) {
	        componentsToRender = this.componentDependencyStore.getAllUniqueEntities();
	      } else {
	        componentsToRender = this.componentDependencyStore.getUniqueEntities(changes);
	      }

	      var start = Date.now();
	      componentsToRender.forEach(function (component) {
	        if (_this2.devtools) {
	          _this2.devtools.updateComponentsMap(component);
	        }
	        component.onUpdate(changes, force);
	      });
	      var end = Date.now();

	      if (this.devtools && componentsToRender.length) {
	        this.devtools.sendComponentsMap(componentsToRender, changes, start, end);
	      }
	    }
	  }]);

	  return Controller;
	}(BaseController);
	//# sourceMappingURL=Controller.js.map

	var _createClass$e = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$e(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$9(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$9(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	var UniversalController = function (_Controller) {
	  _inherits$9(UniversalController, _Controller);

	  function UniversalController(rootModule, controllerOptions) {
	    _classCallCheck$e(this, UniversalController);

	    var _this = _possibleConstructorReturn$9(this, (UniversalController.__proto__ || Object.getPrototypeOf(UniversalController)).call(this, rootModule, controllerOptions));

	    _this.changes = [];
	    _this.model.state = JSON.parse(JSON.stringify(_this.model.state));
	    _this.trackChanges = _this.trackChanges.bind(_this);
	    _this.on('flush', _this.trackChanges);
	    _this.hasRun = false;
	    return _this;
	  }

	  _createClass$e(UniversalController, [{
	    key: 'trackChanges',
	    value: function trackChanges(changes) {
	      this.changes = this.changes.concat(changes);
	    }
	  }, {
	    key: 'getChanges',
	    value: function getChanges() {
	      var _this2 = this;

	      return this.changes.reduce(function (changes, change) {
	        changes[change.path.join('.')] = _this2.getState(change.path);

	        return changes;
	      }, {});
	    }
	  }, {
	    key: 'getScript',
	    value: function getScript() {
	      var state = JSON.stringify(this.getChanges());

	      this.hasRun = true;
	      return '<script>window.CEREBRAL_STATE = ' + state + '</script>';
	    }
	  }, {
	    key: 'runSequence',
	    value: function runSequence(sequence, payload) {
	      var signalRun = void 0;

	      if (Array.isArray(sequence)) {
	        signalRun = this.run('UniversalController.run', sequence, payload);
	      } else if (typeof sequence === 'string') {
	        var pathArray = ensurePath(sequence);
	        var signalKey = pathArray.pop();
	        var module = getModule(pathArray, this.module);
	        var signalDefinition = module && module.signals[signalKey];

	        signalRun = this.run(sequence, signalDefinition.signal, payload);
	      } else {
	        throwError('Sequence must be a signal-path or an array of action.');
	      }

	      return signalRun;
	    }
	  }, {
	    key: 'setState',
	    value: function setState(path, value) {
	      this.model.set(ensurePath(path), value);
	      this.flush(true); // Track changes.
	    }
	  }]);

	  return UniversalController;
	}(Controller);
	//# sourceMappingURL=UniversalController.js.map

	function _classCallCheck$f(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$a(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$a(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	function _extendableBuiltin$1(cls) {
	  function ExtendableBuiltin() {
	    cls.apply(this, arguments);
	  }

	  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
	    constructor: {
	      value: cls,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });

	  if (Object.setPrototypeOf) {
	    Object.setPrototypeOf(ExtendableBuiltin, cls);
	  } else {
	    ExtendableBuiltin.__proto__ = cls;
	  }

	  return ExtendableBuiltin;
	}

	var ExtendableError = function (_extendableBuiltin2) {
	  _inherits$a(ExtendableError, _extendableBuiltin2);

	  function ExtendableError() {
	    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

	    _classCallCheck$f(this, ExtendableError);

	    // extending Error is weird and does not propagate `message`
	    var _this = _possibleConstructorReturn$a(this, (ExtendableError.__proto__ || Object.getPrototypeOf(ExtendableError)).call(this, message));

	    Object.defineProperty(_this, 'message', {
	      configurable: true,
	      enumerable: false,
	      value: message,
	      writable: true
	    });

	    Object.defineProperty(_this, 'name', {
	      configurable: true,
	      enumerable: false,
	      value: _this.constructor.name,
	      writable: true
	    });

	    if (Error.hasOwnProperty('captureStackTrace')) {
	      Error.captureStackTrace(_this, _this.constructor);
	      return _possibleConstructorReturn$a(_this);
	    }

	    Object.defineProperty(_this, 'stack', {
	      configurable: true,
	      enumerable: false,
	      value: new Error(message).stack,
	      writable: true
	    });
	    return _this;
	  }

	  return ExtendableError;
	}(_extendableBuiltin$1(Error));

	function _classCallCheck$g(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$b(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$b(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) { Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } }

	var CerebralError = function (_ExtendableError) {
	  _inherits$b(CerebralError, _ExtendableError);

	  function CerebralError(message, details) {
	    _classCallCheck$g(this, CerebralError);

	    var _this = _possibleConstructorReturn$b(this, (CerebralError.__proto__ || Object.getPrototypeOf(CerebralError)).call(this, message));

	    _this.name = 'CerebralError';
	    _this.details = details;
	    _this.toJSON = function () {
	      var _this2 = this;

	      return Object.getOwnPropertyNames(this).reduce(function (props, key) {
	        if (!['toJSON', 'execution', 'functionDetails'].includes(key)) {
	          props[key] = _this2[key];
	        }

	        return props;
	      }, {});
	    };
	    return _this;
	  }

	  return CerebralError;
	}(ExtendableError);
	//# sourceMappingURL=CerebralError.js.map

	var _createClass$f = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$h(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var DependencyTracker = function () {
	  function DependencyTracker(computed) {
	    _classCallCheck$h(this, DependencyTracker);

	    this.propsTrackMap = {};
	    this.stateTrackMap = {};
	    this.propsTrackFlatMap = {};
	    this.stateTrackFlatMap = {};
	    this.computed = computed;
	    this.value = null;
	  }

	  _createClass$f(DependencyTracker, [{
	    key: 'run',
	    value: function run(stateGetter, props) {
	      var newStateTrackMap = {};
	      var newPropsTrackMap = {};
	      var newPropsTrackFlatMap = {};
	      var newStateTrackFlatMap = {};
	      var stateTrackFlatMap = this.stateTrackFlatMap;
	      var propsTrackFlatMap = this.propsTrackFlatMap;
	      var propsGetter = getWithPath(props);
	      var hasChanged = false;

	      function setTrackMap(path, newTrackMap) {
	        var pathArray = path.split('.');
	        pathArray.reduce(function (currentNewTrackMapLevel, key, index) {
	          if (!currentNewTrackMapLevel[key]) {
	            hasChanged = true;
	            currentNewTrackMapLevel[key] = {};
	          }

	          if (index < pathArray.length - 1) {
	            currentNewTrackMapLevel[key].children = currentNewTrackMapLevel[key].children || {};
	          }

	          return currentNewTrackMapLevel[key].children;
	        }, newTrackMap);
	      }

	      this.value = this.computed.getValue({
	        state: function state(path) {
	          var value = stateGetter(path);
	          var strictPath = ensureStrictPath(path, value);

	          newStateTrackFlatMap[strictPath] = true;

	          if (!stateTrackFlatMap[strictPath]) { hasChanged = true; }
	          setTrackMap(strictPath, newStateTrackMap);

	          return value;
	        },
	        props: function props(path) {
	          newPropsTrackFlatMap[path] = true;

	          if (!propsTrackFlatMap[path]) { hasChanged = true; }
	          setTrackMap(path, newPropsTrackMap);

	          return propsGetter(path);
	        }
	      });

	      this.stateTrackMap = newStateTrackMap;
	      this.propsTrackMap = newPropsTrackMap;
	      this.stateTrackFlatMap = newStateTrackFlatMap;
	      this.propsTrackFlatMap = newPropsTrackFlatMap;

	      return hasChanged;
	    }
	  }, {
	    key: 'match',
	    value: function match(stateChanges, propsChanges) {
	      return Boolean(dependencyMatch(stateChanges, this.stateTrackMap).length) || Boolean(dependencyMatch(propsChanges, this.propsTrackMap).length);
	    }
	  }]);

	  return DependencyTracker;
	}();
	//# sourceMappingURL=DependencyTracker.js.map

	var _createClass$g = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) { descriptor.writable = true; } Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) { defineProperties(Constructor.prototype, protoProps); } if (staticProps) { defineProperties(Constructor, staticProps); } return Constructor; }; }();

	function _classCallCheck$i(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var View = function () {
	  function View(_ref) {
	    var _this = this;

	    var dependencies = _ref.dependencies,
	        mergeProps = _ref.mergeProps,
	        props = _ref.props,
	        controller = _ref.controller,
	        displayName = _ref.displayName,
	        onUpdate = _ref.onUpdate;

	    _classCallCheck$i(this, View);

	    if (typeof dependencies === 'function') {
	      throwError('You can not use a function to define dependencies. Use tags or a function on the specific property you want to dynamically create');
	    }

	    if (!dependencies) {
	      throwError('There is no reason to connect a component that has no dependencies');
	    }
	    this.stateGetter = this.stateGetter.bind(this);
	    this.signalGetter = this.signalGetter.bind(this);
	    this.signalsGetter = this.signalsGetter.bind(this);
	    this.mergeProps = mergeProps;
	    this.controller = controller;
	    this._displayName = displayName;
	    this._hasWarnedBigComponent = false;
	    this.isUnmounted = false;
	    this.updateComponent = onUpdate || noop;
	    this.propKeys = Object.keys(props || {});
	    this._verifyPropsWarned = false;

	    if (this.controller.devtools && this.controller.devtools.warnStateProps) {
	      this.verifyProps(props);
	    }

	    /*
	      First we find any dependency functions to convert to DependencyTrackers.
	      They are instantly run to produce their value and map of state
	      dependencies
	    */
	    this.dependencyTrackers = Object.keys(dependencies).reduce(function (currentDependencyTrackers, dependencyKey) {
	      if (dependencies[dependencyKey] instanceof Compute) {
	        currentDependencyTrackers[dependencyKey] = new DependencyTracker(dependencies[dependencyKey]);
	        currentDependencyTrackers[dependencyKey].run(_this.stateGetter, props);
	      }

	      return currentDependencyTrackers;
	    }, {});
	    this.dependencies = dependencies;
	    this.dependencyTrackersDependencyMaps = this.getDependencyTrackersDependencyMaps(props);
	    this.tagsDependencyMap = this.getTagsDependencyMap(props);
	  }
	  /*
	    A getter for StateTracker and tags to grab state from Cerebral
	  */


	  _createClass$g(View, [{
	    key: 'stateGetter',
	    value: function stateGetter(path) {
	      return this.controller.getState(path);
	    }
	    /*
	      A getter for tags to grab signals from Cerebral
	    */

	  }, {
	    key: 'signalGetter',
	    value: function signalGetter(path) {
	      try {
	        return this.controller.getSignal(path);
	      } catch (e) {}
	    }
	    /*
	      A getter for tags to grab signals of module from Cerebral
	    */

	  }, {
	    key: 'signalsGetter',
	    value: function signalsGetter(modulePath) {
	      return this.controller.getSignals(modulePath);
	    }
	    /*
	      A method to ensure objects and arrays from state tree are not passed as props
	    */

	  }, {
	    key: 'verifyProps',
	    value: function verifyProps(props) {
	      var key = getStateTreeProp(props);

	      if (key && !this._verifyPropsWarned) {
	        console.warn('You are passing an ' + (Array.isArray(props[key]) ? 'array' : 'object') + ' to the component "' + this._displayName + '" on prop "' + key + '" which is from the Cerebral state tree. You should not do this, but rather connect it directly to this component. This will optimize the component and avoid any rerender issues.');
	        this._verifyPropsWarned = true;
	      }
	    }
	  }, {
	    key: 'mount',
	    value: function mount() {
	      var depsMap = Object.assign({}, this.dependencyTrackersDependencyMaps.state, this.tagsDependencyMap);

	      this.controller.componentDependencyStore.addEntity(this, depsMap);

	      if (this.controller.devtools) {
	        this.controller.devtools.updateComponentsMap(this, depsMap);
	      }
	    }
	  }, {
	    key: 'onUpdate',
	    value: function onUpdate() {
	      if (this.isUnmounted) {
	        return;
	      }

	      this.updateComponent.apply(this, arguments);
	    }
	  }, {
	    key: 'unMount',
	    value: function unMount() {
	      var depsMap = Object.assign({}, this.dependencyTrackersDependencyMaps.state, this.tagsDependencyMap);
	      this.controller.componentDependencyStore.removeEntity(this, depsMap);

	      if (this.controller.devtools) {
	        this.controller.devtools.updateComponentsMap(this, null, depsMap);
	      }

	      this.isUnmounted = true;
	    }
	  }, {
	    key: 'onPropsUpdate',
	    value: function onPropsUpdate(props, nextProps) {
	      if (this.controller.devtools) {
	        this.verifyProps(nextProps);
	      }

	      var propsChanges = getChangedProps(props, nextProps);
	      if (propsChanges.length) {
	        this.updateFromProps(propsChanges, nextProps);

	        return true;
	      }

	      return false;
	    }
	    /*
	      Called by component when props are passed from parent and they
	      have changed. In this situation both tags and depndency trackers might
	      be affected. Tags are just updated and dependency trackers are matched
	      on props changed
	    */

	  }, {
	    key: 'updateFromProps',
	    value: function updateFromProps(propsChanges, props) {
	      this.update(props, this.updateDependencyTrackers({}, propsChanges, props));
	    }
	    /*
	      Called by Container when the components state dependencies
	      has changed. In this scenario we need to run any dependencyTrackers
	      that matches the state changes. There is no need to update the tags
	      as their declared state deps can not change
	    */

	  }, {
	    key: 'updateFromState',
	    value: function updateFromState(stateChanges, props, force) {
	      this.update(props, force ? this.forceUpdateDependencyTrackers() : this.updateDependencyTrackers(stateChanges, {}, props));
	    }
	    /*
	      Udpates the dependency trackers by checking state
	      changes and props changes
	    */

	  }, {
	    key: 'updateDependencyTrackers',
	    value: function updateDependencyTrackers(stateChanges, propsChanges, props) {
	      var _this2 = this;

	      var hasChanged = Object.keys(this.dependencyTrackers).reduce(function (hasChanged, key) {
	        if (_this2.dependencyTrackers[key].match(stateChanges, propsChanges)) {
	          _this2.dependencyTrackers[key].run(_this2.stateGetter, props);

	          return true;
	        }

	        return hasChanged;
	      }, false);

	      return hasChanged;
	    }
	    /*
	      Run update, re-evaluating the tags and computed, if neccessary
	    */

	  }, {
	    key: 'update',
	    value: function update(props, hasChangedDependencyTrackers) {
	      var prevDependencyTrackersDependencyMaps = this.dependencyTrackersDependencyMaps;
	      var previousTagsDependencyMap = this.tagsDependencyMap;

	      this.tagsDependencyMap = this.getTagsDependencyMap(props);
	      this.dependencyTrackersDependencyMaps = hasChangedDependencyTrackers ? this.getDependencyTrackersDependencyMaps(props) : this.dependencyTrackersDependencyMaps;

	      var prevDepsMap = Object.assign({}, prevDependencyTrackersDependencyMaps.state, previousTagsDependencyMap);
	      var nextDepsMap = Object.assign({}, this.dependencyTrackersDependencyMaps.state, this.tagsDependencyMap);
	      this.controller.componentDependencyStore.updateEntity(this, prevDepsMap, nextDepsMap);

	      if (this.controller.devtools) {
	        this.controller.devtools.updateComponentsMap(this, nextDepsMap, prevDepsMap);
	      }
	    }
	    /*
	      Forces update of all computed
	    */

	  }, {
	    key: 'forceUpdateDependencyTrackers',
	    value: function forceUpdateDependencyTrackers() {
	      var _this3 = this;

	      Object.keys(this.dependencyTrackers).forEach(function (key) {
	        _this3.dependencyTrackers[key].run(_this3.stateGetter, _this3.props);
	      });

	      return true;
	    }
	    /*
	      Go through dependencies and identify state trackers and
	      merge in their state dependencies
	    */

	  }, {
	    key: 'getDependencyTrackersDependencyMaps',
	    value: function getDependencyTrackersDependencyMaps(props) {
	      var _this4 = this;

	      return Object.keys(this.dependencies).reduce(function (currentDepsMaps, propKey) {
	        if (_this4.dependencyTrackers[propKey]) {
	          currentDepsMaps.state = Object.assign(currentDepsMaps.state, _this4.dependencyTrackers[propKey].stateTrackFlatMap);
	          currentDepsMaps.props = Object.assign(currentDepsMaps.props, _this4.dependencyTrackers[propKey].propsTrackFlatMap);

	          return currentDepsMaps;
	        }

	        return currentDepsMaps;
	      }, {
	        state: {},
	        props: {}
	      });
	    }
	    /*
	      Go through dependencies and extract tags related to state
	      dependencies
	    */

	  }, {
	    key: 'getTagsDependencyMap',
	    value: function getTagsDependencyMap(props) {
	      var _this5 = this;

	      return Object.keys(this.dependencies).reduce(function (currentDepsMap, propKey) {
	        if (_this5.dependencyTrackers[propKey]) {
	          return currentDepsMap;
	        }

	        if (!_this5.dependencies[propKey].getTags) {
	          throwError('Prop \'' + propKey + '\' should be a tag or a Compute.');
	        }

	        var getters = _this5.createTagGetters(props);

	        return _this5.dependencies[propKey].getTags(getters).reduce(function (updatedCurrentDepsMap, tag) {
	          if (tag.type === 'state') {
	            var path = tag.getPath(getters);
	            var strictPath = ensureStrictPath(path, _this5.stateGetter(path));

	            updatedCurrentDepsMap[strictPath] = true;
	          }

	          return updatedCurrentDepsMap;
	        }, currentDepsMap);
	      }, {});
	    }
	    /*
	      Creates getters passed into tags
	    */

	  }, {
	    key: 'createTagGetters',
	    value: function createTagGetters(props) {
	      return {
	        state: this.stateGetter,
	        props: props,
	        signal: this.signalGetter,
	        signals: this.signalsGetter
	      };
	    }
	    /*
	      Runs whenever the component has an update and renders.
	      Extracts the actual values from dependency trackers and/or tags
	    */

	  }, {
	    key: 'getProps',
	    value: function getProps() {
	      var _this6 = this;

	      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      var includeProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

	      var dependenciesProps = Object.keys(this.dependencies).reduce(function (currentProps, key) {
	        if (_this6.dependencyTrackers[key]) {
	          currentProps[key] = _this6.dependencyTrackers[key].value;
	        } else {
	          var tag = _this6.dependencies[key];
	          var getters = _this6.createTagGetters(props);

	          if (tag.type === 'state') {
	            var path = tag.getPath(getters);
	            var value = _this6.stateGetter(path);
	            if (path.substr(path.length - 2, 2) === '.*') {
	              currentProps[key] = value ? Object.keys(value) : [];
	            } else {
	              currentProps[key] = value;
	            }
	          } else {
	            currentProps[key] = tag.getValue(getters);
	          }
	        }

	        return currentProps;
	      }, {});

	      if (this.controller.devtools && this.controller.devtools.bigComponentsWarning && !this._hasWarnedBigComponent && Object.keys(this.dependencies).length >= this.controller.devtools.bigComponentsWarning) {
	        console.warn('Component named ' + this._displayName + ' has a lot of dependencies, consider refactoring or adjust this option in devtools');
	        this._hasWarnedBigComponent = true;
	      }

	      if (this.mergeProps) {
	        return this.mergeProps(dependenciesProps, props, createResolver(this.createTagGetters(props)));
	      }

	      return Object.assign({}, includeProps ? props : {}, dependenciesProps);
	    }
	  }]);

	  return View;
	}();
	//# sourceMappingURL=View.js.map

	function Controller$1(rootModule, options) {
	  return new Controller(rootModule, options);
	}

	function Module$1(definition) {
	  return new Module(definition);
	}
	//# sourceMappingURL=index.js.map

	// Firebase.init(FIREBASE_CONFIG);
	mithril.route.prefix('');

	// actions.js
	var action = function (ref) {
	    var state = ref.state;

	    state.set('foo', 'notbar');
	};

	//sequences.js
	var sequence$1 = [action];

	var module$2 = Module$1({
	    state: {
	        foo: 'bar',
	        count: 0
	    },
	    signals: {
	        init: sequence$1
	    }
	});

	var controller = Controller$1(module$2, {
	    devTools: null,
	    throwToConsole: true,
	    stateChanges: {}
	});

	// // m.route(document.getElementById('app'), '/', {
	// //     '/': {
	// //         render: () => m(Layout, m(Index))
	// //     },

	// //     '/profiles': {
	// //         render: () => m(Layout, m(Profiles))
	// //     }
	// // });

	// // import Controller from 'cerebral';
	// // import Model from 'cerebral-model-baobab';

	// // const controller = Controller(Model({
	// //   foo: 'bar' // some state
	// // }));

	controller.on('mutation', function () {
	    // m.redraw();
	});

	var One = {
	    initializeComp: controller.getSignal('init'),

	    view: function view(ref) {
	        var state = ref.state;

	        return [
	            mithril('p', controller.getState('foo')),
	            mithril('button', {
	                onclick: state.initializeComp
	            }, 'switch')
	        ];
	    }
	};

	mithril.route(document.getElementById('app'), '/', {
	    '/': {
	        render: function () { return mithril(One); }
	    }
	});

}());
