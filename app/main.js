// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require('path')
const fs = require('fs');
const { url } = require('inspector');
const spawn = require('child_process').spawn;

let appData = (app.getPath("appData"));
let appDataApp = (appData + "\\Graphical Youtube-DL");
var ytdlPath = (appDataApp + "\\exe\\youtube-dl.exe");

var mainWindow;

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		backgroundColor: "#101010",
		icon: __dirname + '\\assets\\icon64.ico',
		width: 800,
		height: 600,
		frame: false,
		minWidth: 500,
		minHeight: 500,
		webPreferences: {
			nodeIntegration: false,
			preload: path.join(__dirname, 'preload.js')
		}
	});
	
	// and load the index.html of the app.
	mainWindow.loadFile(__dirname + '\\index.html')
	
	// Open the DevTools.
	//mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()
	
	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.












// simple object foreach
//src = https://gist.github.com/cferdinandi/42f985de9af4389e7ab3

/**
 * A simple forEach() implementation for Arrays, Objects and NodeLists
 * @private
 * @param {Array|Object|NodeList} collection Collection of items to iterate
 * @param {Function} callback Callback function for each iteration
 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
 */
var forEach = function (collection, callback, scope) {
	if (Object.prototype.toString.call(collection) === '[object Object]') {
		for (var prop in collection) {
			if (Object.prototype.hasOwnProperty.call(collection, prop)) {
				callback.call(scope, collection[prop], prop, collection);
			}
		}
	} else {
		for (var i = 0, len = collection.length; i < len; i++) {
			callback.call(scope, collection[i], i, collection);
		}
	}
};











// == mb stuff == //


if (fs.existsSync(appDataApp) === false) {
	fs.mkdirSync(appDataApp);
}

if (fs.existsSync(appDataApp + "\\exe") === false) {
	fs.mkdirSync(appDataApp + "\\exe");
}

if (fs.existsSync(appDataApp + "\\config.json") === false) {
  let rawDefaultConfig = fs.readFileSync(__dirname + "\\config.json");
  let defaultConfig = JSON.parse(rawDefaultConfig);
  defaultConfig.settings.downloading.outputPath.status = app.getPath("downloads");
  rawDefaultConfig = JSON.stringify(defaultConfig);
  fs.writeFileSync(appDataApp + "\\config.json", rawDefaultConfig);
}

if (fs.existsSync(appDataApp + "\\exe\\youtube-dl.exe") === false) {
	fs.copyFileSync(__dirname + "\\exe\\youtube-dl.exe", appDataApp + "\\exe\\youtube-dl.exe");
}

if (fs.existsSync(appDataApp + "\\exe\\ffmpeg.exe") === false) {
	fs.copyFileSync(__dirname + "\\exe\\ffmpeg.exe", appDataApp + "\\exe\\ffmpeg.exe");
}


// ====== preferences ====== //


  function readConfig() {
    let rawConfig = fs.readFileSync(appDataApp + "\\config.json");
    var config = JSON.parse(rawConfig);
    return config;
  }

function writeConfig() {
	let rawConfig = JSON.stringify(config, null, 2);
	fs.writeFileSync(appDataApp + "\\config.json", rawConfig);
}

var config = {
	preferences: null,
	readFile: function() {
		let rawConfig = fs.readFileSync(appDataApp + "\\config.json");
		config.preferences = JSON.parse(rawConfig);
	},
	writeFile: function () {
		let rawConfig = JSON.stringify(config.preferences, null, 2);
		fs.writeFileSync(appDataApp + "\\config.json", rawConfig);
	}
}

config.readFile();

ipcMain.on("set-preferences-window", function (event, arg) {
	config.preferences.window = arg;
	config.writeFile();
})

ipcMain.on('get-preferences', function (event, arg) {
	config.readFile();
	event.returnValue = config.preferences;
})

var urlList = {
	list: [],
	stringList: [],
	nextId: 0,
	add: function(url) {
		this.list.push({
			url: url,
			id: this.nextId
		});
		this.nextId++;
		return (this.list[this.list.length-1].id);
	},
	make: function () {
		forEach(this.list, function(element) {
			urlList.stringList.push(element.url);
		})
	}
}

ipcMain.on("url-button-add", function(event, arg) {
	event.returnValue = urlList.add(arg);
})

ipcMain.on("url-button-remove", function(event, arg) {
	for (let i = 0; i < urlList.list.length; i++) {
		if(urlList.list[i].id == arg) {
			urlList.list.splice(i, 1);
		}
	}
})

var settings = {
	videoFormat: {
		
	},
	downloading: {

	}
}

ipcMain.on("open-url", function (event, arg) {
	shell.openExternal(arg);
})

var parameterList = {
	list: [],
	make: function () {
		this.list = [];
		config.readFile();
		let rawSettings = Object.assign(config.preferences.settings.videoFormat, config.preferences.settings.downloading);
		rawSettings.outputPath.status = rawSettings.outputPath.status + "\\%(title)s.%(ext)s";
		forEach(rawSettings, function (element) {
			if (element.status == false) {
				// pass
			} else {
				parameterList.list.push(element.option);

				if (element.status != true) {
					parameterList.list.push(element.status);
				}
				if (element.option2) {
					parameterList.list.push(element.option2);
				}
			}
		});
	}
}

