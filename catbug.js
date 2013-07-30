/*! catbug 0.1.6
 *  2013-07-30 17:48:46 +0400
 *  http://github.com/pozadi/catbug
 */


/***  src/_intro  ***/

;(function(window, $, _){
;


/***  src/catbug  ***/

var catbug;

window.catbug = catbug = function() {
  return catbug.core.module.apply(catbug, arguments);
};

catbug.ns = function(path, cb) {
  var node, part, _i, _len, _ref;

  node = this;
  _ref = path.split('.');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    part = _ref[_i];
    if (part) {
      node = (node[part] || (node[part] = {}));
    }
  }
  return cb(node, this);
};


/***  src/tree-parser  ***/

catbug.ns('treeParser', function(ns) {
  ns.regExps = {
    nonEmpty: /\S+/,
    indentation: /^\s+/,
    selectorAndAttrs: /^([^\{]+)(?:\{(.*?)\})?$/,
    attribute: /([a-z_-]+)(?:=(?:"(.*?)"|'(.*?)'|(\S+)))?/,
    comments: /\/\*[\s\S]*?\*\/|\/\/.*/g
  };
  ns.regExps.attributes = new RegExp(ns.regExps.attribute.source, 'g');
  ns.parseTree = function(treeString) {
    var getLevel, getRoots, lines, nonEmpty, normalize;

    nonEmpty = function(str) {
      return ns.regExps.nonEmpty.test(str);
    };
    getLevel = function(line) {
      var _ref;

      return {
        level: ((_ref = ns.regExps.indentation.exec(line)) != null ? _ref[0].length : void 0) || 0,
        data: $.trim(line)
      };
    };
    normalize = function(objects, prop) {
      var minLevel, object, _i, _len, _results;

      if (prop == null) {
        prop = 'level';
      }
      minLevel = _.min(_.pluck(objects, 'level'));
      _results = [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        _results.push(object[prop] = object.level - minLevel);
      }
      return _results;
    };
    getRoots = function(objects, parent) {
      var addCurrent, current, object, rest, result, _i, _len;

      normalize(objects, 'normLevel');
      result = [];
      current = null;
      addCurrent = function() {
        var node;

        if (current) {
          node = {
            data: current.data,
            level: current.level,
            parent: parent
          };
          node.children = getRoots(rest, node);
          return result.push(node);
        }
      };
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        if (object.normLevel > 0) {
          if (current) {
            rest.push(object);
          } else {
            throw new Error('unexpected indent');
          }
        } else {
          addCurrent();
          current = object;
          rest = [];
        }
      }
      addCurrent();
      return result;
    };
    treeString = treeString.replace(ns.regExps.comments, '');
    lines = _.chain(treeString.split('\n')).filter(nonEmpty).map(getLevel).value();
    normalize(lines);
    return getRoots(lines, null);
  };
  ns.parseLine = function(line) {
    var parts;

    parts = ns.regExps.selectorAndAttrs.exec(line);
    if (!parts) {
      throw new Error('wrong syntax');
    }
    return {
      selector: $.trim(parts[1]),
      attributes: ns.parseAttributes(parts[2])
    };
  };
  ns.parseAttributes = function(attributes) {
    var attr, name, result, tmp, value, _i, _len, _ref;

    result = {};
    if (attributes) {
      _ref = attributes.match(ns.regExps.attributes);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        tmp = ns.regExps.attribute.exec(attr);
        name = tmp[1];
        value = tmp[4] || tmp[3] || tmp[2];
        result[name] = value;
      }
    }
    return result;
  };
  ns.flat = function(roots) {
    var add, result;

    result = [];
    add = function(nodes) {
      var node, _i, _len, _results;

      _results = [];
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        result.push(node);
        _results.push(add(node.children));
      }
      return _results;
    };
    add(roots);
    return result;
  };
  return ns.parse = function(treeString) {
    var line, lines, _i, _len, _results;

    lines = ns.flat(ns.parseTree(treeString));
    _results = [];
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      _results.push(_.extend(line, ns.parseLine(line.data)));
    }
    return _results;
  };
});


/***  src/element-meta  ***/

catbug.ns('elementMeta', function(ns, top) {
  ns.selectorToName = function(selector) {
    return $.camelCase(selector.replace(/[^a-z0-9]+/ig, '-').replace(/^-/, '').replace(/-$/, '').replace(/^js-/, ''));
  };
  ns.getName = function(element) {
    if (element.attributes.name) {
      return element.attributes.name;
    } else {
      return ns.selectorToName(element.selector);
    }
  };
  return ns.getInfos = function(treeString) {
    var element, elements, root, roots, _i, _len, _ref;

    elements = top.treeParser.parse(treeString);
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      element = elements[_i];
      element.selector = element.selector.replace('&', (_ref = element.parent) != null ? _ref.selector : void 0);
      element.name = ns.getName(element);
    }
    roots = _.where(elements, {
      level: 0
    });
    if (roots.length > 1) {
      throw new Error('more than one root');
    }
    root = roots[0];
    return {
      root: root,
      elements: _.without(elements, root)
    };
  };
});


/***  src/jquery-plugin  ***/

