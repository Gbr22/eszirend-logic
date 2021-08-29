module.exports.getData = function(fetch,id){
    return fetch("https://eszi.edupage.org/timetable/server/regulartt.js?__func=regularttGetData",{
        method:"POST",
        body: JSON.stringify({
            "__args":[null,id.toString()],
            "__gsh":"00000000"
        }),
    }).then(r=>r.text());
}
module.exports.getVersions = function(fetch){
    let date = new Date();
    let month = date.getMonth()+1;
    let year = date.getFullYear();
    let schoolYear = year;
    if (month < 8){ 
        schoolYear--;
    }
    return fetch("https://eszi.edupage.org/timetable/server/ttviewer.js?__func=getTTViewerData", {
        "body": JSON.stringify({
            "__args":[null,schoolYear],
            "__gsh":"00000000"
        }),
        "method": "POST",
    }).then(r=>r.text());
}