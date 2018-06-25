const webpack = require('webpack');

let env = '"development"';
if(process.env.NODE_ENV === "production") {
  env = '"production"';
}

module.exports = {
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  plugins: [
    // ...
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: env
      }
    })
  ]
};
