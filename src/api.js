export async function askAssistant(message, pet) {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, pet })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Assistant request failed.');
  return data.text;
}

export async function analyzeDocument(file, pet) {
  const data = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
  const response = await fetch('/api/documents/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, mimeType: file.type, data: base64, pet })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Document analysis failed.');
  return result;
}
