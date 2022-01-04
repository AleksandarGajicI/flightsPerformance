import { GetFlightsRequest } from "../dto";
import { NextFunction, Request, Response } from "express";

export type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export const parseQueryParams: Middleware = (req: Request, res: Response, next: NextFunction) => {
    const { end, start, src, dest } = req.query;

    if(!end || !start || !src || !dest) throw new Error('All parameters need to be present!');

    Object.assign(req, {
        'fligthParams': {
            src: src as string,
            end: end as string,
            dest: dest as string,
            start: start as string,
        }
    });
    
    next();
}