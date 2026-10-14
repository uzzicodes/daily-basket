// Generates server-only notification configuration without printing private keys.
import fs from 'node:fs/promises';
import {parseEnv} from 'node:util';
let source='';try{source=await fs.readFile('.env.local','utf8');}catch{}
const env=parseEnv(source);if(env.DESK_PUSH_PRIVATE_KEY||env.DESK_PUSH_PUBLIC_KEY)throw Error('Phone keys already exist. Preserve them so installed devices keep working.');
const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const privateKey=await crypto.subtle.exportKey('jwk',pair.privateKey);const publicKey=Buffer.from(await crypto.subtle.exportKey('raw',pair.publicKey)).toString('base64url');
const token=Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex');
await fs.writeFile('.env.local',source+`\nDESK_PUSH_PUBLIC_KEY=${publicKey}\nDESK_PUSH_PRIVATE_KEY=${privateKey.d}\nDESK_PUSH_SUBJECT=mailto:replace-with-your-business-email@example.com\nDESK_PUSH_DISPATCH_SECRET=${token}\n`);
console.log('Phone notification keys saved privately in .env.local. Set DESK_PUSH_SUBJECT to your business contact, then configure the same values in your host.');
