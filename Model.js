class Model {

    static getData() {
        return {
            tree: this.tree,
            interface: this.interface,
            view: {
                nodeIndex: this.tree.getNodeIndex(this.interface.current),
                nodeMaxIndex: this.tree.getMaxNodeIndex(this.interface.current),
                nodeDepth: this.tree.getDepth(this.interface.current),
                nodeMaxDepth: this.tree.getTreeDepth(),
                numberOfChildren: this.tree.numberOfChildren(this.interface.current),
                actions: this.getActions(),
                summary: this.getSummary(),
                title: this.getTitle(),
                description: this.getDesc(),
            },
        }
    }

    static tree = new Tree()

    static interface = {
        current: null,
        nextNameIndex: 0,
    }

    static nodeNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

    static getNextName() {
        const quotient = Math.floor( this.interface.nextNameIndex / this.nodeNames.length )
        const remainder = this.interface.nextNameIndex % this.nodeNames.length
        this.interface.nextNameIndex++
        if ( quotient < 1 ) {
            return this.nodeNames[remainder]
        }
        else {
            return `${this.nodeNames[quotient-1]}${this.nodeNames[remainder]}`
        }
    }

    static canMoveLeft() {
        return !!this.interface.current && this.tree.getNodeIndex(this.interface.current) > 0
    }

    static canMoveRight() {
        return !!this.interface.current && this.tree.getNodeIndex(this.interface.current) < this.tree.numberOfSiblings(this.interface.current)-1
    }

    static canMoveUp() {
        return !(this.interface.current === this.tree.head)
    }

    static canMoveNthChild(n) {
        return this.interface.current && this.interface.current.children[n]
    }

    static canMoveFirstChild() {
        return this.interface.current && this.tree.getFirstChild(this.interface.current)
    }

    static canMoveLastChild() {
        return this.interface.current && this.tree.getLastChild(this.interface.current)
    }

    static canAddLeftChild() {
        return this.canAddChild(0)
    }

    static canAddRightChild() {
        return this.canAddChild(1)
    }

    static canAddChild(index) {
        return Boolean( this.interface.current && !this.interface.current.children[index] )
    }

    static getSummary() {
        class SummaryItem {
            constructor(id, name, value) {
                this.id = id
                this.name = name
                this.value = value
            }
        }

        return [
            new SummaryItem("numberOfNodes", "Number of Nodes", this.tree.numberOfNodes()),
            new SummaryItem("arity", "Arity", this.tree.arity),
            new SummaryItem("numberOfLeafNodes", "Number of Leaf Nodes", this.tree.numberOfLeafNodes() ),
            new SummaryItem("numberOfNonLeafNodes", "Number of Non-Leaf Nodes", this.tree.numberOfNonLeafNodes() ),
            new SummaryItem("treeDepth", "Tree Depth", this.tree.getTreeDepth() ),
        ]
    }

    static numberSuffix(number) {
        const suffixes = [
            'th',
            'st',
            'nd',
            'rd',
            'th',
            'th',
            'th',
            'th',
            'th',
            'th',
        ]
        return number + suffixes[ number % 10 ]
    }


    static getActions() {
        class Action {
            constructor(id, textContent, isEnabled, shortcut) {
                this.id = id
                this.textContent = textContent
                this.isEnabled = isEnabled
                this.shortcut = shortcut
                this.shortcutName = Action.translateShortcut(shortcut)
            }
            static translateShortcut(shortcut) {
                if (shortcut) {
                    let key
                    if (shortcut.code.substr(0, 3) === "Key" || shortcut.code.substr(0, 5) === "Digit") {
                        key = shortcut.code.substr(-1)
                    }
                    else if (shortcut.code.substr(0, 5) === "Arrow") {
                        key = shortcut.code.split("Arrow")[1]
                    }
                    return `${shortcut.shiftKey ? "Shift+" : ""}${key}`
                }
                else {
                    return ""
                }
            }
        }

        let add = [
            new Action("asHead", "Head to Tree", !!!this.tree.head, {shiftKey: true, code: "KeyH"}),
        ]

        if (this.tree.arity===2) {
            add = add.concat(
                [
                    new Action("asLeft", `Left Child`, this.canAddLeftChild(), {shiftKey: true, code: "Digit1"}),
                    new Action("asRight", `Right Child`, this.canAddRightChild(),{shiftKey: true, code: "Digit2"}),
                ]
            )
        }
        else if (this.tree.arity === 1 || this.tree.arity > 2) {
            for (let i=0; i<this.tree.arity; i++) {
                add.push(
                    new Action(
                        `as${Model.numberSuffix(i)}`,
                        `As ${Model.numberSuffix(i+1)} Child`,
                        this.canAddChild(i),
                        {shiftKey: true, code: `Digit${i+1}`}
                    )
                )
            }
        }
        else {
            throw new Error("Invalid arity")
        }

        return {
            add: add,
            edit: [
                new Action("removeNode", `Remove`, !!this.interface.current, {shiftKey: true, code: "KeyD"}),
                new Action("renameNode", `Rename`, !!this.interface.current, {shiftKey: true, code: "KeyN"}),
            ],
            move: [
                new Action("moveUp", `Parent`, this.canMoveUp(), {shiftKey: false, code: "ArrowUp"} ),
                new Action("moveFirstChild", "To First Child", this.canMoveFirstChild(), {shiftKey: false, code: "ArrowDown"} ),
                new Action("moveLastChild", "To Last Child", this.canMoveLastChild(), {shiftKey: true, code: "ArrowDown"} ),
                new Action("moveLeft", `Left Sibling`, this.canMoveLeft(), {shiftKey: false, code: "ArrowLeft"} ),
                new Action("moveRight", `Right Sibling`, this.canMoveRight(), {shiftKey: false, code: "ArrowRight"} ),
            ],
            saveLoad: [
                new Action("save", "Save Tree to File", true, {shiftKey: true, code: "KeyS"}),
                new Action("loadDummy", "Load Tree from File...", true, {shiftKey: true, code: "KeyO"}),
            ],
            export: [
                new Action("exportSvg", "Export Tree as SVG", true, {shiftKey: true, code: "KeyV"}),
                new Action("exportPng", "Export Tree as PNG", true, {shiftKey: true, code: "KeyP"}),
                new Action("exportHtml", "Export Tree as HTML", true, {shiftKey: true, code: "KeyW"}),
            ]
        }
    }

    static changeArity(arity) {
        // before we start, cry
        this.tree.arity = arity
    }

    static move(d) {
        if (d === "up") {
            if ( this.canMoveUp() ) {
                this.interface.current = this.tree.getParent(this.interface.current)
            }
        }
        else if (d === "firstChild") {
            if ( this.canMoveFirstChild() ) {
                this.interface.current = this.tree.getFirstChild(this.interface.current)
            }
        }
        else if (d === "lastChild") {
            if ( this.canMoveLastChild() ) {
                this.interface.current = this.tree.getLastChild(this.interface.current)
            }
        }
        else if (d === "left") {
            if ( this.canMoveLeft() ) {
                this.interface.current = this.tree.getLeftSibling(this.interface.current)
            }
        }
        else if ( d === "right" ) {
            if ( this.canMoveRight() ) {
                this.interface.current = this.tree.getRightSibling(this.interface.current)
            }
        }
        else {
            throw new Error("Invalid move")
        }
    }
    
    static addNodeHead() {
        if ( !this.tree.head ) {
            this.interface.current = this.tree.addNode(null, this.getNextName(), 0) 
        }
    }
    
    static addNodeNthChild(n) {
        this.tree.addNode(this.interface.current, this.getNextName(), n)
    }
    
    static addNodeLeftChild() {
        if ( this.canAddLeftChild() ) {
            this.addNodeNthChild(0)
        }
    }

    static addNodeRightChild() {
        if ( this.canAddRightChild() ) {
            this.addNodeNthChild(1)
        }
    }

    static renameNode(name) {
        if (this.interface.current) {
            if (name !== "") {
                return this.tree.renameNode(this.interface.current, name)
            }
        }
    }

    static removeNode() {
        if (this.interface.current) {
            const oldCurrent = this.interface.current
            const parent = this.tree.getParent(oldCurrent)
            if (parent) {
                this.interface.current = parent
            }
            else if (!parent && this.tree.head === oldCurrent) {
                this.interface.current = null
            }
            else {
                throw new Error("Cannot remove node")
            }
            this.tree.removeNode(oldCurrent)
        }
    }

    static getTitle() {
        const numberOfNodes = this.tree.numberOfNodes()
        const arity = this.tree.arity
        const numberOfLeafNodes = this.tree.numberOfLeafNodes()
        const numberOfNonLeafNodes = this.tree.numberOfNonLeafNodes()
        const treeDepth = this.tree.getTreeDepth()
        
        if (numberOfNodes === 0) {
            return `An empty computer science tree data structure with arity ${arity} represented as a hierarchical diagram with circles for nodes and lines for edges.`
        }
        else {
            return `A computer science tree data structure represented as a hierarchical diagram with circles for nodes and lines for edges. The tree has arity ${arity} and depth ${treeDepth}. There are ${numberOfNodes} nodes, ${numberOfLeafNodes} of which are leaf nodes and ${numberOfNonLeafNodes} of which are non-leaf nodes.`
        }
    }

    static getDesc() {
        return this.tree.getNodesBfs()
        .map(
            node => {
                let string = ""
                if (this.tree.head === node) {
                    string = `Head: ${node.name}. `
                }
                const children = this.tree.getChildren(node)
                let childrenString
                if (children.length) {
                    childrenString = this.tree.getChildren(node)
                    .map(
                        (child, index) => `child ${index+1} is ${child.name}`
                    )
                    .join(", ")
                    string += `${node.name} has ${children.length} children: ${childrenString}.`
                }
                else {
                    string += `${node.name} has no children.`
                }
                return string
            }
        )
        .join(" ")
    }

    static export() {
        return JSON.stringify( this.getData() )
    }

    static exportHtml() {
        function generateList(parent) {
            if (!parent) {
                const ul = document.createElement('ol')
                if (Model.tree.head) {
                    const li = document.createElement('li')
                        li.textContent = Model.tree.head.name
                        li.appendChild( generateList(Model.tree.head) )
                    ul.appendChild(li)
                }
                return ul
            }
            else {
                const ul = document.createElement('ol')
                for ( let c of parent.children ) {
                    const li = document.createElement('li')
                    if (c) {
                        li.textContent = c.name
                        // only generate a sublist if there is at least one child that is not undefined
                        if ( c.children.filter( node => node ).length ) {
                            li.appendChild(
                                generateList(c)
                            )
                        }
                    }
                    else {
                        li.textContent = "no node"
                    }
                    ul.appendChild(li)
                }
                return ul
            }
        }

        const html = document.createElement("html")
        html.setAttribute("lang", "en")
            const head = document.createElement("head")
                const title = document.createElement("title")
                title.textContent = this.getTitle()
                head.appendChild(title)

                const meta = document.createElement("meta")
                meta.setAttribute("charset", "utf-8")
                head.appendChild(meta)

                // const style = document.createElement("style")
                // style.textContent = `
                //     li {
                //         list-style: none;
                //     }
                // `
                // head.appendChild(style)
            html.appendChild(head)

            const body = document.createElement("body")
                const h1 = document.createElement("h1")
                    h1.textContent = "Tree"
                    body.appendChild(h1)
                body.appendChild( generateList() )
                
                const shortLabel = document.createElement('h1')
                shortLabel.id = "shortLabel"
                shortLabel.textContent = "Short Description of Tree"
                body.appendChild(shortLabel)

                const short = document.createElement('p')
                short.setAttribute("aria-labelledby", "shortLabel")
                short.textContent = this.getTitle()
                body.appendChild(short)

                const longLabel = document.createElement('h1')
                longLabel.id = "longLabel"
                longLabel.textContent = "Long Description of Tree"
                body.appendChild(longLabel)

                const long = document.createElement('p')
                long.setAttribute("aria-labelledby", "longLabel")
                long.textContent = this.getDesc()
                body.appendChild(long)

        html.appendChild(body)

        const serializer = new XMLSerializer()
        const escaped = serializer.serializeToString(html)
        const prefix = "data:text/html;charset=utf-8,"
        return prefix + encodeURIComponent(escaped)
    }

    static import(json) {
        function buildTree(jsonHead, jsonParent, treeParent) {
            if (!jsonParent && !treeParent) {
                // this is a new tree, add the head
                Model.tree.head = Model.tree.addNode(null, jsonHead.name, 0)
                // recurse
                buildTree(jsonHead, jsonHead, Model.tree.head)
            }
            else {
                const children = jsonParent.children.filter(
                    item => !!item
                )
                for ( let jsonChild of children ) {
                    const treeChild = Model.tree.addNode(
                        treeParent,
                        jsonChild.name,
                        jsonParent.children.indexOf(jsonChild)
                    )
                    buildTree(jsonHead, jsonChild, treeChild)
                }
            }
        }

        // check if there is a tree in this file
        if ( json.tree.head ) {
            // load interface settings
    
            // delete the current tree
            delete this.tree
            // rebuild the tree
            this.tree = new Tree()
            buildTree(json.tree.head, null, null)       
            
            // set the cursor
            this.interface.current = this.tree.getNodeByName(json.interface.current.name)
        }
        else {
            throw new Error("Invalid file")
        }
        
    }

}