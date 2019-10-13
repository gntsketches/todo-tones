/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Controller {
    constructor(model, view, audio) {
        this.model = model
        this.view = view
        this.audio = audio

        // model-audio transmission
        this.model.bindAudioChanged(this.onPlayClicked)

        // model-view transmission
        this.view.bindPlayTodo(this.handlePlayClicked)
        this.model.bindTodoListChanged(this.onTodoListChanged)
        this.view.bindAddTodo(this.handleAddTodo)
        this.view.bindEditTodo(this.handleEditTodo)
        this.view.bindDeleteTodo(this.handleDeleteTodo)

        // Display initial todos
        this.onTodoListChanged(this.model.todos)
    }

    onPlayClicked = () => {
        this.audio.changeAudio()
    }

    handlePlayClicked = id => {
        this.model.todoPlaySetup(id)
    }

    onTodoListChanged = todos => {
        this.view.displayTodos(todos)
    }

    handleAddTodo = todoText => {
        this.model.addTodo(todoText)
    }

    handleEditTodo = (id, todoText) => {
        this.model.editTodo(id, todoText)
    }

    handleDeleteTodo = id => {
        this.model.deleteTodo(id)
    }


}
