const fs = require('fs');
let content = fs.readFileSync('screens/KitabScreen.tsx', 'utf8');
content = content.replace(/BookOpen,\n  Keyboard, desc/g, 'BookOpen, desc');
fs.writeFileSync('screens/KitabScreen.tsx', content);
