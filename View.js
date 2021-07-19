class View {

    static init(d) {
        const b = document.body
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
        View.File.render(d)
    }

    static getTitle(d) {
        return `Computer science tree`
    }

    static getDesc(d) {
        const numberOfNodes = d.view.summary.find( item => item.id === "numberOfNodes").value
        const arity = d.view.summary.find( item => item.id === "arity").value
        const numberOfLeafNodes = d.view.summary.find( item => item.id === "numberOfLeafNodes").value
        const numberOfNonLeafNodes = d.view.summary.find( item => item.id === "numberOfNonLeafNodes").value
        const treeDepth = d.view.summary.find( item => item.id === "treeDepth").value

        if (numberOfNodes === 0) {
            return `An empty computer science tree data structure represented as a hierarchical diagram with circles for nodes and lines for edges.`
        }
        else {
            return `A computer science tree data structure represented as a hierarchical diagram with circles for nodes and lines for edges. The tree has arity ${arity} and depth ${treeDepth}. There are ${numberOfNodes} nodes, ${numberOfLeafNodes} of which are leaf nodes and ${numberOfNonLeafNodes} of which are non-leaf nodes.`
        }
    }

    static exportSvg(d) {
        const svg = document.getElementById('svg')
        const serializer = new XMLSerializer()
        const escaped = serializer.serializeToString(svg)
        const prefix = "data:image/svg+xml;charset=utf-8,"
        return prefix + encodeURIComponent(escaped)
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

    static TableRow(item) {
        let tr = document.createElement('tr')
            let th = document.createElement('th')
            th.textContent = item.name
            let td = document.createElement('td')
            td.id = item.id
            td.textContent = item.value
        tr.appendChild(th)
        tr.appendChild(td)
        return tr
    }

    static Edit = {
        init(d) {
            let e = document.createElement("div")
            e.classList.add("window")
            e.id = "edit"

                let editContainerLabel = document.createElement("h1")
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

                let h1 = document.createElement("h1")
                h1.textContent = "Move Cursor"
                h1.id = "moveMenuLabel"
                e.appendChild(h1)

                // let horizontalCategory = document.createElement('h2')
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

                // let verticalCategory = document.createElement('h2')
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

            this.render(d)
        },

        render(d) {

            // set constants
            const diameter = 20
            // minimum margin
            const margin = 50
            
            const h = d.tree.head

            // this function has a super duper inefficient upper bound on running time lolol
            function getNodeCoordinates(node) {
                const depth = d.tree.getDepth(node)
                const i = d.tree.getNodeIndexIncludeBlanks(node)

                const width = 500
                // miimum spread
                let s = {}
                const maximumChildren = 2

                // base case: this is the head
                if (depth === 0) {
                    s.x = Math.round(
                        width/2
                    )
                    s.y = Math.round(
                        0 + diameter
                    )
                    return s
                }
                // recursive case: not the head
                else {
                    // calculate position from the parent's coordinates
                    const p = getNodeCoordinates( d.tree.getParent(node) )
                    const maxDepth = d.tree.getTreeDepth()
                    const depth = d.tree.getDepth(node)
                    const depthMult = maxDepth - depth + 1
                    const spread = margin * (maximumChildren-1) * Math.pow(maximumChildren, depthMult)
                    const step = spread/(maximumChildren-1)
                    // console.log("depthMult: ", depthMult)
                    // console.log("depth: ", depth)
                    // console.log("spread: ", spread)
                    // console.log("p: ", p)
                    // console.log("i: ", i)
                    // console.log("step: ", step)
                    // console.log("diameter: ", diameter)
                    s.x = Math.round(
                        p.x + i*step - spread/2
                    )
                    s.y = Math.round(
                        depth*(diameter+margin)+diameter/2
                    )
                    // let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                    // rect.setAttribute("x", p.x + 0*step - spread/2)
                    // rect.setAttribute("y", depth*(diameter+margin)+diameter/2)
                    // rect.setAttribute("width", spread)
                    // rect.setAttribute("height", (depth+1)*(diameter)+diameter/2)
                    // rect.setAttribute("stroke", "orange")
                    // rect.setAttribute("fill", "none")
                    // svg.appendChild(rect)
                    return s
                }
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
                const fontSize = 18
                const centerScalingFactor = 0.75

                // compute pixel coordinates
                let coord = getNodeCoordinates(node)

                // draw name of this node
                let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
                text.setAttribute("font-size", `${fontSize}px`)
                text.setAttribute(
                    "x",
                    Math.round(coord.x - fontSize*centerScalingFactor/2)
                )
                text.setAttribute(
                    "y",
                    Math.round(coord.y + fontSize*centerScalingFactor/2)
                )
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

            function setViewbox(svg) {
                const padding = 1
                const b = svg.getBBox()
                
                const x = Math.floor(
                    b.x-padding
                )
                const y = Math.ceil(
                    b.y-padding
                )
                const width =  Math.ceil(
                    b.width+padding*2
                )
                const height = Math.ceil(
                    b.height+padding*2
                )

                const viewBox = `${x} ${y} ${width} ${height}`

                svg.setAttribute("viewBox", viewBox)                
            }

            // clear the "This tree is empty." placeholder
            document.getElementById("treeContainer").textContent = ""

            // remove any previously-rendered tree
            document.getElementById("svg")?.remove()

            // create a new svg element to hold all the circles, lines, and text
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            svg.id = "svg"
            // hide the image from screenreaders as the rest of our document contains the same information and is more accessible
            svg.setAttribute("aria-hidden", "true")

            // set alt text attributes
            let title = document.createElementNS("http://www.w3.org/2000/svg", "title")
            title.textContent = View.getTitle(d)
            svg.appendChild(title)

            let desc = document.createElementNS("http://www.w3.org/2000/svg", "desc")
            desc.textContent = View.getDesc(d)
            svg.appendChild(desc)

            // render in depth-first search order because why not :) (actually it's because I really don't want to rewrite this whole breadth-first algorithm and I already have a working depth-first one, can you tell how much I love life? PS I hope you're having fun looking at my code LOL s/o from Joseph 2021-07-11)

            const nodes = d.tree.getNodes()

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

            // set svg viewbox
            setViewbox( document.getElementById('svg') )

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

                let summaryLabel = document.createElement("h1")
                summaryLabel.id = "summaryLabel"
                summaryLabel.textContent = "Summary"
                e.appendChild(summaryLabel)

                let summary = document.createElement('table')
                summary.id = "summary"
                e.appendChild(summary)

            document.body.appendChild(e)
            
            for (let item of d.view.summary) {
                let tr = View.TableRow(item)
                summary.appendChild(tr)
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
            e.className = "window"
            e.setAttribute("aria-live", "polite")
            e.setAttribute("role", "alert")
            e.setAttribute("aria-labelledby", "statusLabel")

                let statusLabel = document.createElement("h1")
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

                let h1 = document.createElement("h1")
                h1.textContent = 'File'
                e.appendChild(h1)

                let save = document.createElement("button")
                save.id = "save"
                save.textContent = "Save Tree to File"
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

                let h2export = document.createElement('h2')
                h2export.textContent = "Export Image"
                e.appendChild(h2export)

                let exportSvg = document.createElement("button")
                exportSvg.id = "exportSvg"
                exportSvg.textContent = "Export Tree as SVG"
                e.appendChild(exportSvg)

                let exportPng = document.createElement("button")
                exportPng.id = "exportPng"
                exportPng.textContent = "Export Tree as PNG"
                e.appendChild(exportPng)

                let h2 = document.createElement("h2")
                h2.textContent = "Exported image alt text"
                e.appendChild(h2)

                let alt = document.createElement("textarea")
                alt.id = "altText"
                alt.rows = 6
                alt.addEventListener('click', function(e) { this.select() } )
                e.appendChild(alt)

            document.body.appendChild(e)
            this.render(d)
        },

        render(d) {
            document.getElementById("altText").textContent = View.getDesc(d)
        }

    }

}