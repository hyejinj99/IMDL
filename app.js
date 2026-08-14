const currentUser = { name: "김혜진", initials: "HJ", role: "Admin" };

const defaultCategories = ["공지","논문 피드백","프로그램","분석","연구 Tip","질문"];
let categories = JSON.parse(localStorage.getItem("labhub_categories") || "null") || defaultCategories;

const defaultPosts = [
  {id:1,cat:"논문 피드백",title:"교수님 Discussion 피드백 정리",desc:"반복해서 받은 수정 포인트 4가지",author:"김혜진",comments:12,views:143,likes:34,date:"2026-08-14",quarter:"2026-Q3"},
  {id:2,cat:"연구 Tip",title:"Figure 만들 때 자주 받는 피드백 모음",desc:"폰트·축·범례·해상도 기준",author:"박민수",comments:8,views:110,likes:27,date:"2026-08-13",quarter:"2026-Q3"},
  {id:3,cat:"프로그램",title:"PLINK QC 전체 과정 정리 (Step by Step)",desc:"신입생용 최소 명령어 흐름",author:"이정훈",comments:5,views:95,likes:22,date:"2026-08-12",quarter:"2026-Q3"},
  {id:4,cat:"프로그램",title:"EndNote 라이브러리 효율적으로 관리하는 법",desc:"중복 제거와 그룹 구성",author:"최지영",comments:6,views:82,likes:18,date:"2026-07-30",quarter:"2026-Q3"},
  {id:5,cat:"연구 Tip",title:"논문 수정 Response letter 예시 정리",desc:"Reviewer comment → response → manuscript change",author:"박예은",comments:9,views:121,likes:30,date:"2026-06-15",quarter:"2026-Q2"},
  {id:6,cat:"분석",title:"결측치 처리 전에 확인할 것",desc:"MCAR/MAR/MNAR를 실제 분석에서 어떻게 볼지",author:"정유진",comments:7,views:76,likes:19,date:"2026-03-20",quarter:"2026-Q1"},
  {id:7,cat:"논문 피드백",title:"Methods 수정 전후 비교",desc:"통계 분석 문장을 더 명확하게 바꾼 사례",author:"김혜진",comments:4,views:64,likes:16,date:"2026-05-20",quarter:"2026-Q2"},
  {id:8,cat:"연구 Tip",title:"초록 쓸 때 자주 빠지는 요소",desc:"Background-Methods-Results-Conclusion 압축 팁",author:"김혜진",comments:3,views:58,likes:14,date:"2026-02-28",quarter:"2026-Q1"}
];
let posts = JSON.parse(localStorage.getItem("labhub_posts") || "null") || defaultPosts;
let currentSort = "latest", currentCategory = null, currentView = "board";

const likedPosts = new Set(JSON.parse(localStorage.getItem("labhub_liked_posts") || "[]"));
const likedWiki = new Set(JSON.parse(localStorage.getItem("labhub_liked_wiki") || "[]"));

const wikiDocs = {
  plink:{cat:"프로그램 사용법",title:"PLINK 사용법",lead:"신입 연구원이 바로 따라할 수 있도록 정리한 기본 QC 흐름입니다.",likes:27,body:`<h3>1. 기본 QC 흐름</h3><p>먼저 sample/variant missingness를 확인하고, MAF·HWE 기준을 적용합니다.</p><div class="code">plink --bfile raw --geno 0.05 --mind 0.1 --maf 0.01 --hwe 1e-6 --make-bed --out qc_step1</div><h3>2. 체크 포인트</h3><ul><li>분석 전에 phenotype/covariate ID 일치 여부 확인</li><li>QC 기준은 연구 목적에 맞게 문서화</li><li>원본 데이터는 별도로 보존</li></ul>`},
  discussion:{cat:"논문 작성 Guide",title:"Discussion 작성법",lead:"결과를 반복하지 않고, 해석·의미·한계를 명확히 쓰는 구조입니다.",likes:35,body:`<h3>권장 흐름</h3><ol><li>핵심 결과 요약</li><li>기존 문헌과 비교</li><li>가능한 기전/해석</li><li>임상·연구적 의미</li><li>한계와 다음 단계</li></ol>`},
  feedback:{cat:"논문 피드백",title:"교수님 피드백 반영법",lead:"수정 전·피드백·수정 후를 남겨 같은 실수를 반복하지 않게 합니다.",likes:41,body:`<h3>기록 템플릿</h3><p><strong>Before</strong> → <strong>Feedback</strong> → <strong>After</strong> → <strong>Reason</strong> 순서로 기록합니다.</p>`},
  figures:{cat:"논문 작성 Guide",title:"Figure/Table 가이드",lead:"논문용 시각자료를 만들 때 반복적으로 확인할 요소를 정리합니다.",likes:31,body:`<h3>체크리스트</h3><ul><li>축과 단위 명확성</li><li>폰트 크기 일관성</li><li>범례 위치와 용어 통일</li><li>해상도 및 저널 규정 확인</li></ul>`}
};
const persistedWiki = JSON.parse(localStorage.getItem("labhub_wiki_likes") || "{}");
Object.keys(persistedWiki).forEach(k=>{if(wikiDocs[k]) wikiDocs[k].likes=persistedWiki[k]});

