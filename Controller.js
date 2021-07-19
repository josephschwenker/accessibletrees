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
        document.getElementById("exportSvg").addEventListener('click', Controller.exportSvg)
    }

    static moveLeft(e) {
        Model.move("left")
        View.render( Model.getData() )
        e.preventDefault()
    }

    static moveRight(e) {
        Model.move("right")
        View.render( Model.getData() )
        e.preventDefault()
    }

    static moveDown(e) {
        Model.move("down")
        View.render( Model.getData() )
        e.preventDefault()
    }

    static moveUp(e) {
        Model.move("up")
        View.render( Model.getData() )
        e.preventDefault()
    }

    static addNodeHead(e) {
        Model.addNodeHead()
        View.render( Model.getData() )
        e.preventDefault()
    }

    static addNodeLeftChild(e) {
        Model.addNodeLeftChild()
        View.render( Model.getData() )
        e.preventDefault()
    }

    static addNodeRightChild(e) {
        Model.addNodeRightChild()
        View.render( Model.getData() )
        e.preventDefault()
    }

    static download(data, filename) {
        const a = document.createElement("a")
        a.setAttribute("href", data)
        a.setAttribute("download", filename)
        a.click()
    }

    static save(e) {
        let data = "data:text/json;charset=utf-8," + encodeURIComponent( Model.export() )
        Controller.download(data, `Tree (${new Date()}).json`)
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

    static exportSvg(e) {
        const data = View.exportSvg()
        Controller.download(data, `Tree (${new Date()}).svg`)
    }

}

window.addEventListener("load", Controller.init)