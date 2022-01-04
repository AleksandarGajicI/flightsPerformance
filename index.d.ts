import { GetFlightsRequest } from "./src/dto";

declare module 'express-serve-static-core' {
    interface Request {
        fligthParams: GetFlightsRequest;
    }
}