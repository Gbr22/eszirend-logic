import fetch from 'node-fetch';

export function getData(){
    return fetch("https://eszi.edupage.org/timetable/server/regulartt.js?__func=regularttGetData",{
        method:"POST",
        body:`{"__args":[null,"74"],"__gsh":"00000000"}`,
    }).then(r=>r.json());
}