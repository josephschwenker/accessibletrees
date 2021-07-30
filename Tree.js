class Tree {
    constructor() {
        this.arity = 3
        this.head = null
        return this
    }

    static MAX_DEPTH = 100

    // return all nodes in depth-first search order
    getNodes(parent) {
        if (!parent) {
            if (this.head) {
                return this.getNodes(this.head)
            }
            else {
                return []
            }
        }
        else {
            let nodes = [parent]
            for ( let c of this.getChildren(parent) ) {
                nodes = nodes.concat( this.getNodes(c) )
            }
            return nodes
        }
    }

    getNodesBfs() {
        let r = []
        let max = 999
        if ( this.head ) {
            let q = [this.head]
            while (q.length && max--) {
                let c = q.shift()
                r.push(c)
                q = q.concat( this.getChildren(c) )
            }
        }
        return r
    }

    getNodeByName(name) {
        return this.getNodes(this.head).find(
            node => node.name === name
        )
    }

    renameNode(node, newName) {
        const nodeWithSameName = this.getNodeByName(newName)
        if (nodeWithSameName === undefined && node) {
            // this new name is unique
            node.name = newName
            return true
        }
        else if (nodeWithSameName === node) {
            // we are renaming the node to its old name
            return true
        }
        else if (nodeWithSameName !== node) {
            // there is already another node other than this one with the new name
            return false
        }
    }

    removeNode(node) {
        const parent = this.getParent(node)
        if (parent) {
            parent.children[ parent.children.indexOf(node) ] = undefined
        }
        else if ( node === this.head ) {
            this.head = null
        }
        else {
            throw new Error("Cannot delete node not in this tree")
        }
        
    }

    numberOfNodes() {
        return this.getNodes().length
    }

    numberOfLeafNodes() {
        return this.getNodes().filter(
            node => this.getChildren(node).length === 0
        ).length
    }

    numberOfNonLeafNodes() {
        return this.getNodes().filter(
            node => this.getChildren(node).length
        ).length
    }

    getParent(n) {
        if (n === this.head) {
            return null
        }
        else {
            let nodes = this.getNodes()
            let result = nodes.filter(
                node => this.getChildren(node).includes(n)
            )
            if (result.length === 1) {
                return result[0]
            }
            else {
                console.error(n)
                throw new Error("Non-head node has no parent")
            }
        }
    }

    // get non-undefined children of node n
    getChildren(n) {
        if (n) {
            return n.children.filter(
                child => Boolean( child )
            )
        }
        else {
            return []
        }
    }

    numberOfChildren(n) {
        if (n && n.children.length) {
            return this.getChildren(n).length
        }
        else {
            return 0
        }
    }

    getSibling(n, direction) {
        // get parent
        let p = this.getParent(n)
        if (p) {
            let s = this.siblings(n)
            let i = s.indexOf(n)
            if ( i+direction < s.length && i+direction >= 0 ) {
                return s[i+direction]
            }
            else {
                throw new Error("Tried to get sibling out of bounds")
            }
        }
        else {
            throw new Error("Node has no siblings")
        }
    }

    siblings(n) {
        let p = this.getParent(n)
        if (p && p.children.length) {
            return p.children.filter(
                child => child
            )
        }
        else {
            return []
        }
    }

    numberOfSiblings(n) {
        return this.siblings(n).length
    }

    getLeftSibling(n) {
        return this.getSibling(n, -1)
    }

    getRightSibling(n) {
        return this.getSibling(n, 1)
    }

    getFirstChild(n) {
        if (n) {
            return n.children.find(
                c => !!c
            )
        }
        else {
            throw new Error("Node has no children")
        }
    }

    getLastChild(n) {
        if (n) {
            return n.children.slice().reverse().find(
                c => !!c
            )
        }
        else {
            throw new Error("Node has no children")
        }
    }

    // get the horizontal position of this node, excluding any empty spaces
    getNodeIndex(n) {
        if ( n === this.head ) {
            // this is the head
            return 0
        }
        else {
            let s = this.siblings(n)
            if (s.length) {
                return s.indexOf(n)
            }
            else {
                throw new Error("Could not get node index")
            }
        }
    }

    // get the horizontal position of this node, including any blank spaces
    getNodeIndexIncludeBlanks(n) {
        if ( n === this.head ) {
            // this is the head
            return 0
        }
        else {
            let s = this.getParent(n).children
            if (s.length) {
                return s.indexOf(n)
            }
            else {
                throw new Error("Could not get node index")
            }
        }
    }

    // get the total number of non-undefined nodes in this node's row
    getMaxNodeIndex(n) {
        // check if this is the head
        if (this.head === n) {
            return 1
        }
        else {
            // get the parent
            return this.numberOfSiblings(n)
        }
    }

    // get this node's depth in the tree. the head always has a depth of 0
    getDepth(n) {
        return this.getDepthHelper(this.head, n)
    }

    getDepthHelper(examining, target) {
        // base case: this is the node we are searching for
        if (examining === target) {
            return 0
        }
        else {
            // recursive case: this node is not our target, so examine each child to see if it is our target node
            let children = this.getChildren(examining)
            for (let c of children) {
                let depth = this.getDepthHelper(c, target)
                if (depth !== -1) {
                    return 1+depth
                }
            }
            // did not find the child among these siblings, so return -1
            return -1
        }
    }
    
    getTreeDepth() {
        let d = 0
        if (!this.head) {
            return d
        }
        else {
            return this.getTreeDepthHelper(d, this.head)
        }
    }
    
    getTreeDepthHelper(d, n) {
        let children = this.getChildren(n)
        
        if ( children.length ) {
            // recursive case: this node has children, so get the depth recursively for each
            let childDepths = []
            for (let c of children) {
                childDepths.push( this.getTreeDepthHelper(d, c)+1 )
            }
            return Math.max(...childDepths)
        }

        else {
            // base case: this node has no children, so return a depth of 0
            return 0
        }
    }

    addNode(parent, name, position) {
        // check if there is already a node at this position
        if ( parent && parent.children[position] ) {
            throw new Error("Cannot add new node in a non-empty position")
        }
        else {
            const n = new TreeNode(name, this.arity)
            if (this.head === null) {
                this.head = n
            }
            else {
                parent.children[position] = n
            }
            return n
        }
    }

}