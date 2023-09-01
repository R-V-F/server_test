import fetch from 'node-fetch';
import mysql from 'mysql2';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });


//const mysql = require("mysql2");
async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;
  
    
    const connection = await mysql.createConnection("mysql://root:renan123@localhost:3306/db_sistema");
    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}

async function scrap(top100url) {
    let channels_list = [];

    const response = await fetch(top100url);
    const body = await response.text();
    let test = body.split('contributor-wrap contributor__content');
    let count = 0;
    for(let i = 0; i < test.length; i++) {
        let split2 = test[i].split(`data-v-ee8cacf5`);
        for(let k = 0; k < split2.length; k++) {
            if(split2[k].length < 300 && split2[k].includes("youtube") && split2[k].includes("<!--")){
                let ind1 = split2[k].indexOf(">") + 1;
                let ind2 = split2[k].indexOf("<");
                let name = split2[k].substring(ind1,ind2);
                let ind11 = split2[k].indexOf('"') + 1;
                let ind22 = split2[k].indexOf('"',ind11);
                let channel = split2[k].substring(ind11,ind22)
                count++;
                let obj = {
                    channel_name: name,
                    channel_url: channel
                }
                channels_list.push(obj);
                //console.log(`\n${obj.channel_name}\n${count}`)
            } 
        }
    }
    return channels_list;
}

async function getcountries(url) {
    const response = await fetch(url);
    const body = await response.text();
    let i1 = body.indexOf("All Countries");
    let i2 = body.indexOf("Uruguay") +7;
    let raw = body.substring(i1,i2);
    let splits = raw.split("</span></a");
    let raw_list = [];
    for(let i = 0; i < splits.length; i++) {
        //console.log(`\n${splits[i]}`);
        raw_list.push(splits[i].split('href=')[1]);
    }

    console.log(raw_list);
}
async function delay(delayInms){
    return new Promise(resolve => setTimeout(resolve, delayInms));
}

