import express from 'express'
import { join } from 'path'
import webpackMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import webpackConfig from '../../webpack.config'
import webpack from 'webpack'
import renderHtml from './htmlRenderer'
import WriteFilePlugin from 'write-file-webpack-plugin'

import { createElement } from 'react'

const PRODUCTION = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 8080
const PATH = join(__dirname, '../../static')
const SERVER_BUNDLE = join(PATH, 'serverBundle.js')

let bundleValid
let renderToString

const app = express()

app.use('/static', express.static(PATH))

if (PRODUCTION) {
  renderToString = require(SERVER_BUNDLE)
} else {
  webpackConfig.watch = true
  webpackConfig.entry.bundle = [
    'react-hot-loader/patch',
    `webpack-hot-middleware/client?path=http://localhost:${PORT}/__webpack_hmr?reload=false`,
    'webpack/hot/only-dev-server'
  ].concat(webpackConfig.entry.bundle)
  webpackConfig.plugins = webpackConfig.plugins.concat([
    new WriteFilePlugin({
      test: /serverBundle\.js$/,
      log: false,
      force: true
    })
  ])

  const compiler = webpack(webpackConfig)
  const webpackMiddlewareInstance = webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    noInfo: false,
    quiet: false,
    stats: {
      version: true,
      timings: true,
      modules: false,
      errorDetails: true,
      chunkModules: false,
      colors: true
    }
  })

  app.use(webpackMiddlewareInstance)

  app.use(hotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }))

  // Add watcher for bundle changes
  bundleValid = new Promise(resolve => {
    webpackMiddlewareInstance.waitUntilValid(() => {
      if (renderToString) {
        delete require.cache[require.resolve(SERVER_BUNDLE)]
      }

      renderToString = require(SERVER_BUNDLE)
      resolve()
    })
  })
}

app.get('*', (req, res) => {
  try {
    if (bundleValid) {
      bundleValid.then(() => {
        res.status(200).send(renderHtml(renderToString))
      })
    } else {
      res.status(200).send(renderHtml(renderToString))
    }
  } catch (err) {
    res.status(500).send(err.message ? err.message : err)
  }
})

app.listen(PORT, 'localhost', err => {
  if (err) {
    throw err
  }

  console.log(`\n☕  Hooray! The server is running. Navigate to http://localhost:${PORT} to access it.\n`);
})

