import csv
import time
import random

format = '%Y-%m-%d %H:%M:%S'
id = 1

def str_time_prop(start, end, time_format, prop):
    """Get a time at a proportion of a range of two formatted times.

    start and end should be strings specifying times formatted in the
    given format (strftime-style), giving an interval [start, end].
    prop specifies how a proportion of the interval to be taken after
    start.  The returned time will be in the specified format.
    """

    stime = time.mktime(time.strptime(start, time_format))
    etime = time.mktime(time.strptime(end, time_format))

    ptime = stime + prop * (etime - stime)

    return time.strftime(time_format, time.localtime(ptime))


def random_date(start, end, prop):
    return str_time_prop(start, end, format, prop)

def getRandomPrice():
    percent = random.random()
    price = 1000 * percent
    return price if price > 200 else 200.00

def getEndDate(start):
    startTime = time.mktime(time.strptime(start, format))
    diff = 240 * 60 * random.random()
    if diff < 3600:
        diff = 3600
    return time.strftime(format, time.localtime(startTime + diff))

def getId():
    global id
    id = id + 1
    return id

def copyRoutes(flights):
    with open('routes.csv', 'r') as routes:
        reader = csv.reader(routes)
        for row in reader:
            start = random_date("2022-1-1 00:00:00", "2022-7-1 00:00:00", random.random())
            line = str(getId()) + ',' + row[2] + ',' + row[4] + ',' + start + ',' + getEndDate(start) + ',' + str(getRandomPrice()) +'\n'
            flights.write(line)
    routes.close()

def makeFlights():
    with open('flights.csv', 'w') as flights:
        for i in range(20):
            copyRoutes(flights)
    flights.close()

    return print('Copied!')
print(random_date("2012-1-1 00:00:00", "2012-7-1 00:00:00", random.random()))
makeFlights()