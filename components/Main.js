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
      // userList: [],
      isOpen: true,
      selectedItem: 'About',
      modalVisible: true,
      anchorStatus: false,
      isRecording: false,
      serverConnection: false,
      pathCoordinates: [],
      latitude: null,
      longitude: null,
      followUser: true,
      res: null,
      nodeNumber: 0,
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    };

    this.socket = new WebSocket('ws://faharu.com:8000');
    // console.log('conz user::', this.state.user);


/*    // workaround for React Native issues with some libraries (e.g. cuid, socket-io)
    if (global.navigator && global.navigator.product === 'ReactNative') {
        global.navigator.mimeTypes = '';
        try {
            global.navigator.userAgent = 'ReactNative';
        }
        catch (e) {
            console.log('Tried to fake useragent, but failed. This is normal on some devices, you may ignore this error: ' + e.message);
        }
    }
  }


  // watchID: ?number = null;

  componentWillMount() {



/*      this.socket = new WebSocket('ws://faharu.com:8000');
      this.socket.onopen = () => {
        console.log('conz ::onopen')
        this.setState({serverConnection: true})
      }
      // this.socket.addEventListener('message', (event) => {
      //   console.log('conz message::', event);
      // })
      this.socket.onmessage = (event) => {
        console.log('conz event::', event)
        event = JSON.parse(event)
      }*/

  }

  onAddNode(socket) {
    socket.onmessage = (event) => {
      let data = JSON.parse(event.data);
      if (data.type == 'onAddNode') {
        this.setState({pathID: data.pathID, serverConnection: true})
        // this.onAddNode(data.recipient, data.pathID);
      }
    }
  }
  
  requestUserList() {
    let request = {
      type: 'getUsers',
      fromClient: this.state.user.id,
      user: this.state.user.id,
    };
    // console.log('conz req::', request)
    this.socket.send(JSON.stringify(request));
    console.log('conz :: user.id', JSON.stringify(this.state.user.id))
/*    this.socket.onopen = () => {
      console.log('conz::onopen1')
      let request = {
        type: 'getUsers',
        fromClient: user,
        user: user,
      };
      this.socket.send(JSON.stringify(request));
      // this.onAddNode(this.socket);    
    }*/
    /*this.socket.onmessage = (event) => {
      // console.log('conz :: getUsers:', event.data)
      let data = JSON.parse(event.data);
      // console.log('conz event.data::', data.userList);
      this.setState({userList: data.userList});
      console.log('conz data.userList', this.state.userList)
    }*/
  }

  componentDidMount() {
    // this.socket = new WebSocket('ws://faharu.com:8000');
    this._setupGoogleSignin();
    if (this.state.user !== null) {
      console.log('conz this.state.user ::', this.state.user)
      this.requestUserList();
    }

    console.log('*******componentDidMount() here*****');
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
            nodeNumber: this.state.nodeNumber+1
          })
        } else {
            this.setState({
              pathCoordinates: [],
              nodeNumber: 0
            })
        }
        //on position change, move to location

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
      //distanceFilter sets location accuracy; 4 meters
    );




    this.socket.onmessage = (event) => {
      let data = JSON.parse(event.data);
      if (data.type == 'onAddNode') {
        this.setState({pathID: data.pathID, serverConnection: true})
        // this.onAddNode(data.recipient, data.pathID);
      }
    }
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  updateCurrent(pathCoordinates) {

  }

/*  fitCoords(region) {
    this.map.fitToCoordinates(region, {
      edgePadding: DEFAULT_PADDING,
      animated: true,
    });
  }*/

/*  onRegionChange(region) {
    this.setState({ region });
  }
*/
/*  jumpRandom() {
    this.setState({ region: this.regionNow() });
  }*/
/*
  goToCurrentLocation() {
    this.map.animateToRegion(this.regionNow());
  }*/

  onToggleFollow() {
    this.setState({ followUser: !this.state.followUser })
  }

