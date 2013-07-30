catbug.ns 'treeParser', (ns) ->

  ns.regExps =
    nonEmpty: /\S+/
    indentation: /^\s+/
    selectorAndAttrs: ///^
      ([^\{]+)
      (?:
        \{ (.*?) \}
      )?
    $///
    attribute: ///
      ([a-z_-]+)
      (?:
        =(?:
          "(.*?)" |
          '(.*?)' |
           (\S+)
        )
      )?
    ///
    comments: ///
      /\*[\s\S]*?\*/ |
      //.*
    ///g
  ns.regExps.attributes = new RegExp(ns.regExps.attribute.source, 'g')


  ns.parseTree = (treeString) ->

    nonEmpty = (str) -> ns.regExps.nonEmpty.test str

    getLevel = (line) ->
      level: ns.regExps.indentation.exec(line)?[0].length or 0
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

    treeString = treeString.replace ns.regExps.comments, ''

    lines = _.chain(treeString.split '\n')
      .filter(nonEmpty)
      .map(getLevel)
      .value()

    normalize lines
    getRoots lines, null


  ns.parseLine = (line) ->
    parts = ns.regExps.selectorAndAttrs.exec line
    unless parts
      throw new Error 'wrong syntax'

    selector: $.trim parts[1]
    attributes: ns.parseAttributes parts[2]


  ns.parseAttributes = (attributes) ->
    result = {}
    if attributes
      for attr in attributes.match ns.regExps.attributes
        tmp = ns.regExps.attribute.exec attr
        name = tmp[1]
        value = tmp[4] or tmp[3] or tmp[2]
        result[name] = value
    result


  ns.flat = (roots) ->
    result = []

    add = (nodes) ->
      for node in nodes
        result.push node
        add node.children

    add roots

    result


  ns.parse = (treeString) ->
    lines = ns.flat ns.parseTree treeString
    for line in lines
      _.extend line, ns.parseLine line.data

