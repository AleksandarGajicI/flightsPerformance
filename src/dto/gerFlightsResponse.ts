export interface GetFlightsResponse {
    timestamp: number;
    data: FlightRouteDto[];
}

export interface FlightRouteDto {
    end: Date;
    start: Date;
    src: string;
    dest: string;
    stops: string;
    price: number;
}