CANVAS_SIZE = 600
canvas = {}

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
	  	console.log(this.posx)
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
	for(var i=0;i<6;i++){
		graph.addnode()
	}
	for(var i=0;i<6;i++){
		for(var j=i+1;j<6;j++){
			graph.addedge(i,j)
		}
	}
	graph.draw()
})
