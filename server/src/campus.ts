import { Location, sameLocation } from "./locations";


/** Information about a building on campus. */
export type Building = {shortName: string, longName: string, location: Location};

/** List of many known buildings on campus. */
export const BUILDINGS: Array<Building> = [
  {shortName: 'BAG', longName: 'Bagley Hall',
   location: {x: 1914.5103, y: 1709.8816}},
  {shortName: 'BGR', longName: 'By George',
   location: {x: 1671.5499, y: 1258.4333}},
  {shortName: 'CSE', longName: 'Paul G. Allen Center for Computer Science & Engineering',
   location: {x: 2259.7112, y: 1715.5273}},
  {shortName: 'CS2', longName: 'Bill & Melinda Gates Center For Computer Science & Engineering',
   location: {x: 2315.0936, y: 1780.7913}},
  {shortName: 'DEN', longName: 'Denny Hall',
   location: {x: 1890.0, y: 892.57144}},
  {shortName: 'EEB', longName: 'Electrical Engineering Building',
   location: {x: 2159.9587, y: 1694.8192}},
  {shortName: 'GWN', longName: 'Gowen Hall',
   location: {x: 2022.3254, y: 1210.9561}},
  {shortName: 'KNE', longName: 'Kane Hall',
   location: {x: 1876.6109, y: 1165.2467}},
  {shortName: 'LOW', longName: 'Loew Hall',
   location: {x: 2375.6262, y: 1576.1262}},
  {shortName: 'MGH', longName: 'Mary Gates Hall',
   location: {x: 1973.1382, y: 1433.6676}},
  {shortName: 'MLR', longName: 'Miller Hall',
   location: {x: 2184.7074, y: 1045.0386}},
  {shortName: 'MOR', longName: 'Moore Hall',
   location: {x: 2317.1749, y: 1859.502}},
  {shortName: 'MUS', longName: 'Music Building',
   location: {x: 2202.5882, y: 957.31147}},
  {shortName: 'OUG', longName: 'Odegaard Undergraduate Library',
   location: {x: 1724.1276, y: 1208.4754}},
  {shortName: 'PAA', longName: 'Physics/Astronomy Building A',
   location: {x: 1625.2679, y: 1783.5181}},
  {shortName: 'PAB', longName: 'Physics/Astronomy Building',
   location: {x: 1560.6467, y: 1698.3767}},
  {shortName: 'SAV', longName: 'Savery Hall',
   location: {x: 1951.8672, y: 1094.7886}},
  {shortName: 'SUZ', longName: 'Suzzallo Library',
   location: {x: 1895.8038, y: 1325.861}},
  {shortName: 'T65', longName: 'Thai 65',
   location: {x: 1370.6408, y: 807.35188}},
  {shortName: 'FSH', longName: 'Fishery Sciences Building',
   location: {x: 1061.8213, y: 1779.6903}},
  {shortName: 'MCC', longName: 'McCarty Hall',
   location: {x: 2345.7143, y: 528.64286}},
  {shortName: 'UBS', longName: 'University Bookstore',
   location: {x: 1373.6078, y: 556.55779}},
  {shortName: 'RAI', longName: 'Raitt Hall',
   location: {x: 2024.5103, y: 993.01223}},
  {shortName: 'ROB', longName: 'Roberts Hall',
   location: {x: 2309.4107, y: 1979.0003}},
  {shortName: 'CHL', longName: 'Chemistry Library',
   location: {x: 1707.6629, y: 1671.5098}},
  {shortName: 'IMA', longName: 'Intramural Activities Building',
   location: {x: 2722.3352, y: 1710.2859}},
  {shortName: 'HUB', longName: 'Student Union Building',
   location: {x: 2269.7856, y: 1364.3777}},
  {shortName: 'MNY', longName: 'Meany Hall',
   location: {x: 1684.1768, y: 1297.0716}},
  {shortName: 'PAR', longName: 'Parrington Hall',
   location: {x: 1715.3571, y: 1060.4286}},
  {shortName: 'MCM', longName: 'McMahon Hall',
   location: {x: 2446.9314, y: 898.06137}},
  {shortName: 'CMU', longName: 'Communications Building',
   location: {x: 2344.8512, y: 1114.6251}},
];


/**
 * Returns the building in the given list with the given short name.
 * @requires some building in the list has the given short name
 */
export const getBuildingByShortName = (shortName: string): Building => {
  for (const building of BUILDINGS) {
    if (building.shortName === shortName)
      return building;
  }
  throw new Error(`no building with short name "${shortName}"`);
};


/**
 * A straight-line walkway between two points on the campus map.  The dist
 * parameter is the distance between the two points.
 */
export type Edge = {start: Location, end: Location, dist: number};

/**
 * List of all connections on the campus map. Note that this is filled in by a
 * call to parseEdge below. It is empty until then.
 */
export const EDGES: Array<Edge> = [];

/** Adds all connections found (one per line) into the array above. */
export const parseEdges = (lines: Array<string>): void => {
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length !== 5)
      throw new Error(`wrong number of parts (${parts.length}) in: ${line}`)
    const start = {x: parseFloat(parts[0]), y: parseFloat(parts[1])};
    const end = {x: parseFloat(parts[2]), y: parseFloat(parts[3])};
    const dist = parseFloat(parts[4]);
    EDGES.push({start, end, dist});
  }
};


/** Returns a list containing all the locations on the given path exactly once. */
export const locationsOnPath = (path: Array<Edge>): Array<Location> => {
  if (path.length === 0)
    throw new Error('no edges in path');

  let i = 0;
  const locs: Array<Location> = [path[0].start, path[0].end];

  // Inv: locs = [path[0].start, path[0.end],.., path[i-1].end]
  while (i + 1 != path.length) {
    i = i + 1;
    const prev = path[i - 1];
    const curr = path[i];

    if (!sameLocation(prev.end, curr.start)) {
      throw new Error('path jumps from one location to another');
    }
    locs.push(curr.end);
  }

  return locs;
};