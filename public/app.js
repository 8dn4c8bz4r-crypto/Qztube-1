const pages = [...document.querySelectorAll(".page")];
document.querySelectorAll("[data-page]").forEach(btn => btn.addEventListener("click", () => {
  const page = btn.dataset.page;
  pages.forEach(p => p.classList.toggle("active", p.id === page));
  document.querySelectorAll(".navitem").forEach(n => n.classList.toggle("active", n.dataset.page === page));
  window.scrollTo(0,0);
}));
document.getElementById("searchToggle").onclick = () => document.getElementById("searchbar").classList.toggle("hidden");
let filter = "all", videos = [];
function embedUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtu.be")) return "https://www.youtube.com/embed/" + u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop();
      if (id && id !== "watch") return "https://www.youtube.com/embed/" + id;
    }
    return raw;
  } catch { return raw; }
}
function isDirectVideo(url){return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)}
function mediaMarkup(v, short=false) {
  const url = embedUrl(v.url);
  if (isDirectVideo(url)) return `<video controls playsinline preload="metadata" src="${escapeAttr(url)}"></video>`;
  return `<iframe src="${escapeAttr(url)}" title="${escapeAttr(v.title)}" allowfullscreen loading="lazy"></iframe>`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s)}
function render(){
  const q = document.getElementById("searchInput").value.toLowerCase();
  const filtered = videos.filter(v=>(filter==="all"||v.type===filter)&&(`${v.title} ${v.description}`.toLowerCase().includes(q)));
  const list = document.getElementById("videoList");
  list.innerHTML = filtered.filter(v=>v.type!=="short"||filter==="short").map(v=>`<article class="video-card">${mediaMarkup(v)}<div class="video-info"><h3>${escapeHtml(v.title)}</h3><p>${escapeHtml(v.description||"QazaqTube")}</p></div></article>`).join("") || `<p class="empty">Видео табылмады.</p>`;
  const shorts = videos.filter(v=>v.type==="short");
  document.getElementById("shortList").innerHTML = shorts.map(v=>`<article class="short-card">${mediaMarkup(v,true)}<h3>${escapeHtml(v.title)}</h3></article>`).join("") || `<p class="empty">Әзірге Shorts жоқ.</p>`;
}
async function load(){try{const r=await fetch("/api/videos");videos=await r.json();render()}catch{document.getElementById("videoList").innerHTML='<p class="empty">Сервермен байланыс жоқ.</p>'}}
document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("selected",x===b));render()});
document.getElementById("searchInput").addEventListener("input",render);
document.getElementById("addVideo").onclick=async()=>{
  const title=document.getElementById("title").value.trim(),url=document.getElementById("url").value.trim();
  const msg=document.getElementById("uploadMsg");
  if(!title||!url){msg.textContent="Атауы мен сілтемесін толтыр.";return}
  try{
    const r=await fetch("/api/videos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,url,description:document.getElementById("description").value,type:document.getElementById("type").value})});
    const data=await r.json();if(!r.ok)throw new Error(data.error||"Қате");
    ["title","url","description"].forEach(id=>document.getElementById(id).value="");
    msg.textContent="Видео қосылды!";await load();
  }catch(e){msg.textContent="Қате: "+e.message}
};
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
load();
