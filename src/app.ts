import { routesBuilder } from "./routes";
import { retry, isTableEmpty } from "./util";
import express, { Request, Response } from "express";
import { connectToDb, getWrapperClient, loadFlights } from "./db";

const app = express();

app.listen(5000, () => {
    console.log('Server running')
    retry(() => connectToDb(), 10)
    .then(async () => {
        const client = await getWrapperClient();

        client.query('select count(*) from flight')
        .then(async (res) => 
            isTableEmpty(res.rows) ? 
            await loadFlights() : 
            console.log('data loaded')
        );
    })
    .catch((err) => console.log('Error connecting to database!', err));

    app.use('', 
        routesBuilder(express.Router()).addFlightsRoutesVer1().build()
    );
});
