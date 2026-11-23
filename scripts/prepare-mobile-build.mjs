import fs from 'node:fs';
import path from 'node:path';
// Customers and staff share one app; staff sign in from Help → Staff sign in.
const [destination]=process.argv.slice(2);
if(!destination)throw Error('Usage: node scripts/prepare-mobile-build.mjs work/new-directory');
const root=process.cwd(),target=path.resolve(destination),source=path.join(root,'mobile');
if(!target.startsWith(path.join(root,'work')+path.sep)||fs.existsSync(target))throw Error('Choose a new build directory inside work/.');
const skip=new Set(['node_modules','.expo','android','ios','.git']);
fs.cpSync(source,target,{recursive:true,filter:p=>{const name=path.basename(p);return !skip.has(name)&&!name.startsWith('dist-')&&(!name.startsWith('.env')||name==='.env.example')&&!/\.(jks|keystore|p12|pem|mobileprovision|tsbuildinfo)$/.test(name);}});
console.log(target);
