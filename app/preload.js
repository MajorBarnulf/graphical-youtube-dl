// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer } = require("electron")
const fs = require("fs");
const path = require("path");

window.addEventListener('DOMContentLoaded', () => {
let list = document.getElementById("url-list");
let field = document.getElementById("url-field");
let logs = document.getElementById("logs");
let selectedListElement;

let urls = [];
let parameters = [];


















})


function init() {
	// add global variables to your web page
	window.isElectron = true;
	window.ipcRenderer = ipcRenderer;
}

init();
