class View {

    static init(d) {
        this.Edit.init(d)
        this.TreeView.init(d)
        this.Status.init(d)
        this.RightPanel.init(d)
    }

    static render(d) {
        this.TreeView.render(d)
        this.Status.render(d)
        this.Edit.render(d)
        this.RightPanel.render(d)
    }

    static getTitle(d) {
        return `A circle-and-line diagram of a computer science tree data structure`
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

    static Break = {
        init() {
            const div = document.createElement('div')
            div.className = "break"
            document.body.appendChild(div)
        }
    }

    static ButtonItem(action) {
        let li = document.createElement('li')
        let button = document.createElement('button')
        button.textContent = action.textContent
        button.href = "#"
        button.className = "menubarItem"
        button.id = action.id
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

            function populateMenu(menuId, actions, labeledBy) {
                const menu = document.createElement('ol')
                menu.setAttribute("aria-labelledby", labeledBy)
                menu.id = menuId
                actions.map(
                    action => menu.appendChild( View.ButtonItem(action) )
                )
                return menu
            }


            let e = document.createElement("div")
            e.classList.add("window")
            e.id = "edit"

                const editContainerLabel = document.createElement("h1")
                editContainerLabel.textContent = "Edit and Move"
                editContainerLabel.id = "editContainerLabel"
                e.appendChild(editContainerLabel)

                const addLabel = document.createElement("h2")
                addLabel.id = "addLabel"
                addLabel.textContent = "Add"
                addLabel.className = "menubarLabel"
                e.appendChild(addLabel)
                e.appendChild( populateMenu("addMenu", d.view.actions.add, "addLabel") )

                const editLabel = document.createElement('h2')
                editLabel.id = "editLabel"
                editLabel.textContent = "Edit"
                editLabel.className = "menubarLabel"
                e.appendChild(editLabel)
                e.appendChild( populateMenu("editMenu", d.view.actions.edit, "editLabel") )

                const moveLabel = document.createElement('h2')
                moveLabel.id = "moveLabel"
                moveLabel.textContent = "Move"
                moveLabel.className = "menubarLabel"
                e.appendChild(moveLabel)
                e.appendChild( populateMenu("moveMenu", d.view.actions.move, "moveLabel") )

                const treePropertiesLabel = document.createElement('h2')
                treePropertiesLabel.id = "treePropertiesLabel"
                treePropertiesLabel.textContent = "Tree Properties"
                treePropertiesLabel.className = "menubarLabel"
                e.appendChild(treePropertiesLabel)

                const treePropertiesContainer = document.createElement("div")
                treePropertiesContainer.id = "treePropertiesContainer"

                    const span = document.createElement('span')
                    span.textContent = "Nodes have at most"
                    treePropertiesContainer.appendChild(span)

                    const spinner = document.createElement('input')
                    spinner.id = "arity"
                    spinner.type = "number"
                    spinner.min = 1
                    spinner.max = 16
                    spinner.step = 1
                    spinner.value = d.tree.arity
                    treePropertiesContainer.appendChild(spinner)

                    const span2 = document.createElement('span')
                    span2.textContent = "children"
                    treePropertiesContainer.appendChild(span2)

                e.appendChild(treePropertiesContainer)

            document.body.appendChild(e)

            this.render(d)
        },

        render(d) {
            const actions = d.view.actions.add
            .concat(d.view.actions.edit)
            .concat(d.view.actions.move)
            for (let a of actions) {
                const t = document.getElementById(a.id)
                t.textContent = a.textContent
                if (a.isEnabled) {
                    t.classList.remove("disabled")
                    t.removeAttribute("disabled")
                }
                else {
                    t.classList.add("disabled")
                    t.setAttribute("disabled", "true")
                }
            }
        }
    }

