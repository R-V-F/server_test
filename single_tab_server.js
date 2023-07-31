const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const express = require('express');
const app = express();
const port = 3003;
const mysql = require("mysql2");


const CNN = 'https://www.youtube.com/@CNNbrasil';
const JPNews = 'https://www.youtube.com/@jovempannews';
const JPNews_Bauru = 'https://www.youtube.com/@JovemPanNewsBauru';
const UOL = 'https://www.youtube.com/@uol';
const Revista_Oeste = 'https://www.youtube.com/@RevistaOeste';
const ICL = 'https://www.youtube.com/@InstitutoConhecimentoLiberta';
const Brazil247 = 'https://www.youtube.com/@brasil247';
const Panico = 'https://www.youtube.com/@panicojovempan';

let channels_list = [CNN, JPNews, JPNews_Bauru, UOL, Revista_Oeste, ICL, Brazil247, Panico];

app.use(express.json()); //?

async function getLivesFromChannel(driver) { // returns the live url ** i´m supposing one stream per channel **
    let xpath = '/html/body/ytd-app/div[1]/ytd-page-manager/ytd-browse/ytd-two-column-browse-results-renderer/div[1]/ytd-section-list-renderer/div[2]/ytd-item-section-renderer[1]/div[3]/ytd-channel-featured-content-renderer/div[2]/ytd-video-renderer/div[1]/ytd-thumbnail/a'
    
    try {
        let element = await driver.wait(until.elementLocated(By
                    .xpath(xpath)
                    
                    ), 2000) ////*[@id="thumbnail"][@id="info"]/span[1]
        //console.log(`${info[0].split('.').join('')}`);
        return element.getAttribute("href");
    } catch (e) {
          console.log(`No streams for ${await driver.getTitle()}`);
          return 'Empt';
    } 
}


async function getLives(channels_list, check_lives_driver) { //returns updated list
    const start = Date.now();
    let list_of_streams = [];
    for(channel of channels_list) {
        console.log(`Trying to get ${channel}`)
        try{
            await check_lives_driver.get(channel);
            let live_url = await getLivesFromChannel(check_lives_driver);
            list_of_streams.push(live_url);
        }
        catch(e){
            console.log('Something went wrong with update_list\n' + e);
        }
    }
    //console.log(list_of_streams);
    const end = Date.now();
    console.log(`Execution time: ${(end - start)/1000}s`);
    return list_of_streams;
}

async function loadStreams(list_of_lives) { // returns array of loaded drivers for each stream link
    let list_of_loaded_stream_drivers = [] 
    for(stream of list_of_lives) {
        if (stream == 'Empt') continue;
        try{
            let stream_drive = await new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(new firefox.Options().headless())
            .build();
            await stream_drive.get(stream);
            list_of_loaded_stream_drivers.push(stream_drive);

        }
        catch(e){
            console.log(e)
        }
    }

    return list_of_loaded_stream_drivers;
}

async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;
  
    
    const connection = await mysql.createConnection("mysql://root:renan123@localhost:3306/db_sistema");
    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}

async function getChannelNameFromStreamDriver(stream_driver) {
    let xpath = '/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[2]/ytd-watch-metadata/div/div[2]/div[1]/ytd-video-owner-renderer/div[1]/ytd-channel-name/div/div/yt-formatted-string/a';
    
    try {
        let element = await stream_driver.wait(until.elementLocated(By
                    .xpath(xpath)
                    
                    ), 2000) ////*[@id="thumbnail"][@id="info"]/span[1]
        //console.log(`${info[0].split('.').join('')}`);
        return element.getText();
    } catch (e) {
        return 'err'+e;
    } 
}

async function deleteInvalidDrivers(old_list, new_list, list_of_drivers) { //returns new list of drivers
    console.log('deleting invalid drivers..');
    let list_of_invalid_links = await compare_old_to_new(old_list,new_list);
    console.log(list_of_invalid_links);
    let new_list_of_drivers = [];

    for(let i = 0; i < list_of_drivers.length; i++) {
        let is_invalid_driver = 0;
        let driver_link = await list_of_drivers[i].getCurrentUrl();
        for(invalid_link of list_of_invalid_links) {
            if (driver_link.split('&').length > 1) {
                driver_link_clean = driver_link.split('&');
                console.log(`Driver link clean:${driver_link_clean[0]}\nInvalid link:${invalid_link}`)
                if(driver_link_clean[0] == invalid_link){
                    list_of_drivers[i].quit();
                    is_invalid_driver = 1;
                    console.log('deleted')
                }
            }
            else {
                if(driver_link == invalid_link){
                    console.log(`Driver link clean:${driver_link}\nInvalid link:${invalid_link} i:${i}`)
                    list_of_drivers[i].quit();
                    is_invalid_driver = 1;
                    console.log('deleted')
                }
            }
        }
        if(!is_invalid_driver) new_list_of_drivers.push(list_of_drivers[i]);
    }

    return new_list_of_drivers;
}

async function addNewDrivers(old_list, new_list, list_of_drivers) {
    console.log('adding new drivers..');
    let list_of_new_links = await compare_new_to_old(old_list, new_list);
    console.log(`list_of_drivers.length:${list_of_drivers.length}`)
    let list_of_new_drivers = await loadStreams(list_of_new_links);

    for(new_driver of list_of_new_drivers) {
        list_of_drivers.push(new_driver)
    }
    console.log(`list_of_drivers.length:${list_of_drivers.length}`)

}

