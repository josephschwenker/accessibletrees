class Controller {

    static init(e) {
        View.init( Model.getData() )
        // bind events after page has loaded and document has been init'd
        Controller.bindEvents(e)
        View.TreeView.render( Model.getData() )
    }

    static bindEvents(e) {
        document.getElementById("asHead").addEventListener("click", Controller.addNodeHead)
        document.getElementById("asLeft").addEventListener("click", Controller.addNodeLeftChild)
        document.getElementById("asRight").addEventListener("click", Controller.addNodeRightChild)
        document.getElementById("moveUp").addEventListener("click", Controller.moveUp)
        document.getElementById("moveDown").addEventListener("click", Controller.moveDown)
        document.getElementById("moveLeft").addEventListener("click", Controller.moveLeft)
        document.getElementById("moveRight").addEventListener("click", Controller.moveRight)
        document.getElementById("save").addEventListener('click', Controller.save)
        document.getElementById("loadDummy").addEventListener('click', Controller.load)
        document.getElementById("load").addEventListener('change', Controller.upload)
    }

    static moveLeft(e) {
        Model.move("left")
        View.render( Model.getData() )
        e.preventDefault()
        console.log(Model.tree)
    }

    static moveRight(e) {
        Model.move("right")
        View.render( Model.getData() )
        e.preventDefault()
        console.log(Model.tree)
    }

    static moveDown(e) {
        Model.move("down")
        View.render( Model.getData() )
        e.preventDefault()
        console.log(Model.tree)
    }

    static moveUp(e) {
        Model.move("up")
        View.render( Model.getData() )
        e.preventDefault()
        console.log(Model.tree)
    }

    static addNodeHead(e) {
        Model.addNodeHead()
        View.render( Model.getData() )
        e.preventDefault()
        console.log(Model.tree)
    }

    static addNodeLeftChild(e) {
        Model.addNodeLeftChild()
        View.render( Model.getData() )
        e.preventDefault()
        console.log(Model.tree)
    }

    static addNodeRightChild(e) {
        Model.addNodeRightChild()
        View.render( Model.getData() )
        e.preventDefault()
        console.log(Model.tree)
    }

    static save(e) {
        let data = "data:text/json;charset=utf-8," + encodeURIComponent( Model.export() )
        let a = document.createElement("a")
        a.setAttribute("href", data)
        a.setAttribute("download", `Tree (${new Date()}).json`)
        a.click()
    }

    static load(e) {
        document.getElementById("load").click()
    }

    static upload(e) {
        const reader = new FileReader()
        reader.onload = Controller.readFile
        reader.readAsText( e.target.files[0] )
    }

    static readFile(e) {
        Model.import( JSON.parse(e.target.result) )
        View.render( Model.getData() )
    }

}

window.addEventListener("load", Controller.init)