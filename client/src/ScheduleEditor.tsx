import React, { ChangeEvent, Component, MouseEvent} from 'react';
import {
    EventStart, Hour, HOURS, hoursAfter, jsonifySchedule, parseHour,
    parseSchedule, Schedule
  } from './schedule';
import { isRecord } from './record';


type ScheduleProps = {
  user: string;               // name of the current user
  buildings: Array<string>;   // list of known buildings
  onBack: () => void;         // called to go back to the menu
};

type ScheduleState = {
  schedule?: Schedule;  // schedule
  saved?: boolean;      // show a saved message

  hour: Hour;         // information for next event
  location: string;
  name: string;
};


/** Component for displaying and editing the user's schedule. */
export class ScheduleEditor extends Component<ScheduleProps, ScheduleState> {
  constructor(props: ScheduleProps) {
    super(props);

    this.state = {hour: "8:30", location: this.props.buildings[0], name: ""};
  }

  componentDidMount = (): void => {
    fetch('/api/schedule?user=' + encodeURIComponent(this.props.user))
      .then(this.doGetScheduleResponse)
      .catch(this.doGetScheduleError);
  }

  render = (): JSX.Element => {
    if (!this.state.schedule) {
      return <p>Loading schedule...</p>;
    } else {
      return this.renderSchedule();
    }
  };

  renderSchedule = (): JSX.Element => {
    if (this.state.schedule === undefined)
      throw new Error('impossible');

    return <div className="content">
        <p>List each building and the time you move there:</p>     
        {this.renderEvents()}
        {this.renderNextEvent()}
        <p><button onClick={this.doSaveClick}>Save</button>{' '}
          <button onClick={this.doBackClick}>Back</button></p>
          {this.renderSaved()}
      </div>
  };

  renderEvents = (): JSX.Element => {
    if (this.state.schedule === undefined)
      throw new Error('impossible');
    if (this.state.schedule.length === 0)
      return <div></div>;

    const events: Array<JSX.Element> = [];
    for (const event of this.state.schedule) {
      const desc = event.desc ? event.desc : "unknown class";
      if (event === this.state.schedule[this.state.schedule.length-1]) {
        events.push(<li key={event.hour}>
            <b>{event.hour}</b>: {desc} in {event.location}{' '}
            (<a href="#" onClick={this.doRemoveClick}>remove</a>)
          </li>);
      } else {
        events.push(<li key={event.hour}><b>{event.hour}</b>: {desc} in {event.location}</li>);
      }
    }

    return <ul>{events}</ul>;
  };

  renderNextEvent = (): JSX.Element => {
    if (this.state.schedule === undefined)
      throw new Error('impossible');

    const locations: Array<JSX.Element> = [];
    for (const loc of this.props.buildings) {
      locations.push(<option key={loc} value={loc}>{loc}</option>);
    }

    const first = (this.state.schedule.length === 0);
    const allowedHours = first ? HOURS :
        hoursAfter(this.state.schedule[this.state.schedule.length-1].hour);

    const hours: Array<JSX.Element> = [];
    for (const hour of allowedHours) {
      hours.push(<option key={hour} value={hour}>{hour}</option>);
    }
    if (hours.length === 0)
      return <p>Schedule is complete</p>;

    return <p>{first ? 'First' : 'Next'} class at{' '}
        <select value={this.state.hour}
            onChange={this.doHourChange}>{hours}</select>{' '}
        in{' '}
        <select value={this.state.location}
            onChange={this.doLocationChange}>{locations}</select>{' '}
        named{' '}
        <input type="text" value={this.state.name} style={{width: '65px'}}
            onChange={this.doNameChange}></input>{' '}
        <button onClick={this.doAddClick}>Add</button>
      </p>;
  }

  renderSaved = (): JSX.Element => {
    if (this.state.saved === true) {
      return <span> Saved successfully!</span>
    } else {
      return <span></span>
    }
  };

  doGetScheduleResponse = (res: Response): void => {
    if (res.status !== 200) {
      res.text()
        .then((msg) => this.doGetScheduleError(`bad status code ${res.status}: ${msg}`))
        .catch(() => this.doGetScheduleError("Failed to parse error response message"));
    } else {
      res.json()
        .then(this.doGetScheduleJson)
        .catch(() => this.doGetScheduleError("Failed to parse response as JSON"));
    }
  }

  doGetScheduleJson = (data: unknown): void => {
    if (!isRecord(data) || data.schedule == undefined) {
      this.doGetScheduleError("response is not in expected form");
      return;
    }

    const schedule = parseSchedule(data.schedule);
    if (schedule.length !== 0) {
      this.setState({hour: hoursAfter(schedule[schedule.length-1].hour)[0], schedule});
    } else {
      this.setState({schedule});
    }
    
  }

  doGetScheduleError = (msg: string): void => {
    console.error("error while fetching '/api/schedule', ", msg);
  }

  doRemoveClick = (evt: MouseEvent<HTMLAnchorElement>): void => {
    evt.stopPropagation();
    evt.preventDefault();

    if (this.state.schedule !== undefined) {
      const n = this.state.schedule.length;
      this.setState({schedule: this.state.schedule.slice(0, n-1)});
    }
  };

  doHourChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({hour: parseHour(evt.target.value)});
  }

  doLocationChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({location: evt.target.value});
  }

  doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({name: evt.target.value});
  }

  doAddClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    if (this.state.schedule === undefined)
      throw new Error('impossible');

    const event: EventStart = {
        hour: this.state.hour,
        location: this.state.location,
        desc: this.state.name
      };

    this.setState({
        schedule: this.state.schedule.concat([event]),
        hour: hoursAfter(this.state.hour)[0],
        location: this.props.buildings[0],
        name: ""
      });
  }

  doSaveClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    if (this.state.schedule === undefined)
      throw new Error('impossible');

    const body = {user: this.props.user, schedule: jsonifySchedule(this.state.schedule)};
    fetch("/api/schedule", {method: 'POST', body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}})
      .then(this.doSaveResp)
      .catch(this.doSaveError);
  }

  doSaveResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text()
         .then((msg: string) => this.doSaveError(`bad status code ${res.status}: ${msg}`))
         .catch(() => this.doSaveError("Failed to parse error response message"));
    } else {
      res.json()
        .then(this.doSaveJson)
        .catch(() => this.doSaveError("Failed to parse response data as JSON"))
    }
  }

  doSaveJson = (data: unknown): void => {
    if (!isRecord(data) || typeof data.saved !== "boolean") {
      this.doSaveError("response is not in expected form");
      return;
    }

    if (data.saved === true)
      this.setState({saved: true});
  }

  doSaveError = (msg: string): void => {
    console.error("error while fetching '/api/schedule', ", msg);
  }

  doBackClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBack();
  }
}