const puppeteer = require("puppeteer");
const fs = require("fs");
const json2csv = require("json2csv");
const others = require("others");

const url_file = {
    file_name : "",
    url : ""
}

async function get_url(file_location, file_name) {
    const path = file_location + "/" + file_name;
    let current_url = "";

    const browser = await puppeteer.launch({
        headless: false,
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
        await page.evaluate( () => document.querySelector("#view-container > home-view").shadowRoot.querySelector("#uploadForm").shadowRoot.querySelector("#fileSelector").click()),
    ]);

    await fileChooser.accept([path]);

    await others.sleep(3000);

    if("https://www.virustotal.com/gui/home/upload" === page.url()) {
        await page.evaluate(async () => {
            await document.querySelector("#view-container > home-view").shadowRoot.querySelector("#uploadForm").shadowRoot.querySelector("div > form > button:nth-child(6)").click();
        });

        await others.sleep(3000);

        current_url = await page.url();

        await others.sleep(1000);

        await browser.close();

        return current_url;
    }

    current_url = await page.url();

    await others.sleep(1000);

    await browser.close();

    return current_url;
}

async function get_url_list(csv_file_location) {
    csv_file_location = "/Users/yang/Downloads/40015.csv";
    const url = fs.readFileSync(csv_file_location, "utf-8");
    const url_list = url.split("\r\n");

    let result_list = [];

    for(let i = 1; i < url_list.length; i++) {
        const splited_list = url_list[i].split(",");
        result_list.push({...url_file});
        result_list[i - 1].file_name = splited_list[0];
        result_list[i - 1].url = splited_list[1];
    }

    return result_list;
}

async function make_url_list(csv_file_location, result_list, file_name, url) {
    let result = {...url_file};
    result.file_name = file_name;
    result.url = url;

    result_list.push(result);

    const url_csv = json2csv.parse(result_list);
    fs.writeFileSync(csv_file_location + "/url.csv", url_csv, (err) => {
        console.log("success");
    });
}

async function move_file(file_location, completed_location, file_name) {
    file_location = file_location + "\\" + file_name;
    completed_location = completed_location + "\\" + file_name;
    await fs.rename(file_location, completed_location, (err) => {
       if(err !== null) {
           fs.copyFile(file_location, completed_location, () => {
               fs.unlinkSync(file_location);
           })
       }
    });
    console.log("complete : " + file_name);
}

export async function get_url_end(file_location, completed_location, csv_location) {
    const work_file_list = fs.readdirSync(file_location);
    for (const file_name of (work_file_list)) {
        console.log("before : " + file_name);
        let current_url = get_url(file_name);
        if(fs.readdirSync(csv_location) === null) {
            let list = [];
            await make_url_list(csv_location, list, file_name, current_url);
            await move_file(file_location, completed_location);
        } else {
            let list = get_url_list(csv_location);
            await make_url_list(csv_location, list, file_name, current_url);
            await move_file(file_location, completed_location);
        }
    }
}