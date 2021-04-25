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
        this.groups = json.groupids.map(e=>{
            return new Group(this.data,getListItem(this.data.json,"groups",e));
        });
        this.color = this.groups[0]?.color;
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
    id;

    constructor(data,json){
        this.data = data;
        this.json = keepOriginal ? json : null;
        this.color = json.color;
        this.entireClass = json.entireclass;
        this.name = json.name;
        this.divisionId = json.divisionid;
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
    periods;

    json;

    classes = [];
    days = [];
    info;

    constructor(json){
        this.json = json;
        let periods = getList(this.json,"periods").data_rows.map(e=>new Period(this,e));
        this.periods = periods;

        this.classes = getList(this.json,"classes").data_rows.map(e=>new Class(this,e));
        this.days = getList(this.json,"daysdefs").data_rows.map(e=>new Day(this,e));
        this.entries = getList(this.json,"cards").data_rows.map(e=>new Entry(this,e));
        this.info = new Info(this,getList(this.json,"globals").data_rows[0]);
    }
}