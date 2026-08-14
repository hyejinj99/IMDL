const defaultPosts = [
  {id:1,cat:"논문 피드백",title:"교수님 Discussion 피드백 정리",desc:"반복해서 받은 수정 포인트 4가지",author:"김혜진",comments:12,views:143,likes:34,date:"2026-08-14",quarter:"2026-Q3"},
  {id:2,cat:"연구 Tip",title:"Figure 만들 때 자주 받는 피드백 모음",desc:"폰트·축·범례·해상도 기준",author:"박민수",comments:8,views:110,likes:27,date:"2026-08-13",quarter:"2026-Q3"},
  {id:3,cat:"프로그램",title:"PLINK QC 전체 과정 정리 (Step by Step)",desc:"신입생용 최소 명령어 흐름",author:"이정훈",comments:5,views:95,likes:22,date:"2026-08-12",quarter:"2026-Q3"},
  {id:4,cat:"프로그램",title:"EndNote 라이브러리 효율적으로 관리하는 법",desc:"중복 제거와 그룹 구성",author:"최지영",comments:6,views:82,likes:18,date:"2026-07-30",quarter:"2026-Q3"},
  {id:5,cat:"연구 Tip",title:"논문 수정 Response letter 예시 정리",desc:"Reviewer comment → response → manuscript change",author:"박예은",comments:9,views:121,likes:30,date:"2026-06-15",quarter:"2026-Q2"},
  {id:6,cat:"분석",title:"결측치 처리 전에 확인할 것",desc:"MCAR/MAR/MNAR를 실제 분석에서 어떻게 볼지",author:"정유진",comments:7,views:76,likes:19,date:"2026-03-20",quarter:"2026-Q1"}
];
let posts = JSON.parse(localStorage.getItem("labhub_posts") || "null") || defaultPosts;
let currentSort = "latest", currentCategory = null, currentView = "board";

const wikiDocs = {
  plink:{cat:"프로그램 사용법",title:"PLINK 사용법",lead:"신입 연구원이 바로 따라할 수 있도록 정리한 기본 QC 흐름입니다.",likes:27,body:`<h3>1. 기본 QC 흐름</h3><p>먼저 sample/variant missingness를 확인하고, MAF·HWE 기준을 적용합니다.</p><div class="code">plink --bfile raw --geno 0.05 --mind 0.1 --maf 0.01 --hwe 1e-6 --make-bed --out qc_step1</div><h3>2. 체크 포인트</h3><ul><li>분석 전에 phenotype/covariate ID 일치 여부 확인</li><li>QC 기준은 연구 목적에 맞게 문서화</li><li>원본 데이터는 별도로 보존</li></ul>`},
  discussion:{cat:"논문 작성 Guide",title:"Discussion 작성법",lead:"결과를 반복하지 않고, 해석·의미·한계를 명확히 쓰는 구조입니다.",likes:35,body:`<h3>권장 흐름</h3><ol><li>핵심 결과 요약</li><li>기존 문헌과 비교</li><li>가능한 기전/해석</li><li>임상·연구적 의미</li><li>한계와 다음 단계</li></ol>`},
  feedback:{cat:"논문 피드백",title:"교수님 피드백 반영법",lead:"수정 전·피드백·수정 후를 남겨 같은 실수를 반복하지 않게 합니다.",likes:41,body:`<h3>기록 템플릿</h3><p><strong>Before</strong> → <strong>Feedback</strong> → <strong>After</strong> → <strong>Reason</strong> 순서로 기록합니다.</p>`},
  figures:{cat:"논문 작성 Guide",title:"Figure/Table 가이드",lead:"논문용 시각자료를 만들 때 반복적으로 확인할 요소를 정리합니다.",likes:31,body:`<h3>체크리스트</h3><ul><li>축과 단위 명확성</li><li>폰트 크기 일관성</li><li>범례 위치와 용어 통일</li><li>해상도 및 저널 규정 확인</li></ul>`}
};
const persistedWiki = JSON.parse(localStorage.getItem("labhub_wiki_likes") || "{}");
Object.keys(persistedWiki).forEach(k=>{if(wikiDocs[k]) wikiDocs[k].likes=persistedWiki[k]});

