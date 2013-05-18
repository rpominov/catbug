catbug.ns 'treeParser', ->

  nonEmpty = (str) -> /\S+/.test str
  getLevel = (line) ->
    level: /^\s+/.exec(line)?[0].length or 0
    data: $.trim line

  @parseToRaw = (treeString) ->

    lines = _.chain(treeString.split '\n')
      .filter(nonEmpty)
      .map(getLevel)
      .value()

    normalize = (objects, prop='level') ->
      minLevel = _.min _.pluck objects, 'level'
      for object in objects
        object[prop] = object.level - minLevel

    normalize lines

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

    getRoots lines, null

  @flat = (roots) ->
    result = []

    add = (nodes) ->
      for node in nodes
        result.push node
        add node.children

    add roots

    result

  @parseAttributes = (attributes) ->
    result = {}
    if attributes
      for attr in attributes.split /\s+/
        [name, value] = attr.split '='
        result[name] = value?.replace(/^["']|["']$/g, '')
    result

  @parseLine = (line) ->
    parts = /^([^\(\)]+)(?:\(([^\(\)]+)\))?$/.exec line
    if parts
      return {
        selector: $.trim parts[1]
        attributes: @parseAttributes parts[2]
      }
    else
      throw new Error 'wrong syntax'

  @parse = (treeString) ->
    raw = @parseToRaw treeString

    if raw.length != 1
      throw new Error 'more than one root'

    elements = @flat raw

    for element in elements
      _.extend element, @parseLine element.data
      element.selector = element.selector.replace '&', element.parent?.selector

    elements = _.map elements, (e) ->
      _.pick e, 'selector', 'attributes', 'level'

    root: _.findWhere elements, level: 0
    elements: _.filter elements, (e) -> e.level > 0
