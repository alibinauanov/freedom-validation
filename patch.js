// Patch to fix schema-utils validate function issue
const fs = require('fs');
const path = require('path');

try {
  const terserPath = path.join(__dirname, 'node_modules', 'terser-webpack-plugin', 'dist', 'index.js');
  
  if (fs.existsSync(terserPath)) {
    let content = fs.readFileSync(terserPath, 'utf8');
    
    // Replace the problematic schema-utils import
    content = content.replace(
      '(0, _schemaUtils.validate)(_options.default, options, {',
      'options && _schemaUtils.validate && (0, _schemaUtils.validate)(_options.default, options, {'
    );
    
    fs.writeFileSync(terserPath, content);
    console.log('Terser plugin patched successfully');
  }
} catch (error) {
  console.log('Patch failed, continuing with build...');
}
