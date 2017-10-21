const fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
const cuid = require('cuid');
const crypto = require('crypto');

const maxFiles = 5;
const maxFolder = 5;
const maxLevel = 5;

const keyLevel = Math.floor(Math.random() * maxLevel) + 1;
const keyHash = argv.NEEDLE || 'NEEDLE';
const keyFileName = argv.HASH || 'HASH';
const path = argv.PATH || './hash-fs'

// Ensure root path exists.
if (!fs.existsSync(path)) {
  fs.mkdirSync(path);
}

console.log('LEVELS:', keyLevel);

function createLevel(root, level = 0, amIkeyPath) {
  const folderAmount = Math.floor(Math.random() * maxFolder + 1);
  const filesAmount = Math.floor(Math.random() * maxFiles + 1);

  const keyOrder = Math.floor(Math.random() * (keyLevel === level && amIkeyPath ? filesAmount : folderAmount));
  if (level === maxLevel) {
    return;
  }

  for (var i = 0; i < folderAmount; i++) {
    let name;
    let filePath;
    do {
      name = getHash();
      filePath = root + '/' + name;
    } while(fs.existsSync(filePath))

    fs.mkdirSync(filePath);

    const secretDirection = keyOrder === i && keyLevel !== level && amIkeyPath;

    createLevel(filePath, level + 1,  secretDirection);

    // console.log('creating:',root + '/' + name);
  }
  for (var i = 0; i < filesAmount; i++) {
    let name;
    let filePath;
    do {
      name = getHash();
      filePath = root + '/' + name;
    } while(fs.existsSync(filePath))

    const secretDirection = keyOrder === i && keyLevel === level && amIkeyPath;

    if (secretDirection) {
      console.log('WRITING THE SECRET!', root + '/' + keyFileName);
      const content = makeString(keyHash);
      fs.writeFileSync(root + '/' + keyFileName, content, 'utf8');
    } else {
      const content = makeString();
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}

function makeString(hash = '') {
  let randomText = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const contentLength = Math.floor(Math.random() * 1000);
  for (let i = 0; i < contentLength; i++) {
    randomText += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  randomText = `${randomText}${hash}${randomText}`
  return randomText;
}

function getHash() {
  const generator = crypto.createHash('sha512');
  generator.update(cuid());
  return generator.digest('hex');
}

createLevel(path, 0, true);
