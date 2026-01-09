declare const alt1: any;
declare const ChatboxReader: any;

// Clue tiers
const tiers = ["easy","medium","hard","elite","master"];
const statusDiv = document.getElementById("status")!;
const resetButton = document.getElementById("resetButton")!;

// Initialize ChatboxReader
const reader = new ChatboxReader();
reader.readargs = { colors: [] };

// Data model
let data: { sessionStart: number; bik: Record<string, number>; nonBik: Record<string, number> } = {
    sessionStart: Date.now(),
    bik: { easy:0, medium:0, hard:0, elite:0, master:0 },
    nonBik: { easy:0, medium:0, hard:0, elite:0, master:0 }
};

// Storage keys
const STORAGE_KEY = "ClueTrackerData";
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); updateUI(); }
function loadData() { const stored = localStorage.getItem(STORAGE_KEY); if(stored) data = JSON.parse(stored); }

// Regex for clues
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

// Handle chat lines
function handleMessage(line: string){
    if(!line) return;
    if(isDuplicate(line)) return;

    let m = line.match(PICKPOCKET_REGEX);
    if(m){ data.nonBik[m[1].toLowerCase()]++; saveData(); return; }

    m = line.match(BIK_REGEX);
    if(m){ data.bik[m[2].toLowerCase()] += parseInt(m[1]); saveData(); return; }
}

// Utility functions
function hoursElapsed(){ return (Date.now() - data.sessionStart)/3600000; }
function rate(count:number){ const h = hoursElapsed(); return h>0?(count/h).toFixed(2):"0.00"; }

// UI updates
function updateUI(){
    tiers.forEach(t=>{
        (document.getElementById(`bik-${t}`)!).textContent = data.bik[t].toString();
        (document.getElementById(`nonbik-${t}`)!).textContent = data.nonBik[t].toString();
        (document.getElementById(`rate-${t}`)!).textContent = rate(data.bik[t]+data.nonBik[t]);
    });
}

function updateStatus(){
    statusDiv.innerHTML = reader.pos && reader.pos.mainbox
        ? `Chatbox found: yes<br>Session time: ${(hoursElapsed()*60).toFixed(1)} min<br>Last poll lines: ${reader.read()?.length || 0}`
        : "Waiting for chatbox...";
}

// Reset session
resetButton.addEventListener("click", ()=>{
    data.sessionStart = Date.now();
    tiers.forEach(t=>{data.bik[t]=0; data.nonBik[t]=0;});
    saveData();
});

// Attempt to find chatbox
function findChatbox(){
    reader.find();
    if(reader.pos && reader.pos.boxes.length>0){
        reader.pos.mainbox = reader.pos.boxes[0];
        console.log("Chatbox found at:", reader.pos.mainbox.rect);
    } else {
        console.warn("Chatbox not detected yet. Make sure RS3 chatbox is visible.");
    }
}

// Polling loop
setInterval(()=>{
    if(!reader.pos || !reader.pos.mainbox) findChatbox();
    if(reader.pos && reader.pos.mainbox){
        const lines = reader.read() || [];
        lines.forEach((l: {text: string}) => handleMessage(l.text));  // ✅ Type fixed here
    }
    updateStatus();
}, 600);

// Init
loadData();
updateUI();
updateStatus();
