// viewer helper: load PDF from Supabase storage signed URL and display via PDF.js
import { supabase, showErr } from './app.js';

const urlParams = new URLSearchParams(location.search);
const path = urlParams.get('path');
const name = urlParams.get('name') || 'file';
document.getElementById('filename').innerText = name;

async function fetchAndRender(){
  if(!path){ alert('No path'); return; }
  try{
    // get public or signed url
    const { data, error } = await supabase.storage.from('tests').createSignedUrl(path, 60); // 60s signed url
    if(error) throw error;
    const pdfUrl = data.signedUrl;
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({scale:1.3});
    const canvas = document.getElementById('pdfCanvas');
    canvas.height = viewport.height; canvas.width = viewport.width;
    const ctx = canvas.getContext('2d');
    const renderContext = { canvasContext: ctx, viewport };
    await page.render(renderContext).promise;
    // disable right-click to make downloading harder
    canvas.addEventListener('contextmenu', e=>e.preventDefault());
  }catch(e){ showErr(e) }
}
document.getElementById('saveNote').addEventListener('click', async ()=>{
  const note = document.getElementById('noteText').value;
  const diff = document.getElementById('difficulty').value;
  const solved = document.getElementById('solved').checked;
  try{
    await supabase.from('annotations').upsert({user_id:'local-user', file_path:path, note, difficulty:diff, solved}).eq('file_path',path);
    alert('Saved (annotations stored in DB).');
  }catch(e){ showErr(e) }
});
fetchAndRender();
