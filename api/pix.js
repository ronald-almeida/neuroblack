import {randomUUID} from 'node:crypto';
import QRCode from 'qrcode';
export function validCPF(cpf){
 if(!/^\d{11}$/.test(cpf)||/^(\d)\1{10}$/.test(cpf))return false;
 return [9,10].every(n=>{let sum=0;for(let i=0;i<n;i++)sum+=Number(cpf[i])*(n+1-i);const d=(sum*10)%11;return (d===10?0:d)===Number(cpf[n]);});
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({message:'Método não permitido.'});}
 if(!process.env.BLACKCAT_API_KEY)return res.status(503).json({message:'Pagamento indisponível. Entre em contato com o suporte.'});
 let b=req.body;try{if(typeof b==='string')b=JSON.parse(b);}catch{return res.status(400).json({message:'Dados inválidos.'});}
 const name=typeof b?.name==='string'?b.name.trim():'';
 const email=typeof b?.email==='string'?b.email.trim():'';
 const phone=String(b?.phone||'').replace(/\D/g,'');const cpf=String(b?.cpf||'').replace(/\D/g,'');
 if(name.length<3||name.length>150||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||!/^\d{10,11}$/.test(phone)||!validCPF(cpf))return res.status(400).json({message:'Confira nome, e-mail, telefone e CPF.'});
 const reference=randomUUID();
 const payload={amount:49770,currency:'BRL',paymentMethod:'pix',items:[{title:'Pós Graduação em Neurociência, Trauma e Saúde Mental',unitPrice:49770,quantity:1,tangible:false}],customer:{name,email,phone,document:{number:cpf,type:'cpf'}},pix:{expiresInDays:1},externalRef:reference};
 if(b.street && b.cep && b.state)payload.shipping={name,street:String(b.street).slice(0,200),number:String(b.number||'').slice(0,20),city:String(b.city||'').slice(0,100),neighborhood:String(b.neighborhood||'').slice(0,100),complement:String(b.complement||'').slice(0,150),state:String(b.state).slice(0,2),zipCode:String(b.cep).replace(/\D/g,'').slice(0,8)};
 for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'])if(typeof b[key]==='string')payload[key]=b[key].slice(0,200);
 try{
 const response=await fetch('https://api.blackcatoficial.com/api/sales/create-sale',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':process.env.BLACKCAT_API_KEY},body:JSON.stringify(payload),signal:AbortSignal.timeout(45000)});
 const json=await response.json().catch(()=>null);
 if(!response.ok||json?.success===false){
 const uncertain=response.status>=500||response.ok;
 return res.status(502).json({message:uncertain?'A operadora não confirmou a geração. Confira com o suporte antes de tentar novamente.':'A operadora não autorizou a geração do Pix. Confira os dados ou contate o suporte.',reference});
 }
 const data=json?.data;const payment=data?.paymentData;
 const code=payment?.copyPaste||payment?.qrCode;
 if(typeof code!=='string'||!code.startsWith('000201'))return res.status(502).json({message:'A operadora não retornou um código Pix válido. Consulte o suporte antes de tentar novamente.',reference});
 const qr=await QRCode.toDataURL(code,{width:280,margin:2,errorCorrectionLevel:'M'});
 return res.status(200).json({code,qr,expiresAt:payment.expiresAt||null,reference:data.transactionId||reference});
 }catch{return res.status(502).json({message:'Não foi possível confirmar a geração do Pix. Consulte o suporte antes de tentar novamente.',reference});}
}
