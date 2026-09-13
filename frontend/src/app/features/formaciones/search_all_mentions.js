const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\.system_generated\\logs\\transcript_full.jsonl';

async function searchAll() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.includes('auri-page') || line.includes('mas-page')) {
      console.log(`Line ${lineCount}: Found auri-page or mas-page!`);
      // Let's write a file with a snippet of this line
      fs.writeFileSync(`C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\scratch\\mention_${lineCount}.txt`, line);
    }
  }
}

searchAll().catch(console.error);
