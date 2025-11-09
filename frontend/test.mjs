import { spawn } from 'child_process';

console.log('Node is working!');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

console.log('\nTrying to run Vite...');

const vite = spawn('npx', ['vite', '--host'], {
  stdio: 'inherit',
  shell: true
});

vite.on('error', (error) => {
  console.error('Failed to start Vite:', error);
});

vite.on('exit', (code) => {
  console.log(`Vite process exited with code ${code}`);
});