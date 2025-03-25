import { Location, sameLocation, distance } from './locations';
import { Edge } from './campus';
import { Heap, newHeap } from './heap';


/**
 * A path from one location on the map to another by following along the given
 * steps in the order they appear in the array. Each edge must start at the
 * place where the previous edge ended. We also cache the total distance of the
 * edges in the path for faster access.
 */
export type Path =
    {start: Location, end: Location, steps: Array<Edge>, dist: number};

// Compares two paths by which is shorter.
const comparePaths = (a: [number, Path], b: [number, Path]): number => {
  const [est1, _] = a;
  const [est2, __] = b;
  return est1 - est2;
}

// Converts a location to a string that can be used as a map key.
const toKey = (loc: Location): string => `(${loc.x}, ${loc.y})`;

/**
 * Returns the shortest path from the given start to the given ending location
 * that can be made by following along the given edges. If no path exists, then
 * this will return undefined. (Note that all distances must be positive or else
 * findPath may not work!)
 */
export const findPath = (
    start: Location, end: Location, edges: Array<Edge>): Path | undefined => {
  const graph = map(edges);
  // Set of locations for which we already found the shortest path.
  const found = new Set<string>();

  // Queue of paths out of nodes with found paths.
  const queue: Heap<[number, Path]> = newHeap<[number, Path]>(comparePaths);
  queue.add([distance(start, end), {start: start, end: start, steps: [], dist: 0}]);  // empty path

  // Inv: path.end !== end for all paths in queue such that 
  //      found.contains(path) == false
  while (!queue.isEmpty()) {
    const [_, path] = queue.removeMin();
    if (sameLocation(path.end, end))
      return path;  // found one and it must be shortest since it was first

    const key = toKey(path.end);
    if (found.has(key))
      continue;
    found.add(key);

    const curr = graph.get(key);
    if (curr !== undefined) {
      const unfound = curr.filter((n) => !found.has(toKey(n.end)));
      for (const next of unfound) {  
        queue.add([path.dist + next.dist + distance(next.end, end), {
            start: path.start, end: next.end,
            steps: path.steps.concat([next]), dist: path.dist + next.dist
          }]);
        }
    }
  }

  return undefined;  // no path to end
};

// Map from each location to all edges *out* of it
const map = (edges: Array<Edge>): Map<string, Array<Edge>> => {
  const graph = new Map<string, Array<Edge>>();
  for (const e of edges) {
    let children = graph.get(toKey(e.start));
    if (children === undefined) {
      children = [];
      graph.set(toKey(e.start), children)
    }
    children.push(e);
  }

  return graph;
}