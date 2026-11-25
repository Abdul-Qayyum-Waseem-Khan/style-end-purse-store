const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const newContent = content
    .replace(/(from\s+['"][^'"]+?)(@[0-9]+\.[0-9]+\.[0-9]+[^'"]*)(['"])/g, '$1$3')
    .replace(/(import\s+['"][^'"]+?)(@[0-9]+\.[0-9]+\.[0-9]+[^'"]*)(['"])/g, '$1$3');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Updated ' + file);
    updatedCount++;
  }
});

console.log('Total files updated:', updatedCount);
