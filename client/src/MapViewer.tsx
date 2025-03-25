import React, { ChangeEvent, Component, MouseEvent } from 'react';
import campusMap from './img/campus_map.jpg';
import { Hour, indexAtHour, parseHour, parseSchedule, Schedule } from './schedule';
import { Building, Edge, getBuildingByShortName, parseEdges } from './buildings';
import { isRecord } from './record';
import { Nearby, parseNearbyList } from './nearby';


// Radius of the circles drawn for each start/end and friends.
const RADIUS: number = 30;


type MapProps = {
  user: string;                 // name of the current user
  buildings: Array<Building>;   // list of all known buildings
  onBack: () => void;           // called to go back to the menu
};

type MapState = {
  schedule?: Schedule;
  hour?: Hour;
  path?: Array<Edge>;

  nearby?: Array<Nearby>;
};


/** Displays a map and paths the user walks in their schedule. */
export class MapViewer extends Component<MapProps, MapState> {
  constructor(props: MapProps) {
    super(props);

    this.state = {};
  }

  componentDidMount = (): void => {
    fetch('/api/schedule?user=' + encodeURIComponent(this.props.user))
      .then(this.doScheduleResp)
      .catch(this.doScheduleError);
  }

  /**
   * Returns the start and end buildings for the path at the given start time.
   * @param hour 
   * @requires hour is the start time of an event after the first in schedule
   */
  getEndpointsAt = (hour: Hour): [Building, Building] => {
    if (!this.state.schedule)
      throw new Error('impossible');

    const index = indexAtHour(this.state.schedule, hour);
    if (index < 0)
      throw new Error("impossible: no event at this hour")
    if (index === 0)
      throw new Error("impossible: chose hour of first event")

    return [
        getBuildingByShortName(
            this.props.buildings, this.state.schedule[index-1].location),
        getBuildingByShortName(
            this.props.buildings, this.state.schedule[index].location)
      ];
  };

  render = (): JSX.Element => {
    if (!this.state.schedule) {
      return <div className="content">
          <p>Loading schedule...</p>
        </div>;

    } else if (this.state.schedule.length <= 1) {
      return <div className="content">
          <p>You have not set a schedule (or it does not have any walks between classes).</p>
          <p><button onClick={this.doBackClick}>Back</button></p>
        </div>;

    } else if (this.state.hour === undefined) {
      return <div>
          <svg id="svg" width="866" height="593" viewBox="0 0 4330 2964">
            <image href={campusMap} width="4330" height="2964"/>
          </svg>
          <div className="legend">
            <p>Show path at {this.renderPathTimes()}</p>
          </div>
          <p><button onClick={this.doBackClick}>Back</button></p>
        </div>;
    } else if (this.state.path === undefined) {
      return <div>
          <svg id="svg" width="866" height="593" viewBox="0 0 4330 2964">
            <image href={campusMap} width="4330" height="2964"/>
          </svg>
          <div className="legend">
            <p>Finding shortest path...</p>
          </div>
        </div>;
    } else {
      return <div>
          <svg id="svg" width="866" height="593" viewBox="0 0 4330 2964">
            <image href={campusMap} width="4330" height="2964"/>
            {this.renderPath()}
            {this.renderEndPoints()}
          </svg>
          <div className="legend">
            <p>Show path at {this.renderPathTimes()}</p>
            {this.renderLegendItems()}
          </div>
          <p><button onClick={this.doBackClick}>Back</button></p>
        </div>;
    }
  };

  renderPathTimes = (): JSX.Element => {
    if (this.state.schedule === undefined)
      throw new Error('impossible');

    const hours: Array<JSX.Element> = [];
    if (this.state.hour === undefined)
      hours.push(<option value="" key="">Choose</option>);
    for (const event of this.state.schedule) {
      const hour = event.hour;
      if (hour !== this.state.schedule[0].hour) {
        hours.push(<option value={hour} key={hour}>{hour}</option>)
      }
    }

    return <select value={this.state.hour || ''}
          onChange={this.doHourChange}>
        {hours}
      </select>
  };

