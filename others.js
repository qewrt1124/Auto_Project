const fs = require("fs")
// const url_fs = require("./url.js");

/**
 * 대기 시키는 함수
 * @param ms 1000ms -> 1s
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

/**
 * original 파일과 completed 파일을 비교한 후 중복된 original 파일을 삭제하는 함수
 * @param file_location original 파일 위치
 * @param completed_location completed 파일 위치
 * @returns {Promise<void>}
 */
async function remove_completed_files(file_location, completed_location) {
    const original_file = fs.readdirSync(file_location);
    const completed_file = fs.readdirSync(completed_location);

    completed_file.forEach((completed) => {
         for(let i = 0; i < original_file.length; i++) {
            if(completed === original_file[i]) {
                fs.unlinkSync(file_location + "\\" + completed);
                break;
            }
        }
    });
}

// async function test(original_location, csv_location) {
//     const original_list = fs.readdirSync(original_location);
//     const csv_files = fs.readdirSync(csv_location);
//     for (const files of csv_files) {
//         const csv_context = await url_fs.get_url_list(csv_location, files);
//         for (const context of csv_context) {
//             for (const original of original_list) {
//                 if(context.file_name === original) {
//                     fs.unlinkSync(original_location + "\\" + context.file_name);
//                     break;
//                 }
//             }
//         }
//     }
// }

module.exports = {
    sleep,
    remove_completed_files,
    // test
};