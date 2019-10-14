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

        const id = this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1
        const todo = new Todo(todoText, id)
        this.todos.push(todo)

        this._commit(this.todos)
    }

    editTodo(id, updatedTodoText) {
        this.todos = this.todos.map(todo => {
            // return todo.id === id ? {id: todo.id, text: updatedText} : todo
            if (todo.id === id) {
                todo.updateTodo(updatedTodoText)
            } else {
                return todo
            }
        })

        this._commit(this.todos)
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id)

        this._commit(this.todos)
    }

}
