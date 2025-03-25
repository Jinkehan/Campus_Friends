import { isRecord } from "./record";
import { Location, parseLocation } from "./buildings";


/**
 * Records that a friend, on their walk across campus, will get the given
 * distance from the given location on this user's path.
 */
export type Nearby = {friend: string, dist: number, loc: Location};

/**
 * Creates a Nearby object using given data, if data is properly formed
 * as a record containing all Nearby fields
 * @param data to parse
 * @returns Nearby object created using data
 */
export const parseNearby = (data: unknown): Nearby => {
  if (!isRecord(data))
    throw new Error(`not a record: ${typeof data}`);
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
export const parseNearbyList = (data: unknown): Array<Nearby> => {
  if (!Array.isArray(data))
    throw new Error(`not an array: ${typeof data}`);
  const arr: Array<Nearby> = [];
  for (const elem of data) {
    const parsed_elem = parseNearby(elem);
    arr.push(parsed_elem);
  }
  return arr;
};