module.exports = (data, countRow = 2) => {
    const buttons = [];
    let row = [];
    for (let item of data) {
        if (row.length === countRow) {
            buttons.push(row);
            row = [];
        }

        row.push(item);
    }
    if (row.length > 0) buttons.push(row);

    return buttons;
};