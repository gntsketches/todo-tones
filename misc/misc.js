    parseRange(todoText, loOrHi) {
        // match l or lo, h or hi
        let match = null
        if (loOrHi === 'lowRange') { match = todoText.match(/lo([a-g])([b#])?[1-8]/i) }
        else if (loOrHi === 'highRange') { match = todoText.match(/hi([a-g])([b#])?[1-8]/gi) }
        // console.log('match', match)
        if (match === null) { return false }
        let pitch = match[0].slice(2)
        pitch = pitch.charAt(0).toUpperCase() + pitch.slice(1)
        pitch = this.convertFlatToSharp(pitch.slice(0,-1)) + pitch.slice(-1)
        if (loOrHi === 'highRange') {
            if (constants.fullRange.indexOf(pitch) <= constants.fullRange.indexOf(this.lo)) {
                pitch = this.lo
            }
            // console.log('high', pitch)
        }
        return pitch
    }


    buildPitchSet() {
        const pitchClasses = this.pitchClasses
        const pitchClassesSharped = pitchClasses.map(noteName => this.convertFlatToSharp(noteName))
        // console.log('noteNameArraySharped', noteNameArraySharped)
        let adjustedRangeLow = constants.fullRange.slice(constants.fullRange.indexOf(this.lo))
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



    parsePitchClasses(todoText) {
        // const pitchClassMatches = todoText.match(/(?<![a-z])([a-g])([b#])?(?!\da-z)/gi) // https://www.regular-expressions.info/lookaround.html
        const pitchClassMatches = todoText.match(/(?<![lohis])([a-g])([b#])?(?![\dw\.])/gi) // https://www.regular-expressions.info/lookaround.html
            // use more generic/comprehensive lookarounds? with this you may have to update for every new feature
        // console.log('pitchClassMatches', pitchClassMatches)
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
