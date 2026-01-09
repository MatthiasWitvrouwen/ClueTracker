declare const alt1: any;
declare const ChatboxReader: any;

// App globals
const tiers = ["easy","medium","hard","elite","master"];
const statusDiv = document.getElementById("status")!;
const resetButton = document.getElementById("resetButton")!;

// Initialize ChatboxReader
const reader = new ChatboxReader();
reader.readargs = { colors: [] };

// Data model
let data: {
  sessionStart: number,
  bik: Record<string, number>,
  nonBik: Record<string, number>
} = {
  sessionStart: Date.now(),
  bik: { easy:0, medium:0, hard:0, elite:0, master:0 },
  nonBik: { easy:0, medium:0, hard:0, elite:0, master:0 }
};

// Load / Save
const STORAGE_KEY = "ClueTrackerData";
function saveData() { 
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); 
  updateUI(); 
  updateStatus();
}
function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if(stored) data = JSON.parse(stored);
}

// Regex
const PICKPOCKET_REGEX = /sealed clue scroll \((hard|elite)\) has been added to your charos clue carrier/i;
const BIK_REGEX = /catalyst of alteration contained\s*:\s*(\d+)\s*x\s*sealed clue scroll \((easy|medium|hard|elite|master)\)/i;

// Duplicate filter
let seen: string[] = [];
function isDuplicate(msg: string) {
  if(seen.includes(msg)) return true;
  seen.push(msg);
  if(seen.length>20) seen.shift();
  return false;
}

// Handle each chat line
function handleMessage(line: string) {
  if(!line) return;
  if(isDuplicate(line)) return;

  let m = line.match(PICKPOCKET_REGEX);
  if(m) { data.nonBik[m[1].toLowerCase()]++; saveData(); return; }

  m = line.match(BIK_REGEX);
  if(m) { data.bik[m[2].toLowerCase()] += parseInt(m[1]); saveData(); return; }
}

// Polling loop
setInterval(()=>{
  const lines = reader.read() || [];
  lines.forEach((l: { text: string }) => handleMessage(l.text));
  updateStatus();
}, 600);

// Rates
function hoursElapsed() { return (Date.now() - data.sessionStart)/3600000; }
function rate(count:number) { const h=hoursElapsed(); return h>0?(count/h).toFixed(2):"0.00"; }

// UI update
function updateUI() {
  tiers.forEach(t=>{
    (document.getElementById(`bik-${t}`) as HTMLElement).textContent = data.bik[t].toString();
    (document.getElementById(`nonbik-${t}`) as HTMLElement).textContent = data.nonBik[t].toString();
    (document.getElementById(`rate-${t}`) as HTMLElement).textContent = rate(data.bik[t]+data.nonBik[t]);
  });
}

function updateStatus() {
  const chatFound = reader.pos != null;
  const lastLines = reader.read()?.length || 0;
  statusDiv.innerHTML = `
    Chatbox found: ${chatFound}<br>
    Session time: ${(hoursElapsed()*60).toFixed(1)} min<br>
    Last poll lines: ${lastLines}
  `;
}

// Reset session
resetButton.addEventListener("click", ()=>{
  data.sessionStart = Date.now();
  tiers.forEach(t=>{data.bik[t]=0;data.nonBik[t]=0;});
  saveData();
});

// Init
loadData();
updateUI();
updateStatus();
