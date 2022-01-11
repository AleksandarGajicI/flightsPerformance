import { Dictionary } from "../util";
import { Queue } from "../util/queue";
import { Edge, FindFlightParams, Graph, Route } from "./types";
import { edgeHasBeenVisited, flightIsAfter, getKeyForEdge } from "./shared";

export const bfsNoString = ({ src, dest, startTime, endTime }: FindFlightParams) => (graph: Graph<Edge>) => {
    console.log(Object.keys(graph).length);
    const routes: Dictionary<Route> = {
        [1]: { 
            price: 0, 
            endt: endTime, 
            src, 
            stt: startTime, 
            dest, 
            stops: []
        }
    };
    
    const queue = new Queue<{
        prevEnd: Date,
        graphNode: string,
        parentKey: string,
        parentRouteKey: number
    }>();

    queue.enqueue({
        graphNode: src,
        parentKey: src,
        prevEnd: startTime,
        parentRouteKey: 1
    });
    
    while(queue.length > 0) {

        const { graphNode, parentRouteKey, parentKey, prevEnd } = queue.dequeue()!;
        const curr = graph[graphNode];

        console.log('key: ', parentRouteKey);
        // no curr means no flight in time frame -> dead end
        if (!curr) {
            console.log('removing: ', parentRouteKey)
            removeRoute(parentRouteKey, routes);
            continue;
        }
        
        //stop searching if you reached destination and keep it in routes
        if(curr.name === dest) continue;

        for (let i = curr.edges.length - 1; i >= 0; i--) {
            const edge = curr.edges[i];
            const { stt, endt, dest} = edge;
    
            if (!flightIsAfter(prevEnd, stt)) break;

            if (edgeHasBeenVisited(parentKey, edge)) continue;
            
            const key = parentRouteKey + i + 1;

            queue.enqueue({
                prevEnd: endt,
                graphNode: dest,
                parentKey: getKeyForEdge(parentKey, edge),
                parentRouteKey: key,
            });
            addRoute(parentRouteKey, key, routes, edge);
        }

        console.log('removing: ', parentRouteKey)
        removeRoute(parentRouteKey, routes);
    }

    return Object.values(routes);
}

const addRoute = (parentKey: number, key: number, routes: Dictionary<Route>, e: Edge) => {
    console.log('adding route', key)
    const prevRoute = routes[parentKey];
    routes[key] = {
        ...prevRoute,
        endt: e.endt,
        price: prevRoute.price + e.price,
        stops: [...prevRoute.stops, e.dest],
    }
}
const removeRoute = (key: number, routes: Dictionary<Route>) => delete routes[key];
