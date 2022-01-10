import { Dictionary } from "../util";
import { Queue } from "../util/queue";
import { Edge, FindFlightParams, Graph, Route } from "./types";
import { addRoute, edgeHasBeenVisited, flightIsAfter, getKeyForEdge, getRouteKey, removeRoute } from "./shared";

export const bfsWithQueue = ({ src, dest, startTime, endTime }: FindFlightParams) => (graph: Graph<Edge>) => {
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

        const { graphNode, parentRouteKey, parentKey, prevEnd } = queue.dequeue();
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
            
            queue.enqueue({
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
