const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const FileManagerWebpackPlugin = require('filemanager-webpack-plugin');
require('events').EventEmitter.defaultMaxListeners = 0; // 解除限制

const resolve = (dir) => path.resolve(__dirname, dir);

const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
module.exports = defineConfig({
  transpileDependencies: true,
  // 放弃baseUrl 一般运维会配置好的
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  // 打包目录
  outputDir: 'dist/infraMap',
  // 静态资源 的 打包路径
  assetsDir: 'static',
  // 保存时是 否 校验eslint配置
  lintOnSave: false,
  // 生产禁止显示源代码 默认关闭
  productionSourceMap: false,

  //  Webpack配置
  configureWebpack: {
    context: path.resolve(__dirname, './'),
    resolve: { 
      alias: { 
        '@': resolve('src'),
        '@shared': resolve('../shared') // 修正shared文件夹的alias配置
      } 
    },
    plugins: [
      ...(process.env.NODE_ENV === 'production'
        ? [
          new FileManagerWebpackPlugin({
            onStart: {
              delete: ['./dist/infraMap'],
            },
            onEnd: {
              archive: {
                source: './dist/infraMap',
                destination: './dist/infraMap.zip',
              },
            },
            test: productionGzipExtensions,
          }),
          ]
        : []),
    ],
  },
  chainWebpack: (config) => {
    // Vue 3.5 编译时 feature flags，消除告警
    const vueFlags = {
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: process.env.NODE_ENV !== 'production' ? 'true' : 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    };
    // 修改 feature-flags 插件（Vue CLI 5 对 Vue3 的配置）
    if (config.plugins.has('feature-flags')) {
      config.plugin('feature-flags').tap((args) => {
        Object.assign(args[0], vueFlags);
        return args;
      });
    } else {
      const webpack = require('webpack');
      config.plugin('feature-flags').use(webpack.DefinePlugin, [vueFlags]);
    }
    // 同时注入到 define 插件，确保所有模块都能被替换
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], vueFlags);
      return definitions;
    });

    config.plugins.delete('prefetch');
    if (process.env.NODE_ENV === 'production') {
      // 给js配置版本号 防止缓存
      config.output.filename('js/[name].' + Timestamp + '.js').end();
      config.output.chunkFilename('js/[name].' + Timestamp + '.js').end();
      config.plugin('compressionPlugin').use(
        new CompressionWebpackPlugin({
          threshold: 10240,
          test: /\.(js|css|html)$/, // 匹配文件名
        })
      );
    }

    // 配置JS loader包含shared文件夹
    config.module
      .rule('js')
      .include.add(resolve('test'))
      .add(resolve('src'))
      .add(resolve('../shared')) // 添加shared文件夹到JS处理范围
      .add(resolve('node_modules/webpack-dev-server/client'))
      .add(resolve('node_modules/element-plus'));

    // 配置Vue loader包含shared文件夹
    config.module
      .rule('vue')
      .include.add(resolve('src'))
      .add(resolve('../shared')); // 添加shared文件夹到Vue处理范围
    
    /* -----------------------------------------------------------
     * 样式 rule 统一处理：node_modules → 无 postcss
     *                      src/shared  → 有 postcss
     * --------------------------------------------------------- */
    const styleTypes = ['css', 'postcss', 'less', 'scss', 'sass', 'stylus'];

    styleTypes.forEach(type => {
      /* ① 取得原 rule */
      const baseRule = config.module.rule(type);

      /* ② 移除 CLI 自动创建的 oneOf（vue、normal 等） */
      baseRule.uses.clear();      // 清掉原 use（稍后会复用）
      baseRule.oneOfs.clear();    // 清掉原分支

      /* ③  给 node_modules 建立“无 postcss” 分支 */
      const lib = baseRule.oneOf('lib')
        .include.add(/node_modules/)  // 仅第三方包
        .end();

      lib
        .use('style-loader').loader('vue-style-loader').end()
        .use('css-loader').loader('css-loader').end();

      // less / sass / scss / stylus 需额外 loader
      if (['less', 'scss', 'sass', 'stylus'].includes(type)) {
        const extraLoader = {
          less:    'less-loader',
          scss:    'sass-loader',
          sass:    'sass-loader',
          stylus:  'stylus-loader'
        }[type];
        lib.use(extraLoader).loader(extraLoader).end();
      }

      /* ④  给 src / shared 建立“带 postcss” 分支 */
      const app = baseRule.oneOf('app')
        .include.add(resolve('src')).add(resolve('../shared')).add(path.resolve(__dirname)).end();

      app
        .use('style-loader').loader('vue-style-loader').end()
        .use('css-loader').loader('css-loader').end()
        .use('postcss-loader')                    // 仍走你现有 postcss.config.js
          .loader('postcss-loader')
          .options({ postcssOptions: require('./postcss.config') })
          .end();

      if (['less', 'scss', 'sass', 'stylus'].includes(type)) {
        const extraLoader = {
          less:    'less-loader',
          scss:    'sass-loader',
          sass:    'sass-loader',
          stylus:  'stylus-loader'
        }[type];
        app.use(extraLoader).loader(extraLoader).end();
      }
    });

    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif)(\?.*)?$/)
      .set('parser', {
        dataUrlCondition: {
          maxSize: 4000 * 1024, // 40kb
        },
      });

    config.module.rule('svg').exclude.add(resolve('src/icons')).end();
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end();

    config.optimization.splitChunks({
      chunks: 'async',
      maxSize: 0,
      minSize: 1000 * 1024,
      minChunks: 1,
      maxInitialRequests: 3,
      maxAsyncRequests: 5,
      automaticNameDelimiter: '~',
      cacheGroups: {
        elementPlus: {
          name: 'element-plus',
          test: /element-plus/,
          priority: 20,
          reuseExistingChunk: true,
        },
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial',
        },
        common: {
          name: 'chunk-common',
          priority: -20,
          minChunks: 2,
          chunks: 'initial',
          reuseExistingChunk: true,
        },
      },
    });
  },
});
