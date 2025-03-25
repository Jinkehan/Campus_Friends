import * as assert from 'assert';
import {
    buildTree, findLocationsInRegion, findClosestInTree, NO_INFO,
    closestInTree,
    LocationTree
  } from './location_tree';
import { Region } from './locations';


describe('location_tree', function() {

  it('buildTree', function() {
    assert.deepStrictEqual(buildTree([]), {kind: "empty"});

    assert.deepStrictEqual(buildTree([{x: 1, y: 1}]),
        {kind: "single", loc: {x: 1, y: 1}});
    assert.deepStrictEqual(buildTree([{x: 2, y: 2}]),
        {kind: "single", loc: {x: 2, y: 2}});

    assert.deepStrictEqual(buildTree([{x: 1, y: 1}, {x: 3, y: 3}]),
        {kind: "split", at: {x: 2, y: 2},
         nw: {kind: "single", loc: {x: 1, y: 1}},
         ne: {kind: "empty"},
         sw: {kind: "empty"},
         se: {kind: "single", loc: {x: 3, y: 3}}});
    assert.deepStrictEqual(buildTree([{x: 1, y: 3}, {x: 3, y: 1}]),
        {kind: "split", at: {x: 2, y: 2},
         nw: {kind: "empty"},
         ne: {kind: "single", loc: {x: 3, y: 1}},
         sw: {kind: "single", loc: {x: 1, y: 3}},
         se: {kind: "empty"}});

    assert.deepStrictEqual(buildTree(
        [{x: 1, y: 1}, {x: 3, y: 3}, {x: 5, y: 5}, {x: 7, y: 7}]),
        {kind: "split", at: {x: 4, y: 4},
         nw: {kind: "split", at: {x: 2, y: 2},
              nw: {kind: "single", loc: {x: 1, y: 1}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 3, y: 3}}},
         ne: {kind: "empty"},
         sw: {kind: "empty"},
         se: {kind: "split", at: {x: 6, y: 6},
              nw: {kind: "single", loc: {x: 5, y: 5}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 7, y: 7}}}});
    assert.deepStrictEqual(buildTree(
        [{x: 1, y: 1}, {x: 3, y: 3}, {x: 5, y: 3}, {x: 7, y: 1},
         {x: 1, y: 7}, {x: 3, y: 5}, {x: 5, y: 5}, {x: 7, y: 7}]),
        {kind: "split", at: {x: 4, y: 4},
         nw: {kind: "split", at: {x: 2, y: 2},
              nw: {kind: "single", loc: {x: 1, y: 1}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 3, y: 3}}},
         ne: {kind: "split", at: {x: 6, y: 2},
              nw: {kind: "empty"},
              sw: {kind: "single", loc: {x: 5, y: 3}},
              ne: {kind: "single", loc: {x: 7, y: 1}},
              se: {kind: "empty"}},
         sw: {kind: "split", at: {x: 2, y: 6},
              nw: {kind: "empty"},
              ne: {kind: "single", loc: {x: 3, y: 5}},
              sw: {kind: "single", loc: {x: 1, y: 7}},
              se: {kind: "empty"}},
         se: {kind: "split", at: {x: 6, y: 6},
              nw: {kind: "single", loc: {x: 5, y: 5}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 7, y: 7}}}});
  });

  it('findLocationsInRegion', function() {
    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([]),
        {x1: 1, x2: 2, y1: 1, y2: 2}),
      []);

    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([{x: 0, y: 0}]),
        {x1: 1, x2: 3, y1: 1, y2: 3}),
      []);
    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([{x: 2, y: 2}]),
        {x1: 1, x2: 3, y1: 1, y2: 3}),
      [{x: 2, y: 2}]);

    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([{x: 0, y: 0}, {x: 2, y: 2}]),
        {x1: 1, x2: 3, y1: 1, y2: 3}),
      [{x: 2, y: 2}]);
    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3},
                   {x: 4, y: 4}]),
        {x1: 1, x2: 3, y1: 1, y2: 3}),
      [{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}]);
    assert.deepStrictEqual(findLocationsInRegion(
        buildTree([{x: 0, y: 4}, {x: 1, y: 3}, {x: 2, y: 2}, {x: 3, y: 4},
                   {x: 4, y: 0}]),
        {x1: 1, x2: 3, y1: 1, y2: 3}),
      [{x: 2, y: 2}, {x: 1, y: 3}]);
  });

  it('closestInTree', function() {
    const t: LocationTree = {kind: "split", at: {x:0, y:0}, 
      nw: {kind:"single", loc: {x:-1, y:1}},
      ne: {kind:"single", loc: {x:2, y:2}},
      sw: {kind:"single", loc: {x:-2, y:-2}},
      se: {kind:"single", loc: {x:1, y:-1}},
    };
    const b: Region = {x1:-2, x2:2, y1:-2, y2:2};
    // Branch coverage (this covers statement coverage for my closestInTree)
    // Branch 1 (first if)
    assert.deepStrictEqual(closestInTree(t, {x:3,y:0}, b, {loc:{x:3,y:0}, dist:0, calcs:0}), {loc:{x:3,y:0}, dist:0, calcs:0});
    // Branch 2 (second if)
    assert.deepStrictEqual(closestInTree({kind:"empty"}, {x:3,y:0}, b, {loc:{x:3,y:0}, dist:0, calcs:0}), {loc:{x:3,y:0}, dist:0, calcs:0});
    // Branch 3-1 (third if, then first if)
    assert.deepStrictEqual(closestInTree({kind:"single", loc:{x:1,y:0}}, {x:3,y:0}, b, NO_INFO), {loc:{x:1,y:0}, dist:2, calcs:1});
    // Branch 3-2 (third if, then else)
    assert.deepStrictEqual(closestInTree({kind:"single", loc:{x:1,y:0}}, {x:3,y:0}, b, {loc:{x:3,y:0}, dist:0, calcs:0}), {loc:{x:3,y:0}, dist:0, calcs:0});
    // Branch 4-1-1 (4th if, then if, then if)
    assert.deepStrictEqual(closestInTree(t, {x:2,y:3}, b, NO_INFO), {loc:{x:2,y:2}, dist:1, calcs:1});
    // Branch 4-1-2 (4th if, then if, then else)
    assert.deepStrictEqual(closestInTree(t, {x:2,y:1}, b, NO_INFO), {loc:{x:2,y:2}, dist:1, calcs:1});
    // Branch 4-2-1
    assert.deepStrictEqual(closestInTree(t, {x:2,y:-1}, b, NO_INFO), {loc:{x:1,y:-1}, dist:1, calcs:1});
    // Branch 4-2-2
    assert.deepStrictEqual(closestInTree(t, {x:1,y:-3}, b, NO_INFO), {loc:{x:1,y:-1}, dist:2, calcs:1});
    // Branch 5-1-1 (last else, then if, then if)
    assert.deepStrictEqual(closestInTree(t, {x:-1,y:2}, b, NO_INFO), {loc:{x:-1,y:1}, dist:1, calcs:1});
    // Branch 5-1-2
    assert.deepStrictEqual(closestInTree(t, {x:-2,y:1}, b, NO_INFO), {loc:{x:-1,y:1}, dist:1, calcs:1});
    // Branch 5-2-1
    assert.deepStrictEqual(closestInTree(t, {x:-1,y:0}, b, NO_INFO), {loc:{x:-1,y:1}, dist:1, calcs:2});
    // Branch 5-2-2
    assert.deepStrictEqual(closestInTree(t, {x:0,y:-1}, b, NO_INFO), {loc:{x:1,y:-1}, dist:1, calcs:2});
    // The above tests covers all branch and statements
    // Loop coverage, 0 case: covered above by branch 1, 2, ...
    // Loop coverage, 1 case: covered above by branch 4-1-1, 4-1-2, ...
    // Loop coverage, many case: covered above by branch 5-2-1, 5-2-2



  });

  it('findClosestInTree', function() {
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 2, y: 1}]),
        [{x: 1, y: 1}]),
      [{x: 2, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 3, y: 1}, {x: 2, y: 1}, {x: 1, y: 3}]),
        [{x: 1, y: 1}]),
      [{x: 2, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}]),
      [{x: 1, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}, {x: 4.9, y: 4.9}]),
      [{x: 5, y: 5}, Math.sqrt((5-4.9)**2+(5-4.9)**2)]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}, {x: -1, y: -1}]),
      [{x: 1, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 4, y: 1}, {x: -1, y: -1}, {x: 10, y: 10}]),
      [{x: 5, y: 1}, 1]);
  });

});