async function addRow(list_of_loaded_stream_drivers, con) {
    for(stream_driver of list_of_loaded_stream_drivers){
        let title = await stream_driver.getTitle();
        title = title.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
        title = title.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '');
        title = title.replace(/(['"])/g, '');
        let views = await getViewers(stream_driver);
        let channel = await getChannelNameFromStreamDriver(stream_driver)
        let side = 'NaL';
        switch (channel) {
            case 'CNN Brasil':
                side = 'e';
                break;
            case 'Jovem Pan News':
                side = 'd';
                break;
            case 'Jovem Pan News Bauru':
                side = 'd';
                break;
            case 'UOL':
                side = 'e';
                break;
            case 'Revista Oeste':
                side = 'd';
                break;
            case 'Instituto Conhecimento Liberta':
                side = 'e';
                break;
            case 'TV 247':
                side = 'e';
                break;
            case 'Pânico Jovem Pan':
                side = 'd';
            default:
              console.log(`shit went wrong assigning side`);
        }
        let sql = `INSERT INTO db_sistema.padrao (timestamp, views, channel, title, side) VALUES (CURRENT_TIME(),${views},'${channel}','${title}','${side}');`
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(`VALUES (CURRENT_TIME(),${views},'${channel}','${title}','${side}'`);
        });
    }
    return true; //maybe unnecessary
}

async function addRow2(stream_driver, con) {
    let title = await stream_driver.getTitle();
        title = title.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
        title = title.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '');
        title = title.replace(/(['"])/g, '');
        let views = await getViewers(stream_driver);
        let channel = await getChannelNameFromStreamDriver(stream_driver)
        let side = 'NaL';
        switch (channel) {
            case 'CNN Brasil':
                side = 'e';
                break;
            case 'Jovem Pan News':
                side = 'd';
                break;
            case 'Jovem Pan News - Bauru':
                side = 'd';
                break;
            case 'UOL':
                side = 'e';
                break;
            case 'Revista Oeste':
                side = 'd';
                break;
            case 'Instituto Conhecimento Liberta':
                side = 'e';
                break;
            case 'TV 247':
                side = 'e';
                break;
            case 'Pânico Jovem Pan':
                side = 'd';
            default:
              console.log(`shit went wrong assigning side`);
        }
        let sql = `INSERT INTO db_sistema.padrao (timestamp, views, channel, title, side) VALUES (CURRENT_TIME(),${views},'${channel}','${title}','${side}');`
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(`VALUES (CURRENT_TIME(),${views},'${channel}','${title}','${side}')`);
        });
}

function equalsCheck(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

async function getViewers(driver) {
    let xpath = '/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[2]/ytd-watch-metadata/div/div[4]/div[1]/div/div[1]/yt-formatted-string/span[1]';
    
    
    try {
        let element = await driver
            .wait(until.elementLocated(By.xpath(xpath)), 30000)
            .getText();
        
        let info = element.split(' ');
        console.log(element);
        return info[0].split('.').join('');
    } catch (e) {
        return 'err'+e;
    } 
}

async function compare_old_to_new(old_list,new_list){ //returns list of links to delete drivers from
    let list_of_invalid_links = [];
    for(old_link of old_list) {
        if(old_link == 'Empt') continue;
        let is_in_new_list = 0;
        for(new_link of new_list) {
            if(old_link == new_link) is_in_new_list = 1; //achou! link esta nas duas listas
        }
        if(!is_in_new_list) {
            list_of_invalid_links.push(old_link);
        }
    }
    return list_of_invalid_links;
}

async function compare_new_to_old(old_list,new_list){
    let list_of_new_links = [];
    for(new_link of new_list) {
        if(new_link == 'Empt') continue;
        let is_in_old_list = 0;
        for(old_link of old_list) {
            if(old_link == new_link) is_in_old_list = 1; //achou! link esta nas duas listas
        }
        if(!is_in_old_list) {
            list_of_new_links.push(new_link);
        }
    }
    return list_of_new_links;
}

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 

async function loadStreamTabs(list_of_lives, driver, con, check_lives_window) {
    await driver.switchTo().newWindow('tab');
    for(live of list_of_lives) {
        if(live == 'Empt') continue;
        await driver.get(live);
        await delay(2000);
        await addRow2(driver, con);
    }
    await driver.close();
    await driver.switchTo().window(check_lives_window);
}

async function main() {
    let con = await connect(); // add redundances here later
    let driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(new firefox.Options().headless())
      .build();

    let lives_list = await getLives(channels_list, driver);
    let check_lives_window = await driver.getWindowHandle();
    await loadStreamTabs(lives_list, driver, con, check_lives_window);

    app.listen(port, async () => {

        console.log(`Example app listening on port ${port}`);
        console.log(`Starting crom job..`);
        setInterval(async () => {
            
            lives_list.length = 0;
            lives_list = await getLives(channels_list, driver);
            check_lives_window = await driver.getWindowHandle();
            await loadStreamTabs(lives_list, driver, con, check_lives_window);
        }
        ,120000);
    })
}

main();