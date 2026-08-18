const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('/home/icall/AIC/frontend/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Regex to match shadow-sm, shadow-[something], hover:shadow-md, etc.
    // Be careful with drop-shadow but the prompt said "remove ALL box-shadow / shadow-* classes"
    // Classes can be like shadow-sm, hover:shadow-md, shadow-[0_4px...], shadow-blue-300/50
    // We want to match: \b(?:hover:|focus:)?shadow-(?:[a-z2-6]+|\[[^\]]+\])(?:\/[0-9]+)?\b
    
    // Actually a simpler approach is replacing any word starting with shadow- or hover:shadow- etc.
    // Let's use a regex that handles tailwind shadow classes
    const regex = /\b(?:[a-z0-9]+:)*shadow(?:-[a-zA-Z0-9_\[\]\-\.\/]+)?\b/g;
    
    let newContent = content.replace(regex, '');
    
    // Clean up multiple spaces that might result from removal
    newContent = newContent.replace(/  +/g, ' ');
    // Clean up spaces before quotes
    newContent = newContent.replace(/ "/g, '"');
    newContent = newContent.replace(/ `/g, '`');
    
    if (content !== newContent) {
      console.log('Updated: ' + filePath);
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  }
});
