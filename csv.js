const fs = require("fs");
const json2csv = require("json2csv");

/**
 * csv 형식
 * @type {{score: string, filename: string, popular_threat_label: string, family_label: string, mitre: string, microsoft: string, crowdstrike: string, tencent: string, info: string, threat_category: string}}
 */
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

/**
 * json -> csv된 객체를 csv 파일로 생성하는 함수
 * @param detection detection{} detection 결과
 * @param behavior behavior[] behavior 결과
 * @returns {Promise<void>}
 */
async function make_end_csv(detection, behavior, file_name) {
    const end_list = await gather_Information(detection, behavior, file_name);
    await make_csv(end_list);
}

/**
 * csv파일을 생성하는 함수
 * @param end_list gather_Information함수에서 반환한 결과
 * @returns {Promise<void>}
 */
async function make_csv(end_list) {
    // csv 파일 쓰기
    const csv_data = json2csv.parse(end_list);
    const directory = "/home/ubuntu/alba/csv/";
    const filename = end_list[0].filename

    await fs.writeFileSync(directory + filename + ".csv", csv_data, (err) => {
        if(err) {
            console.log("fail!!!!!!!!!!!!");
        } else {
            console.log(filename);
        }
    });
}

/**
 * json -> csv로 만드는 함수
 * @param detection detection함수 결과
 * @param behavior behavior함수 결과
 * @returns {[end]} end형식으로 된 리스트 반환
 */
async function gather_Information(detection, behavior, file_name) {
    let end_list = [];

    // 최대값 찾기
    let arr_length = [];

    arr_length.push(detection.score.length);
    arr_length.push(detection.flex.length);
    arr_length.push(detection.popular_tab.popular.length);
    arr_length.push(detection.popular_tab.threat_list.length);
    arr_length.push(detection.popular_tab.family_list.length);
    arr_length.push(behavior.length);

    const max_length = Math.max.apply(null, arr_length);

    // end_list에 end 넣어서 생성
    for(let i = 0; i < max_length; i++) {
        end_list.push({...end});
    }
    // filename 집어 넣기
    end_list[0].filename = file_name;


    // score 집어 넣기
    detection.score.forEach((score, index) => {
       end_list[index].score = score;
    });

    // flex 집어 넣기
    detection.flex.forEach((flex, index) => {
       end_list[index].info = flex;
    });

    // popular 집어 넣기
    detection.popular_tab.popular.forEach((popular, index) => {
       end_list[index].popular_threat_label = popular;
    });

    // threat 집어 넣기
    detection.popular_tab.threat_list.forEach((threat, index) => {
       end_list[index].threat_category = threat;
    });

    // family 집어 넣기
    detection.popular_tab.family_list.forEach((family_list, index) => {
        end_list[index].family_label = family_list;
    });

    // microsoft 집어 넣기
    end_list[0].microsoft = detection.company_tab.microsoft;

    // crowdstrike 집어 넣기
    end_list[0].crowdstrike = detection.company_tab.crowd_strike;

    // tencent 집어 넣기
    end_list[0].tencent = detection.company_tab.tencent;

    // mitre 자동 집어 넣기
    if(behavior.length !== 0) {
        behavior.forEach((mitre, index) => {
            end_list[index].mitre = mitre;
        });
    }

    return end_list;
}

module.exports = {
    make_end_csv
};
