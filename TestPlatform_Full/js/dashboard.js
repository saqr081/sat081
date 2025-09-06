import { supabase, showErr } from './app.js';

const tree = document.getElementById('tree');
const refreshBtn = document.getElementById('refresh');
const searchInput = document.getElementById('search');

async function loadTree(){
  tree.innerHTML = 'Loading...';
  try{
    const { data, error } = await supabase.from('files').select('*').order('created_at', {ascending:false});
    if(error) throw error;
    if(!data.length) { tree.innerHTML = '<em>No files yet</em>'; return; }
    tree.innerHTML = data.map(f=>{
      return `<div class="fileRow"><strong>${f.path}</strong>
        <div class="row">
          <button class="open" data-path="${f.storage_path}">Open</button>
          <button class="mark" data-id="${f.id}">Mark</button>
        </div>
      </div>`;
    }).join('');
    tree.querySelectorAll('.open').forEach(b=>b.addEventListener('click', openFile));
    tree.querySelectorAll('.mark').forEach(b=>b.addEventListener('click', markFile));
  }catch(e){ showErr(e) }
}
function openFile(e){
  const sp = e.target.dataset.path;
  // viewer.html expects ?path=storage_path
  location.href = 'viewer.html?path='+encodeURIComponent(sp)+'&name='+encodeURIComponent(e.target.closest('.fileRow').querySelector('strong').innerText);
}
async function markFile(e){
  const id = e.target.dataset.id;
  const note = prompt('Write a short note (saved to your account):');
  try{
    await supabase.from('user_files').upsert({file_id:id, user_id:'local-user', note}).eq('file_id',id);
    alert('Saved note locally (DB table user_files).');
  }catch(err){ showErr(err) }
}

refreshBtn.addEventListener('click', loadTree);
searchInput.addEventListener('input', ()=> {
  const q = searchInput.value.toLowerCase();
  [...tree.querySelectorAll('.fileRow')].forEach(r=>{
    const t = r.querySelector('strong').innerText.toLowerCase();
    r.style.display = t.includes(q) ? 'block' : 'none';
  });
});
loadTree();
