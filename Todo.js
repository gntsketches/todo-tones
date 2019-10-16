
class Todo {
    constructor(todoText, id) {
        // this should be in a constants file
        this.fullRange = ["C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2","C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6","C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7","A7","A#7","B7","C8", "C#8","D8","D#8","E8","F8","F#8","G8","G#8","A8","A#8","B8"]

        this.id = id || null
        this.text = ''
        this.pitchClasses = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        this.pitchSet = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3']
        this.lo = 'C3'
        this.hi = 'B3'
        this.tempo = 120
        this.percent = 50
        this.duration = 0.25 //16n

        if (todoText) {
            this.updateTodo(todoText)
        }
    }

    updateTodo(todoText) {

        this.lo = this.parseRange(todoText, 'lowRange') || this.lo
        this.hi = this.parseRange(todoText, 'highRange') || this.hi
        this.pitchClasses = this.parsePitchClasses(todoText) || this.pitchClasses
        this.pitchSet = this.buildPitchSet() || this.pitchSet
        this.tempo = this.parseTempo(todoText) || this.tempo
        this.percent = this.parsePercent(todoText) || this.percent
        this.duration = this.parseDuration(todoText) || this.duration
        console.log('duration received', this.duration)
        this.text = this.buildTodoText()

        console.log('todo updated:', this)
    }

    parseRange(todoText, loOrHi) {
        // match l or lo, h or hi
        let match = null
        if (loOrHi === 'lowRange') { match = todoText.match(/lo([a-g])([b#])?[1-8]/gi) }
        else if (loOrHi === 'highRange') { match = todoText.match(/hi([a-g])([b#])?[1-8]/gi) }
        // console.log('match', match)
        if (match === null) { return false }
        let pitch = match[0].slice(2)
        pitch = pitch.charAt(0).toUpperCase() + pitch.slice(1)
        pitch = this.convertFlatToSharp(pitch.slice(0,-1)) + pitch.slice(-1)
        if (loOrHi === 'highRange') {
            if (this.fullRange.indexOf(pitch) <= this.fullRange.indexOf(this.lo)) {
                pitch = this.lo
            }
            // console.log('high', pitch)
        }
        return pitch
    }


    parseTempo(todoText) {
        let tempo = todoText.match(/t[\d]{2,3}/gi)
        if (tempo === null) { return false }
        return parseInt(tempo[0].slice(1), 10)
    }

    parsePercent(todoText) {
        let percent = todoText.match(/%\d\d/gi)
        if (percent === null) { return false }
        percent = parseInt(percent[0].slice(1), 10)
        if (percent === 0) { percent = 100}
        return percent
    }

    parseDuration(todoText) {
        // add various note val matches
        let duration = todoText.match(/d\d{1,2}(\.\d{1,2})?/gi)
        if (duration === null) { return false }
        console.log(duration[0].slice(1))
        duration = parseFloat(duration[0].slice(1))
        console.log(duration)
        return duration
    }

    parsePitchClasses(todoText) {
        const pitchClassMatches = todoText.match(/(?<![dhl])([a-g])([b#])?(?!\d)/gi) // https://www.regular-expressions.info/lookaround.html
            // use more generic/comprehensive lookarounds? with this you may have to update for every new feature
        // console.log('pitchClasses', pitchClasses)
        if (pitchClassMatches === null) { return false }
        const pitchClasses = pitchClassMatches.map(name => {
            return name.charAt(0).toUpperCase() + name.slice(1)
        })
        // console.log('pitchClasses', pitchClasses)
        // console.log('pC pre', pitchClasses)
        const unique = pitchClasses.filter((item, i) => pitchClasses.indexOf(item) === i)
        // console.log('pc post', unique)
        //  convert redundant flats to sharps!
        return this.filterEnharmonics(unique)
    }

    buildPitchSet() {
        const pitchClasses = this.pitchClasses
        const pitchClassesSharped = pitchClasses.map(noteName => this.convertFlatToSharp(noteName))
        // console.log('noteNameArraySharped', noteNameArraySharped)
        let adjustedRangeLow = this.fullRange.slice(this.fullRange.indexOf(this.lo))
        // console.log('adjustedRangeLo', adjustedRangeLow)
        let adjustedRange = adjustedRangeLow.slice(0, adjustedRangeLow.indexOf(this.hi)+1)
        // console.log('adjustedRange', adjustedRange)
        let pitchSet = []
        for (let k=0; k < adjustedRange.length; k++){
            if (pitchClassesSharped.indexOf(adjustedRange[k].slice(0,-1)) >-1 ) {
                pitchSet.push(adjustedRange[k])
            }
        }
        return pitchSet
    }

    buildTodoText() {
        const pitchClasses = `< ${this.pitchClasses.join(' ')} >`
        const lo = `lo${this.lo}`
        const hi = `hi${this.hi}`
        const percent = `%${this.percent}`
        const tempo = `t${this.tempo}`
        const duration = `d${this.duration}`
        return `${lo} ${pitchClasses} ${hi}\n${percent} ${tempo} ${duration}`
    }


    // *** Sort of helper-ey *******************************************************************

    convertFlatToSharp(noteName) {
        const conversion = {'Cb':'B', 'Db':'C#', 'Eb':'D#', 'Fb':'E', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#'}
        if (Object.keys(conversion).includes(noteName)) {
            return conversion[noteName]
        }
        else { return noteName }
    }

    filterEnharmonics(pitchClasses) {
        // console.log('filterEnharmonics pre', pitchClasses)
        let arr = [...pitchClasses]
        arr.forEach((p, i) => {
            if (p==='C') arr = arr.filter(e=>e!=='B#')
            if (p==='C#') arr = arr.filter(e=>e!=='Db')
            if (p==='D#') arr = arr.filter(e=>e!=='Eb')
            if (p==='E') arr = arr.filter(e=>e!=='Fb')
            if (p==='F') arr = arr.filter(e=>e!=='E#')
            if (p==='F#') arr = arr.filter(e=>e!=='Gb')
            if (p==='G#') arr = arr.filter(e=>e!=='Ab')
            if (p==='A#') arr = arr.filter(e=>e!=='Bb')
            if (p==='B') arr = arr.filter(e=>e!=='Cb')
        })
        // console.log('filterEnharmonics post', arr)
        return arr
    }

}
