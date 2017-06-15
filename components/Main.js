import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import MapView, { MAP_TYPES } from 'react-native-maps';
import pick from 'lodash/pick';
import { withConnection, connectionShape } from 'react-native-connection-info';

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
      anchorStatus: false,
      isRecording: false,
      serverConnection: false,
      routeCoordinates: [],
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
    console.log('*******componentDidMount() here*****');
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        const { routeCoordinates } = this.state
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        
        if (this.state.isRecording && !this.state.anchorStatus) {
          const positionLatLngs = pick(position.coords, ['latitude', 'longitude'])
          this.sendRequest(latitude, longitude)
          this.setState({
            routeCoordinates: routeCoordinates.concat(positionLatLngs)
          })
        }
        //on position change, move to location

        this.setState({
          // routeCoordinates: routeCoordinates.concat(positionLatLngs),
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

  updateCurrent(routeCoordinates) {

  }

  fitCoords(region) {
    this.map.fitToCoordinates(region, {
      edgePadding: DEFAULT_PADDING,
      animated: true,
    });
  }

  onRegionChange(region) {
    this.setState({ region });
    // console.log('routeCoordinates: ' + routeCoordinates);
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

  recordButton() {
    this.setState({ isRecording: !this.state.isRecording })
    // this.savePath()
  }

  sendRequest(latitude, longitude) {
    fetch('http://faharu.com/connectdb', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Lat: latitude,
        Lng: longitude,
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

  render() {
    console.log('routeCoordinates at render: ' + this.state.routeCoordinates);
    let recorder = null;
    if (this.state.isRecording) {
      recordPolyline = <MapView.Polyline coordinates= {this.state.routeCoordinates} strokeColor= {'#1985FE'} strokeWidth= {10}/>
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
            onPress={() => this.onToggleFollow()}
            style={[styles.bubble, styles.button]}
          >
            <Text>Follow: {this.state.followUser ? 'On' : 'Off'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.recordButton()}
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
      </View>
//Signal Strength: {this.state.isConnected ? 'Connected' : 'Offline'}{"\n"}      
    );
  }
}


Main.propTypes = {
  provider: MapView.ProviderPropType,
  connection: connectionShape,
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
