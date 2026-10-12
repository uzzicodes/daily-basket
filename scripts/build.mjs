import { spawnSync } from 'node:child_process';
const sites=process.env.ASKARI_BUILD_TARGET==='sites';
const script=sites?'scripts/run-framework.mjs':'node_modules/next/dist/bin/next';
const result=spawnSync(process.execPath,[script,'build'],{stdio:'inherit',env:process.env});
if(result.error)throw result.error;process.exit(result.status??1);
