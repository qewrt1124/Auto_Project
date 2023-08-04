const fs = require("fs");
const request = require("request");

const bot_url = "https://api.telegram.org/bot6454239328:AAELTyysCPgpcUz5JESuzm2mhcHqM9PKLJ8/sendmessage?chat_id=6665974111&text=";

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
            if(completed.split(".")[0] === original_file[i]) {
                fs.unlinkSync(file_location + "\\" + completed);
                break;
            }
        }
    });
}

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("메시지 전송 완료.");
      process.exit();
    } else {
      console.log(error);
      process.exit();
    }
}

/**
 * err가 나면 텔레그램으로 알려주는 함수
 */
async function alert_err() {
    const message = "auto_server_01_err";

    let options = {
        url: bot_url + message,
        method: "POST",
    };
      
    request(options, callback);
}

/**
 * err가 나면 텔레그램으로 알려주는 함수
 */
async function alert_complete() {
    const message = "auto_server_01_complete";

    let options = {
        url: bot_url + message,
        method: "POST",
    };
      
    request(options, callback);
}

module.exports = {
    sleep,
    remove_completed_files,
    alert_err,
    alert_complete,
};
