import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from 'react-native';

import _ from 'lodash';
import io from 'socket.io-client';
const socket = io('http://faharu.com:8000');



export default function Message(props) {

	// io.sockets.on('connection', (socket) => {
	// 	socket.emit('message', {message: 'Welcome'});
	// 	socket.on('send', (data) => {
	// 		io.sockets.emit('message', data);
	// 	})
	// })

	// listUsers();
	generateUserList = () => {
		var textArray = [];
		// for (var i = 0; i < props.userList.length; i++) {
		// 	textArray.push(<Text>{props.userList[i]}</Text>)
		// }
		// return textArray;
		props.userList.forEach((user)=>{

			textArray.push(
				<View style={styles.user}>
					<Image style={styles.photo} source={{uri: user.photo}} />
					<Text style={styles.username}>{user.name}</Text>
				</View>
				)
		})
		return textArray;
	}

	return (
		<View style={styles.sidebar}
			// onPress={ () =>  }
		>
			<Text style={styles.label}>
				Leave a comment, 
				or send a message
			</Text>
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} horizontal={true}>
				{generateUserList()}
				{generateUserList()}
				{generateUserList()}
			</ScrollView>
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
	},
	scrollView: {
		maxHeight: 115,
		height: 80,
	},
	contentContainer: {
		// backgroundColor: 'blue',
		height: 175,
		padding: 12,
	},
	user:{
		width: 50,
		height: 50,
	},
	username: {
		lineHeight: 12,
		textAlign: 'center',
	},
	photo: {
		width: 50,
		height: 50,
	}
})