const fs = require('fs');
const path = require('path');

const scratchDir = 'C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\scratch';

function cleanAndCombine(files, outputFile) {
  const lineMap = new Map();
  let maxLine = 0;

  files.forEach(fileName => {
    const filePath = path.join(scratchDir, fileName);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach(l => {
      // Look for format: "123: <content>"
      const match = l.match(/^(\d+):\s?(.*)$/);
      if (match) {
        const lineNum = parseInt(match[1], 10);
        const lineText = match[2];
        lineMap.set(lineNum, lineText);
        if (lineNum > maxLine) {
          maxLine = lineNum;
        }
      }
    });
  });

  const outputLines = [];
  for (let i = 1; i <= maxLine; i++) {
    outputLines.push(lineMap.get(i) || '');
  }

  const result = outputLines.join('\n');
  fs.writeFileSync(path.join(scratchDir, outputFile), result);
  console.log(`Combined ${files.join(', ')} into ${outputFile} (Total Lines: ${maxLine})`);
}

// Combine Auriculoterapia views
cleanAndCombine(['auri_view_574.txt', 'auri_view_580.txt', 'auri_view_582.txt', 'auri_view_631.txt'], 'auriculoterapia_full_orig.html');

// Combine Masaje views
cleanAndCombine(['masaje_view_576.txt', 'masaje_view_592.txt', 'masaje_view_594.txt'], 'masaje-terapeutico_full_orig.html');
