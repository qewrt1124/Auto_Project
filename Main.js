const others = require("./others.js");
const detection_fs = require("./detection.js");
const behavior_fs = require("./behavior.js");
const url_fs = require("./url.js");
const csv_fs = require("./csv.js");

const linux_file_location = "/home/ubuntu/alba/original_files";
const linux_completed_location = "/home/ubuntu/alba/url/completed";
const linux_original_csv_location = "/home/ubuntu/alba/url/original";
const linux_csv_fileName = "original5.csv";

async function original_csvFile() {
    await url_fs.make_original_csvFile(linux_file_location, linux_original_csv_location, linux_csv_fileName);
}

async function main_working() {
    let file_content = await url_fs.get_url_list(linux_original_csv_location, linux_csv_fileName);
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
    await csv_fs.make_end_csv(detection, behavior, fileName).then(url_fs.delete_fileName_url(linux_original_csv_location, linux_csv_fileName)).then(url_fs.make_completed_csv(linux_completed_location, fileName, url, linux_csv_fileName));
}

async function openPage(file_content) {
    const url_arry = file_content.pop();

    const fileName = url_arry.file_name;
    const url = url_arry.url;
    console.log("filename : " + fileName);
    console.log("url : " + url);
    await url_fs.open_url(url).then(url_fs.delete_fileName_url(linux_original_csv_location, linux_csv_fileName)).then(url_fs.make_completed_csv(linux_completed_location, fileName, url, linux_csv_fileName));
}

// main_working();
original_csvFile();
