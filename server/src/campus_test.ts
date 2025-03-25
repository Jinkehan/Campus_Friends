import * as assert from 'assert';
import { BUILDINGS, getBuildingByShortName, locationsOnPath } from './campus';


describe('campus', function() {

  it('getBuildingByShortName', function() {
    const n = BUILDINGS.length;
    assert.deepStrictEqual(
        getBuildingByShortName(BUILDINGS[0].shortName), BUILDINGS[0]);
    assert.deepStrictEqual(
        getBuildingByShortName(BUILDINGS[9].shortName), BUILDINGS[9]);
    assert.deepStrictEqual(
        getBuildingByShortName(BUILDINGS[n-1].shortName), BUILDINGS[n-1]);
  });

  it('getBuildingByShortName', function() {
    assert.deepStrictEqual(
        locationsOnPath([
            {start: {x: 0, y: 0}, end: {x: 1, y: 1}, dist: 1},
        ]), [ {x: 0, y: 0}, {x: 1, y: 1} ]);
    assert.deepStrictEqual(
        locationsOnPath([
            {start: {x: 0, y: 0}, end: {x: 1, y: 1}, dist: 1},
            {start: {x: 1, y: 1}, end: {x: 2, y: 2}, dist: 1}
        ]), [ {x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2} ]);
    assert.deepStrictEqual(
        locationsOnPath([
            {start: {x: 0, y: 0}, end: {x: 1, y: 1}, dist: 1},
            {start: {x: 1, y: 1}, end: {x: 2, y: 2}, dist: 1},
            {start: {x: 2, y: 2}, end: {x: 3, y: 3}, dist: 1},
        ]), [ {x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3} ]);
  });

});