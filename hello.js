const puppeteer = require("puppeteer");
const json2csv = require("json2csv");
const fs = require("fs");

function main() {
    let filename = "7e4b0d8c96e6462a12b282225e1cdc376c6ae8ec";
    let url = "https://www.virustotal.com/gui/file/24229e9c576e9b65e33c58f27db4da279d04ed1206c961412ce364d55cb0b3d4";

    test(url, filename);
}

async function test(url, filename) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url + "/detection");

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
        for(let i = 0; i < Family.length; i++) {
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

    // behavior
    const browser2 = await puppeteer.launch();
    const page2 = await browser2.newPage();
    await page2.goto(url + "/behavior");
    let data2 = await page2.evaluate(() => {

        // behavior not found
        const status = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#behaviourtab").shadowRoot.querySelector("div:nth-child(4) > div > div > div > div:nth-child(2) > div:nth-child(2)").querySelector("span").innerText;

        let Mitre_list = [];
        let detection_list;
        let description_list;

        const count_list = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#behaviourtab").shadowRoot.querySelector("#mitre-tree").shadowRoot.querySelector("vt-ui-expandable > span:nth-child(2) > div").querySelectorAll("h5");

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
                    aa_list = detection_list[j].querySelectorAll(".mitre-signature");
                    for(let k = 0; k < aa_list.length; k++) {
                        Mitre_list.push(aa_list[k].querySelector(".mb-0").innerText);
                    }
                    // Mitre_list.push(detection_list[j].querySelector(".mb-0").innerText);
                }
            }
        }

        return {
            mitre_list : Mitre_list
        }
    });

    await browser2.close();

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
    arr_length.push(data2.mitre_list.length);

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

    // mitre 집어 넣기
    for(let i = 0; i < data2.mitre_list.length; i++) {
        end_list[i].mitre = data2.mitre_list[i];
    }

    // csv 파일 쓰기
    const csv_data = json2csv.parse(end_list);
    const directory = "C:\\Users\\qewrt\\alba\\secure\\";

    fs.writeFileSync(directory + filename + ".csv", csv_data, (err) => {
        if(err) {
            console.log("fail!!!!!!!!!!!!");
        } else {
            console.log(filename);
        }
    });

    console.log(filename)
}

main();