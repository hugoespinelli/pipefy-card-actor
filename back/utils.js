

function convert_date(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}

function correctUTCtoBrazilZone(date) {
    const BRAZIL_OFFSET = 3;
    var result = new Date(date);
    result.setHours(date.getHours() - BRAZIL_OFFSET);
    return result;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = { convert_date, addDays, correctUTCtoBrazilZone, sleep };
