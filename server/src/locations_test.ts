import * as assert from 'assert';
import {
    Location, centroid, distance, isInRegion, locationsInRegion,
    overlap, sameLocation, sortedLocations, squaredDistance, distanceMoreThan
  } from './locations';


describe('locations', function() {

  it('sameLocations', function() {
    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 0, y: 0}), true);
    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 0, y: 1}), true);
    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 1, y: 0}), true);
    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 1, y: 1}), true);

    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 0, y: 1}), false);
    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 1, y: 0}), false);
    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 1, y: 1}), false);

    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 0, y: 0}), false);
    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 1, y: 0}), false);
    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 1, y: 1}), false);

    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 0, y: 0}), false);
    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 0, y: 1}), false);
    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 1, y: 1}), false);

    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 0, y: 0}), false);
    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 0, y: 1}), false);
    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 1, y: 0}), false);
  });

  it('squaredDistance', function() {
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 1, y: 1}), 2);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 0, y: 1}), 1);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 1, y: 0}), 1);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 2, y: 0}), 4);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 0, y: 2}), 4);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 2, y: 2}), 8);
  });

  it('distance', function() {
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 1, y: 1}) - Math.sqrt(2)) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 0, y: 1}) - 1) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 1, y: 0}) - 1) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 2, y: 0}) - 2) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 0, y: 2}) - 2) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 2, y: 2}) - Math.sqrt(8)) < 1e-3);
  });

  it('sortedLocations', function() {
    const A1: Array<Location> = [
        {x: 0, y: 1},
        {x: 1, y: 0},
        {x: 2, y: 2},
      ];
    const B1: Array<Location> = [
        {x: 1, y: 0},
        {x: 0, y: 1},
        {x: 2, y: 2},
      ];

    const A2: Array<Location> = [
        {x: 1, y: 0},
        {x: 2, y: 2},
        {x: 0, y: 1},
      ];
    assert.deepStrictEqual(sortedLocations(A2, 'x'), A1);
    assert.deepStrictEqual(sortedLocations(A2, 'y'), B1);

    const B2: Array<Location> = [
        {x: 0, y: 1},
        {x: 1, y: 0},
        {x: 2, y: 2},
      ];
    assert.deepStrictEqual(sortedLocations(B2, 'x'), A1);
    assert.deepStrictEqual(sortedLocations(B2, 'y'), B1);
  });

  it('centroid', function() {
    assert.deepStrictEqual(centroid([{x: 0, y: 1}]), {x: 0, y: 1});
    assert.deepStrictEqual(centroid([{x: 1, y: 2}]), {x: 1, y: 2});

    assert.deepStrictEqual(centroid([{x: 0, y: 0}, {x: 1, y: 2}]), {x: 0.5, y: 1});
    assert.deepStrictEqual(centroid([{x: 0, y: 0}, {x: 1, y: 2}]), {x: 0.5, y: 1});
    assert.deepStrictEqual(centroid([{x: 0, y: 1}, {x: 1, y: 2}]), {x: 0.5, y: 1.5});
    assert.deepStrictEqual(
        centroid([{x: 0, y: 1}, {x: 1, y: 2}, {x: 2, y: 3}]), {x: 1, y: 2});
  });

  it('isInRegion', function() {
    assert.strictEqual(
        isInRegion({x: 0, y: 1}, {x1: 1, x2: 3, y1: 1, y2: 3}), false);
    assert.strictEqual(
        isInRegion({x: 1, y: 0}, {x1: 1, x2: 3, y1: 1, y2: 3}), false);
    assert.strictEqual(
        isInRegion({x: 1, y: 1}, {x1: 1, x2: 3, y1: 1, y2: 3}), true);
    assert.strictEqual(
        isInRegion({x: 4, y: 2}, {x1: 1, x2: 3, y1: 1, y2: 3}), false);
    assert.strictEqual(
        isInRegion({x: 2, y: 4}, {x1: 1, x2: 3, y1: 1, y2: 3}), false);
    assert.strictEqual(
        isInRegion({x: 3, y: 3}, {x1: 1, x2: 3, y1: 1, y2: 3}), true);
    assert.strictEqual(
        isInRegion({x: 3, y: 4}, {x1: 1, x2: 3, y1: 1, y2: 3}), false);
    assert.strictEqual(
        isInRegion({x: 4, y: 3}, {x1: 1, x2: 3, y1: 1, y2: 3}), false);
    assert.strictEqual(
        isInRegion({x: 3, y: 3}, {x1: 2, x2: 4, y1: 2, y2: 4}), true);
  });

  it('overlap', function() {
    assert.strictEqual(overlap(
        {x1: 0, x2: 2, y1: 0, y2: 2}, {x1: 3, x2: 5, y1: 3, y2: 5}), false);
    assert.strictEqual(overlap(
        {x1: 3, x2: 5, y1: 3, y2: 5}, {x1: 0, x2: 2, y1: 0, y2: 2}), false);

    assert.strictEqual(overlap(
        {x1: 0, x2: 2, y1: 0, y2: 2}, {x1: 3, x2: 5, y1: 1, y2: 3}), false);
    assert.strictEqual(overlap(
        {x1: 3, x2: 5, y1: 1, y2: 3}, {x1: 0, x2: 2, y1: 0, y2: 2}), false);
    assert.strictEqual(overlap(
        {x1: 2, x2: 4, y1: 0, y2: 2}, {x1: 3, x2: 5, y1: 1, y2: 3}), true);
    assert.strictEqual(overlap(
        {x1: 3, x2: 5, y1: 1, y2: 3}, {x1: 2, x2: 4, y1: 0, y2: 2}), true);

    assert.strictEqual(overlap(
        {x1: 0, x2: 2, y1: 0, y2: 2}, {x1: 1, x2: 3, y1: 3, y2: 5}), false);
    assert.strictEqual(overlap(
        {x1: 1, x2: 3, y1: 3, y2: 5}, {x1: 0, x2: 2, y1: 0, y2: 2}), false);
    assert.strictEqual(overlap(
        {x1: 0, x2: 2, y1: 2, y2: 4}, {x1: 1, x2: 3, y1: 3, y2: 5}), true);
    assert.strictEqual(overlap(
        {x1: 1, x2: 3, y1: 3, y2: 5}, {x1: 0, x2: 2, y1: 2, y2: 4}), true);
  });

  it('distanceMoreThan', function() {
    const R = {x1: -1, x2: 1, y1: -1, y2: 1};
    // within the region
    assert.strictEqual(distanceMoreThan({x: 0, y: 0}, R, 1), false);
    // e side
    assert.strictEqual(distanceMoreThan({x: 2, y: 0}, R, 0.5), true);
    assert.strictEqual(distanceMoreThan({x: 2, y: 0}, R, 1), false);
    // Both statement and branch coverage are covered by the first two tests alone, and there is no recursion
    // w side
    assert.strictEqual(distanceMoreThan({x: -2, y: 0}, R, 0.5), true);
    assert.strictEqual(distanceMoreThan({x: -2, y: 0}, R, 2), false);
    // s side
    assert.strictEqual(distanceMoreThan({x: 0, y: -2}, R, 0.5), true);
    assert.strictEqual(distanceMoreThan({x: 0, y: -2}, R, 2), false);
    // n side
    assert.strictEqual(distanceMoreThan({x: 0, y: 2}, R, 0.5), true);
    assert.strictEqual(distanceMoreThan({x: 0, y: 2}, R, 2), false);
    // ne corner
    assert.strictEqual(distanceMoreThan({x: 2, y: 2}, R, 1), true);
    assert.strictEqual(distanceMoreThan({x: 2, y: 2}, R, Math.sqrt(2)), false);
    // nw corner
    assert.strictEqual(distanceMoreThan({x: -2, y: 2}, R, 1), true);
    assert.strictEqual(distanceMoreThan({x: -2, y: 2}, R, 3), false);
    // se corner
    assert.strictEqual(distanceMoreThan({x: 2, y: -2}, R, 1), true);
    assert.strictEqual(distanceMoreThan({x: 2, y: -2}, R, 3), false);
    // sw corner
    assert.strictEqual(distanceMoreThan({x: -2, y: -2}, R, 1), true);
    assert.strictEqual(distanceMoreThan({x: -2, y: -2}, R, 3), false);
  });

  it('locationsInRegion', function() {
    const R = {x1: 1, x2: 3, y1: 1, y2: 2};

    assert.deepStrictEqual(locationsInRegion([], R), []);

    assert.deepStrictEqual(locationsInRegion([{x: 2, y: 1}], R), [{x: 2, y: 1}]);
    assert.deepStrictEqual(locationsInRegion([{x: 0, y: 1}], R), []);

    assert.deepStrictEqual(
        locationsInRegion([{x: 0, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}], R),
        [{x: 2, y: 1}, {x: 2, y: 2}]);
    assert.deepStrictEqual(
        locationsInRegion([{x: 0, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}], R),
        [{x: 2, y: 1}, {x: 2, y: 2}]);

    const R2 = {x1: 0, x2: 1, y1: 1, y2: 2};
    assert.deepStrictEqual(
        locationsInRegion([{x: 0, y: 1}, {x: 2, y: 1}], R2), [{x: 0, y: 1}]);
  });

});
