const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\.system_generated\\logs\\transcript_full.jsonl';

async function dumpStep() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (lineCount >= 660 && lineCount <= 670) {
      console.log(`Line ${lineCount}:`);
      const parsed = JSON.parse(line);
      console.log('  Step Index:', parsed.step_index);
      console.log('  Source:', parsed.source);
      console.log('  Type:', parsed.type);
      if (parsed.tool_calls) {
        parsed.tool_calls.forEach(tc => {
          console.log('    Tool:', tc.name);
          if (tc.args && tc.args.TargetFile) {
            console.log('    TargetFile:', tc.args.TargetFile);
          }
        });
      }
      if (parsed.content) {
        console.log('  Content Length:', parsed.content.length);
      }
    }
  }
}

dumpStep().catch(console.error);
