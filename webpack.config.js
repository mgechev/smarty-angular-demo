const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rxPaths = require('rxjs/_esm5/path-mapping');
const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');
const postcssImports = require('postcss-import');
const AsyncDependenciesBlock = require('webpack/lib/AsyncDependenciesBlock');
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');
const basename = path.basename;

const { NoEmitOnErrorsPlugin, SourceMapDevToolPlugin, NamedModulesPlugin } = require('webpack');
const {
  NamedLazyChunksWebpackPlugin,
  BaseHrefWebpackPlugin,
  PostcssCliResources
} = require('@angular/cli/plugins/webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;
const { AngularCompilerPlugin } = require('@ngtools/webpack');

const webpack = require('webpack');

// const clusters = {
//   a: [
//     '/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/main.module.ts',
//     '/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/kid/home/home.module.ts',
//     '/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/parent/faq/faq.module.ts',
//     '/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/parent/verify/verify.module.ts',
//     '/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/parent/settings/settings.module.ts',
//     '/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/kid/friends/friends.module.ts',
//     '/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/kid/reports/reports.module.ts',
//     '/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/kid/earn/earn.module.ts',
//     '/Users/mgechev/Projects/smarty-demo-ejected/src/app/intro/intro.module.ts',
//     '/Users/mgechev/Projects/smarty-demo-ejected/src/app/app.module.ts'
//   ],
//   b: ['/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/kid/rewards/rewards.module.ts'],
//   c: ['/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/parent/parent-home/parent-home.module.ts'],
//   d: ['/Users/mgechev/Projects/smarty-demo-ejected/src/app/main/kid/question/question.module.ts']
// };

// -n 10
const clusters = {
  a: [
    '/Users/mgechev/Projects/smarty-demo/src/app/intro/intro.module.ts',
    '/Users/mgechev/Projects/smarty-demo/src/app/app.module.ts'
  ],
  b: [
    '/Users/mgechev/Projects/smarty-demo/src/app/main/kid/earn/earn.module.ts',
    '/Users/mgechev/Projects/smarty-demo/src/app/main/kid/home/home.module.ts'
  ],
  c: ['/Users/mgechev/Projects/smarty-demo/src/app/main/kid/rewards/rewards.module.ts'],
  d: ['/Users/mgechev/Projects/smarty-demo/src/app/main/parent/parent-home/parent-home.module.ts'],
  e: ['/Users/mgechev/Projects/smarty-demo/src/app/main/kid/question/question.module.ts'],
  f: ['/Users/mgechev/Projects/smarty-demo/src/app/main/kid/reports/reports.module.ts'],
  g: ['/Users/mgechev/Projects/smarty-demo/src/app/main/parent/settings/settings.module.ts'],
  h: ['/Users/mgechev/Projects/smarty-demo/src/app/main/parent/verify/verify.module.ts'],
  i: ['/Users/mgechev/Projects/smarty-demo/src/app/main/parent/faq/faq.module.ts'],
  j: ['/Users/mgechev/Projects/smarty-demo/src/app/main/kid/friends/friends.module.ts'],
  k: ['/Users/mgechev/Projects/smarty-demo/src/app/main/main.module.ts']
};

class ClusterizeChunks extends webpack.NamedChunksPlugin {
  constructor(clusters) {
    // Append a dot and number if the name already exists.
    const nameMap = new Map();
    function getUniqueName(baseName, request) {
      let name = baseName;
      let num = 0;
      while (nameMap.has(name) && nameMap.get(name) !== request) {
        name = `${baseName}${num++}`;
      }
      nameMap.set(name, request);
      return name;
    }

    const nameResolver = chunk => {
      // Entry chunks have a name already, use it.
      if (chunk.name) {
        return chunk.name;
      }

      // Try to figure out if it's a lazy loaded route or import().
      if (
        chunk.blocks &&
        chunk.blocks.length > 0 &&
        chunk.blocks[0] instanceof AsyncDependenciesBlock &&
        chunk.blocks[0].dependencies.length === 1 &&
        (chunk.blocks[0].dependencies[0] instanceof ContextElementDependency ||
          chunk.blocks[0].dependencies[0] instanceof ImportDependency)
      ) {
        // Create chunkname from file request, stripping ngfactory and extension.
        const request = chunk.blocks[0].dependencies[0].request;
        const chunkName = basename(request).replace(/(\.ngfactory)?\.(js|ts)$/, '');
        if (!chunkName || chunkName === '') {
          // Bail out if something went wrong with the name.
          return null;
        }
        let name = getUniqueName(chunkName, request);

        Object.keys(this.clusters).forEach(k => {
          const exists = this.clusters[k].some(f => f === request);
          if (exists) {
            this.chunksPerCluster[k] = this.chunksPerCluster[k] || 0;
            this.chunksPerCluster[k] += 1;
            this.clusterChunks[k] = this.clusterChunks[k] || [];
            this.clusterChunks[k].push(name + '.chunk.js');
            this.chunkToCluster[name + '.chunk.js'] = k;
          }
        });

        return name;
      }

      return null;
    };

    super(nameResolver);
    this.clusters = clusters;
  }

  apply(compiler) {
    super.apply(compiler);

    this.chunksPerCluster = {};
    this.chunkToCluster = {};
    this.clusterChunks = {};
    this.clusterSource = {};

    compiler.plugin('emit', (compilation, cb) => {
      const a = compilation.assets;

      Object.keys(a).forEach(k => {
        const cluster = this.chunkToCluster[k];
        if (!cluster) {
          return;
        }
        this.clusterSource[cluster] = this.clusterSource[cluster] || [];
        this.clusterSource[cluster].push(a[k]);

        this.chunksPerCluster[cluster]--;

        delete compilation.assets[k];

        const self = this;
        if (!this.chunksPerCluster[cluster]) {
          const chunks = this.clusterChunks[cluster];
          chunks.forEach(c => {
            compilation.assets[c] = {
              source() {
                return self.clusterSource[cluster].reduce((a, c) => {
                  return a + '\n' + c.source();
                }, '');
              },
              size() {
                return self.clusterSource[cluster].reduce((a, c) => a + c.size(), 0);
              }
            };
          });
        }
      });
      cb();
    });
  }
}

const nodeModules = path.join(process.cwd(), 'node_modules');
const realNodeModules = fs.realpathSync(nodeModules);
const genDirNodeModules = path.join(process.cwd(), 'src', '$$_gendir', 'node_modules');
const entryPoints = ['inline', 'polyfills', 'sw-register', 'styles', 'vendor', 'main'];
const hashFormat = { chunk: '', extract: '', file: '.[hash:20]', script: '' };
const baseHref = '';
const deployUrl = '';
const projectRoot = process.cwd();
const maximumInlineSize = 10;
const postcssPlugins = function(loader) {
  return [
    postcssImports({
      resolve: (url, context) => {
        return new Promise((resolve, reject) => {
          let hadTilde = false;
          if (url && url.startsWith('~')) {
            url = url.substr(1);
            hadTilde = true;
          }
          loader.resolve(context, (hadTilde ? '' : './') + url, (err, result) => {
            if (err) {
              if (hadTilde) {
                reject(err);
                return;
              }
              loader.resolve(context, url, (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            } else {
              resolve(result);
            }
          });
        });
      },
      load: filename => {
        return new Promise((resolve, reject) => {
          loader.fs.readFile(filename, (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            const content = data.toString();
            resolve(content);
          });
        });
      }
    }),
    postcssUrl({
      filter: ({ url }) => url.startsWith('~'),
      url: ({ url }) => {
        const fullPath = path.join(projectRoot, 'node_modules', url.substr(1));
        return path.relative(loader.context, fullPath).replace(/\\/g, '/');
      }
    }),
    postcssUrl([
      {
        // Only convert root relative URLs, which CSS-Loader won't process into require().
        filter: ({ url }) => url.startsWith('/') && !url.startsWith('//'),
        url: ({ url }) => {
          if (deployUrl.match(/:\/\//) || deployUrl.startsWith('/')) {
            // If deployUrl is absolute or root relative, ignore baseHref & use deployUrl as is.
            return `${deployUrl.replace(/\/$/, '')}${url}`;
          } else if (baseHref.match(/:\/\//)) {
            // If baseHref contains a scheme, include it as is.
            return baseHref.replace(/\/$/, '') + `/${deployUrl}/${url}`.replace(/\/\/+/g, '/');
          } else {
            // Join together base-href, deploy-url and the original URL.
            // Also dedupe multiple slashes into single ones.
            return `/${baseHref}/${deployUrl}/${url}`.replace(/\/\/+/g, '/');
          }
        }
      },
      {
        // TODO: inline .cur if not supporting IE (use browserslist to check)
        filter: asset => {
          return maximumInlineSize > 0 && !asset.hash && !asset.absolutePath.endsWith('.cur');
        },
        url: 'inline',
        // NOTE: maxSize is in KB
        maxSize: maximumInlineSize,
        fallback: 'rebase'
      },
      { url: 'rebase' }
    ]),
    PostcssCliResources({
      deployUrl: loader.loaders[loader.loaderIndex].options.ident == 'extracted' ? '' : deployUrl,
      loader,
      filename: `[name]${hashFormat.file}.[ext]`
    }),
    autoprefixer({ grid: true })
  ];
};

module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
    symlinks: true,
    modules: ['./src', './node_modules'],
    alias: rxPaths(),
    mainFields: ['browser', 'module', 'main']
  },
  resolveLoader: {
    modules: ['./node_modules'],
    alias: rxPaths()
  },
  entry: {
    main: ['./src/main.ts'],
    polyfills: ['./src/polyfills.ts'],
    styles: ['./src/styles.css']
  },
  output: {
    path: path.join(process.cwd(), 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    crossOriginLoading: false
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'raw-loader'
      },
      {
        test: /\.(eot|svg|cur)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[hash:20].[ext]',
          limit: 10000
        }
      },
      {
        test: /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
        loader: 'url-loader',
        options: {
          name: '[name].[hash:20].[ext]',
          limit: 10000
        }
      },
      {
        exclude: [path.join(process.cwd(), 'src/styles.css')],
        test: /\.css$/,
        use: [
          {
            loader: 'raw-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'embedded',
              plugins: postcssPlugins,
              sourceMap: true
            }
          }
        ]
      },
      {
        exclude: [path.join(process.cwd(), 'src/styles.css')],
        test: /\.scss$|\.sass$/,
        use: [
          {
            loader: 'raw-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'embedded',
              plugins: postcssPlugins,
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              precision: 8,
              includePaths: []
            }
          }
        ]
      },
      {
        exclude: [path.join(process.cwd(), 'src/styles.css')],
        test: /\.less$/,
        use: [
          {
            loader: 'raw-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'embedded',
              plugins: postcssPlugins,
              sourceMap: true
            }
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        exclude: [path.join(process.cwd(), 'src/styles.css')],
        test: /\.styl$/,
        use: [
          {
            loader: 'raw-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'embedded',
              plugins: postcssPlugins,
              sourceMap: true
            }
          },
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: true,
              paths: []
            }
          }
        ]
      },
      {
        include: [path.join(process.cwd(), 'src/styles.css')],
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'raw-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'embedded',
              plugins: postcssPlugins,
              sourceMap: true
            }
          }
        ]
      },
      {
        include: [path.join(process.cwd(), 'src/styles.css')],
        test: /\.scss$|\.sass$/,
        use: [
          'style-loader',
          {
            loader: 'raw-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'embedded',
              plugins: postcssPlugins,
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              precision: 8,
              includePaths: []
            }
          }
        ]
      },
      {
        include: [path.join(process.cwd(), 'src/styles.css')],
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'raw-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'embedded',
              plugins: postcssPlugins,
              sourceMap: true
            }
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        include: [path.join(process.cwd(), 'src/styles.css')],
        test: /\.styl$/,
        use: [
          'style-loader',
          {
            loader: 'raw-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'embedded',
              plugins: postcssPlugins,
              sourceMap: true
            }
          },
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: true,
              paths: []
            }
          }
        ]
      },
      {
        test: /\.ts$/,
        loader: '@ngtools/webpack'
      }
    ]
  },
  plugins: [
    new NoEmitOnErrorsPlugin(),
    new CopyWebpackPlugin(
      [
        {
          context: 'src',
          to: '',
          from: {
            glob: 'assets/**/*',
            dot: true
          }
        },
        {
          context: 'src',
          to: '',
          from: {
            glob: 'favicon.ico',
            dot: true
          }
        }
      ],
      {
        ignore: ['.gitkeep', '**/.DS_Store', '**/Thumbs.db'],
        debug: 'warning'
      }
    ),
    new ProgressPlugin(),
    new CircularDependencyPlugin({
      exclude: /(\\|\/)node_modules(\\|\/)/,
      failOnError: false,
      onDetected: false,
      cwd: projectRoot
    }),
    new ClusterizeChunks(clusters),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      hash: false,
      inject: true,
      compile: true,
      favicon: false,
      minify: false,
      cache: true,
      showErrors: true,
      chunks: 'all',
      excludeChunks: [],
      title: 'Webpack App',
      xhtml: true,
      chunksSortMode: function sort(left, right) {
        let leftIndex = entryPoints.indexOf(left.names[0]);
        let rightindex = entryPoints.indexOf(right.names[0]);
        if (leftIndex > rightindex) {
          return 1;
        } else if (leftIndex < rightindex) {
          return -1;
        } else {
          return 0;
        }
      }
    }),
    new BaseHrefWebpackPlugin({}),
    new CommonsChunkPlugin({
      name: ['inline'],
      minChunks: null
    }),
    new CommonsChunkPlugin({
      name: ['vendor'],
      minChunks: module => {
        return (
          module.resource &&
          (module.resource.startsWith(nodeModules) ||
            module.resource.startsWith(genDirNodeModules) ||
            module.resource.startsWith(realNodeModules))
        );
      },
      chunks: ['main']
    }),
    new SourceMapDevToolPlugin({
      filename: '[file].map[query]',
      moduleFilenameTemplate: '[resource-path]',
      fallbackModuleFilenameTemplate: '[resource-path]?[hash]',
      sourceRoot: 'webpack:///'
    }),
    new CommonsChunkPlugin({
      name: ['main'],
      minChunks: 2,
      async: 'common'
    }),
    new NamedModulesPlugin({}),
    new AngularCompilerPlugin({
      mainPath: 'main.ts',
      platform: 0,
      hostReplacementPaths: {
        'environments/environment.ts': 'environments/environment.ts'
      },
      sourceMap: true,
      tsConfigPath: 'src/tsconfig.app.json',
      skipCodeGeneration: true,
      compilerOptions: {}
    })
  ],
  node: {
    fs: 'empty',
    global: true,
    crypto: 'empty',
    tls: 'empty',
    net: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false
  },
  devServer: {
    historyApiFallback: true
  }
};
