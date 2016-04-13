module.exports = {
  convert: convert
}

const morse = require('morse');
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

const short = path.join(__dirname, 'short.mp3');
const long = path.join(__dirname, 'long.mp3');
const silent = path.join(__dirname, 'silent.mp3');


function convert (code, exportFile) {
  var stream;
  var dhh = fs.createWriteStream(exportFile);

  const morseCode = code.split(' ').map(word => morse.encode(word)); // the lib gives spaces 6 or so dots, and this is the easiest way to take that out without depending on the space to be 6 dots

  const morseFiles = morseCode.reduce((prev, curr) => {
    var tempArray = [];
    try {
      for (position in curr) {
        switch (curr[position]) {
          case '.':
            tempArray.push(short);
            break;
          case '-':
            tempArray.push(long);
            break;
          case ' ':
            tempArray.push(silent);
            break;
          default:
            throw 'Error: impure morse code';
            break;
        }
      }
    } catch(e){
      console.log(e.message);
    }
    tempArray.push(silent, silent, silent); //for a space inbetween words
    return prev.concat(tempArray);
  }, []);

  return new Promise((resolve, reject) => {
    resolve(concatAudio(morseFiles, exportFile).then((msg) => {
      return msg;
    }));
  });

  function concatAudio(files, exportName) {
    return new Promise((resolve, reject) => {
      if (!files.length) {
        dhh.end('Done');
        resolve(`Done, exporting audio at ${exportName}`);
      }

      stream = fs.createReadStream(files[0]);

      stream.pipe(dhh, {end: false});
      stream.on('end', function() {
        resolve (concatAudio(files.slice(1, files.length), exportName));
      });
    })
  }
}
