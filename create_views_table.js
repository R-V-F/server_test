// Tables that have 50 entries
const mysql = require("mysql2");



async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;
  
    
    const connection = await mysql.createConnection("mysql://root:renan123@localhost:3306/db_sistema");
    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}

async function query(con,sql) {
    let p = new Promise((resolve, reject) => {
        con.query(sql, function (err, result) {
            if (err) throw err;
            resolve(result);
        });
    })
    return p;
}

async function main() {
    let con = await connect();


    let countries = await query(con, `SELECT * FROM db_sistema.countries_table;`);
    console.log(countries.length)
    for(let i = 0; i < countries.length; i++) {
        let create_sql = `CREATE TABLE db_sistema.${countries[i].country_name.toLowerCase().replaceAll(" ","_")}_views_table (
            entry_id INT NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NULL,
            channel VARCHAR(100) NULL,
            title VARCHAR(100) NULL,
            views INT NULL,
            PRIMARY KEY (entry_id));`;
        console.log(`${countries[i].country_name}`);
        await query(con,create_sql);
        
    }
}

main();