import { Request } from "express";
import { GetFlightsRequest } from "../dto";

export interface FlightsRequest extends Request {
    fligthParams: GetFlightsRequest;
}