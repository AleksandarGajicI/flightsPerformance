import { Dictionary } from "./types";

export class Queue<T> {
    private readCounter: number;
    private queue: Dictionary<T>;
    private insertCounter: number;

    constructor() {
        this.insertCounter = 0;
        this.readCounter = 0;
        this.queue = {};
    }

    enqueue = (obj: T) => {
        this.insertCounter += 1;
        this.queue[this.insertCounter] = obj;
    };

    dequeue = (): T | undefined => {
        if (this.isQueueEmpty()) return undefined;
        this.readCounter += 1;
        const res = this.queue[this.readCounter];
        delete this.queue[this.readCounter];
        return res;
    };

    get length() {
        return this.insertCounter - this.readCounter;
    };

    private isQueueEmpty = () => this.length <= 0;
}