  /** Returns SVG elements for the two end points. */
  renderEndPoints = (): Array<JSX.Element> => {
    if (this.state.hour === undefined)
      throw new Error('impossible: no hour');

    const [start, end] = this.getEndpointsAt(this.state.hour);
    const elems: Array<JSX.Element> = [
        <circle cx={start.location.x} cy={start.location.y} fill={'red'} r={RADIUS}
            stroke={'white'} strokeWidth={10} key={'start'}/>,
        <circle cx={end.location.x} cy={end.location.y} fill={'blue'} r={RADIUS}
            stroke={'white'} strokeWidth={10} key={'end'}/>
      ];

    // TODO: add circles for each nearby friend in Task 6
    const nb = this.state.nearby;
    if (nb) {
      for (const [i, n] of nb.entries()) {
        const color = FRIEND_COLORS[i%6];
        const loc = n.loc;
        const name = n.friend
        elems.push(<circle cx={loc.x} cy={loc.y} fill={color} r={15}
            stroke={'black'} strokeWidth={5} key={name}/>)
      }
    }

    return elems;
  };

  /** Returns SVG elements for the edges on the path. */
  renderPath = (): Array<JSX.Element> => {
    if (this.state.path === undefined)
      throw new Error('impossible: no path');

    const elems: Array<JSX.Element> = [];
    for (const [idx, e] of this.state.path.entries()) {
      elems.push(<line x1={e.start.x} y1={e.start.y} key={idx}
          x2={e.end.x} y2={e.end.y} stroke={'green'} strokeWidth={10}/>)
    }
    return elems;
  };

  renderLegendItems = (): Array<JSX.Element> => {
    if (this.state.hour === undefined)
      throw new Error('impossible: no hour');

    const [start, end] = this.getEndpointsAt(this.state.hour);

    const items: Array<JSX.Element> = [];
    items.push(makeLegendItem('red', `Start at ${start.shortName}`, 'start'));
    items.push(makeLegendItem('blue', `End at ${end.shortName}`, 'end'));

    // TODO: add a legend item for each nearby friend in Task 6
    const nb = this.state.nearby;
    if (nb) {
      for (const [i, n] of nb.entries()) {
        const color = FRIEND_COLORS[i%6];
        const name = n.friend;
        items.push(makeLegendItem(color, name, name));
      }
    }
    return items;
  };

  doScheduleResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text()
         .then((msg: string) => this.doScheduleError(`bad status code ${res.status}: ${msg}`))
         .catch(() => this.doScheduleError("Failed to parse error response message"));
    } else {
      res.json()
        .then(this.doScheduleJson)
        .catch(() => this.doScheduleError("Failed to parse response data as JSON"))
    }
  }

  doScheduleJson = (data: unknown): void => {
    if (!isRecord(data) || data.schedule === undefined) {
      this.doScheduleError("response is not in expected form");
      return;
    }

    const schedule = parseSchedule(data.schedule);
    this.setState({schedule});
  }

  doScheduleError = (msg: string): void => {
    console.error("error while fetching '/api/schedule', ", msg);
  }

  doHourChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
    const hour = parseHour(evt.target.value);
    this.setState({hour});

    fetch('/api/shortestPath' +
        '?user=' + encodeURIComponent(this.props.user) +
        '&hour=' + encodeURIComponent(hour))
      .then(this.doShortestPathResp)
      .catch(this.doShortestPathError);
  };

  doShortestPathResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text()
        .then((msg) => this.doShortestPathError(`bad status code ${res.status}: ${msg}`))
        .catch(() => this.doShortestPathError("Failed to parse error response message"));
    } else {
      res.json()
        .then(this.doShortestPathJson)
        .catch(() => this.doShortestPathError("Failed to parse response data as JSON"));
    }
  }

  doShortestPathJson = (data: unknown): void => {
    if (!isRecord(data) || typeof data.found !== "boolean") {
      this.doShortestPathError("response is not in expected form");
      return;
    }

    if (data.found)
      // TODO: parse & record the nearby points in the state in Task 6
      this.setState({
        path: parseEdges(data.path), nearby: parseNearbyList(data.nearby),
      });
  }

  doShortestPathError = (msg: string): void => {
    console.error("error while fetching '/api/shortestPath', ", msg);
  }

  doBackClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBack();
  };

}


/**
 * Returns HTML for an item on the legend with the given color and description.
 * @param color Color of the item on the map
 * @param desc Description of the item on the map.
 * @param key Unique ID for this legend item
 */
const makeLegendItem = (color: string, desc: string, key: string): JSX.Element => {
 return <div key={key} className="legend-item">
      <div className={"legend-color"} style={{backgroundColor: color}}>&nbsp;</div>
      {' ' + desc}
    </div>;
};


/** List of colors to use for nearby friends. */
// TODO: uncomment this in Task 6
const FRIEND_COLORS: Array<string> = [
    "#F0BC68", "#C4D7D1", "#F5D1C3", "#FFB6A3", "#B8C6D9", "#8596A6",
  ];