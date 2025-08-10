module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      if (env === 'production') {
        // Disable all optimization to avoid plugin conflicts
        webpackConfig.optimization.minimize = false;
        webpackConfig.optimization.minimizer = [];
        webpackConfig.devtool = false;
        
        // Also remove any CSS minimizer plugins that might cause issues
        if (webpackConfig.plugins) {
          webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
            const pluginName = plugin.constructor.name;
            return !['CssMinimizerPlugin', 'TerserPlugin', 'OptimizeCSSAssetsPlugin'].includes(pluginName);
          });
        }
      }
      
      return webpackConfig;
    },
  },
};
