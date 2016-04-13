#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const morseToMp3 = (require('../').convert);
const Promise = require('bluebird');

const run = Promise.promisify(require('child_process').exec);

var exportFile;

switch (process.argv.length) {
  case 4:
    exportFile = path.join(process.cwd(), process.argv[2]);
    morseToMp3(process.argv[3], exportFile)
    .then((msg) => {
      console.log(msg);
      playAudio(exportFile);
      process.exit();
      return;
    })
    break;
  case 3:
    exportFile = path.join(__dirname, 'tempFileMorseToMp3.mp3');
    morseToMp3(process.argv[2], exportFile)
    .then(() => {
      return playAudio(exportFile)
    })
    .then(() => {
      return fs.unlink(exportFile);
    });
    break;
  default:
    console.log('Error: incorrect number of args');
    break;
}


function playAudio() {
  return new Promise((resolve, reject) => {
    switch (process.platform) {
      case 'darwin':
        resolve(run(`afplay ${exportFile}`));
        break;
      case 'win32':
        resolve(run(`powershell -c (New-Object Media.SoundPlayer ${exportFile}).PlaySync()`));
      break;
      default:
        console.log('Sorry, playing audio from CLI is not supported on your OS');
        break;
    }
  });
}
