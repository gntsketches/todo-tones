/**
 * @class Audio
 *
 * Manages the audio stuff.
 */

class AudioModule {
    constructor(model) {
        this.model = model
        this.activeTodo = null
        this.synth = new Tone.Synth().toMaster()
        console.log(this.synth.triggerAttackRelease)
        this.loop = new Tone.Loop(time => {
            //triggered every eighth note.
            console.log(time);
            // find the active todo and play those notes
            this.synth.triggerAttackRelease('C4', '8n')
        }, "8n").start(0)

    }

    setActiveTodo = () => {
        this.activeTodo = this.model.activeTodo
        console.log(this.activeTodo)
    }

    changeAudio = () => {  // changeAudioPlayStatus
        // if nowPlaying is false, stop
        console.log('nowPlaying', this.model.nowPlaying)
        if (this.model.nowPlaying === false) {
            this.stop()
        }
        else {
            this.setActiveTodo()
            this.start()
        }
        // now playing is a number,
        //  some setup may be required?
        //  start
    }

    start = () => {
        console.log('start')
        // this.loop.start()
        Tone.Transport.start();
    }

    stop = () => {
        console.log('stop')
        // this.loop.stop()
        Tone.Transport.stop();
    }
}