/*  startButton() { //unused?
    if (!this.state.isRecording) {
      this.setState({ isRecording: true})
    }
  }*/

  recordButton() {
    this.setState({ isRecording: !this.state.isRecording, nodeNumber: 0 });
  }

  addNode(latitude, longitude, timestamp) {
    // this.setState({ serverConnection: true })
    let request = {
      type: 'addNode',
      pathID: typeof this.state.pathID !== undefined ? this.state.pathID : null,
      latitude: latitude,
      longitude: longitude,
      recording: this.state.isRecording,
      user: this.state.user,
      nodeNumber: this.state.nodeNumber,
      timestamp: timestamp,
     };

    this.socket.send(JSON.stringify(request));
  }

  regionNow() {
    const { region } = this.state;
    return {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      // heading: this.state.heading,
      // speed: this.state.speed,
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
      // this.requestUserList(JSON.stringify(user.id));
      this.setState({user: user});
      // console.log('conz::user.id::', JSON.stringify(user.id));
      if (typeof user !== 'undefined' & user !== null) {
        // console.log('conz signed in ::', user.id);
        this.requestUserList();
      }
    /*      if (user) {
        let request = {
          type: 'userUpdate',
          user: user,
        }
        this.socket.send(JSON.stringify(request));
      }*/
    }
    catch(err) {
      console.log("Play services error", err.code, err.message);
    }
  }

  _signIn() {
    GoogleSignin.signIn()
    .then((user) => {
      // console.log('conz user::', user.id);
      this.setState({user: user});
      if (typeof user !== 'undefined' & user !== null) {
        this.requestUserList();
      }
/*      if (user) {
        let request = {
          type: 'userUpdate',
          user: user,
        }
        this.socket.send(JSON.stringify(request));
      }*/
      // this.setState({modalVisible: false})
    })
    .catch((err) => {
      console.log('WRONG SIGNIN', err);
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
    
    const messageBar = <Message user={this.state.user} socket={this.socket} userList={this.state.userList} />

    if (!this.state.user) {
      return (
        <View style={styles.container}>
          <GoogleSigninButton
            style={{width: 230, height: 48, margin: 0}}
            size={GoogleSigninButton.Size.Standard}
            color={GoogleSigninButton.Color.Dark}
            onPress={this._signIn.bind(this)}/>
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
                  <Text>Follow: {this.state.followUser ? 'On' : 'Off'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={ () => this.recordButton() }
                  style={[styles.bubble, styles.button]}
                >
                  {this.state.isRecording ? <Text>Stop</Text> : <Text>Begin</Text>}
                </TouchableOpacity>
              </View>
              <View style={[styles.bubble, styles.latlng]}>
                <Text style={{ textAlign: 'center' }}>
                  Latitude: {this.state.latitude},{"\n"}
                  Longitude: {this.state.longitude},{"\n"}
                  Recording: {this.state.isRecording ? 'ON' : 'OFF'},{"\n"}
                  Server: {this.state.serverConnection ? 'Connected' : 'Disconnected'},{"\n"}
                  User: {this.state.user ? this.state.user.name : 'Not signed in'}{"\n"}
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
/*
<Modal style={styles.modal}
  animationType={"slide"}
  transparent={false}
  visible={this.state.modalVisible}
  onRequestClose={() => {alert("Sign in to proceed")}}
  >
  <View style={styles.signin}>
    <View style={{marginTop:2}}>              
        <GoogleSigninButton
          style={{width: 230, height: 48, margin: 0}}
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Dark}
          onPress={this._signIn.bind(this)}/>
    </View>
  </View>
</Modal>*/

//<TouchableOpacity
//                onPress={ () => this.setState({modalVisible: !this.state.modalVisible}) }
//              >
//              </TouchableOpacity>

Main.propTypes = {
  provider: MapView.ProviderPropType,
  connection: connectionShape,
};

const styles = StyleSheet.create({
  modal: {
    ...StyleSheet.absoluteFillObject,

  },

  hamburger: {
    zIndex: 20,
    color: 'red'

  },

  panel: {
    alignItems: 'center',
  },

  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',

  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  signin: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(133,133,133,0.7)',
    padding: 15,
    margin: 0,
    justifyContent: 'space-around',
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 300,
    alignItems: 'stretch',
  },
  button: {
    width: 100,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,

  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    backgroundColor: 'transparent',
  },
});

AppRegistry.registerComponent('Main', () => Main);
