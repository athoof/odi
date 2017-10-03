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
  TextInput,
} from 'react-native';

import _ from 'lodash';
import io from 'socket.io-client';
const socket = io('http://faharu.com:8000');



export default class Message extends React.Component {
	constructor(props) {
	  super(props);
	
	  this.state = {
	  	text: '',
	  	selectedRecipient: null,
	  	messageBuffer: [],
	  	// userList: this.props.userList,

	  };
	}

	generateUserList() {
		var textArray = [];
		this.props.userList.forEach((user)=>{
			// console.log('user?', user)
			textArray.push(
				<TouchableOpacity 
					style={styles.user}
					onPress={() => { this.setState({selectedRecipient: user.id}) } }
				>
					<Text style={styles.username}>{user.name}</Text>
					<Image style={styles.photo} source={{uri: user.photo}} />
					<View style={styles.overlay} />
				</TouchableOpacity>
				)
		})
		return textArray;
	}

	receiveMessages() {
		socket.emit('getMessages', { 
		  selectedRecipient: this.state.selectedRecipient,
		 });
		socket.on('receiveMessages', (response) => {
		  // console.log('usr', response.userList);
		  this.setState({messageBuffer: response.messageBuffer});
		})
	}

	sendMessage() {
		let d = new Date();
		let timestamp = d.getTime();
		socket.emit('sendMessage', {
			users: [this.state.user, this.state.selectedRecipient],
			messages: [{
				sender : this.props.user,
				recipient : this.state.selectedRecipient,
				messageBody : this.state.text,
				timestamp : timestamp,
			}]
		});
		// socket.on('')
	}

	render() {
		return (
			<View style={styles.sidebar}>
				<Text style={styles.label}>
					Messaging
				</Text>
				<ScrollView style={styles.recipients} contentContainerStyle={styles.contentContainer} horizontal={true}>
					{this.generateUserList()}
				</ScrollView>
				<ScrollView style={styles.chatView} contentContainerStyle={styles.chatContainer}>
					<Text style={[styles.chatBubble, styles.receivedChat]}>Receiving chat bubble</Text>
					<Text style={styles.chatBubble}>This is an average length text message, with punctuations!</Text>
					<Text style={styles.chatBubble}>This is an average length text message, with punctuations!</Text>
				</ScrollView>
				<TextInput
					style={styles.textInput}
					placeholder="Type a message"
					onChangeText={(text) => {this.setState({text: text})} }
					onSubmitEditing={() => { this.sendMessage(); }}
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	sidebar: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'white',
		alignItems: 'center',
	},
	label: {
		fontSize: 24,
		padding: 12,
	},
	textInput: {
		color: 'gray',
		width: '100%',
		padding: 15,
		fontSize: 18,
	},
	receivedChat: {
		marginLeft: '10%',
	},
	chatContainer: {
		height: '100%',
		justifyContent: 'flex-end',
	},
	chatView: {
		backgroundColor: 'whitesmoke',
		// alignItems: 'flex-start',
		minWidth: '100%',
		flex: 1,
	},
	chatBubble: {
		margin: 5,
		maxWidth: '90%',
		minWidth: '50%',
		width: 'auto',
		height: 'auto',
		padding: 20,
		fontSize: 18,
		color: 'gray',
		backgroundColor: 'ivory',
		borderBottomColor: 'steelblue', 
		// borderBottomWidth: StyleSheet.hairlineWidth,
		borderRadius: 18,
		alignItems: 'flex-end',
	},
	recipients: {
		maxHeight: 100,
		padding: 15,
		width: '100%',
		// alignItems: 'center',
		maxWidth: 300,
		borderTopColor: 'gray',
		borderBottomColor: 'gray',
		borderTopWidth: StyleSheet.hairlineWidth,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	contentContainer: {
	    justifyContent: 'center',
	    alignItems: 'center',
		minWidth: '100%',
		height: 75,
	},
	user: {
		width: 75,
		height: 75,
		margin: 5,
	},
	username: {
		lineHeight: 25,
		textAlign: 'center',
		position: 'absolute',
		zIndex: 3,
		color: 'white',
		fontWeight: 'bold',
	},
	photo: {
		width: 75,
		height: 75,
		borderRadius: 64,
	},
	overlay: {
		flex: 1,
		position: 'absolute',
		left: 0,
		top: 0,
		opacity: 0.3,
		backgroundColor: 'black',
		width: 75,
		height: 75,
		borderRadius: 64,
		zIndex: 2,
	},
})