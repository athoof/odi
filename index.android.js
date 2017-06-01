import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
} from 'react-native';

import Main from './components/Main';

class odi extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Main />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

AppRegistry.registerComponent('odi', () => odi);
