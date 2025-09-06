import { supabase, showErr } from './app.js';

// Admin: list users, list files, upload file using service role endpoint (explained in README)
const usersList = document.getElementById('usersList');
const filesList = document.getElementById('filesList');
const uploadBtn = document.getElementById('uploadBtn');

async function loadPendingUsers(){
  try{
    const { data, error } = await supabase.from('users_requests').select('*');
    if(error) throw error;
    usersList.innerHTML = data.length ? data.map(u=>`<div class="muted small"><strong>${u.email}</strong> - <button data-id="${u.id}" class="approve">Approve</button> <button data-id="${u.id}" class="deny">Deny</button></div>`).join('') : '<em>No pending users</em>';
    usersList.querySelectorAll('.approve').forEach(b=>b.addEventListener('click', approve));
    usersList.querySelectorAll('.deny').forEach(b=>b.addEventListener('click', deny));
  }catch(e){ showErr(e) }
}

async function approve(e){
  const id = e.target.dataset.id;
  try{
    await supabase.from('users_requests').update({status:'approved'}).eq('id',id);
    // Create real user record
    // In real system you would create auth user via server-side service_role key
    loadPendingUsers();
  }catch(e){ showErr(e) }
}
async function deny(e){
  const id = e.target.dataset.id;
  try{
    await supabase.from('users_requests').update({status:'denied'}).eq('id',id);
    loadPendingUsers();
  }catch(e){ showErr(e) }
}

async function loadFiles(){
  try{
    // list files metadata table
    const { data, error } = await supabase.from('files').select('*');
    if(error) throw error;
    filesList.innerHTML = data.length ? data.map(f=>`<div class="muted small"><strong>${f.path}</strong> - <button data-id="${f.id}" class="del">Delete</button></div>`).join('') : '<em>No files</em>';
    filesList.querySelectorAll('.del').forEach(b=>b.addEventListener('click', delFile));
  }catch(e){ showErr(e) }
}
async function delFile(e){
  const id = e.target.dataset.id;
  if(!confirm('Delete file?')) return;
  try{
    await supabase.from('files').delete().eq('id',id);
    loadFiles();
  }catch(e){ showErr(e) }
}

uploadBtn.addEventListener('click', async ()=>{
  const f = document.getElementById('fileInput').files[0];
  const folder = document.getElementById('newFolder').value || '';
  if(!f){ alert('Choose file'); return; }
  // Upload should be done via server endpoint that holds service_role key.
  // Here we send file (base64) to an upload endpoint - the README explains how to set it up.
  const reader = new FileReader();
  reader.onload = async ()=> {
    const base64 = reader.result.split(',')[1];
    try{
      const res = await fetch('/.netlify/functions/admin-upload', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({filename:f.name, folder, base64})
      });
      const j = await res.json();
      if(j.error) throw j;
      alert('Uploaded (serverless function handled actual upload). Refresh files.');
      loadFiles();
    }catch(e){ showErr(e) }
  };
  reader.readAsDataURL(f);
});

loadPendingUsers();
loadFiles();
