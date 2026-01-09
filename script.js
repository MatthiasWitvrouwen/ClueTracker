/* ==============================
   CHAT READER (Alt1 1.6.0)
================================ */
var reader = new ChatboxReader();
reader.readargs = { colors: [] };

/* ==============================
   STATUS DEBUG
================================ */
var status = {
  chatFound: false,
  linesSeen: 0,
  clueLines: 0,
  lastLine: ""
};

function updateStatus() {
  var el = document.getElementById("status");
  if (!el) return;

  el.innerHTML =
    "Chat found: " + status.chatFound + "<br>" +
    "Chat lines seen: " + status.linesSeen + "<br>" +
    "Clue lines detected: " + status.clueLines + "<br>" +
    "Last line:<br><i>" + status.lastLine + "</i>";
}

/* ==============================
   DATA
================================ */
var data = {
  sessionStart: Date.now(),
  bik: { easy: 0, medium: 0, hard: 0, elite: 0, master: 0 },
  nonBik: { easy: 0, medium: 0, hard: 0, elite: 0, master: 0 }
};

/* ==============================
   CHATBOX DETECTION
================================ */
status.chatFound = reader.find();
updateStatus();

/* ==============================
   DUPLICATE FILTER
================================ */
var seen = [];
function isDuplicate(msg) {
  if (seen.indexOf(msg) !== -1) return true;
  seen.push(msg);
  if (seen.length > 20) seen.shift();
  return false;
}

/* ==============================
   REGEX
================================ */
var PICKPOCKET =
  /sealed clue scroll \((hard|elite)\) has been added to your charos clue carrier/i;

var BIK =
  /catalyst of alteration contained\s*:\s*(\d+)\s*x\s*sealed clue scroll \((easy|medium|hard|elite|master)\)/i;

/* ==============================
   MESSAGE HANDLER
================================ */
function handleMessage(text) {
  if (!text) return;

  status.linesSeen++;
  status.lastLine = text;

  var msg = text.toLowerCase();

  if (msg.indexOf("sealed clue scroll") !== -1) {
    status.clueLines++;
  }

  if (isDuplicate(msg)) {
    updateStatus();
    return;
  }

  var m;

  m = msg.match(PICKPOCKET);
  if (m) {
    data.nonBik[m[1]]++;
  }

  m = msg.match(BIK);
  if (m) {
    data.bik[m[2]] += parseInt(m[1], 10);
  }

  updateUI();
  updateStatus();
}

/* ==============================
   POLLING
================================ */
setInterval(function () {
  var lines = reader.read();
  if (!lines) return;
  for (var i = 0; i < lines.length; i++) {
    handleMessage(lines[i].text);
  }
}, 600);

/* ==============================
   RATES
================================ */
function rate(count) {
  var hrs = (Date.now() - data.sessionStart) / 3600000;
  return hrs > 0 ? (count / hrs).toFixed(2) : "0.00";
}

/* ==============================
   UI UPDATE
================================ */
function updateUI() {
  var tiers = ["easy","medium","hard","elite","master"];
  for (var i = 0; i < tiers.length; i++) {
    var t = tiers[i];
    document.getElementById("bik-" + t).textContent = data.bik[t];
    document.getElementById("nonbik-" + t).textContent = data.nonBik[t];
    document.getElementById("rate-" + t).textContent =
      rate(data.bik[t] + data.nonBik[t]);
  }
}

/* ==============================
   RESET
================================ */
function resetTracker() {
  data.sessionStart = Date.now();
  for (var k in data.bik) data.bik[k] = 0;
  for (var k in data.nonBik) data.nonBik[k] = 0;
  updateUI();
  updateStatus();
}

/* ==============================
   INIT
================================ */
updateUI();
updateStatus();
