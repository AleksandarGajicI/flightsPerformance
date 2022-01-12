import { Flight } from "../domain";
import { FlightsRequest } from "./types";
import { getWrapperClient } from "../db";
import { Middleware } from "../middleware";
import { Response, Router } from "express";
import { bfs, bfsMultipleQueues, bfsWithFlyweight, bfsWithQueue, bfsWithShortcut, setUpFlightsGraph } from "../services";

export const loadRoutesVer1 = (router: Router, middlewares: Middleware[]) => {
    router.get('/V1/flights', ...middlewares, async (req: FlightsRequest, res: Response) => {

        const { end, start, src, dest } = req.fligthParams;
        const query = `select * from getPathsFor($1, $2, $3, $4);`;
        const client = await getWrapperClient();
        const queryRes = await client.query(query, [src, dest, start, end]);
        
        res.status(200).json({
            data: queryRes.rows,
        });
    });

    router.get('/V1/flights/bfs', ...middlewares, async (req: FlightsRequest, res: Response) => {
        const client = await getWrapperClient();
        const { end, start, src, dest } = req.fligthParams;
        const data = await client.query<Flight>('select * from flight where stt > $1 and endt < $2 order by stt asc', [start, end]);

        //connect
        const bfsParams = {
            src,
            dest,
            endTime: new Date(end),
            startTime: new Date(start)
        };
        res.status(200).json({
            data: bfs(bfsParams)(setUpFlightsGraph(data.rows)),
            count: data.rowCount
        });
    });

    router.get('/V1/flights/bfs/multiple', ...middlewares, async (req: FlightsRequest, res: Response) => {
        const client = await getWrapperClient();
        const { end, start, src, dest } = req.fligthParams;
        const data = await client.query<Flight>('select * from flight where stt > $1 and endt < $2 order by stt asc', [start, end]);

        //connect
        const bfsParams = {
            src,
            dest,
            endTime: new Date(end),
            startTime: new Date(start)
        };
        res.status(200).json({
            data: bfsMultipleQueues(bfsParams)(setUpFlightsGraph(data.rows)),
            count: data.rowCount
        });
    });

    router.get('/V1/flights/bfs/queue', ...middlewares, async (req: FlightsRequest, res: Response) => {
        const client = await getWrapperClient();
        const { end, start, src, dest } = req.fligthParams;
        const data = await client.query<Flight>('select * from flight where stt > $1 and endt < $2 order by stt asc', [start, end]);

        //connect
        const bfsParams = {
            src,
            dest,
            endTime: new Date(end),
            startTime: new Date(start)
        };
        res.status(200).json({
            data: bfsWithQueue(bfsParams)(setUpFlightsGraph(data.rows)),
            count: data.rowCount
        });
    });

    router.get('/V1/flights/bfs/shortcut', ...middlewares, async (req: FlightsRequest, res: Response) => {
        const client = await getWrapperClient();
        const { end, start, src, dest } = req.fligthParams;
        const data = await client.query<Flight>('select * from flight where stt > $1 and endt < $2 order by stt asc', [start, end]);

        //connect
        const bfsParams = {
            src,
            dest,
            endTime: new Date(end),
            startTime: new Date(start)
        };
        res.status(200).json({
            data: bfsWithShortcut(bfsParams)(setUpFlightsGraph(data.rows)),
            count: data.rowCount
        });
    });

    router.get('/V1/flights/bfs/flyweight', ...middlewares, async (req: FlightsRequest, res: Response) => {
        const client = await getWrapperClient();
        const { end, start, src, dest } = req.fligthParams;
        const data = await client.query<Flight>('select * from flight where stt > $1 and endt < $2 order by stt asc', [start, end]);

        //connect
        const bfsParams = {
            src,
            dest,
            endTime: new Date(end),
            startTime: new Date(start)
        };
        res.status(200).json({
            data: bfsWithFlyweight(bfsParams)(setUpFlightsGraph(data.rows)),
            count: data.rowCount
        });
    });
}