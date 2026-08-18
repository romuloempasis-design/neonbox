"use strict";

const Neonbox={
  version:"0.2.0",
  game:null,
  games:{},
  library:[],
  libraryIndex:0,
  libraryOpen:false,
  systemMenu:false,
  systemIndex:0,
  held:{},
  canvas:null,
  ctx:null,
  lastTime:0,
  storagePrefix:"neonbox:",
  audioContext:null,

  init(){
    this.canvas=document.getElementById("neonbox-screen");
    if(!this.canvas)throw new Error("Neonbox screen canvas not found.");

    this.ctx=this.canvas.getContext("2d");
    this.resize();

    window.addEventListener("resize",()=>this.resize());

    this.bindController();
    this.showBootScreen();

    requestAnimationFrame(t=>this.loop(t));
  },

  resize(){
    if(!this.canvas)return;

    const r=this.canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);

    this.canvas.width=Math.max(1,Math.floor(r.width*dpr));
    this.canvas.height=Math.max(1,Math.floor(r.height*dpr));

    this.ctx.setTransform(dpr,0,0,dpr,0,0);

    if(this.libraryOpen)this.showLibrary();
    if(this.systemMenu)this.showSystemMenu();
  },

  clear(){
    this.ctx.clearRect(
      0,
      0,
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );
  },

  registerGame(game){
    if(!game)throw new Error("Game is required.");
    if(!game.id)throw new Error("Game requires an id.");
    if(typeof game.render!=="function")
      throw new Error(`Game "${game.id}" requires render().`);

    this.games[game.id]=game;

    console.log(`[Neonbox] Game registered: ${game.id}`);

    return game;
  },

  async loadGame(url){
    if(typeof url!=="string")
      throw new TypeError("Game URL must be a string.");

    const scripts=document.querySelectorAll(
      "script[data-neonbox-game]"
    );

    for(const script of scripts){
      if(script.dataset.neonboxGame===url)return true;
    }

    await new Promise((resolve,reject)=>{
      const script=document.createElement("script");

      script.src=url;
      script.dataset.neonboxGame=url;

      script.onload=()=>resolve(true);

      script.onerror=()=>{
        reject(
          new Error(`Could not load game: ${url}`)
        );
      };

      document.body.appendChild(script);
    });

    return true;
  },

  async launchURL(url,id){
    try{
      await this.loadGame(url);
      return this.launch(id);
    }catch(error){
      console.error("[Neonbox] Game launch failed:",error);
      this.showError("GAME LOAD ERROR",error.message);
      return false;
    }
  },

  launch(id){
    const game=this.games[id];

    if(!game){
      this.showError("GAME NOT FOUND",id);
      return false;
    }

    this.stop();

    this.libraryOpen=false;
    this.systemMenu=false;
    this.game=game;

    try{
      if(typeof game.start==="function")
        game.start(this);
    }catch(error){
      console.error("[Neonbox] Game start error:",error);
      this.game=null;
      this.showError("GAME START ERROR",error.message);
      return false;
    }

    console.log(`[Neonbox] Launching: ${id}`);

    return true;
  },

  stop(){
    if(
      this.game&&
      typeof this.game.stop==="function"
    ){
      try{
        this.game.stop();
      }catch(error){
        console.error("[Neonbox] Game stop error:",error);
      }
    }

    this.game=null;
  },

  async loadLibrary(){
    const response=await fetch(
      "games/games.json",
      {cache:"no-cache"}
    );

    if(!response.ok)
      throw new Error(
        `Could not load games.json (${response.status})`
      );

    const data=await response.json();

    if(!Array.isArray(data.games))
      throw new Error("Invalid Neonbox game library.");

    this.library=data.games;
    this.libraryIndex=0;

    console.log(
      `[Neonbox] Loaded ${this.library.length} game(s).`
    );

    return this.library;
  },

  async launchLibraryGame(id){
    const entry=this.library.find(game=>game.id===id);

    if(!entry)
      throw new Error(`Game "${id}" is not in the library.`);

    return this.launchURL(
      entry.script,
      entry.id
    );
  },

  navigateLibrary(direction){
    if(!this.library.length)return;

    this.libraryIndex+=direction;

    if(this.libraryIndex<0)
      this.libraryIndex=this.library.length-1;

    if(this.libraryIndex>=this.library.length)
      this.libraryIndex=0;

    this.beep(520,.04);
    this.showLibrary();
  },

  showLibrary(){
    const ctx=this.ctx;
    const canvas=this.canvas;
    const w=canvas.clientWidth;
    const h=canvas.clientHeight;

    ctx.fillStyle="#010812";
    ctx.fillRect(0,0,w,h);

    ctx.strokeStyle="#168cff18";
    ctx.lineWidth=1;

    for(let x=0;x<=w;x+=20){
      ctx.beginPath();
      ctx.moveTo(x,0);
      ctx.lineTo(x,h);
      ctx.stroke();
    }

    for(let y=0;y<=h;y+=20){
      ctx.beginPath();
      ctx.moveTo(0,y);
      ctx.lineTo(w,y);
      ctx.stroke();
    }

    ctx.textAlign="center";
    ctx.textBaseline="middle";

    ctx.font="900 24px Arial";
    ctx.fillStyle="#ff3de7";
    ctx.shadowColor="#ff20e6";
    ctx.shadowBlur=15;

    ctx.fillText(
      "NEONBOX",
      w/2,
      38
    );

    ctx.font="900 9px Arial";
    ctx.fillStyle="#38c5ff";
    ctx.shadowColor="#008cff";
    ctx.shadowBlur=10;

    ctx.fillText(
      "GAME LIBRARY",
      w/2,
      62
    );

    ctx.shadowBlur=0;

    if(!this.library.length){
      ctx.font="900 12px Arial";
      ctx.fillStyle="#ff3d6e";

      ctx.fillText(
        "NO GAMES INSTALLED",
        w/2,
        h/2
      );

      return;
    }

    let y=105;

    this.library.forEach((game,index)=>{
      const selected=index===this.libraryIndex;

      ctx.fillStyle=selected?"#102f58":"#071a34";
      ctx.strokeStyle=selected?"#ff3de7":"#159dff";
      ctx.lineWidth=selected?2:1;

      ctx.beginPath();

      ctx.roundRect(
        25,
        y-20,
        w-50,
        55,
        8
      );

      ctx.fill();
      ctx.stroke();

      if(selected){
        ctx.shadowColor="#ff20e6";
        ctx.shadowBlur=12;
        ctx.stroke();
        ctx.shadowBlur=0;
      }

      ctx.textAlign="left";

      ctx.font="900 13px Arial";
      ctx.fillStyle=selected?"#fff":"#ff3de7";

      ctx.fillText(
        `${index+1}. ${game.title}`,
        40,
        y
      );

      ctx.font="8px Arial";
      ctx.fillStyle="#38c5ff";

      ctx.fillText(
        `${game.author||"Unknown"} • v${game.version||"1.0.0"}`,
        40,
        y+17
      );

      y+=65;
    });

    ctx.textAlign="center";
    ctx.font="900 8px Arial";
    ctx.fillStyle="#267eb0";

    ctx.fillText(
      "▲ ▼ SELECT   A / START PLAY",
      w/2,
      h-22
    );
  },

  openSystemMenu(){
    if(!this.game||this.libraryOpen)return;

    this.systemMenu=true;
    this.systemIndex=0;

    this.beep(520,.06);
    this.showSystemMenu();
  },

  closeSystemMenu(){
    this.systemMenu=false;
    this.beep(300,.04);
  },

  systemAction(){
    if(this.systemIndex===0){
      this.closeSystemMenu();
      return;
    }

    if(this.systemIndex===1){
      const id=this.game?.id;

      this.closeSystemMenu();

      if(id)this.launch(id);

      return;
    }

    if(this.systemIndex===2){
      this.stop();

      this.systemMenu=false;
      this.libraryOpen=true;
      this.libraryIndex=0;

      this.showLibrary();
    }
  },

  showSystemMenu(){
    const ctx=this.ctx;
    const canvas=this.canvas;
    const w=canvas.clientWidth;
    const h=canvas.clientHeight;

    if(
      this.game&&
      typeof this.game.render==="function"
    ){
      try{
        ctx.save();
        this.game.render(ctx,canvas);
        ctx.restore();
      }catch(error){}
    }

    ctx.fillStyle="#000b";
    ctx.fillRect(0,0,w,h);

    ctx.textAlign="center";
    ctx.textBaseline="middle";

    ctx.font="900 22px Arial";
    ctx.fillStyle="#ff3de7";
    ctx.shadowColor="#ff20e6";
    ctx.shadowBlur=15;

    ctx.fillText(
      "NEONBOX",
      w/2,
      h*.25
    );

    ctx.shadowBlur=0;

    const items=[
      "RESUME",
      "RESTART",
      "EXIT TO LIBRARY"
    ];

    items.forEach((item,i)=>{
      const y=h*.43+i*42;
      const selected=i===this.systemIndex;

      ctx.fillStyle=
        selected
          ? "#ff3de7"
          : "#071a34";

      ctx.strokeStyle=
        selected
          ? "#ff3de7"
          : "#159dff";

      ctx.lineWidth=
        selected
          ? 2
          : 1;

      ctx.beginPath();

      ctx.roundRect(
        35,
        y-15,
        w-70,
        30,
        7
      );

      ctx.fill();
      ctx.stroke();

      ctx.font="900 9px Arial";

      ctx.fillStyle=
        selected
          ? "#fff"
          : "#38c5ff";

      ctx.fillText(
        item,
        w/2,
        y
      );
    });

    ctx.font="900 7px Arial";
    ctx.fillStyle="#267eb0";

    ctx.fillText(
      "▲ ▼ SELECT   A / START",
      w/2,
      h-20
    );
  },

  sendInput(button){

    if(this.systemMenu){

      if(button==="UP"){
        this.systemIndex--;

        if(this.systemIndex<0)
          this.systemIndex=2;

        this.showSystemMenu();
        return;
      }

      if(button==="DOWN"){
        this.systemIndex++;

        if(this.systemIndex>2)
          this.systemIndex=0;

        this.showSystemMenu();
        return;
      }

      if(button==="A"||button==="START"){
        this.systemAction();
        return;
      }

      if(button==="B"||button==="SELECT"){
        this.closeSystemMenu();
        return;
      }

      return;
    }

    if(this.libraryOpen){

      if(button==="UP"){
        this.navigateLibrary(-1);
        return;
      }

      if(button==="DOWN"){
        this.navigateLibrary(1);
        return;
      }

      if(button==="A"||button==="START"){
        const game=this.library[this.libraryIndex];

        if(game){
          this.libraryOpen=false;
          this.beep(880,.08);
          this.launchLibraryGame(game.id);
        }

        return;
      }

      return;
    }

    if(!this.game)return;

    if(typeof this.game.input!=="function")
      return;

    try{
      this.game.input(button);
    }catch(error){
      console.error(
        "[Neonbox] Game input error:",
        error
      );
    }
  },

  bindController(){

    document
      .querySelectorAll("[data-input]")
      .forEach(button=>{

        const input=button.dataset.input;

        button.addEventListener(
          "pointerdown",
          event=>{
            event.preventDefault();

            button.classList.add("pressed");

            this.held[input]=true;

            if(
              this.held.START&&
              this.held.SELECT
            ){
              this.openSystemMenu();
              return;
            }

            this.sendInput(input);
          }
        );

        button.addEventListener(
          "pointerup",
          event=>{
            event.preventDefault();

            button.classList.remove("pressed");
            this.held[input]=false;
          }
        );

        button.addEventListener(
          "pointercancel",
          ()=>{
            button.classList.remove("pressed");
            this.held[input]=false;
          }
        );

        button.addEventListener(
          "pointerleave",
          ()=>{
            button.classList.remove("pressed");
            this.held[input]=false;
          }
        );
      });

    const map={
      ArrowUp:"UP",
      ArrowDown:"DOWN",
      ArrowLeft:"LEFT",
      ArrowRight:"RIGHT",
      z:"A",
      Z:"A",
      x:"B",
      X:"B",
      Enter:"START",
      Escape:"SELECT"
    };

    window.addEventListener(
      "keydown",
      event=>{
        const input=map[event.key];

        if(!input)return;

        event.preventDefault();

        if(event.repeat)return;

        this.held[input]=true;

        if(
          this.held.START&&
          this.held.SELECT
        ){
          this.openSystemMenu();
          return;
        }

        this.sendInput(input);
      }
    );

    window.addEventListener(
      "keyup",
      event=>{
        const input=map[event.key];

        if(input)
          this.held[input]=false;
      }
    );

    window.addEventListener(
      "blur",
      ()=>{
        this.held={};
      }
    );
  },

  save(key,value){
    localStorage.setItem(
      this.storagePrefix+key,
      JSON.stringify(value)
    );
  },

  load(key,fallback=null){
    const value=localStorage.getItem(
      this.storagePrefix+key
    );

    if(value===null)return fallback;

    try{
      return JSON.parse(value);
    }catch{
      return fallback;
    }
  },

  removeSave(key){
    localStorage.removeItem(
      this.storagePrefix+key
    );
  },

  beep(
    frequency=440,
    duration=.08,
    type="square"
  ){
    try{
      if(!this.audioContext){
        this.audioContext=
          new(
            window.AudioContext||
            window.webkitAudioContext
          )();
      }

      if(
        this.audioContext.state==="suspended"
      ){
        this.audioContext.resume();
      }

      const audio=this.audioContext;

      const oscillator=
        audio.createOscillator();

      const gain=
        audio.createGain();

      oscillator.type=type;
      oscillator.frequency.value=frequency;

      gain.gain.setValueAtTime(
        .08,
        audio.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        .001,
        audio.currentTime+duration
      );

      oscillator.connect(gain);
      gain.connect(audio.destination);

      oscillator.start();

      oscillator.stop(
        audio.currentTime+duration
      );

    }catch(error){
      console.warn(
        "[Neonbox] Audio unavailable:",
        error
      );
    }
  },

  vibrate(duration=20){
    if("vibrate" in navigator)
      navigator.vibrate(duration);
  },

  showBootScreen(){
    const ctx=this.ctx;
    const canvas=this.canvas;
    const w=canvas.clientWidth;
    const h=canvas.clientHeight;

    ctx.fillStyle="#010812";
    ctx.fillRect(0,0,w,h);

    ctx.strokeStyle="#168cff18";
    ctx.lineWidth=1;

    for(let x=0;x<=w;x+=20){
      ctx.beginPath();
      ctx.moveTo(x,0);
      ctx.lineTo(x,h);
      ctx.stroke();
    }

    for(let y=0;y<=h;y+=20){
      ctx.beginPath();
      ctx.moveTo(0,y);
      ctx.lineTo(w,y);
      ctx.stroke();
    }

    ctx.textAlign="center";
    ctx.textBaseline="middle";

    ctx.font="900 32px Arial";
    ctx.fillStyle="#ff3de7";
    ctx.shadowColor="#ff20e6";
    ctx.shadowBlur=15;

    ctx.fillText(
      "NEONBOX",
      w/2,
      h*.42
    );

    ctx.font="900 10px Arial";
    ctx.fillStyle="#38c5ff";
    ctx.shadowColor="#008cff";
    ctx.shadowBlur=10;

    ctx.fillText(
      "NEONBOX OS",
      w/2,
      h*.52
    );

    ctx.font="900 9px Arial";

    ctx.fillText(
      "LOADING GAME LIBRARY...",
      w/2,
      h*.62
    );
  },

  showError(title,message){
    const ctx=this.ctx;
    const canvas=this.canvas;
    const w=canvas.clientWidth;
    const h=canvas.clientHeight;

    ctx.fillStyle="#080108";
    ctx.fillRect(0,0,w,h);

    ctx.textAlign="center";
    ctx.textBaseline="middle";

    ctx.font="900 20px Arial";
    ctx.fillStyle="#ff3d6e";
    ctx.shadowColor="#ff174f";
    ctx.shadowBlur=15;

    ctx.fillText(
      title,
      w/2,
      h*.42
    );

    ctx.font="10px Arial";
    ctx.fillStyle="#ff9bb5";
    ctx.shadowBlur=0;

    let text=String(
      message||"Unknown error"
    );

    if(text.length>42)
      text=text.substring(0,42)+"...";

    ctx.fillText(
      text,
      w/2,
      h*.53
    );
  },

  loop(time){
    const delta=this.lastTime
      ? time-this.lastTime
      : 0;

    this.lastTime=time;

    if(
      this.game&&
      !this.libraryOpen&&
      !this.systemMenu
    ){
      try{

        if(typeof this.game.update==="function")
          this.game.update(delta);

        this.clear();

        this.game.render(
          this.ctx,
          this.canvas
        );

      }catch(error){

        console.error(
          "[Neonbox] Game runtime error:",
          error
        );

        this.stop();

        this.showError(
          "GAME ERROR",
          error.message
        );
      }
    }

    requestAnimationFrame(
      t=>this.loop(t)
    );
  }
};

Neonbox.init();

window.Neonbox=Neonbox;

Neonbox
  .loadLibrary()
  .then(()=>{
    Neonbox.libraryOpen=true;
    Neonbox.showLibrary();
  })
  .catch(error=>{
    console.error(
      "[Neonbox] Library failed:",
      error
    );

    Neonbox.showError(
      "LIBRARY ERROR",
      error.message
    );
  });