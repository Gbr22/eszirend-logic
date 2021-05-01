export function getList(data, id){
    return data.r.dbiAccessorRes.tables.find(e=>e.id == id);
}
export function getListItem(data,list,id){
    return getList(data,list).data_rows.find(e=>e.id == id);
}

let keepOriginal = false;

export class Subject {

    data;
    json;

    name;
    shortName;
    color;
    id;

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;

        this.name = json.name;
        this.shortName = json.short;
        this.id = json.id;
        this.color = json.color;
    }
}
export class Lesson {

    data;
    json;

    classIds;
    id;
    teacherIds;
    teachers;
    durationPeriods = 1;
    subject;
    color;
    groups;

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;

        this.classIds = json.classids;
        this.id = json.id;
        this.teacherIds = json.teacherids;
        this.teachers = this.teacherIds.map(e=>new Teacher(data,getListItem(data.json,"teachers",e)));
        this.durationPeriods = json.durationperiods;
        this.subject = new Subject(this.data,getListItem(this.data.json,"subjects",json.subjectid));
        this.groups = json.groupids.map(id=>{
            return this.data.groups.find(g=>g.id == id);
        });
        this.color = this.groups[0]?.color;
    }
    formatGroups({shorten}){
        function shortenGroupName(name){
            if (!shorten){
                return name;
            }
            let obj = {
                "Angol":"Ang",
                "Német":"Ném",
                "Környezetvédelem":"♻️",
                "Informatika":"🖱️",
                "Mechatronika":"🛠️",
                "Ügyvitel":"Ügyv",
                "Közgazdaság":"Közg",
            };
            for (let p in obj){
                name = name.replace(p,obj[p]);
            }
            return name;
        }
        return [...new Set(this.groups.map(e=>shortenGroupName(e.name)))].join(", ");
    }
}
export class Entry {

    data;
    json;

    id;
    lessonId;
    lesson;
    period;

    classrooms = [];

    get periods(){
        let arr = [];
        for (let i = 0; i < this.lesson.durationPeriods; i++) {
            arr.push((parseInt(this.period)+i).toString());
        }   
        return arr;
    }
    get periodObjects(){
        return this.data.periods.filter(e=>this.periods.includes(e.id));
    }

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;
        this.days = json.days;

        this.lessonId = json.lessonid;
        let el = getListItem(this.data.json,"lessons",this.lessonId);
        /* console.log("el",el); */

        this.lesson = new Lesson(this.data,el);
        this.period = json.period;
        this.id = json.id;
        this.classrooms = json.classroomids.map(e=>new Classroom(this.data,getListItem(this.data.json,"classrooms",e)))
    }

    getCustomColor(seedrandom){
        let entry = this;
        let map = {
            "Csoport1":"hsl(210, 100%, 66%)",
            "Csoport2":"hsl(0, 100%, 66%)",
            "Környezetvédelem":"hsl(156, 100%, 66%)",
            "Informatika":"hsl(204, 100%, 66%)",
            "Közgazdaság":"#F7AD94",
            "Ügyvitel":"#a1e3a1",
            "Pénzügy":"#7FDBFF",
            "Mechatronika":"hsl(180, 20%, 66%)",
        }
        let aliases = {
            "Csoport-1":"Csoport1",
            "Csoport-2":"Csoport2",
            "Csoprot-2":"Csoport2",
        };
        for(let key in aliases){
            map[key] = map[aliases[key]];
        }
        let groupName = entry.lesson.groups[0].name;

        if (entry.lesson.groups[0].entireClass){
            return null;
        } else if (map[groupName]) {
            return map[groupName];
        } else {
            return `hsl(${Math.floor(seedrandom(entry.lesson.groups[0].id)()*300)}, 100%, 75%)`;
            /* return entry.lesson.groups[0].color; */
        }
    }
}
export class Classroom {

    data;
    json;

    id;
    name;
    shortName;

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;

        this.id = json.id;
        this.name = json.name;
        this.shortName = json.short;
    }
}

function generateTimetable(data,classId = "-40"){

    let cards = getList(data,"cards").data_rows.map(e=>new Entry(data,e));
    
    cards = cards.filter(e=>e.lesson.json.classids.includes(classId));
    
    let days = {};
    cards.forEach(e=>{
        if (!days[e.day.id]){
            days[e.day.id] = {
                info:e.day,
                lessons:[],
            };
        }
        days[e.day.id].lessons.push(e);
    })
}
export class Day {

    data;
    json;
    
    vals;
    val;
    name;
    shortName;
    id;

    matches(v){
        return this.vals.includes(v);
    }

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;
        this.vals = json.vals;
        this.val = json.val;
        this.shortName = json.short;
        this.name = json.name;
        this.id = json.id;
    }
}
export class Division {

    data;
    json;

    id;
    groupIds;
    groups;

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;

        this.id = json.id;
        this.groupIds = json.groupids;
    }
    get groups(){
        return this.data.groups.filter(group=>this.groupIds.includes(group.id));
    }
}
export class Class {

    data;
    json;
    
    id;
    name;
    shortName;
    color;

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;

        this.id = json.id;
        this.name = json.name;
        this.shortName = json.short;
        this.color = json.color;
    }
}
export class Teacher {

    data;
    json;
    name;
    id;

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;

        this.name = json.short;
        this.id = json.id;
    }
}
export class Group {

    data;
    json;

    color;
    entireClass;
    name;
    divisionId;
    division;
    id;

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;
        this.color = json.color;
        this.entireClass = json.entireclass;
        this.name = json.name;
        this.divisionId = json.divisionid;
        this.division = this.data.divisions.find(e=>e.id == this.divisionId);
        this.id = json.id;
    }
}
export class Period {

    data;
    json;

    name;
    id;
    period;
    startTime;
    endTime;

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;

        this.name = json.name;
        this.id = json.id;
        this.period = json.period;
        this.startTime = json.starttime;
        this.endTime = json.endtime;
    }
}
export class Info {
    data;

    headerText;
    validityText;

    constructor(data,json){
        this.data = data;

        this.headerText = json.settings.m_strPrintHeaderText;
        this.validityText = json.settings.m_strDateBellowTimeTable;
    }
}
export class DataRoot {

    json;

    periods;

    divisions;
    groups;

    classes;
    days;
    entries;
    
    info;

    constructor(json){
        this.json = json;
        let periods = getList(this.json,"periods").data_rows.map(e=>new Period(this,e));
        this.periods = periods;

        this.divisions = getList(this.json,"divisions").data_rows.map(e=>new Division(this,e));
        this.groups = getList(this.json,"groups").data_rows.map(e=>new Group(this,e));

        this.classes = getList(this.json,"classes").data_rows.map(e=>new Class(this,e));
        this.days = getList(this.json,"daysdefs").data_rows.map(e=>new Day(this,e));
        this.entries = getList(this.json,"cards").data_rows.map(e=>new Entry(this,e));

        this.info = new Info(this,getList(this.json,"globals").data_rows[0]);
    }
}