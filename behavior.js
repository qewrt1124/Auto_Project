const puppeteer = require("puppeteer");
const others = require("./others.js");

// behavior 페이지 관련 모듈

/**
 * behavior page 실행 함수
 * @param url
 * @param page detection에서 반환한 Page page
 * @param behavior_check  detection에서 behavior탭이 있는지 확인한 결과
 * @param browser detection에서 반환한 browser
 * @returns {[[Promise<*|string>]]} mitre 정보 결과 반환(true = [], false = "")
 */
async function behavior_page(url, page, behavior_check, browser) {
    if(behavior_check) {
        const page_end = await open_behavior_page(url, page);
        const mitre = await get_mitre(page_end);
        await browser.close();

        return mitre;
    } else {
        await browser.close();

        return "";
    }
}

/**
 * Go to behavior page
 * @param url
 * @param page detection에서 반환한 Page page
 * @returns {page} Page page 반환
 */
async function open_behavior_page(url, page) {
    // page.on('request', (req) => {
    //     if (
    //         req.resourceType() === 'image' ||
    //         req.resourceType() === 'font' ||
    //         req.resourceType() === 'stylesheet'
    //     ) {
    //         // 만약 요청 타입이 '이미지' or 'CSS' or '폰트' 라면
    //         req.abort(); // 거부
    //     } else {
    //         // 이미지가 아니라면
    //         req.continue(); // 수락
    //     }
    // });

    await page.goto(url + "/behavior", {
        waitUntil: "networkidle2"
    });

    await others.sleep(5000);

    return page;
}

/**
 * mitre 리스트 가져오는 함수
 * @param page detection에서 반환한 Page page
 * @returns {[String]} mitre리스트 반환
 */
async function get_mitre(page) {
    const mitre_list = page.evaluate(() => {
        // behavior not found
        const status = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#behaviourtab").shadowRoot.querySelector("div:nth-child(4) > div > div > div > div:nth-child(2) > div:nth-child(2)").querySelector("span").innerText.trim();

        let Mitre_list = [];
        let detection_list;
        let description_list;

        if(status !== "NOT FOUND") {
            const h5_list = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#behaviourtab").shadowRoot.querySelector("#mitre-tree").shadowRoot.querySelector("vt-ui-expandable > span:nth-child(2) > div").querySelectorAll("h5");

            const table_list = document.querySelector("#view-container > file-view").shadowRoot.querySelector("#behaviourtab").shadowRoot.querySelector("#mitre-tree").shadowRoot.querySelector("vt-ui-expandable > span:nth-child(2) > div").querySelectorAll("table");

            for(let i = 0; i < h5_list.length; i++) {
                Mitre_list.push(h5_list[i].querySelector(".hstack").querySelector("a").innerText.trim());
                Mitre_list.push(h5_list[i].querySelector(".hstack").querySelector("span").innerText.trim());
                detection_list = table_list[i].querySelectorAll("tr");
                for(let j = 0; j < detection_list.length; j++) {
                    description_list = detection_list[j].querySelector("span").querySelectorAll("div");
                    Mitre_list.push(description_list[0].querySelector("a").innerText.trim());

                    const detail = description_list[0].querySelector("span").innerText.trim().split(" ");
                    Mitre_list.push(detail[0]);

                    let aa_list = detection_list[j].querySelectorAll(".mitre-signature");
                    for(let k = 0; k < aa_list.length; k++) {
                        Mitre_list.push(aa_list[k].querySelector(".mb-0").innerText.trim());
                    }
                }
            }
        }

        return Mitre_list;
    });

    return mitre_list;
}

module.exports = {
    behavior_page
};
