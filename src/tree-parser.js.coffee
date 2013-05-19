catbug.ns 'treeParser', (ns) ->

  ns.sideQuotes = /^["']|["']$/g
  ns.nonEmpty = /\S+/
  ns.indentation = /^\s+/
  ns.selectorAndAttrs = /^([^\(\)]+)(?:\(([^\(\)]+)\))?$/
  ns.attribute = /([a-z_-]+)(?:=(?:\"(.*?)\"|\'(.*?)\'|(\S+)))?/
  ns.attributes = new RegExp(ns.attribute.source, 'g')

  ns.parseToRaw = (treeString) ->

    nonEmpty = (str) -> ns.nonEmpty.test str

    getLevel = (line) ->
      level: ns.indentation.exec(line)?[0].length or 0
      data: $.trim line

    normalize = (objects, prop='level') ->
      minLevel = _.min _.pluck objects, 'level'
      for object in objects
        object[prop] = object.level - minLevel

    getRoots = (objects, parent) ->
      normalize objects, 'normLevel'

      result = []
      current = null

      addCurrent = ->
        if current
          node =
            data: current.data
            level: current.level
            parent: parent
          node.children = getRoots rest, node
          result.push node

      for object in objects
        if object.normLevel > 0
          if current
            rest.push object
          else
            throw new Error 'unexpected indent'
        else
          addCurrent()
          current = object
          rest = []
      addCurrent()

      result

    lines = _.chain(treeString.split '\n')
      .filter(nonEmpty)
      .map(getLevel)
      .value()

    normalize lines
    getRoots lines, null

  ns.flat = (roots) ->
    result = []

    add = (nodes) ->
      for node in nodes
        result.push node
        add node.children

    add roots

    result

  ns.parseAttributes = (attributes) ->
    result = {}
    if attributes
      for attr in attributes.match ns.attributes
        tmp = ns.attribute.exec attr
        name = tmp[1]
        value = tmp[4] or tmp[3] or tmp[2]
        result[name] = value
    result

  ns.parseLine = (line) ->
    parts = ns.selectorAndAttrs.exec line
    unless parts
      throw new Error 'wrong syntax'

    selector: $.trim parts[1]
    attributes: ns.parseAttributes parts[2]

  ns.selectorToName = (selector) ->
    $.camelCase selector
      .replace(/[^a-z0-9]+/ig, '-')
      .replace(/^-/, '')
      .replace(/-$/, '')
      .replace(/^js-/, '')

  ns.genName = (element) ->
    if element.attributes.name
      element.name = element.attributes.name
    else
      element.name = ns.selectorToName element.selector

  ns.parse = (treeString) ->
    raw = ns.parseToRaw treeString

    if raw.length != 1
      throw new Error 'more than one root'

    elements = ns.flat raw

    for element in elements
      _.extend element, ns.parseLine element.data
      element.selector = element.selector.replace '&', element.parent?.selector

    _.each elements, ns.genName

    root: _.findWhere elements, {level: 0}
    elements: _.filter elements, (e) -> e.level > 0
