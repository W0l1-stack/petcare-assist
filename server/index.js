import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const client = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

app.use((req,res,next)=>{res.setHeader('Access-Control-Allow-Origin',process.env.FRONTEND_ORIGIN||'*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');if(req.method==='OPTIONS')return res.sendStatus(204);next()});
app.use(express.json({ limit: '12mb' }));

const SYSTEM_INSTRUCTION = `You are PetCare Assist, a pet wellness and document companion.
Be useful, concise, calm and clear. You may explain user-provided pet-care information, summarize documents, identify missing information, organize routines, and help prepare an insurance claim draft.
Do not diagnose animals, prescribe medication, interpret symptoms as a definitive condition, promise insurance coverage or reimbursement, or replace a veterinarian or emergency service.
If a user describes an urgent or potentially dangerous situation, recommend contacting a veterinarian or emergency veterinary service promptly.
Treat extracted document information as unverified until the user confirms it. Never invent missing facts.`;

function requireGemini(res){if(!client){res.status(503).json({error:'Gemini is not configured. Add GEMINI_API_KEY to the server environment.'});return false}return true}
app.get('/api/health',(_req,res)=>res.json({ok:true,geminiConfigured:Boolean(client)}));

app.post('/api/assistant',async(req,res)=>{if(!requireGemini(res))return;const message=String(req.body?.message||'').trim();const pet=req.body?.pet||null;if(!message)return res.status(400).json({error:'Message is required.'});try{const context=pet?`Pet context: ${JSON.stringify(pet)}`:'No pet profile is available.';const response=await client.models.generateContent({model:'gemini-3.8-flash',contents:`${context}\n\nUser request: ${message}`,config:{systemInstruction:SYSTEM_INSTRUCTION}});res.json({text:response.text||'I could not produce a response for that request.'})}catch(error){console.error('Gemini assistant error:',error);res.status(500).json({error:'Gemini could not process that request.'})}});

app.post('/api/documents/analyze',async(req,res)=>{if(!requireGemini(res))return;const {fileName,mimeType,data,pet}=req.body||{};if(!fileName||!mimeType||!data)return res.status(400).json({error:'fileName, mimeType and data are required.'});const allowed=['application/pdf','image/jpeg','image/png','image/webp'];if(!allowed.includes(mimeType))return res.status(400).json({error:'Use a PDF, JPEG, PNG or WebP document.'});const schema={type:'object',properties:{document_type:{type:'string'},summary:{type:'string'},extracted_fields:{type:'object',additionalProperties:{type:'string'}},missing_information:{type:'array',items:{type:'string'}},uncertain_information:{type:'array',items:{type:'string'}},requires_user_verification:{type:'boolean'}},required:['document_type','summary','extracted_fields','missing_information','uncertain_information','requires_user_verification']};try{const response=await client.models.generateContent({model:'gemini-3.8-flash',contents:[{role:'user',parts:[{text:`Analyze this pet-care document named ${fileName}. Extract only information that is actually visible. Do not infer missing facts. The pet profile, if present, is context only: ${JSON.stringify(pet||{})}`},{inlineData:{mimeType,data}}]}],config:{systemInstruction:SYSTEM_INSTRUCTION,responseMimeType:'application/json',responseSchema:schema}});res.json(JSON.parse(response.text||'{}'))}catch(error){console.error('Gemini document error:',error);res.status(500).json({error:'The document could not be analyzed.'})}});

const dist=path.resolve(__dirname,'../dist');app.use(express.static(dist));app.use((req,res,next)=>{if(req.path.startsWith('/api/'))return next();res.sendFile(path.join(dist,'index.html'))});
app.listen(port,()=>console.log(`PetCare Assist server listening on ${port}`));
