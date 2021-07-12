class View {

    static init(d) {
        const b = document.body
        this.ModeDisplay.init(d)
        this.Edit.init(d)
        this.TreeView.init(d)
        this.Summary.init(d)
        this.Move.init(d)
        this.Status.init(d)
        this.File.init(d)
    }

    static render(d) {
        View.TreeView.render(d)
        View.Summary.render(d)
        View.Status.render(d)
        View.Edit.render(d)
        View.Move.render(d)
    }


    static ModeDisplay = {
        init(d) {
            let e = document.createElement("div")
            e.id = "modeDisplayContainer"

                let h2 = document.createElement("h2")
                h2.textContent = "Mode"
                e.appendChild(h2)

                let div = document.createElement("div")
                div.id = "mode"
                div.textContent = `${d.interface.mode[0].toUpperCase() + d.interface.mode.slice(1)}`
                e.appendChild(div)

                document.body.appendChild(e)

                this.render(d)
        },

        render(d) {

        },
    }

    static ButtonItem(action) {
        let li = document.createElement('li')
        let button = document.createElement('button')
        li.id = action.id
        button.textContent = action.textContent
        li.style.display = action.isEnabled ? "" : "none"
        button.href = "#"
        li.appendChild(button)
        return li
    }

    static DescriptionListItem(item) {
        let dt = document.createElement('dt')
        dt.textContent = item.name
        let dd = document.createElement('dd')
        dd.id = item.id
        dd.textContent = item.value
        return [dt, dd]
    }

    static Edit = {
        init(d) {
            let e = document.createElement("div")
            e.classList.add("window")
            e.id = "edit"

                let editContainerLabel = document.createElement("h2")
                editContainerLabel.textContent = "Edit Nodes"
                editContainerLabel.id = "editContainerLabel"
            
                let insertMenu = document.createElement("ol")
                insertMenu.id = "insertMenu"
                insertMenu.setAttribute("aria-labelledby", "editContainerLabel")


                for (let a of d.view.actions.edit) {
                    insertMenu.appendChild(
                        View.ButtonItem(a)
                    )
                }

                e.appendChild(editContainerLabel)
                e.appendChild(insertMenu)

            document.body.appendChild(e)
        },

        render(d) {
            let e = document.getElementById("edit")
            for (let a of d.view.actions.edit) {
                let t = document.getElementById(a.id)
                t.firstElementChild.textContent = a.textContent
                t.style.display = a.isEnabled ? "" : "none"
            }
        }
    }

    static Move = {
        init(d) {
            let e = document.createElement("div")
            e.id = "move"
            e.classList.add("window")

                let h2 = document.createElement("h2")
                h2.textContent = "Move Cursor"
                h2.id = "moveMenuLabel"
                e.appendChild(h2)

                // let horizontalCategory = document.createElement('h3')
                // horizontalCategory.textContent = "Horizontally"
                // e.appendChild(horizontalCategory)

                let moveMenu = document.createElement('ol')
                moveMenu.setAttribute("aria-labelledby", "moveMenuLabel")
                moveMenu.id = 'moveMenu'

                for (let a of d.view.actions.move) {
                    moveMenu.appendChild(
                        View.ButtonItem(a)
                    )
                }

                e.appendChild(moveMenu)

                // let verticalCategory = document.createElement('h3')
                // verticalCategory.textContent = "Vertically"
                // e.appendChild(verticalCategory)

            document.body.appendChild(e)

        },

        render(d) {
            let insertMenu = document.getElementById("move")
            for (let a of d.view.actions.move) {
                let t = document.getElementById(a.id)
                t.firstElementChild.textContent = a.textContent
                t.style.display = a.isEnabled ? "" : "none"
            }
        }
    }

    static TreeView = {
        init(d) {
            let e = document.createElement("div")
            e.id = "treeContainer"
            e.classList.add("window")

                let panButton = document.createElement("div")
                panButton.id = "panButton"
                e.appendChild(panButton)

                let imgContainer = document.createElement("div")

            document.body.appendChild(e)
        },

        render(d) {
            let h = d.tree.head
            if (h === null) {
                document.getElementById("treeContainer").textContent = "This tree is empty."
            }
            else {

                function getNodeCoordinates(node) {
                    let depth = d.tree.getDepth(node)
                    let i = d.tree.getNodeIndex(node)

                    let width = 400
                    let s = {}
                    let maximumChildren = 2
                    // the cutoff for whether a node is on the left or right of the center line
                    let cutoff = (maximumChildren-1) / 2
                    // which side of the center line a node is one. 1 is right, -1 is left
                    let newI = i - cutoff
                    // the center line for the svg canvas
                    let xCenter = width/2 - diameter/2

                    s.x = Math.round(
                        xCenter + newI*depth*1.5*(diameter+margin)
                    )
                    s.y = depth*(diameter+margin)+diameter

                    return s
                }

                function drawCircle(node, svg) {
                    // compute pixel coordinates
                    let coord = getNodeCoordinates(node)
                    // draw circle
                    let c = document.createElementNS("http://www.w3.org/2000/svg", "circle")
                    c.setAttribute("class", "node")
                    c.id = node.name
                    c.setAttribute("cx", coord.x )
                    c.setAttribute("cy", coord.y )
                    c.setAttribute("r", diameter)
                    c.setAttribute("stroke", "darkblue")
                    if (node === d.interface.current) {
                        c.setAttribute("fill", "yellow")
                    }
                    else {
                        c.setAttribute("fill", "lightblue")
                    }
                    svg.appendChild(c)
                }

                function drawName(node, svg) {
                    // compute pixel coordinates
                    let coord = getNodeCoordinates(node)

                    // draw name of this node
                    let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
                    text.setAttribute("x", coord.x)
                    text.setAttribute("y", coord.y)
                    text.textContent = node.name
                    svg.appendChild(text)

                }

                function drawLine(node, svg) {
                    // compute pixel coordinates
                    let coord = getNodeCoordinates(node)
                    
                    // draw lines to each child
                    let children = d.tree.getChildren(node)
                    for (let child of children) {
                        let childCoord = getNodeCoordinates( child )
                        let l = document.createElementNS("http://www.w3.org/2000/svg", "line")
                        l.setAttribute( "x1", coord.x )
                        l.setAttribute( "y1", coord.y )
                        l.setAttribute( "x2", childCoord.x )
                        l.setAttribute( "y2", childCoord.y )
                        l.setAttribute( "stroke", "black" )
                        svg.appendChild(l)
                    }
                }

                // clear the "This tree is empty." placeholder
                document.getElementById("treeContainer").textContent = ""
                // set constants
                let diameter = 20
                let margin = 50

                // remove any previously-rendered tree
                document.getElementById("svg")?.remove()

                // create a new svg element to hold all the circles, lines, and text
                let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
                svg.id = "svg"
                // hide the image from screenreaders as the rest of our document contains the same information and is more accessible
                svg.setAttribute("aria-hidden", "true")

                // render in depth-first search order because why not :) (actually it's because I really don't want to rewrite this whole breadth-first algorithm and I already have a working depth-first one, can you tell how much I love life? PS I hope you're having fun looking at my code LOL s/o from Joseph 2021-07-11)

                let nodes = d.tree.getNodes()

                nodes.map(
                    n => drawLine(n, svg)
                )
                nodes.map(
                    n => drawCircle(n, svg)
                )
                nodes.map(
                    n => drawName(n, svg)
                )

                document.getElementById("treeContainer").appendChild(svg)

            }

        },

    }

    static TreeOptions(d) {
        let e = document.createElement("div")
    }

    static Summary = {
        init(d) {
            let e = document.createElement('div')
            e.id = "summaryContainer"
            e.setAttribute("aria-labelledby", "summaryLabel")
            e.className = "window"

                let summaryLabel = document.createElement("h2")
                summaryLabel.id = "summaryLabel"
                summaryLabel.textContent = "Summary"
                e.appendChild(summaryLabel)

                let summary = document.createElement('dl')
                summary.id = "summary"
                e.appendChild(summary)

            document.body.appendChild(e)
            
            for (let item of d.view.summary) {
                let descriptionListItem =  View.DescriptionListItem(item)
                for (let element of descriptionListItem) {
                    summary.appendChild(element)
                }
            }

            this.render(d)
        },
        render(d) {
            for (let item of d.view.summary) {
                document.getElementById(item.id).textContent = item.value
            }
        }
    }

    static Status =  {
        init(d) {
            let e = document.createElement("div")
            e.id = "statusContainer"
            e.setAttribute("aria-live", "polite")
            e.setAttribute("role", "alert")
            e.setAttribute("aria-labelledby", "statusLabel")

                let statusLabel = document.createElement("h2")
                statusLabel.id = "statusLabel"
                statusLabel.textContent = "Status"
                e.appendChild(statusLabel)
                
                let status = document.createElement("div")
                status.id = "status"
                e.appendChild(status)

            document.body.appendChild(e)
            this.render(d)
        },

        render(d) {
            let s = document.getElementById("status")
            if (d.tree.head) {

                s.textContent = `${d.interface.current.name}. Sibling ${d.view.nodeIndex+1} of ${d.view.nodeMaxIndex} at depth ${d.view.nodeDepth+1} of ${d.view.nodeMaxDepth+1}. ${d.view.numberOfChildren} children.`
            }
            else {
                // no head
                s.textContent = "Tree is empty."
            }
        },
    }

    static File = {

        init(d) {
            let e = document.createElement("div")
            e.id = "file"
            e.className = "window"

                let h2 = document.createElement("h2")
                h2.textContent = 'File'
                e.appendChild(h2)

                let save = document.createElement("button")
                save.id = "save"
                save.textContent = "Save Tree to File..."
                e.appendChild(save)

                let loadDummy = document.createElement("button")
                loadDummy.id = "loadDummy"
                loadDummy.textContent = "Load Tree from File..."
                e.appendChild(loadDummy)
                
                let load = document.createElement("input")
                load.type = "file"
                load.id = "load"
                load.style.display = "none"
                e.appendChild(load)

            document.body.appendChild(e)
        },

        render(d) {

        }

    }

}