const fs = require('fs');

const linePath = 'C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\scratch\\mention_652.txt';

if (fs.existsSync(linePath)) {
  const content = fs.readFileSync(linePath, 'utf8');
  const parsed = JSON.parse(content);
  if (parsed.tool_calls) {
    parsed.tool_calls.forEach(tc => {
      console.log('Tool:', tc.name);
      if (tc.args) {
        console.log('Args Target:', tc.args.TargetFile);
        if (tc.args.CodeContent) {
          console.log('CodeContent Length:', tc.args.CodeContent.length);
          console.log('CodeContent Preview:', tc.args.CodeContent.slice(0, 1000));
        }
      }
    });
  }
} else {
  console.log('mention_652.txt does not exist.');
}
