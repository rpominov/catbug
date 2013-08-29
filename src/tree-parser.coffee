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


  getLevel = (line) ->
    ns.regExps.indentation.exec(line)?[0].length or 0

  nonEmpty = (str) ->
    ns.regExps.nonEmpty.test str


  class ns.TreeNode
    constructor: (@data = null) ->
      @children = []
    append: (item) ->
      item.parent = this
      @children.push item


  ns.parseTree = (treeString) ->
    treeString = treeString.replace(ns.regExps.comments, '')
    lines = treeString.split '\n'
    lines = _.filter lines, nonEmpty

    if lines.length == 0
      return {roots: [], flat: []}

    currentNode = new ns.TreeNode
    roots = currentNode.children
    currentLevel = getLevel lines[0]
    lastNode = null
    flat = []
    identStep = null

    for line in lines
      level = getLevel line

      if level > currentLevel
        if identStep is null
          identStep = level - currentLevel
        if level - currentLevel isnt identStep
          throw new Error 'wrong ident step'
        currentNode = lastNode

      if level < currentLevel
        if identStep is null
          throw new Error 'unexpected indent'
        diff = currentLevel - level
        if diff % identStep isnt 0
          throw new Error 'wrong ident step'
        while (diff >= identStep)
          diff -= identStep
          currentNode = currentNode.parent
          if currentNode == null
            throw new Error 'unexpected indent'

      currentLevel = level
      lastNode = new ns.TreeNode $.trim(line)
      currentNode.append lastNode
      flat.push lastNode

    for root in roots
      root.parent = null

    {roots, flat}


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


  ns.parse = (treeString) ->
    lines = ns.parseTree(treeString).flat
    for line in lines
      _.extend line, ns.parseLine line.data
