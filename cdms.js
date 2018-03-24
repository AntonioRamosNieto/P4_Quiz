
const {models} = require('./model.js');
const {log,biglog,errorlog,colorize}=require("./out");
const Sequelize = require('sequelize');


exports.helpCmd = (socket,rl) => {
  log(socket,"Comandos:");
  log(socket," h|help - Muestra esta ayuda.");
  log(socket," list - Listar los quizzes existentes.");
  log(socket," show <id> - Muestra la pregunta y la respuesta del quiz indicado");
  log(socket," add - Añadir un nuevo quiz interactivamente.");
  log(socket," delete <id> - Borrar el quiz indicado.");
  log(socket," edit <id> - Editar el quiz indicado.");
  log(socket," test <id> - Probar el test indicado.");
  log(socket," p|play - Jugar a preguntar aleatoricamente todos los quizzes");
  log(socket," credits - Creditos.");
  log(socket," q|quit - Salir  del programa");
  rl.prompt();
}

exports.quitCmd = (socket,rl) => {
	rl.close();
	socket.end();
}

const makeQuestion = (rl,mensaje) => {
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorize(`${mensaje}`,'red'),escrito =>{
			resolve(escrito.trim());
		});
	});
};

exports.addCmd = (socket,rl) => {

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
		log(socket,` ${colorize('se ha añadido','magenta')}: ${quiz.question} ${colorize("=>",'magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError,error => {
		errorlog(socket,'El quiz es erroneo:');
		error.errors.forEach(({message})=>errorlog(message));
	})
	.catch(error=> {
		errorlog(socket,error.message);
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

exports.showCmd = (socket,rl,id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error(`No existe un quiz asociado a id = ${id}.`);
		}
		log(socket,` [${colorize(quiz.id,'magenta')}]: ${quiz.question} ${colorize("=>",'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(() => {rl.prompt();});
}


exports.listCmd = (socket,rl) => {
	models.quiz.findAll()
	.each(quiz => {
		log(socket,` [${colorize(quiz.id,'magenta')}]: ${quiz.question}`);
	})
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(()=>{
		rl.prompt();
	});

}

exports.playCmd = (socket,rl) => {
	let score = 0;
	let preguntas = [];
	let i = 0;
	
	const playOne = () => {
		return new Promise((resolve, reject) => {
			if(preguntas.length <= 0){
				log(socket,'No hay nada mas que preguntar');
				log(socket,`Fin de juego. Aciertos: ${score}`);
				biglog(socket,score,'magenta');
				rl.prompt();
			}else{
				let id = Math.floor(Math.random()*(preguntas.length));
				let quiz = preguntas[id];
				preguntas.splice(id,1);
				return makeQuestion(rl, `${quiz.question}? `)
		.then((respuesta)=>{
					if(respuesta.toLowerCase().trim()===quiz.answer.toLowerCase()){
						score++;
						log(socket,`CORRECTO-Lleva ${score} aciertos.`);
						playOne();
					}else{
						log(socket,'INCORRECTO.');
						log(socket,`Fin de juego. Aciertos: ${score}`);
						biglog(socket,score,'magenta');
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
		errorlog(socket,error.message);
	});
	
}

exports.deleteCmd = (socket,rl,id) => {

	validateId(id)
	.then(id => models.quiz.destroy({where:{id}}))
	.catch(error => {
		errorlog(socket,error.message)
	})
	.then(()=>{rl.prompt();});


}

exports.editCmd= (socket,rl,id) =>{
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
		log(socket,` se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question} ${colorize("=>",'magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError,error => {
		errorlog('socket,El quiz es erroneo:');
		error.errors.forEach(({message})=>errorlog(message));
	})
	.catch(error=> {
		errorlog(socket,error.message);
	})
	.then(()=>{
		rl.prompt();
	});


}

exports.testCmd=(socket,rl,id)=>{
	validateId(id)
	.then(id=>models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id = ${id}`);
		}
		return makeQuestion(rl, `${quiz.question}? `)
		.then((respuesta)=>{
			if(respuesta.toLowerCase().trim()===quiz.answer.toLowerCase()){
				log(socket,`su respuesta es correcta.`)
				biglog(socket,'CORRECTO','green');
			}else{
				log(socket,`su respuesta es incorrecta.`)
				biglog(socket,'INCORRECTO','red');
			}
		});
	})
	.catch(error=> {
		errorlog(socket,error.message);
	})
	.then(()=>{
		rl.prompt();
	});


};

exports.creditsCmd = (socket,rl) => {
  log(socket,'Autor de la práctica:');
  log(socket,`${colorize('Antonio Ramos Nieto','green')}`);
  rl.prompt();
}

