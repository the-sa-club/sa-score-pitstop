module.exports = function override(config, env) {
  let loaders = config.resolve;
  loaders.fallback = {
    fs: false,
    process: require.resolve("process/browser"),
    path: require.resolve("path-browserify"),
    os: require.resolve("os-browserify/browser"),
    stream: require.resolve("stream-browserify"),
  };

  return config;
};
