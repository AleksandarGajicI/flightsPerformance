import { retry } from "./util";
import { connectToDb, getClient } from "./db";
import express, { Request, Response } from "express";

const app = express();

app.get('/', (req: Request, res: Response) => {
    res.status(200).send({
        message: "Success"
    });
});

app.listen(5000, () => {
    console.log('Server running')
    retry(() => connectToDb(), 10)
    .then(async () => {
        const client = await getClient();

        client.query('select * from flight', [], (err, res) => {
            console.log(res);
        })
    })
    .catch((err) => console.log('Error connecting to database!', err));
});