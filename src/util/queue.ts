import { Dictionary } from "./types";

export class Queue<T> {
    private counter: number;
    private queue: Dictionary<T>;

    constructor() {
        this.counter = 0;
        this.queue = {};
    }

    enqueue = (obj: T) => {
        this.counter += 1;
        this.queue[this.counter] = obj;
    };

    dequeue = (): T => {
        this.counter -= 1;
        return this.queue[this.counter + 1];
    };

    get length() {
        return this.counter;
    }
}