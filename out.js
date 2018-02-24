const figlet = require('figlet');
const chalk =require('chalk');

exports.colorize =(msg, color) => {
  if(typeof color !== "undefined"){
    msg=chalk[color].bold(msg);
  }
  return msg;
};

exports.log=(msg,color)=> {
  console.log(this.colorize(msg,color));
};

exports.biglog=(msg,color)=>{
  this.log(figlet.textSync(msg,{horizontalLayout:'full'}),color);
};

exports.errorlog=(emsg)=>{
  console.log(`${this.colorize("Error","red")}:${this.colorize(this.colorize(emsg,"red"),"bgYellowBright")}`);
};
