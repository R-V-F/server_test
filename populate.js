const mysql = require("mysql2");

async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;
  
    
    const connection = await mysql.createConnection("mysql://root:renan123@localhost:3306/db_sistema");
    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}

async function main(){
    let con = await connect();

}

main();