import { Flight } from "../domain";
import { Dictionary } from "../util";
import { Edge, FindFlightParams, Graph, Route } from "./types";
import { addEdge, addRoute, edgeHasBeenVisited, flightIsAfter, getEdgeFromFlight, getKeyForEdge, getRouteKey, removeRoute } from "./shared";

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
    const queue2 = [{
        graphNode: src,
        parentKey: src,
        prevEnd: startTime,
        parentRouteKey: startKey
    }];
    
    while(queue2.length > 0) {

        const { graphNode, parentRouteKey, parentKey, prevEnd } = queue2.shift()!;
        const curr = graph[graphNode];

        // no curr means no flight in time frame -> dead end
        if (!curr) {
            removeRoute(parentRouteKey, routes);
            continue;
        }
        
        //stop searching if you reached destination and keep it in routes
        if(curr.name === dest) continue;

        for (const edge of curr.edges) {
            const { stt, endt, dest} = edge;

            if (!flightIsAfter(prevEnd, stt) ||
                edgeHasBeenVisited(parentKey, edge)
            ) continue;
            
            queue2.push({
                prevEnd: endt,
                graphNode: dest,
                parentKey: getKeyForEdge(parentKey, edge),
                parentRouteKey: getRouteKey(parentRouteKey, edge),
            });
            addRoute(parentRouteKey, routes, edge);
        }

        removeRoute(parentRouteKey, routes);
    }

    return Object.values(routes);
}

export const bfsMultipleQueues = ({ src, dest, startTime, endTime }: FindFlightParams) => (graph: Graph<Edge>) => {
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
        if (!curr) {
            removeRoute(parentRouteKey, routes);
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

    return Object.values(routes);
}
