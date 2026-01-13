const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the broken line
const fixed = content.replace(
  /`"\$\{?\(lead\.linkedin.*?\).*?\}?"`,\s*\,/s,
  '`"${(lead.linkedin || \'\').replace(/"/g, \'""\')}"`,' + '\n' + '          `"${(lead.offerUrl || \'\').replace(/"/g, \'""\')}"`,'
);

fs.writeFileSync('src/App.tsx', fixed, 'utf8');
console.log('Fixed!');
