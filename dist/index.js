"use strict";
// Clue tiers
var tiers = ["easy", "medium", "hard", "elite", "master"];
var statusDiv = document.getElementById("status");
var resetButton = document.getElementById("resetButton");
// Initialize ChatboxReader
var reader = new ChatboxReader();
reader.readargs = { colors: [] };
// Data model
var data = {
    sessionStart: Date.now(),
    bik: { easy: 0, medium: 0, hard: 0, elite: 0, master: 0 },
    nonBik: { easy: 0, medium: 0, hard: 0, elite: 0, master: 0 }
};
// Storage keys
var STORAGE_KEY = "ClueTrackerData";
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); updateUI(); }
function loadData() { var stored = localStorage.getItem(STORAGE_KEY); if (stored)
    data = JSON.parse(stored); }
// Regex for clues
var PICKPOCKET_REGEX = /sealed clue scroll \((hard|elite)\) has been added to your charos clue carrier/i;
var BIK_REGEX = /catalyst of alteration contained\s*:\s*(\d+)\s*x\s*sealed clue scroll \((easy|medium|hard|elite|master)\)/i;
// Duplicate filter
var seen = [];
function isDuplicate(msg) {
    if (seen.includes(msg))
        return true;
    seen.push(msg);
    if (seen.length > 20)
        seen.shift();
    return false;
}
// Handle chat lines
function handleMessage(line) {
    if (!line)
        return;
    if (isDuplicate(line))
        return;
    var m = line.match(PICKPOCKET_REGEX);
    if (m) {
        data.nonBik[m[1].toLowerCase()]++;
        saveData();
        return;
    }
    m = line.match(BIK_REGEX);
    if (m) {
        data.bik[m[2].toLowerCase()] += parseInt(m[1]);
        saveData();
        return;
    }
}
// Utility functions
function hoursElapsed() { return (Date.now() - data.sessionStart) / 3600000; }
function rate(count) { var h = hoursElapsed(); return h > 0 ? (count / h).toFixed(2) : "0.00"; }
// UI updates
function updateUI() {
    tiers.forEach(function (t) {
        (document.getElementById("bik-".concat(t))).textContent = data.bik[t].toString();
        (document.getElementById("nonbik-".concat(t))).textContent = data.nonBik[t].toString();
        (document.getElementById("rate-".concat(t))).textContent = rate(data.bik[t] + data.nonBik[t]);
    });
}
function updateStatus() {
    var _a;
    statusDiv.innerHTML = reader.pos && reader.pos.mainbox
        ? "Chatbox found: yes<br>Session time: ".concat((hoursElapsed() * 60).toFixed(1), " min<br>Last poll lines: ").concat(((_a = reader.read()) === null || _a === void 0 ? void 0 : _a.length) || 0)
        : "Waiting for chatbox...";
}
// Reset session
resetButton.addEventListener("click", function () {
    data.sessionStart = Date.now();
    tiers.forEach(function (t) { data.bik[t] = 0; data.nonBik[t] = 0; });
    saveData();
});
// Attempt to find chatbox
function findChatbox() {
    reader.find();
    if (reader.pos && reader.pos.boxes.length > 0) {
        reader.pos.mainbox = reader.pos.boxes[0];
        console.log("Chatbox found at:", reader.pos.mainbox.rect);
    }
    else {
        console.warn("Chatbox not detected yet. Make sure RS3 chatbox is visible.");
    }
}
// Polling loop
setInterval(function () {
    if (!reader.pos || !reader.pos.mainbox)
        findChatbox();
    if (reader.pos && reader.pos.mainbox) {
        var lines = reader.read() || [];
        lines.forEach(function (l) { return handleMessage(l.text); }); // ✅ Type fixed here
    }
    updateStatus();
}, 600);
// Init
loadData();
updateUI();
updateStatus();
