// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

document.getElementById('icon').ondragstart = function () { return false; };

var content = {
	element: document.getElementById("content"),
	onMouseUp: function () {
		if (verticalDrag.mouseDown === true || horizontalDragUp.mouseDown === true || horizontalDragDown.mouseDown === true) {
			verticalDrag.mouseDown = false;
			horizontalDragUp.mouseDown = false;
			horizontalDragDown.mouseDown = false;
			sendPreferences.window();
		}

	},
	onMouseMove: function (event){
		verticalDrag.onMouseMove(event);
		horizontalDragUp.onMouseMove(event);
		horizontalDragDown.onMouseMove(event);
	}
}

var verticalDrag = {
	position: 50,
	mouseDown: false,
	element: document.getElementById("verticalDrag"),
	parentElement: document.getElementById("verticalDrag").parentElement,
	onMouseMove: function(event) {
		if (this.mouseDown) {
			this.position = this.position + event.movementY / this.parentElement.clientHeight * 100;
			this.position = Math.min(Math.max(this.position, 20), 80);
			this.parentElement.style.gridTemplateRows = "calc(" + this.position + "% - 5px) 10px calc(" + (100 - this.position) + "% - 5px)";
		}
	},
	setPosition: function(newPosition) {
		this.position = newPosition;
		this.parentElement.style.gridTemplateRows = "calc(" + this.position + "% - 5px) 10px calc(" + (100 - this.position) + "% - 5px)";
	}
}

var horizontalDragUp = {
	position: 50,
	mouseDown: false,
	element: document.getElementById("horizontalDragUp"),
	parentElement: document.getElementById("horizontalDragUp").parentElement,
	onMouseMove: function (event) {
		if (this.mouseDown) {
			this.position = this.position + event.movementX / this.parentElement.clientWidth * 100;
			this.position = Math.min(Math.max(this.position, 20), 80);
			this.parentElement.style.gridTemplateColumns = "calc(" + this.position + "% - 5px) 10px calc(" + (100 - this.position) + "% - 5px)";
		}
	},
	setPosition: function (newPosition) {
		this.position = newPosition;
		this.parentElement.style.gridTemplateColumns = "calc(" + this.position + "% - 5px) 10px calc(" + (100 - this.position) + "% - 5px)";
	}
}

var horizontalDragDown = {
	position: 50,
	mouseDown: false,
	element: document.getElementById("horizontalDragDown"),
	parentElement: document.getElementById("horizontalDragDown").parentElement,
	onMouseMove: function (event) {
		if (this.mouseDown) {
			this.position = this.position + event.movementX / this.parentElement.clientWidth * 100;
			this.position = Math.min(Math.max(this.position, 20), 80);
			this.parentElement.style.gridTemplateColumns = "calc(" + this.position + "% - 5px) 10px calc(" + (100 - this.position) + "% - 5px)";
		}
	},
	setPosition: function (newPosition) {
		this.position = newPosition;
		this.parentElement.style.gridTemplateColumns = "calc(" + this.position + "% - 5px) 10px calc(" + (100 - this.position) + "% - 5px)";
	}
}

var urlList = {
	element: document.getElementById("url-list-container"),
	parentElement: document.getElementById("url-list-container").parentElement,
	defineHeight: function () {
		this.element.style.height = (this.parentElement.clientHeight - 56) + "px";
	},
	addElement: function(url, id) {
		this.element.innerHTML = this.element.innerHTML + '<div class="url-list-element" id="url-list-element-' + id + '" onclick="urlListElement.onClick(this.id)">' + url +'</div>'
	},
	removeElement: function (id) {
		document.getElementById(id).remove(self);
		if (document.getElementById(id.slice(0, 17) + (parseInt(id.slice(17)) + 1))){
			urlList.selectNewElement(id.slice(0, 17) + (parseInt(id.slice(17)) + 1));
		}
		//url-list-element-10
	},
	selectNewElement: function(id) {
		if(this.selectedElement) {
			this.selectedElement.classList.remove("url-list-element-selected");
		}
		this.selectedElement = document.getElementById(id);
		this.selectedElement.classList.add("url-list-element-selected");
		
	},
	selectedElement: null
}

var descriptionButton = {
	status: true,
	descriptionButtonElement: document.getElementById("button-description"),
	descriptionElement: document.getElementById("decription"),
	onClick: function () {
		if (this.status) {
			this.status = false;
			this.descriptionElement.classList.add("hidden");
			this.descriptionButtonElement.innerHTML = "↓";
		} else if (this.status === false) {
			this.status = true;
			this.descriptionElement.classList.remove("hidden");
			this.descriptionButtonElement.innerHTML = "↑";
		}
		sendPreferences.window();
	},
	setStatus: function(newStatus){
		this.status = newStatus;
		this.onClick();
	}
}

var ipcRenderer = window.ipcRenderer;

var sendPreferences = {
	window: function() {
		ipcRenderer.send('set-preferences-window', {
			showDescription: descriptionButton.status,
			verticalDragPosition: verticalDrag.position,
			horizontalDragUpPosition: horizontalDragUp.position,
			horizontalDragDownPosition: horizontalDragDown.position
		})
	}
}

