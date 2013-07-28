# = require _intro
# = require_self
# = require tree-parser
# = require jquery-plugin
# = require jquery-sub
# = require builder-context
# = require element
# = require core
# = require _outro

window.catbug = catbug = ->
  catbug.core.module.apply catbug, arguments

catbug.ns = (path, cb) ->
  node = this
  for part in path.split('.') when part
    node = (node[part] or= {})
  cb node, this
