/**
 * @class Audio
 *
 * Manages the audio stuff.
 */

class AudioModule {
    constructor(model) {
        this.model = model
        this.activeTodo = null
        this.monoSynths = {
            'sin' : new Tone.Synth().set({
                "oscillator" : { "type" : 'sine' },
                "volume" : 0
            }).toMaster(),
            'tri' : new Tone.Synth().set({
                "oscillator" : { "type" : 'triangle' },
                "volume" : -5
            }).toMaster(),
            'squ' : new Tone.Synth().set({
                "oscillator" : { "type" : 'square' },
                "volume" : -15
            }).toMaster(),
            'saw' : new Tone.Synth().set({
                "oscillator" : { "type" : 'sawtooth' },
                "volume" : -14
            }).toMaster()
        }
        this.polySynths = {
            'sin' : new Tone.PolySynth().set({
                "oscillator" : { "type" : 'sine' },
                "volume" : 0
            }).toMaster(),
            'tri' : new Tone.PolySynth().set({
                "oscillator" : { "type" : 'triangle' },
                "volume" : -5
            }).toMaster(),
            'squ' : new Tone.PolySynth().set({
                "oscillator" : { "type" : 'square' },
                "volume" : -15
            }).toMaster(),
            'saw' : new Tone.PolySynth().set({
                "oscillator" : { "type" : 'sawtooth' },
                "volume" : -14
            }).toMaster()
        }

        this.loop = new Tone.Loop(time => {

            const note = getRandomElement(this.model.activeTodo.pitchSet)
            if (!this.model.activeTodo.waiting && Math.random()*100 < this.model.activeTodo.percent ) {
                const synthWave = getRandomElement(this.model.activeTodo.synthWaves)
                // console.log(this.model.activeTodo)
                if (this.model.activeTodo.synthType === 'poly') {
                    this.polySynths[synthWave].triggerAttackRelease(note, this.model.activeTodo.duration)
                } else {
                    this.monoSynths[synthWave].triggerAttackRelease(note, this.model.activeTodo.duration)
                }
            }

            const waitOrPlay = this.model.activeTodo.waiting ? this.model.activeTodo.waitTime : this.model.activeTodo.playTime
            const timeCheck = this.timeTag + waitOrPlay
            // console.log('seconds', Tone.Transport.seconds)
            if (Tone.Transport.seconds >= timeCheck) {
                this.changeNowPlaying()
                this.timeTag = Tone.Transport.seconds
            }


        }, "8n").start(0)

        this.timeTag = null

    }

    bindChangeNowPlaying(handler) {
        this.changeNowPlaying = handler
    }

    changeAudio = () => {  // changeAudioPlayStatus
        if (this.model.nowPlaying === false) {
            this.stop()
        } else {
            const envelope = {
                attack: this.model.activeTodo.envelope.attack,
                decay: this.model.activeTodo.envelope.decay,
                sustain: this.model.activeTodo.envelope.sustain,
                release: this.model.activeTodo.envelope.release
            }
            for (const type in this.polySynths) {
                this.polySynths[type].set({envelope: envelope})
                // console.log('env', this.polySynths[type])
            }
            for (const type in this.monoSynths) {
                this.monoSynths[type].set( { envelope: envelope } )
                // console.log('env', this.monoSynths[type])
                this.monoSynths[type].portamento = this.model.activeTodo.portamento
            }
                // this.monoSynths[type].envelope.attack = this.model.activeTodo.envelope.attack
                // this.monoSynths[type].envelope.decay = this.model.activeTodo.envelope.decay
                // this.monoSynths[type].envelope.sustain = this.model.activeTodo.envelope.sustain
                // this.monoSynths[type].envelope.release = this.model.activeTodo.envelope.release

            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
            if (this.model.activeTodo.tempo !== Tone.Transport.bpm.value) {
                Tone.Transport.bpm.value = this.model.activeTodo.tempo
            }
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
        console.log('stopped')
        Tone.Transport.stop();
        for (const type in this.polySynths) {
            this.polySynths[type].triggerRelease()
        }
        for (const type in this.monoSynths) {
            this.monoSynths[type].triggerRelease()
        }
    }
}
