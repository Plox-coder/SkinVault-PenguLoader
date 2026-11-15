/**
 * SkinVault for Pengu Loader — prototype v0.4.
 * Read-only GET requests to the League Client API. Does not automate matches or modify skins.
 * Manual ownership changes and RP prices are stored locally.
 */
const STORE_PREFIX = 'skinvault/v1/';
const MAX_ROWS = 80;

const css = `
  :host { all: initial; position: fixed; inset: 0; z-index: 2147483647; display: block; pointer-events: none; font-family: Inter, 'Segoe UI', Arial, sans-serif; color: #e8e4d8; }
  #sv-trigger, #sv-panel { pointer-events: auto; }
  * { box-sizing: border-box; }
  button, input { font: inherit; }
  button { cursor: pointer; }
  #sv-trigger { position: fixed; bottom: 22px; right: 20px; z-index: 2147483600; border: 1px solid #bca473; border-radius: 100px; background: #102531; color: #f4d69a; font-weight: 700; padding: 12px 18px; box-shadow: 0 10px 35px #0009; }
  #sv-panel { position: fixed; inset: 35px 30px 35px auto; z-index: 2147483601; width: min(610px, calc(100vw - 55px)); height: calc(100vh - 70px); background: #0c1924; border: 1px solid #b49b68; box-shadow: 0 15px 65px #000d; border-radius: 14px; display: none; overflow: hidden; }
  #sv-panel.open { display: flex; flex-direction: column; }
  header { padding: 19px 22px 15px; border-bottom: 1px solid #263b4a; background: #10212d; }
  .sv-top { display:flex; justify-content:space-between; align-items:center; gap:12px; }
  .sv-title { font-size: 23px; color: #f6d491; font-weight: 800; letter-spacing: .3px; }
  .sv-sub { font-size: 12px; color:#9fb5c0; margin-top:4px; }
  .sv-close { background: transparent; border:0; color:#d0d6d9; font-size:25px; }
  .sv-actions { display:flex; gap:8px; margin-top:15px; flex-wrap: wrap; }
  .sv-button { background:#b89b60; color:#0e1a21; border:1px solid #dbc18a; font-size:12px; font-weight:700; padding:9px 12px; border-radius:6px; }
  .sv-button.secondary { background:#192e3b; color:#cfdfeb; border-color:#395362; }
  .sv-button:disabled { opacity:0.5; cursor:wait; }
  .sv-stats { display:grid; grid-template-columns:repeat(3, 1fr); gap:9px; padding:14px 18px 8px; }
  .sv-stat { min-width: 0; background:#172b38; border:1px solid #2c4653; border-radius:8px; padding:11px 9px; }
  .sv-stat b { display:block; color:#f1ce88; font-size:22px; }
  .sv-stat span { color:#9cb0ba; font-size:11px; }
  .sv-total { margin:0 18px 10px; border:1px solid #395361; background:#112936; padding:11px; border-radius:7px; }
  .sv-total b {color:#f5cf85; font-size:19px;}
  .sv-note {font-size:11px; color:#b8c6cc; margin-top:4px; line-height:1.45;}
  #sv-status { font-size:12px; line-height:1.5; margin:0 18px 11px; color:#acc0ca; }
  #sv-status.error { color:#edab9a; }
  .sv-controls { padding: 0 18px 10px; display:flex; gap:8px; }
  #sv-search {min-width:0; flex:1; background:#081722; color:#fff; padding:9px; border-radius:6px; border:1px solid #38505d; outline:none;}
  #sv-filter {background:#162e3a; color:#dce9e9; border:1px solid #38505d; border-radius:6px; padding:8px;}
  #sv-list { padding: 0 18px 15px; overflow-y:auto; flex:1; }
  .sv-row {border-bottom:1px solid #293a46; display:flex; align-items:center; gap:10px; padding:8px 0; min-height:58px; }
  .sv-art { width:39px; height:39px; background:#1e3240; border:1px solid #365466; border-radius:5px; object-fit:cover; flex-shrink:0; }
  .sv-skin { flex:1; min-width:0; }
  .sv-skin strong { display:block; color:#e6e1d4; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .sv-skin span { display:block; color:#8bafbc; font-size:10px; margin-top:3px; }
  .sv-price {width:70px; background:#0c222f; color:#efcf8b; padding:7px 6px; border:1px solid #37515b; border-radius:4px; font-size:12px;}
  .sv-owned { width:18px; height:18px; accent-color:#d1aa62; cursor:pointer; }
  .sv-reset {background:transparent; color:#d6b675; border:0; font-size:17px; width:19px; padding:0;}
  .sv-empty {text-align:center; color:#9cb4bc; padding:35px 14px; line-height:1.65; font-size:13px; }
  .sv-more {width:100%; padding:9px; margin:10px 0; background:#1d3442; color:#d9c18b; border:1px solid #385565; border-radius:6px;}
  .sv-tabs { display:flex; gap:6px; padding:10px 18px 4px; flex-wrap:wrap; }
  .sv-tab { flex:1; min-width:100px; border:1px solid #3c5663; border-radius:6px; background:#152a37; color:#bed0d8; padding:9px 6px; font-size:11px; font-weight:700; }
  .sv-tab.active { background:#bda36b; border-color:#dfcb93; color:#0b1923; }
  .sv-chip { font-size:10px; display:inline-block; border:1px solid #426071; border-radius:4px; color:#b8cfda; padding:3px 6px; margin:3px 0; }
  .sv-chip.unknown { border-color:#8e7852; color:#ddc58c; }
  .sv-summary { font-size:11px; line-height:1.5; padding:8px 18px; color:#9bbbc9; }
  .sv-row .sv-detail {font-size:10px; color:#c3d6dc;}
  .sv-actions .sv-button { flex:0 1 auto; }
  footer { font-size:10px; line-height:1.35; padding:9px 18px; color:#8a9fa9; border-top:1px solid #263b4a; background:#10212d; }
`;

