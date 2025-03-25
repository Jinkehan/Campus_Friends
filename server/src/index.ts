import express, { Express } from "express";
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import { parseEdges } from "./campus";
import {
    getFriends, setFriends, getSchedule, setSchedule, getShortestPath,
    getBuildings
  } from './routes';


// Parse the information about the walkways on campus.
const content: string = readFileSync("data/campus_edges.csv", {encoding: 'utf-8'});
parseEdges(content.split("\n"));


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.get("/api/buildings", getBuildings);
app.get("/api/friends", getFriends);
app.post("/api/friends", setFriends);
app.get("/api/schedule", getSchedule);
app.post("/api/schedule", setSchedule);
app.get("/api/shortestPath", getShortestPath);
app.listen(port, () => console.log(`Server listening on ${port}`));
