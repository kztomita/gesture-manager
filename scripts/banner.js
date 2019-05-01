const revision = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString().trim();

const banner =
'/*!\n' +
' * GestureManager\n' +
' *\n' +
' * Copyright (c) 2019 Kazuyoshi Tomita\n' +
' *\n' +
' * This software is released under the MIT License.\n' +
' * https://opensource.org/licenses/MIT\n' +
' *\n' +
' * Version: ' + require('./package.json').version +'\n' +
' * Commit: ' + revision +'\n' +
' * Build: ' + new Date() +'\n' +
' */\n';

export default banner;
