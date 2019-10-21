/**
 * @class Connector
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Connector {
    constructor(model, view, audio) {
        this.model = model
        this.view = view
        this.audio = audio

        // audio -> model transmission
        this.audio.bindChangeNowPlaying(this.handleAutoChangeNowPlaying)
        // model -> audio transmission
        this.model.bindAudioChanged(this.onPlayClicked)

        // view -> model transmission
        this.view.bindChangePlayMode(this.handleChangePlayMode)
        this.view.bindPlayTodo(this.handlePlayClicked)
        this.view.bindAddTodo(this.handleAddTodo)
        this.view.bindEditTodo(this.handleEditTodo)
        this.view.bindDeleteTodo(this.handleDeleteTodo)
        // model -> view transmission
        this.model.bindTodoListChanged(this.onTodoListChanged)
        this.model.bindPlayModeChanged(this.onPlayModeChanged)

        // Display initial model values
        this.onTodoListChanged(this.model.todos)
        this.onPlayModeChanged(this.model.playMode)

    }

    handleChangePlayMode = () => {
        this.model.setPlayMode()
    }

    handleAutoChangeNowPlaying = () => {
        this.model.autoChangeNowPlaying()
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

    onPlayModeChanged = playMode => {
        this.view.updatePlayModeInfo(playMode)
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
