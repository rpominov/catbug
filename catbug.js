/*! catbug 0.2.2
 *  2013-11-03 17:04:10 +0400
 *  http://github.com/pozadi/catbug
 */
;(function(window, $, _){

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

catbug.ns('treeParser', function(ns) {
  var getLevel, nonEmpty;

  ns.regExps = {
    nonEmpty: /\S+/,
    indentation: /^\s+/,
    selectorAndAttrs: /^([^\{]+)(?:\{(.*?)\})?$/,
    attribute: /([a-z_-]+)(?:=(?:"(.*?)"|'(.*?)'|(\S+)))?/,
    comments: /\/\*[\s\S]*?\*\/|\/\/.*/g
  };
  ns.regExps.attributes = new RegExp(ns.regExps.attribute.source, 'g');
  getLevel = function(line) {
    var _ref;

    return ((_ref = ns.regExps.indentation.exec(line)) != null ? _ref[0].length : void 0) || 0;
  };
  nonEmpty = function(str) {
    return ns.regExps.nonEmpty.test(str);
  };
  ns.TreeNode = (function() {
    function TreeNode(data) {
      this.data = data != null ? data : null;
      this.children = [];
    }

    TreeNode.prototype.append = function(item) {
      item.parent = this;
      return this.children.push(item);
    };

    return TreeNode;

  })();
  ns.parseTree = function(treeString) {
    var currentLevel, currentNode, diff, flat, identStep, lastNode, level, line, lines, root, roots, _i, _j, _len, _len1;

    treeString = treeString.replace(ns.regExps.comments, '');
    lines = treeString.split('\n');
    lines = _.filter(lines, nonEmpty);
    if (lines.length === 0) {
      return {
        roots: [],
        flat: []
      };
    }
    currentNode = new ns.TreeNode;
    roots = currentNode.children;
    currentLevel = getLevel(lines[0]);
    lastNode = null;
    flat = [];
    identStep = null;
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      level = getLevel(line);
      if (level > currentLevel) {
        if (identStep === null) {
          identStep = level - currentLevel;
        }
        if (level - currentLevel !== identStep) {
          throw new Error('wrong ident step');
        }
        currentNode = lastNode;
      }
      if (level < currentLevel) {
        if (identStep === null) {
          throw new Error('unexpected indent');
        }
        diff = currentLevel - level;
        if (diff % identStep !== 0) {
          throw new Error('wrong ident step');
        }
        while (diff >= identStep) {
          diff -= identStep;
          currentNode = currentNode.parent;
          if (currentNode === null) {
            throw new Error('unexpected indent');
          }
        }
      }
      currentLevel = level;
      lastNode = new ns.TreeNode($.trim(line));
      currentNode.append(lastNode);
      flat.push(lastNode);
    }
    for (_j = 0, _len1 = roots.length; _j < _len1; _j++) {
      root = roots[_j];
      root.parent = null;
    }
    return {
      roots: roots,
      flat: flat
    };
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
  return ns.parse = function(treeString) {
    var line, lines, _i, _len, _results;

    lines = ns.parseTree(treeString).flat;
    _results = [];
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      _results.push(_.extend(line, ns.parseLine(line.data)));
    }
    return _results;
  };
});

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
      element.global = 'global' in element.attributes;
    }
    if (elements.length === 0) {
      throw new Error('there is no elements');
    }
    roots = _.filter(elements, function(el) {
      return (el.parent === null) && (!el.global);
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

catbug.ns('core', function(ns) {
  return jQuery.prototype.catbug = function(name) {
    var el;

    el = this.get(0);
    if (el) {
      return ns.instances[name].init(el);
    }
  };
});

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

catbug.ns('builderContext', function(ns, top) {
  var BuilderContext;

  BuilderContext = (function() {
    function BuilderContext(el, root) {
      this.el = el;
      this.root = root;
      this.el.root = this.root;
    }

    BuilderContext.prototype.update = function(names) {
      var name, _i, _len, _results;

      if (_.isString(names)) {
        names = names.split(' ');
      }
      _results = [];
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        _results.push(this.el[name].update());
      }
      return _results;
    };

    BuilderContext.prototype.updateAll = function() {
      var el, _i, _len, _ref, _results;

      _ref = this.el;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        _results.push(el.update());
      }
      return _results;
    };

    return BuilderContext;

  })();
  return ns.create = function(root, elements) {
    return new BuilderContext(elements, root);
  };
});

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
  return ns.create = function(info, defaultContext) {
    var context, selector;

    selector = info.selector;
    context = info.global ? window.document : defaultContext;
    return _.extend(ns.jQuery(selector, context), {
      selector: selector,
      context: context,
      info: info
    });
  };
});

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

    Module.prototype._buildElements = function(defaultContext) {
      var info, result, _i, _len, _ref;

      result = {};
      _ref = this.elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        info = _ref[_i];
        result[info.name] = top.element.create(info, defaultContext);
      }
      return result;
    };

    Module.prototype.init = function(el) {
      var context, dataKey;

      el = $(el);
      dataKey = "catbug-" + this.name;
      if (!el.data(dataKey)) {
        context = top.builderContext.create(el, this._buildElements(el));
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
    $(module.initAll);
    return module;
  };
  top.init = function(names) {
    var name, result, _i, _len;

    if (_.isString(names)) {
      names = names.split(' ');
    }
    result = {};
    for (_i = 0, _len = names.length; _i < _len; _i++) {
      name = names[_i];
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

}(this, this.jQuery, this._));
