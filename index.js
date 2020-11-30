const { ipcRenderer } = require('electron');
const EventEmitter = require('events').EventEmitter;
const { start } = require('bindings')('addon');

const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext("2d");

let windowPos = [];

ipcRenderer.on('window-position', (e, p) => {
	windowPos = p;
});

const emitter = new EventEmitter();

emitter.on('data', (point) => {
	if(windowPos.length == 0) return;

	const relativeCursorPos = [point[0] - windowPos[0], point[1] - windowPos[1]]

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#ffffff';
	ctx.strokeStyle = '#000000';
	ctx.beginPath();
	ctx.arc(relativeCursorPos[0], relativeCursorPos[1], 3, 0, 2 * Math.PI);
	ctx.stroke();
})

function resize() {
	const displayWidth  = canvas.clientWidth;
	const displayHeight = canvas.clientHeight;
	 
	if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;
	}
}

window.addEventListener('resize', resize);

resize();

start((p) => {
  emitter.emit('data', p);
});

window.addEventListener('mousemove', (e) => {
	const relativeCursorPos = [e.clientX, e.clientY]

	ctx.fillStyle = '#ffffff';
	ctx.strokeStyle = '#ea5b54';
	ctx.beginPath();
	ctx.arc(relativeCursorPos[0], relativeCursorPos[1], 1, 0, 2 * Math.PI);
	ctx.stroke();
})