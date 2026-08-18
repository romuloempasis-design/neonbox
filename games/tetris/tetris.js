"use strict";
Neonbox.registerGame({
id:"tetris",title:"Neonbox Tetris",author:"Neonbox",version:"0.5.2",
api:null,ctx:null,canvas:null,cols:10,rows:20,board:[],
piece:null,next:null,hold:null,bag:[],canHold:true,
score:0,lines:0,level:1,highScore:0,dropTimer:0,dropDelay:800,lockTimer:0,lockDelay:500,lockResets:0,maxLockResets:15,
paused:false,gameOver:false,state:"title",titlePulse:0,flashTimer:0,flashRows:[],shake:0,
colors:{I:"#20eaff",O:"#ffe34d",T:"#d84cff",S:"#3cff91",Z:"#ff426d",J:"#438cff",L:"#ff9638"},
shapes:{
I:[[1,1,1,1]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1]],
S:[[0,1,1],[1,1,0]],Z:[[1,1,0],[0,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]]
},
start(api){
this.api=api;this.ctx=null;this.canvas=null;this.reset();this.state="title";this.titlePulse=0;
},
reset(){
this.board=Array.from({length:this.rows},()=>Array(this.cols).fill(null));
this.score=0;this.lines=0;this.level=1;this.dropTimer=0;this.lockTimer=0;this.lockResets=0;this.dropDelay=800;
this.paused=false;this.gameOver=false;this.flashTimer=0;this.flashRows=[];this.shake=0;
this.hold=null;this.canHold=true;this.highScore=this.api?.load?this.api.load("tetris:highscore",0):0;
this.bag=[];this.next=this.randomPiece();this.piece=null;this.state="title";
},
beginGame(){
this.board=Array.from({length:this.rows},()=>Array(this.cols).fill(null));
this.score=0;this.lines=0;this.level=1;this.dropTimer=0;this.lockTimer=0;this.lockResets=0;this.dropDelay=800;
this.paused=false;this.gameOver=false;this.flashTimer=0;this.flashRows=[];this.shake=0;
this.hold=null;this.canHold=true;this.bag=[];this.next=this.randomPiece();this.spawn();this.state="playing";
if(this.api?.beep)this.api.beep(660,.08);
},
clone(m){return m.map(r=>r.slice())},
shuffle(a){
for(let i=a.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[a[i],a[j]]=[a[j],a[i]];
}
return a;
},
nextType(){
if(!this.bag.length)this.bag=this.shuffle(["I","O","T","S","Z","J","L"]);
return this.bag.pop();
},
randomPiece(){
const type=this.nextType();
return{type,matrix:this.clone(this.shapes[type]),x:0,y:0};
},
makePiece(type){
return{type,matrix:this.clone(this.shapes[type]),x:0,y:0};
},
spawn(){
this.piece=this.next||this.randomPiece();
this.next=this.randomPiece();
this.piece.x=Math.floor((this.cols-this.piece.matrix[0].length)/2);
this.piece.y=0;
this.canHold=true;
this.dropTimer=0;
this.lockTimer=0;
this.lockResets=0;
if(this.collides(this.piece,this.piece.x,this.piece.y)){
this.gameOver=true;
this.saveHighScore();
if(this.api?.beep)this.api.beep(110,.25);
}
},
collides(piece,x,y,matrix=piece.matrix){
for(let r=0;r<matrix.length;r++)for(let c=0;c<matrix[r].length;c++){
if(!matrix[r][c])continue;
const bx=x+c,by=y+r;
if(bx<0||bx>=this.cols||by>=this.rows)return true;
if(by>=0&&this.board[by][bx])return true;
}
return false;
},
move(dx){
if(this.state!=="playing"||this.paused||this.gameOver||this.flashTimer>0||!this.piece)return;
if(!this.collides(this.piece,this.piece.x+dx,this.piece.y)){
this.piece.x+=dx;
if(this.collides(this.piece,this.piece.x,this.piece.y+1)&&this.lockResets<this.maxLockResets){
this.lockTimer=0;
this.lockResets++;
}
if(this.api?.beep)this.api.beep(210,.025);
}
},
softDrop(){
if(this.state!=="playing"||this.paused||this.gameOver||this.flashTimer>0||!this.piece)return;
if(!this.collides(this.piece,this.piece.x,this.piece.y+1)){
this.piece.y++;
this.score++;
this.dropTimer=0;
this.lockTimer=0;
}else{
this.lockTimer+=50;
if(this.lockTimer>=this.lockDelay)this.lock();
}
},
hardDrop(){
if(this.state!=="playing"||this.paused||this.gameOver||this.flashTimer>0||!this.piece)return;
let distance=0;
while(!this.collides(this.piece,this.piece.x,this.piece.y+1)){
this.piece.y++;
distance++;
}
this.score+=distance*2;
this.dropTimer=0;
this.lockTimer=0;
this.lockResets=0;
this.shake=3;
this.lock();
if(this.api?.beep)this.api.beep(120,.06);
},
rotate(){
if(this.state!=="playing"||this.paused||this.gameOver||this.flashTimer>0||!this.piece)return;
const old=this.piece.matrix;
const rotated=old[0].map((_,i)=>old.map(row=>row[i]).reverse());
for(const offset of[0,-1,1,-2,2]){
const nx=this.piece.x+offset;
if(!this.collides(this.piece,nx,this.piece.y,rotated)){
this.piece.matrix=rotated;
this.piece.x=nx;
if(this.collides(this.piece,this.piece.x,this.piece.y+1)&&this.lockResets<this.maxLockResets){
this.lockTimer=0;
this.lockResets++;
}
if(this.api?.beep)this.api.beep(440,.035);
return;
}
}
},
holdPiece(){
if(this.state!=="playing"||this.paused||this.gameOver||!this.canHold||this.flashTimer>0||!this.piece)return;
const current=this.piece.type;
if(this.hold){
const type=this.hold;
this.hold=current;
this.piece=this.makePiece(type);
this.piece.x=Math.floor((this.cols-this.piece.matrix[0].length)/2);
this.piece.y=0;
this.dropTimer=0;
this.lockTimer=0;
this.lockResets=0;
if(this.collides(this.piece,this.piece.x,this.piece.y)){
this.gameOver=true;
this.saveHighScore();
if(this.api?.beep)this.api.beep(110,.25);
return;
}
}else{
this.hold=current;
this.spawn();
}
this.canHold=false;
if(this.api?.beep)this.api.beep(520,.05);
},
getGhostY(){
if(!this.piece)return 0;
let y=this.piece.y;
while(!this.collides(this.piece,this.piece.x,y+1))y++;
return y;
},
lock(){
const p=this.piece;
if(!p)return;

for(let r=0;r<p.matrix.length;r++)for(let c=0;c<p.matrix[r].length;c++){
if(!p.matrix[r][c])continue;
const x=p.x+c,y=p.y+r;
if(x>=0&&x<this.cols&&y>=0&&y<this.rows)this.board[y][x]=p.type;
}

this.piece=null;
this.dropTimer=0;
this.lockTimer=0;
this.lockResets=0;

const rows=[];
for(let y=0;y<this.rows;y++){
let full=true;
for(let x=0;x<this.cols;x++){
if(this.board[y][x]===null){
full=false;
break;
}
}
if(full)rows.push(y);
}

if(rows.length){
const points=[0,100,300,500,800];
this.score+=(points[rows.length]||0)*this.level;
this.lines+=rows.length;
this.level=Math.floor(this.lines/10)+1;
this.dropDelay=Math.max(70,800-(this.level-1)*60);

this.flashRows=rows.slice();

const cleared=new Set(rows);
const newBoard=this.board.filter((_,y)=>!cleared.has(y));

while(newBoard.length<this.rows)
newBoard.unshift(Array(this.cols).fill(null));

this.board=newBoard;

this.flashTimer=120;
this.shake=Math.min(8,2+rows.length*2);
this.saveHighScore();

if(this.api?.beep)this.api.beep(650+rows.length*120,.12);
}else{
this.spawn();
}

if(this.api?.vibrate)this.api.vibrate(15);
},
finishClear(){
this.flashRows=[];
this.flashTimer=0;
this.dropTimer=0;
this.lockTimer=0;
this.lockResets=0;
this.spawn();
},
saveHighScore(){
if(this.score>this.highScore){
this.highScore=this.score;
if(this.api?.save)this.api.save("tetris:highscore",this.highScore);
}
},
update(dt){
if(!this.ctx)return;

if(this.state==="title"){
this.titlePulse+=dt;
return;
}

if(this.flashTimer>0){
this.flashTimer-=dt;
if(this.flashTimer<=0)this.finishClear();
return;
}

if(this.shake>0)this.shake=Math.max(0,this.shake-dt*.025);

if(this.state!=="playing"||this.paused||this.gameOver||!this.piece)return;

const grounded=this.collides(
this.piece,
this.piece.x,
this.piece.y+1
);

if(grounded){
this.lockTimer+=dt;
if(this.lockTimer>=this.lockDelay)this.lock();
return;
}

this.lockTimer=0;
this.dropTimer+=dt;

if(this.dropTimer>=this.dropDelay){
this.dropTimer=0;
this.piece.y++;
}
},
input(button){
if(this.state==="title"){
if(button==="START"||button==="A")this.beginGame();
return;
}

if(button==="LEFT"){this.move(-1);return}
if(button==="RIGHT"){this.move(1);return}
if(button==="DOWN"){this.softDrop();return}
if(button==="UP"){this.hardDrop();return}
if(button==="A"){this.rotate();return}
if(button==="B"){this.holdPiece();return}
if(button==="SELECT")return;

if(button==="START"){
if(this.gameOver){
this.saveHighScore();
this.reset();
this.beginGame();
return;
}
this.paused=!this.paused;
if(this.api?.beep)this.api.beep(this.paused?280:560,.05);
}
},
render(ctx,canvas){
this.ctx=ctx;
this.canvas=canvas;

const w=canvas.clientWidth,h=canvas.clientHeight;

ctx.clearRect(0,0,w,h);
this.drawBackground(ctx,w,h);

if(this.state==="title"){
this.drawTitleScreen(ctx,w,h);
return;
}

const top=45,bottom=20,availableH=h-top-bottom;
const boardCell=Math.floor(Math.min((w*.58)/this.cols,availableH/this.rows));
const boardW=boardCell*this.cols;
const boardH=boardCell*this.rows;
const boardX=Math.floor((w-boardW)/2-8);
const boardY=Math.floor(top+(availableH-boardH)/2);

ctx.save();

if(this.shake>0)
ctx.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);

this.drawGameHeader(ctx,w);
this.drawBoard(ctx,boardX,boardY,boardCell);

if(this.piece){
this.drawGhost(ctx,this.piece,this.getGhostY(),boardX,boardY,boardCell);
this.drawPiece(ctx,this.piece,boardX,boardY,boardCell,1);
}

ctx.restore();

this.drawHUD(ctx,w,h,boardX,boardY,boardW,boardCell);

if(this.paused)this.overlay(ctx,w,h,"PAUSED","PRESS START TO RESUME");
if(this.gameOver)this.overlay(ctx,w,h,"GAME OVER","PRESS START TO RESTART");
},
drawBackground(ctx,w,h){
const g=ctx.createLinearGradient(0,0,0,h);
g.addColorStop(0,"#07142b");
g.addColorStop(.45,"#020817");
g.addColorStop(1,"#01030a");

ctx.fillStyle=g;
ctx.fillRect(0,0,w,h);

ctx.strokeStyle="#0c63a022";
ctx.lineWidth=1;

for(let x=0;x<w;x+=16){
ctx.beginPath();
ctx.moveTo(x,0);
ctx.lineTo(x,h);
ctx.stroke();
}

for(let y=0;y<h;y+=16){
ctx.beginPath();
ctx.moveTo(0,y);
ctx.lineTo(w,y);
ctx.stroke();
}

const glow=ctx.createRadialGradient(
w*.5,h*.35,0,
w*.5,h*.35,Math.max(w,h)*.7
);

glow.addColorStop(0,"#008cff18");
glow.addColorStop(1,"transparent");

ctx.fillStyle=glow;
ctx.fillRect(0,0,w,h);
},
drawTitleScreen(ctx,w,h){
ctx.textAlign="center";
ctx.textBaseline="middle";

const pulse=.65+Math.sin(this.titlePulse*.006)*.25;

ctx.font="900 8px Arial";
ctx.fillStyle="#32baff";
ctx.shadowColor="#008cff";
ctx.shadowBlur=10;
ctx.fillText("NEONBOX",w/2,h*.18);
ctx.shadowBlur=0;

ctx.font="900 42px Arial";
ctx.fillStyle="#ff3de7";
ctx.shadowColor="#ff20e6";
ctx.shadowBlur=22;
ctx.fillText("TETRIS",w/2,h*.33);
ctx.shadowBlur=0;

const colors=["#20eaff","#ff426d","#ffe34d","#d84cff"];
const blocks=[
[-2,0,0],[-1,0,1],[0,0,2],[1,0,3],
[0,1,0],[0,2,1]
];

const size=Math.max(10,Math.min(18,w*.045));
const startX=w/2-size*2;
const startY=h*.45;

blocks.forEach(([x,y,c])=>{
ctx.fillStyle=colors[c];
ctx.shadowColor=colors[c];
ctx.shadowBlur=12;
ctx.fillRect(
startX+x*size,
startY+y*size,
size-2,
size-2
);
});

ctx.shadowBlur=0;
ctx.globalAlpha=pulse;

ctx.font="900 10px Arial";
ctx.fillStyle="#45caff";
ctx.shadowColor="#008cff";
ctx.shadowBlur=10;
ctx.fillText("PRESS START",w/2,h*.67);

ctx.globalAlpha=1;
ctx.shadowBlur=0;

ctx.font="900 6px Arial";
ctx.fillStyle="#267eb0";
ctx.fillText("A  ROTATE     B  HOLD",w/2,h*.76);
ctx.fillText("UP  HARD DROP",w/2,h*.80);

ctx.font="900 5px Arial";
ctx.fillStyle="#174b6c";
ctx.fillText("NEON ARCADE SYSTEM",w/2,h*.91);
},
drawGameHeader(ctx,w){
ctx.textAlign="center";
ctx.textBaseline="middle";

ctx.font="900 16px Arial";
ctx.fillStyle="#ff3de7";
ctx.shadowColor="#ff20e6";
ctx.shadowBlur=14;
ctx.fillText("NEONBOX TETRIS",w/2,18);

ctx.shadowBlur=0;
ctx.font="900 6px Arial";
ctx.fillStyle="#2bbfff";
ctx.fillText("ARCADE EDITION",w/2,34);
},
drawBoard(ctx,bx,by,cell){
const w=cell*this.cols;
const h=cell*this.rows;

ctx.fillStyle="#01050d";
ctx.fillRect(bx,by,w,h);

ctx.strokeStyle="#0c3960";
ctx.lineWidth=1;

for(let x=0;x<=this.cols;x++){
ctx.beginPath();
ctx.moveTo(bx+x*cell,by);
ctx.lineTo(bx+x*cell,by+h);
ctx.stroke();
}

for(let y=0;y<=this.rows;y++){
ctx.beginPath();
ctx.moveTo(bx,by+y*cell);
ctx.lineTo(bx+w,by+y*cell);
ctx.stroke();
}

for(let y=0;y<this.rows;y++){
for(let x=0;x<this.cols;x++){
const type=this.board[y][x];
if(type)this.drawCell(
ctx,
bx+x*cell,
by+y*cell,
cell,
this.colors[type]
);
}
}

if(this.flashTimer>0&&this.flashRows.length){
const a=.35+.45*Math.abs(Math.sin(this.flashTimer*.05));
ctx.fillStyle=`rgba(255,255,255,${a})`;

for(const row of this.flashRows){
ctx.fillRect(
bx,
by+row*cell,
w,
cell
);
}
}

ctx.strokeStyle="#20aaff";
ctx.lineWidth=2;
ctx.shadowColor="#008cff";
ctx.shadowBlur=10;
ctx.strokeRect(bx,by,w,h);
ctx.shadowBlur=0;
},
drawGhost(ctx,piece,ghostY,bx,by,cell){
if(!piece||ghostY===piece.y)return;

ctx.save();

const color=this.colors[piece.type];

ctx.globalAlpha=.7;
ctx.strokeStyle=color;
ctx.lineWidth=2;
ctx.shadowColor=color;
ctx.shadowBlur=8;

for(let r=0;r<piece.matrix.length;r++){
for(let c=0;c<piece.matrix[r].length;c++){
if(!piece.matrix[r][c])continue;

const x=piece.x+c;
const y=ghostY+r;

if(y<0)continue;

ctx.strokeRect(
bx+x*cell+2,
by+y*cell+2,
cell-4,
cell-4
);
}
}

ctx.globalAlpha=.18;
ctx.fillStyle=color;
ctx.shadowBlur=12;

for(let r=0;r<piece.matrix.length;r++){
for(let c=0;c<piece.matrix[r].length;c++){
if(!piece.matrix[r][c])continue;

const x=piece.x+c;
const y=ghostY+r;

if(y<0)continue;

ctx.fillRect(
bx+x*cell+3,
by+y*cell+3,
cell-6,
cell-6
);
}
}

ctx.restore();
},
drawPiece(ctx,piece,bx,by,cell,alpha=1){
if(!piece)return;

ctx.save();
ctx.globalAlpha=alpha;

for(let r=0;r<piece.matrix.length;r++){
for(let c=0;c<piece.matrix[r].length;c++){
if(!piece.matrix[r][c])continue;

const x=piece.x+c;
const y=piece.y+r;

if(y<0)continue;

this.drawCell(
ctx,
bx+x*cell,
by+y*cell,
cell,
this.colors[piece.type]
);
}
}

ctx.restore();
},
drawCell(ctx,x,y,size,color){
const pad=Math.max(1,Math.floor(size*.08));

ctx.save();

ctx.fillStyle=color;
ctx.shadowColor=color;
ctx.shadowBlur=Math.max(3,size*.25);

ctx.fillRect(
x+pad,
y+pad,
size-pad*2,
size-pad*2
);

ctx.shadowBlur=0;

const shine=ctx.createLinearGradient(
x,y,x,y+size
);

shine.addColorStop(0,"#ffffff99");
shine.addColorStop(.22,"#ffffff22");
shine.addColorStop(.3,"transparent");

ctx.fillStyle=shine;

ctx.fillRect(
x+pad,
y+pad,
size-pad*2,
size-pad*2
);

ctx.strokeStyle="#ffffff44";
ctx.lineWidth=1;

ctx.strokeRect(
x+pad+.5,
y+pad+.5,
size-pad*2-1,
size-pad*2-1
);

ctx.restore();
},
drawHUD(ctx,w,h,bx,by,boardW,cell){
const panelX=bx+boardW+10;

if(panelX+65>w-3)return;

const panelW=w-panelX-5;

this.panel(ctx,panelX,by,panelW,83,"NEXT");
this.drawMini(
ctx,
this.next,
panelX+10,
by+23,
Math.max(5,cell*.62)
);

this.panel(ctx,panelX,by+91,panelW,83,"HOLD");

if(this.hold){
this.drawMini(
ctx,
this.makePiece(this.hold),
panelX+10,
by+114,
Math.max(5,cell*.62)
);
}else{
ctx.font="900 6px Arial";
ctx.fillStyle="#267eb0";
ctx.textAlign="left";
ctx.fillText("EMPTY",panelX+10,by+143);
}

const statY=by+183;

this.stat(ctx,panelX,statY,"SCORE",this.score);
this.stat(ctx,panelX,statY+40,"HIGH",this.highScore);
this.stat(ctx,panelX,statY+80,"LINES",this.lines);
this.stat(ctx,panelX,statY+120,"LEVEL",this.level);

ctx.textAlign="center";
ctx.font="900 6px Arial";
ctx.fillStyle="#267eb0";
ctx.fillText("A ROTATE",panelX+panelW/2,h-28);
ctx.fillText("B HOLD",panelX+panelW/2,h-18);
},
panel(ctx,x,y,w,h,title){
ctx.fillStyle="#041326";
ctx.strokeStyle="#126aa3";
ctx.lineWidth=1;

ctx.beginPath();

if(ctx.roundRect)ctx.roundRect(x,y,w,h,5);
else ctx.rect(x,y,w,h);

ctx.fill();
ctx.stroke();

ctx.font="900 6px Arial";
ctx.fillStyle="#ff3de7";
ctx.textAlign="left";
ctx.fillText(title,x+7,y+10);
},
stat(ctx,x,y,label,value){
ctx.textAlign="left";
ctx.font="900 5px Arial";
ctx.fillStyle="#267eb0";
ctx.fillText(label,x,y);

ctx.font="900 8px Arial";
ctx.fillStyle="#dff8ff";
ctx.fillText(String(value),x,y+12);
},
drawMini(ctx,piece,x,y,size){
if(!piece)return;

const matrix=piece.matrix;
const maxW=55;
const scale=matrix[0].length*size>maxW?
maxW/matrix[0].length:
size;

for(let r=0;r<matrix.length;r++){
for(let c=0;c<matrix[r].length;c++){
if(matrix[r][c]){
this.drawCell(
ctx,
x+c*scale,
y+r*scale,
scale,
this.colors[piece.type]
);
}
}
}
},
overlay(ctx,w,h,title,subtitle){
ctx.fillStyle="#000c";
ctx.fillRect(0,0,w,h);

ctx.textAlign="center";
ctx.textBaseline="middle";

ctx.font="900 27px Arial";
ctx.fillStyle="#ff3de7";
ctx.shadowColor="#ff20e6";
ctx.shadowBlur=18;

ctx.fillText(title,w/2,h*.46);

ctx.shadowBlur=0;
ctx.font="900 7px Arial";
ctx.fillStyle="#45caff";
ctx.fillText(subtitle,w/2,h*.53);
},
stop(){
this.ctx=null;
this.canvas=null;
}
});