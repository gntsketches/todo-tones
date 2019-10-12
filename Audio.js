/**
 * @class Audio
 *
 * Manages the audio stuff.
 */

class Audio {
    constructor(model) {
        this.model = model

        this.loop = new Tone.Loop(function(time){
            //triggered every eighth note.
            console.log(time);
        }, "8n").start(0);
    }

    start = () => {
        Tone.Transport.start();
    }

    stop = () => {
        Tone.Transport.stop()
    }
}
