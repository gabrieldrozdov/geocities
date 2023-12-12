// Fetch JSON and build index for intro background
let randomLinks;
fetch('assets/data/random-links.json')
	.then((response) => response.json())
	.then((json) => {
		randomLinks = json;
		createRandomLinks();
	})

// I'm so sorry for including these words but I'd rather they be here than on the live website!
let filteredWords = ['sex', 'porn', 'nude', 'naked', 'babe', 'girl', 'virgin', 'gay', 'penis', 'vagina', 'dick', 'cock', 'pussy', 'fuck', 'shit', 'baby', 'anal', 'model', 'woman', 'women', 'cum', 'bondage', 'blowjob'];
function createRandomLinks() {
	let keys = Object.keys(randomLinks);
	let temp = '';
	for (let i=0; i<500; i++) {
		let randomKey = keys[Math.floor(Math.random()*keys.length)];
		let anchorText = String(randomLinks[randomKey]['anchor_text']);
		let skip = false;
		for (let filteredWord of filteredWords) {
			if (anchorText.toLowerCase().includes(filteredWord)) {
				skip = true;
			}
		}
		if (skip == true) {
			continue
		}
		temp += `
			<a href="https://web.archive.org/web/${randomLinks[randomKey]['target']}" target="_blank" style="animation-duration: ${Math.floor(Math.random()*5000+500)}ms">
				${anchorText}
			</a>
		`
	}
	const introBackground = document.querySelector('.intro-background');
	introBackground.innerHTML = temp;
}

// Scroll event
let percentScrolled = 0;
window.addEventListener('wheel', (e) => {
	const intro = document.querySelector('.intro');
	percentScrolled = e.pageY / intro.offsetHeight;
	requestAnimationFrame(introAnimate);
})
function introAnimate() {
	const introBackgroundOverlay = document.querySelector('.intro-background-overlay');
	if (parseInt(percentScrolled) == 1 && parseInt(introBackgroundOverlay.style.opacity) == 1) {
		return
	}
	introBackgroundOverlay.style.opacity = 1-percentScrolled;
}

// Flying GIFs
let targetX, targetY, rotate;
function animateGif() {
	const gif = document.querySelector('.gif');
	gif.style.transition = '0s';
	gif.src = `assets/gifs/gif${Math.floor(Math.random()*30)}.gif`;
	if (Math.random() < .5) {
		gif.style.top = -25-Math.random()*25 + "vh";
		targetY = 125+Math.random()*25 + "vh";
	} else {
		gif.style.top = 125+Math.random()*25 + "vh";
		targetY = -50 + "vh";
	}
	if (Math.random() < .5) {
		gif.style.left = -25-Math.random()*25 + "vw";
		targetX = 125+Math.random()*25 + "vw";
	} else {
		gif.style.left = 125+Math.random()*25 + "vw";
		targetX = -25-Math.random()*25 + "vw";
	}
	let rotate = Math.floor(Math.random()*720-360);
	gif.style.transform = `rotate(${rotate}deg)`;
	setTimeout(() => {
		gif.style.transition = (Math.random()*4+4).toFixed(2)+"s linear";
		gif.style.top = targetY;
		gif.style.left = targetX;
		if (Math.random() < .5) {
			rotate -= Math.floor(Math.random()*360+180);
		} else {
			rotate += Math.floor(Math.random()*360+180);
		}
		gif.style.transform = `rotate(${rotate}deg)`;
	}, 100)
	setTimeout(animateGif, Math.floor(Math.random()*5000+10000))
}
animateGif();

// Play audio files
let audio = new Audio();
const synths = [];
async function playMIDI(file) {
	// Stop any audio
	while (synths.length) {
		const synth = synths.shift();
		synth.disconnect();
	}
	audio.pause();

	const midi = await Midi.fromUrl("assets/audio/"+file);
	const now = Tone.now() + 0.5;
	//the file name decoded from the first track
	const name = midi.name
	//get the tracks
	midi.tracks.forEach(track => {

		//create a synth for each track
		const synth = new Tone.PolySynth(Tone.Synth, {
			envelope: {
				attack: 0.02,
				decay: 0.1,
				sustain: 0.3,
				release: 1,
			},
			volume: -10
		}).toDestination();
		synths.push(synth);
		//schedule all of the events
		track.notes.forEach((note) => {
			synth.triggerAttackRelease(
				note.name,
				note.duration,
				note.time + now,
				note.velocity
			);
		});
	})
}
function playAudio(file) {
	// Stop any audio
	while (synths.length) {
		const synth = synths.shift();
		synth.disconnect();
	}
	audio.pause();
	audio = new Audio('assets/audio/'+file);
	audio.play();
}

// Generate audio viz
let audioFiles;
fetch('assets/data/audio-files.json')
	.then((response) => response.json())
	.then((json) => {
		audioFiles = json;
		createAudioViz();
	})

function createAudioViz() {
	let temp = '';
	let creditsTemp = '';
	for (let key of Object.keys(audioFiles)) {
		let fileName = audioFiles[key]['filename'];
		let generic = "";
		if (audioFiles[key]['generic']) {
			generic = "*";
		}
		let rank = (audioFiles[key]['total']/2000)*100;
		if (fileName.split('.')[1] == 'mid') {
			temp += `
				<div class="audio-chart-row" onclick="playMIDI('${fileName}')">
					<div class="audio-chart-label">${fileName+generic} <span>[${audioFiles[key]['total']} total occurrences]</span></div>
					<div class="audio-chart-bar" style="width:${rank}%"></div>
				</div>
			`
		} else {
			temp += `
				<div class="audio-chart-row" onclick="playAudio('${fileName}')">
					<div class="audio-chart-label">${fileName} <span>[${audioFiles[key]['total']} total occurrences]</span></div>
					<div class="audio-chart-bar" style="width:${rank}%"></div>
				</div>
			`
		}
		creditsTemp += `
			<a href="${audioFiles[key]['src']}" target="_blank">
			${audioFiles[key]['filename']}
			</a>
		`
	}
	const audioChart = document.querySelector('.audio-chart');
	audioChart.innerHTML += temp;
	const audioChartCredits = document.querySelector('.audio-chart-credits');
	audioChartCredits.innerHTML += creditsTemp;
} 