const safeArray = (data) => Array.isArray(data) ? data :
  (data && typeof data === 'object' ? Object.entries(data).map(([key, value]) =>
    (value && typeof value === 'object') ? { id: value.id ?? key, ...value } : null).filter(Boolean) : []);

const isDefault = (s) => s.isBase === true || (Number(s.id) > 0 && Number(s.id) % 1000 === 0);
const skinId = (s) => String(s.id ?? s.skinId ?? '');
const ownedInClient = (s) => s.ownership?.owned === true || s.owned === true;

// League Classic uses champion identifiers starting with Jade_* and IDs
// in the 60xxx family (e.g. regular Ahri: 103089; Classic Ahri: 60103089).
// Filter by game mode, NOT by name: regular LoL variants are preserved.
function isClassicSkin(s) {
  const id = skinId(s);
  const champ = String(s.championId ?? '');
  const alias = String(s.championAlias ?? s.championKey ?? s.alias ?? '');
  return /^60\d{6}$/.test(id) || /^60\d{3}$/.test(champ) ||
    /^Jade_/i.test(alias) || s.mode === 'classic' || s.gameMode === 'classic';
}

function normalize(raw) {
  return safeArray(raw).filter(s => !isClassicSkin(s)).map(s => ({
    id: skinId(s),
    name: (typeof s.name === 'string' && s.name.trim()) || `Skin ${skinId(s)}`,
    championId: String(s.championId ?? ''),
    owned: ownedInClient(s),
    isBase: isDefault(s),
    image: typeof s.tilePath === 'string' ? s.tilePath : '',
  })).filter(s => s.id && /^\d+$/.test(s.id) && !s.isBase);
}

function getStored(key, fallback) {
  try {
    if (window.DataStore && typeof window.DataStore.get === 'function') {
      return window.DataStore.get(STORE_PREFIX + key, fallback) ?? fallback;
    }
    return JSON.parse(localStorage.getItem(STORE_PREFIX + key)) ?? fallback;
  } catch { return fallback; }
}
function setStored(key, value) {
  try {
    if (window.DataStore && typeof window.DataStore.set === 'function') {
      return window.DataStore.set(STORE_PREFIX + key, value);
    }
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) { console.warn('[SkinVault] Could not save data', e); return false; }
}
async function getJson(path) {
  const r = await fetch(path, {method:'GET', cache:'no-store'});
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
}

