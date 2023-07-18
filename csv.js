const fs = require("fs");
const json2csv = require("json2csv");

// scv 파일 형식
const end = {
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

export async function make_end_csv(detction, behavior) {
    const end_list = gather_Information(detction, behavior);
    await make_csv(end_list);
}

async function make_csv(end_list) {
    // csv 파일 쓰기
    const csv_data = json2csv.parse(end_list);
    const directory = "C:\\Users\\qewrt\\alba\\secure\\";
    const filename = end_list[0].filename

    await fs.writeFileSync(directory + filename + ".csv", csv_data, (err) => {
        if(err) {
            console.log("fail!!!!!!!!!!!!");
        } else {
            console.log(filename);
        }
    });
}

async function gather_Information(detection, behavior) {
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
    end_list[0].filename = detection.filename;


    // score 집어 넣기
    detection.score.forEach((score, index) => {
       end_list[index].score = score;
    });

    // flex 집어 넣기
    detection.flex.forEach((flex, index) => {
       end_list[index].flex = flex;
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
        end_list[index].family_list = family_list;
    });

    // microsoft 집어 넣기
    end_list[0].microsoft = detection.company_tab.microsoft;

    // crowdstrike 집어 넣기
    end_list[0].crowdstrike = detection.company_tab.crowdstrike;

    // tencent 집어 넣기
    end_list[0].tencent = detection.company_tab.tencent;

    // mitre 자동 집어 넣기
    if(behavior !== null) {
        behavior.forEach((mitre, index) => {
            end_list[index].mitre = mitre;
        });
    }

    return end_list;
}