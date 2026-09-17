const API_BASE=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');

function endpoint(path){return `${API_BASE}${path}`}
function toBase64(buffer){const bytes=new Uint8Array(buffer);let binary='';const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary)}
async function json(response,fallback){const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||fallback);return data}

export async function askAssistant(message,pet){
 if(!API_BASE) throw new Error('AI backend is not configured. Add VITE_API_BASE_URL to the GitHub Actions secrets.');
 const response=await fetch(endpoint('/api/assistant'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,pet})});
 const data=await json(response,'Assistant request failed.');return data.text;
}

export async function analyzeDocument(file,pet){
 if(!API_BASE) throw new Error('AI backend is not configured. Add VITE_API_BASE_URL to the GitHub Actions secrets.');
 const response=await fetch(endpoint('/api/documents/analyze'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileName:file.name,mimeType:file.type,data:toBase64(await file.arrayBuffer()),pet})});
 return json(response,'Document analysis failed.');
}
