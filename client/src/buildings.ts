import { isRecord } from "./record";


/** Represents a location on the map. */
export type Location = {x: number, y: number};


/** Parses JSON data containing a location. */
export const parseLocation = (data: unknown): Location => {
  if (!isRecord(data))
    throw new Error(`data is not a record: ${typeof data}`)
  if (typeof data.x !== 'number')
    throw new Error(`location x not a number: ${data.x}`);
  if (typeof data.y !== 'number')
    throw new Error(`location y not a number: ${data.y}`);
  return {x: data.x, y: data.y};
};


/** Information about a building on campus. */
export type Building = {shortName: string, longName: string, location: Location};


/**
 * Returns the building in the given list with the given short name.
 * @requires some building in the list has the given short name
 */
export const getBuildingByShortName =
    (buildings: Array<Building>, shortName: string): Building => {
  for (const building of buildings) {
    if (building.shortName === shortName)
      return building;
  }
  throw new Error(`no building with short name "${shortName}"`);
};


/** Parses JSON data containing an array of buildings. */
export const parseBuildings = (data: unknown): Array<Building> => {
  if (!Array.isArray(data))
    throw new Error(`data not an array: ${typeof data}`);

  const buildings: Array<Building> = [];
  for (const b of data) {
    if (!isRecord(b))
      throw new Error(`building is not a record: ${typeof b}`)
    if (typeof b.shortName !== 'string')
      throw new Error(`building shortName not a string: ${b.shortName}`);
    if (typeof b.longName !== 'string')
      throw new Error(`building longName not a string: ${b.longName}`);
    buildings.push({
        shortName: b.shortName,
        longName: b.longName,
        location: parseLocation(b.location)
      })
  }
  return buildings;
};


/** A straight-line walkway between two points on the campus map. */
export type Edge = {start: Location, end: Location};

/** Parses JSON data containing an array of edges. */
export const parseEdges = (data: unknown): Array<Edge> => {
  if (!Array.isArray(data))
    throw new Error(`data not an array: ${typeof data}`);

  const edges: Array<Edge> = [];
  for (const e of data) {
    if (!isRecord(e))
      throw new Error(`building is not a record: ${typeof e}`)
    edges.push({start: parseLocation(e.start), end: parseLocation(e.end)});
  }
  return edges;
};