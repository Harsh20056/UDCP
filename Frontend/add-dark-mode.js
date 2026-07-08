import fs from 'fs';
import path from 'path';

const dir = './src';

// Recursively get all .jsx files
function getFiles(dirPath, files = []) {
  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getFiles(dir);

const replacements = [
  // Backgrounds
  { regex: /\bbg-white\b(?! dark:bg-slate-900)/g, replace: 'bg-white dark:bg-slate-900' },
  { regex: /\bbg-slate-50\b(?! dark:bg-slate-800)/g, replace: 'bg-slate-50 dark:bg-slate-800' },
  { regex: /\bbg-slate-100\b(?! dark:bg-slate-700)/g, replace: 'bg-slate-100 dark:bg-slate-700' },
  { regex: /\bbg-slate-200\b(?! dark:bg-slate-600)/g, replace: 'bg-slate-200 dark:bg-slate-600' },
  
  // Borders
  { regex: /\bborder-slate-100\b(?! dark:border-slate-700)/g, replace: 'border-slate-100 dark:border-slate-700' },
  { regex: /\bborder-slate-200\b(?! dark:border-slate-700)/g, replace: 'border-slate-200 dark:border-slate-700' },
  { regex: /\bborder-slate-300\b(?! dark:border-slate-600)/g, replace: 'border-slate-300 dark:border-slate-600' },
  { regex: /\bdivide-slate-100\b(?! dark:divide-slate-700)/g, replace: 'divide-slate-100 dark:divide-slate-700' },
  { regex: /\bdivide-slate-50\b(?! dark:divide-slate-700)/g, replace: 'divide-slate-50 dark:divide-slate-700' },

  // Text colors
  { regex: /\btext-slate-900\b(?! dark:text-slate-100)/g, replace: 'text-slate-900 dark:text-slate-100' },
  { regex: /\btext-slate-800\b(?! dark:text-slate-200)/g, replace: 'text-slate-800 dark:text-slate-200' },
  { regex: /\btext-slate-700\b(?! dark:text-slate-300)/g, replace: 'text-slate-700 dark:text-slate-300' },
  { regex: /\btext-slate-600\b(?! dark:text-slate-400)/g, replace: 'text-slate-600 dark:text-slate-400' },
  { regex: /\btext-slate-500\b(?! dark:text-slate-400)/g, replace: 'text-slate-500 dark:text-slate-400' },
  
  // Hovers
  { regex: /\bhover:bg-slate-50\b(?! dark:hover:bg-slate-800)/g, replace: 'hover:bg-slate-50 dark:hover:bg-slate-800' },
  { regex: /\bhover:bg-slate-100\b(?! dark:hover:bg-slate-700)/g, replace: 'hover:bg-slate-100 dark:hover:bg-slate-700' },
  { regex: /\bhover:text-slate-700\b(?! dark:hover:text-slate-300)/g, replace: 'hover:text-slate-700 dark:hover:text-slate-300' },
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
console.log('Done adding dark mode classes.');
