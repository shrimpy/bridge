
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./fesoa-bridge.cjs.production.min.js')
} else {
  module.exports = require('./fesoa-bridge.cjs.development.js')
}
