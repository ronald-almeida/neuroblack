import {cp,mkdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});
await mkdir('dist/landing',{recursive:true});
await cp('Landing','dist/landing',{recursive:true});