let projectFolders = JSON.parse(localStorage.getItem("labhub_note_folders") || "null") || ["내 프로젝트"];
let researchNotes = JSON.parse(localStorage.getItem("labhub_research_notes") || "null") || [
  {id:101,folder:"내 프로젝트",title:"분석 방향 메모",body:"목적: 분석 방향 정리\n진행 내용: 변수 구조 확인\n다음 할 일: 결측치와 이상치 확인",visibility:"private",author:"김혜진",date:"2026-08-14",updated:"2026-08-14"},
  {id:102,folder:"내 프로젝트",title:"공유용 분석 체크리스트",body:"분석 전에 ID 매칭, 결측치, 데이터 누수 가능성을 먼저 확인합니다.",visibility:"public",author:"김혜진",date:"2026-08-12",updated:"2026-08-12"},
  {id:103,folder:"공개",title:"웨어러블 데이터 정리 팁",body:"날짜 기준을 먼저 고정하고 participant별 결측 구간을 확인하면 좋습니다.",visibility:"public",author:"박민수",date:"2026-08-10",updated:"2026-08-10"}
];
let noteScope = "mine", selectedFolder = "all";

function saveAll(){
  localStorage.setItem("labhub_posts",JSON.stringify(posts));
  localStorage.setItem("labhub_liked_posts",JSON.stringify([...likedPosts]));
  localStorage.setItem("labhub_categories",JSON.stringify(categories));
}
function saveWiki(){
  const saved={}; Object.entries(wikiDocs).forEach(([k,v])=>saved[k]=v.likes);
  localStorage.setItem("labhub_wiki_likes",JSON.stringify(saved));
  localStorage.setItem("labhub_liked_wiki",JSON.stringify([...likedWiki]));
}
function saveNotes(){
  localStorage.setItem("labhub_note_folders",JSON.stringify(projectFolders));
  localStorage.setItem("labhub_research_notes",JSON.stringify(researchNotes));
}
function inPeriod(post, period){
  if(period==="all") return true;
  if(period.includes("-Q")) return post.quarter===period;
  const [year,half]=period.split("-");
  if(!post.quarter.startsWith(year)) return false;
  const q=Number(post.quarter.slice(-1));
  return half==="H1" ? q<=2 : q>=3;
}
function escapeHtml(s=""){
  return s.replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function renderCategoryUI(){
  const nav=document.querySelector("#categoryNav");
  nav.innerHTML=categories.map(c=>`<button class="nav-item category-filter" data-category="${escapeHtml(c)}">📌 ${escapeHtml(c)}</button>`).join("");
  nav.querySelectorAll(".category-filter").forEach(b=>b.onclick=()=>{currentCategory=b.dataset.category; setView("board"); document.querySelector("#pageTitle").textContent=b.dataset.category;});
  document.querySelector("#postCategory").innerHTML=categories.map(c=>`<option>${escapeHtml(c)}</option>`).join("");
}
function renderPosts(){
  let data=[...posts];
  const q=document.querySelector("#searchInput").value.trim().toLowerCase();
  const quarter=document.querySelector("#quarterFilter").value;
  if(currentCategory) data=data.filter(p=>p.cat===currentCategory);
  if(quarter!=="all") data=data.filter(p=>p.quarter===quarter);
  if(q) data=data.filter(p=>(p.title+" "+p.desc+" "+p.cat+" "+p.author).toLowerCase().includes(q));
  if(currentView==="best") data=data.filter(p=>p.likes>=20);
  data.sort((a,b)=>currentSort==="likes"?b.likes-a.likes:currentSort==="comments"?b.comments-a.comments:b.date.localeCompare(a.date));
  document.querySelector("#postList").innerHTML=data.map(p=>{
    const selected=likedPosts.has(String(p.id));
    return `<div class="post-row row"><div><button class="post-like ${selected?"liked":""}" data-post-id="${p.id}" ${selected?"disabled":""}>👍 ${p.likes}${selected?" ✓":""}</button></div><div class="post-title"><span class="badge">${escapeHtml(p.cat)}</span>${escapeHtml(p.title)}<small>${escapeHtml(p.desc)}</small></div><div>${escapeHtml(p.author)}</div><div>${p.comments}</div><div>${p.views}</div><div>${p.date.slice(5)}</div></div>`;
  }).join("") || `<div class="empty-state">조건에 맞는 글이 없습니다.</div>`;
  document.querySelectorAll(".post-like:not(:disabled)").forEach(btn=>btn.onclick=()=>{
    const id=String(btn.dataset.postId); if(likedPosts.has(id)) return;
    const post=posts.find(p=>String(p.id)===id); if(!post) return;
    post.likes++; likedPosts.add(id); saveAll(); renderPosts();
  });
}
function renderWiki(key){
  document.querySelectorAll(".wiki-link").forEach(x=>x.classList.toggle("active",x.dataset.wiki===key));
  const d=wikiDocs[key];
  document.querySelector("#wikiCategory").textContent=d.cat;
  document.querySelector("#wikiTitle").textContent=d.title;
  document.querySelector("#wikiLead").textContent=d.lead;
  document.querySelector("#wikiBody").innerHTML=d.body;
  const btn=document.querySelector("#wikiLikeBtn"), selected=likedWiki.has(key);
  btn.dataset.key=key; btn.classList.toggle("liked",selected); btn.disabled=selected;
  btn.innerHTML=`👍 ${selected?"도움됐어요 ✓":"도움됐어요"} <span>${d.likes}</span>`;
  document.querySelector("#wikiRanking").innerHTML=Object.entries(wikiDocs).sort((a,b)=>b[1].likes-a[1].likes).map(([,v])=>`<li><strong>${v.title}</strong>👍 ${v.likes}</li>`).join("");
}
function renderRanking(){
  const period=document.querySelector("#rankingPeriod").value;
  const totals={};
  posts.filter(p=>inPeriod(p,period)).forEach(p=>{totals[p.author] ||= {likes:0,posts:0}; totals[p.author].likes+=p.likes; totals[p.author].posts++;});
  const rows=Object.entries(totals).sort((a,b)=>b[1].likes-a[1].likes);
  document.querySelector("#rankingList").innerHTML=rows.map(([name,v],i)=>`<div class="rank-card ${i===0?"top":""}"><div class="rank-num">${i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</div><div><div class="rank-name">${escapeHtml(name)}</div><div class="rank-meta">게시글 ${v.posts}개 · 기간 내 받은 추천 합계</div></div><div class="rank-score">👍 ${v.likes}</div></div>`).join("") || `<div class="empty-state board-card">해당 기간의 데이터가 없습니다.</div>`;
}
function renderProfile(){
  const period=document.querySelector("#profilePeriod").value;
  const mine=posts.filter(p=>p.author===currentUser.name && inPeriod(p,period));
  const likes=mine.reduce((s,p)=>s+p.likes,0);
  document.querySelector("#myPostCount").textContent=mine.length;
  document.querySelector("#myLikeCount").textContent=likes;
  document.querySelector("#myAvgLikes").textContent=mine.length?(likes/mine.length).toFixed(1):"0";
  document.querySelector("#myPosts").innerHTML=mine.sort((a,b)=>b.date.localeCompare(a.date)).map(p=>`<div class="post-row"><div class="post-title"><span class="badge">${escapeHtml(p.cat)}</span>${escapeHtml(p.title)}<small>${p.date} · 👍 ${p.likes} · 댓글 ${p.comments}</small></div></div>`).join("") || `<div class="empty-state">이 기간에 작성한 글이 없습니다.</div>`;
}

function renderFolders(){
  const wrap=document.querySelector("#projectFolders");
  const ownFolders=[...new Set(researchNotes.filter(n=>n.author===currentUser.name).map(n=>n.folder).concat(projectFolders))];
  wrap.innerHTML=ownFolders.map(f=>`<button class="project-filter ${selectedFolder===f?"active":""}" data-folder="${escapeHtml(f)}">📂 ${escapeHtml(f)}</button>`).join("");
  document.querySelector('[data-folder="all"]').classList.toggle("active",selectedFolder==="all");
  document.querySelectorAll(".project-filter").forEach(b=>b.onclick=()=>{selectedFolder=b.dataset.folder; renderFolders(); renderNotes();});
  const select=document.querySelector("#noteFolder");
  select.innerHTML=projectFolders.map(f=>`<option>${escapeHtml(f)}</option>`).join("");
}
function renderNotes(){
  let data=researchNotes.filter(n=> noteScope==="mine" ? n.author===currentUser.name : n.visibility==="public");
  if(selectedFolder!=="all") data=data.filter(n=>n.folder===selectedFolder);
  data.sort((a,b)=>b.updated.localeCompare(a.updated));
  const mine=researchNotes.filter(n=>n.author===currentUser.name);
  document.querySelector("#notesCount").textContent=data.length;
  document.querySelector("#privateCount").textContent=mine.filter(n=>n.visibility==="private").length;
  document.querySelector("#publicCount").textContent=mine.filter(n=>n.visibility==="public").length;
  document.querySelector("#notesList").innerHTML=data.map(n=>{
    const mineNote=n.author===currentUser.name;
    const preview=escapeHtml(n.body.length>120?n.body.slice(0,120)+"…":n.body).replace(/\n/g,"<br>");
    return `<article class="note-card"><div class="note-card-top"><span class="folder-chip">📁 ${escapeHtml(n.folder)}</span><span class="visibility-chip ${n.visibility}">${n.visibility==="private"?"🔒 나만 보기":"🌐 공개"}</span></div><h3>${escapeHtml(n.title)}</h3><p>${preview}</p><div class="note-card-bottom"><span>${escapeHtml(n.author)} · ${n.updated}</span>${mineNote?`<div><button class="text-btn edit-note" data-id="${n.id}">수정</button><button class="text-btn danger delete-note" data-id="${n.id}">삭제</button></div>`:""}</div></article>`;
  }).join("") || `<div class="empty-state note-empty">이 조건에 해당하는 연구노트가 없습니다.</div>`;
  document.querySelectorAll(".edit-note").forEach(b=>b.onclick=()=>openNoteDialog(Number(b.dataset.id)));
  document.querySelectorAll(".delete-note").forEach(b=>b.onclick=()=>{const id=Number(b.dataset.id); if(confirm("이 연구노트를 삭제할까요?")){researchNotes=researchNotes.filter(n=>n.id!==id); saveNotes(); renderFolders(); renderNotes();}});
}
function openNoteDialog(id=null){
  const dialog=document.querySelector("#noteDialog");
  document.querySelector("#noteId").value=id||"";
  document.querySelector("#noteDialogTitle").textContent=id?"연구노트 수정":"연구노트 작성";
  renderFolders();
  if(id){const n=researchNotes.find(x=>x.id===id); if(!n) return; document.querySelector("#noteFolder").value=n.folder; document.querySelector("#noteVisibility").value=n.visibility; document.querySelector("#noteTitle").value=n.title; document.querySelector("#noteBody").value=n.body;}
  else {document.querySelector("#noteFolder").value=projectFolders[0]||""; document.querySelector("#noteVisibility").value="private"; document.querySelector("#noteTitle").value=""; document.querySelector("#noteBody").value="";}
  dialog.showModal();
}

function setView(view){
  currentView=view;
  document.querySelectorAll(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  ["boardView","wikiView","notesView","rankingView","profileView"].forEach(id=>document.querySelector("#"+id).classList.add("hidden"));
  const titles={board:["전체글","연구 노하우를 공유하고, 좋은 자료를 지식으로 축적합니다."],best:["인기글","추천이 많이 쌓인 게시글을 모아봅니다."],wiki:["Wiki","검증된 연구실 프로토콜과 작성 노하우를 문서로 축적합니다."],notes:["연구노트","프로젝트별로 개인 연구기록을 정리하고, 필요한 노트만 공유합니다."],ranking:["랭킹","분기·반기별로 연구실 구성원의 기여도를 확인합니다."],profile:["내 프로필","내가 쓴 글과 받은 추천을 기간별로 확인합니다."]};
  document.querySelector("#pageTitle").textContent=titles[view][0]; document.querySelector("#pageSubtitle").textContent=titles[view][1];
  document.querySelector("#newPostBtn").classList.toggle("hidden",!["board","best"].includes(view));
  document.querySelector("#searchInput").classList.toggle("hidden",!["board","best"].includes(view));
  if(view==="wiki") document.querySelector("#wikiView").classList.remove("hidden");
  else if(view==="notes"){document.querySelector("#notesView").classList.remove("hidden"); renderFolders(); renderNotes();}
  else if(view==="ranking"){document.querySelector("#rankingView").classList.remove("hidden"); renderRanking();}
  else if(view==="profile"){document.querySelector("#profileView").classList.remove("hidden"); renderProfile();}
  else {document.querySelector("#boardView").classList.remove("hidden"); renderPosts();}
}

document.querySelectorAll(".nav-item[data-view]").forEach(b=>b.onclick=()=>{currentCategory=null;setView(b.dataset.view)});
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentSort=b.dataset.sort;renderPosts()});
document.querySelector("#quarterFilter").onchange=renderPosts;
document.querySelector("#searchInput").oninput=()=>["board","best"].includes(currentView)&&renderPosts();
document.querySelector("#rankingPeriod").onchange=renderRanking;
document.querySelector("#profilePeriod").onchange=renderProfile;
document.querySelector("#profileBtn").onclick=()=>setView("profile");
document.querySelectorAll(".wiki-link").forEach(b=>b.onclick=()=>renderWiki(b.dataset.wiki));
document.querySelector("#wikiLikeBtn").onclick=e=>{const key=e.currentTarget.dataset.key;if(likedWiki.has(key))return;wikiDocs[key].likes++;likedWiki.add(key);saveWiki();renderWiki(key);};

