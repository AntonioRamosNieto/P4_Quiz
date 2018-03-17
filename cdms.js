
const {models} = require('./model.js');
const {log,biglog,errorlog,colorize}=require("./out");
const Sequelize = require('sequelize');


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

const makeQuestion = (rl,mensaje) => {
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorize(`${mensaje}`,'red'),escrito =>{
			resolve(escrito.trim());
		});
	});
};

exports.addCmd = (rl) => {

	makeQuestion(rl, "Introduce una pregunta: ")
	.then((q)=>{
		return new Sequelize.Promise((resolve,reject)=>{
			makeQuestion(rl,"Introduce una respuesta: ")
			.then((a)=>{
				resolve({question: q,answer: a});
			});

		});
	})
	.then((quiz)=>{
		return models.quiz.create(quiz);
	})
	.then((quiz)=>{
		log(` ${colorize('se ha añadido','magenta')}: ${quiz.question} ${colorize("=>",'magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError,error => {
		errorlog('El quiz es erroneo:');
		error.errors.forEach(({message})=>errorlog(message));
	})
	.catch(error=> {
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});

}

const validateId = id => {
	return new Sequelize.Promise((resolve, reject) => {
		if(typeof id ==="undefined"){
			reject(new Error(`Falta el parametro <id>.`));
		}else {
			id = parseInt(id);
			if(Number.isNaN(id)){
				reject(new Error(`El valor del parámetro <id> no es número.`));
			}else{
				resolve(id);
			}
		}
	});
};

exports.showCmd = (rl,id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error(`No existe un quiz asociado a id = ${id}.`);
		}
		log(` [${colorize(quiz.id,'magenta')}]: ${quiz.question} ${colorize("=>",'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {rl.prompt();});
}


exports.listCmd = (rl) => {
	models.quiz.findAll()
	.each(quiz => {
		log(` [${colorize(quiz.id,'magenta')}]: ${quiz.question}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});

}

exports.playCmd = (rl) => {
	let score = 0;
	let preguntas = [];
	let i = 0;
	
	const playOne = () => {
		return new Promise((resolve, reject) => {
			if(preguntas.length <= 0){
				log('No hay nada mas que preguntar');
				log(`Fin de juego. Aciertos: ${score}`);
				biglog(score,'magenta');
				rl.prompt();
			}else{
				let id = Math.floor(Math.random()*(preguntas.length));
				let quiz = preguntas[id];
				preguntas.splice(id,1);
				return makeQuestion(rl, `${quiz.question}? `)
		.then((respuesta)=>{
					if(respuesta.toLowerCase().trim()===quiz.answer.toLowerCase()){
						score++;
						log(`CORRECTO-Lleva ${score} aciertos.`);
						playOne();
					}else{
						log('INCORRECTO.');
						log(`Fin de juego. Aciertos: ${score}`);
						biglog(score,'magenta');
						rl.prompt();
					}
				});
			}
		});
	
	}
	
	models.quiz.findAll()
	.each(quiz => {
		preguntas[i]= quiz;
		i++;
	})
	.then(()=>{playOne();})
	.catch(error => {
		errorlog(error.message);
	});
	
	

	/*let score=0;
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
			log('No hay nada mas que preguntar');
			log(`Fin de juego. Aciertos: ${score}`);
			biglog(score,'magenta');
			rl.prompt();
		}else{
			let id=Math.floor(Math.random()*(quedan.length));
			let quiz=model.getByIndex(quedan[id]);
			quedan.splice(id,1);
			rl.question(colorize(`${quiz.question}? `,'red'),respuesta=>{
				if(respuesta.toLowerCase().trim()===quiz.answer.toLowerCase()){
					score++;
					log(`CORRECTO-Lleva ${score} aciertos.`);
					playOne();
				}else{
					log('INCORRECTO.');
					log(`Fin de juego. Aciertos: ${score}`);
					biglog(score,'magenta');
					rl.prompt();
				}
			});

		}
	};
	playOne();
	*/
}

exports.deleteCmd = (rl,id) => {

	validateId(id)
	.then(id => models.quiz.destroy({where:{id}}))
	.catch(error => {
		errorlog(error.message)
	})
	.then(()=>{rl.prompt();});


}

exports.editCmd= (rl,id) =>{
	validateId(id)
	.then(id=>models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id = ${id}`);
		}
		process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.question)},0);
		return makeQuestion(rl, "Introduzca la pregunta: ")
	
		.then((q)=>{
			process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.answer)},0);
			return new Sequelize.Promise((resolve,reject)=>{
				makeQuestion(rl,"Introduzca la respuesta: ")
				.then((a)=>{
					quiz.question = q;
					quiz.answer = a;
					resolve(quiz);
				});
	
			});
		});
	})
	.then((quiz)=>{
		return quiz.save(quiz);
	})
	.then((quiz)=>{
		log(` se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question} ${colorize("=>",'magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError,error => {
		errorlog('El quiz es erroneo:');
		error.errors.forEach(({message})=>errorlog(message));
	})
	.catch(error=> {
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});


}

exports.testCmd=(rl,id)=>{
	validateId(id)
	.then(id=>models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id = ${id}`);
		}
		return makeQuestion(rl, `${quiz.question}? `)
		.then((respuesta)=>{
			if(respuesta.toLowerCase().trim()===quiz.answer.toLowerCase()){
				log(`su respuesta es correcta.`)
				biglog('CORRECTO','green');
			}else{
				log(`su respuesta es incorrecta.`)
				biglog('INCORRECTO','red');
			}
		});
	})
	.catch(error=> {
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});


};

exports.creditsCmd = (rl) => {
  console.log('Autor de la práctica:');
  console.log(`${colorize('Antonio Ramos Nieto','green')}`);
  rl.prompt();
}