    static TreeView = {
        init(d) {
            const e = document.createElement("div")
            e.id = "treeContainer"
            e.classList.add("window")

                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
                svg.id = "svg"
                // hide the image from screenreaders as the rest of our document contains the same information and is more accessible
                svg.setAttribute("aria-hidden", "true")
                e.appendChild(svg)

            document.body.appendChild(e)
        },

        render(d) {

            // set constants
            const diameter = 10
            // minimum margin
            const horizontalMargin = 25
            const verticalMargin = 25

            
            const h = d.tree.head

            // this function has a super duper inefficient upper bound on running time lolol
            function getNodeCoordinates(node) {
                const depth = d.tree.getDepth(node)
                const i = d.tree.getNodeIndexIncludeBlanks(node)

                const width = document.getElementById("treeContainer").getBoundingClientRect().x
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
                    const spread = horizontalMargin * (maximumChildren-1) * Math.pow(maximumChildren, depthMult)
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
                        depth * (diameter+verticalMargin) + diameter/2
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
                const strokeWidth = 0.25
                // compute pixel coordinates
                const coord = getNodeCoordinates(node)
                // draw circle
                const c = document.createElementNS("http://www.w3.org/2000/svg", "circle")
                c.setAttribute("cx", coord.x )
                c.setAttribute("cy", coord.y )
                c.setAttribute("r", diameter)
                c.setAttribute("stroke-width", `${strokeWidth}%`)
                if (node === d.interface.current) {
                    c.setAttribute("fill", "url(#currentNodeGradient")
                    c.setAttribute("stroke", "#00040a")
                }
                else {
                    c.setAttribute("fill", "url(#nodeGradient)")
                    c.setAttribute("stroke", "#2f67ba")
                }
                return c
            }

            function drawName(node, svg) {
                const fontSize = 12

                // compute pixel coordinates
                let coord = getNodeCoordinates(node)

                // draw name of this node
                let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
                text.setAttribute("font-size", fontSize)
                text.setAttribute("font-family", "Segoe UI, Helvetica, Sans-Serif")
                text.setAttribute(
                    "x",
                    Math.round(coord.x)
                )
                text.setAttribute(
                    "y",
                    Math.round(coord.y + diameter/2)
                )
                text.setAttribute("text-anchor", "middle")
                text.setAttribute("fill", "white")
                text.textContent = node.name
                return text
            }

            function drawNode(node, svg) {
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
                g.setAttribute("class", "node")
                g.setAttribute("data-name", node.name)
                g.appendChild(
                    drawCircle(node, svg)
                )
                g.appendChild(
                    drawName(node, svg)
                )
                if ( node === d.interface.current ) {
                    g.setAttribute("class", "node currentNode")
                }
                else {
                    g.setAttribute("class", "node")
                }
                svg.appendChild(g)
            }

            function drawLine(node, svg) {
                // compute pixel coordinates
                let coord = getNodeCoordinates(node)
                const strokeWidth = 0.25
                
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
                    l.setAttribute("stroke-width", `${strokeWidth}%`)
                    svg.appendChild(l)
                }
            }

            function setViewbox(svg) {
                const padding = 20
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

            // remove any previously-rendered tree
            const svg = document.getElementById("svg")
            let max = 999
            while (svg.firstChild && max-->0) {
                svg.removeChild(svg.firstChild)
            }

            // create gradients

            const nodeGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
            nodeGradient.setAttribute("id", "nodeGradient")
            nodeGradient.setAttribute("gradientTransform", "rotate(90)")
                const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
                stop1.setAttribute("offset", "0%")
                stop1.setAttribute("stop-color", "#7ca3e0")
                nodeGradient.appendChild(stop1)

                const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
                stop2.setAttribute("offset", "100%")
                stop2.setAttribute("stop-color", "#2c64b8")
                nodeGradient.appendChild(stop2)
                
            svg.appendChild(
                nodeGradient
            )

            const currentNodeGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
            currentNodeGradient.setAttribute("id", "currentNodeGradient")
            currentNodeGradient.setAttribute("gradientTransform", "rotate(90)")

                const stop3 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
                stop3.setAttribute("offset", "0%")
                stop3.setAttribute("stop-color", "#002867")
                currentNodeGradient.appendChild(stop3)

                const stop4 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
                stop4.setAttribute("offset", "100%")
                stop4.setAttribute("stop-color", "#00040a")
                currentNodeGradient.appendChild(stop4)

            svg.appendChild(
                currentNodeGradient
            )

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
                n => drawNode(n, svg)
            )

            document.getElementById("treeContainer").appendChild(svg)

            // set svg viewbox
            setViewbox( document.getElementById('svg') )

        },

    }

    static TreeOptions(d) {
        let e = document.createElement("div")
    }

    static Status =  {
        init(d) {
            let e = document.createElement("div")
            e.id = "statusContainer"
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

                document.getElementById("treeContainer").appendChild(e)
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

    static Summary = {
        init(d) {
            let e = document.createElement('div')
            e.id = "summaryContainer"
            e.className = "window"
            e.setAttribute("aria-labelledby", "summaryLabel")

                let summaryLabel = document.createElement("h1")
                summaryLabel.id = "summaryLabel"
                summaryLabel.textContent = "Summary"
                e.appendChild(summaryLabel)

                let summary = document.createElement('table')
                summary.id = "summary"
                e.appendChild(summary)
            
            for (let item of d.view.summary) {
                let tr = View.TableRow(item)
                summary.appendChild(tr)
            }

            return e
        },
        render(d) {
            for (let item of d.view.summary) {
                document.getElementById(item.id).textContent = item.value
            }
        }
    }

    static File = {

        init(d) {
            let e = document.createElement("div")
            e.id = "file"
            e.className = "window"

                let h1 = document.createElement("h1")
                h1.textContent = 'File'
                e.appendChild(h1)

                const saveAndLoadLabel = document.createElement('h2')
                saveAndLoadLabel.textContent = "Save and Load"
                saveAndLoadLabel.id = "saveAndLoadLabel"
                saveAndLoadLabel.className = "menubarLabel"
                e.appendChild(saveAndLoadLabel)

                const saveLoadMenu = document.createElement('ol')
                saveLoadMenu.setAttribute("aria-labeledby", "saveAndLoadLabel")

                    const save = View.ButtonItem(
                        {
                            id: "save",
                            textContent: "Save Tree to File",
                        }
                    )
                    saveLoadMenu.appendChild(save)

                    const loadDummy = View.ButtonItem(
                        {
                            id: "loadDummy",
                            textContent: "Load Tree from File...",
                        }
                    )
                    saveLoadMenu.appendChild(loadDummy)

                    const load = document.createElement("input")
                    load.type = "file"
                    load.id = "load"
                    load.style.display = "none"
                    saveLoadMenu.appendChild(load)

                e.appendChild(saveLoadMenu)

                const h2export = document.createElement('h2')
                h2export.textContent = "Export"
                h2export.className = "menubarLabel"
                e.appendChild(h2export)

                const exportSvg = View.ButtonItem(
                    {
                        id: "exportSvg",
                        textContent: "Export Tree as SVG",
                    }
                )
                e.appendChild(exportSvg)

                const exportPng = View.ButtonItem(
                    {
                        id: "exportPng",
                        textContent: "Export Tree as PNG",
                    }
                )
                e.appendChild(exportPng)

                const exportHtml = View.ButtonItem(
                    {
                        id: "exportHtml",
                        textContent: "Export Tree as HTML",
                    }
                )
                e.appendChild(exportHtml)

                const h2 = document.createElement("h2")
                h2.textContent = "Exported Image Alt Text"
                h2.className = "menubarLabel"
                e.appendChild(h2)

                const alt = document.createElement("textarea")
                alt.id = "altText"
                alt.rows = 6
                alt.addEventListener('click', function(e) { this.select() } )
                e.appendChild(alt)

            return e
        },

        render(d) {
            document.getElementById("altText").textContent = View.getDesc(d)
        }

    }

    static RightPanel = {
        init(d) {
            const e = document.createElement("div")
            e.id = "rightPanel"
            
            e.appendChild( View.Summary.init(d) )
            e.appendChild( View.File.init(d) )
            document.body.appendChild(e)
        },

        render(d) {
            View.Summary.render(d)
            View.File.render(d)
        }
    }
}