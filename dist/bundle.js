/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./index.ts"
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
() {

eval("{\n// App globals\nvar tiers = [\"easy\", \"medium\", \"hard\", \"elite\", \"master\"];\nvar statusDiv = document.getElementById(\"status\");\nvar resetButton = document.getElementById(\"resetButton\");\n// Initialize ChatboxReader\nvar reader = new ChatboxReader();\nreader.readargs = { colors: [] };\n// Data model\nvar data = {\n    sessionStart: Date.now(),\n    bik: { easy: 0, medium: 0, hard: 0, elite: 0, master: 0 },\n    nonBik: { easy: 0, medium: 0, hard: 0, elite: 0, master: 0 }\n};\n// Load / Save\nvar STORAGE_KEY = \"ClueTrackerData\";\nfunction saveData() {\n    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));\n    updateUI();\n    updateStatus();\n}\nfunction loadData() {\n    var stored = localStorage.getItem(STORAGE_KEY);\n    if (stored)\n        data = JSON.parse(stored);\n}\n// Regex\nvar PICKPOCKET_REGEX = /sealed clue scroll \\((hard|elite)\\) has been added to your charos clue carrier/i;\nvar BIK_REGEX = /catalyst of alteration contained\\s*:\\s*(\\d+)\\s*x\\s*sealed clue scroll \\((easy|medium|hard|elite|master)\\)/i;\n// Duplicate filter\nvar seen = [];\nfunction isDuplicate(msg) {\n    if (seen.includes(msg))\n        return true;\n    seen.push(msg);\n    if (seen.length > 20)\n        seen.shift();\n    return false;\n}\n// Handle each chat line\nfunction handleMessage(line) {\n    if (!line)\n        return;\n    if (isDuplicate(line))\n        return;\n    var m = line.match(PICKPOCKET_REGEX);\n    if (m) {\n        data.nonBik[m[1].toLowerCase()]++;\n        saveData();\n        return;\n    }\n    m = line.match(BIK_REGEX);\n    if (m) {\n        data.bik[m[2].toLowerCase()] += parseInt(m[1]);\n        saveData();\n        return;\n    }\n}\n// Polling loop\nsetInterval(function () {\n    var lines = reader.read() || [];\n    lines.forEach(function (l) { return handleMessage(l.text); });\n    updateStatus();\n}, 600);\n// Rates\nfunction hoursElapsed() { return (Date.now() - data.sessionStart) / 3600000; }\nfunction rate(count) { var h = hoursElapsed(); return h > 0 ? (count / h).toFixed(2) : \"0.00\"; }\n// UI update\nfunction updateUI() {\n    tiers.forEach(function (t) {\n        document.getElementById(\"bik-\".concat(t)).textContent = data.bik[t].toString();\n        document.getElementById(\"nonbik-\".concat(t)).textContent = data.nonBik[t].toString();\n        document.getElementById(\"rate-\".concat(t)).textContent = rate(data.bik[t] + data.nonBik[t]);\n    });\n}\nfunction updateStatus() {\n    var _a;\n    var chatFound = reader.pos != null;\n    var lastLines = ((_a = reader.read()) === null || _a === void 0 ? void 0 : _a.length) || 0;\n    statusDiv.innerHTML = \"\\n    Chatbox found: \".concat(chatFound, \"<br>\\n    Session time: \").concat((hoursElapsed() * 60).toFixed(1), \" min<br>\\n    Last poll lines: \").concat(lastLines, \"\\n  \");\n}\n// Reset session\nresetButton.addEventListener(\"click\", function () {\n    data.sessionStart = Date.now();\n    tiers.forEach(function (t) { data.bik[t] = 0; data.nonBik[t] = 0; });\n    saveData();\n});\n// Init\nloadData();\nupdateUI();\nupdateStatus();\n\n\n//# sourceURL=webpack://cluetracker/./index.ts?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./index.ts"]();
/******/ 	
/******/ })()
;