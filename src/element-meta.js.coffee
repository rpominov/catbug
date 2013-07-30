catbug.ns 'elementMeta', (ns, top) ->


  ns.selectorToName = (selector) ->
    $.camelCase selector
      .replace(/[^a-z0-9]+/ig, '-')
      .replace(/^-/, '')
      .replace(/-$/, '')
      .replace(/^js-/, '')


  ns.getName = (element) ->
    if element.attributes.name
      element.attributes.name
    else
      ns.selectorToName element.selector


  ns.getInfos = (treeString) ->
    elements = top.treeParser.parse treeString

    for element in elements
      element.selector = element.selector.replace '&', element.parent?.selector
      element.name = ns.getName element

    roots = _.where elements, {level: 0}

    if roots.length > 1
      throw new Error 'more than one root'

    root = roots[0]

    return {root, elements: _.without(elements, root)}


