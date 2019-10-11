/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
    }

    bindTodoListChanged(callback) {
        this.onTodoListChanged = callback
    }

    _commit(todos) {
        this.onTodoListChanged(todos)
        localStorage.setItem('todos', JSON.stringify(todos))
    }

    processTodo(todoText) {

    }
// let harmonicPreForm = value.match(/((([c|d|f|g|a]#?|[b|e])\\)?([c|d||f|g|a]#?|[b|e])(dia|mel|har|dim|aug|chr|maj|min|sus|ma7|dom|mi7|hdm|dm7|blu|pen|fth|one))|((([c|d|f|g|a]#?|[b|e])\\)?-[a-z])/gi)
    addTodo(todoText) {
        const p = todoText.match(/\((.*?)\)/i)[0]      //https://stackoverflow.com/questions/2403122/regular-expression-to-extract-text-between-square-brackets
        const notes = p.match(/([a-g])([b#])?/gi)
        const tempo = todoText.match(/t\d\d/gi)
        const percent = todoText.match(/%\d\d/gi)
        // const duration = todoText.match(/d\d\d/gi)

        // create to do text from regular expression matches
        // to assess range (probably in audio) convert flats to sharps
        console.log('p', p)
        console.log('notes', notes)
        console.log('tempo', tempo)
        console.log('percent', percent)
        // console.log('duration', duration)
        const todo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            tempo: tempo,
            percent: percent,
            notes: notes,
            lo: 'C3',
            hi: 'C4',
        }

        this.todos.push(todo)

        this._commit(this.todos)
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

    playTodo(id) {
        console.log('playing!', id)
    }

}
