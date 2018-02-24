
const model=require('./model.js');
const {log,biglog,errorlog,colorize}=require("./out");



exports.helpCmd = (rl) => {
  log("Comandos:");
  log(" h|help - Muestra esta ayuda.");
  log(" list - Listar los quizzes existentes.");
  log(" show <id> - Muestra la pregunta y la respuesta del quiz indicado");
  log(" add - Añadir un nuevo quiz interactivamente.");
  log(" delete <id> - Borrar el quiz indicado.");
  log(" edit <id> - Editar el quiz indicado.");
  log(" test <id> - Probar el test indicado.");
  log(" p|play - Jugar a preguntar aleatoricamente todos los quizzes");
  log(" credits - Creditos.");
  log(" q|quit - Salir  del programa");
  rl.prompt();
}

exports.quitCmd = (rl) => {
  rl.close();
}

exports.addCmd = (rl) => {
  rl.question(colorize('Introduzca una pregunta:','red'),question=>{

    rl.question(colorize('Introduzca la respuesta:','red'),answer=>{

	model.add(question,answer);
	log(` ${colorize('se ha añadido','magenta')}: ${question} ${colorize("=>",'magenta')} ${answer}`);
	rl.prompt();
    });
    
  });
  
}

exports.showCmd = (rl,id) => {
  if(typeof id === "undefined"){
    errorlog('Falta el parámetro id.');
  }else{
    try{
	const quiz =model.getByIndex(id);
	log(` [${colorize(id,'magenta')}]: ${quiz.question} ${colorize("=>",'magenta')} ${quiz.answer}`);
    }catch(error){
	errorlog(error.message);
    }
  }
  
  rl.prompt();
}

exports.listCmd = (rl) => {
  model.getAll().forEach((quiz,id)=>{
    log(` [${colorize(id,'magenta')}]: ${quiz.question}`)
  });
  rl.prompt();
}

exports.playCmd = (rl) => {
	let score=0;
	let quedan=[];
	let i=0;
	bucle: for(i=0;;i++){
		try{
			const s =model.getByIndex(i);
			quedan[i]=i;
		}catch(error){
			break bucle;
		}
		
	}
	
	const playOne=()=>{
		if(quedan.length <= 0){
			log('Quiz terminado','yellow');
			log(`Respuestas correctas: ${colorize(score,'magenta')}`);
			rl.prompt();
		}else{
			let id=Math.floor(Math.random()*(quedan.length));
			let quiz=model.getByIndex(quedan[id]);
			quedan.splice(id,1);
			rl.question(colorize(`${quiz.question}? `,'red'),respuesta=>{
				if(respuesta.toLowerCase().trim()===quiz.answer.toLowerCase()){
					biglog('CORRECTO','green');
					score++;
					log(`lleva ${score} aciertos.`);
					playOne();
				}else{
					biglog('INCORRECTO','red');
					log(`Respuestas correctas: ${colorize(score,'magenta')}`);
					rl.prompt();
				}
			});

		}
	};
	playOne();
}

exports.deleteCmd = (rl,id) => {
  if(typeof id === "undefined"){
    errorlog('Falta el parámetro id.');
  }else{
    try{
	const quiz =model.deleteByIndex(id);
    }catch(error){
	errorlog(error.message);
    }
  }

  rl.prompt();
}

exports.editCmd= (rl,id) =>{
  if(typeof id === "undefined"){
    errorlog('Falta el parámetro id.');
    rl.prompt();
  }else{
	try{
	  const quiz = model.getByIndex(id);
	  process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.question)},0);
    
	  rl.question(colorize('Introduzca una pregunta:','red'),question=>{
	    process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.answer)},0);

	    rl.question(colorize('Introduzca la respuesta:','red'),answer=>{
		
			model.update(id,question,answer);
			log(` se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question} ${colorize("=>",'magenta')} ${answer}`);
			rl.prompt();
		
   	    });
    
 	 });
	}catch(error){
		errorlog(error.message);
		rl.prompt();
	}
    
  }
}

exports.testCmd=(rl,id)=>{
	if(typeof id === "undefined"){
		errorlog('Falta el parámetro id.');
		rl.prompt();
	}else{
		try{
			const quiz = model.getByIndex(id);
			rl.question(colorize(`${quiz.question}? `,'red'),respuesta=>{
				if(respuesta.toLowerCase().trim()===quiz.answer.toLowerCase()){
					biglog('CORRECTO','green');
				}else{biglog('INCORRECTO','red');}
				rl.prompt();
			});

		}catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}
};

exports.creditsCmd = (rl) => {
  console.log("Autor: Antonio Ramos Nieto");
  rl.prompt();
}

