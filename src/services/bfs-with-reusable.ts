import { Dictionary } from "../util";
import { Queue } from "../util/queue";
import { Edge, FindFlightParams, Graph, Route } from "./types";
import { edgeHasBeenVisited, flightIsAfterFaster, getKeyForEdgeFaster, getRouteKey, getRouteKeyFaster, removeRoute } from "./shared";

export const bfsWithReusable = ({ src, dest, startTime, endTime }: FindFlightParams) => (graph: Graph<Edge>) => {
    console.log(Object.keys(graph).length);
    const startKey = src + '-' + startTime;
    const startRoute: Route = { 
        price: 0, 
        endt: endTime, 
        src, 
        stt: startTime, 
        dest, 
        stops: []
    };

    const numOfReusableRoutes = 1000;
    let reusableRouteIndex = 0;
    const reusableRoutes = new Array<Route>(numOfReusableRoutes).fill({...startRoute, stops: []});

    const routes: Dictionary<Route> = {
        [startKey]: startRoute
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
            if (areThereRoutesToReuse(reusableRouteIndex, numOfReusableRoutes)) {
                addRoute(parentRouteKey, routes, edge, reusableRoutes[reusableRouteIndex]);
                reusableRouteIndex += 1;
            }
            addRoute(parentRouteKey, routes, edge);
        }

        removeRoute(parentRouteKey, routes);
        if (reusableRouteIndex !== 0) reusableRouteIndex -= 1;
    }

    return Object.values(routes);
}

const addRoute = (parentKey: string, routes: Dictionary<Route>, e: Edge, reusableRoute?: Route) => {
    const prevRoute = routes[parentKey];
    if (reusableRoute) {
        reusableRoute.endt = e.endt;
        reusableRoute.price = prevRoute.price + e.price;
        reusableRoute.stops = [...prevRoute.stops, e.dest]
        routes[getRouteKey(parentKey, e)] = reusableRoute;
        return;
    }
    routes[getRouteKey(parentKey, e)] = {
        ...prevRoute,
        endt: e.endt,
        price: prevRoute.price + e.price,
        stops: [...prevRoute.stops, e.dest],
    }
}

const areThereRoutesToReuse = (currRoute: number, numOfReusableRoutes: number) => currRoute < numOfReusableRoutes;