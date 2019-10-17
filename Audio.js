/**
 * @class Audio
 *
 * Manages the audio stuff.
 */

class AudioModule {
    constructor(model) {
        this.model = model
        this.activeTodo = null
        this.synth = new Tone.Synth().set({
            "oscillator" : { "type" : 'triangle' },
            "filter" : { "type" : "highpass" },
            "envelope" : {
                "attack": 0.01,
                "decay": 0.01,
                "sustain": 0.75,
                "release": 3
            }
        }).toMaster()

        this.loop = new Tone.Loop(time => {

            const note = this.model.activeTodo.pitchSet[Math.floor(Math.random() * this.model.activeTodo.pitchSet.length)]
            if (Math.random()*100 < this.model.activeTodo.percent ) {
                this.synth.triggerAttackRelease(note, this.model.activeTodo.duration)
            }

            //      plan for it to be able to test seconds or measures
            //  logic, etc.
            //  you'll need to bind a callback to
            // meta: this is part of the UI, but in this case, the user is "time"
            //  so "time" triggers the controller
            // console.log(this.model.nowPlaying)

            if (this.model.playMode === 'Once') {
                const timeCheck = this.timeTag + this.model.activeTodo.playLength
                console.log('seconds', Tone.Transport.seconds)
                if (Tone.Transport.seconds >= timeCheck) {
                    this.changeNowPlaying()
                    this.timeTag = Tone.Transport.seconds
                }
            }

        }, "8n").start(0)

        this.timeTag = null

    }

    bindChangeNowPlaying(handler) {
        this.changeNowPlaying = handler
    }

    changeAudio = () => {  // changeAudioPlayStatus
        // console.log('nowPlaying', this.model.nowPlaying)
        if (this.model.nowPlaying === false) {
            this.stop()
        } else {
            if (this.model.activeTodo.tempo !== Tone.Transport.bpm.value) {
                Tone.Transport.bpm.value = this.model.activeTodo.tempo
            }
            // here set a tag-time for comparison in the loop to change todo depending on playMode
            this.timeTag = Tone.Transport.seconds
            console.log('timeTag', this.timeTag)
            this.start() // can compare to Tone.Transport.state (started, stopped, paused)
        }

    }

    start = () => {
        // console.log('start')
        Tone.Transport.start();
    }

    stop = () => {
        // console.log('stop')
        Tone.Transport.stop();
        this.synth.triggerRelease()
    }
}
