
class Todo {
    constructor(todoText, id) {
        // this should be in a constants file
        this.fullRange = ["C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2","C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6","C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7","A7","A#7","B7","C8", "C#8","D8","D#8","E8","F8","F#8","G8","G#8","A8","A#8","B8"]

        this.id = id || null
        this.text = ''
        // this.pitchClasses = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        // this.pitchSet = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3']
        // this.lo = 'C3'
        // this.hi = 'B3'

        this.basePitch = 440 // used for edo/cents
        this.detune = 0 // (used for Western)
        // this.pitchClasses = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
        this.pitchClasses = [0, 200, 400, 500, 700, 900, 1100]
        // this.pitchClasses = [0, 200, 400]
        this.pitchSet = [261.63]
        this.lo = 261.63
        this.loDisplay = 'C4'
        this.hi = 493.88
        this.hiDisplay = 'B4'


        this.tempo = 120
        this.percent = 85
        this.duration = 0.01 //16n
        this.synthWaves = ['tri']
        this.synthType = 'mono'
        this.portamento = 0 // "glide"
        this.envelope = { "attack": 0.02, "decay": 0.01, "sustain": 0.75, "release": 3 }
        this.playTime = 10
        // this.playTimeRange = 30
        this.waitTime = 5
        this.waiting = false

        if (todoText) {
            this.updateTodo(todoText)
        }
    }

    updateTodo(todoText) {
      // console.log('updateTodo');

        // parseRange (accepts Western or Hz, displays in Western if Western)
          // seems like you can have range in hz and pitchDisplay in Western or vice-versa
        // parsePitchDisplay (checks for edo, cents, hz, or Western if unspecified) ("Western" includes +/- cents)
          // converts whatever it is to Hz for (unparsed) variable (pitchClasses)
          // this seems to break the form a bit because it assigns a variable in addition to returning something
          // whereas the parsing methods so far are (essentially) static
        // anyway it assigns the 'type' to do:
          // parseBasePitch (if edo or cents
          // or parseDetune (if Western pitchSet)
          // or neither if HZ
          // actually it can do search for both of those at any time... it just only makes use of what is relevant
        // buildPitchSet


        this.lo = this.parseLoRange(todoText) || this.lo // side effect: set loDisplay
        this.hi = this.parseHiRange(todoText) || this.lo // side effect: set hiDisplay
        this.basePitch = this.parseBasePitch(todoText) || this.basePitch
        this.detune = this.parseDetune(todoText) || this.detune
        console.log('this.detune', this.detune);
        this.pitchClasses = this.parseEDOPitchClasses(todoText) || this.pitchClasses
        this.pitchSet = this.buildMicrotonePitchSet() || this.pitchSet
        this.tempo = this.parseTempo(todoText) || this.tempo
        const percent = this.parsePercent(todoText)
            this.percent = percent === false ? this.percent : percent
        this.duration = this.parseDuration(todoText) || this.duration
        this.playTime = this.parsePlaytime(todoText) || this.playTime
        const wait = this.parseWaitTime(todoText)
            this.waitTime = wait === false ? this.waitTime : wait
        this.synthWaves = this.parseSynthWave(todoText) || this.synthWaves
        this.synthType = this.parseSynthType(todoText) || this.synthType
        const port = this.parsePortamento(todoText)
            this.portamento = port === false || isNaN(port) ? this.portamento : port
        this.envelope = this.parseEnvelope(todoText) || this.envelope
        this.text = this.buildDisplayText()

        // console.log('todo updated:', this)
    }



    parseTempo(todoText) {
        let tempo = todoText.match(/(?<![p])t[\d]{2,3}/i)
        if (tempo === null) { return false }
        return parseInt(tempo[0].slice(1), 10)
    }

    parsePercent(todoText) {
        let percent = todoText.match(/%\d{1,3}/i)
        if (percent === null) { return false }
        percent = parseInt(percent[0].slice(1), 10)
        if (percent > 100) { percent = 100}
        return percent
    }

    parseDuration(todoText) {
        // add various note val matches
        let duration = todoText.match(/n(\d{1,2})?(\.\d{1,2})?/i)
        if (duration === null) { return false }
        duration = parseFloat(duration[0].slice(1))
        return duration

    }

