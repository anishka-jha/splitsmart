import {defineConfig,loadEnv} from 'vite';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
import chatHandler from './api/chat-to-split.js';
const bundledScheduler=fileURLToPath(new URL('./node_modules/.pnpm/scheduler@0.28.0/node_modules/scheduler/index.js',import.meta.url));
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');
 for(const key of ['AI_GATEWAY_API_KEY','VERCEL_OIDC_TOKEN','AI_GATEWAY_MODEL'])if(!process.env[key]&&env[key])process.env[key]=env[key];
 return {resolve:{preserveSymlinks:process.platform==='win32',alias:existsSync(bundledScheduler)?{scheduler:bundledScheduler}:{}},plugins:[{
  name:'splitsmart-local-api',
  configureServer(server){server.middlewares.use('/api/chat-to-split',async(req,res)=>{
   res.status=code=>{res.statusCode=code;return res;};
   res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));return res;};
   try{
    if(req.method==='POST'){let bytes=0,text='';for await(const chunk of req){bytes+=chunk.length;if(bytes>24000)throw Error('Request is too large.');text+=chunk.toString();}req.body=JSON.parse(text);}
    await chatHandler(req,res);
   }catch{if(!res.writableEnded)res.status(400).json({error:'Send a valid, small JSON expense description.'});}
  });}
 }]};
});