function renderPosts(){
  let data = [...posts];
  const q = document.querySelector("#searchInput").value.trim().toLowerCase();
  const quarter = document.querySelector("#quarterFilter").value;
  if(currentCategory) data = data.filter(p=>p.cat===currentCategory);
  if(quarter!=="all") data = data.filter(p=>p.quarter===quarter);
  if(q) data = data.filter(p => (p.title+" "+p.desc+" "+p.cat).toLowerCase().includes(q));
  if(currentView==="best") data = data.filter(p=>p.likes>=20);
  data.sort((a,b)=> currentSort==="likes" ? b.likes-a.likes : currentSort==="comments" ? b.comments-a.comments : b.date.localeCompare(a.date));
  document.querySelector("#postList").innerHTML = data.map(p=>`
    <div class="post-row row">
      <div class="score">👍 ${p.likes}</div>
      <div class="post-title"><span class="badge">${p.cat}</span>${p.title}<small>${p.desc}</small></div>
      <div>${p.author}</div><div>${p.comments}</div><div>${p.views}</div><div>${p.date.slice(5)}</div>
    </div>`).join("") || `<div style="padding:36px;text-align:center;color:#7b8694">조건에 맞는 글이 없습니다.</div>`;
}
function setView(view){
  currentView=view;
  document.querySelectorAll(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const wiki = view==="wiki";
  document.querySelector("#boardView").classList.toggle("hidden",wiki);
  document.querySelector("#wikiView").classList.toggle("hidden",!wiki);
  document.querySelector("#pageTitle").textContent = wiki ? "Wiki" : view==="best" ? "인기글" : "전체글";
  document.querySelector("#pageSubtitle").textContent = wiki ? "검증된 연구실 프로토콜과 작성 노하우를 문서로 축적합니다." : "연구 노하우를 공유하고, 좋은 자료를 지식으로 축적합니다.";
  if(!wiki) renderPosts();
}
document.querySelectorAll(".nav-item[data-view]").forEach(b=>b.onclick=()=>{currentCategory=null;setView(b.dataset.view)});
document.querySelectorAll(".category-filter").forEach(b=>b.onclick=()=>{currentCategory=b.dataset.category;currentView="board";setView("board");document.querySelector("#pageTitle").textContent=b.dataset.category});
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentSort=b.dataset.sort;renderPosts()});
document.querySelector("#quarterFilter").onchange=renderPosts;
document.querySelector("#searchInput").oninput=()=> currentView==="wiki" ? null : renderPosts();

const dlg=document.querySelector("#postDialog");
document.querySelector("#newPostBtn").onclick=()=>dlg.showModal();
document.querySelector("#savePostBtn").onclick=(e)=>{
  const title=document.querySelector("#postTitle").value.trim(), body=document.querySelector("#postBody").value.trim();
  if(!title||!body){e.preventDefault();return}
  const today=new Date().toISOString().slice(0,10), m=+today.slice(5,7), q=`${today.slice(0,4)}-Q${Math.ceil(m/3)}`;
  posts.unshift({id:Date.now(),cat:document.querySelector("#postCategory").value,title,desc:body.slice(0,52),author:"Researcher",comments:0,views:1,likes:0,date:today,quarter:q});
  localStorage.setItem("labhub_posts",JSON.stringify(posts)); setTimeout(renderPosts,50);
};

function renderWiki(key){
  document.querySelectorAll(".wiki-link").forEach(x=>x.classList.toggle("active",x.dataset.wiki===key));
  const d=wikiDocs[key];
  document.querySelector("#wikiCategory").textContent=d.cat;
  document.querySelector("#wikiTitle").textContent=d.title;
  document.querySelector("#wikiLead").textContent=d.lead;
  document.querySelector("#wikiBody").innerHTML=d.body;
  document.querySelector("#wikiLikeCount").textContent=d.likes;
  document.querySelector("#wikiLikeBtn").dataset.key=key;
  const ranking=Object.entries(wikiDocs).sort((a,b)=>b[1].likes-a[1].likes);
  document.querySelector("#wikiRanking").innerHTML=ranking.map(([k,v])=>`<li><strong>${v.title}</strong>👍 ${v.likes}</li>`).join("");
}
document.querySelectorAll(".wiki-link").forEach(b=>b.onclick=()=>renderWiki(b.dataset.wiki));
document.querySelector("#wikiLikeBtn").onclick=(e)=>{
  const key=e.currentTarget.dataset.key;
  wikiDocs[key].likes++;
  const saved={};Object.entries(wikiDocs).forEach(([k,v])=>saved[k]=v.likes);
  localStorage.setItem("labhub_wiki_likes",JSON.stringify(saved)); renderWiki(key);
};
renderPosts(); renderWiki("plink");
