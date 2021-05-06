
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

        this.pitchClassStyle = 'Western'
        this.edo = 12

        this.basePitch = 261.63  // used for edo/cents
        this.basePitchDisplay = 261.63
        this.detune = 0 // (used for Western)
        // this.pitchClasses = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
        this.pitchClasses = [0, 200, 400, 500, 700, 900, 1100]
        // this.pitchClasses = [0, 200, 400]
        this.pitchSet = [261.63]
        this.lo = convertWesternToHz('C4') // 261.63
        this.loDisplay = 'C4'
        this.hi = convertWesternToHz('B4') // 493.88
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
      console.log('updateTodo');

        // parseRange & parseBasePitch (accepts Western or Hz, displays in Western if Western)
          // UI: display detune if using a Western *basePitch*, not it Hz


        // this style needs to be determined first because lo & high depend on it for Western/non-Western

      // no wait it doesn't. because you are going to filter based on hz anyway
      // u can remove those checks from paraseLo/Hi and also set this.lo/hi back to hz

        this.pitchClassStyle = this.identifyPitchClassStyle(todoText)
        // console.log('pitchClassStyle', this.pitchClassStyle);

        this.lo = this.parseLoRange(todoText) || this.lo // side effect: set loDisplay
        this.hi = this.parseHiRange(todoText) || this.hi // side effect: set hiDisplay
        this.basePitch = this.parseBasePitch(todoText) || this.basePitch
        this.detune = this.parseDetune(todoText) || this.detune
        // console.log('this.detune', this.detune);


        switch(this.pitchClassStyle) {
          // ? pitch display vs pitchClasses vs. pitchSet
          // is a display needed separately from pitchClasses?
          // ie: can pitchClasses be pitchClasses and also serve as the display?
          // well as long as it's serving as pitchClasses we can display that and if it doesn't work go from there
          case 'Hz':
            this.pitchClasses = this.parseHzPitches(todoText) || [440]
            this.pitchSet = [...this.pitchClasses]
            break
          case 'Cents':
            this.pitchClasses = this.parseCentsPitchClasses(todoText)
            this.pitchSet = this.buildPitchSetFromCents(this.pitchClasses)
            break
          case 'Edo':
            this.pitchClasses = this.parseEDOPitchClasses(todoText) // side effect: assign edo
            this.pitchSet = this.buildPitchSetFromEDO()
            break
          default: // Western
            this.pitchClasses = this.parseWesternPitchClasses(todoText)
            this.pitchSet = this.buildPitchSetFromWestern()
            break
        }

        // this.pitchClasses = this.parseEDOPitchClasses(todoText) || this.pitchClasses
        // this.pitchSet = this.buildMicrotonePitchSet() || this.pitchSet

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

        // Render
        this.text = this.buildDisplayText()

        // console.log('todo updated:', this)
    }




    /***************************************************************************
    * PITCH MANAGEMENT
    ***************************************************************************/

    parseBasePitch(todoText) {
      let match = null
      let pitchHz
      let pitchWestern
      match = todoText.match(/base:([0-9]|[1-9][0-9]|[0-9][0-9][0-9])\b/)
      if (match !== null) {
        pitchHz = match[0].slice(5)
        this.basePitchDisplay = pitchHz
      } else {
          match = todoText.match(/base:([a-g])([b#])?[1-8]([+|-]([0-9]|[1-9][0-9])\b)?/i) // lacking cents adjustment
          // console.log('match', match);
          if (match === null) { return false }
          pitchWestern = match[0].slice(5)
          this.basePitchDisplay = ucFirst(pitchWestern)
          console.log('in parseBasePitch');
          pitchHz = convertWesternToHz(pitchWestern, this.detune)
      }
      console.log('base pitchHz', pitchHz);

      return parseInt(match[0].slice(5), 0)
    }

    parseDetune(todoText) {
      const find = todoText.match(/detune:[+|-]([0-9]|[1-9][0-9])\b/i)
      // console.log('parseDetune find', find);
      if (find === null) { return false }

      const detuneMatch = find[0].slice(7)
      // console.log('detuneMatch', detuneMatch);
      const cents = detuneMatch.slice(1)
      // console.log('cents', cents);
      const plusOrMinus = detuneMatch[0]
      // console.log('plusOrMinus', plusOrMinus);

      let detune = 0
      if (plusOrMinus === '+') {
        // console.log('plusOrMinus === +');
        detune += parseInt(cents, 10)
      } else if (plusOrMinus === '-') {
        // console.log('plusOrMinus === -');
        detune -= parseInt(cents, 10)
      } else {
        return false
      }

      // console.log('detune', detune);
      return detune
    }

    parseLoRange(todoText) {
        let match = null
        let pitchHz
        let pitchWestern
        match = todoText.match(/lo:([0-9]|[1-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9])\b/i)
        // match = todoText.match(/lo:?([0-9]|[1-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9])\b/i) // need to adjust slice length
        if (this.pitchStyle !== 'Western' && match !== null) { // refactor to skip this match if Western

          pitchHz = match[0].slice(3)
          this.loDisplay = pitchHz // SIDE EFFECT
        } else {
          // match = todoText.match(/lo:([a-g])([b#])?[1-8]/i) // lacking cents adjustment
          match = todoText.match(/lo:([a-g])([b#])?[1-8]([+|-]([0-9]|[1-9][0-9])\b)?/i) // lacking cents adjustment
          // console.log('match', match);
          if (match === null) { return false }
          pitchWestern = match[0].slice(3)
          this.loDisplay = ucFirst(pitchWestern)
          console.log('in parseLoRange');
          pitchHz = convertWesternToHz(pitchWestern, this.detune)
        }

        console.log('parseLoRange pitch', pitchHz);
        return pitchHz
    }

    parseHiRange(todoText) {
        let match = null
        let pitchHz
        let pitchWestern
        match = todoText.match(/hi:([0-9]|[1-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9])\b/i)
        if (this.pitchStyle !== 'Western' && match !== null) { // refactor to skip this match if Western
          pitchHz = match[0].slice(3)
          this.hiDisplay = pitchHz // SIDE EFFECT
        } else {
          // match = todoText.match(/lo:([a-g])([b#])?[1-8]/i) // lacking cents adjustment
          match = todoText.match(/hi:([a-g])([b#])?[1-8]([+|-]([0-9]|[1-9][0-9])\b)?/i) // lacking cents adjustment
          // console.log('match', match);
          if (match === null) { return false }
          pitchWestern = match[0].slice(3)
          this.hiDisplay = ucFirst(pitchWestern)
          console.log('in parseHiRange');
          pitchHz = convertWesternToHz(pitchWestern, this.detune)
        }

        // console.log('parseHiRange pitch', pitchHz);
        return pitchHz
    }



    identifyPitchClassStyle(todoText) {
        const hzMatch = todoText.match(/hz/i)
        if (hzMatch) return 'Hz'

        const centsMatch = todoText.match(/cents/i)
        if (centsMatch) return 'Cents'

        const edoMatch = todoText.match(/\b([1-9]|[1-9][0-9]|[1-9][0-9][0-9])edo/i)
        if (edoMatch) return 'Edo'

        return 'Western'
    }

    parseHzPitches(todoText) {

        const arrowBracketMatches = todoText.match(/<.*?>/gi)
        console.log('hz arrowBracketMatches', arrowBracketMatches)
        if (arrowBracketMatches === null) { return false }

        // const pitchClassMatches = arrowBracketMatches[0].match(/\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b/gi)
        const pitchMatches = arrowBracketMatches[0]
          .match(/\b([1-9][0-9]|[0-9][0-9][0-9]|[0-9][0-4][0-9][0-9])(\.([1-9]|[0-9][1-9]))?\b/gi)
        console.log('hz pitchMatches', pitchMatches);
        if (pitchMatches === null) { return false }

        const pitches = pitchMatches.filter(e => parseInt(e, 10) < 1200)
        console.log('isArray pitches', Array.isArray(pitches));
        return pitches
      // ...
    }

    parseCentsPitchClasses(todoText) {
      console.log('parseCentsPitchClasses')
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

        console.log('pitchClasses', pitchClasses);
        // TODO filter repeats
        // TODO sort by order
        return pitchClasses
    }

    buildPitchSetFromCents(pitchClasses) { // this could perhaps be a helper as same material is used elsewhere

        let adjustedBasePitch = this.basePitch
        while (adjustedBasePitch > 16) {
          adjustedBasePitch /= 2
        }
        console.log('adjustedBasePitch', adjustedBasePitch);
        const pitchSet = []
        for (let i=0; i<8; i++) {
          pitchClasses.forEach(p => {
            pitchSet.push(adjustedBasePitch * (2 ** (p/1200)))
          })
          adjustedBasePitch *= 2
        }

        console.log('microtone pitchSet prefilter', pitchSet);
        console.log('this.lo', this.lo);
        console.log('this.hi', this.hi);
        const filteredPitchSet = pitchSet.filter(p => {
          return p >= this.lo && p <= this.hi
        })
        console.log('microtone filteredPitchSet', filteredPitchSet);

        return filteredPitchSet
    }


    parseEDOPitchClasses(todoText) {
        const edoMatch = todoText.match(/\b([1-9]|[1-9][0-9]|[1-9][0-9][0-9])edo/gi)
        if (edoMatch === null) { return false }
        console.log('edoMatch[0].slice(0, -3)', edoMatch[0].slice(0, -3));
        const edo = parseInt(edoMatch[0].slice(0, -3), 0)
        console.log('edo', edo);
        this.edo = edo; // SIDE EFFECT
        const arrowBracketMatches = todoText.match(/<.*?>/gi)
        const pitchClassMatches = arrowBracketMatches[0].match(/\b([1-9]|[1-9][0-9]|[0-9][0-9][0-9])\b/gi)
        console.log('edo pitchClassMatches', pitchClassMatches);
        const pitchClasses = pitchClassMatches.filter(e => {
          return parseInt(e, 10) <= edo
        })

        // TODO filter repeats
        // TODO sort by order

        return pitchClasses
    }

    buildPitchSetFromEDO() {
        const centsFromEdo = []
        const interval = 1200/this.edo
        console.log('interval', interval);
        for (let i=0; i<this.edo; i++) {
          centsFromEdo.push(interval*i)
        }
        console.log('centsFromEdo', centsFromEdo);
        const centsFromEdoDegrees = []
        this.pitchClasses.forEach((e, i) => {
          centsFromEdoDegrees.push((interval*e)-interval)
        })
        console.log('centsFromEdoDegrees', centsFromEdoDegrees);

        const pitchSet = this.buildPitchSetFromCents(centsFromEdoDegrees)

        console.log('PitchSetFromEDO', pitchSet);
        return pitchSet
    }

    parseWesternPitchClasses(todoText) {
        const arrowBracketMatches = todoText.match(/<.*?>/gi)
        console.log('Western arrowBracketMatches', arrowBracketMatches)
        if (arrowBracketMatches === null) { return false }
    //     // const pitchClassMatches = todoText.match(/(?<![a-z])([a-g])([b#])?(?!\da-z)/gi) // https://www.regular-expressions.info/lookaround.html
    const match = arrowBracketMatches[0]
    console.log('W match', match);

      const westernMatches = arrowBracketMatches[0]
        .match(/([a-g])([b#])?([+|-]([0-9]|[1-9][0-9])\b)?/gi)
      console.log('Western matches', westernMatches);
        if (westernMatches === null) { return false }

      const ucWesternMatches = westernMatches.map(e => {
        return ucFirst(e)
      })
        return ucWesternMatches
    //     const pitchClassMatches = todoText.match(/(?<![lohis])([a-g])([b#])?(?![\dw\.])/gi) // https://www.regular-expressions.info/lookaround.html
    //         // use more generic/comprehensive lookarounds? with this you may have to update for every new feature

    //     const pitchClasses = pitchClassMatches.map(name => {
    //         return name.charAt(0).toUpperCase() + name.slice(1)
    //     })
    //     // console.log('pitchClasses', pitchClasses)
    //     // console.log('pC pre', pitchClasses)
    //     const unique = pitchClasses.filter((item, i) => pitchClasses.indexOf(item) === i)
    //     // console.log('pc post', unique)
    //     //  convert redundant flats to sharps!
    //     return filterEnharmonics(unique)
    }

    buildPitchSetFromWestern() {
        // alternate method would be to use constants.pitchToHz & figure out the cents adjustment separately

        const pitchClasses = this.pitchClasses

        const pitchClassesToHzFullRange = []
        for (let i=1; i<9; i++) {
           this.pitchClasses.forEach(e => {
            const foundClass = e.match(/[a-g][b#]?/i)
            console.log('foundClass', foundClass);
            let pitch = foundClass[0]+i
            let centsAdjustment = e.match(/[+|-]([0-9]|[1-9][0-9])\b/i)
            console.log('centsAdjustment', centsAdjustment);
            if (centsAdjustment !== null) {
              pitch = pitch + centsAdjustment[0]
            }
            console.log('pitch', pitch);

            const pitchInHz = convertWesternToHz(pitch, this.detune, 'extra')
            console.log('pitchInHz', pitchInHz);
            pitchClassesToHzFullRange.push(pitchInHz)
          })
        }
        console.log('pitchClassesToHzFullRange', pitchClassesToHzFullRange);

        const pitchClassesToHz = pitchClassesToHzFullRange.filter(e => {
          console.log('e', e);
          /*
            jz<32 33> quite noticeable
            hz<65 64> quite noticeable,
            hz<128 129> a bit noticeable
            hz <220 221> barely
          */
          let num, lo, hi
          if (e < 100) {
            num = Math.round(e*100)/100
            lo = Math.round(this.lo*100)/100
            hi = Math.round(this.hi*100)/100
          } else if (e < 200) {
            num = Math.round(e*10)/10
            lo = Math.round(this.lo*10)/10
            hi = Math.round(this.hi*10)/10
          } else {
            num = Math.round(e)
            lo = Math.round(this.lo)
            hi = Math.round(this.hi)
          }
          console.log('num', num);
          console.log('lo', lo);
          console.log('hi', hi);

          return num >= lo && num <= hi
        })

        console.log('pitchClassesToHz', pitchClassesToHz);

      return pitchClassesToHz
    }


    /***************************************************************************
    * RENDER
    ***************************************************************************/

    buildDisplayText() {
        const basePitch = `base:${this.basePitchDisplay}`
        let pitchClassStyle
        switch (this.pitchClassStyle) {
          case 'Hz': pitchClassStyle = 'Hz:'; break;
          case 'Cents': pitchClassStyle = 'Cents:'; break;
          case 'Edo': pitchClassStyle = this.edo + 'Edo:'; break;
          default: pitchClassStyle = '';
        }
        const pitchClasses = `< ${this.pitchClasses.join(' ')} >`
        // const lo = `lo:${this.lo}`
        const lo = `lo:${this.loDisplay}`
        const hi = `hi:${this.hiDisplay}`
        const tempo = `t${this.tempo}`
        const percent = `%${this.percent}`
        const duration = `n${this.duration}`
        const playTime = `pt${this.playTime}`
        const waitTime = `wt${this.waitTime}`
        const portamento = this.synthType === 'mono' ? `p${this.portamento} ` : ''
        const synths = `{ ${this.synthWaves.join(' ')} ${this.synthType} ${portamento}}`
        const envelope = `[ a${this.envelope.attack} d${this.envelope.decay} s${this.envelope.sustain} r${this.envelope.release} ]`

        if (this.pitchClassStyle === 'Hz') {
          return `${pitchClassStyle}${pitchClasses}
${tempo} ${percent} ${duration} ${playTime} ${waitTime}
${synths} ${envelope}`
        }

        return `${basePitch}  ${lo}  ${hi}
${pitchClassStyle}${pitchClasses}
${tempo} ${percent} ${duration} ${playTime} ${waitTime}
${synths} ${envelope}`
    }


    /***************************************************************************
    * NOTE SHAPING
    ***************************************************************************/

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


}
