const AudioContext = window.AudioContext || window.webkitAudioContext;

class Recorder {
    constructor() {
        this.stream = null;
        this.source = null;
        this.processor = null;
        this.data = [];
        this.state = 'stopped';
        this.audioContext = new AudioContext();
        this.onAudioProcess = this.onAudioProcess.bind(this);
        this.inputSampleRate = 0
    }

    init(stream) {
        this.stream = stream;
        console.log(stream);
        console.log(stream.getAudioTracks());
        console.log(stream.getAudioTracks()[0].getSettings());
    }

    start() {
        this.data = [];
        this.audioContext.resume()
        this.state = 'recording';
        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.processor = this.audioContext.createScriptProcessor(1024, 1, 1);
        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
        this.processor.onaudioprocess = this.onAudioProcess;
    }

    stop() {
        if (!this.processor) return;
        this.state = 'stopped';
        this.source.disconnect();
        this.processor.disconnect();
        this.processor.onaudioprocess = null;
        this.processor = null;
        this.audioContext.suspend()
    }

    onAudioProcess({ inputBuffer }) {
        if (this.inputSampleRate != inputBuffer.sampleRate) this.inputSampleRate = inputBuffer.sampleRate;
        this.data.push(inputBuffer.getChannelData(0));
    }
    
    _normalize(a) {
        const norm = a.length / a.reduce((p,c,k) => (Math.abs(c) > Math.abs(a[p]) ? k : p), 0) ;
        console.log('norm', norm)
        for(let i = 0; i < a.length; i++){
            a[i] = a[i] * norm
        }
        return a;
    }

    _getResample16k() {
        const resampCtx = new OfflineAudioContext(1, this.data.length * 1024 / this.inputSampleRate * 16000, 16000);
        const buffer = resampCtx.createBuffer(1, this.data.length * 1024, this.inputSampleRate);
        for (let i = 0; i < this.data.length; i++) {
            buffer.copyToChannel(this.data[i], 0, i * 1024);
        }
        const source = resampCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(resampCtx.destination);
        source.start(0);
        return resampCtx.startRendering().then(e => e.getChannelData(0)).then(this._normalize);
    }

    getData() {
        if (this.inputSampleRate == 16000) {
            const arr = new Float32Array(this.data.length * 1024)
            for (let i = 0; i < this.data.length; i++) {
                arr.set(this.data[i], i * 1024);
            }
            return arr
        }
        return this._getResample16k()
    }
}

export default Recorder
