import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';

import MapView, { MAP_TYPES } from 'react-native-maps';
import _ from 'lodash';
import pick from 'lodash/pick';
import { withConnection, connectionShape } from 'react-native-connection-info';
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';

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
      modalVisible: true,
      anchorStatus: false,
      isRecording: false,
      serverConnection: false,
      pathCoordinates: [],
      currentPosition: [],
      coords: null,
      latitude: null,
      longitude: null,
      followUser: true,
      res: null,
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
      // initialPosition: null,
      // lastPosition: null,
      // error: null,
      // region: null,
    };
  }
  // watchID: ?number = null;

  componentDidMount() {
    this._setupGoogleSignin();
    console.log('*******componentDidMount() here*****');
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        const { pathCoordinates } = this.state
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        
        if (this.state.isRecording && !this.state.anchorStatus) {
          const positionArray = null
          positionArray = pick(position.coords, ['latitude', 'longitude'])
          this.sendLocation(latitude, longitude, this.state.isRecording)
          this.setState({
            pathCoordinates: pathCoordinates.concat(positionArray)
          })
        }
        //on position change, move to location

        this.setState({
          // pathCoordinates: pathCoordinates.concat(positionArray),
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
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  updateCurrent(pathCoordinates) {

  }

  fitCoords(region) {
    this.map.fitToCoordinates(region, {
      edgePadding: DEFAULT_PADDING,
      animated: true,
    });
  }

  onRegionChange(region) {
    this.setState({ region });
    // console.log('pathCoordinates: ' + pathCoordinates);
  }

  jumpRandom() {
    this.setState({ region: this.regionNow() });
  }

  goToCurrentLocation() {
    this.map.animateToRegion(this.regionNow());
  }

  onToggleFollow() {
    this.setState({ followUser: !this.state.followUser })
  }

  startButton() {
    if (!this.state.isRecording) {
      this.setState({ isRecording: true })
    }
  }

  recordButton() {
    this.setState({ isRecording: !this.state.isRecording })

    fetch('http://faharu.com/save', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        recording: this.state.isRecording,
      })
    })
    .catch((err) => {
      console.log('Record button AJAX error!')
    })

    console.log('RECORD BUTTON ENTRY')
    if (this.state.isRecording) {
      // this.sendLocation(this.state.latitude, this.state.longitude, this.state.isRecording)
      this.setState({ pathCoordinates: [] })
    }
  }

  sendLocation(latitude, longitude, recording) {
    fetch('http://faharu.com/save', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: latitude,
        longitude: longitude,
        recording: null,
      })
    })
    .then((response) => {
        console.log('Response from server: ' + response)
        this.setState({
          serverConnection: true
        })
      }).catch((err) => {
        console.log('AJAX error!!!');
      })
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
        offlineAccess: false
      });

      const user = await GoogleSignin.currentUserAsync();
      console.log(user);
      this.setState({user});
    }
    catch(err) {
      console.log("Play services error", err.code, err.message);
    }
  }

  _signIn() {
    GoogleSignin.signIn()
    .then((user) => {
      console.log(user);
      this.setState({user: user});
      this.setState({modalVisible: !this.state.modalVisible})
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

  render() {
    console.log('pathCoordinates at render: ' + this.state.pathCoordinates);
    let recorder = null;
    if (this.state.isRecording && this.state.pathCoordinates.length > 0) {
      recordPolyline = <MapView.Polyline coordinates= {this.state.pathCoordinates} strokeColor= {'#1985FE'} strokeWidth= {10}/>
    } else { recordPolyline = null}
    return (
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
          </Text>
        </View>
        <Modal style={styles.modal}
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {alert("Modal closed")}}
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
        </Modal>
      </View>
//Signal Strength: {this.state.isConnected ? 'Connected' : 'Offline'}{"\n"}      
    );
  }
}
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
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