document.querySelectorAll(".note-tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".note-tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");noteScope=b.dataset.noteScope;selectedFolder="all";renderFolders();renderNotes();});
document.querySelector("#newNoteBtn").onclick=()=>openNoteDialog();
document.querySelector("#newFolderBtn").onclick=()=>{document.querySelector("#folderName").value="";document.querySelector("#folderDialog").showModal();};
document.querySelector("#saveFolderBtn").onclick=e=>{const name=document.querySelector("#folderName").value.trim();if(!name){e.preventDefault();return;}if(!projectFolders.includes(name))projectFolders.push(name);saveNotes();setTimeout(()=>{selectedFolder=name;renderFolders();renderNotes();},20);};
document.querySelector("#saveNoteBtn").onclick=e=>{const title=document.querySelector("#noteTitle").value.trim(),body=document.querySelector("#noteBody").value.trim();if(!title||!body){e.preventDefault();return;}const id=Number(document.querySelector("#noteId").value)||null;const today=new Date().toISOString().slice(0,10);if(id){const n=researchNotes.find(x=>x.id===id);if(n&&n.author===currentUser.name){n.folder=document.querySelector("#noteFolder").value;n.visibility=document.querySelector("#noteVisibility").value;n.title=title;n.body=body;n.updated=today;}}else{researchNotes.unshift({id:Date.now(),folder:document.querySelector("#noteFolder").value,title,body,visibility:document.querySelector("#noteVisibility").value,author:currentUser.name,date:today,updated:today});}saveNotes();setTimeout(()=>{noteScope="mine";selectedFolder="all";document.querySelectorAll(".note-tab").forEach(x=>x.classList.toggle("active",x.dataset.noteScope==="mine"));renderFolders();renderNotes();},20);};

const postDialog=document.querySelector("#postDialog");
document.querySelector("#newPostBtn").onclick=()=>postDialog.showModal();
document.querySelector("#savePostBtn").onclick=e=>{const title=document.querySelector("#postTitle").value.trim(),body=document.querySelector("#postBody").value.trim();if(!title||!body){e.preventDefault();return;}const today=new Date().toISOString().slice(0,10),m=+today.slice(5,7),q=`${today.slice(0,4)}-Q${Math.ceil(m/3)}`;posts.unshift({id:Date.now(),cat:document.querySelector("#postCategory").value,title,desc:body.slice(0,80),author:currentUser.name,comments:0,views:1,likes:0,date:today,quarter:q});saveAll();setTimeout(renderPosts,20);};

const adminDialog=document.querySelector("#adminDialog");
function renderAdminCategories(){document.querySelector("#adminCategoryList").innerHTML=categories.map(c=>`<div class="admin-category-row"><span>📌 ${escapeHtml(c)}</span><button type="button" class="delete-category" data-cat="${escapeHtml(c)}">삭제</button></div>`).join("");document.querySelectorAll(".delete-category").forEach(b=>b.onclick=()=>{const cat=b.dataset.cat;if(posts.some(p=>p.cat===cat)){alert("이 게시판에 글이 있어 삭제할 수 없습니다.");return;}categories=categories.filter(c=>c!==cat);saveAll();renderAdminCategories();renderCategoryUI();});}
document.querySelector("#adminBoardBtn").onclick=()=>{renderAdminCategories();adminDialog.showModal();};
document.querySelector("#addCategoryBtn").onclick=e=>{const name=document.querySelector("#newCategoryName").value.trim();if(!name){e.preventDefault();return;}if(!categories.includes(name))categories.push(name);document.querySelector("#newCategoryName").value="";saveAll();setTimeout(()=>{renderAdminCategories();renderCategoryUI();},20);};

renderCategoryUI();renderWiki("plink");renderFolders();renderPosts();