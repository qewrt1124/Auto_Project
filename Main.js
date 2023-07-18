const url = require("/url");
const others = require("/others");
const detection_fn = require("/detection");
const behavior_fn = require("behavior");


const file_location = "";
const completed_location = "";
const csv_location = "";
async function work_url() {
    await url.get_url_end(file_location, completed_location, csv_location);
}

async function find_uncompleted_files() {
    await others.search_else_files(file_location, completed_location);
}

async function main_csv(filename) {
    const detection = detection_fn.detection_page(url, filename);
    const behavior = behavior_fn.behavior_page(url, filename);
}
work_url();
// find_uncompleted_files();