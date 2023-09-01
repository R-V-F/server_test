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

    let sql = `SELECT * FROM db_sistema.countries_table;`;

    let res = await query(con,sql);

    // con.query(sql, function (err, result) {
    //     if (err) throw err;
    //     console.log('naldo') 
    //     res = result;
    // });
    // res.then( data => {console.log(data)})
    //console.log(res);
    let count = 0;
    res.forEach(async (element) => {
        let csql = `SELECT * FROM db_sistema.${element.country_name.toLowerCase().replaceAll(" ","_")}_table;`;
        let cres = await query(con,csql);
        count += cres.length;
        if(cres.length < 50) console.log(`${element.country_name}  -> ${cres.length}`);
        console.log(count)
        /**
         * 1868 streams para verificar
         * 
         */
    });
    let argentina = await query(con, `SELECT * FROM db_sistema.argentina_table;`);
    for(let i = 0; i < argentina.length; i++) {
        console.log()
    }
}

main();