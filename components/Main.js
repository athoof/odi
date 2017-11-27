import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Modal,
  Button,
  NetInfo,
} from 'react-native';

import MapView, { MAP_TYPES } from 'react-native-maps';
import _ from 'lodash';
import pick from 'lodash/pick';
import { withConnection, connectionShape } from 'react-native-connection-info';
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';

import SideMenu from 'react-native-side-menu';
import Hamburger from 'react-native-hamburger';
import Message from './Message';

// import './UserAgent';
// import io from 'socket.io-client';
// const socket = io('http://faharu.com:8000');

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 0;
const LONGITUDE = 0;
const LATITUDE_DELTA = 0.0122;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };


export default class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      userList: [],
      isOpen: false,
      selectedItem: 'About',
      isRecording: false,
      serverConnection: false,
      pathCoordinates: [],
      latitude: null,
      longitude: null,
      followUser: true,
      ping: '- ',
      error: null,
      nodeNumber: 0,
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    };

    this.socket = new WebSocket('ws://faharu.com:8888');
    
  }

  onAddNode(socket) {
    socket.onmessage = (event) => {
      let data = JSON.parse(event.data);

    }
  }
  
  requestUserList(user) {
    user = user ? user : this.state.user
    if (user !== null) {
      let request1 = {
        type: 'userUpdate',
        user: user,
      }
      console.log('conz requestUserList()::userUpdate', user.id)
      this.socket.send(JSON.stringify(request1));

      let request2 = {
        type: 'getUsers',
        fromClient: this.state.user.id,
        user: this.state.user.id,
      };
      // console.log('conz req::', request)
      this.socket.send(JSON.stringify(request2));
      console.log('conz :: user.id', JSON.stringify(this.state.user.id))
      
    }
  }

  pinger() {
    if (this.state.user)
      setInterval(() => this.ping(), 400);
  }
  async ping() {
    let date = new Date();
    let time = date.getTime();
    request = {
      type: 'ping',
      user: this.state.user,
      pingTime: time,
    }
    this.socket.send(JSON.stringify(request));
    // this.setState({ping: '-'});
  }

  componentDidMount() {
    // this.socket = new WebSocket('ws://faharu.com:8000');
    console.log('*******componentDidMount() here*****');

        //WebSocket listener
    this.setState({error: <Text>Connecting to Faharu...</Text>})
    this._setupGoogleSignin();
    this.socketStart();
    this.socket.onclose = () => {
      this.setState({error: <Text>Disconnected!</Text>});
      this.socketStart();      
    }

    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        const { pathCoordinates } = this.state
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        let d = new Date();
        let timestamp = d.getTime();

        
        if (this.state.isRecording == true) {
          const positionArray = null
          positionArray = pick(position.coords, ['latitude', 'longitude'])
/*          this.addNode(latitude, longitude, timestamp, (connectionStatus) => {
            this.setState({serverConnection: connectionStatus})
          });*/
          this.addNode(latitude, longitude, timestamp);
          this.setState({
            pathCoordinates: pathCoordinates.concat(positionArray),
            nodeNumber: this.state.nodeNumber + 1,
          })
        } else {
            this.setState({
              pathCoordinates: [],
              nodeNumber: 0,
            })
        }

        this.setState({
          latitude: latitude,
          longitude: longitude,
          region: {
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }
        });
      },
      (error) => this.setState({ error: error.message}),
      {enableHighAccuracy: true, timeout: 5000, maximumAge: 500, distanceFilter: 10}
      //distanceFilter sets location accuracy; 10 meters
    );


  }

  keepAlive() {
    let d = new Date();
    let t = d.getTime();
    console.log('conz this should be T :::' + t)
    let request = {
      type: 'isAlive', 
      user: this.state.user,
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      timestamp: t,
    };
    this.socket.send(JSON.stringify(request))
  }

  socketStart() {
    this.setState({error: null});
    this.socket.onopen = () => {
      console.log('conz::onopen/main:8888');


      const locationUpdate = setInterval(() => {
        let d = new Date();
        let t = d.getTime();
        console.log('conz this should be T :::' + t)
        let request = {
          type: 'isAlive', 
          user: this.state.user,
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          timestamp: t,
        };
        this.socket.send(JSON.stringify(request))
      }, 120000);

      this.socket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        console.log('conz Received a message...', data)
        switch (data.type) {
          case 'onAddNode':
            this.setState({pathID: data.pathID})
            console.log('conz Received onAddNode :: ', data.pathID)
            break;

          case 'ping':
            let currentDate = new Date();
            let currentTime = currentDate.getTime();
            let latency = currentTime - data.ping;
            latency = Math.abs(latency);
            this.setState({ping: latency})
            console.log('conz pong::' + latency)
            break;
        }
      }
    }
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
    this.socket.close();
  }

  updateCurrent(pathCoordinates) {

  }

  onToggleFollow() {
    this.setState({ followUser: !this.state.followUser })
  }

  recordButton() {
    this.setState({ isRecording: !this.state.isRecording, nodeNumber: 0 });
  }

  addNode(latitude, longitude, timestamp) {
    let request = {
      type: 'addNode',
      pathID: typeof this.state.pathID !== undefined ? this.state.pathID : null,
      latitude: latitude,
      longitude: longitude,
      recording: this.state.isRecording,
      user: this.state.user,
      nodeNumber: this.state.nodeNumber,
      timestamp: timestamp,
      ping: this.state.ping,
     };

    this.socket.send(JSON.stringify(request));
  }

  regionNow() {
    const { region } = this.state;
    return {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
  }

  async _setupGoogleSignin() {
    try {
      await GoogleSignin.hasPlayServices({ autoResolve: true });
      await GoogleSignin.configure({
        webClientId: '895298796941-qmolk65fab827dojmdbbgv24f7uuso40.apps.googleusercontent.com', //https://console.developers.google.com/apis/credentials/oauthclient/895298796941-qmolk65fab827dojmdbbgv24f7uuso40.apps.googleusercontent.com?project=odifaharu
        // webClientId: '895298796941-ascgnd7n2e5svuef5hmv28s5h7q2d7gh.apps.googleusercontent.com', //release
        offlineAccess: false
      });

      const user = await GoogleSignin.currentUserAsync();
      this.setState({user: user});
      if (typeof user !== 'undefined' & user !== null) {
        console.log('conz signed in ::', user.id);

        this.requestUserList(user);
      }
    }
    catch(err) {
      console.log("conz Play services error", err.code, err.message);
      this.setState({error: <Text>Error: {JSON.stringify(err.message.name)}</Text>})
    }
  }

  _signIn() {
    GoogleSignin.signIn()
    .then((user) => {
      this.setState({user: user});
      if (typeof user !== 'undefined' & user !== null) {
        this.requestUserList(user);
      }
    })
    .catch((err) => {
      console.log('WRONG SIGNIN', err);
      this.setState({error: <Text>Something went wrong, please try again</Text>});
    })
    .done();
  }

  _signOut() {
    GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
      this.setState({user: null});
    })
    .done();
  }

  toggleSidebar(isOpen) {
    this.setState({ isOpen })
  }

  openSidebar() {
    this.setState({isOpen: true});
  }

  render() {
    const messageBar = <Message user={this.state.user} userList={this.state.userList} />
    const recordingButton = {
      backgroundColor: this.state.isRecording ? 'rgba(209, 31, 80, 0.8)' : 'rgba(40, 45, 58, 0.5)',
    }
    
    if (!this.state.user) {
      return (
        <View style={styles.signin}>
          <GoogleSigninButton
            style={{width: 230, height: 48, margin: 50, }}
            size={GoogleSigninButton.Size.Standard}
            color={GoogleSigninButton.Color.Light}
            onPress={this._signIn.bind(this)}/>
          {this.state.error}
        </View>
      )
    }

    if (this.state.isRecording && this.state.pathCoordinates.length > 0) {
      recordPolyline = <MapView.Polyline coordinates= {this.state.pathCoordinates} strokeColor= {'#1985FE'} strokeWidth= {10}/>
    } else { recordPolyline = null }

    if(this.state.user) {
      return (
        <SideMenu
          menuPosition={'right'}
          style={styles.sidebar}
          menu={messageBar}
          isOpen={this.state.isOpen}
          onChange={isOpen => this.toggleSidebar(isOpen)}
          // hiddenMenuOffset={16}
          // openMenuOffset={0}
          bounceBackOnOverdraw={true}
          autoClosing={false}
        >
          <View style={styles.container}>

            <MapView
              provider={this.props.provider}
              ref={ref => { this.map = ref; }}
              // mapType={MAP_TYPES.TERRAIN}
              style={styles.map}
              initialRegion={this.state.region}
              // followUserLocation={this.state.followUser}//this DOES NOT work in any way
              region={this.state.followUser ? this.state.region : null}//this enables follow
              showsUserLocation={true}
              loadingEnabled={true}
            >
            {recordPolyline}
              <MapView.Marker
                pinColor={'green'}
                coordinate={{
                  latitude: (this.state.latitude) || -36.82339,
                  longitude: (this.state.longitude) || -73.03569,
                  heading: (this.state.heading),
                  speed: (this.state.speed),
                }}>
              </MapView.Marker>
            </MapView>
            <View style = {styles.panel}>
              <View style = {styles.buttonContainer}>
                <TouchableOpacity
                  onPress={ () => this.onToggleFollow() }
                  style={[styles.bubble, styles.button]}
                >
                  <Text style={{fontSize: 18, color: 'white', textAlign: 'center',}}>Follow:{"\n"}{this.state.followUser ? '✔️' : '❌'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={ () => this.recordButton() }
                  style={[styles.bubble, styles.button, recordingButton]}
                >
                  {this.state.isRecording ? <Text style={{padding: 4, textAlign: 'center', fontSize: 40, color: 'black'}}>■</Text> : <Text style={{padding: 4, textAlign: 'center', fontSize: 40, color: 'red'}}>◉</Text>}
                </TouchableOpacity>
              </View>
              <View style={[styles.statView, styles.latlng]}>
                <Text style={[styles.textStyle]}>
                  Latitude: {this.state.latitude}{"\n"}
                  Longitude: {this.state.longitude}{"\n"}
                  Ping: {this.state.ping}ms{"\n"}
                  {this.state.error == null ? 'Signed in as: ' + this.state.user.name : 'Disconnected'} 
                </Text>
              </View>
            </View>
           </View>
        </SideMenu>
  //Signal Strength: {this.state.isConnected ? 'Connected' : 'Offline'}{"\n"}      
      );  
    }
  }
}


Main.propTypes = {
  provider: MapView.ProviderPropType,
  connection: connectionShape,
};

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  textStyle:{
    textAlign: 'left', 
    color: '#E6E6E6',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  signin: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    backgroundColor: '#3F8D89',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  statView: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(40, 45, 58, 0.8)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignSelf: 'stretch',
  },
  bubble: {
    backgroundColor: 'rgba(40, 45, 58, 0.5)',
    // paddingHorizontal: 18,
    // paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    alignSelf: 'stretch',
  },
  button: {
    width: 80,
    padding: 0,
    marginHorizontal: 10,

  },
  buttonContainer: {
    flexDirection: 'row',
    color: '#fff',
    marginVertical: 5,
    backgroundColor: 'transparent',
  },
});

AppRegistry.registerComponent('Main', () => Main);
