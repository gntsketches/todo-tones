/**
 * @class Audio
 *
 * Manages the audio stuff.
 */

class AudioModule {
    constructor(model) {
        this.model = model
        this.activeTodo = null
        this.synthOptions = {
            'sin' : new Tone.Synth().set({
                "oscillator" : { "type" : 'sine' },
                "envelope" : { "attack": 0.01, "decay": 0.01, "sustain": 0.75, "release": 3 },
                "volume" : 0
            }).toMaster(),
            'tri' : new Tone.Synth().set({
                "oscillator" : { "type" : 'triangle' },
                "envelope" : { "attack": 0.01, "decay": 0.01, "sustain": 0.75, "release": 3 },
                "volume" : -5
            }).toMaster(),
            'squ' : new Tone.Synth().set({
                "oscillator" : { "type" : 'square' },
                "envelope" : { "attack": 0.01, "decay": 0.01, "sustain": 0.75, "release": 3 },
                "volume" : -10
            }).toMaster(),
            'saw' : new Tone.Synth().set({
                "oscillator" : { "type" : 'sawtooth' },
                "envelope" : { "attack": 0.01, "decay": 0.01, "sustain": 0.75, "release": 3 },
                "volume" : -10
            }).toMaster()
        }


        this.loop = new Tone.Loop(time => {

            // const note = this.model.activeTodo.pitchSet[Math.floor(Math.random() * this.model.activeTodo.pitchSet.length)]
            const note = getRandomElement(this.model.activeTodo.pitchSet)
            if (Math.random()*100 < this.model.activeTodo.percent ) {
                const synth = getRandomElement(this.model.activeTodo.synthTypes)
                this.synthOptions[synth].triggerAttackRelease(note, this.model.activeTodo.duration)
            }

            //      plan for it to be able to test seconds or measures
            //  logic, etc.
            //  you'll need to bind a callback to
            // meta: this is part of the UI, but in this case, the user is "time"
            //  so "time" triggers the controller
            // console.log(this.model.nowPlaying)

            if (this.model.playMode === 'Once' ||
                this.model.playMode === 'Loop' ||
                this.model.playMode === 'Rand') {
                const timeCheck = this.timeTag + this.model.activeTodo.playTime
                // console.log('seconds', Tone.Transport.seconds)
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
            // set up envelope information for all synths
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
            if (this.model.activeTodo.tempo !== Tone.Transport.bpm.value) {
                Tone.Transport.bpm.value = this.model.activeTodo.tempo
            }
            // here set a tag-time for comparison in the loop to change todo depending on playMode
            this.timeTag = Tone.Transport.seconds
            // console.log('timeTag', this.timeTag)
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
