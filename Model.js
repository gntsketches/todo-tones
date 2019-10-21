/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {

    constructor() {
        this.todos = []
        this.todoData = JSON.parse(localStorage.getItem('todos')) || []
        this.todoData.forEach(todoDataItem => {
            // https://www.reddit.com/r/learnjavascript/comments/di64kd/best_practice_for_class_instantiation_from_json/
            const todoObj = new Todo()
            Object.assign(todoObj, todoDataItem)
            this.todos.push(todoObj)
        })
        console.log('"hydrated":', this.todos)

        this.nowPlaying = false
        this.playMode = 'Stay'

    }


    // BINDINGS ************************************************************************************
    bindPlayModeChanged(callback) { this.onPlayModeChanged = callback }
    bindTodoListChanged(callback) { this.onTodoListChanged = callback }
    bindAudioChanged(callback) { this.onAudioChanged = callback }


    // UPDATE / STORAGE
    _commit(todos) {
        this.onTodoListChanged(todos)
        const toStorage = todos.map(todo => {
            return { ...todo, playing: false, waiting: false }
        })
        localStorage.setItem('todos', JSON.stringify(toStorage))
    }


    // GETTERS **********************************************************************
    get activeTodo() {
        if (this.nowPlaying === false) { return null }
        // const idIndex = this.todos.indexOf(this.todos.find(todo => todo.id === this.nowPlaying))
        // return this.todos[idIndex]
        return this.todos[this.nowPlayingIndex]
    }

    get nowPlayingIndex() {
        return this.todos.indexOf(this.todos.find(todo => todo.id === this.nowPlaying))
    }


    // "ENGINE" ******************************************************************
    autoChangeNowPlaying() {
        // does this consider if nowPlaying is false?
        if (this.activeTodo.waitTime > 0 && this.activeTodo.waiting === false) {
            this.activeTodo.waiting = true
            return
        }
        this.activeTodo.waiting = false
        switch (this.playMode) {
            case 'Stay':
                break
            case 'Once':
                if (this.nowPlayingIndex < this.todos.length-1) {
                    const nextTodoId = this.todos[this.nowPlayingIndex+1].id
                    this.todoPlaySetup(nextTodoId)
                } else {
                    this.todoPlaySetup(this.activeTodo.id)
                }
                 break
            case 'Loop':
                if (this.nowPlayingIndex < this.todos.length-1) {
                    const nextTodoId = this.todos[this.nowPlayingIndex+1].id
                    this.todoPlaySetup(nextTodoId)
                } else {
                    const nextTodoId = this.todos[0].id
                    this.todoPlaySetup(nextTodoId)
                }
                break
            case 'Rand':
                if (this.todos.length === 1) { return }
                let nextTodoId = null
                do { nextTodoId = this.todos[Math.floor(Math.random()*this.todos.length)].id }
                while (nextTodoId === this.activeTodo.id)
                this.todoPlaySetup(nextTodoId)
                break
        }
    }

    todoPlaySetup = (id) => {
        // note that this is mutating To-do values directly rather than calling a method on them to do so.
        const idIndex = this.todos.indexOf(this.todos.find(todo => todo.id === id)) // could make a function to do this
        // if that particular to do is not playing, turn all todos off and then turn that one on, and set nowPlaying to that ID
        if (!this.todos[idIndex].playing) {
            this.todos.forEach(todo => {
                todo.playing = false
                todo.waiting = false
            })
            this.todos[idIndex].playing = true
            this.nowPlaying = id
        // if that particular to do *is* playing, turn it off and set nowPlaying to false
        } else if (this.todos[idIndex].playing) {
            this.todos[idIndex].playing = false
            this.nowPlaying = false
        }
        this.onTodoListChanged(this.todos)
        this.onAudioChanged()
    }


    // GENERAL ***************************************************
    setPlayMode() {
        switch (this.playMode) {
            case 'Stay': this.playMode = 'Loop'; break
            case 'Loop': this.playMode = 'Once'; break
            case 'Once': this.playMode = 'Rand'; break
            case 'Rand': this.playMode = 'Stay'; break
        }
        this.onPlayModeChanged(this.playMode)
    }

    addTodo(todoText) {
        const id = this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1
        const todo = new Todo(todoText, id)
        this.todos.push(todo)
        // console.log(this.todos)
        this._commit(this.todos)
    }

    deleteTodo(id) {
        if (this.nowPlaying === id) {
            console.log("Can't delete a todo while it's playing.")
            return
        }
        this.todos = this.todos.filter(todo => {
            return todo.id !== id
        })

        this._commit(this.todos)
    }

    editTodo(id, updatedTodoText) {
        this.todos.forEach((todo, index) => {
            // console.log('pre', todo)
            if (todo.id === id) {
                todo.updateTodo(updatedTodoText)
            }
            // console.log('post', todo)
        })

        this._commit(this.todos)

        this.onAudioChanged()
    }

}


