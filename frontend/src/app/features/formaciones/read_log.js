const fs = require('fs');

const logPath = 'C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\b85b5c07-05d6-43c2-a573-e8f798ef194c\\.system_generated\\tasks\\task-707.log';

if (fs.existsSync(logPath)) {
  console.log('Log exists. Content:');
  console.log(fs.readFileSync(logPath, 'utf8'));
} else {
  console.log('Log does not exist yet at:', logPath);
}
