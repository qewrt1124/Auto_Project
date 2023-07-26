const puppeteer = require("puppeteer");
const fs = require("fs");
const json2csv = require("json2csv");
const others = require("./others.js");
const files_fs = require("./files.js");

/**
 * url && fileName의 csv 파일의 형식
 * @type {{file_name: string, url: string}}
 */
let url_file = {
    file_name : "",
    url : ""
}

/**
 *
 * @param file_location 악성코드 파일 위치
 * @param csv_location url.csv 파일 위치
 * @param completed_location 완료 파일 이동 위치
 * @returns {Promise<void>}
 */
async function make_original_csvFile(file_location, csv_location, original_csv) {
    const work_file_list = fs.readdirSync(file_location);
    for (const file_name of (work_file_list)) {
        console.log("before : " + file_name);
        const delay = await files_fs.get_dealy(file_location, file_name);
        let current_url = await get_url(file_location, file_name, delay);
        if(file_name === "desktop.ini") {
            continue;
        }

        console.log("url : " + current_url);

        await make_url_csv(csv_location, file_name, current_url, original_csv);

        fs.unlinkSync(file_location + "\\" + file_name);
    }
}

/**
 * original 파일의 url 반환하는 함수
 * @param file_location original파일 위치
 * @param file_name
 * @returns {Promise<string>}
 */
async function get_url(file_location, file_name, delay) {
    const path = file_location + "/" + file_name;
    let current_url = "";

    const browser = await puppeteer.launch({
        headless: true,
        args:["--windows-size=1920,1080"]
    });

    const page = await browser.newPage();

    await page.setViewport({
        width: 1920,
        height: 1080
    });

    await page.goto("https://www.virustotal.com/gui/home/upload", {
        waitUntil: "networkidle2"
    });

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        await others.sleep(3000),
        await page.evaluate( () => document.querySelector("#view-container > home-view").shadowRoot.querySelector("#uploadForm").shadowRoot.querySelector("#fileSelector").click()),
    ]);

    await fileChooser.accept([path]);

    await others.sleep(delay);

    if("https://www.virustotal.com/gui/home/upload" === page.url()) {
        await others.sleep(5000);

        await page.evaluate(async () => {
            await document.querySelector("#view-container > home-view").shadowRoot.querySelector("#uploadForm").shadowRoot.querySelector("div > form > button:nth-child(6)").click();
        });

        await others.sleep(delay);

        current_url = await page.url();

        // await page.evaluate(() => document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report > vt-ui-file-card").shadowRoot.querySelector("#reanalize").click());

        await others.sleep(1000);

        await browser.close();

        return current_url;
    }

    current_url = await page.url();

    // await page.evaluate(() => document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report > vt-ui-file-card").shadowRoot.querySelector("#reanalize").click());

    await others.sleep(1000);

    await browser.close();

    return current_url;
}

/**
 * csv파일을 json으로 바꾸는 함수
 * @param csv_file_location csv 파일의 위치
 * @param csv_fileFullName csv 파일의 확장자명까지
 * @returns {[url_file]} url csv 파일 형식의 배열 반환
 */
async function get_url_list(csv_file_location, csv_fileFullName) {
    const url = fs.readFileSync(csv_file_location + "\\" + csv_fileFullName, "utf-8");
    const url_list = url.split("\r\n");

    let result_list = [];

    for(let i = 1; i < url_list.length; i++) {
        const splited_list = url_list[i].split(",");

        const file_name = splited_list[0].replaceAll("\"", "");
        const url_value = splited_list[1].replaceAll("\"", "");

        result_list.push({...url_file});
        result_list[i - 1].file_name = file_name;
        result_list[i - 1].url = url_value;
    }

    return result_list;
}

/**
 * url csv파일 만드는 함수
 * @param csv_location url csv 파일의 위치
 * @param file_name 추가할 파일 이름
 * @param url 추가할 url
 * @param csv_file_name csv 파일 이름
 * @returns {Promise<void>}
 */
async function make_url_csv(csv_location, file_name, url, csv_file_name) {
    let list = [];

    if(await check_same_scv_file(csv_location, csv_file_name)) {
        list = await get_url_list(csv_location, csv_file_name);
    } else {
        list = [];
    }

    let result = {...url_file};
    result.file_name = file_name;
    result.url = url;

    list.push(result);

    const url_csv = json2csv.parse(list);

    fs.writeFileSync(csv_location + "\\" + csv_file_name, url_csv, (err) => {
        console.log(err);
    });
}

async function pop_fileName_url(original_location) {
    let list = await get_url_list(original_location);
    let result = {...url_file};

    result.file_name(list.pop().file_name);
    result.url(list.pop().url);

    return result;
}

async function delete_fileName_url(original_location, csv_file_name) {
    let list = await get_url_list(original_location, csv_file_name);

    list.pop();

    if(list.length === 0) {
        fs.unlinkSync(original_location + "\\" + csv_file_name);
    } else {
        const url_csv = json2csv.parse(list);

        fs.writeFileSync(original_location + "\\" + csv_file_name, url_csv, (err) => {
            console.log(err);
        });
    }
}

/**
 * 완료된 목록의 csv파일 만드는 함수
 * @param original_csv_location 완료 전 csv파일 위치
 * @param file_name 작업 파일 이름
 * @param url 작업 url
 * @param csv_file_name 만들 csv 파일 이름
 * @returns {Promise<void>}
 */
async function make_completed_csv(original_csv_location, file_name, url, csv_file_name) {
    await make_url_csv(original_csv_location, file_name, url, csv_file_name);
}

/**
 * 같은 scv 파일이 있는지 확인하는 함수
 * @param csv_location csv 파일 위치
 * @param file_name csv file name
 * @returns {Promise<boolean>} 같은 파일이 있으면 true, 없으면 false
 */
async function check_same_scv_file(csv_location, file_name) {
    const files = fs.readdirSync(csv_location);
    let check = false;
    for(let i = 0; i < files.length; i++) {
        if(files[i] === file_name) {
            check = true;
            break;
        }
    }

    return check;
}

async function open_url(url) {
    const browser = await puppeteer.launch({
        headless: true,
        args:["--windows-size=1920,1080"]
    });

    const page = await browser.newPage();

    await page.setViewport({
        width: 1920,
        height: 1080
    });

    await page.goto(url, {
        waitUntil: "networkidle2"
    });

    await others.sleep(1000);

    await browser.close();
}

module.exports = {
    get_url_list,
    make_original_csvFile,
    make_completed_csv,
    delete_fileName_url,
    get_url_list,
    open_url
};
