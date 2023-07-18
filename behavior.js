const puppeteer = require("puppeteer");
const others = require("/others");

export async function behavior_page(url, page, behavior_check, browser) {
    if(behavior_check) {
        const page = open_behavior_page(url, page);
        const mitre = get_mitre(page);
        browser.close();

        return mitre;
    } else {
        browser.close();

        return "";
    }
}

async function open_behavior_page(url, page, behavior_check) {
    page.on('request', (req) => {
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

    page.goto(url + "/behavior");

    others.sleep(10000);

    return page;
}

async function get_mitre(page) {
    const mitre_list = page.evaluate(() => {
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

        return Mitre_list;
    });

    return mitre_list;
}