// Extra collections use separate storage keys and do not overwrite the v0.3 skin collection.
function emptyExtras(){return {icons:[],wards:[],chromas:[],chromaBases:[],scannedBaseIds:[],statuses:{}};}
function hydrateExtras(value){
  const v=value&&typeof value==='object'?value:{};
  return {
    icons:Array.isArray(v.icons)?v.icons:[],wards:Array.isArray(v.wards)?v.wards:[],chromas:Array.isArray(v.chromas)?v.chromas:[],
    chromaBases:Array.isArray(v.chromaBases)?v.chromaBases:[],scannedBaseIds:Array.isArray(v.scannedBaseIds)?v.scannedBaseIds:[],
    statuses:v.statuses&&typeof v.statuses==='object'?v.statuses:{}
  };
}
// LCU versions can return arrays, {items:[...]}, {data:[...]}, or ID-keyed maps.
function rowsFrom(input){
  if(Array.isArray(input))return input.filter(x=>x&&typeof x==='object');
  if(!input||typeof input!=='object')return [];
  for(const key of ['items','data','inventory','summonerIcons','icons','wardSkins','wards','chromas','results']){
    if(Array.isArray(input[key]))return rowsFrom(input[key]);
    if(input[key]&&typeof input[key]==='object'){
      const nested=rowsFrom(input[key]);if(nested.length)return nested;
    }
  }
  const numeric=Object.entries(input).filter(([key,val])=>/^\d+$/.test(key)&&val&&typeof val==='object').map(([id,entry])=>({id:entry.id??id,...entry}));
  if(numeric.length)return numeric;
  // Some inventories return {SUMMONER_ICON:[...]} or {CHAMPION_SKIN:[...]}.
  const nestedArrays=Object.values(input).filter(value=>Array.isArray(value));
  if(nestedArrays.length)return nestedArrays.flatMap(rowsFrom);
  return [];
}
function idOf(x){
  // itemId identifies the inventory item; id may identify the row.
  for(const value of [x?.itemId,x?.id,x?.skinId,x?.chromaId,x?.wardSkinId,x?.summonerIconId,x?.iconId]){
    if(/^\d+$/.test(String(value??'')))return String(value);
  }
  return '';
}
function explicitOwned(x){
  for(const value of [x?.ownership?.owned,x?.owned,x?.isOwned,x?.ownership?.isOwned])if(typeof value==='boolean')return value;
  for(const value of [x?.ownedQuantity,x?.quantity])if(typeof value==='number')return value>0;
  return null;
}
function metadataImage(x){
  for(const v of [x?.iconPath,x?.imagePath,x?.wardImagePath,x?.chromaPath,x?.tilePath,x?.image])if(typeof v==='string'&&v.startsWith('/lol-game-data/'))return v;
  return '';
}
function catalogArray(response,label){
  const result=new Map();
  for(const x of rowsFrom(response)){
    const id=idOf(x);if(!id||id==='0')continue;
    result.set(id,{id,name:typeof x.name==='string'&&x.name.trim()?x.name:`${label} ${id}`,image:metadataImage(x),owned:false,ownedKnown:false});
  }
  return result;
}
function inventoryShape(value){
  if(Array.isArray(value))return true;
  if(!value||typeof value!=='object')return false;
  if(Object.keys(value).some(k=>/^\d+$/.test(k)))return true;
  for(const key of ['items','data','inventory','summonerIcons','icons','wardSkins','wards']){
    if(Array.isArray(value[key]))return true;
    if(value[key]&&typeof value[key]==='object'&&inventoryShape(value[key]))return true;
  }
  return Object.values(value).some(x=>Array.isArray(x));
}
function applyInventory(map, response, assumeOwned){
  let matched=0,explicit=0;
  for(const item of rowsFrom(response)){
    const id=idOf(item);if(!id)continue;
    const ownership=explicitOwned(item);
    if(ownership===null&&!assumeOwned)continue;
    const owned=ownership===null?true:ownership;
    if(!map.has(id))map.set(id,{id,name:typeof item.name==='string'?item.name:`Item ${id}`,image:metadataImage(item),owned:false,ownedKnown:false});
    const target=map.get(id);target.owned=owned;target.ownedKnown=true;matched++;
    if(ownership!==null)explicit++;
    if(!target.image)target.image=metadataImage(item);
  }
  return {matched,explicit};
}
function mergeKnown(previous,fresh){
  // Keep previous ownership checks only when the new inventory has not confirmed a status.
  const prev=new Map(previous.map(x=>[x.id,x]));
  for(const [id,entry] of fresh){const old=prev.get(id);if(old?.ownedKnown===true&&!entry.ownedKnown){entry.ownedKnown=true;entry.owned=old.owned;}}
}
function chromaCatalog(data){
  const chromas=new Map(); const bases=[];
  for(const raw of rowsFrom(data)){
    const skinId=idOf(raw);
    if(!skinId||isClassicSkin(raw)||!Array.isArray(raw.chromas)||!raw.chromas.length)continue;
    const championId=String(raw.championId??Math.floor(Number(skinId)/1000));
    if(!/^\d+$/.test(championId)||Number(championId)<=0)continue;
    bases.push({skinId,championId});
    for(const item of raw.chromas){
      const id=idOf(item);if(!id||chromas.has(id))continue;
      chromas.set(id,{id,name:typeof item.name==='string'&&item.name.trim()?item.name:`Chroma ${id}`,image:metadataImage(item),skinId,skinName:typeof raw.name==='string'?raw.name:'',championId,owned:false,ownedKnown:false});
    }
  }
  return {chromas,bases};
}
async function getFirst(paths){
  const diagnostics=[];
  for(const path of paths){
    try{return {data:await getJson(path),path,errors:diagnostics};}
    catch(e){diagnostics.push(`${path.split('?')[0]}: ${String(e.message).match(/HTTP \d+/)?.[0]||'error'}`);}
  }
  return {data:null,path:null,errors:diagnostics};
}

