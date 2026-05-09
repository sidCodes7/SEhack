import 'dotenv/config';
import '../server/src/middleware/dnsFix.js';
import { testGrokConnection } from '../server/src/agents/grokClient.js';

const result = await testGrokConnection();
console.log(JSON.stringify(result, null, 2));
