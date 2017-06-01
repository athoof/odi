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
      routeCoordinates: [],
      currentPosition: [],
      coords: null,
      latitude: null,
      longitude: null,
      followUser: true,
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

    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     const { currentPosition } = this.state
    //     this.setState({ position })
    //   },
    //   (error) => alert(error.message),
    //   {enableHighAccuracy: true, timeout: 20000, maximumAge: 500}
    // )

    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        const { routeCoordinates } = this.state
        const positionLatLngs = pick(position.coords, ['latitude', 'longitude'])
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        //on position change, move to location

        this.setState({
          routeCoordinates: routeCoordinates.concat(positionLatLngs),
          latitude: latitude,
          longitude: longitude,
          region: {
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }
          // latitude: position.coords.latitude,
          // longitude: position.coords.longitude,
          // heading: position.coords.heading,
          // speed: position.coords.speed,
          // error: null,
        });
      },
      (error) => this.setState({ error: error.message}),
      {enableHighAccuracy: true, timeout: 5000, maximumAge: 500, distanceFilter: 1}
      //distanceFilter sets location accuracy; 4 meters
    );
    // this.watchID = navigator.geolocation.watchPosition((position) => {
    //   var lastPosition = JSON.stringify(position);
    //   this.setState({lastPosition});
    // });
    // console.log('routeCoordinates: ' + this.state.routeCoordinates)
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
          <MapView.Polyline
            coordinates= {this.state.routeCoordinates}
            strokeColor= {'#1985FE'}
            strokeWidth= {10}
          />
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
        </View>
        <View style={[styles.bubble, styles.latlng]}>
          <Text style={{ textAlign: 'center' }}>
            Latitude: {this.state.latitude},{"\n"}
            Longitude: {this.state.longitude},{"\n"}
            Signal Strength: {connection.isConnected ? 'Connected' : 'Offline'}{"\n"}
          </Text>
        </View>

      </View>
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
