const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a553-e8f798ef194c\\.system_generated\\logs\\transcript_full.jsonl';

async function printStep0() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const parsed = JSON.parse(line);
    if (parsed.step_index === 0) {
      console.log('Step 0 found!');
      console.log('Content preview:');
      console.log(parsed.content ? parsed.content.slice(0, 2000) : 'no content');
      fs.writeFileSync('C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\scratch\\step_0_full.txt', parsed.content || '');
      break;
    }
  }
}

printStep0().catch(console.error);
