const url = require("/url");
const others = require("/others");

const file_location = "";
const completed_location = "";
const csv_location = "";
async function work_url() {
    await url.get_url_end(file_location, completed_location, csv_location);
}

async function find_uncompleted_files() {
    await others.search_else_files(file_location, completed_location);
}

work_url();
// find_uncompleted_files();