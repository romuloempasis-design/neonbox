"use strict";

/*
 * =========================================================
 * NEONBOX TEST GAME
 * API VERSION: 0.1.0
 * =========================================================
 */

Neonbox.registerGame({

  id: "test",

  title: "Neonbox Test",

  author: "Neonbox",

  version: "0.1.0",


  /* =======================================================
     START
  ======================================================= */

  start(console) {

    this.console =
      console;

    this.x =
      50;

    this.direction =
      1;

    this.color =
      "#ff3de7";

    this.lastInput =
      "NONE";


    console.beep(
      660,
      0.12
    );

  },


  /* =======================================================
     UPDATE
  ======================================================= */

  update(delta) {

    this.x +=
      this.direction *
      delta *
      0.08;


    if (
      this.x >= 100
    ) {

      this.x = 100;

      this.direction =
        -1;

    }


    if (
      this.x <= 0
    ) {

      this.x = 0;

      this.direction =
        1;

    }

  },


  /* =======================================================
     RENDER
  ======================================================= */

  render(ctx, canvas) {

    const width =
      canvas.clientWidth;

    const height =
      canvas.clientHeight;


    /*
     * Background
     */

    ctx.fillStyle =
      "#010812";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    /*
     * Grid
     */

    ctx.strokeStyle =
      "#168cff18";

    ctx.lineWidth = 1;


    for (
      let x = 0;
      x < width;
      x += 20
    ) {

      ctx.beginPath();

      ctx.moveTo(
        x,
        0
      );

      ctx.lineTo(
        x,
        height
      );

      ctx.stroke();

    }


    for (
      let y = 0;
      y < height;
      y += 20
    ) {

      ctx.beginPath();

      ctx.moveTo(
        0,
        y
      );

      ctx.lineTo(
        width,
        y
      );

      ctx.stroke();

    }


    /*
     * Logo
     */

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.font =
      "900 30px Arial";

    ctx.fillStyle =
      "#ff3de7";

    ctx.shadowColor =
      "#ff20e6";

    ctx.shadowBlur =
      15;


    ctx.fillText(
      "NEONBOX",
      width / 2,
      height * 0.34
    );


    /*
     * External game status
     */

    ctx.font =
      "900 10px Arial";

    ctx.fillStyle =
      "#38c5ff";

    ctx.shadowColor =
      "#008cff";

    ctx.shadowBlur =
      10;


    ctx.fillText(
      "EXTERNAL GAME ONLINE",
      width / 2,
      height * 0.46
    );


    /*
     * API status
     */

    ctx.font =
      "900 8px Arial";

    ctx.fillStyle =
      "#267eb0";

    ctx.shadowBlur = 0;


    ctx.fillText(
      "NEONBOX API 0.1.0",
      width / 2,
      height * 0.52
    );


    /*
     * Last input
     */

    ctx.fillStyle =
      "#38c5ff";


    ctx.fillText(
      `INPUT: ${this.lastInput}`,
      width / 2,
      height * 0.59
    );


    /*
     * Moving object
     */

    const objectX =
      20 +
      (
        this.x / 100
      ) *
      (width - 40);


    const objectY =
      height * 0.72;


    ctx.beginPath();


    ctx.arc(
      objectX,
      objectY,
      8,
      0,
      Math.PI * 2
    );


    ctx.fillStyle =
      this.color;

    ctx.shadowColor =
      this.color;

    ctx.shadowBlur =
      18;


    ctx.fill();

  },


  /* =======================================================
     INPUT
  ======================================================= */

  input(button) {

    this.lastInput =
      button;


    console.log(
      "[Neonbox Test]",
      button
    );


    if (
      button === "A"
    ) {

      this.color =
        "#ff3de7";

      this.console.beep(
        880,
        0.08
      );

    }


    if (
      button === "B"
    ) {

      this.color =
        "#21e6ff";

      this.console.beep(
        440,
        0.08
      );

    }


    if (
      button === "LEFT"
    ) {

      this.x -= 10;

    }


    if (
      button === "RIGHT"
    ) {

      this.x += 10;

    }


    if (
      button === "UP"
    ) {

      this.console.vibrate(
        20
      );

    }


    if (
      button === "DOWN"
    ) {

      this.console.beep(
        220,
        0.08
      );

    }

  },


  /* =======================================================
     STOP
  ======================================================= */

  stop() {

    console.log(
      "[Neonbox Test] stopped"
    );

  }

});