export function load() {
  console.info('[SkinVault] load() started. v0.4 (4 collections)');
  if (document.getElementById('skinvault-root')) return;
  const host = document.createElement('div');
  host.id = 'skinvault-root';
  document.documentElement.appendChild(host);
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `
    <style>${css}</style>
    <button id="sv-trigger" type="button">✦ SkinVault</button>
    <section id="sv-panel" role="dialog" aria-label="SkinVault">
      <header>
        <div class="sv-top"><div><div class="sv-title">✦ SkinVault</div><div class="sv-sub" id="sv-account">Skin collection · Standard League of Legends only</div></div><button class="sv-close" id="sv-close" title="Close">×</button></div>
        <div class="sv-actions"><button class="sv-button" id="sv-sync">↻ Sync collection</button><button class="sv-button secondary" id="sv-export">Export JSON</button><button class="sv-button secondary" id="sv-import">Import JSON</button><button class="sv-button secondary" id="sv-probe">Scan icons, wards & chromas</button><button class="sv-button secondary" id="sv-scan">Scan 30 skins for chromas</button><input type="file" id="sv-file" accept=".json,application/json" hidden></div>
      </header>
      <nav class="sv-tabs" aria-label="Collections">
        <button type="button" class="sv-tab active" data-tab="skins">Skins</button>
        <button type="button" class="sv-tab" data-tab="icons">Icons</button>
        <button type="button" class="sv-tab" data-tab="wards">Ward skins</button>
        <button type="button" class="sv-tab" data-tab="chromas">Chromas</button>
      </nav>
      <div class="sv-stats" id="sv-stats"></div>
      <div class="sv-total" id="sv-total"></div>
      <div id="sv-status"></div><div class="sv-summary" id="sv-summary"></div>
      <div class="sv-controls"><input type="search" id="sv-search" placeholder="Search skins..." aria-label="Search skins"><select id="sv-filter" aria-label="Filter"><option value="all">All</option><option value="owned">Owned</option><option value="missing">Missing</option></select></div>
      <div id="sv-list"></div>
      <footer>Unofficial fan plugin • Standard League of Legends only • Read-only API requests • Inventory detection may be incomplete • RP total includes only prices you enter.</footer>
    </section>`;

  const $ = (id) => root.getElementById(id);
  const state = { tab:'skins', extra:emptyExtras(), extrasLoading:false, scanLoading:false, account: 'manual', label: 'Manual mode', skins: [], prices: {}, overrides: {}, query:'', filter:'all', visible:MAX_ROWS, loading:false, source:'manual' };
  function loadSavedAccount(account) {
    state.account = account;
    const data = getStored(account, {skins:[], prices:{}, overrides:{}, label:'Manual mode'});
    // Refilter locally saved data from older v0.2 versions as well.
    state.skins = normalize(Array.isArray(data.skins) ? data.skins : []);
    state.prices = data.prices && typeof data.prices === 'object' ? data.prices : {};
    state.overrides = data.overrides && typeof data.overrides === 'object' ? data.overrides : {};
    state.label = data.label || 'Manual mode';
    state.source = data.source || 'manual';
    state.extra = hydrateExtras(getStored('extras/' + account, emptyExtras()));
  }
  function saveExtras() { setStored('extras/' + state.account, state.extra); }
  function save() {
    setStored(state.account, { skins:state.skins, prices:state.prices, overrides:state.overrides, label:state.label, source:state.source });
    setStored('last-account', state.account);
  }
  function isOwned(s) { return Object.hasOwn(state.overrides,s.id) ? state.overrides[s.id] : s.owned === true; }
  function setStatus(msg, error=false) {
    $('sv-status').textContent = msg;
    $('sv-status').classList.toggle('error',error);
  }
  function create(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function render() {
    const isSkinTab=state.tab==='skins';
    const rows=isSkinTab ? state.skins : state.extra[state.tab];
    const known=rows.filter(r=>r.ownedKnown === true);
    const owned=isSkinTab ? rows.filter(isOwned).length : known.filter(r=>r.owned === true).length;
    const missing=isSkinTab ? rows.length-owned : known.filter(r=>r.owned === false).length;
    const unknown=isSkinTab ? 0 : rows.length-known.length;
    const completed=isSkinTab || unknown===0;
    $('sv-account').textContent=state.label;
    $('sv-stats').replaceChildren(...[
      [owned,'Owned'], [completed?missing:`${missing} + ?`,'Missing'],
      [completed && rows.length ? `${Math.round(100*owned/rows.length)} %` : '—','Completion']
    ].map(([value,label])=>{const e=create('div','sv-stat');e.append(create('b','',String(value)),create('span','',label));return e;}));
    $('sv-total').replaceChildren();
    if (isSkinTab) {
      const totalRP=state.skins.filter(isOwned).reduce((n,s)=>n+(Number(state.prices[s.id])||0),0);
      const unpriced=state.skins.filter(s=>isOwned(s)&&!(Number(state.prices[s.id])>0)).length;
      $('sv-total').append(create('div','sv-note','Tracked RP value'),create('b','',new Intl.NumberFormat('en-US').format(totalRP)+' RP'),create('div','sv-note',`${unpriced} owned skins have no entered RP price. This is a partial total, not actual spending or account resale value.`));
    } else {
      $('sv-total').append(create('div','sv-note','Scan status'),create('b','',`${rows.length} items in catalog`),create('div','sv-note',`${owned} confirmed owned · ${missing} missing · ${unknown} unverified. Unknown items are NOT counted as missing.`));
    }
    $('sv-probe').disabled=state.extrasLoading;
    $('sv-sync').disabled=state.loading;
    $('sv-scan').disabled=state.scanLoading||state.extrasLoading||!state.extra.chromaBases.length;
    $('sv-sync').textContent=state.loading?'Loading...':'↻ Sync skins';
    $('sv-probe').textContent=state.extrasLoading?'Scanning collections...':'Scan icons, wards & chromas';
    $('sv-scan').textContent=state.scanLoading?'Scanning chromas...':'Scan 30 skins for chromas';
    for(const tab of root.querySelectorAll('.sv-tab')) tab.classList.toggle('active',tab.dataset.tab===state.tab);
    $('sv-search').placeholder=isSkinTab?'Search skins...':'Search items...';
    const statuses=Object.entries(state.extra.statuses).filter(([k])=>k!=='errores').map(([k,v])=>`${k==='detalle-chromas'?'chroma-details':k}: ${v}`).join(' · ');
    const progress=`Chromas: ${state.extra.scannedBaseIds.length}/${state.extra.chromaBases.length} skins checked individually.`;
    $('sv-summary').textContent=`${isSkinTab?'Standard League of Legends only':unknown+' unverified items.'} ${progress} ${statuses}`;
    const list=$('sv-list');list.replaceChildren();
    const q=state.query.toLocaleLowerCase('en');
    const filtered=rows.filter(r=>{
      const ownedRow=isSkinTab ? isOwned(r):r.owned===true&&r.ownedKnown===true;
      if(state.filter==='owned'&&!ownedRow)return false;
      if(state.filter==='missing'&&(isSkinTab?ownedRow:!(r.ownedKnown&&r.owned===false)))return false;
      return `${r.name} ${r.id} ${r.skinName||''} ${r.championId||''}`.toLocaleLowerCase('en').includes(q);
    }).sort((a,b)=>a.name.localeCompare(b.name,'en'));
    if(!filtered.length){list.append(create('div','sv-empty',rows.length?'No items match these filters.':'No collection data yet. Click “Scan icons, wards & chromas”.'));return;}
    const frag=document.createDocumentFragment();
    for(const s of filtered.slice(0,state.visible)){
      const row=create('div','sv-row');
      const img=create('img','sv-art');
      if(s.image?.startsWith('/lol-game-data/'))img.src=s.image;
      img.alt='';img.loading='lazy';
      const desc=create('div','sv-skin');desc.append(create('strong','',s.name),create('span','',`ID ${s.id}${s.skinName?' · '+s.skinName:''}`));
      if(isSkinTab){
        const price=create('input','sv-price');price.type='number';price.min='0';price.max='1000000';price.step='1';price.placeholder='RP';price.value=state.prices[s.id]??'';
        price.addEventListener('change',()=>{const val=price.value.trim();if(!val)delete state.prices[s.id];else{const n=Number(val);if(Number.isFinite(n)&&n>=0&&n<=1000000)state.prices[s.id]=Math.round(n);}save();render();});
        const checkbox=create('input','sv-owned');checkbox.type='checkbox';checkbox.checked=isOwned(s);checkbox.title='Do you own this skin?';
        checkbox.addEventListener('change',()=>{state.overrides[s.id]=checkbox.checked;save();render();});
        const reset=create('button','sv-reset','↺');reset.title='Restore ownership status from the client';reset.style.visibility=Object.hasOwn(state.overrides,s.id)?'visible':'hidden';
        reset.addEventListener('click',()=>{delete state.overrides[s.id];save();render();});
        row.append(img,desc,price,checkbox,reset);
      } else {
        const label=create('span',`sv-chip${!s.ownedKnown?' unknown':''}`,s.ownedKnown?(s.owned?'✓ Owned':'Missing'):'Unverified');
        row.append(img,desc,label);
      }
      frag.append(row);
    }
    if(filtered.length>state.visible){const more=create('button','sv-more',`Show more (${filtered.length-state.visible} remaining)`);more.onclick=()=>{state.visible+=MAX_ROWS;render();};frag.append(more);}
    list.append(frag);
  }
  async function sync() {
    if (state.loading) return;
    state.loading=true; render(); setStatus('Connecting to the League of Legends client...');
    try {
      const summoner=await getJson('/lol-summoner/v1/current-summoner');
      const id=String(summoner.summonerId ?? '');
      if (!/^\d+$/.test(id) || id === '0') throw new Error('Could not find your account ID. Sign in to the League of Legends client.');
      const [inventoryResult, catalogResult]=await Promise.allSettled([
        getJson(`/lol-champions/v1/inventories/${encodeURIComponent(id)}/skins-minimal`),
        getJson('/lol-game-data/assets/v1/skins.json')
      ]);
      if (inventoryResult.status==='rejected' && catalogResult.status==='rejected') {
        throw new Error('Could not access the inventory or catalog. Check your League Client version or import a JSON file.');
      }
      const rawInventory=inventoryResult.status==='fulfilled' ? safeArray(inventoryResult.value) : [];
      const rawCatalog=catalogResult.status==='fulfilled' ? safeArray(catalogResult.value) : [];
      const omittedIds = new Set([...rawInventory, ...rawCatalog].filter(isClassicSkin).map(skinId));
      const inventory=normalize(rawInventory);
      const catalog=normalize(rawCatalog);
      const byId=new Map();
      for (const s of catalog) byId.set(s.id,s);
      for (const s of inventory) {
        byId.set(s.id,{...byId.get(s.id),...s,owned:s.owned});
      }
      if (byId.size===0) throw new Error('The client returned no valid skins.');
      loadSavedAccount(id);
      state.skins=normalize([...byId.values()]);
      state.label = [summoner.gameName || summoner.displayName || 'Summoner',summoner.tagLine ? '#'+summoner.tagLine : ''].join('');
      state.source=inventoryResult.status==='fulfilled' ? 'client' : 'manual';
      save();
      setStatus(inventoryResult.status==='fulfilled'
        ? `Synced ${state.skins.length} regular LoL skins. Excluded ${omittedIds.size} League Classic entries. You can adjust ownership manually.`
        : `Loaded the regular LoL catalog (${state.skins.length} skins, ${omittedIds.size} Classic entries excluded). Ownership could not be read; use manual mode.`,
        inventoryResult.status!=='fulfilled');
    } catch (e) {
      setStatus(`Sync failed: ${e.message}. Try again or import a JSON file.`,true);
      console.warn('[SkinVault]',e);
    } finally {state.loading=false;render();}
  }
  async function readExtras(){
    if(state.extrasLoading||state.scanLoading)return;
    state.extrasLoading=true;render();setStatus('Reading icons, ward skins, chroma catalogs and ownership...');
    try{
      const summoner=await getJson('/lol-summoner/v1/current-summoner');
      const accountId=String(summoner.summonerId??'');
      if(!/^\d+$/.test(accountId)||accountId==='0')throw new Error('You are not signed in to the League of Legends client');
      if(state.account!==accountId)loadSavedAccount(accountId);
      state.label=[summoner.gameName||summoner.displayName||'Summoner',summoner.tagLine?'#'+summoner.tagLine:''].join('');
      const sid=encodeURIComponent(accountId);
      // Limit concurrency to three large catalog requests.
      const [iconCat,wardCat,skinCat]=await Promise.all([
        getFirst(['/lol-game-data/assets/v1/summoner-icons.json','/lol-game-data/assets/v1/profile-icons.json']),
        getFirst(['/lol-game-data/assets/v1/ward-skins.json']),
        getFirst(['/lol-game-data/assets/v1/skins.json'])
      ]);
      const extras=state.extra;
      const iconMap=iconCat.path?catalogArray(iconCat.data,'Icon'):new Map(extras.icons.map(x=>[x.id,{...x}]));
      const wardMap=wardCat.path?catalogArray(wardCat.data,'Ward skin'):new Map(extras.wards.map(x=>[x.id,{...x}]));
      const data=skinCat.path?chromaCatalog(skinCat.data):{
        chromas:new Map(extras.chromas.map(x=>[x.id,{...x}])),bases:extras.chromaBases
      };
      const chromaMap=data.chromas;
      const oldCatalogHashes=extras.chromaBases.map(x=>x.skinId).join(',');
      if(oldCatalogHashes!==data.bases.map(x=>x.skinId).join(',')){
        extras.scannedBaseIds=extras.scannedBaseIds.filter(x=>data.bases.some(b=>b.skinId===x));
      }
      mergeKnown(extras.icons,iconMap);mergeKnown(extras.wards,wardMap);mergeKnown(extras.chromas,chromaMap);
      const [iconInv,wardInv,wardCollections,chromaInv]=await Promise.all([
        getFirst([`/lol-inventory/v2/inventory/SUMMONER_ICON`,`/lol-collections/v2/inventories/${sid}/summoner-icons`,`/lol-collections/v1/inventories/${sid}/summoner-icons`]),
        getFirst(['/lol-inventory/v2/inventory/WARD_SKIN']),
        getFirst([`/lol-collections/v1/inventories/${sid}/ward-skins`]),
        getFirst(['/lol-inventory/v2/inventory/CHAMPION_SKIN'])
      ]);
      if(iconInv.data!==null&&inventoryShape(iconInv.data)){
        const fullInventory=iconInv.path==='/lol-inventory/v2/inventory/SUMMONER_ICON';
        if(fullInventory)for(const v of iconMap.values()){v.ownedKnown=true;v.owned=false;}
        applyInventory(iconMap,iconInv.data,fullInventory);
      }
      if(wardInv.data!==null&&inventoryShape(wardInv.data)){
        for(const v of wardMap.values()){v.ownedKnown=true;v.owned=false;}
        applyInventory(wardMap,wardInv.data,true);
      }
      // Collections may return both owned ward skins and catalog items: require explicit ownership.
      if(wardCollections.data!==null&&inventoryShape(wardCollections.data))applyInventory(wardMap,wardCollections.data,false);
      if(chromaInv.data!==null&&inventoryShape(chromaInv.data)){
        // CHAMPION_SKIN mixes skins and chromas: only match chroma IDs found in the catalog.
        let ownedCount=0;
        for(const entry of rowsFrom(chromaInv.data)){
          const id=idOf(entry);const candidate=chromaMap.get(id);
          if(!candidate)continue;
          const owned=explicitOwned(entry);
          if(owned===false)continue;
          candidate.owned=true;candidate.ownedKnown=true;ownedCount++;
        }
        extras.statuses['chromas-inventory']=`GET succeeded, ${ownedCount} chromas identified; others remain unverified`;
      }
      extras.icons=[...iconMap.values()];extras.wards=[...wardMap.values()];extras.chromas=[...chromaMap.values()];extras.chromaBases=data.bases;
      extras.statuses.icons=`catalog ${iconCat.path?'OK':'unavailable'} / ownership ${iconInv.path&&inventoryShape(iconInv.data)?'OK':'unverified'}`;
      extras.statuses.wards=`catalog ${wardCat.path?'OK':'unavailable'} / ownership ${wardInv.path&&inventoryShape(wardInv.data)||wardCollections.path&&inventoryShape(wardCollections.data)?'OK':'unverified'}`;
      extras.statuses.chromas=`catalog ${skinCat.path?'OK':'unavailable'} / ownership ${chromaInv.path&&inventoryShape(chromaInv.data)?'partial':'pending scan'}`;
      extras.statuses.errores=[...iconCat.errors,...wardCat.errors,...skinCat.errors,...iconInv.errors,...wardInv.errors,...wardCollections.errors,...chromaInv.errors].join('; ').slice(0,800);
      if(!iconCat.path&&!wardCat.path&&!skinCat.path)throw new Error('Could not read any catalog. Check your League Client version.');
      saveExtras();save();
      setStatus(`Found ${extras.icons.length} icons, ${extras.wards.length} ward skins, and ${extras.chromas.length} chromas. Unverified items need further scanning; scan chromas in batches.`);
    }catch(e){setStatus(`Partial scan: ${e.message}`,true);console.warn('[SkinVault] Collection scan',e);}
    finally{state.extrasLoading=false;render();}
  }

  async function scanChromasBatch(){
    if(state.scanLoading||state.extrasLoading)return;
    if(!state.extra.chromaBases.length){setStatus('First click “Scan icons, wards & chromas”.',true);return;}
    state.scanLoading=true;render();
    const sid=encodeURIComponent(state.account);
    const extras=state.extra;
    const finished=new Set(extras.scannedBaseIds);
    const batch=extras.chromaBases.filter(b=>!finished.has(b.skinId)).slice(0,30);
    if(!batch.length){state.scanLoading=false;render();setStatus('All skins with chromas have been scanned.');return;}
    const map=new Map(extras.chromas.map(c=>[c.id,c]));
    let ok=0,failed=0,confirmed=0;
    try{
      // At most three concurrent GET requests. Does not modify client data.
      for(let i=0;i<batch.length;i+=3){
        const group=batch.slice(i,i+3);
        const responses=await Promise.all(group.map(async b=>{
          try{return {base:b,result:await getJson(`/lol-champions/v1/inventories/${sid}/champions/${encodeURIComponent(b.championId)}/skins/${encodeURIComponent(b.skinId)}/chromas`)}}catch(e){return {base:b,error:e};}
        }));
        for(const r of responses){
          if(r.error){failed++;continue;}
          ok++;finished.add(r.base.skinId);
          for(const chroma of rowsFrom(r.result)){
            const id=idOf(chroma);const target=map.get(id);
            if(!target)continue;
            const owned=explicitOwned(chroma);
            if(owned!==null){target.owned=owned;target.ownedKnown=true;confirmed++;}
            if(!target.image)target.image=metadataImage(chroma);
          }
        }
        extras.chromas=[...map.values()];extras.scannedBaseIds=[...finished];saveExtras();
        setStatus(`Scanning chromas: ${Math.min(i+3,batch.length)}/${batch.length} skins in this batch. ${ok} successful responses, ${failed} errors.`);
        render();
      }
      extras.statuses['detalle-chromas']=`${finished.size}/${extras.chromaBases.length} skins; ${failed} errors in this batch`;
      saveExtras();
      setStatus(`Batch complete: ${ok} skins scanned, ${failed} failures, ${confirmed} chroma ownership statuses confirmed. Click again to continue.` ,failed>0);
    }catch(e){setStatus(`Chroma scan failed: ${e.message}`,true);}
    finally{state.scanLoading=false;render();}
  }

  function exportJson() {
    const data={application:'SkinVault',format:2,exportedAt:new Date().toISOString(),
      accountLabel:state.label,skins:state.skins.map(s=>({...s,selectedOwned:isOwned(s),rp:state.prices[s.id]??null})),
      ownedCount:state.skins.filter(isOwned).length,
      icons:state.extra.icons,wards:state.extra.wards,chromas:state.extra.chromas,
      collectionStatus:state.extra.statuses,
      chromaScan:{checkedSkins:state.extra.scannedBaseIds.length,totalSkins:state.extra.chromaBases.length},
      note:'ownedKnown=false means the ownership status is unknown; do not count the item as missing.'};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const link=create('a');link.href=url;link.download='skinvault-collection.json';
    root.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setStatus('JSON file saved to your computer.');
  }
  async function importJson(file) {
    try {
      if (file.size > 10*1024*1024) throw new Error('File too large (10 MB maximum)');
      const parsed=JSON.parse(await file.text());
      if (parsed.application!=='SkinVault' || !Array.isArray(parsed.skins)) throw new Error('Please select a JSON file exported by SkinVault.');
      const classicCount=parsed.skins.filter(isClassicSkin).length;
      const clean=normalize(parsed.skins);
      if (!clean.length) throw new Error('The file contains no valid skins.');
      const account='manual';loadSavedAccount(account);
      state.skins=clean;
      state.overrides={};state.prices={};
      for (const s of parsed.skins) {
        const id=skinId(s);
        if (!/^\d+$/.test(id) || isClassicSkin(s)) continue;
        if (typeof s.selectedOwned==='boolean') state.overrides[id]=s.selectedOwned;
        const rp=Number(s.rp);
        if (s.rp!==null && s.rp!==undefined && Number.isFinite(rp) && rp>=0 && rp<=1000000) state.prices[id]=Math.round(rp);
      }
      state.label='Imported collection'; state.source='import'; save(); render();
      setStatus(`Imported ${state.skins.length} regular LoL skins. Excluded ${classicCount} League Classic entries. You can still edit ownership manually.`);
    } catch(e) {setStatus(`Import failed: ${e.message}`,true);}
  }
  $('sv-probe').addEventListener('click',readExtras);
  $('sv-scan').addEventListener('click',scanChromasBatch);
  for(const tab of root.querySelectorAll('.sv-tab'))tab.addEventListener('click',()=>{state.tab=tab.dataset.tab;state.visible=MAX_ROWS;state.query='';$('sv-search').value='';render();});
  $('sv-trigger').addEventListener('click',()=>{$('sv-panel').classList.toggle('open');});
  $('sv-close').addEventListener('click',()=>{$('sv-panel').classList.remove('open');});
  $('sv-sync').addEventListener('click',sync);
  $('sv-export').addEventListener('click',exportJson);
  $('sv-import').addEventListener('click',()=>$('sv-file').click());
  $('sv-file').addEventListener('change',e=>{const file=e.target.files?.[0];if(file) importJson(file);e.target.value='';});
  $('sv-search').addEventListener('input',e=>{state.query=e.target.value;state.visible=MAX_ROWS;render();});
  $('sv-filter').addEventListener('change',e=>{state.filter=e.target.value;state.visible=MAX_ROWS;render();});
  loadSavedAccount(getStored('last-account','manual'));
  render();
  setStatus('Showing regular League of Legends skins only, excluding League Classic. Open the League Client to sync automatically.');
  // One initial sync attempt, with no continuous polling.
  setTimeout(sync,2500); // Only skins sync automatically; extra collections are scanned on demand.
}
