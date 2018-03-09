const webpack = require('webpack');
const template = require('lodash.template');
const AsyncDependenciesBlock = require('webpack/lib/AsyncDependenciesBlock');
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');

const defaultPrefetchConfig = {
  '4g': 0.2,
  '3g': 0.3,
  '2g': 0.4,
  'slow-2g': 0.5
};

class RuntimePrefetch {
  constructor(config) {
    this.graph = config.graph;
    if (!this.graph) {
      throw new Error('Page graph not provided');
    }
    this.prefetch = config.prefetch || defaultPrefetchConfig;
    this.basepath = config.basepath || '/';
  }

  apply(compiler) {
    this.fileChunk = {};

    compiler.plugin('emit', (compilation, cb) => {
      compilation.chunks.forEach(chunk => {
        if (chunk.blocks && chunk.blocks.length > 0) {
          for (const block of chunk.blocks) {
            this.fileChunk[block.dependencies[0].request] = chunk.id + '.chunk.js';
          }
        }
      });

      const newConfig = {};
      Object.keys(this.graph).forEach(c => {
        newConfig[c] = [];
        this.graph[c].forEach(p => {
          const newTransition = Object.assign({}, p);
          newTransition.chunk = this.fileChunk[p.file];
          delete newTransition.file;
          newConfig[c].push(newTransition);
        });
      });

      const old = compilation.assets['main.bundle.js'];
      const prefetchLogic = template(
        require('fs')
          .readFileSync('./runtime.js')
          .toString()
      )({
        BASE_PATH: this.basepath,
        GRAPH: JSON.stringify(newConfig),
        THRESHOLDS: JSON.stringify(this.prefetch)
      });
      const result = prefetchLogic + '\n' + old.source();
      compilation.assets['main.bundle.js'] = {
        source() {
          return result;
        },
        size() {
          return result.length;
        }
      };
      cb();
    });
  }
}

module.exports.RuntimePrefetch = RuntimePrefetch;
