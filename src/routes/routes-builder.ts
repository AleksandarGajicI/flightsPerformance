import { Router } from "express";
import { Middleware, parseQueryParams } from "../middleware";
import { loadRoutesVer1 } from "./flights-ver1";

export const routesBuilder = (router: Router) => {
    const routes: ((router: Router, middlewares: Middleware[]) => void)[] = [];
    const middlewares: Middleware[] = [parseQueryParams];

    return {

        addFlightsRoutesVer1: function () {
            routes.push(loadRoutesVer1)
            return this;
        },
        build: () => {
            routes.forEach(routehandlers => routehandlers(router, middlewares));
            return router;
        }
    }
}