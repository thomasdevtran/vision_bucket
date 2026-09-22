// Explicit demo mode: do not embed real Firebase configuration in the demo build.
const { spawnSync } = require('node:child_process');
const command = process.argv[2];
if (!['start', 'build'].includes(command)) throw new Error('Use start or build.');
const env = { ...process.env, REACT_APP_DEMO_MODE: 'true', BROWSER: 'none', GENERATE_SOURCEMAP: 'false' };
for (const key of ['API_KEY','AUTH_DOMAIN','PROJECT_ID','STORAGE_BUCKET','MESSAGING_SENDER_ID','APP_ID','MEASUREMENT_ID']) env[`REACT_APP_FIREBASE_${key}`] = '';
env.REACT_APP_API_URL = '';
const result = spawnSync(process.execPath, [require.resolve(`react-scripts/scripts/${command}`)], { stdio: 'inherit', env });
process.exit(result.status ?? 1);
