import { isRecord } from "./record";
import { Location } from "./locations";


/**
 * Records that a friend, on their walk across campus, will get the given
 * distance from the given location on this user's path.
 */
export type Nearby = {friend: string, dist: number, loc: Location};

/**
 * Creates a Location object using given data, if data is properly formed
 * as a record containing all Location fields
 * @param data to parse
 * @returns Location object created using data
 */
export const parseLocation = (data: unknown): Location => {
  if (!isRecord(data))
    throw new Error(`not a record: ${typeof data}`);
  if (typeof data.kind !== "string")
    throw new Error(`kind is not string: ${typeof data.kind}`);

  const x = data.x;
  if (typeof x !== "number")
    throw Error(`not a number: ${typeof x}`);

  const y = data.y;
  if (typeof y !== "number")
    throw Error(`not a number: ${typeof y}`);

  return {x: x, y: y}
};

/**
 * Creates a JSON object with the values from given Location
 * @param val Location data to convert to JSON
 * @returns JSON object created
 */
export const jsonifyLocation = (val: Location): unknown => {
  const x = val.x;
  const y = val.y;
  return {x: x, y: y};
};

/**
 * Creates a Nearby object using given data, if data is properly formed
 * as a record containing all Nearby fields
 * @param data to parse
 * @returns Nearby object created using data
 */
export const parseNearby = (data: unknown): Nearby => {
  if (!isRecord(data))
    throw new Error(`not a record: ${typeof data}`);
  if (typeof data.kind !== "string")
    throw new Error(`kind is not string: ${typeof data.kind}`);

  const loc = data.loc;
  const parsed_loc = parseLocation(loc);

  const friend = data.friend;
  if (typeof friend !== "string")
    throw Error(`not a string: ${typeof friend}`);

  const dist = data.dist;
  if (typeof dist !== "number")
    throw Error(`not a number: ${typeof dist}`);

  return {loc: parsed_loc, friend: friend, dist: dist}
};

/**
 * Creates a JSON object with the values from given Nearby
 * @param val Nearby data to convert to JSON
 * @returns JSON object created
 */
export const jsonifyNearby = (val: Nearby): unknown => {
  const loc = val.loc;
  const jsonified_loc = jsonifyLocation(loc);
  const friend = val.friend;
  const dist = val.dist;
  return {loc: jsonified_loc, friend: friend, dist: dist}
};