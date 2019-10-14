// so maybe this would be a way to do things...

class Todo {
    constructor(todoText, id) {
        // this should be in a constants file
        this.fullRange = ["C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2","C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6","C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7","A7","A#7","B7","C8", "C#8","D8","D#8","E8","F8","F#8","G8","G#8","A8","A#8","B8"]

        this.id = id
        this.text = ''
        this.pitchSet = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4']
        this.lo = 'C3'
        this.hi = 'B3'
        this.tempo = 120
        this.percent = 50

        this.updateTodo(todoText)
    }

    // addTodo(todoText) { // check each regex item, and if not found, leave default
    // editTodo(todoText) { //  check each regex item, and if not found, leave the way it was...
        //      which is the same as saying, leave deafult... //      hmm...
        //      let's call it updateTodo
    updateTodo(todoText) {
        this.text = todoText // for now

        // I think you can do:
        //  this.lo = this.parseLowRange(todoText) || this.lo

        // const lo = this.parseLowRange(todoText)
        //     console.log('lo', lo)
        //     if (lo) { this.lo = lo }

        this.lo = this.parseLowRange(todoText) || this.lo
        console.log('lo', this.lo)
        const hi = this.parseHighRange(todoText)
            if (hi) { this.hi = hi }
            console.log('hi', hi)

        const pitchSet = this.buildPitchSet(todoText)
            console.log('pitchSet', pitchSet)
            if (pitchSet) { this.pitchSet = pitchSet }

        const tempo = this.parseTempo(todoText)
            console.log('tempo', tempo)
            if (tempo) { this.tempo = tempo }

        const percent = this.parsePercent(todoText)
            console.log('percent', percent)
            if (percent) { this.percent = percent }

        this.buildTodoText() // which does nothing at the moment

        console.log('todo:', this)
    }

    parseLowRange(todoText) {
        const loMatch = todoText.match(/lo([a-g])([b#])?[1-8]/gi)
        console.log('loMatch', loMatch)
        if (loMatch === null) { return false }
        let loPitch = loMatch[0].slice(2)
        loPitch = loPitch.charAt(0).toUpperCase() + loPitch.slice(1)
        loPitch = this.convertFlatToSharp(loPitch.slice(0,-1)) + loPitch.slice(-1)
        return loPitch
    }

    parseHighRange(todoText) {
        const lo = this.lo
        const hiMatch = todoText.match(/hi([a-g])([b#])?[1-8]/gi)
        console.log('hiMatch', hiMatch)
        if (hiMatch === null) { return false }
        let hiPitch = hiMatch[0].slice(2)
        hiPitch = hiPitch.charAt(0).toUpperCase() + hiPitch.slice(1)
        hiPitch = this.convertFlatToSharp(hiPitch.slice(0,-1)) + hiPitch.slice(-1)
        if (this.fullRange.indexOf(hiPitch) <= this.fullRange.indexOf(lo)) {
            hiPitch = lo
        }
        return hiPitch
    }

    parseTempo(todoText) {
        let tempo = todoText.match(/t[\d]{2,3}/gi)
        console.log('tempo match', tempo)
        if (tempo === null) { return false }
        return parseInt(tempo[0].slice(1), 10)
        // can you just say return tempo[0] || null?
        // or: tempo = todoText.match(/t[\d]{2,3}/gi
        //  tempo === null ? null : tempo[0]
    }

    parsePercent(todoText) {
        let percent = todoText.match(/%\d\d/gi)
        if (percent === null) { return false }
        percent = parseInt(percent[0].slice(1), 10)
        if (percent === 0) { percent = 100}
        return percent
    }

    buildPitchSet(todoText) {
        const lo = this.lo
        const hi = this.hi
        // needs to function on add or edit
        //      read Lo and Hi from add to do, or from state?
        let noteNameArray = todoText.match(/([a-g])([b#])?/gi)
        console.log('noteNameArray', noteNameArray)
        if (noteNameArray === null) { return false }
        noteNameArray = noteNameArray.map(name => name.charAt(0).toUpperCase() + name.slice(1))
        console.log('noteNameArray', noteNameArray)
        const noteNameArraySharped = noteNameArray.map(noteName => this.convertFlatToSharp(noteName))

        let pitchSet = []
        let adjustedRangeLow = this.fullRange.slice(this.fullRange.indexOf(lo))
        let adjustedRange = adjustedRangeLow.slice(0, adjustedRangeLow.indexOf(hi)+1)
        for (let k=0; k < adjustedRange.length; k++){
            if (noteNameArraySharped.indexOf(adjustedRange[k].slice(0,-1)) >-1 ) {
                pitchSet.push(adjustedRange[k])
            }
        }
        return pitchSet
    }

    buildTodoText() {
        // this will just use 'constructor' values
        // note how parseHiRange and buildTodoText both accept params that they could also get from constructor
        //  ...what's it called when you have to decide about that?
    }

    // *** Sort of helper-ey *******************************************************************

    convertFlatToSharp = (noteName) => {
        const conversion = {'Cb':'B', 'Db':'C#', 'Eb':'D#', 'Fb':'E', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#'}
        if (Object.keys(conversion).includes(noteName)) {
            return conversion[noteName]
        }
        else { return noteName }
    }
}
