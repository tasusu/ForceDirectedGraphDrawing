# Graphクラス 
class Graph
    constructor: ->  
      @nodes = [] # [Node]
      @adj = {} # node_id -> [隣接するNode]
      @edges = [] # [Edge]
      @id_node_dict = {} # nodeid -> Node

    addnode: (node_id, color) ->
        x = Math.random() * canvas.width
        y = Math.random() * canvas.height
        newnode = new Node(node_id, x, y, color)
        @nodes[node_id] = newnode
        @adj[node_id] = new Array()
        @id_node_dict[node_id] = newnode

    addedge: (u, v) ->
        @addnode u  unless u of @id_node_dict
        @addnode v  unless v of @id_node_dict
        @adj[u].push @id_node_dict[v]
        @adj[v].push @id_node_dict[u]
        @edges.push new Edge(@id_node_dict[u], @id_node_dict[v])

    draw: (ctx) ->
        for edge in @edges
            edge.draw(ctx)
        for node in @nodes
            node.draw(ctx)
            
    move: ->
        for node in @nodes
            if node.binded
                continue
            
            x = node.posx
            y = node.posy
            
            #クーロン力
            for target in @nodes
                unless node is target
                    elecPowVec = elecPow(node, target)
                    node.vx += elecPowVec.x * STEP
                    node.vy += elecPowVec.y * STEP
                    
            # 中心力
            node.vx += centralGrabx(x) * STEP
            node.vy += centralGraby(y) * STEP
            
            # ばねの力
            for target in @adj[node.id]
                springPowVec = springPow(node, target)
                node.vx += springPowVec.x
                node.vy += springPowVec.y
              
            #摩擦減衰
            node.vx *= MU
            node.vy *= MU
            
            #位置の更新
            node.posx += node.vx * STEP
            node.posy += node.vy * STEP

# Nodeクラス 
class Node
    constructor: (@id, @posx, @posy, @color = "rgb(0,204,255)") ->
        @vx = 0
        @vy = 0
        @binded = false
        
    draw: (ctx) ->
        ctx.beginPath()
        ctx.fillStyle = @color
        ctx.arc @posx, @posy, 10, 0, Math.PI * 2, false
        ctx.fill()

    mouseon: (e) ->
        Math.sqrt((@posx - e.x) * (@posx - e.x) + (@posy - e.y) * (@posy - e.y)) < 10

# Edgeクラス 
class Edge
    constructor: (u, v) ->
        @begin = u
        @end = v
        
    draw: (ctx) ->
        u = @begin
        v = @end
        ctx.beginPath()
        ctx.strokeStyle = "rgb(100, 100, 100)"
        ctx.moveTo u.posx, u.posy
        ctx.lineTo v.posx, v.posy
        ctx.closePath()
        ctx.stroke()

# キャンバスクラス
class Canvas
    constructor: ->
        @timer = {}
        @graph = new Graph()
        @width = CANVAS_WIDTH
        @height = CANVAS_HEIGHT
        @binded = `undefined`
    
    # キャンバスの描画
    draw: =>
        ctx = document.getElementById("maincanvas").getContext("2d")
        ctx.clearRect(0, 0, @width, @height)
        @graph.move()
        @graph.draw(ctx)

    # リサイズ
    resize: ->
        width = $(window).width();
        height = $(window).height() - 200
    
        $('#maincanvas').attr({
          width : width,
          height : height
        })
        
        @width = width
        @height = height

    # キャンバス上の座標取得 
    getPosition: (e) ->
        x = e.pageX - $('#maincanvas').position().left;
        y = e.pageY - $('#maincanvas').position().top;
        return {x : x, y : y}

    # キャンバス上のマウス押下
    onCanvasMousedown: (e) =>
        pos = @getPosition(e)
        graph = @graph
        for node in graph.nodes
            if node.mouseon(pos)
                @binded = node
                node.binded = true
                console.log(node.id)
                break

    #  キャンバス上のマウス移動
    onCanvasMousemove: (e) =>
        if @binded
            pos = @getPosition(e)
            @binded.posx = pos.x
            @binded.posy = pos.y
            @binded.vx = 0
            @binded.vy = 0

    # キャンバス上のマウス解除 */
    onCanvasMouseup: (e) =>
        console.log "MOUSE UP"
        @binded.binded = false
        @binded = `undefined`

    # グラフの切り替え 
    changeGraph: (graphname) ->
        clearInterval @timer # タイマーを停止
        graph = new Graph()
        if graphname is "star"
            starsize = 25
            i = 1
        
            while i < starsize
              graph.addedge 0, i
              i++
              
        else if graphname is "complete"
            completegraphsize = 5
            i = 0
      
            while i < completegraphsize
              j = i + 1
              while j < completegraphsize
                graph.addedge i, j
                j++
              i++
        
        else if graphname is "bipartite"
            nodeside = 3
            i = 0
        
            while i < nodeside
                j = 0
          
                while j < nodeside
                    graph.addedge i, nodeside + j
                    j++
                
                i++
        
        else if graphname is "twostar"
            starsize = 10
            i = 0
            while i < starsize
                graph.addnode i, "orange"
                graph.addnode i + starsize
                i++
            i = 1
      
            while i < starsize
                graph.addedge 0, i
                graph.addedge starsize, i + starsize
                i++
            graph.addedge 0, starsize
        
        else
            console.log "対応するグラフがありません"
        
        @graph = graph
        @timer = setInterval(@draw, 20) # タイマー再開


# 力学系パラメータ 
K = 0.01
C = 100000
NATLEN = 0
STEP = 0.1
MU = 0.92
GRAB = 0.01


springPow = (node, targetnode) ->
    x = node.posx - targetnode.posx
    y = node.posy - targetnode.posy
    Fx = -K * x
    Fy = -K * y
    return {x: Fx, y: Fy}
    
elecPow = (node, targetnode) ->
    x = node.posx - targetnode.posx
    y = node.posy - targetnode.posy
    sgnx = (if x > 0 then 1 else -1)
    sgny = (if y > 0 then 1 else -1)
    r = x * x + y * y
    Fx = C * sgnx * Math.abs(x) / (r * Math.sqrt(r) + 10)
    Fy = C * sgny * Math.abs(y) / (r * Math.sqrt(r) + 10)
    return {x: Fx, y: Fy}
    
centralGrabx = (x) ->
    -GRAB * (x - canvas.width / 2)

centralGraby = (y) ->
    -GRAB * (y - canvas.height / 2)

# グローバル変数
CANVAS_WIDTH = 600
CANVAS_HEIGHT = 600
canvas = new Canvas()

#ロード時実行
$ ->
    $("#graphselect").change ->
      graphname = $(this).children(":selected").val()
      canvas.changeGraph graphname
  
    $("#redraw").click ->
      graphname = $("#graphselect").children(":selected").val()
      canvas.changeGraph graphname
    
    $("#maincanvas").mousemove(canvas.onCanvasMousemove)
    .mousedown(canvas.onCanvasMousedown)
    .mouseup(canvas.onCanvasMouseup)
    canvas.resize()
    canvas.changeGraph "star"