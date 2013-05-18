/*! catbug.js 0.0.0
 *  2013-05-18 22:26:26 +0400
 *  https://github.com/pozadi/catbug.js
 */


/***  src/catbug  ***/

window.catbug = function() {
  return catbug.module.apply(catbug, arguments);
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
  return cb.call(node, this);
};


/***  src/tree-parser  ***/

catbug.ns('treeParser', function() {
  var getLevel, nonEmpty;

  nonEmpty = function(str) {
    return /\S+/.test(str);
  };
  getLevel = function(line) {
    var _ref;

    return {
      level: ((_ref = /^\s+/.exec(line)) != null ? _ref[0].length : void 0) || 0,
      data: $.trim(line)
    };
  };
  this.parseToRaw = function(treeString) {
    var getRoots, lines, normalize;

    lines = _.chain(treeString.split('\n')).filter(nonEmpty).map(getLevel).value();
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
    normalize(lines);
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
    return getRoots(lines, null);
  };
  this.flat = function(roots) {
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
  this.parseAttributes = function(attributes) {
    var attr, name, result, value, _i, _len, _ref, _ref1;

    result = {};
    if (attributes) {
      _ref = attributes.split(/\s+/);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        _ref1 = attr.split('='), name = _ref1[0], value = _ref1[1];
        result[name] = value != null ? value.replace(/^["']|["']$/g, '') : void 0;
      }
    }
    return result;
  };
  this.parseLine = function(line) {
    var parts;

    parts = /^([^\(\)]+)(?:\(([^\(\)]+)\))?$/.exec(line);
    if (parts) {
      return {
        selector: $.trim(parts[1]),
        attributes: this.parseAttributes(parts[2])
      };
    } else {
      throw new Error('wrong syntax');
    }
  };
  return this.parse = function(treeString) {
    var element, elements, raw, _i, _len, _ref;

    raw = this.parseToRaw(treeString);
    if (raw.length !== 1) {
      throw new Error('more than one root');
    }
    elements = this.flat(raw);
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      element = elements[_i];
      _.extend(element, this.parseLine(element.data));
      element.selector = element.selector.replace('&', (_ref = element.parent) != null ? _ref.selector : void 0);
    }
    elements = _.map(elements, function(e) {
      return _.pick(e, 'selector', 'attributes', 'level');
    });
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

jQuery.prototype.catbug = function() {};


/***  src/core  ***/


;
