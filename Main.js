const others = require("./others.js");
const detection_fs = require("./detection.js");
const behavior_fs = require("./behavior.js");
const url_fs = require("./url.js");
const csv_fs = require("./csv");

const windows_file_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\securelink_7";
const windows_completed_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\url_csv\\completed\\securelink_7";
const windows_original_csv_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\url_csv\\original\\securelink_7";
const windows_csv_fileName = "original8.csv";

async function original_csvFile() {
    await url_fs.make_original_csvFile(windows_file_location, windows_original_csv_location, windows_csv_fileName);
}

async function main_working() {
    let file_content = await url_fs.get_url_list(windows_original_csv_location, windows_csv_fileName);
    console.log("length : " + file_content.length);

    let count = 0;
    for(let i = file_content.length - 1; i >= 0; i--) {
        await make_csv_end(file_content, i);
        // await openPage(file_content);
        count++;
        console.log("count : " + count);
    }
    console.log("total count : " + count);
}

async function make_csv_end(file_content, i) {
    const url_arr = file_content[i];

    const fileName = url_arr.file_name;
    const url = url_arr.url;

    console.log("filename : " + fileName);
    console.log("url : " + url);

    const detection = await detection_fs.detection_page(url, fileName);
    const behavior = await behavior_fs.behavior_page(url, detection.page, detection.behaviorCheck, detection.browser);
    await csv_fs.make_end_csv(detection, behavior, fileName).then(url_fs.delete_fileName_url(windows_original_csv_location, windows_csv_fileName)).then(url_fs.make_completed_csv(windows_completed_location, fileName, url, windows_csv_fileName));
}

async function openPage(file_content) {
    const url_arry = file_content.pop();

    const fileName = url_arry.file_name;
    const url = url_arry.url;
    console.log("filename : " + fileName);
    console.log("url : " + url);
    await url_fs.open_url(url).then(url_fs.delete_fileName_url(windows_original_csv_location, windows_csv_fileName)).then(url_fs.make_completed_csv(windows_completed_location, fileName, url, windows_csv_fileName));
}

// original_csvFile();
main_working();
