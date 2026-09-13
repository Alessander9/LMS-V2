const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\.system_generated\\logs\\transcript_full.jsonl';

async function searchWrites() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    const parsed = JSON.parse(line);
    
    // Check in tool calls of MODEL responses
    if (parsed.tool_calls) {
      parsed.tool_calls.forEach(tc => {
        if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
          const target = tc.args.TargetFile || tc.args.Target;
          if (target && (target.includes('auriculoterapia') || target.includes('masaje-terapeutico'))) {
            console.log(`Line ${lineCount}: Write to ${target} using ${tc.name}`);
            if (tc.args.CodeContent) {
              console.log(`CodeContent Length: ${tc.args.CodeContent.length}`);
              fs.writeFileSync(`C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\scratch\\write_${lineCount}_${pathBasename(target)}.html`, tc.args.CodeContent);
            }
          }
        }
      });
    }
  }
}

function pathBasename(p) {
  return p.split(/[\\/]/).pop();
}

searchWrites().catch(console.error);
