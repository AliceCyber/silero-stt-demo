/*tf.enableDebugMode();
tf.setBackend('cpu');
const model = tf.loadGraphModel('/model/model.json');

const run = (m, s) => (
    m.executeAsync(tf.tensor(s))
)
*/
const labels = fetch('model/labels.json').then(e => e.json())
const model = fetch("https://silero-models.ams3.digitaloceanspaces.com/models/en/en_v1_test_no_fold.onnx").then(e => e.arrayBuffer())
onnx.ENV.debug = true

const run = (m, s) => {
    const session = new onnx.InferenceSession({ backendHint: "cpu" });
    const tensor = new onnx.Tensor(s, 'float32', [1, s.length]);
    return session.loadModel(m).then(e => session.run([tensor]))
}

const toText = (t) => (
    labels.then(l => {
    console.log('totext', t.data.length)
        let s = ''
        for(let i = 0; i < t.data.length; i += 999){
            const a = t.data.slice(i, i+999)
            const j = a.reduce((p,c,k) => (c > a[p] ? k : p), 0)
            console.log(j)
            if( j == 997 ){
                 if(s.length > 0){
                     s = s+s[s.length-1]
                } 
            } else if( j != 0 ){
                s = s+l[j]
            }
        }
        return s
    }))

export { model, run, toText }
