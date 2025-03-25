import React, { ChangeEvent, Component, MouseEvent } from 'react';
import { Building, parseBuildings } from './buildings';
import { USERS } from './users';
import './App.css';
import { FriendsEditor } from './FriendsEditor';
import { ScheduleEditor } from './ScheduleEditor';
import { MapViewer } from './MapViewer';
import { isRecord } from './record';


type AppProps = {};  // no props

type AppState = {
  buildings?: Array<Building>;                    // list of all buildings
  user?: string;                                  // name of this user
  show: "menu" | "friends" | "schedule" | "map";  // what is displayed
};


/** Top-level component that performs login and navigation. */
export class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {show: "menu"};
  }

  componentDidMount = (): void => {
    fetch('/api/buildings')
      .then(this.doBuildingsResp)
      .catch(this.doBuildingsError);;
  }

  render = (): JSX.Element => {
    if (!this.state.buildings) {
      return <p>Loading...</p>;
    } else if (this.state.user === undefined) {
      return this.renderLogin();
    } else if (this.state.show === "friends") {
      return <FriendsEditor user={this.state.user} onBack={this.doBackClick}/>;
    } else if (this.state.show === "schedule") {
      const buildings = this.state.buildings.map(b => b.shortName);
      return <ScheduleEditor user={this.state.user} buildings={buildings}
          onBack={this.doBackClick}/>;
    } else if (this.state.show === "map") {
      return <MapViewer user={this.state.user} buildings={this.state.buildings}
          onBack={this.doBackClick}/>;
    } else {
      return this.renderMenu();
    }
  };

  renderLogin = (): JSX.Element => {
    const users: Array<JSX.Element> = [];
    users.push(<option value="" key="NA">Choose</option>)
    for (const user of USERS) {
      users.push(<option value={user} key={user}>{user}</option>)
    }

    return <div className="content">
        <label htmlFor="user">Who are you?</label>{' '}
        <select id="user" onChange={this.doUserChange}>{users}</select>
      </div>;
  }

  renderMenu = (): JSX.Element => {
    return <div className="content">
        <p>Choose one of these options:</p>
        <ul>
          <li>Update <a href="#" onClick={this.doFriendsClick}>friends</a></li>
          <li>Update <a href="#" onClick={this.doScheduleClick}>schedule</a></li>
          <li>View <a href="#" onClick={this.doMapClick}>map</a></li>
        </ul>
      </div>;
  }

  doBuildingsResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text()
         .then((msg: string) => this.doBuildingsError(`bad status code ${res.status}: ${msg}`))
         .catch(() => this.doBuildingsError("Failed to parse error response message"));
    } else {
      res.json()
        .then(this.doBuildingsJson)
        .catch(() => this.doBuildingsError("Failed to parse response data as JSON"))
    }
  }

  doBuildingsJson = (data: unknown): void => {
    if (!isRecord(data) || data.buildings === undefined) {
      this.doBuildingsError("response is not in expected form");
      return;
    }

    const buildings = parseBuildings(data.buildings);
    this.setState({buildings});
  }

  doBuildingsError = (msg: string): void => {
    console.error("error while fetching '/api/buildings', ", msg);
  }

  doUserChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
    if (evt.target.value)
      this.setState({user: evt.target.value});
  }

  doFriendsClick = (evt: MouseEvent<HTMLAnchorElement>): void => {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({show: "friends"});
  }

  doScheduleClick = (evt: MouseEvent<HTMLAnchorElement>): void => {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({show: "schedule"});
  }

  doMapClick = (evt: MouseEvent<HTMLAnchorElement>): void => {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({show: "map"});
  }

  doBackClick = (): void => {
    this.setState({show: "menu"});
  }
}