export type Friends = Array<string>;

/** Parses JSON produced by jsonifyFriends back into a Friends. */
export const parseFriends = (data: unknown): Friends => {
  if (!Array.isArray(data))
    throw Error(`not an array: ${typeof data}`);
  const array_data: Array<string> = [];
  for (const elem_data of data) {
    if (typeof elem_data !== "string")
      throw Error(`not a string: ${typeof elem_data}`);
    array_data.push(elem_data);
  }
  return array_data;
};

/** Turns a friends list into JSON. */
export const jsonifyFriends = (val: Friends): unknown => {
  const array_val: Array<unknown> = [];
  for (const elem_val of val) {
    array_val.push(elem_val);
  }
  return array_val;
};