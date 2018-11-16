/*
    SMART LOCK
    Use Cases:
        1. Toggle lock / unlock from inside
        2. Unlock via passcode from outside
        3. Lock from outside
        4. Notification of max failed attempts to unlock from outside
 */
var five = require("johnny-five");
var board = new five.Board( );
var servo, led, btnToggle, btnA, btnB, btnC, btnD;
var PASSCODE = "AABBCCDD", tryCode = []; // A-B-C-D button combination
var timer, INPUT_DELTA = 1500; // 1.5 seconds allowed between code input
var failures = 0, MAXFAILS = 5;
var watchDogTimer = function() {
  clearTimeout(timer);
  timer = setTimeout( function(){
    if( tryCode.length === 8 && PASSCODE === tryCode.join('') ) { // FEATURE 2: UNLOCK USING PASSCODE FROM OUTSIDE
      servo.to(0);
      led.off();
      console.log('PASS CODE ACCEPTED: UNLOCK');
    } else { // FEATURE 4: ALERT WHEN MAX FAILED ATTEMPTS FROM OUTSIDE
      failures += 1;
      console.log('PASS CODE REJECTED');
      if( failures === MAXFAILS ) {
        console.log('MAX FAILED ATTEMPTS: SMS');
        failures = 0;
      }
    }
    tryCode = [];
  }, INPUT_DELTA);
};
board.on("ready", function() {
  led = new five.Led(13);
  servo = new five.Servo({ pin: 6, startAt: 0});
  btnToggle = new five.Button({pin: 10, isPullup: true });
  btnA = new five.Button({pin: 2, isPullup: true});
  btnB = new five.Button({pin: 3, isPullup: true});
  btnC = new five.Button({pin: 4, isPullup: true});
  btnD = new five.Button({pin: 5, isPullup: true});

  btnToggle.on("press", function() { // FEATURE 1: MANUAL LOCK / UNLOCK FROM INSIDE
    var status = servo.position;
    console.log( 'TOGGLE: ' + (status === 0 ? 'LOCKED' : 'UNLOCKED'));
    if(status === 0){
      servo.to(90);
      led.on();
    } else{
      servo.to(0);
      led.off();
    }
  });

  btnA.on("press", function(){
    tryCode.push("A");
    watchDogTimer();
  });
  btnA.on("hold", function(){ // FEATURE 3: LOCK FROM OUTSIDE
    tryCode = [];
    clearTimeout(timer);
    if( servo.position !== 90 ) {
      servo.to(90);
      console.log('LOCKED FROM OUTSIDE');
      led.on();
    }
  });
  btnB.on("press", function(){
    tryCode.push("B");
    watchDogTimer();
  });
  btnC.on("press", function(){
    tryCode.push("C");
    watchDogTimer();
  });
  btnD.on("press", function(){
    tryCode.push("D");
    watchDogTimer();
  });
});