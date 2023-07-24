const fs = require("fs");

const file_location = "C:\\Users\\qewrt\\OneDrive\\바탕 화면\\아르바이트\\시큐어링크\\파일\\강양구\\악성코드\\securelink_7";
const files_name = "2c8bbc9466ab43ed2cf1e3e1347686a654346ae0";

async function get_dealy(files_location, files_name) {
    const stats = fs.statSync(files_location + "\\" + files_name);
    const files_size = stats.size / 1000;
    console.log(files_size);

    if(files_size > 3000) {
        return 8;
    } else {
        return 3;
    }
}

module.exports = {
    get_dealy
}