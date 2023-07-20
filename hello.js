const puppeteer = require("puppeteer");
const json2csv = require("json2csv");
const fs = require("fs");
const others = require("./others.js")

function openPage_moveCheck() {
    const file_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\complete";
    const check_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\check";

    fs.readdir(file_location, async (err, files) => {
        for (let i = 0; i < files.length; i++) {
            console.log("before : " + files[i]);
            let url = await open_page(files[i], file_location);
            await fs.rename(file_location + "\\" + files[i], check_location + "\\" + files[i], (err) => {
                if(err !== null) {
                    fs.copyFile(file_location + "\\" + files[i], check_location + "\\" + files[i], () => {
                        fs.unlinkSync(file_location + "\\" + files[i]);
                    });
                }
            });
        }
    });
}

function reanalyze_moveComplete() {
    const original_path = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\securelink_4";
    const complete_path = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\complete";

    fs.readdir(original_path, async (err, files) => {
        for (let i = 0; i < files.length; i++) {
            console.log(files[i]);
            await open_page2(files[i], original_path);
            await fs.rename(original_path + "\\" + files[i], complete_path + "\\" + files[i], (err) => {
                if(err !== null) {
                    fs.copyFile(original_path + "\\" + files[i], complete_path + "\\" + files[i], () => {
                        fs.unlinkSync(original_path + "\\" + files[i]);
                    });
                }
            });
        }
    });
}

function makeCsv_moveCompleted() {
    const file_completed_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\completed";
    const check_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\check";
    let check;

    fs.readdir(check_location, async (err, files) => {
        for (let i = 0; i < files.length; i++) {
            console.log("before : " + files[i]);
            let url = await open_page(files[i], check_location);

            await make_csv(url, files[i], check);
            await fs.rename(check_location + "\\" + files[i], file_completed_location + "\\" + files[i], (err) => {
                if(err !== null) {
                    fs.copyFile(check_location + "\\" + files[i], file_completed_location + "\\" + files[i], () => {
                        fs.unlinkSync(check_location + "\\" + files[i]);
                    });
                }
            });
        }
    });
}