var getPreferences = {
	window: function() {
		let preferences = ipcRenderer.sendSync('get-preferences','plz');
		descriptionButton.setStatus(!preferences.window.showDescription);
		verticalDrag.setPosition(preferences.window.verticalDragPosition);
		horizontalDragUp.setPosition(preferences.window.horizontalDragUpPosition);
		horizontalDragDown.setPosition(preferences.window.horizontalDragDownPosition);
	}
}

getPreferences.window();
sendPreferences.window();

let drags = [horizontalDragDown, horizontalDragUp, verticalDrag]
drags.forEach(element => {
	element.mouseDown = true;
});

content.onMouseMove({ movementX: 0, movementY: 0 });
drags.forEach(element => {
	element.mouseDown = false;
});

var urlButtons = {
	urlInputElement: document.getElementById("url-input"),
	add: {
		onClick: function() {
			urlList.addElement(urlButtons.urlInputElement.value, ipcRenderer.sendSync("url-button-add", urlButtons.urlInputElement.value));
			urlButtons.urlInputElement.value = "";
		}
	},
	remove: {
		onClick: function(id) {
			ipcRenderer.send("url-button-remove", urlList.selectedElement.id.substring(17));
			urlList.removeElement(urlList.selectedElement.id);
		}
	}
}

var urlListElement = {
	parentElement: document.getElementById("url-list-container"),
	onClick: function(id) {
		urlList.selectNewElement(id);
	}
}

function linkClicked(url) {
	ipcRenderer.send("open-url", url)
}

class checkbox {
	constructor(id) {
		this.id = id;
		this.checked = ipcRenderer.sendSync("get-setting", id);
		this.element = document.getElementById(id);
		this.clicked = function() {
			this.setStatus(!this.checked);
		}
		this.setStatus = function(status) {
			if (status) {
				this.element.classList.add("setting-checkbox-activated");
				this.checked = true;
			} else if (status == false) {
				this.element.classList.remove("setting-checkbox-activated");
				this.checked = false;
			}
			ipcRenderer.send("set-setting", {id: this.id, status: status});
		}
		this.setStatus(this.checked);
	}
}

class dropdown {
	constructor(id) {
		this.id = id;
		this.parent = id + "Dropdown";
		this.active = false;
		this.value = ipcRenderer.sendSync("get-setting", id);
		this.states = ipcRenderer.sendSync("get-states", id);
		this.element = document.getElementById(id);
		this.fieldClicked = function () {
			if (this.active == false) {
				this.element.appendChild(makeDropdownChildren(this.id, this.states, this.parent));
				this.active = true;
			} else if (this.active) {
				document.getElementById("setting-dropdown-menu-" + this.id).remove();
				this.active = false;
			}
		}
		this.valueClicked = function(value) {
			this.active = true;
			this.fieldClicked();
			this.setValue(value);
		}
		this.setValue = function (value) {
			ipcRenderer.send("set-setting", { id: this.id, status: value });
			document.getElementById("setting-dropdown-value-" + this.id).innerHTML = value;
		}
		this.setValue(this.value);
	}
}

function makeDropdownChildren(id, states, parent) {
	let newElement = document.createElement("div");
	newElement.id = ("setting-dropdown-menu-" + id);
	newElement.className = "setting-dropdown-menu";
	let newElementContent = "";
	states.forEach(function(element) {
		newElementContent = newElementContent.concat('<div class="setting-dropdown-menu-item" id="' + element + '" onclick="'+ parent +'.valueClicked(this.id)">' + element +'</div>');
	})
	
	newElement.innerHTML = newElementContent;
	return newElement;
}

var outputPathInput = {
	value: ipcRenderer.sendSync("get-setting", "outputPath"),
	element: document.getElementById("outputPath"),
	setValue: function (value) {
		ipcRenderer.send("set-setting", { id: "outputPath", status: value});
		this.element.value = value;
	},
	changed: function() {
		this.setValue(this.element.value);
	}
}

outputPathInput.setValue(outputPathInput.value);

var extractAudioCheckbox = new checkbox("extractAudio");
var embedSubsCheckbox = new checkbox("embedSubs");
var embedThumbnailCheckbox = new checkbox("embedThumbnail");
var addMetadataCheckbox = new checkbox("addMetadata");
var noPlaylistCheckbox = new checkbox("noPlaylist");
var includeAdsCheckbox = new checkbox("includeAds");
var retryForeverCheckbox = new checkbox("retryForever");
var restrictFilenamesCheckbox = new checkbox("restrictFilenames");

var audioFormatDropdown = new dropdown("audioFormat");
var audioQualityDropdown = new dropdown("audioQuality");
var videoFormatDropdown = new dropdown("videoFormat");
var downloadQualityDropdown = new dropdown("downloadQuality");
var limitRateDropdown = new dropdown("limitRate");

var donwloadButton = {
	clicked: function() {
		ipcRenderer.send("download-button", "plz");
	}
}

var logElement = document.getElementById("logs-input");

ipcRenderer.on("ytdl-logs", function (event, data) {
	let prevValue = logElement.value;
	let newValue = prevValue + data;
	logElement.value = newValue;
	logElement.scrollTop = logElement.scrollHeight;
})

var updateButton = {
	clicked: function() {
		ipcRenderer.send("update", "plz");
	}
}

function minimizePressed() {
	ipcRenderer.send("minimize", "plz");
	document.getElementById("window-minimize").hover = false;
}