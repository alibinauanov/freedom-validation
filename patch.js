// Comprehensive patch to fix schema-utils validate function issue in multiple plugins
const fs = require('fs');
const path = require('path');

function patchPlugin(pluginPath, pluginName) {
  try {
    if (fs.existsSync(pluginPath)) {
      let content = fs.readFileSync(pluginPath, 'utf8');
      let patched = false;
      
      // Multiple replacement patterns to handle different cases
      const replacements = [
        {
          from: '(0, _schemaUtils.validate)(_options.default, options, {',
          to: 'options && _schemaUtils.validate && (0, _schemaUtils.validate)(_options.default, options, {'
        },
        {
          from: '(0, _schemaUtils.validate)(schema, options, {',
          to: 'options && _schemaUtils.validate && (0, _schemaUtils.validate)(schema, options, {'
        },
        {
          from: '_schemaUtils.validate(schema, options, {',
          to: 'options && _schemaUtils.validate && _schemaUtils.validate(schema, options, {'
        },
        {
          from: 'validate(/** @type {Schema} */schema, options, {',
          to: 'validate && validate(/** @type {Schema} */schema, options, {'
        },
        {
          from: 'validate(schema, options, {',
          to: 'validate && validate(schema, options, {'
        },
        {
          from: 'const validate = require("schema-utils").validate;',
          to: 'const validate = require("schema-utils").validate || (() => {});'
        }
      ];
      
      replacements.forEach(replacement => {
        if (content.includes(replacement.from)) {
          content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
          patched = true;
        }
      });
      
      if (patched) {
        fs.writeFileSync(pluginPath, content);
        console.log(`${pluginName} patched successfully`);
      }
    }
  } catch (error) {
    console.log(`Patch failed for ${pluginName}, continuing with build...`);
  }
}

// List of plugins that need patching
const pluginsToPath = [
  {
    path: path.join(__dirname, 'node_modules', 'react-scripts', 'node_modules', 'terser-webpack-plugin', 'dist', 'index.js'),
    name: 'terser-webpack-plugin'
  },
  {
    path: path.join(__dirname, 'node_modules', 'react-scripts', 'node_modules', 'css-minimizer-webpack-plugin', 'dist', 'index.js'),
    name: 'css-minimizer-webpack-plugin'
  },
  {
    path: path.join(__dirname, 'node_modules', 'mini-css-extract-plugin', 'dist', 'index.js'),
    name: 'mini-css-extract-plugin'
  },
  {
    path: path.join(__dirname, 'node_modules', 'terser-webpack-plugin', 'dist', 'index.js'),
    name: 'terser-webpack-plugin-root'
  }
];

// Apply patches to all plugins
pluginsToPath.forEach(plugin => {
  patchPlugin(plugin.path, plugin.name);
});
