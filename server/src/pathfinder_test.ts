import * as assert from 'assert';
import { findPath } from './pathfinder';

describe('findPath', function() {

  const p1 = {x: 1, y: 1};
  const p2 = {x: 1, y: 2};
  const p3 = {x: 2, y: 1};
  const p4 = {x: 2, y: 2};
  const p5 = {x: 0, y: 0.5};

  it('1 node', function() {
    assert.deepStrictEqual(findPath(p1, p1, []),
        {start: p1, end: p1, steps: [], dist: 0})
    assert.deepStrictEqual(findPath(p2, p2, []),
        {start: p2, end: p2, steps: [], dist: 0})
    assert.deepStrictEqual(findPath(p1, p3, []), undefined);
  });

  it('2 nodes', function() {
    const edges = [
        {start: p1, end: p2, dist: 1},
        {start: p2, end: p1, dist: 2},
      ];
    assert.deepStrictEqual(findPath(p1, p1, edges),
        {start: p1, end: p1, steps: [], dist: 0})
    assert.deepStrictEqual(findPath(p1, p2, edges),
        {start: p1, end: p2, steps: [edges[0]], dist: 1})
    assert.deepStrictEqual(findPath(p2, p2, []),
        {start: p2, end: p2, steps: [], dist: 0})
    assert.deepStrictEqual(findPath(p2, p1, edges),
        {start: p2, end: p1, steps: [edges[1]], dist: 2})
    assert.deepStrictEqual(findPath(p1, p3, []), undefined);
  });

  it('3 nodes', function() {
    const edges = [
        {start: p1, end: p2, dist: 1},
        {start: p1, end: p3, dist: 3},
        {start: p2, end: p1, dist: 1},
        {start: p2, end: p3, dist: 1},
        {start: p3, end: p1, dist: 3},
        {start: p3, end: p2, dist: 1},
      ];

    assert.deepStrictEqual(findPath(p1, p1, edges),
        {start: p1, end: p1, steps: [], dist: 0})
    assert.deepStrictEqual(findPath(p1, p2, edges),
        {start: p1, end: p2, steps: [edges[0]], dist: 1})
    assert.deepStrictEqual(findPath(p1, p3, edges),
        {start: p1, end: p3, steps: [edges[0], edges[3]], dist: 2})

    assert.deepStrictEqual(findPath(p2, p1, edges),
        {start: p2, end: p1, steps: [edges[2]], dist: 1})
    assert.deepStrictEqual(findPath(p2, p2, edges),
        {start: p2, end: p2, steps: [], dist: 0})
    assert.deepStrictEqual(findPath(p2, p3, edges),
        {start: p2, end: p3, steps: [edges[3]], dist: 1})

    assert.deepStrictEqual(findPath(p3, p1, edges),
        {start: p3, end: p1, steps: [edges[5], edges[2]], dist: 2})
    assert.deepStrictEqual(findPath(p3, p2, edges),
        {start: p3, end: p2, steps: [edges[5]], dist: 1})
    assert.deepStrictEqual(findPath(p3, p3, edges),
        {start: p3, end: p3, steps: [], dist: 0})

    const edges2 = [
        {start: p1, end: p2, dist: 1},
        {start: p1, end: p3, dist: 3},
        {start: p2, end: p1, dist: 1},
        {start: p3, end: p1, dist: 3},
      ];

    assert.deepStrictEqual(findPath(p1, p1, edges2),
        {start: p1, end: p1, steps: [], dist: 0})
    assert.deepStrictEqual(findPath(p1, p2, edges2),
        {start: p1, end: p2, steps: [edges2[0]], dist: 1})
    assert.deepStrictEqual(findPath(p1, p3, edges2),
        {start: p1, end: p3, steps: [edges2[1]], dist: 3})

    assert.deepStrictEqual(findPath(p2, p1, edges2),
        {start: p2, end: p1, steps: [edges2[2]], dist: 1})
    assert.deepStrictEqual(findPath(p2, p2, edges2),
        {start: p2, end: p2, steps: [], dist: 0})
    assert.deepStrictEqual(findPath(p2, p3, edges2),
        {start: p2, end: p3, steps: [edges2[2], edges[1]], dist: 4})

    assert.deepStrictEqual(findPath(p3, p1, edges2),
        {start: p3, end: p1, steps: [edges2[3]], dist: 3})
    assert.deepStrictEqual(findPath(p3, p2, edges2),
        {start: p3, end: p2, steps: [edges2[3], edges[0]], dist: 4})
    assert.deepStrictEqual(findPath(p3, p3, edges2),
        {start: p3, end: p3, steps: [], dist: 0})
  });

  it('CLR', function() {
    const edges = [
        {start: p5, end: p1, dist: 5},
        {start: p5, end: p2, dist: 10},

        {start: p1, end: p2, dist: 3},
        {start: p1, end: p3, dist: 2},
        {start: p1, end: p4, dist: 9},
        {start: p1, end: p5, dist: 5},

        {start: p2, end: p1, dist: 2},
        {start: p2, end: p4, dist: 1},

        {start: p3, end: p4, dist: 6},
        {start: p3, end: p5, dist: 7},

        {start: p4, end: p3, dist: 4},
      ];

    assert.deepStrictEqual(findPath(p5, p3, edges),
        {start: p5, end: p3, steps: [edges[0], edges[3]], dist: 7})
    assert.deepStrictEqual(findPath(p5, p4, edges),
        {start: p5, end: p4, steps: [edges[0], edges[2], edges[7]], dist: 9})
  });

});