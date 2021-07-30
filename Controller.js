class Controller {

    static init(e) {
        View.init( Model.getData() )
        // bind events after page has loaded and document has been init'd
        Controller.bindEvents(e)
        View.TreeView.render( Model.getData() )
    }

    static bindEvents(e) {
        document.getElementById("asHead").addEventListener("click", Controller.addNodeHead)
        Controller.bindArityEvents(e)
        document.getElementById("removeNode").addEventListener("click", Controller.removeNode)
        document.getElementById("renameNode").addEventListener("click", Controller.renameNode)
        document.getElementById("moveUp").addEventListener("click", Controller.moveUp)
        document.getElementById("moveFirstChild").addEventListener("click", Controller.moveFirstChild)
        document.getElementById("moveLastChild").addEventListener("click", Controller.moveLastChild)
        document.getElementById("moveLeft").addEventListener("click", Controller.moveLeft)
        document.getElementById("moveRight").addEventListener("click", Controller.moveRight)
        document.getElementById('arity').addEventListener('change', Controller.changeArity)
        document.getElementById("save").addEventListener('click', Controller.save)
        document.getElementById('svg').addEventListener('click', Controller.selectNode)
        document.getElementById("loadDummy").addEventListener('click', Controller.load)
        document.getElementById("load").addEventListener('change', Controller.upload)
        document.getElementById("exportSvg").addEventListener('click', Controller.exportSvg)
        document.getElementById("exportPng").addEventListener('click', Controller.exportPng)
        document.getElementById("exportHtml").addEventListener('click', Controller.exportHtml)
        document.body.addEventListener('keydown', Controller.keydown)
    }

    static keydown(e) {
        // get all keyboard shortcuts
        const d = Model.getData()
        let actions = []
        for (let a in d.view.actions) {
            actions.push( d.view.actions[a] )
        }
        actions = actions.flat()
        
        // find the action with this keyboard shortcut, if any
        const target = actions.find(
            a => {
                for (let p in a.shortcut) {
                    if ( a.shortcut[p] !== e[p] )
                    return false
                }
                return true
            }
        )
        if (target) {
            document.getElementById(target.id).click()
        }

    }

    static bindArityEvents(e) {
        const d = Model.getData()
        if ( d.tree.arity === 2 ) {
            document.getElementById("asLeft").addEventListener("click", Controller.addNodeLeftChild)
            document.getElementById("asRight").addEventListener("click", Controller.addNodeRightChild)
        }
        else {
            for (let i=0; i<d.tree.arity; i++) {
                document.getElementById(`as${Model.numberSuffix(i)}`).addEventListener(
                    "click",
                    Controller.addNodeNthChild(i)
                )
            }
        }
    }

    // function factory
    static addNodeNthChild(i) {
        return function(e) {
            Model.addNodeNthChild(i)
            View.render( Model.getData() )
            e.preventDefault()
        }
    }

    static changeArity(e) {
        const newArity = Number(e.target.value)
        Model.changeArity(newArity)
        View.render( Model.getData() )
    }

    static selectNode(e) {
        // filter the path by classname
        const target = e.path.find(
            element => element.classList?.contains("node")
        )
        if (target) {
            Model.interface.current = Model.tree.getNodeByName( target.getAttribute("data-name") )
            View.render( Model.getData() )
            e.preventDefault()
        }
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

    static moveFirstChild(e) {
        Model.move("firstChild")
        View.render( Model.getData() )
        e.preventDefault()
    }

    static moveLastChild(e) {
        Model.move("lastChild")
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

    static removeNode(e) {
        Model.removeNode()
        View.render( Model.getData() )
        e.preventDefault()
    }

    static renameNode(e) {
        const d = Model.getData()
        const maxLength = 2
        if (d.interface.current) {
            const newName = window.prompt(`New name for node ${d.interface.current.name}`, d.interface.current.name)
            if (newName === "") {
                window.alert("Cannot set this node's name to a blank name.")
            }
            else if (newName.length > maxLength) {
                window.alert(`Cannot give this node a name longer than ${maxLength} characters.`)
            }
            else {
                const response = Model.renameNode(newName)
                if (!response) {
                    // node name did not update
                    window.alert(`Could not set this node's name to "${newName}", which is already in use.`)
                }
            }
            View.render( Model.getData() )
        }
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
        try {
            reader.readAsText( e.target.files[0] )
        }
        catch (e) {
            // do nothing, the user clicked "cancel" on the upload dialog
        }
    }

    static readFile(e) {
        try {
            Model.import( JSON.parse(e.target.result) )
        }
        catch (e) {
            window.alert("This file cannot be loaded because its tree is missing a head.")
        }
        View.render( Model.getData() )
    }

    static exportSvg(e) {
        const data = View.exportSvg()
        Controller.download(data, `Tree (${new Date()}).svg`)
    }

    // this function adapted from https://stackoverflow.com/questions/28226677/save-inline-svg-as-jpeg-png-svg
    static exportPng(e) {
        console.log("Exporting...")
        const svg = document.getElementById('svg')
        const canvas = document.getElementById('canvas')
        canvas.width = Math.ceil( svg.getBoundingClientRect().width )
        canvas.height = Math.ceil( svg.getBoundingClientRect().height )
        const c = canvas.getContext('2d')
        
        const serializer = new XMLSerializer()
        const data = serializer.serializeToString(svg)
        const blob = new Blob( [data], {type: 'image/svg+xml'} )
        const img = new Image()
        const url = URL.createObjectURL(blob)
        console.log(url)
        img.src = url

        console.log("lol")

        c.drawImage(url, 0, 0)

        const file =  canvas
            .toDataURL('image/png')
            .replace('img/png', 'image/octet-stream')

        Controller.download(file)
    }

    static exportHtml(e) {
        const html = Model.exportHtml()
        Controller.download(html, `Tree (${new Date()}).html`)
    }

}

window.addEventListener("load", Controller.init)