async function make_csv(url, filename, check) {
    const browser = await puppeteer.launch({
        headless: false,
        args:["--windows-size=1920,1080"]
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    await page.goto(url + "/detection", {
        waitUntil: "networkidle2"
    });

    await sleep(10000);

    //behavior check
    check = await page.evaluate(() => {
        const behavior_element = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report").shadowRoot.querySelector("div > div:nth-child(2) > div > ul > li:nth-child(5)").querySelector("a");
        const style = getComputedStyle(behavior_element);
        const rect = behavior_element.getBoundingClientRect();

        if(style.visibility === "visible" && !!(rect.bottom || rect.top || rect.height || rect.width)) {
            return true;
        } else {
            return false;
        }
    });

    let data = await page.evaluate(() => {
        // positives
        const positives = document.querySelector("#view-container").querySelector("file-view").shadowRoot.querySelector("#report").shadowRoot.querySelector(".container").querySelector(".d-none").querySelector(".col-auto").querySelector("vt-ui-detections-widget").shadowRoot.querySelector(".engines").querySelector(".circle").querySelector(".positives").innerText.trim();

        // total
        const total = document.querySelector("#view-container").querySelector("file-view").shadowRoot.querySelector("#report").shadowRoot.querySelector(".container").querySelector(".d-none").querySelector(".col-auto").querySelector("vt-ui-detections-widget").shadowRoot.querySelector(".engines").querySelector(".circle").querySelector(".total").innerText.trim();

        let score = [positives, total];

        // flex 부분
        const flex = document.querySelector("#view-container").querySelector("file-view").shadowRoot.querySelector("#report").querySelector("vt-ui-file-card").shadowRoot.querySelector(".card").querySelector(".card-body").querySelector(".vstack").querySelector(".flex-wrap").querySelectorAll("a");

        let flex_list = [];

        for(let i = 0; i < flex.length; i++) {
            let result = flex[i].innerText.trim();

            flex_list.push(result);
        }

        let Popular = [];
        let Threat_list = [];
        let Family_list = [];

        if(document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report > .tab-slot > .popular-threat-name") !== null) {
            const label_list = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report > .tab-slot > .popular-threat-name").querySelectorAll(".col");

            let title = "";

            for(let i = 0; i < label_list.length; i++) {

                title = label_list[i].querySelector(".fw-bold").innerText.trim();
                // Popular
                if(title === "Popular threat label") {
                    const po_list = label_list[i].querySelectorAll("a");
                    for(let j = 0; j < po_list.length; j++) {
                        Popular.push(po_list[j].innerText.trim());
                    }
                }

                // Threat
                if(title === "Threat categories") {
                    const Threat = label_list[i].querySelector(".tags").querySelectorAll("a");

                    for(let j = 0; j < Threat.length; j++) {
                        Threat_list.push(Threat[j].innerText.trim());
                    }
                }

                // Family
                if(title === "Family labels") {
                    const Family = label_list[i].querySelector(".tags").querySelectorAll("a");

                    for(let j = 0; j < Family.length; j++) {
                        Family_list.push(Family[j].innerText.trim());
                    }
                }
            }
        }

        let microsoft;
        let crowdStrike;
        let tencent;

        // company
        const company = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#detectionsList").shadowRoot.querySelector("#detections").querySelectorAll("div");
        for(let i = 0; i < company.length; i++) {
            let st = "#engine-text-";
            let st2 = st + i;

            // Microsoft
            if(document.querySelector("#view-container > file-view").shadowRoot.querySelector("#detectionsList").shadowRoot.querySelector("#detections").querySelectorAll("div")[i].querySelector(".engine").querySelector(".engine-name").innerText.trim() === "Microsoft") {

                microsoft = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#detectionsList").shadowRoot.querySelector(st2).querySelector("span").innerText.trim();
            }

            // Tencent
            if(document.querySelector("#view-container > file-view").shadowRoot.querySelector("#detectionsList").shadowRoot.querySelector("#detections").querySelectorAll("div")[i].querySelector(".engine").querySelector(".engine-name").innerText.trim() === "Tencent") {

                tencent = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#detectionsList").shadowRoot.querySelector(st2).querySelector("span").innerText.trim();
            }

            // CrowdStrike Falcon
            if(document.querySelector("#view-container > file-view").shadowRoot.querySelector("#detectionsList").shadowRoot.querySelector("#detections").querySelectorAll("div")[i].querySelector(".engine").querySelector(".engine-name").innerText.trim() === "CrowdStrike Falcon") {

                crowdStrike = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#detectionsList").shadowRoot.querySelector(st2).querySelector("span").innerText.trim();
            }
        }

        return {
            score : score,
            flex_list : flex_list,
            Popular : Popular,
            Threat_list : Threat_list,
            Family_list : Family_list,
            Microsoft : microsoft,
            CrowdStrike : crowdStrike,
            Tencent : tencent
        }
    });

    let data2;

    // behavior
    if(check) {
        const browser2 = await puppeteer.launch({
            headless: false,
            args:["--windows-size=1920,1080"]
        });
        const page2 = await browser2.newPage();

        await page2.setViewport({
            width: 1920,
            height: 1080
        });

        await page2.setRequestInterception(true);
        page2.on('request', (req) => {
            if (
                req.resourceType() === 'image' ||
                req.resourceType() === 'font' ||
                req.resourceType() === 'stylesheet'
            ) {
                // 만약 요청 타입이 '이미지' or 'CSS' or '폰트' 라면
                req.abort(); // 거부
            } else {
                // 이미지가 아니라면
                req.continue(); // 수락
            }
        });

        await page2.goto(url + "/behavior", {
            waitUntil: "networkidle2"
        });

        await sleep(12000);

        data2 = await page2.evaluate(() => {
            // behavior not found
            const status = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#behaviourtab").shadowRoot.querySelector("div:nth-child(4) > div > div > div > div:nth-child(2) > div:nth-child(2)").querySelector("span").innerText;

            let Mitre_list = [];
            let detection_list;
            let description_list;

            if(status !== "NOT FOUND") {
                const h5_list = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#behaviourtab").shadowRoot.querySelector("#mitre-tree").shadowRoot.querySelector("vt-ui-expandable > span:nth-child(2) > div").querySelectorAll("h5");

                const table_list = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#behaviourtab").shadowRoot.querySelector("#mitre-tree").shadowRoot.querySelector("vt-ui-expandable > span:nth-child(2) > div").querySelectorAll("table");

                for(let i = 0; i < h5_list.length; i++) {
                    Mitre_list.push(h5_list[i].querySelector(".hstack").querySelector("a").innerText);
                    Mitre_list.push(h5_list[i].querySelector(".hstack").querySelector("span").innerText);
                    detection_list = table_list[i].querySelectorAll("tr");
                    for(let j = 0; j < detection_list.length; j++) {
                        description_list = detection_list[j].querySelector("span").querySelectorAll("div");
                        Mitre_list.push(description_list[0].querySelector("a").innerText);
                        Mitre_list.push(description_list[0].querySelector("span").innerText);
                        let aa_list = detection_list[j].querySelectorAll(".mitre-signature");
                        for(let k = 0; k < aa_list.length; k++) {
                            Mitre_list.push(aa_list[k].querySelector(".mb-0").innerText);
                        }
                    }
                }
            }

            return {
                mitre_list : Mitre_list
            }
        });

        await browser2.close();
    }

    // scv 파일 형식
    let end = {
        filename : "",
        score : "",
        info : "",
        popular_threat_label : "",
        threat_category : "",
        family_label : "",
        microsoft : "",
        crowdstrike : "",
        tencent : "",
        mitre : ""
    }

    let end_list = [];

    // 최대값 찾기
    let arr_length = [];

    arr_length.push(data.score.length);
    arr_length.push(data.flex_list.length);
    arr_length.push(data.Popular.length);
    arr_length.push(data.Threat_list.length);
    arr_length.push(data.Family_list.length);

    // mitre 자동 입력
    if(check) {
        arr_length.push(data2.mitre_list.length);
    }

    let max_length = Math.max.apply(null, arr_length);

    // end_list에 end 넣어서 생성
    for(let i = 0; i < max_length; i++) {
        end_list.push({...end});
    }
    // filename 집어 넣기
    end_list[0].filename = filename;


    // score 집어 넣기
    for(let i = 0; i < data.score.length; i++) {
        end_list[i].score = data.score[i];
    }

    // flex 집어 넣기
    for(let i = 0; i < data.flex_list.length; i++) {
            end_list[i].info = data.flex_list[i];
    }

    // popular 집어 넣기
    for(let i = 0; i < data.Popular.length; i++) {
        end_list[i].popular_threat_label = data.Popular[i];
    }

    // threat 집어 넣기
    for(let i = 0; i < data.Threat_list.length; i++) {
        end_list[i].threat_category = data.Threat_list[i];
    }

    // family 집어 넣기
    for(let i = 0; i < data.Family_list.length; i++) {
        end_list[i].family_label = data.Family_list[i];
    }

    // microsoft 집어 넣기
    end_list[0].microsoft = data.Microsoft;

    // crowdstrike 집어 넣기
    end_list[0].crowdstrike = data.CrowdStrike;

    // tencent 집어 넣기
    end_list[0].tencent = data.Tencent;

    // mitre 자동 집어 넣기
    if(check) {
        for(let i = 0; i < data2.mitre_list.length; i++) {
            end_list[i].mitre = data2.mitre_list[i].trim();
        }
    }

    // csv 파일 쓰기
    const csv_data = json2csv.parse(end_list);
    const directory = "C:\\Users\\qewrt\\alba\\secure\\";

    // console.log(csv_data);

    await fs.writeFileSync(directory + filename + ".csv", csv_data, (err) => {
        if(err) {
            console.log("fail!!!!!!!!!!!!");
        } else {
            console.log(filename);
        }
    });

    const sc_path = "C:\\Users\\qewrt\\OneDrive\\사진\\스크린샷\\";

    await page.screenshot({
        path: sc_path + filename + ".jpg",
        fullPage: false,
        clip: {
            x: 0,
            y: 0,
            width: 1920,
            height: 1033
        }
    });

    await console.log(filename);

    await browser.close();
}

async function open_page(file_name, file_location) {
    const path = file_location + "\\" + file_name;
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

    await sleep(3000);

    if("https://www.virustotal.com/gui/home/upload" === page.url()) {
        await page.evaluate(async () => {
            await document.querySelector("#view-container > home-view").shadowRoot.querySelector("#uploadForm").shadowRoot.querySelector("div > form > button:nth-child(6)").click();
        });

        await sleep(3000);

        current_url = await page.url();

        await sleep(1000);

        await browser.close();

        return current_url;
    }


    current_url = await page.url();

    await sleep(1000);

    await browser.close();

    return current_url;
}

async function open_page2(file_name, file_location) {
    const path = file_location + "\\" + file_name;

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

    await sleep(3000);

    // file upload button
    if("https://www.virustotal.com/gui/home/upload" === page.url()) {
        await page.evaluate(async () => {
            const upload_button = await document.querySelector("#view-container > home-view").shadowRoot.querySelector("#uploadForm").shadowRoot.querySelector("div > form > button:nth-child(6)");
            await upload_button.click();
        });

        sleep(1000);

        await browser.close();

        return 0;
    }

    await sleep(10000).then(() => {
        page.evaluate(() => document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report > vt-ui-file-card").shadowRoot.querySelector("#reanalize").click())
    });

    await sleep(1000);

    await browser.close();

    return 0;
}

async function open_page3(file_name, file_location) {
    const path = file_location + "\\" + file_name;
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

    await sleep(3000);

    if("https://www.virustotal.com/gui/home/upload" === page.url()) {
        await page.evaluate(async () => {
            await document.querySelector("#view-container > home-view").shadowRoot.querySelector("#uploadForm").shadowRoot.querySelector("div > form > button:nth-child(6)").click();
        });

        await sleep(3000);

        current_url = await page.url();

        await sleep(1000);

        await browser.close();

        return current_url;
    }


    current_url = await page.url();

    await sleep(1000);

    await browser.close();

    return current_url;
}

// get_url_list();
// openPage_moveCheck();
reanalyze_moveComplete();
// makeCsv_moveCompleted();
