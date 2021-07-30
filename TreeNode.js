class TreeNode {
    constructor(name, arity) {
        this.name = name
        this.children = Array(arity)
        return this
    }
}