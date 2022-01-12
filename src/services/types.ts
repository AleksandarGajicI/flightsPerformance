import { Dictionary } from "../util";

export interface Node<T> {
    name: string;
    edges: T[];
}

export interface Edge {
    dest: string;
    price: number;
    stt: Date;
    endt: Date;
}

export type Graph<T> = Dictionary<Node<T>>;

export interface FindFlightParams {
    src: string;
    dest: string;
    startTime: Date;
    endTime: Date
}

export type Route = {
    price: number;
    src: string;
    dest: string;
    stt: Date;
    endt: Date;
    stops: string[];
};

export type RouteDetails = {
    src: string;
    dest: string;
}

export type RouteFlyweight = {
    stt: Date;
    endt: Date;
    stops: string;
    price: number;
    details: RouteDetails;
}