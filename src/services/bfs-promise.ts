import { Flight } from "../domain";
import { Dictionary } from "../util";
import { Edge, FindFlightParams, Graph, Node, Route } from "./types";

export const setUpFlightsGraphAsync = async (flights: Flight[]) => {
    const nodes: Graph<Edge> = {};
    for (const flight of flights) {
        const name = flight.src;
        nodes[name] ? await addEdge(nodes[name], flight) : nodes[name] = {
            name,
            edges: [await getEdgeFromFlight(flight)]
        };
    }
    
    return nodes;
}

//edges are sorted by date so we can shortcut if dates are out of range, no need to go through all edges
export const bfsAsync = ({ src, dest, startTime, endTime }: FindFlightParams) => async (graph: Graph<Edge>) => {
    const startKey = `${src}-${startTime}`;
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
    const queue = [{
        graphNode: src,
        parentKey: src,
        prevEnd: startTime,
        parentRouteKey: startKey
    }];
    
    while(queue.length > 0) {
        const { graphNode, parentRouteKey, parentKey, prevEnd } = queue.shift()!;
        const curr = graph[graphNode];

        // no curr means no flight in time frame -> dead end
        if (!curr || await tooManyStops(parentKey)) {
            removeRoute(parentRouteKey, routes);
            continue;
        }
        
        //stop searching if you reached destination and keep it in routes
        if(curr.name === dest) continue;

        for (const edge of curr.edges) {
            const { stt, endt, dest} = edge;

            if (!(await flightIsAfter(prevEnd, stt)) ||
                (await edgeHasBeenVisited(parentKey, edge))
            ) continue;
            
            queue.push({
                prevEnd: endt,
                graphNode: dest,
                parentKey: await getKeyForEdge(parentKey, edge),
                parentRouteKey: await getRouteKey(parentRouteKey, edge),
            });
            addRoute(parentRouteKey, routes, edge);
        }
        

        removeRoute(parentRouteKey, routes);
    }

    return Object.values(routes).filter(route => route.stops[route.stops.length - 1] === dest);
}


export const bfsMultipleQueuesAsync = ({ src, dest, startTime, endTime }: FindFlightParams) => async (graph: Graph<Edge>) => {
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
        if (!curr || await tooManyStops(parentKey)) {
            removeRoute(parentRouteKey, routes);
            continue;
        }
        
        //stop searching if you reached destination and keep it in routes
        if(curr.name === dest) continue;

        for (const edge of curr.edges) {
            const { stt, endt, dest} = edge;

            if (!(await flightIsAfter(prevEnd, stt)) ||
                (await edgeHasBeenVisited(parentKey, edge))
            ) continue;
            
            queue.push(dest);
            prevEndDate.push(endt);
            parentKeys.push(await getKeyForEdge(parentKey, edge));
            routeKeys.push(await getRouteKey(parentRouteKey, edge));
            addRoute(parentRouteKey, routes, edge);
        }
        

        removeRoute(parentRouteKey, routes);
    }

    return Object.values(routes).filter(route => route.stops[route.stops.length - 1] === dest);
}

const getEdgeFromFlight = async ({ dest, price, stt, endt }: Flight): Promise<Edge> => ({
    stt,
    dest,
    endt,
    price,
});

const addRoute = async (parentKey: string, routes: Dictionary<Route>, e: Edge) => {
    const prevRoute = routes[parentKey];
    routes[await getRouteKey(parentKey, e)] = {
        ...prevRoute,
        endt: e.endt,
        price: prevRoute.price + e.price,
        stops: [...prevRoute.stops, e.dest],
    }
}

const tooManyStops = async (parentKey: string) => parentKey.split('.').length > 7;
const getKeyForEdge = async (parentKey: string, e: Edge) => `${parentKey}-${e.dest}`;
const removeRoute = async (key: string, routes: Dictionary<Route>) => delete routes[key];
const edgeHasBeenVisited = async (parentKey: string, e: Edge) => parentKey.includes(e.dest);
const getRouteKey = async (parentRouteKey: string, e: Edge) => `${parentRouteKey}.${e.dest}-${e.stt}`;
const addEdge = async (node: Node<Edge>, flight: Flight) => node.edges.push(await getEdgeFromFlight(flight));
const flightIsAfter = async (firstEnd: Date, secondStart: Date) => secondStart > new Date(firstEnd.getTime() + 900000);