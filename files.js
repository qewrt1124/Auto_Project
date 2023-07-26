const fs = require("fs");
const url_fs = require("./url");

async function get_delay(files_location, files_name) {
    const stats = fs.statSync(files_location + "\\" + files_name);
    const files_size = stats.size / 1000;

    if(files_size > 3000) {
        return 8000;
    } else {
        return 3000;
    }
}

async function search_same_files() {
    const file_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\securelink_7\\";
    const scv_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\url_csv\\original\\securelink_7";
    const files_list = fs.readdirSync(scv_location);
    for (const scv_name of files_list) {
        const csv_content = await url_fs.get_url_list(scv_location, scv_name);
        for (const file_name of csv_content) {
            fs.unlinkSync(file_location + file_name.file_name);
        }
    }
}

async function search() {
    const original_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\securelink_7\\";
    const completed_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\완료\\securelink_7\\csv";

    const files = fs.readdirSync(completed_location);
    for (const file of files) {
        fs.unlinkSync(original_location + file.split(".")[0]);
    }
}

search();
// search_same_files();
module.exports = {
    get_delay
}