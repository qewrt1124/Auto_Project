const others = require("./others.js");
const detection_fs = require("./detection.js");
const behavior_fs = require("./behavior.js");
const url_fs = require("./url.js");

const file_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\sands_4";
const completed_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\complete";
const csv_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\url_csv\\original";
async function work_url() {
    await url_fs.get_url_end(file_location, csv_location, completed_location);
}

async function test2() {
    await others.test(file_location, csv_location);
}

work_url();
// test2();