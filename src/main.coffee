window.catbug = catbug = ->
  catbug.core.module.apply catbug, arguments

catbug.ns = (path, cb) ->
  node = this
  for part in path.split('.') when part
    node = (node[part] or= {})
  cb node, this
