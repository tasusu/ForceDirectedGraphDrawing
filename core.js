(function() {

    var CANVAS_WIDTH = 600
    var CANVAS_HEIGHT = 600
    var canvas = {}
    var graph = {}
    var timer = {}
    var binded = undefined

    /* キャンバス描画 */
    function draw() {
        var ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        graph.move()
        graph.draw()
    }

    /* リサイズ */
    function resize() {
        CANVAS_WIDTH = $(window).width();
        CANVAS_HEIGHT = $(window).height() - 200

        $('#maincanvas').attr({
            width : CANVAS_WIDTH,
            height : CANVAS_HEIGHT
        });
    }

    /* キャンバス上の座標取得 */
    function getPosition(e) {
        var x = e.pageX - $('#maincanvas').position().left;
        var y = e.pageY - $('#maincanvas').position().top;
        return {
            x : x,
            y : y
        };
    }

    /* キャンバス上のマウス押下 */
    function onCanvasMousedown(e) {
        var pos = getPosition(e)
        for (var id in graph.nodes) {
            var node = graph.nodes[id]
            if (node.mouseon(pos)) {
                binded = id
                console.log(id)
                break
            }
        }
    }

    /* キャンバス上のマウス移動 */
    function onCanvasMousemove(e) {
        if (binded) {
            var pos = getPosition(e)
            var bindednode = graph.nodes[binded]
            bindednode.posx = pos.x
            bindednode.posy = pos.y
            bindednode.vx = 0
            bindednode.vy = 0
        }
    }

    /* キャンバス上のマウス解除 */
    function onCanvasMouseup(e) {
        binded = undefined
    }

    /* Graphクラス */
    function Graph() {
        this.nodes = {}// node_id -> Node オブジェクト
        this.adj = {}// node_id -> [隣接nodeのid]
        this.edges = new Array() // [Edge]
    }


    Graph.prototype.addnode = function(node_id, color) {
        var x = Math.random() * CANVAS_WIDTH
        var y = Math.random() * CANVAS_HEIGHT
        this.nodes[node_id] = new Node(node_id, x, y, color)
        this.adj[node_id] = new Array()
    }

    Graph.prototype.addedge = function(u, v) {
        if (!( u in this.adj)) {
            this.addnode(u)
        }
        if (!( v in this.adj)) {
            this.addnode(v)
        }
        this.adj[u].push(v)
        this.adj[v].push(u)
        this.edges.push(new Edge(this.nodes[u], this.nodes[v]))
    }

    Graph.prototype.draw = function() {
        var energy = 0
        for (var i = 0; i < this.edges.length; i++) {
            this.edges[i].draw()
        }
        for (var id in this.nodes) {
            this.nodes[id].draw()
            energy += this.nodes[id].energy()
        }
    }

    Graph.prototype.move = function() {
        for (var id in this.nodes) {
            if (id == binded) {
                continue
            }

            var node = this.nodes[id]
            var x = node.posx
            var y = node.posy

            /* クーロン力の計算 */
            for (var target in this.nodes) {
                if (id != target) {
                    var targetnode = this.nodes[target]
                    var elecPowVec = elecPow(node, targetnode)
                    node.vx += elecPowVec.x * STEP
                    node.vy += elecPowVec.y * STEP
                }
            }

            /* 中心力 */
            node.vx += centralGrabx(x) * STEP
            node.vy += centralGraby(y) * STEP

            /* ばねの力の計算 */
            for (var i = 0; i < this.adj[id].length; i++) {
                var target = this.adj[id][i]
                var targetnode = this.nodes[target]
                var springPowVec = springPow(node, targetnode)
                node.vx += springPowVec.x
                node.vy += springPowVec.y
            }

            /* 摩擦による減速 */
            node.vx *= MU
            node.vy *= MU

            /* 位置の更新 */
            node.posx += node.vx * STEP
            node.posy += node.vy * STEP
        }
    }
    /* Nodeクラス */
    function Node(node_id, x, y, color) {
        this.id = node_id
        this.posx = x
        this.posy = y
        this.vx = 0
        this.vy = 0
        this.color = color || 'rgb(0,204,255)'
    }


    Node.prototype.draw = function() {
        var ctx = canvas.getContext("2d")
        ctx.beginPath();
        ctx.fillStyle = this.color
        ctx.arc(this.posx, this.posy, 10, 0, Math.PI * 2, false);
        ctx.fill();
    }

    Node.prototype.energy = function() {
        return ((this.vx) * (this.vx) + (this.vy) * (this.vy)) / 2
    }

    Node.prototype.mouseon = function(e) {
        return Math.sqrt((this.posx - e.x) * (this.posx - e.x) + (this.posy - e.y) * (this.posy - e.y)) < 10
    }
    /* Edgeクラス */
    function Edge(u, v) {
        this.begin = u
        this.end = v
    }

    Edge.prototype.draw = function() {
        var ctx = canvas.getContext("2d")
        var u = this.begin
        var v = this.end
        ctx.beginPath();
        ctx.strokeStyle = 'rgb(100, 100, 100)';
        // 白
        ctx.moveTo(u.posx, u.posy);
        ctx.lineTo(v.posx, v.posy);
        ctx.closePath();
        ctx.stroke();
    }
    /* グラフの切り替え */
    function changeGraph(graphname) {
        clearInterval(timer)// タイマーを停止

        graph = new Graph()

        if (graphname == "star") {
            var starsize = 25
            for (var i = 1; i < starsize; i++) {
                graph.addedge(0, i)
            }
        } else if (graphname == "complete") {
            var completegraphsize = 5
            for (var i = 0; i < completegraphsize; i++) {
                for ( j = i + 1; j < completegraphsize; j++) {
                    graph.addedge(i, j)
                }
            }
        } else if (graphname == "bipartite") {
            var nodeside = 3
            for (var i = 0; i < nodeside; i++) {
                for (var j = 0; j < nodeside; j++) {
                    graph.addedge(i, nodeside + j)
                }
            }
        } else if (graphname == "twostar") {
            var starsize = 10
            for ( i = 0; i < starsize; i++) {
                graph.addnode(i, "orange")
                graph.addnode(i + starsize)
            }
            for (var i = 1; i < starsize; i++) {
                graph.addedge(0, i)
                graph.addedge(starsize, i + starsize)
            }
            graph.addedge(0, starsize)
        } else {
            console.log("対応するグラフがありません")
        }

        timer = setInterval(draw, 20) // タイマー再開
    }

    /* 実行時ロード */
    $(function() {
        resize()
        canvas = document.getElementById("maincanvas")

        $('#graphselect').change(function() {
            var graphname = $(this).children(':selected').val()
            changeGraph(graphname)
        })

        $("#redraw").click(function() {
            var graphname = $("#graphselect").children(':selected').val()
            changeGraph(graphname)
        })

        $("#maincanvas").mousemove(onCanvasMousemove).mousedown(onCanvasMousedown).mouseup(onCanvasMouseup)

        changeGraph("star")
    });

    /* 力学系パラメータ */
    var K = 0.01// ばね定数
    var C = 100000// クーロン定数
    var NATLEN = 0// ばねの自然長
    var STEP = 0.1// 時間ステップ幅
    var MU = 0.8// 摩擦による減衰
    var GRAB = 0.01 // 中心力

    function springPow(node, targetnode) {
        var x = node.posx - targetnode.posx
        var y = node.posy - targetnode.posy
        var Fx = - K * x 
        var Fy = - K * y
        return {x:Fx, y:Fy}
    }

    function elecPow(node, targetnode) {
        var x = node.posx - targetnode.posx
        var y = node.posy - targetnode.posy
        var sgnx = x > 0 ? 1 : -1
        var sgny = y > 0 ? 1 : -1
        var r = x * x + y * y
        var Fx = C * sgnx * Math.abs(x) / (r * Math.sqrt(r) + 10)
        var Fy = C * sgny * Math.abs(y) / (r * Math.sqrt(r) + 10)
        
        return {x:Fx, y:Fy}
    }

    function centralGrabx(x) {
        return -GRAB * (x - CANVAS_WIDTH / 2)
    }

    function centralGraby(y) {
        return -GRAB * (y - CANVAS_HEIGHT / 2)
    }

})();
