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
        this.model.bindAudioChanged(this.onAudioChanged)

        // view -> model transmission
        this.view.bindChangePlayMode(this.handleChangePlayMode)
        this.view.bindAddTodo(this.handleAddTodo)
        this.view.bindPlayTodo(this.handlePlayClicked)
        this.view.bindDeleteTodo(this.handleDeleteTodo)
        this.view.bindEditTodo(this.handleEditTodo)
        // model -> view transmission
        this.model.bindPlayModeChanged(this.onPlayModeChanged)
        this.model.bindTodoListChanged(this.onTodoListChanged)

        // Display initial model values
        this.onPlayModeChanged(this.model.playMode)
        this.onTodoListChanged(this.model.todos)

    }


    // audio <-> model transmission
    handleAutoChangeNowPlaying = () => {
        this.model.autoChangeNowPlaying()
    }

    onAudioChanged = () => {
        this.audio.changeAudio()
    }


    // view <-> model transmission
    handleChangePlayMode = () => {
        this.model.setPlayMode()
    }

    handleAddTodo = todoText => {
        this.model.addTodo(todoText)
    }

    handlePlayClicked = id => {
        this.model.todoPlaySetup(id)
    }

    handleDeleteTodo = id => {
        this.model.deleteTodo(id)
    }

    handleEditTodo = (id, todoText) => {
        this.model.editTodo(id, todoText)
    }

    onPlayModeChanged = playMode => {
        this.view.updatePlayModeInfo(playMode)
    }

    onTodoListChanged = todos => {
        this.view.displayTodos(todos)
    }

}
