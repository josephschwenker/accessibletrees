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
            },
        }
    }

    static tree = new Tree()

    static interface = {
        mode: "tree",
        current: null,
        nextNameIndex: 0,
    }

    static nodeNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    
    static getNextName() {
        return this.nodeNames[this.interface.nextNameIndex++]
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

    static canMoveDown() {
        return this.interface.current && !!this.tree.getFirstChild(this.interface.current)
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
            new SummaryItem("arity", "Arity", this.tree.maximumChildren),
            new SummaryItem("numberOfLeafNodes", "Number of Leaf Nodes", this.tree.numberOfLeafNodes() ),
            new SummaryItem("numberOfNonLeafNodes", "Number of Non-Leaf Nodes", this.tree.numberOfNonLeafNodes() ),
            new SummaryItem("treeDepth", "Tree Depth", this.tree.getTreeDepth() ),
        ]
    }

    static getActions() {
        class Action {
            constructor(id, textContent, isEnabled) {
                this.id = id
                this.textContent = textContent
                this.isEnabled = isEnabled
            }
        }

        return {
            edit: [
                new Action("asHead", "Add Head of Tree", !!!this.tree.head),
                new Action("asLeft", `Add Left Child of ${this.interface.current?.name}`, this.canAddLeftChild()),
                new Action("asRight", `Add Right Child ${this.interface.current?.name}`, this.canAddRightChild()),
                new Action("removeNode", `Remove ${this.interface.current?.name}`, !!this.interface.current),
                new Action("renameNode", `Rename ${this.interface.current?.name}`, !!this.interface.current)
            ],
            move: [
                new Action("moveUp", `Move to Parent of ${this.interface.current?.name}`, this.canMoveUp() ),
                new Action("moveDown", `Move to First Child of ${this.interface.current?.name}`, this.canMoveDown() ),
                new Action("moveLeft", `Move Left of ${this.interface.current?.name}`, this.canMoveLeft() ),
                new Action("moveRight", `Move Right of ${this.interface.current?.name}`, this.canMoveRight() ),
            ]
        }
    }

    static move(d) {
        if (d === "up") {
            if ( this.canMoveUp() ) {
                this.interface.current = this.tree.getParent(this.interface.current)
            }
        }
        else if (d === "down") {
            if ( this.canMoveDown() ) {
                this.interface.current = this.tree.getFirstChild(this.interface.current)
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
        this.interface.current = this.tree.addNode(null, this.getNextName(), 0) 
    }
    
    static addNodeNthChild(n) {
        this.tree.addNode(this.interface.current, this.getNextName(), n)
    }
    
    static addNodeLeftChild() {
        this.addNodeNthChild(0)
    }

    static addNodeRightChild() {
        this.addNodeNthChild(1)
    }

    static export() {
        return JSON.stringify( this.getData() )
    }

    static import(json) {
        // rebuild the tree
        let jsonTree = json.tree
        let newTree = new Tree
        // add the head
        newTree.addNode(null, jsonTree.head.name, 0)
        

        // load interface settings
        
    }    

}