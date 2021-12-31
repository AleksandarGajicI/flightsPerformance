import autocannon, { Result } from 'autocannon';

const connections = 1000;
const maxConnectionRequests = 1000;
const urlBase = 'http://localhost:5000';

const startBenchmark = (path: string) => {

    const benchmark = autocannon({
        url: `${urlBase}`,
        connections,
        maxConnectionRequests,
        headers: {
            'content-type': 'application/json',
        },
        requests: [{
            path,
            method: 'GET',
        }]
    }, finished);

    autocannon.track(benchmark);
}

const finished = (err: Error, res: Result) => err ? console.log(err) : console.log(res);
startBenchmark(process.argv[2] || '/');
