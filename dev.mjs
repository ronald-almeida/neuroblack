import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import handler from './api/pix.js';
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png'};
http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname==='/api/pix'){let body='';for await(const chunk of req){body+=chunk;if(body.length>20000){res.writeHead(413);res.end();return;}}req.body=body;res.status=n=>{res.statusCode=n;return res;};res.json=v=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(v));};return handler(req,res);}const file=path.resolve('public','.'+(url.pathname==='/'||url.pathname==='/checkout'?'/index.html':url.pathname));if(!file.startsWith(path.resolve('public')+path.sep)){res.writeHead(403);res.end();return;}try{const data=await readFile(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(Number(process.env.PORT)||4173,'0.0.0.0');
