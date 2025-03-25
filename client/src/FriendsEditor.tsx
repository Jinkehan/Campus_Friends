import React, { ChangeEvent, Component, MouseEvent} from 'react';
import { jsonifyFriends, parseFriends } from './friends';
import { USERS } from './users';
import { isRecord } from './record';


type FriendsProps = {
  user: string;        // name of the current user
  onBack: () => void;  // called to go back to the menu
};

type FriendsState = {
  friends?: Array<string>;  // current list of friends
  saved?: boolean;          // show a saved message
};


/** Component for displaying and editing the user's friends list. */
export class FriendsEditor extends Component<FriendsProps, FriendsState> {
  constructor(props: FriendsProps) {
    super(props);

    this.state = {};
  }

  componentDidMount = (): void => {
    fetch('/api/friends?user=' + encodeURIComponent(this.props.user))
      .then(this.doFriendsResp)
      .catch(this.doFriendsError);
  }

  render = (): JSX.Element => {
    if (!this.state.friends) {
      return <p>Loading friends list...</p>;
    } else {
      return this.renderFriends();
    }
  };

  renderFriends = (): JSX.Element => {
    if (this.state.friends === undefined)
      throw new Error('impossible');

    const friendBoxes: Array<JSX.Element> = [];
    for (const user of USERS) {
      if (user !== this.props.user) {  // ignore yourself
        const id = `${user}_check`;
        const checked = this.state.friends.includes(user);
        friendBoxes.push(
          <div style={{marginTop: '10px'}} key={user}>
            <input type="checkbox" id={id} checked={checked}
                onChange={(evt) => this.doFriendChange(evt, user)}></input>{' '}
            <label htmlFor={id}>{user}</label>
          </div>);
      }
    }

    return <div className="content">
        <p>Check those users who are your friends:</p>     

        {friendBoxes}

        <p>Those users will see some information about your schedule.</p>

        <p><button onClick={this.doSaveClick}>Save</button>{' '}
          <button onClick={this.doBackClick}>Back</button></p>
          {this.renderSaved()}
      </div>
  };

  renderSaved = (): JSX.Element => {
    if (this.state.saved === true) {
      return <span> Saved successfully!</span>
    } else {
      return <span></span>
    }
  };

  doFriendsResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text()
         .then((msg: string) => this.doFriendsError(`bad status code ${res.status}: ${msg}`))
         .catch(() => this.doFriendsError("Failed to parse error response message"));
    } else {
      res.json()
        .then(this.doFriendsJson)
        .catch(() => this.doFriendsError("Failed to parse response data as JSON"))
    }
  }

  doFriendsJson = (data: unknown): void => {
    if (!isRecord(data) || data.friends === undefined) {
      this.doFriendsError("response is not in expected form");
      return;
    }

    const friends = parseFriends(data.friends);
    this.setState({friends});
  }

  doFriendsError = (msg: string): void => {
    console.error("error while fetching '/api/schedule', ", msg);
  }

  doFriendChange = (evt: ChangeEvent<HTMLInputElement>, name: string): void => {
    if (this.state.friends === undefined)
      throw new Error('impossible');

    const index = this.state.friends.indexOf(name);
    if (evt.target.checked) {
      if (index === -1)
        this.setState({friends: this.state.friends.concat([name]), saved: false});
    } else {
      if (index !== -1) {
        const newFriends = this.state.friends.slice(0, index).concat(
            this.state.friends.slice(index + 1));
        this.setState({friends: newFriends, saved: false});
      }
    }
  }

  doSaveClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    if (this.state.friends === undefined)
      throw new Error('impossible');

    const body = {user: this.props.user, friends: jsonifyFriends(this.state.friends)};
    fetch("/api/friends", {method: 'POST', body: JSON.stringify(body),
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
    console.error("error while fetching '/api/friends', ", msg);
  }

  doBackClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBack();
  }
}