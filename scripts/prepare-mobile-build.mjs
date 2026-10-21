import fs from 'node:fs';
import path from 'node:path';
const [kind, destination]=process.argv.slice(2);
if(!['customer','team'].includes(kind)||!destination)throw Error('Usage: node scripts/prepare-mobile-build.mjs customer|team work/new-directory');
const root=process.cwd(),target=path.resolve(destination),source=path.join(root,'mobile');
if(!target.startsWith(path.join(root,'work')+path.sep)||fs.existsSync(target))throw Error('Choose a new build directory inside work/.');
const skip=new Set(['node_modules','.expo','android','ios','.git']);
fs.cpSync(source,target,{recursive:true,filter:p=>{const name=path.basename(p);return !skip.has(name)&&!name.startsWith('dist-')&&(!name.startsWith('.env')||name==='.env.example')&&!/\.(jks|keystore|p12|pem|mobileprovision|tsbuildinfo)$/.test(name);}});
if(kind==='team'){
 const config=JSON.parse(fs.readFileSync(path.join(target,'app.json'),'utf8'));
 Object.assign(config.expo,{name:'Daily Basket Team',slug:'daily-basket-team',scheme:'dailybasketteam',version:'1.0.0'});
 config.expo.android={...config.expo.android,package:'pk.dailybasket.team',versionCode:1,permissions:[],blockedPermissions:[...config.expo.android.blockedPermissions,'android.permission.ACCESS_COARSE_LOCATION','android.permission.ACCESS_FINE_LOCATION']};
 config.expo.ios.bundleIdentifier='pk.dailybasket.team';config.expo.plugins=['expo-secure-store'];
 config.expo.experiments.baseUrl='/team-mobile-preview';delete config.expo.extra.eas.projectId;
 const idFile=path.join(root,'mobile/team-eas-project.json');if(fs.existsSync(idFile))config.expo.extra.eas.projectId=JSON.parse(fs.readFileSync(idFile,'utf8')).projectId;
 fs.writeFileSync(path.join(target,'app.json'),JSON.stringify(config,null,2)+'\n');
 const pkg=JSON.parse(fs.readFileSync(path.join(target,'package.json'),'utf8'));Object.assign(pkg,{name:'daily-basket-team-app',version:'1.0.0',description:'Private Daily Basket packer and rider app',main:'team-index.ts'});fs.writeFileSync(path.join(target,'package.json'),JSON.stringify(pkg,null,2)+'\n');
}
console.log(target);
