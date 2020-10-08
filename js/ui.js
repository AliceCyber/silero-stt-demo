import { h, Component, render } from './preact.module.min.js';

const RecordButton = ({ mode, hooks }) => {
    switch (mode) {
        default: return h('div', { class: 'record waiting' }, h('i', {class:"fas fa-spinner"}));
        case 'enabled':
                return h('div', { class: 'record', onmousedown: hooks.start }, h('i', {class:"fas fa-microphone-alt"}));
        case 'disabled':
                return h('div', { class: 'record disabled' },  h('i', {class:"fas fa-microphone-alt-slash"}));
        case 'active':
                return h('div', { class: 'record active', onmouseup: hooks.stop },  h('i', {class:"fas fa-microphone-alt"}));
    }
}

class UI extends Component {

    constructor(props) {
        super();
        this.state = { mode: 'waiting', text: 'Awaiting microphone' };
        props.hooks.connect(e => this.setState(e))
    }

    render({ hooks }, { mode, text }) {
        return h('div', { class: 'app' },
            h(RecordButton, { mode: mode, hooks: hooks }),
            h('p', { class: 'transcribed' }, text)
        )
    }
}

const CreateUI = (hooks) => {
    let u = h(UI, { hooks: hooks });
    render(u, document.body);
    return u;
}

export default CreateUI
