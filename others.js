const fs = require("fs")

export function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

export async function search_else_files(file_location, completed_loction) {
    const original_file = fs.readdirSync(file_location);
    let completed_file = fs.readdirSync(completed_loction);
    let count = 0;
    let el_file_list = [];

    original_file.forEach((original, i) => {
        completed_file.forEach((completed, j) => {
            if(original !== completed) {
                count++;
                el_file_list.push(original);
            }
        });
    });

    console.log("count : " + count);

    el_file_list.forEach((el_file) => {
        console.log(el_file)
    })
}