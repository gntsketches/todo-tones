/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
    constructor() {
        /// view *********************************************************************
        this.app = this.getElement('#root')

            this.title = this.createElement('h1', 'title')
            this.title.textContent = 'Todo Tones'

            this.header = this.createElement('div', 'header')
                this.togglePlayMode = this.createElement('button', 'toggle-play-mode')
                // this.togglePlayMode.textContent = ''
                this.togglePlayMode.name = 'togglePlayMode'
                this.form = this.createElement('form')
                    this.input = this.createElement('input')
                    this.input.type = 'text'
                    this.input.placeholder = '(c d e f g...)'
                    this.input.name = 'todo'
                    this.submitButton = this.createElement('button')
                    this.submitButton.textContent = 'Submit'
                this.form.append(this.input, this.submitButton)
            this.header.append(this.togglePlayMode, this.form)

            this.todoList = this.createElement('ul', 'todo-list')

        this.app.append(this.title, this.header, this.todoList)

        // state ********************************************************************
        this._temporaryTodoText = ''

        // INIT
        this._initLocalListeners()

    }

    get _todoText() {
        return this.input.value
    }

    _resetInput() {
        this.input.value = ''
    }

    createElement(tag, className) {
        const element = document.createElement(tag)

        if (className) element.classList.add(className)

        return element
    }

    getElement(selector) {
        const element = document.querySelector(selector)

        return element
    }

    _initLocalListeners() {
        this.todoList.addEventListener('input', event => {
            if (event.target.className === 'editable') {
                this._temporaryTodoText = event.target.innerText
            }
        })
    }

    // RENDERING *****************************************************8

    updatePlayModeToggle(playMode) {
        this.togglePlayMode.textContent = playMode
    }

    displayTodos(todos) {

        // Delete all nodes
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild)
        }

        // Show default message
        if (todos.length === 0) {
            const p = this.createElement('p')
            p.textContent = "Don't forget to algorithmic free jazz!"
            // "Nothing to do? Add some bloop bloop bleep ..."
            // "Putting the notes back in notes-to-self"
            this.todoList.append(p)
        } else {
            // Create nodes
            todos.forEach(todo => {
                const li = this.createElement('li')
                li.id = todo.id

                const span = this.createElement('span')
                span.contentEditable = true
                span.classList.add('editable')
                span.textContent = todo.text

                const playButton = this.createElement('button', 'play')
                playButton.textContent = todo.playing ? 'Stop' : 'Play'
                li.append(span, playButton)

                const deleteButton = this.createElement('button', 'delete')
                deleteButton.textContent = 'Delete'
                li.append(span, deleteButton)

                // Append nodes
                this.todoList.append(li)
            })
        }

        // Debugging
        // console.log(todos)
    }


    /* BINDINGS ***********************************************************/

    bindPlayTodo(handler) {
        this.todoList.addEventListener('click', event => {
            if (event.target.className === 'play') {
                const id = parseInt(event.target.parentElement.id)

                handler(id)
            }
        })
    }

    bindTogglePlayMode(handler) {
        this.togglePlayMode.addEventListener('click', event => {
            console.log('toggle...')
            handler()
        })
    }

    bindAddTodo(handler) {
        this.form.addEventListener('submit', event => {
            event.preventDefault()

            if (this._todoText) {
                handler(this._todoText)
                this._resetInput()
            }
        })
    }

    bindDeleteTodo(handler) {
        this.todoList.addEventListener('click', event => {
            if (event.target.className === 'delete') {
                const id = parseInt(event.target.parentElement.id)

                handler(id)
            }
        })
    }

    bindEditTodo(handler) {
        this.todoList.addEventListener('focusout', event => {
            if (this._temporaryTodoText) {
                const id = parseInt(event.target.parentElement.id)

                handler(id, this._temporaryTodoText)
                this._temporaryTodoText = ''
            }
        })
    }

}
