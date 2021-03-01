
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./bridge.cjs.production.min.js')
} else {
  module.exports = require('./bridge.cjs.development.js')
}
