import webpack from 'webpack'

export default function () {
  this.extendBuild((config, context) => {
    if (context.isClient) {
      config.devtool = false
      config.plugins.push(
        new webpack.EvalSourceMapDevToolPlugin({
          sourceRoot: this.options.rootDir,
        })
      )
    }
  })
}
