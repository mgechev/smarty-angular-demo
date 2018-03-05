const AsyncDependenciesBlock = require('webpack/lib/AsyncDependenciesBlock');
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency');
const basename = require('path').basename;
const webpack = require('webpack');

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

        // delete compilation.assets[k];

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

module.exports.ClusterizeChunks = ClusterizeChunks;
