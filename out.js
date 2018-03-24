const figlet = require('figlet');
const chalk =require('chalk');

exports.colorize =(msg, color) => {
  if(typeof color !== "undefined"){
    msg=chalk[color].bold(msg);
  }
  return msg;
};

exports.log=(socket,msg,color)=> {
  socket.write(this.colorize(msg,color)+"\n");
};

exports.biglog=(socket,msg,color)=>{
  this.log(socket,figlet.textSync(msg,{horizontalLayout:'full'}),color);
};

exports.errorlog=(socket,emsg)=>{
  socket.write(`${this.colorize("Error","red")}:${this.colorize(this.colorize(emsg+"\n","red"),"bgYellowBright")}`);
};