    parsePlaytime(todoText) {
        let playTime = todoText.match(/pt\d{1,3}/i)
        if (playTime === null) { return false }
        playTime = parseInt(playTime[0].slice(2))
        // console.log(playTime)
        return playTime
    }

    parseWaitTime(todoText) {
        let waitTime = todoText.match(/wt\d{1,3}/i)
        if (waitTime === null) { return false }
        waitTime = parseInt(waitTime[0].slice(2))
        // console.log(waitTime)
        return waitTime
    }

    parseSynthWave(todoText) {
        const synthWaves = todoText.match(/(sin|tri|squ|saw)/gi)
        // console.log('synthWaves', synthWaves)
        if (synthWaves === null) { return false }
        return synthWaves
    }

    parseSynthType(todoText) {
        const synthVoice = todoText.match(/(mono|poly)/i)
        // console.log('synthVoice', synthVoice)
        if (synthVoice === null) { return false }
        return synthVoice[0]
    }

    parsePortamento(todoText) { // "glide"
        // const portamento = todoText.match(/p(\d{1,2})?(\.\d{1,2})?/i)
        //  doesn't match anything but 'p'!
        const portamento = todoText.match(/p\d{1,2}(\.\d{1,2})?/i)
        // console.log('portamento', portamento)
        if (portamento === null) { return false }
        const port = parseFloat(portamento[0].slice(1))
        // console.log('port', port)
        return port
    }

    parseEnvelope(todoText) {
        const envelopeMatch = todoText.match(/[adsr](\d{1,3})?(\.\d{1,3})?/gi)
        if (envelopeMatch === null) { return false }
        // console.log('envelopeMatch', envelopeMatch)
        const envelope = {...this.envelope}
        // console.log('envelope', envelope)
        const attack = envelopeMatch.find(e => e.slice(0,1) === 'a')
        if (attack && attack.length>1) { envelope.attack = parseFloat(attack.slice(1)) }
        const decay = envelopeMatch.find(e => e.slice(0,1) === 'd')
        if (decay && decay.length>1) { envelope.decay = parseFloat(decay.slice(1)) }
        let sustain = envelopeMatch.find(e => e.slice(0,1) === 's')
        if (sustain && sustain.length>1) {
            sustain = parseFloat(sustain.slice(1))
            if (sustain > 1) { sustain = 1 }
            envelope.sustain = sustain
        }
        let release = envelopeMatch.find(e => e.slice(0,1) === 'r')
        if (release && release.length>1) {
            release = parseFloat(release.slice(1))
            envelope.release = release === 0 ? 0.001 : release
        }

        // console.log('envelope', envelope)
        return envelope
    }


    /***************************************************************************
    * PITCH MANAGEMENT
    ***************************************************************************/

    parseBasePitch(todoText) {
      const basePitchMatch = todoText.match(/base:([0-9]|[1-9][0-9]|[0-9][0-9][0-9])\b/)
      console.log('basePitchMatch', basePitchMatch);
      if (basePitchMatch === null) { return false }
      console.log('basePitchMatch[0].slice(5)', basePitchMatch[0].slice(5));

      return parseInt(basePitchMatch[0].slice(5), 0)
    }

    parseDetune(todoText) {
      const find = todoText.match(/detune:[+|-]([0-9]|[1-9][0-9])\b/i)
      console.log('parseDetune find', find);
      if (find === null) { return false }

      const detuneMatch = find[0].slice(7)
      console.log('detuneMatch', detuneMatch);
      const cents = detuneMatch.slice(1)
      console.log('cents', cents);
      const plusOrMinus = detuneMatch[0]
      console.log('plusOrMinus', plusOrMinus);

      let detune = 0
      if (plusOrMinus === '+') {
        console.log('plusOrMinus === +');
        detune += parseInt(cents, 10)
      } else if (plusOrMinus === '-') {
        console.log('plusOrMinus === -');
        detune -= parseInt(cents, 10)
      } else {
        return false
      }

      console.log('detune', detune);
      return detune
    }

