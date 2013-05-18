/*! catbug.js 0.0.0
 *  2013-05-19 01:08:36 +0400
 *  https://github.com/pozadi/catbug.js
 */


/***  src/catbug  ***/

window.catbug = function() {
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
  ns.attrDelimiter = /\s+/;
  ns.sideQuotes = /^["']|["']$/g;
  ns.nonEmpty = /\S+/;
  ns.indentation = /^\s+/;
  ns.selectorAndAttrs = /^([^\(\)]+)(?:\(([^\(\)]+)\))?$/;
  ns.parseToRaw = function(treeString) {
    var getLevel, getRoots, lines, nonEmpty, normalize;

    nonEmpty = function(str) {
      return ns.nonEmpty.test(str);
    };
    getLevel = function(line) {
      var _ref;

      return {
        level: ((_ref = ns.indentation.exec(line)) != null ? _ref[0].length : void 0) || 0,
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
    lines = _.chain(treeString.split('\n')).filter(nonEmpty).map(getLevel).value();
    normalize(lines);
    return getRoots(lines, null);
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
  ns.parseAttributes = function(attributes) {
    var attr, name, result, value, _i, _len, _ref, _ref1;

    result = {};
    if (attributes) {
      _ref = attributes.split(ns.attrDelimiter);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        _ref1 = attr.split('='), name = _ref1[0], value = _ref1[1];
        result[name] = value != null ? value.replace(ns.sideQuotes, '') : void 0;
      }
    }
    return result;
  };
  ns.parseLine = function(line) {
    var parts;

    parts = ns.selectorAndAttrs.exec(line);
    if (!parts) {
      throw new Error('wrong syntax');
    }
    return {
      selector: $.trim(parts[1]),
      attributes: ns.parseAttributes(parts[2])
    };
  };
  ns.selectorToName = function(selector) {
    return $.camelCase(selector.replace(/[^a-z0-9]+/ig, '-').replace(/^-/, '').replace(/-$/, '').replace(/^js-/, ''));
  };
  ns.genName = function(element) {
    if (element.attributes.name) {
      return element.name = element.attributes.name;
    } else {
      return element.name = ns.selectorToName(element.selector);
    }
  };
  return ns.parse = function(treeString) {
    var element, elements, raw, _i, _len, _ref;

    raw = ns.parseToRaw(treeString);
    if (raw.length !== 1) {
      throw new Error('more than one root');
    }
    elements = ns.flat(raw);
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      element = elements[_i];
      _.extend(element, ns.parseLine(element.data));
      element.selector = element.selector.replace('&', (_ref = element.parent) != null ? _ref.selector : void 0);
    }
    elements = _.map(elements, function(e) {
      return _.pick(e, 'selector', 'attributes', 'level');
    });
    _.each(elements, ns.genName);
    return {
      root: _.findWhere(elements, {
        level: 0
      }),
      elements: _.filter(elements, function(e) {
        return e.level > 0;
      })
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

    Module.prototype.jqueries = function(context) {
      var info, result, _i, _len, _ref;

      result = {};
      _ref = this.elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        info = _ref[_i];
        result[info.name] = $(info.selector, context);
      }
      return result;
    };

    Module.prototype.builderContext = function(rootEl) {
      var method, result, _i, _len, _ref;

      result = {};
      _ref = ['find', 'on', 'off', 'data'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        method = _ref[_i];
        result[method] = _.bind(rootEl[method], rootEl);
      }
      return _.extend(result, this.jqueries(rootEl));
    };

    Module.prototype.init = function(el) {
      var dataKey;

      el = $(el);
      dataKey = "catbug-" + this.name;
      if (!el.data(dataKey)) {
        el.data(dataKey, this.builder.call(this.builderContext(el)));
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
  return ns.module = function(tree, name, constructor) {
    var module;

    if (constructor == null) {
      constructor = name;
      name = _.uniqueId('lambda-');
    }
    tree = top.treeParser.parse(tree);
    ns.instances[name] = module = new ns.Module(name, tree.root.selector, tree.elements, constructor);
    return $(module.initAll);
  };
});
