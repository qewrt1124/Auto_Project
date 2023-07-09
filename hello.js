const puppeteer = require("puppeteer");
const json2csv = require("json2csv");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require("fs");

function main() {
    let filename = "aaa";
    let url = "https://www.virustotal.com/gui/file/49151b6a374a646f004b68cf0d97c2ef7ccde025df4823f297653b34e410a2ce/";

    test(url, filename);
}

async function test(url, filename) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url + "detection");

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
            let result = document.querySelector("#view-container").querySelector("file-view").shadowRoot.querySelector("#report").querySelector("vt-ui-file-card").shadowRoot.querySelector(".card").querySelector(".card-body").querySelector(".vstack").querySelector(".flex-wrap").querySelectorAll("a")[i].innerText.trim();
            flex_list.push(result);
        }

        // Popular
        const Popular = [];
        Popular.push(document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report > span > div > div:nth-child(1) > a").innerText);

        // Threat
        const Threat = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report > span > div > div:nth-child(2) > div").querySelectorAll("a");

        let Threat_list = [];
        for(let i = 0; i < Threat.length; i++) {
            let result = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report > span > div > div:nth-child(2) > div").querySelectorAll("a")[i].innerText.trim();
            Threat_list.push(result);
        }

        // Family
        const Family = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report > span > div > div:nth-child(3) > div").querySelectorAll("a");

        let Family_list = [];
        for(let i = 0; i < Threat.length; i++) {
            let result = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report > span > div > div:nth-child(3) > div").querySelectorAll("a")[i].innerText.trim();
            Family_list.push(result);
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

    await browser.close();

    // // behavior
    // const browser2 = await puppeteer.launch();
    // const page2 = await browser2.newPage();
    // await page2.goto(url + "behavior");
    // let data2 = await page2.evaluate(() => {
    //
    //     // behavior not found
    //     const status = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report").querySelector(".tab-slot").querySelector("#behaviourtab").shadowRoot.querySelectorAll("div")[3].querySelector(".activity-summary").querySelector(".container");
    //
    //     // const status = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#behaviourtab").shadowRoot.querySelector("div:nth-child(4) > div > div > div > div:nth-child(2) > div:nth-child(2) > span").innerText;
    //     console.log("status : " + status);
    // });

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

    const csv_data = json2csv.parse(end_list);
    fs.writeFileSync("./test.csv", csv_data, (err) => {
        if(err) {
            console.log("fail!!!!!!!!!!!!");
        } else {
            console.log("Done!!!!!!!!!!!!!!!1");
        }
    });
}

main();