function reTitle(title) {
    let new_title = title.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
    new_title = new_title.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '');
    new_title = new_title.replace(/(['"])/g, '');
    return new_title;
}

async function main() {
    // let list = await scrap('https://hypeauditor.com/top-youtube-news-politics-argentina/')
    // list.forEach((obj) => {
    //     //console.log(obj.channel_url);
    // })
    let con = await connect();
    let raw_list = [
        '"/top-youtube-news-politics-argentina/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Argentina',
        '"/top-youtube-news-politics-australia/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Australia',
        '"/top-youtube-news-politics-austria/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Austria',
        '"/top-youtube-news-politics-belgium/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Belgium',
        '"/top-youtube-news-politics-bolivia/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Bolivia',
        '"/top-youtube-news-politics-brazil/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Brazil',
        '"/top-youtube-news-politics-canada/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Canada',
        '"/top-youtube-news-politics-chile/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Chile',
        '"/top-youtube-news-politics-colombia/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Colombia',
        '"/top-youtube-news-politics-costa-rica/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Costa Rica',
        '"/top-youtube-news-politics-czechia/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Czechia',
        '"/top-youtube-news-politics-denmark/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Denmark',
        '"/top-youtube-news-politics-dominican-republic/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Dominican Republic',
        '"/top-youtube-news-politics-ecuador/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Ecuador',
        '"/top-youtube-news-politics-egypt/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Egypt',
        '"/top-youtube-news-politics-el-salvador/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>El Salvador',
        '"/top-youtube-news-politics-finland/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Finland',
        '"/top-youtube-news-politics-france/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>France',
        '"/top-youtube-news-politics-germany/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Germany',
        '"/top-youtube-news-politics-greece/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Greece',
        '"/top-youtube-news-politics-guatemala/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Guatemala',
        '"/top-youtube-news-politics-hong-kong/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Hong Kong',
        '"/top-youtube-news-politics-india/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>India',
        '"/top-youtube-news-politics-indonesia/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Indonesia',
        '"/top-youtube-news-politics-italy/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Italy',
        '"/top-youtube-news-politics-japan/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Japan',
        '"/top-youtube-news-politics-kuwait/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Kuwait',
        '"/top-youtube-news-politics-lebanon/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Lebanon',
        '"/top-youtube-news-politics-malaysia/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Malaysia',
        '"/top-youtube-news-politics-mexico/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Mexico',
        '"/top-youtube-news-politics-morocco/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Morocco',
        '"/top-youtube-news-politics-netherlands/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Netherlands',
        '"/top-youtube-news-politics-norway/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Norway',
        '"/top-youtube-news-politics-pakistan/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Pakistan',
        '"/top-youtube-news-politics-panama/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Panama',
        '"/top-youtube-news-politics-paraguay/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Paraguay',
        '"/top-youtube-news-politics-peru/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Peru',
        '"/top-youtube-news-politics-philippines/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Philippines',
        '"/top-youtube-news-politics-poland/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Poland',
        '"/top-youtube-news-politics-portugal/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Portugal',
        '"/top-youtube-news-politics-puerto-rico/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Puerto Rico',
        '"/top-youtube-news-politics-romania/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Romania',
        '"/top-youtube-news-politics-russia/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Russia',
        '"/top-youtube-news-politics-saudi-arabia/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Saudi Arabia',
        '"/top-youtube-news-politics-singapore/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Singapore',
        '"/top-youtube-news-politics-slovakia/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Slovakia',
        '"/top-youtube-news-politics-south-africa/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>South Africa',
        '"/top-youtube-news-politics-south-korea/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>South Korea',
        '"/top-youtube-news-politics-spain/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Spain',
        '"/top-youtube-news-politics-sweden/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Sweden',
        '"/top-youtube-news-politics-switzerland/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Switzerland',
        '"/top-youtube-news-politics-thailand/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Thailand',
        '"/top-youtube-news-politics-turkey/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Turkey',
        '"/top-youtube-news-politics-ukraine/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Ukraine',
        '"/top-youtube-news-politics-united-arab-emirates/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>United Arab Emirates',
        '"/top-youtube-news-politics-united-kingdom/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>United Kingdom',
        '"/top-youtube-news-politics-united-states/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>United States',
        '"/top-youtube-news-politics-uruguay/" class="menu__item" data-v-4b597f91><span data-v-4b597f91>Uruguay'
    ]
    let i = 0;
    let list_obj = [];
    raw_list.forEach((line) => {
        let country = line.split(">")[line.split(">").length - 1] ;
        let ind11 = line.indexOf('"') + 1;
        let ind22 = line.indexOf('"',ind11);
        let url = "https://hypeauditor.com" + line.substring(ind11,ind22);
        let url2 = "https://hypeauditor.com" + line.substring(ind11,ind22) + "most-viewed/";
        i++;
        let obj = {
            country:country,
            url:url,
            url2:url2,
        }
        list_obj.push(obj);
        console.log(`\n${i}\n${country}\n${url}\n${url2}`)
    })
    // list_obj.forEach((objCountryUrl) => {
    //     console.log(`${objCountryUrl.country.toLowerCase().replaceAll(" ", "_")}`)
    //     let sql = `CREATE TABLE db_sistema.${objCountryUrl.country.toLowerCase().replaceAll(" ", "_")}_table (SubsRank INT NOT NULL AUTO_INCREMENT, ChannelName VARCHAR(100) NULL, ChannelUrl VARCHAR(100) NULL,PRIMARY KEY (SubsRank));`
    //     console.log(`${sql}`)
        // con.query(sql, function (err, result) {
        //     if (err) throw err;
        // });
    // })
    // for(let i = 0; i < list_obj.length; i++) {
    //     const answer = await rl.question('go? ');
    //     if(answer == 'y') {
    //         console.log(`${i}`);
    //         let listOfChannelUrlsObjs = await scrap(list_obj[i].url);
    //         for(let k = 0; k < listOfChannelUrlsObjs.length; k++) {
    //             let insert_sql = `INSERT INTO db_sistema.${list_obj[i].country.toLowerCase().replaceAll(" ", "_")}_table (ChannelName, ChannelUrl) VALUES ('${reTitle(listOfChannelUrlsObjs[k].channel_name)}', '${reTitle(listOfChannelUrlsObjs[k].channel_url)}');`
    //             console.log(insert_sql);
    //             con.query(insert_sql, function (err, result) {
    //                 if (err) throw err;
    //             });


    //         }

    //     }
    //     else if(answer == 'n') process.exit(1);
    //     else true;
    // }
    //let argChans = await scrap('https://hypeauditor.com/top-youtube-news-politics-argentina/most-viewed/');
    //console.log(argChans)
    //   getcountries('https://hypeauditor.com/top-youtube-news-politics/');
}

main();