export * from './queue';
export * from './types';

export const retry = (fn: () => Promise<any>, times: number): Promise<any> => fn()
.then(res => {
    console.log("res", res)
    return Promise.resolve(res)
})
.catch(() => {
    times -=1;
    if (times > 0) {
        return retry(fn, times);
    } else {
        throw new Error('Tried maximum amount of times');
    }
});

export const isTableEmpty = (rows: ({count: number})[]) => rows[0].count < 1;