    parseLoRange(todoText) {
        let match = null
        let pitchHz
        let pitchWestern
        match = todoText.match(/lo:([0-9]|[1-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9])\b/i)
        if (match !== null) {
          pitchHz = match[0].slice(3)
          this.loDisplay = pitchHz
        } else {
          // match = todoText.match(/lo:([a-g])([b#])?[1-8]/i) // lacking cents adjustment
          match = todoText.match(/lo:([a-g])([b#])?[1-8]([+|-]([0-9]|[1-9][0-9])\b)?/i) // lacking cents adjustment
          console.log('match', match);
          if (match === null) { return false }
          pitchWestern = match[0].slice(3)
          this.loDisplay = pitchWestern
          pitchHz = this.convertWesternToHz(pitchWestern)
        }

        console.log('parseLoRange pitch', pitchHz);
        return pitchHz
    }

    parseHiRange(todoText) {
        let match = null
        let pitchHz
        let pitchWestern
        match = todoText.match(/hi:([0-9]|[1-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9])\b/i)
        if (match !== null) {
          pitchHz = match[0].slice(3)
          this.hiDisplay = pitchHz
        } else {
          // match = todoText.match(/lo:([a-g])([b#])?[1-8]/i) // lacking cents adjustment
          match = todoText.match(/hi:([a-g])([b#])?[1-8]([+|-]([0-9]|[1-9][0-9])\b)?/i) // lacking cents adjustment
          console.log('match', match);
          if (match === null) { return false }
          pitchWestern = match[0].slice(3)
          this.hiDisplay = pitchWestern
          pitchHz = this.convertWesternToHz(pitchWestern)
        }

        console.log('parseLoRange pitch', pitchHz);
        return pitchHz
    }
        // else if (loOrHi === 'highRange') {
        //   match = todoText.match(/hi:([0-9]|[1-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9])\b/)
        //   if (match === null) { return false }
        //   pitch = match[0].slice(3)
        // }

    convertWesternToHz(pitchMatch) {
      console.log('convert pitchMatch', pitchMatch);
      pitchMatch = pitchMatch.toLowerCase()
      const westernPitchClassToCents = { // 'a': 0, 'a#': 100, 'bb': 100, 'b': 200, 'c': 300, 'c#': 400, 'db': 400, 'd': 500, 'd#': 600, 'eb': 600, 'e': 700, 'f': 800, 'f#': 900, 'gb': 900, 'g': 1000, 'g#': 1100, 'ab': 1100,
        'c': 0, 'c#': 100, 'db': 100, 'd': 200, 'd#': 300, 'eb': 300, 'e': 400, 'f': 500, 'f#': 600, 'gb': 600, 'g': 700, 'g#': 800, 'gb': 800, 'a': 900, 'a#': 1000, 'bb': 1000, 'b': 1100,
      }

      let centsAdjustment = pitchMatch.match(/[+|-]([0-9]|[1-9][0-9])\b/i)
      console.log('centsAdjustment', centsAdjustment);
      let pitch = pitchMatch.match(/([a-g])([b#])?[1-8]/i)
      console.log('pitch', pitch);


      let pitchClass = pitch[0].slice(0, -1)
      let pitchOctave = pitch[0].slice(-1)

      let pitchClassToCents = westernPitchClassToCents[pitchClass]
      console.log('pitchClassToCents', pitchClassToCents);
      let pitchClassToCentsDetuned = pitchClassToCents + this.detune
      console.log('pitchClassToCentsDetuned', pitchClassToCentsDetuned);

      let pitchClassCentsAdjusted = pitchClassToCentsDetuned
      if (centsAdjustment !== null) {
        if (centsAdjustment[0][0] === '+') {
          pitchClassCentsAdjusted += parseInt(centsAdjustment[0].slice(1), 10)
        } else {
          pitchClassCentsAdjusted -= parseInt(centsAdjustment[0].slice(1), 10)
        }
      }
      console.log('pitchClassCentsAdjusted', pitchClassCentsAdjusted);

      let pitchClassToHz = 261.63 * (2 ** (pitchClassToCentsDetuned/1200))
      console.log('pitchClassToHz', pitchClassToHz);
      const octaveAdjustments = {
        '1': 0.0125, '2': 0.25, '3': 0.5, '4': 0, '5': 2, '6': 4, '7': 8, '8': 16,
      }
      let pitchHzOctaveAdjusted = pitchClassToHz * octaveAdjustments[pitchOctave]
      console.log('pitchHzOctaveAdjusted', pitchHzOctaveAdjusted);


      return pitchHzOctaveAdjusted
    }



    parseEDOPitchClasses(todoText) {
        const edoMatch = todoText.match(/\b([1-9]|[1-9][0-9]|[1-9][0-9][0-9])edo/gi)
        if (edoMatch === null) { return false }
        console.log('edoMatch[0].slice(0, -3)', edoMatch[0].slice(0, -3));
        const edo = parseInt(edoMatch[0].slice(0, -3), 0)
        console.log('edo', edo);

        let pitchClasses = [] // here defining pitchClasses in cents
        const interval = 1200/edo
        console.log('interval', interval);
        for (let i=0; i<edo; i++) {
          pitchClasses.push(interval*i)
        }
        console.log('pitchClasses', pitchClasses);

        return pitchClasses
    }

    parseMicrotonePitchClasses(todoText) {
        // const pitchClassMatches = todoText.match(/(?<![lohis])([a-g])([b#])?(?![\dw\.])/gi)
        // const pitchClassMatches = todoText.match(/(?<![t%npadsr])([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])/gi)
        // const pitchClassMatches = todoText.match(/\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b/gi)
        const arrowBracketMatches = todoText.match(/<.*?>/gi)
        // console.log('arrowBracketMatches', arrowBracketMatches)
        if (arrowBracketMatches === null) { return false }

        // const pitchClassMatches = arrowBracketMatches[0].match(/\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b/gi)
        const pitchClassMatches = arrowBracketMatches[0].match(/\b([0-9]|[1-9][0-9]|[0-9][0-9][0-9]|[0-9][0-4][0-9][0-9])\b/gi)
        // console.log('pitchClassMatches', pitchClassMatches);

        const pitchClasses = pitchClassMatches.filter(e => parseInt(e, 10) < 1200)

        // console.log('pitchClasses', pitchClasses);
        return pitchClasses
    }


    buildMicrotonePitchSet() {
        const pitchClasses = this.pitchClasses

        let adjustedBasePitch = this.basePitch
        while (adjustedBasePitch > 16) {
          adjustedBasePitch /= 2
        }
        // console.log('adjustedBasePitch', adjustedBasePitch);
        const pitchSet = []
        for (let i=0; i<8; i++) {
          pitchClasses.forEach(p => {
            pitchSet.push(adjustedBasePitch * (2 ** (p/1200)))
          })
          adjustedBasePitch *= 2
        }

        // console.log('microtone pitchSet prefilter', pitchSet);
        const filteredPitchSet = pitchSet.filter(p => {
          return p >= this.lo && p <= this.hi
        })
        console.log('microtone filteredPitchSet', filteredPitchSet);

        return filteredPitchSet
    }


    /***************************************************************************
    * RENDER
    ***************************************************************************/

    buildDisplayText() {
      const basePitch = `base:${this.basePitch}`
        const pitchClasses = `cents:< ${this.pitchClasses.join(' ')} >`
        // const lo = `lo:${this.lo}`
        const lo = `lo:${this.loDisplay}`
        const hi = `hi:${this.hi}`
        const tempo = `t${this.tempo}`
        const percent = `%${this.percent}`
        const duration = `n${this.duration}`
        const playTime = `pt${this.playTime}`
        const waitTime = `wt${this.waitTime}`
        const portamento = this.synthType === 'mono' ? `p${this.portamento} ` : ''
        const synths = `{ ${this.synthWaves.join(' ')} ${this.synthType} ${portamento}}`
        const envelope = `[ a${this.envelope.attack} d${this.envelope.decay} s${this.envelope.sustain} r${this.envelope.release} ]`
        return `${basePitch}  ${lo}  ${hi}
${pitchClasses}
${tempo} ${percent} ${duration} ${playTime} ${waitTime}
${synths} ${envelope}`
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
