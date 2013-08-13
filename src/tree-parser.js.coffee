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


  class ns.Branch
    constructor: (@parent, @data) ->
      @children = []
    append: (item) ->
      @children.push item


  ns.parseTree = (treeString) ->
    treeString = treeString.replace(ns.regExps.comments, '')
    lines = treeString.split '\n'
    lines = _.filter lines, nonEmpty

    if lines.length == 0
      return {roots: [], flat: []}

    currentBranch = new ns.Branch null, null
    roots = currentBranch.children
    currentLevel = getLevel lines[0]
    lastBranch = null
    flat = []
    identStep = null

    for line in lines
      level = getLevel line

      if level > currentLevel
        if identStep is null
          identStep = level - currentLevel
        if level - currentLevel isnt identStep
          throw new Error 'wrong ident step'
        currentBranch = lastBranch

      if level < currentLevel
        if identStep is null
          throw new Error 'unexpected indent'
        diff = currentLevel - level
        if diff % identStep isnt 0
          throw new Error 'wrong ident step'
        while (diff >= identStep)
          diff -= identStep
          currentBranch = currentBranch.parent
          if currentBranch == null
            throw new Error 'unexpected indent'

      currentLevel = level
      lastBranch = new ns.Branch currentBranch, $.trim(line)
      currentBranch.append lastBranch
      flat.push lastBranch

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