parameterList.make();

ipcMain.on("get-setting", function(event, args) {
	let setting;
	config.readFile();
	switch (args) {
		case "extractAudio":
			setting = config.preferences.settings.videoFormat.extractAudio.status;
			break;
		case "embedSubs":
			setting = config.preferences.settings.videoFormat.embedSubs.status;
			break;
		case "embedThumbnail":
			setting = config.preferences.settings.videoFormat.embedThumbnail.status;
			break;
		case "addMetadata":
			setting = config.preferences.settings.videoFormat.addMetadata.status;
			break;
		case "noPlaylist":
			setting = config.preferences.settings.downloading.noPlaylist.status;
			break;
		case "includeAds":
			setting = config.preferences.settings.downloading.includeAds.status;
			break;
		case "retryForever":
			setting = config.preferences.settings.downloading.retryForever.status;
			break;
		case "restrictFilenames":
			setting = config.preferences.settings.downloading.restrictFilenames.status;
			break;

		case "audioFormat":
			setting = config.preferences.settings.videoFormat.audioFormat.status;
			break;
		case "audioQuality":
			setting = config.preferences.settings.videoFormat.audioQuality.status;
			break;
		case "videoFormat":
			setting = config.preferences.settings.videoFormat.videoFormat.status;
			break;
		case "downloadQuality":
			setting = config.preferences.settings.videoFormat.downloadQuality.status;
			break;
		case "limitRate":
			setting = config.preferences.settings.downloading.limitRate.status;
			break;
		
		case "outputPath":
			setting = config.preferences.settings.downloading.outputPath.status;
			break;
	}
	event.returnValue = setting;
})

ipcMain.on("set-setting", function (event, args) {
	switch (args.id) {
		case "extractAudio":
			config.preferences.settings.videoFormat.extractAudio.status = args.status;
			break;
		case "embedSubs":
			config.preferences.settings.videoFormat.embedSubs.status = args.status;
			break;
		case "embedThumbnail":
			config.preferences.settings.videoFormat.embedThumbnail.status = args.status;
			break;
		case "addMetadata":
			config.preferences.settings.videoFormat.addMetadata.status = args.status;
			break;
		case "noPlaylist":
			config.preferences.settings.downloading.noPlaylist.status = args.status;
			break;
		case "includeAds":
			config.preferences.settings.downloading.includeAds.status = args.status;
			break;
		case "retryForever":
			config.preferences.settings.downloading.retryForever.status = args.status;
			break;
		case "restrictFilenames":
			config.preferences.settings.downloading.restrictFilenames.status = args.status;
			break;

		case "audioFormat":
			config.preferences.settings.videoFormat.audioFormat.status = args.status;
			break;
		case "audioQuality":
			config.preferences.settings.videoFormat.audioQuality.status = args.status;
			break;
		case "videoFormat":
			config.preferences.settings.videoFormat.videoFormat.status = args.status;
			break;
		case "downloadQuality":
			config.preferences.settings.videoFormat.downloadQuality.status = args.status;
			break;
		case "limitRate":
			config.preferences.settings.downloading.limitRate.status = args.status;
			break;
		
		case "outputPath":
			config.preferences.settings.downloading.outputPath.status = args.status;
			break;
	}
	config.writeFile();
});

ipcMain.on("get-states", function (event, args) {
	let states;
	switch (args) {
		case "audioFormat":
			states = config.preferences.settings.videoFormat.audioFormat.states;
			break;
		case "audioQuality":
			states = config.preferences.settings.videoFormat.audioQuality.states;
			break;
		case "videoFormat":
			states = config.preferences.settings.videoFormat.videoFormat.states;
			break;
		case "downloadQuality":
			states = config.preferences.settings.videoFormat.downloadQuality.states;
			break;
		case "limitRate":
			states = config.preferences.settings.downloading.limitRate.states;
			break;
	}
	event.returnValue = states;
})


ipcMain.on("download-button", function(event, args) {
	console.log("[MB]: YT REQUEST RECEIVED")
	config.readFile();
	parameterList.make();
	urlList.make();
	let parameters = parameterList.list.concat(urlList.stringList);
	

	mainWindow.webContents.send('ytdl-logs', parameters);
	console.log(parameters);
	
	var child = spawn(ytdlPath, parameters);
	
	child.stderr.setEncoding("utf-8");
	child.stderr.on("data", function (data) {
		mainWindow.webContents.send('ytdl-logs', data);
		console.log(data);
	});
	child.stdout.setEncoding("utf-8");
	child.stdout.on( "data", function (data) {
		mainWindow.webContents.send('ytdl-logs', data);
		console.log(data);
	});
	
});

ipcMain.on("update", function(event, args) {
	var childUpdate = spawn(ytdlPath, ["--update"]);

	childUpdate.stderr.setEncoding("utf-8");
	childUpdate.stderr.on("data", function (data) {
		mainWindow.webContents.send('ytdl-logs', data);
		console.log(data);
	});
	childUpdate.stdout.setEncoding("utf-8");
	childUpdate.stdout.on("data", function (data) {
		mainWindow.webContents.send('ytdl-logs', data);
		console.log(data);
	});

})

ipcMain.on("minimize", function(event, args) {
	mainWindow.minimize();
})