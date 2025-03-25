import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { BUILDINGS, EDGES, getBuildingByShortName, locationsOnPath } from './campus';
import { findPath } from './pathfinder';
import { Friends, jsonifyFriends, parseFriends } from "./friends";
import { indexAtHour, jsonifySchedule, parseHour, parseSchedule, Schedule } from "./schedule";
import { Nearby } from "./nearby";
import { buildTree, findClosestInTree, LocationTree } from "./location_tree";

// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check


// Map from user names to their lists of friends. Defaults to an empty list.
const allFriends: Map<string, Friends> = new Map<string, Friends>();

// Map from user names to their schedules. Defaults to an empty schedule.
const allSchedules: Map<string, Schedule> = new Map<string, Schedule>();


/** Determines if the first person is in the second person's list of friends. */
const isFriend = (friend: string, user: string): boolean => {
  const friends = allFriends.get(user);
  return (friends !== undefined) && friends.includes(friend);
};


/** Called from the tests to clear out any data stored during the current test. */
export const clearDataForTesting = (): void => {
  allFriends.clear();
  allSchedules.clear();
}


/** Returns a list of friends of the user. */
export const getFriends = (req: SafeRequest, res: SafeResponse): void => {
  const user = first(req.query.user);
  if (user === undefined) {
    res.status(400).send('required argument "user" was missing');
    return;
  }

  const friends = allFriends.get(user);
  if (friends === undefined) {
      res.send({friends: []});
  } else {
      res.send({friends: jsonifyFriends(friends)});
  }
};

/** Updates a list of friends of the user. */
export const setFriends = (req: SafeRequest, res: SafeResponse): void => {
  if (typeof req.body.user !== 'string') {
    res.status(400).send('missing or invalid "user" in POST body');
    return;
  }

  if (req.body.friends === undefined) {
    res.status(400).send('missing "friends" in POST body');
    return;
  }

  const friends = parseFriends(req.body.friends);
  allFriends.set(req.body.user, friends);
  res.send({saved: true});
};


/** Returns the schedule of the user. */
export const getSchedule = (req: SafeRequest, res: SafeResponse): void => {
  const user = first(req.query.user);
  if (user === undefined) {
    res.status(400).send('required argument "user" was missing');
    return;
  }

  const schedule = allSchedules.get(user);
  if (schedule === undefined) {
      res.send({schedule: []});
  } else {
      res.send({schedule: jsonifySchedule(schedule)});
  }
};

/** Updates the schedule of the user. */
export const setSchedule = (req: SafeRequest, res: SafeResponse): void => {
  if (typeof req.body.user !== 'string') {
    res.status(400).send('missing or invalid "user" in POST body');
    return;
  }

  if (req.body.schedule === undefined) {
    res.status(400).send('missing "schedule" in POST body');
    return;
  }

  const schedule = parseSchedule(req.body.schedule);
  allSchedules.set(req.body.user, schedule);
  res.send({saved: true});
};


/** Returns a list of all known buildings. */
export const getBuildings = (_req: SafeRequest, res: SafeResponse): void => {
  res.send({buildings: BUILDINGS});
};


/** Returns a list of all known buildings. */
export const getShortestPath = (req: SafeRequest, res: SafeResponse): void => {
  const user = first(req.query.user);
  if (user === undefined) {
    res.status(400).send('required argument "user" was missing');
    return;
  }

  const hourStr = first(req.query.hour);
  if (hourStr === undefined) {
    res.status(400).send('required argument "hour" was missing');
    return;
  }

  const schedule = allSchedules.get(user);
  if (schedule === undefined) {
    res.status(400).send('user has no saved schedule');
    return;
  }

  const hour = parseHour(hourStr);
  const index = indexAtHour(schedule, hour);
  if (index < 0) {
    res.status(400).send('user has no event starting at this hour');
    return;
  } else if (index === 0) {
    res.status(400).send('user is not walking between classes at this hour');
    return;
  }

  // Find the shortest path for this user's walk at this time.
  const start = getBuildingByShortName(schedule[index-1].location);
  const end = getBuildingByShortName(schedule[index].location);
  const path = findPath(start.location, end.location, EDGES);
  if (!path) {
    res.send({found: false});
    return;
  }

  const nearby: Array<Nearby> = [];

  // For any friends that are also walking at this time, record the closest
  // point on this user's path to any point on their walk in the nearby list.
  const friends = allFriends.get(user);
  if (friends !== undefined) {
    // Record all of the locations on the user's walk. (Will be useful later.)
    const locs = locationsOnPath(path.steps);

    for (const friend of friends) {
      if (!isFriend(user, friend))  // require both to mark as friends
        continue;

      // Get the friend's schedule. (Can skip them if they don't have one.)
      const fSched = allSchedules.get(friend);
      if (fSched === undefined)
        continue;

      // See if they walk at this hour. (Can skip them if not.)
      const fIndex = indexAtHour(fSched, hour);
      if (fIndex <= 0)
        continue;
      const fStart = getBuildingByShortName(fSched[fIndex-1].location);
      const fEnd = getBuildingByShortName(fSched[fIndex].location);

      // Find all the points on the friend's walk.
      const fPath = findPath(fStart.location, fEnd.location, EDGES);
      if (!fPath)
        continue;
      const fLocs = locationsOnPath(fPath.steps);

      // TODO: implement this in Task 5 (using locs and fLocs)
      const t: LocationTree = buildTree(locs);
      const [l, d] = findClosestInTree(t, fLocs);
      nearby.push({friend: friend, dist: d, loc: l});
    }
  }

  res.send({found: true, path: path.steps, nearby: nearby});
};


// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};
