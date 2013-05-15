CANVAS_SIZE = 600
canvas = {}

function draw(){
	var ctx = canvas.getContext("2d")
	ctx.clearRect(0,0,600,600)
	graph.move()
	graph.draw()
}


var graph={
	nodes: new Array(),
	edges: new Array(),
	
	addnode: function(){
		var x = Math.random() * CANVAS_SIZE
		var y = Math.random() * CANVAS_SIZE
		var node = new Node(x,y)
		this.nodes.push(node)
	},
	
	addedge: function(i,j){
		this.edges.push(new Edge(this.nodes[i], this.nodes[j]))
	},
	
	draw: function(){
		for(var i=0;i<this.edges.length;i++){
			this.edges[i].draw()
		}
		for(var i=0;i<this.nodes.length;i++){
			this.nodes[i].draw()
		}
	},
	
	move: function(){
		for(var i=0;i<this.nodes.length;i++){
			var node = this.nodes[i]
			var x = node.posx
			var y = node.posy
			
			for(var j=0;j<this.nodes.length;j++){
				if(i != j){
					var x0 = this.nodes[j].posx
					var y0 = this.nodes[j].posy
					node.vx += rungeKutta(elecPow(x0), 0, x)
					node.vy += rungeKutta(elecPow(y0), 0, y)
				}
			}
		}
			
		for(var i=0;i<this.edges.length; i++){
			var u = this.edges[i].begin
			var v = this.edges[i].end
			
			u.vx += rungeKutta(springPow(v.posx), 0, u.posx)
			u.vy += rungeKutta(springPow(v.posy), 0, u.posy)
			v.vx += rungeKutta(springPow(u.posx), 0, v.posx)
			v.vy += rungeKutta(springPow(u.posy), 0, v.posy)
		}

		for(var i=0;i<this.nodes.length;i++){
			var node = this.nodes[i]
			node.posx += node.vx * STEP
			node.posy += node.vy * STEP
			
			node.vx *= MU
			node.vy *= MU
			
		}
	}
}


/* Nodeクラス */
function Node(x, y){
	this.posx = x
	this.posy = y
	this.vx = 0
	this.vy = 0
}

Node.prototype = {
	draw: function(){
		var ctx = canvas.getContext("2d")
		ctx.beginPath();
	  	ctx.fillStyle = 'rgb(0,204,255)'; // 赤
	  	ctx.arc(this.posx, this.posy, 10, 0, Math.PI*2, false);
	  	ctx.fill();
	}
}

/* Edgeクラス */
function Edge(u, v){
	this.begin = u
	this.end = v
}

Edge.prototype = {
	draw: function(){
		var ctx = canvas.getContext("2d")
		var u = this.begin
		var v = this.end
		ctx.beginPath();
		ctx.strokeStyle = 'rgb(100, 100, 100)'; // 白
		ctx.moveTo(u.posx, u.posy);
		ctx.lineTo(v.posx, v.posy);
		ctx.closePath();
		ctx.stroke();
	}
}


/* 実行時ロード */
$(function(){
	canvas = document.getElementById("maincanvas")
	
	var n = 30
	
	for(var i=0;i<n;i++){
		graph.addnode()
	}
	for(var j=1;j<n;j++){
		graph.addedge(0,j)
	}
	//draw()
	//
	
	setInterval("draw()", 10)
})


/* ルンゲクッタ法 */
var K = 0.01 // ばね定数
var C = 10000 // クーロン定数
var STEP = 0.1 // 時間ステップ幅
var MU = 0.99 // 摩擦による減衰

function rungeKutta(f, t, x){
	var k1 = f(t,x)
	var k2 = f(t + STEP/2, x + k1*STEP/2)
	var k3 = f(t + STEP/2, x + k2*STEP/2)
	var k4 = f(t + STEP, x + STEP * k3)
	return STEP * (k1+2*k2+2*k3+k4)/6
}

function springPow(x0){
	var f = function(t,x){
		return - K * (x-x0)
	}
	return f
}


function elecPow(x0){
	var f = function(t,x){		
		var sgn = x-x0 > 0 ? 1 : -1
		return C * sgn / ((x-x0) * (x-x0))
	}
	return f
}