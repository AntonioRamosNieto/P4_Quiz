const readline = require('readline');
const model=require('./model.js');
const {log,biglog,errorlog,colorize}=require("./out");
const cdms=require('./cdms.js');
const net= require("net");


net.createServer(socket => {
	console.log("se ha conectado un cliente desde "+socket.remoteAddress);
	biglog(socket,'CORE Quiz','green');


	const rl = readline.createInterface({
  		input: socket,
  		output: socket,
  		prompt: 'quiz> ',
  		completer(line) {
  		  const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
  		  const hits = completions.filter((c) => c.startsWith(line));
  		  // show all completions if none found
  		  return [hits.length ? hits : completions, line];
		}
	});
	
	socket
	.on("end",()=> {rl.close();})
	.on("error",()=> {rl.close();})

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
	      cdms.helpCmd(socket,rl);
	      break;
	
	    case 'q':
	    case 'quit':
	      cdms.quitCmd(socket,rl);
	      break;
	
	    case 'show':
	      cdms.showCmd(socket,rl,args[1]);
	      break;
	
	    case 'add':
	      cdms.addCmd(socket,rl);
	      break;
	
	    case 'list':
	      cdms.listCmd(socket,rl);
	      break;
	
	    case 'play':
	    case 'p':
	      cdms.playCmd(socket,rl);
	      break;

	    case 'delete':
	      cdms.deleteCmd(socket,rl,args[1]);
	      break;

	    case 'edit':
	      cdms.editCmd(socket,rl,args[1]);
	      break;

	    case 'test':
	      cdms.testCmd(socket,rl,args[1]);
	      break;

	    case 'credits':
	      cdms.creditsCmd(socket,rl);
	      break;

	    default:
	      log(socket,`comando desconocido '${colorize(cmd,'red')}'`);
	      log(socket,`Use ${colorize('help','green')} para ver los comandos disponibles.`);
	      rl.prompt();
	      break;
	  }
	  
	}).on('close', () => {
	  log(socket,'Adios');
	  
	});


})
.listen(3030);


