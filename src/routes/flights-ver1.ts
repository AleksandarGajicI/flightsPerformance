import { FlightsRequest } from "./types";
import { getWrapperClient } from "../db";
import { Middleware } from "../middleware";
import { Response, Router } from "express";

export const loadRoutesVer1 = (router: Router, middlewares: Middleware[]) => {
    router.get('/V1/flights', ...middlewares, async (req: FlightsRequest, res: Response) => {

        const { end, start, src, dest } = req.fligthParams;
        const query = `select * from getPathsFor($1, $2, $3, $4);`;
        const client = await getWrapperClient();

        const queryRes = await client.query(query, [src, dest, start, end]);
        
        res.status(200).json({
            data: queryRes.rows,
            message: 'Route ver 1',
        });
    });
}