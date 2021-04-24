function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}



function convertWesternToHz(pitchMatch) {
    console.log('convertWesternToHz pitchMatch', pitchMatch);
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



function convertFlatToSharp(noteName) {
    const conversion = {'Cb':'B', 'Db':'C#', 'Eb':'D#', 'Fb':'E', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#'}
    if (Object.keys(conversion).includes(noteName)) {
        return conversion[noteName]
    }
    else { return noteName }
}



function filterEnharmonics(pitchClasses) {
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
