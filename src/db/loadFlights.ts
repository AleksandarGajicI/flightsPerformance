import fs from 'fs';
import pgStreams from 'pg-copy-streams';
import { getNativeClient } from './index';


const copyFrom = pgStreams.from;


export const loadFlights = async () => {
    const stream = fs.createReadStream('/home/aleksandargajic/Documents/ag/schedulair/flightsPerformance/data/flights.csv');
    const client = await getNativeClient();
    const done = () => {
        console.log('Ending inserting of flights.');
        client.release();
    };
    const dbStream = client.query(copyFrom(`COPY flight FROM STDIN DELIMITER ','` ));
    dbStream.on('finish', done);
    dbStream.on('error', err => {
        console.log('error loading flights', err);
        done();
    });
    stream.pipe(dbStream);
}
