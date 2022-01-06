import { Flight } from "../domain";
import { Dictionary, Edge, FindFlightParams, Graph, Node, Route } from "./types";

export const setUpFlightsGraph = (flights: Flight[]) => {
    const nodes: Graph<Edge> = {};
    for (const flight of flights) {
        const name = flight.src;
        nodes[name] ? addEdge(nodes[name], flight) : nodes[name] = {
            name,
            edges: [getEdgeFromFlight(flight)]
        };
    }
    
    return nodes;
}

//edges are sorted by date so we can shortcut if dates are out of range, no need to go through all edges

export const bfs = ({ src, dest, startTime, endTime }: FindFlightParams) => (graph: Graph<Edge>) => {
    console.log(Object.keys(graph).length);
    const startKey = `${src}-${startTime}`;
    const queue = [src];
    const parentKeys = [src];
    const routeKeys = [startKey];
    const prevEndDate: Date[] = [startTime];
    const routes: Dictionary<Route> = {
        [startKey]: { 
            price: 0, 
            endt: endTime, 
            src, 
            stt: startTime, 
            dest, 
            stops: []
        }
    };
    
    while(queue.length > 0) {
        const curr = graph[queue.shift()!];
        const prevEnd = prevEndDate.shift()!;
        const parentKey = parentKeys.shift()!;
        const parentRouteKey = routeKeys.shift()!;

        // no curr means no flight in time frame -> dead end
        if (!curr || tooManyStops(parentKey)) {
            removeRoute(parentKey, routes);
            continue;
        }
        
        //stop searching if you reached destination and keep it in routes
        if(curr.name === dest) continue;

        for (const edge of curr.edges) {
            const { stt, endt, dest} = edge;

            if (!flightIsAfter(prevEnd, stt) ||
                edgeHasBeenVisited(parentKey, edge)
            ) continue;
            
            queue.push(dest);
            prevEndDate.push(endt);
            parentKeys.push(getKeyForEdge(parentKey, edge));
            routeKeys.push(getRouteKey(parentRouteKey, edge));
            addRoute(parentRouteKey, routes, edge);
        }
        

        removeRoute(parentRouteKey, routes);
    }

    return Object.values(routes).filter(route => route.stops[route.stops.length - 1] === dest);
}

const getEdgeFromFlight = ({ dest, price, stt, endt }: Flight): Edge => ({
    stt,
    dest,
    endt,
    price,
});

const addRoute = (parentKey: string, routes: Dictionary<Route>, e: Edge) => {
    const prevRoute = routes[parentKey];
    routes[getRouteKey(parentKey, e)] = {
        ...prevRoute,
        endt: e.endt,
        price: prevRoute.price + e.price,
        stops: [...prevRoute.stops, e.dest],
    }
}

const notFirst = (curr: string, src: string) => curr !== src;
const tooManyStops = (parentKey: string) => parentKey.split('.').length > 7;
const getKeyForEdge = (parentKey: string, e: Edge) => `${parentKey}-${e.dest}`;
const removeRoute = (key: string, routes: Dictionary<Route>) => delete routes[key];
const edgeHasBeenVisited = (parentKey: string, e: Edge) => parentKey.includes(e.dest);
const flightIsTooLate = (flightStart: Date, wantedEnd: Date) => flightStart > wantedEnd;
const flightIsTooEarly = (flightStart: Date, wantedStart: Date) => flightStart < wantedStart;
const getRouteKey = (parentRouteKey: string, e: Edge) => `${parentRouteKey}.${e.dest}-${e.stt}`;
const addEdge = (node: Node<Edge>, flight: Flight) => node.edges.push(getEdgeFromFlight(flight));
const flightIsAfter = (firstEnd: Date, secondStart: Date) => secondStart > new Date(firstEnd.getTime() + 15*60000);