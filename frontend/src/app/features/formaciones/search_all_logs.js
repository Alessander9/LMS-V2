const fs = require('fs');
const path = require('path');
const readline = require('readline');

const brainDir = 'C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain';

async function searchAllConversations() {
  const dirs = fs.readdirSync(brainDir);
  for (const dir of dirs) {
    const logDir = path.join(brainDir, dir, '.system_generated', 'logs');
    if (!fs.existsSync(logDir)) continue;

    const transcriptPath = path.join(logDir, 'transcript_full.jsonl');
    if (!fs.existsSync(transcriptPath)) continue;

    console.log(`Checking log: ${transcriptPath}`);
    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    for await (const line of rl) {
      lineCount++;
      if (line.includes('auriculoterapia.component.html') && line.includes('331') && line.includes('Total Lines')) {
        console.log(`  -> Match for Auriculoterapia total lines at step/line ${lineCount}`);
        const parsed = JSON.parse(line);
        if (parsed.content) {
          console.log(`  -> Content Length: ${parsed.content.length}`);
          fs.writeFileSync(`C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\scratch\\found_auri_${dir}_${lineCount}.txt`, parsed.content);
        }
      }
      if (line.includes('masaje-terapeutico.component.html') && line.includes('323') && line.includes('Total Lines')) {
        console.log(`  -> Match for Masaje total lines at step/line ${lineCount}`);
        const parsed = JSON.parse(line);
        if (parsed.content) {
          console.log(`  -> Content Length: ${parsed.content.length}`);
          fs.writeFileSync(`C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\scratch\\found_masaje_${dir}_${lineCount}.txt`, parsed.content);
        }
      }
    }
  }
}

searchAllConversations().catch(console.error);
