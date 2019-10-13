/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
    constructor() {
        this.fullRange = ["C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2","C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6","C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7","A7","A#7","B7","C8", "C#8","D8","D#8","E8","F8","F#8","G8","G#8","A8","A#8","B8"]
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
        this.nowPlaying = false
    }

    bindTodoListChanged(callback) {
        this.onTodoListChanged = callback
    }

    _commit(todos) {
        this.onTodoListChanged(todos)
        localStorage.setItem('todos', JSON.stringify(todos))
    }

    bindAudioChanged(callback) {
        this.onAudioChanged = callback
    }

    get activeTodo() {
        if (this.nowPlaying === false) { return null }
        const idIndex = this.todos.indexOf(this.todos.find(todo => todo.id === this.nowPlaying))
        return this.todos[idIndex]
    }

    todoPlaySetup = (id) => {

        console.log('playing to do id', id)
        console.log('to dues', this.todos)
        const idIndex = this.todos.indexOf(this.todos.find(todo => todo.id === id)) // could make this a getter
        console.log('idIndex', idIndex)
        // if that particular to do is not playing, turn all todos off and then turn that one on, and set nowPlaying to that ID

        if (!this.todos[idIndex].playing) {
            this.todos = this.todos.map(todo => {
                return {...todo, playing: false }
            })
            this.todos[idIndex].playing = true
            this.nowPlaying = id
            console.log('nowPlaying', this.nowPlaying)
        // if that particular to do *is* playing, turn it off and set nowPlaying to false
        } else if (this.todos[idIndex].playing) {
            console.log('in else if...')
            this.todos[idIndex].playing = false
            this.nowPlaying = false
        }
        this.onTodoListChanged(this.todos)
        this.onAudioChanged()
    }

    addTodo(todoText) {
        // validate null inputs
        let parens = todoText.match(/\((.*?)\)/i)   //https://stackoverflow.com/questions/2403122/regular-expression-to-extract-text-between-square-brackets
        parens = parens !== null ? parens[0] : '(c d e f g a b)'
        let noteNameArray = parens.match(/([a-g])([b#])?/gi)
        noteNameArray = noteNameArray.map(name => name.charAt(0).toUpperCase() + name.slice(1))
        let tempo = todoText.match(/t\d\d/gi)
        tempo = tempo !== null ? tempo[0] : 120
        let percent = todoText.match(/%\d\d/gi)
        percent = percent !== null ? percent[0] : 25
        const loMatch = todoText.match(/lo([a-g])([b#])?[1-8]/gi) || ['loC3']
        const hiMatch = todoText.match(/hi([a-g])([b#])?[1-8]/gi) || ['hiC4']
        console.log('loMatch', loMatch)
        console.log('hiMatch', hiMatch)
        // const duration = todoText.match(/d\d\d/gi)

        // create to do text from regular expression matches
        // to assess range (probably in audio) convert flats to sharps
        console.log('parens', parens)
        console.log('noteNameArray', noteNameArray)
        console.log('tempo', tempo)
        console.log('percent', percent)
        // console.log('duration', duration)

        // note you'll need to validate the lo and hi ranges
        const lo = this.parseLowRange(loMatch)
        console.log('lo', lo)
        const hi = this.parseHighRange(hiMatch, lo)
        console.log('hi', hi)
        const todo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            tempo: tempo,
            percent: percent,
            noteString: noteNameArray.join('.'),
            lo: lo,
            hi: hi,
            pitchSet: this.createPitchSet(noteNameArray, lo, hi),
            playing: false
        }

        console.log('todo', todo)
        this.todos.push(todo)

        this._commit(this.todos)
    }

    parseLowRange = (loPitch) => {
        loPitch = loPitch[0].slice(2)
        loPitch = loPitch.charAt(0).toUpperCase() + loPitch.slice(1)
        loPitch = this.convertFlatToSharp(loPitch.slice(0,-1)) + loPitch.slice(-1)
        return loPitch
    }

    parseHighRange = (hiPitch, loPitch) => {
        hiPitch = hiPitch[0].slice(2)
        hiPitch = hiPitch.charAt(0).toUpperCase() + hiPitch.slice(1)
        hiPitch = this.convertFlatToSharp(hiPitch.slice(0,-1)) + hiPitch.slice(-1)
        if (this.fullRange.indexOf(hiPitch) <= this.fullRange.indexOf(loPitch)) {
            hiPitch = loPitch
        }
        return hiPitch
    }

    convertFlatToSharp = (noteName) => {
        const conversion = {'Cb':'B', 'Db':'C#', 'Eb':'D#', 'Fb':'E', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#'}
        if (Object.keys(conversion).includes(noteName)) {
            return conversion[noteName]
        }
        else { return noteName }
    }

    createPitchSet(noteNameArray, lo, hi) {
        // needs to function on add or edit
        //      read Lo and Hi from add to do, or from state?
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

    editTodo(id, updatedText) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? {id: todo.id, text: updatedText} : todo
        )

        this._commit(this.todos)
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id)

        this._commit(this.todos)
    }

}
