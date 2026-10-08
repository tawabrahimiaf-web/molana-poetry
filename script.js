const $=s=>document.querySelector(s);
const workFiles={98:"shams.json",103:"masnavi.json",1873:"fihi.json",1874:"majales.json"};
let catalog=null, searchIndex=[], currentWork=null, currentCategory=null, currentPoem=null;
const cache=new Map();
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const faNum=n=>new Intl.NumberFormat("fa-AF").format(n);
async function loadJSON(path){if(cache.has(path))return cache.get(path);const r=await fetch("./data/"+path);if(!r.ok)throw Error("HTTP "+r.status);const j=await r.json();cache.set(path,j);return j}
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}
function hideViews(){["categoryView","readerView"].forEach(id=>$("#"+id).classList.add("hidden"))}
function setNav(active){document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("active",a.dataset.nav===String(active)))}
function workCard(w){
 const subs=w.subcategories.map(c=>`<button class="subcat" data-work="${w.id}" data-cat="${c.id}">${esc(c.title)} <span>(${faNum(c.count)})</span></button>`).join("");
 return `<article class="work-card"><div class="work-top"><div class="work-icon">${w.icon}</div><div><h3>${esc(w.title)}</h3><span class="count">${faNum(w.count)} متن</span></div></div><p>${esc(w.description)}</p><div class="subcats">${subs}</div></article>`
}
async function init(){
 try{
  catalog=await loadJSON("catalog.json"); searchIndex=await loadJSON("search-index.json");
  $("#bioText").textContent=catalog.poet.description||"";
  $("#stats").innerHTML=`<div class="stat"><strong>${faNum(catalog.stats.poems)}</strong><span>متن</span></div><div class="stat"><strong>${faNum(catalog.stats.verses)}</strong><span>بیت/سطر</span></div><div class="stat"><strong>۴</strong><span>مجموعه اصلی</span></div>`;
  $("#worksGrid").innerHTML=catalog.works.map(workCard).join("");
  document.querySelectorAll(".subcat").forEach(b=>b.onclick=()=>openCategory(+b.dataset.work,+b.dataset.cat));
  if(location.hash.startsWith("#work/")){const id=+location.hash.split("/")[1];openWork(id)}
  else if(location.hash==="#library")document.getElementById("library").scrollIntoView();
 }catch(e){$("#worksGrid").innerHTML=`<div class="empty-message">خطا در خواندن فایل‌های محلی: ${esc(e.message)}</div>`}
}
async function getWork(id){return loadJSON(workFiles[id])}
async function openWork(id){
 currentCategory=null;
 const w=catalog.works.find(x=>x.id===id); if(!w)return;
 setNav(id); $("#homeHero").classList.add("hidden"); $("#library").classList.add("hidden"); $("#about").classList.add("hidden");
 $("#categoryView").classList.remove("hidden"); $("#readerView").classList.add("hidden");
 const data=await getWork(id); currentWork=data;
 $("#categoryIcon").textContent=w.icon;$("#categoryTitle").textContent=w.title;$("#categoryDesc").textContent=w.description;
 const rootChildren=data.categories[String(id)]?.children||[];
 const allCats=rootChildren.map(cid=>data.categories[String(cid)]).filter(Boolean);
 renderCategoryList(data, allCats, id);
 window.scrollTo({top:0,behavior:"smooth"});
}
function renderCategoryList(data,cats,workId){
 let items=[];
 for(const c of cats){
  for(const p of data.poems.filter(x=>x.cat_id===c.id)){
   items.push(`<button class="poem-item" data-poem="${p.id}"><b>${esc(p.title||"بدون عنوان")}</b><small>${esc(c.text)}</small></button>`);
  }
 }
 $("#categoryCount").textContent=`${faNum(items.length)} متن`;
 $("#categoryList").innerHTML=items.length?items.join(""):"<div class='empty-message'>محتوایی یافت نشد.</div>";
 document.querySelectorAll("#categoryList .poem-item").forEach(b=>b.onclick=()=>openPoem(+b.dataset.poem));
 $("#poemSearch").value="";
}
async function openCategory(workId,catId){
 const data=await getWork(workId);currentWork=data;currentCategory=catId;
 const c=data.categories[String(catId)]; if(!c)return;
 setNav(workId); $("#homeHero").classList.add("hidden");$("#library").classList.add("hidden");$("#about").classList.add("hidden");
 $("#categoryView").classList.remove("hidden");$("#readerView").classList.add("hidden");
 $("#categoryIcon").textContent=c.parent_id===98?"📕":c.parent_id===103?"📗":c.parent_id===1874?"📙":"📘";
 $("#categoryTitle").textContent=c.text;$("#categoryDesc").textContent=`فهرست کامل ${c.text}`;
 renderCategoryPoems(data,catId);
 history.replaceState(null,"",`#category/${workId}/${catId}`);
 window.scrollTo({top:0,behavior:"smooth"});
}
function renderCategoryPoems(data,catId){
 const poems=data.poems.filter(p=>p.cat_id===catId);
 $("#categoryCount").textContent=`${faNum(poems.length)} متن`;
 const draw=(q="")=>{
  const qq=q.trim().toLowerCase();
  const arr=poems.filter(p=>!qq||(p.title||"").toLowerCase().includes(qq));
  $("#categoryList").innerHTML=arr.length?arr.map(p=>`<button class="poem-item" data-poem="${p.id}"><b>${esc(p.title||"بدون عنوان")}</b><small>${faNum(p.verses.length)} سطر/بیت</small></button>`).join(""):"<div class='empty-message'>نتیجه‌ای پیدا نشد.</div>";
  document.querySelectorAll("#categoryList .poem-item").forEach(b=>b.onclick=()=>openPoem(+b.dataset.poem));
 };
 draw();$("#poemSearch").oninput=e=>draw(e.target.value);
}
async function openPoem(id){
 $("#homeHero").classList.add("hidden");$("#library").classList.add("hidden");$("#about").classList.add("hidden");
 const p=currentWork?.poems.find(x=>x.id===id);if(!p)return;currentPoem=p;
 $("#categoryView").classList.add("hidden");$("#readerView").classList.remove("hidden");
 $("#readerTitle").textContent=p.title||"بدون عنوان";
 const cat=currentWork.categories[String(p.cat_id)];
 $("#readerMeta").textContent=`${cat?.text||""} • ${faNum(p.verses.length)} سطر`;
 const vs=p.verses||[];
 // Most poetic categories use paired hemistiches. Prose sections are shown line-by-line.
 if(currentWork.id===1873||currentWork.id===1874){
  $("#readerPoem").innerHTML=vs.map(v=>`<div class="verse-line prose-line">${esc(v.t)}</div>`).join("");
 }else{
  let html="";
  for(let i=0;i<vs.length;i+=2){html+=`<div class="couplet"><div class="hemistich">${esc(vs[i]?.t||"")}</div><div class="hemistich left">${esc(vs[i+1]?.t||"")}</div></div>`}
  $("#readerPoem").innerHTML=html;
 }
 window.scrollTo({top:0,behavior:"smooth"});
}
function goHome(){hideViews();$("#homeHero").classList.remove("hidden");$("#library").classList.remove("hidden");$("#about").classList.remove("hidden");setNav("home");history.replaceState(null,"","#home");window.scrollTo({top:0,behavior:"smooth"})}
$("#backBtn").onclick=()=>{hideViews();$("#homeHero").classList.remove("hidden");$("#library").classList.remove("hidden");$("#about").classList.remove("hidden");setNav("home");history.replaceState(null,"","#home");window.scrollTo({top:0,behavior:"smooth"})};
$("#readerBack").onclick=()=>{if(currentCategory)openCategory(currentWork.id,currentCategory);else openWork(currentWork.id)};
$("#copyBtn").onclick=()=>{if(!currentPoem)return;navigator.clipboard?.writeText((currentPoem.verses||[]).map(v=>v.t).join("\n")).then(()=>toast("متن شعر کپی شد"))};
$("#printBtn").onclick=()=>window.print();
$("#themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("molana-theme",document.body.classList.contains("dark")?"dark":"light");$("#themeBtn").textContent=document.body.classList.contains("dark")?"☀":"☼"};
if(localStorage.getItem("molana-theme")==="dark"){document.body.classList.add("dark");$("#themeBtn").textContent="☀"}
$("#randomBtn").onclick=async()=>{try{const all=searchIndex;const p=all[Math.floor(Math.random()*all.length)];currentWork=await getWork(p.work_id);currentCategory=p.cat_id;await openPoem(p.id)}catch(e){toast("امکان نمایش شعر تصادفی نبود")}};
$("#searchInput").oninput=e=>{
 const q=e.target.value.trim().toLowerCase(), box=$("#searchResults");
 if(!q){box.classList.add("hidden");return}
 const res=searchIndex.filter(x=>(x.title||"").toLowerCase().includes(q)).slice(0,40);
 box.innerHTML=`<h3>نتایج جستجو (${faNum(res.length)})</h3>`+(res.length?res.map(x=>`<div class="result" data-rid="${x.id}" data-wid="${x.work_id}" data-cid="${x.cat_id}"><span>${esc(x.title)}</span><small>${esc(x.work)} / ${esc(x.category)}</small></div>`).join(""):"<p>نتیجه‌ای پیدا نشد.</p>");
 box.classList.remove("hidden");
 box.querySelectorAll(".result").forEach(r=>r.onclick=async()=>{currentWork=await getWork(+r.dataset.wid);currentCategory=+r.dataset.cid;openPoem(+r.dataset.rid)});
};
window.addEventListener("hashchange",()=>{if(location.hash==="#home"||!location.hash)goHome();else if(location.hash.startsWith("#work/"))openWork(+location.hash.split("/")[1])});
init();
