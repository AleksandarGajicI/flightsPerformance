import { Dictionary } from "../util";
import { Queue } from "../util/queue";
import { Edge, FindFlightParams, Graph, Route, RouteDetails, RouteFlyweight } from "./types";
import { edgeHasBeenVisited, flightIsAfterFaster, getKeyForEdgeFaster, getRouteKey, getRouteKeyFaster } from "./shared";

export const bfsWithFlyweight = ({ src, dest, startTime, endTime }: FindFlightParams) => (graph: Graph<Edge>) => {
    const initialMemory = process.memoryUsage().heapTotal;
    console.log(Object.keys(graph).length);
    const startKey = src + '-' + startTime;
    const routes: Dictionary<RouteFlyweight> = {
        [startKey]: { 
            price: 0, 
            stops: '',
            endt: endTime,
            stt: startTime, 
            details: { src, dest },
        }
    };
    
    const queue = new Queue<{
        prevEnd: Date,
        graphNode: string,
        parentKey: string,
        parentRouteKey: string
    }>();

    queue.enqueue({
        graphNode: src,
        parentKey: src,
        prevEnd: startTime,
        parentRouteKey: startKey
    });
    
    while(queue.length > 0) {

        const { graphNode, parentRouteKey, parentKey, prevEnd } = queue.dequeue()!;
        const curr = graph[graphNode];

        // no curr means no flight in time frame -> dead end
        if (!curr) {
            removeRoute(parentRouteKey, routes);
            continue;
        }
        
        //stop searching if you reached destination and keep it in routes
        if(curr.name === dest) continue;

        for (let i = curr.edges.length - 1; i >= 0; i--) {
            const edge = curr.edges[i];
            const { stt, endt, dest} = edge;
    
            if (!flightIsAfterFaster(prevEnd, stt)) break;

            if (edgeHasBeenVisited(parentKey, edge)) continue;
            
            queue.enqueue({
                prevEnd: endt,
                graphNode: dest,
                parentKey: getKeyForEdgeFaster(parentKey, edge),
                parentRouteKey: getRouteKeyFaster(parentRouteKey, edge),
            });
            addRoute(parentRouteKey, routes, edge);
        }

        removeRoute(parentRouteKey, routes);
    }
    console.log(`Used memory: ${((process.memoryUsage().heapTotal - initialMemory))}`);

    return Object.values(routes);
}

const addRoute = (parentKey: string, routes: Dictionary<RouteFlyweight>, e: Edge) => {
    const prevRoute = routes[parentKey];
    routes[getRouteKey(parentKey, e)] = {
        endt: e.endt,
        details: prevRoute.details,
        price: prevRoute.price + e.price,
        stops: prevRoute.stops + '-' + e.dest,
        stt: prevRoute.stops.length === 0 ? e.stt : prevRoute.stt,
    }
}

const removeRoute = (key: string, routes: Dictionary<RouteFlyweight>) => delete routes[key];

const routeStopsFactory = () => {
    const details: Dictionary<RouteDetails> = {};

    return {
        get: (key: string): RouteDetails => {
            if (details[key]) return details[key];

            const [src, dest] = key.split('-');
            const newRouteDetails = { src, dest };
            details[key] = newRouteDetails;

            return newRouteDetails;
        }
    }
}
