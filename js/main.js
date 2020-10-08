import Recorder from './recorder.js';
import CreateUI from './ui.js'
import { model, run, toText } from './model.js'

const recorder = new Recorder()

let setState
const connect = (c) => { setState = c }
const start = () => {
    recorder.start();
    setState({
        mode: 'active',
        text: 'Recording audio'
    });
};

const printText = (t) => {
    setState({
        mode: 'enabled',
        text: t
    });
}

const stop = () => {
    setState({
        mode: 'waiting',
        text: 'Processing speech (first time can be very slow)'
    });
    recorder.stop();
    Promise.all([model, recorder.getData()]).then(([m, s]) => {
        run(m, s).then(e => toText(e.values().next().value).then(printText));
    })
};
const ui = CreateUI({ start: start, stop: stop, connect: connect })

const nomedia = () => {
    setState({
        mode: 'disabled',
        text: 'Microphone input disabled'
    })
}

const mediaOk = (s) => {
    recorder.init(s);
    setState({
        mode: 'enabled',
        text: 'Press button to start recording audio'
    });
}

const params = { audio: { channelCount: 1, sampleRate: 16000 }, video: false }

if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia(params).then(mediaOk, nomedia);
} else {
    nomedia()
}