catbug.ns('core', function(ns) {
  return jQuery.prototype.catbug = function(name) {
    var el;

    el = this.get(0);
    if (el) {
      return ns.instances[name].init(el);
    }
  };
});


/***  src/jquery-sub  ***/

/* Here lives .sub() function that was in jQuery one time, but now is removed.
 *
 * It creates a new copy of jQuery whose properties and methods can be
 * modified without affecting the original jQuery object.
 * http://api.jquery.com/jQuery.sub/
 *
 * Code taken from here (we don't need whole plugin):
 *   https://github.com/jquery/jquery-migrate/blob/master/src/core.js#L89-109
 */


catbug.ns('jquerySub', function(ns, top) {

  ns.sub = function() {
    function jQuerySub( selector, context ) {
      return new jQuerySub.fn.init( selector, context );
    }
    $.extend( true, jQuerySub, $ );
    jQuerySub.superclass = $;
    jQuerySub.fn = jQuerySub.prototype = $();
    jQuerySub.fn.constructor = jQuerySub;
    jQuerySub.fn.init = function init( selector, context ) {
      if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
        context = jQuerySub( context );
      }

      return $.fn.init.call( this, selector, context, rootjQuerySub );
    };
    jQuerySub.fn.init.prototype = jQuerySub.fn;
    var rootjQuerySub = jQuerySub(document);
    return jQuerySub;
  };

});



/***  src/builder-context  ***/

catbug.ns('builderContext', function(ns, top) {
  ns.jQuery = top.jquerySub.sub();
  ns.jQuery.prototype.update = function(names) {
    var name, _i, _len, _ref, _results;

    _ref = names.split(' ');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      _results.push(this[name].update());
    }
    return _results;
  };
  ns.jQuery.prototype.updateAll = function() {
    var info, _i, _len, _ref, _results;

    _ref = this.__elements;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      info = _ref[_i];
      _results.push(this[info.name].update());
    }
    return _results;
  };
  return ns.create = function(root, elements) {
    return _.extend(ns.jQuery(root), {
      root: root,
      __elements: elements
    }, elements);
  };
});


/***  src/element  ***/

catbug.ns('element', function(ns, top) {
  var domEl;

  domEl = function(el) {
    if (el.jquery) {
      return el.get(0);
    } else {
      return el;
    }
  };
  ns.jQuery = top.jquerySub.sub();
  ns.jQuery.prototype.update = function() {
    var el, _i, _len, _ref;

    this.splice(0, this.length);
    _ref = $(this.selector, this.context);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      this.push(el);
    }
    return this;
  };
  ns.jQuery.prototype.byChild = function(child) {
    child = domEl(child);
    return this.filter(function() {
      return $.contains(this, child);
    });
  };
  ns.jQuery.prototype.byParent = function(parent) {
    parent = domEl(parent);
    return this.filter(function() {
      return $.contains(parent, this);
    });
  };
  ns.jQuery.prototype.live = function(types, data, fn) {
    $(this.context).on(types, this.selector, data, fn);
    return this;
  };
  ns.jQuery.prototype.die = function(types, fn) {
    $(this.context).off(types, this.selector, fn);
    return this;
  };
  return ns.create = function(selector, context) {
    return _.extend(ns.jQuery(selector, context), {
      selector: selector
    });
  };
});


/***  src/core  ***/

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

catbug.ns('core', function(ns, top) {
  ns.instances = {};
  ns.Module = (function() {
    function Module(name, rootSelector, elements, builder) {
      this.name = name;
      this.rootSelector = rootSelector;
      this.elements = elements;
      this.builder = builder;
      this.initAll = __bind(this.initAll, this);
    }

    Module.prototype.buildElements = function(context) {
      var info, result, _i, _len, _ref;

      result = {};
      _ref = this.elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        info = _ref[_i];
        result[info.name] = top.element.create(info.selector, context);
      }
      return result;
    };

    Module.prototype.init = function(el) {
      var context, dataKey;

      el = $(el);
      dataKey = "catbug-" + this.name;
      if (!el.data(dataKey)) {
        context = top.builderContext.create(el, this.buildElements(el));
        el.data(dataKey, this.builder.call(context, context));
      }
      return el.data(dataKey);
    };

    Module.prototype.initAll = function() {
      var el, _i, _len, _ref, _results;

      _ref = $(this.rootSelector);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        _results.push(this.init(el));
      }
      return _results;
    };

    return Module;

  })();
  ns.module = function(tree, name, builder) {
    var elementInfos, module;

    if (builder == null) {
      builder = name;
      name = _.uniqueId('lambda-');
    }
    elementInfos = top.elementMeta.getInfos(tree);
    ns.instances[name] = module = new ns.Module(name, elementInfos.root.selector, elementInfos.elements, builder);
    return $(module.initAll);
  };
  top.init = function(names) {
    var name, result, _i, _len, _ref;

    result = {};
    _ref = names.split(' ');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      result[name] = ns.instances[name].initAll();
    }
    return result;
  };
  return top.initAll = function() {
    var module, name, result, _ref;

    result = {};
    _ref = ns.instances;
    for (name in _ref) {
      module = _ref[name];
      result[name] = module.initAll();
    }
    return result;
  };
});


/***  src/_outro  ***/

}(this, this.jQuery, this._));

