const puppeteer = require("puppeteer");
const others = require("others");
export async function detection_page(url) {
    const page = await open_page(url);
    const behaviorCheck = await behavior_check(page);
    const score = await get_score(page);
    const flex = await get_flex(page);
    const popular_tab = await get_popular_tab(page);
    const company_tab = await get_company_tab(page);

    return {
        page : page,
        behaviorCheck : behaviorCheck,
        score : score,
        flex : flex,
        popular_tab : popular_tab,
        company_tab : company_tab
    }
}

async function open_page(url) {
    const browser = await puppeteer.launch({
        headless: false,
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

    others.sleep(5000);

    return page;
}

async function behavior_check(page) {
    let check = await page.evaluate(() => {
        const behavior_element = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#report").shadowRoot.querySelector("div > div:nth-child(2) > div > ul > li:nth-child(5)").querySelector("a");
        const style = getComputedStyle(behavior_element);
        const rect = behavior_element.getBoundingClientRect();

        if(style.visibility === "visible" && !!(rect.bottom || rect.top || rect.height || rect.width)) {
            return true;
        } else {
            return false;
        }
    });

    return check;
}

async function get_score(page) {
    const score = page.evaluate(() => {
        // positives
        const positives = document.querySelector("#view-container").querySelector("file-view").shadowRoot.querySelector("#report").shadowRoot.querySelector(".container").querySelector(".d-none").querySelector(".col-auto").querySelector("vt-ui-detections-widget").shadowRoot.querySelector(".engines").querySelector(".circle").querySelector(".positives").innerText.trim();

        // total
        const total = document.querySelector("#view-container").querySelector("file-view").shadowRoot.querySelector("#report").shadowRoot.querySelector(".container").querySelector(".d-none").querySelector(".col-auto").querySelector("vt-ui-detections-widget").shadowRoot.querySelector(".engines").querySelector(".circle").querySelector(".total").innerText.trim();

        return [positives, total];
    });

    return score;
}

async function get_flex(page) {
    const flex_tab = page.evaluate(() => {
        const flex = document.querySelector("#view-container").querySelector("file-view").shadowRoot.querySelector("#report").querySelector("vt-ui-file-card").shadowRoot.querySelector(".card").querySelector(".card-body").querySelector(".vstack").querySelector(".flex-wrap").querySelectorAll("a");

        let flex_list = [];

        for(let i = 0; i < flex.length; i++) {
        let result = flex[i].innerText.trim();

        flex_list.push(result);
        }

        return flex_list;
    });

    return flex_tab;
}

async function get_popular_tab(page) {
    const popular_tab = page.evaluate(() => {
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

        return {
            popular : Popular,
            threat_list : Threat_list,
            family_list : Family_list
        }
    });

    return popular_tab;
}

async function get_company_tab(page) {
    const company_list = page.evaluate(() => {
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
            microsoft : microsoft,
            crowdStrike : crowdStrike,
            tencent : tencent
        }
    });

    return company_list;
}


