const webpack = require('webpack');
const AsyncDependenciesBlock = require('webpack/lib/AsyncDependenciesBlock');
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');

class RuntimePrefetch {
  constructor(config) {
    this.config = config;
  }

  apply(compiler) {
    this.fileChunk = {};

    compiler.plugin('emit', (compilation, cb) => {
      compilation.chunks.forEach(chunk => {
        if (
          chunk.blocks &&
          chunk.blocks.length > 0 &&
          chunk.blocks[0] instanceof AsyncDependenciesBlock &&
          chunk.blocks[0].dependencies.length === 1 &&
          (chunk.blocks[0].dependencies[0] instanceof ContextElementDependency ||
            chunk.blocks[0].dependencies[0] instanceof ImportDependency)
        ) {
          const request = chunk.blocks[0].dependencies[0].request;
          this.fileChunk[request] = chunk.id + '.chunk.js';
        }
      });

      const newConfig = {};
      Object.keys(this.config).forEach(c => {
        newConfig[c] = [];
        this.config[c].forEach(p => {
          const newTransition = Object.assign({}, p);
          newTransition.chunk = this.fileChunk[p.file];
          delete newTransition.file;
          newConfig[c].push(newTransition);
        });
      });

      const old = compilation.assets['main.bundle.js'];
      const prefetchLogic = require('fs').readFileSync('./runtime.js');
      const result =
        `var __PREFETCH_MAP__ = ` + JSON.stringify(newConfig) + ';\n' + prefetchLogic + '\n' + old.source();
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
