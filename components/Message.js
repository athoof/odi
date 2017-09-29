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

import _ from 'lodash';
import io from 'socket.io-client';
const socket = io('http://faharu.com:8000');

export default function Message(props) {
	// sidebarStyle = (options) => {
	// 	return {
	// 		...StyleSheet.absoluteFillObject,
	// 		backgroundColor: 'white',
	// 	}
	// }
	return (
		<View style={styles.sidebar}
			// onPress={ () =>  }
		>
			<Text style={styles.label}>
				Leave a comment, 
				or send a message
			</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	sidebar: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'white',
		alignItems: 'center',
		padding: 40,
	},
	label: {
		fontSize: 24,
	}
})