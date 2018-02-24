const readline = require('readline');
const model=require('./model.js');
const {log,biglog,errorlog,colorize}=require("./out");
const cdms=require('./cdms.js')

biglog('CORE Quiz','green');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'quiz> ',
  completer(line) {
    const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
    const hits = completions.filter((c) => c.startsWith(line));
    // show all completions if none found
    return [hits.length ? hits : completions, line];
}
});

rl.prompt();

rl.on('line', (line) => {

  let args=line.split(" ");
  let cmd = args[0].toLowerCase().trim();

  switch (cmd) {
    case '':
      rl.prompt();
      break;
    case 'help':
    case 'h':
      cdms.helpCmd(rl);
      break;

    case 'q':
    case 'quit':
      cdms.quitCmd(rl);
      break;

    case 'show':
      cdms.showCmd(rl,args[1]);
      break;

    case 'add':
      cdms.addCmd(rl);
      break;

    case 'list':
      cdms.listCmd(rl);
      break;

    case 'play':
    case 'p':
      cdms.playCmd(rl);
      break;

    case 'delete':
      cdms.deleteCmd(rl,args[1]);
      break;

    case 'edit':
      cdms.editCmd(rl,args[1]);
      break;

    case 'test':
      cdms.testCmd(rl,args[1]);
      break;

    case 'credits':
      cdms.creditsCmd(rl);
      break;

    default:
      console.log(`comando desconocido '${colorize(cmd,'red')}'`);
      console.log(`Use ${colorize('help','green')} para ver los comandos disponibles.`);
      rl.prompt();
      break;
  }
  
}).on('close', () => {
  console.log('Adios');
  process.exit(0);
});

