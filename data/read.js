const fs = require('fs');
const stream = fs.createReadStream('flights.csv');

const loadData = (save) => {
    let chunkNum = 0;
    let remainder = '';
    let allInserts = [];

    stream
    .on('data', chunk => {
        if (chunkNum === 2) stream.destroy();

        console.log(`got chunk number ${chunkNum}`);
        
        chunkNum += 1;
        
        const rowsToInsert = getRows(remainder + chunk.toString());

        allInserts.push(save(rowsToInsert));
    })
    .on('end', () => {
        if (remainder !== '') handleRemains();

        Promise.all(allInserts)
        .then(() => console.log('success'))
        .catch(() => console.log('error inserting data'));
    })


    const getRows = (str) => {
        const strRows = str.split(/\n/);
        const rows = [];
        
        for (str of strRows) {
            const row = str.split(',')
            
            if (row.length < 6 || isNotDate(row[5])) {
                remainder = str;
                break;
            }
            
            rows.push(row);
        }
        
        return rows;
    }

    const handleRemains = () => allInserts.push(save(getRows(remainder)));
    const isNotDate = (str) => str.length < 19;
}

const saveToDb = (rows) => Promise.resolve(rows);

loadData(saveToDb);