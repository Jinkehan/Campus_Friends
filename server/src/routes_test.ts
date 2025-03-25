import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { BUILDINGS, parseEdges } from './campus';
import {
    clearDataForTesting, getBuildings, getFriends, getSchedule, getShortestPath,
    setFriends, setSchedule
  } from './routes';
import { readFileSync } from 'fs';


const content: string = readFileSync("data/campus_edges.csv", {encoding: 'utf-8'});
parseEdges(content.split("\n"));


describe('routes', function() {

  it('friends', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/friends', query: {}}); 
    const res1 = httpMocks.createResponse();
    getFriends(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        'required argument "user" was missing');

    // Request for friends not present already should return empty.
    const req2 = httpMocks.createRequest(
        {method: 'GET', url: '/api/friends', query: {user: "Kevin"}}); 
    const res2 = httpMocks.createResponse();
    getFriends(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData(), {friends: []});

    const req3 = httpMocks.createRequest(
        {method: 'POST', url: '/api/friends', body: {}}); 
    const res3 = httpMocks.createResponse();
    setFriends(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(),
            'missing or invalid "user" in POST body');

    const req4 = httpMocks.createRequest(
        {method: 'POST', url: '/api/friends', body: {user: "Kevin"}}); 
    const res4 = httpMocks.createResponse();
    setFriends(req4, res4);
    assert.deepStrictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(), 'missing "friends" in POST body');

    // Set the friends list to have multiple people on it.
    const req5 = httpMocks.createRequest(
        {method: 'POST', url: '/api/friends',
         body: {user: "Kevin", friends: ["James", "Zach", "Anjali"]}}); 
    const res5 = httpMocks.createResponse();
    setFriends(req5, res5);
    assert.deepStrictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getData(), {saved: true});

    // Get friends list again to make sure it was saved.
    const req6 = httpMocks.createRequest(
        {method: 'GET', url: '/api/friends', query: {user: "Kevin"}}); 
    const res6 = httpMocks.createResponse();
    getFriends(req6, res6);
    assert.deepStrictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData(),
        {friends: ["James", "Zach", "Anjali"]});

    clearDataForTesting();
  });

  it('schedule', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/schedule', query: {}}); 
    const res1 = httpMocks.createResponse();
    getSchedule(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        'required argument "user" was missing');

    // Request for schedule not present already should return empty.
    const req2 = httpMocks.createRequest(
        {method: 'GET', url: '/api/schedule', query: {user: "Kevin"}}); 
    const res2 = httpMocks.createResponse();
    getSchedule(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData(), {schedule: []});

    const req3 = httpMocks.createRequest(
        {method: 'POST', url: '/api/schedule', body: {}}); 
    const res3 = httpMocks.createResponse();
    setSchedule(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(),
            'missing or invalid "user" in POST body');

    const req4 = httpMocks.createRequest(
        {method: 'POST', url: '/api/schedule', body: {user: "Kevin"}}); 
    const res4 = httpMocks.createResponse();
    setSchedule(req4, res4);
    assert.deepStrictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(), 'missing "schedule" in POST body');

    // Set the schedule to have two people on it.
    const req5 = httpMocks.createRequest(
        {method: 'POST', url: '/api/schedule',
         body: {user: "Kevin", schedule: [
            {hour: "9:30", location: "MLR", desc: "GREEK 101"},
            {hour: "10:30", location: "CS2", desc: "CSE 989"},  // quantum ultra theory
            {hour: "11:30", location: "HUB", desc: "nom nom"},
          ]}}); 
    const res5 = httpMocks.createResponse();
    setSchedule(req5, res5);
    assert.deepStrictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getData(), {saved: true});

    // Get schedule again to make sure it was saved.
    const req6 = httpMocks.createRequest(
        {method: 'GET', url: '/api/schedule', query: {user: "Kevin"}}); 
    const res6 = httpMocks.createResponse();
    getSchedule(req6, res6);
    assert.deepStrictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData(),
        {schedule: [
            {hour: "9:30", location: "MLR", desc: "GREEK 101"},
            {hour: "10:30", location: "CS2", desc: "CSE 989"},
            {hour: "11:30", location: "HUB", desc: "nom nom"},
          ]});

    clearDataForTesting();
  });

  it('getBuildings', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/buildings', query: {}});
    const res1 = httpMocks.createResponse();
    getBuildings(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), {buildings: BUILDINGS});
  });

  it('getShortestPath', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {}}); 
    const res1 = httpMocks.createResponse();
    getShortestPath(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), 'required argument "user" was missing');

    const req2 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin"}}); 
    const res2 = httpMocks.createResponse();
    getShortestPath(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), 'required argument "hour" was missing');

    const req3 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin", hour: "9:30"}}); 
    const res3 = httpMocks.createResponse();
    getShortestPath(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), 'user has no saved schedule');

    const req4 = httpMocks.createRequest(
        {method: 'POST', url: '/api/schedule',
         body: {user: "Kevin", schedule: [
            {hour: "9:30", location: "MLR", desc: "GREEK 101"},
            {hour: "10:30", location: "CS2", desc: "CSE 989"},
            {hour: "11:30", location: "HUB", desc: "nom nom"},
          ]}}); 
    const res4 = httpMocks.createResponse();
    setSchedule(req4, res4);
    assert.deepStrictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData(), {saved: true});

    const req5 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin", hour: "8:30"}}); 
    const res5 = httpMocks.createResponse();
    getShortestPath(req5, res5);
    assert.deepStrictEqual(res5._getStatusCode(), 400);
    assert.deepStrictEqual(res5._getData(), 'user has no event starting at this hour');

    const req6 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin", hour: "9:30"}}); 
    const res6 = httpMocks.createResponse();
    getShortestPath(req6, res6);
    assert.deepStrictEqual(res6._getStatusCode(), 400);
    assert.deepStrictEqual(res6._getData(),
        'user is not walking between classes at this hour');

    const req7 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin", hour: "10:30"}}); 
    const res7 = httpMocks.createResponse();
    getShortestPath(req7, res7);
    assert.deepStrictEqual(res7._getStatusCode(), 200);
    assert.deepStrictEqual(res7._getData().found, true);
    assert.deepStrictEqual(res7._getData().path.length > 0, true);
    assert.deepStrictEqual(res7._getData().nearby, []);

    // TODO: improve this test to include "nearby" results in Task 5

    // Add the friend James
    const req8 = httpMocks.createRequest(
        {method: 'POST', url: '/api/schedule',
         body: {user: "James", schedule: [
            {hour: "9:30", location: "MLR", desc: "GREEK 101"},
            {hour: "10:30", location: "KNE", desc: "nom"},
            {hour: "11:30", location: "HUB", desc: "nom nom"},
          ]}}); 
    const res8 = httpMocks.createResponse();
    setSchedule(req8, res8);
    assert.deepStrictEqual(res8._getStatusCode(), 200);
    assert.deepStrictEqual(res8._getData(), {saved: true});
    const req9 = httpMocks.createRequest(
        {method: 'POST', url: '/api/friends',
         body: {user: "James", friends: ["Kevin"]}}); 
    const res9 = httpMocks.createResponse();
    setFriends(req9, res9);
    assert.deepStrictEqual(res9._getStatusCode(), 200);
    assert.deepStrictEqual(res9._getData(), {saved: true});
    const req10 = httpMocks.createRequest(
        {method: 'POST', url: '/api/friends',
         body: {user: "Kevin", friends: ["James"]}}); 
    const res10 = httpMocks.createResponse();
    setFriends(req10, res10);
    assert.deepStrictEqual(res10._getStatusCode(), 200);
    assert.deepStrictEqual(res10._getData(), {saved: true});

    // Closest point should be building MLR at location {x: 2184.7074, y: 1045.0386} with dist 0
    const req11 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "Kevin", hour: "10:30"}}); 
    const res11 = httpMocks.createResponse();
    getShortestPath(req11, res11);
    assert.deepStrictEqual(res11._getStatusCode(), 200);
    assert.deepStrictEqual(res11._getData().found, true);
    assert.deepStrictEqual(res11._getData().path.length > 0, true);
    assert.deepStrictEqual(res11._getData().nearby, [{friend: 'James', dist: 0, loc: {x:2184.7074, y:1045.0386}}]);
    // Closest point should be building HUB at location {x: 2269.7856, y: 1364.3777} with dist 0
    const req12 = httpMocks.createRequest(
        {method: 'GET', url: '/api/shortestPath', query: {user: "James", hour: "11:30"}}); 
    const res12 = httpMocks.createResponse();
    getShortestPath(req12, res12);
    assert.deepStrictEqual(res12._getStatusCode(), 200);
    assert.deepStrictEqual(res12._getData().found, true);
    assert.deepStrictEqual(res12._getData().path.length > 0, true);
    assert.deepStrictEqual(res12._getData().nearby, [{friend: 'Kevin', dist: 0, loc: {x: 2269.7856, y: 1364.3777}}]);
});

  
});
