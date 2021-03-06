import { Flight } from "../domain";
import { Dictionary } from "../util";
import { Edge, Node, Route } from "./types";

export const getEdgeFromFlight = ({ dest, price, stt, endt }: Flight): Edge => ({
    stt,
    dest,
    endt,
    price,
});

export const addRoute = (parentKey: string, routes: Dictionary<Route>, e: Edge) => {
    const prevRoute = routes[parentKey];
    routes[getRouteKey(parentKey, e)] = {
        ...prevRoute,
        endt: e.endt,
        price: prevRoute.price + e.price,
        stops: [...prevRoute.stops, e.dest],
        stt: prevRoute.stops.length === 0 ? e.stt : prevRoute.stt,
    }
}

export const getKeyForEdge = (parentKey: string, e: Edge) => `${parentKey}-${e.dest}`;
export const removeRoute = (key: string, routes: Dictionary<Route>) => delete routes[key];
export const getKeyForEdgeFaster = (parentKey: string, e: Edge) => parentKey + '-' + e.dest;
export const edgeHasBeenVisited = (parentKey: string, e: Edge) => parentKey.includes(e.dest);
export const addEdge = (node: Node<Edge>, flight: Flight) => node.edges.push(getEdgeFromFlight(flight));
export const getRouteKey = (parentRouteKey: string, e: Edge) => `${parentRouteKey}.${e.dest}-${e.stt.getTime()}`;
export const flightIsAfter = (firstEnd: Date, secondStart: Date) => secondStart > new Date(firstEnd.getTime() + 15*60000);
export const getRouteKeyFaster = (parentRouteKey: string, e: Edge) => parentRouteKey + '.' + e.dest + '-' + e.stt.getTime();
export const flightIsAfterFaster = (firstEnd: Date, secondStart: Date) => secondStart.getTime() > (firstEnd.getTime() + 15*60000);