/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
    constructor() {
        /// view *********************************************************************
        this.app = this.getElement('#root')

            this.header = this.createElement('div', 'header')
                this.title = this.createElement('h1', 'title')
                this.title.textContent = 'Todo Microtones'
                this.aboutButton = this.createElement('a', 'about-button')
                this.aboutButton.href = '#about'
                this.aboutButton.textContent = getRandomElement(constants.openModalText)
            this.header.append(this.title, this.aboutButton)

            this.info = this.createElement('div', 'info')
                this.changePlayMode = this.createElement('div', 'change-play-mode')
                this.changePlayMode.textContent = 'Play'
            this.info.append(this.changePlayMode)

            this.form = this.createElement('form')
                this.input = this.createElement('input')
                this.input.type = 'text'
                this.input.placeholder = '(c d e f g...)'
                this.input.name = 'todo'
                this.submitButton = this.createElement('button')
                this.submitButton.textContent = 'Add'
            this.form.append(this.input, this.submitButton)

            this.todoList = this.createElement('ul', 'todo-list')

        this.app.append(this.header, this.info, this.form, this.todoList)

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

    // RENDERING *****************************************************

    updatePlayModeInfo(playMode) {
        // const text = `Play mode: ${constants.playModeInfoText[playMode]}`
        this.changePlayMode.textContent = 'Play mode: ' + playMode
    }

    displayTodos(todos) {

        // Delete all nodes
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild)
        }

        // Show default message
        if (todos.length === 0) {
            const p = this.createElement('p')
            p.textContent = getRandomElement(constants.noTodosQuips)
            p.setAttribute('style', 'margin-top: 0.5rem')
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
                span.setAttribute('spellcheck', false)

                const playButton = this.createElement('button', 'play')
                playButton.textContent = todo.playing ? 'Stop' : 'Play'
                if (todo.playing) { playButton.classList.add('active') }
                else { playButton.classList.remove('active')}

                const deleteButton = this.createElement('button', 'delete')
                deleteButton.textContent = 'Delete'

                // Append nodes
                li.append(playButton, span, deleteButton)
                this.todoList.append(li)
            })
        }

        // Debugging
        // console.log(todos)
    }


    /* BINDINGS ***********************************************************/

    bindChangePlayMode(handler) {
        // notice this is bound separately from displayTodos, but is still a re-render
        // so it could be refactored into that as a general re-render of anything re-render-able
        this.changePlayMode.addEventListener('click', event => {
            console.log('click')
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

    bindPlayTodo(handler) {
        // note how this is bound to the list, not the individual elements. so that's why it tolerates re-renders!
        this.todoList.addEventListener('click', event => {
            if (event.target.classList[0] === ('play')) {
                const id = parseInt(event.target.parentElement.id)
                handler(id)
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
