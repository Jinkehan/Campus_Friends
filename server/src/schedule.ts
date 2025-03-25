import { isRecord } from "./record";


/** An hour at which a class can start. */
export type Hour = "8:30" | "9:30" | "10:30" | "11:30" | "12:30"
                 | "1:30" | "2:30" | "3:30" | "4:30" | "5:30";

/** The time and place where some event starts. */
export type EventStart = {hour: Hour, location: string, desc: string};

/**
 * A schedule of classes, which is represented by a list of events and the times
 * at which they start. This representation implies that the person will stay at
 * that location until 10 minutes before the next event, at which point, they
 * will walk to the new location. (If that is not the case, then more events
 * should be added to schedule, one for each time they move locations.)
 */
export type Schedule = Array<EventStart>;


/** List of all hours at which classes start. */
export const HOURS: ReadonlyArray<Hour> = [
    "8:30", "9:30", "10:30", "11:30", "12:30",
    "1:30", "2:30", "3:30", "4:30", "5:30"
  ];


/** Returns all hours after the given one. */
export const hoursAfter = (hour: Hour): Array<Hour> => {
  const index = HOURS.indexOf(hour);
  return HOURS.slice(index+1);
}


/**
 * Returns the index of the event in the schedule starting at the given hour.
 * @returns index i such that schedule[i].hour === hour or -1 if noe exists
 */
export const indexAtHour = (schedule: Schedule, hour: Hour): number => {
  for (const [idx, event] of schedule.entries()) {
    if (event.hour === hour)
      return idx;
  }
  return -1;
}


/** Parses JSON for an hour back into TypeScript. */
export const parseHour = (data: unknown): Hour => {
  if (typeof data !== "string")
    throw new Error(`kind is not string: ${typeof data}`);

  switch (data) {
    case "8:30": case "9:30": case "10:30": case "11:30": case "12:30":
    case "1:30": case "2:30": case "3:30": case "4:30": case "5:30":
      return data;

    default:
    throw new Error(`unknown hour: ${data}`);
  }
};

/** Produces JSON representing the given hour. */
export const jsonifyHour = (val: Hour): unknown => {
  return val;
};


/** Parses JSON for an event start back into TypeScript. */
export const parseEventStart = (data: unknown): EventStart => {
  if (!isRecord(data))
    throw new Error(`not a record: ${typeof data}`);

    const hour = data.hour;
    const parsed_hour = parseHour(hour);

    const location = data.location;
    if (typeof location !== "string")
      throw Error(`location is not a string: ${typeof location}`);

    const desc = data.desc;
    if (typeof desc !== "string")
      throw Error(`desc is not a string: ${typeof desc}`);

    return {hour: parsed_hour, location: location, desc: desc}
};

/** Produces JSON representing the given event start. */
export const jsonifyEventStart = (val: EventStart): unknown => {
    const hour = val.hour;
    const jsonified_hour = jsonifyHour(hour);
    const location = val.location;
    const desc = val.desc;
    return {hour: jsonified_hour, location: location, desc: desc};
};


/** Parses JSON for a schedule back into a TypeScript. */
export const parseSchedule = (data: unknown): Schedule => {
  if (!Array.isArray(data))
    throw Error(`not an array: ${typeof data}`);

  const array_data: Array<EventStart> = [];
  for (const elem_data of data) {
    const parsed_elem_data = parseEventStart(elem_data);
    array_data.push(parsed_elem_data);
  }
  return array_data;
};

/** Produces JSON representing the given schedule. */
export const jsonifySchedule = (val: Schedule): unknown => {
  const array_val: Array<unknown> = [];
  for (const elem_val of val) {
    const jsonified_elem_val = jsonifyEventStart(elem_val);
    array_val.push(jsonified_elem_val);
  }
  return array_val;
};