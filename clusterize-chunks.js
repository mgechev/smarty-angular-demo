const AsyncDependenciesBlock = require('webpack/lib/AsyncDependenciesBlock');
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');
const basename = require('path').basename;
const webpack = require('webpack');

class ClusterizeChunks {
  constructor(clusters) {
    this.clusters = clusters;
  }

  apply(compiler) {
    const valid = a => a.blocks && a.blocks[0] && a.blocks[0].dependencies && a.blocks[0].dependencies[0];

    const inSameCluster = (a, b) => {
      if (!valid(a) || !valid(b)) {
        return false;
      }
      const fileA = a.blocks[0].dependencies[0].request;
      const fileB = b.blocks[0].dependencies[0].request;
      const values = Object.keys(this.clusters).map(k => this.clusters[k]);
      for (const c of values) {
        if (c.indexOf(fileA) >= 0 && c.indexOf(fileB) >= 0) {
          return true;
        }
      }
      return false;
    };

    compiler.plugin('compilation', compilation => {
      compilation.plugin('optimize-chunks', chunks => {
        for (const a of chunks) {
          for (const b of chunks) {
            if (a === b) {
              continue;
            }
            if (inSameCluster(a, b)) {
              if (b.integrate(a)) {
                chunks.splice(chunks.indexOf(a), 1);
              }
              return true;
            }
          }
        }
      });
    });
  }
}

module.exports.ClusterizeChunks = ClusterizeChunks;
