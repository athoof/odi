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
  Button,
} from 'react-native';

import _ from 'lodash';
// import io from 'socket.io-client';
// const socket = io('http://faharu.com:8000');


export default class Message extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			text: '',
			selectedRecipient: null,
			messageBuffer: [],
			messageBufferParsed: [],
			userList: [],
			touchableOpacityArray: [],
			users: [],
			channel: 'lobby',
		};

		// this.props.socket = this.props.socket;



      // this.props.socket = new WebSocket('ws://faharu.com:8000/?ch=' + this.state.channel);

  }




	sendMessage() {
		let d = new Date();
		let timestamp = d.getTime();
		let request = {
			type: 'sendMessage',
			fromClient: this.props.user.id,
			users: this.state.users,
			message: {
				sender : this.props.user.id,
				recipient : this.state.selectedRecipient,
				messageBody : this.state.text,
				timestamp : timestamp,
			}
		}
		this.props.socket.send(JSON.stringify(request));
		// this.props.socket.onmessage = (event) => {
		// 	let data = JSON.parse(event.data);
		this.requestLoadMessages(this.state.selectedRecipient)

		// }

		this.textInput.clear();
	}

	clearBuffer() {
		this.setState({messageBuffer: [], messageBufferParsed: []});
	}
/*
	requestUserList() {
		let request = {
			type: 'getUsers',
			fromClient: this.props.user.id,
			user: this.props.user.id,
		};
		// console.log('conz req::', request)
		this.props.socket.send(JSON.stringify(request));
		console.log('conz :: requestUserList')
		this.props.socket.onmessage = (event) => {
			// console.log('conz :: getUsers:', event.data)
			let data = JSON.parse(event.data);
			// console.log('conz event.data::', data.userList);
			this.setState({userList: data.userList});
			console.log('conz data.userList', this.state.userList)
		}
	}
*/

	requestLoadMessages(selectedRecipient) {
		let userArr = [this.props.user.id, selectedRecipient];
		userArr = userArr.sort();
		if (selectedRecipient !== this.state.selectedRecipient) {
			console.log('conz selectedRecipient does not match', selectedRecipient, this.state.selectedRecipient)
			this.clearBuffer();
		}
		let request = {
			type: 'loadMessages',
			fromClient: this.props.user.id,
			users: userArr ? userArr : this.state.users,
		};

		this.props.socket.send(JSON.stringify(request));
	}


	parseMessageBuffer(messageBuffer) {
		var mArr = [];
		let buffer = messageBuffer ? messageBuffer : this.state.messageBuffer
		if (typeof buffer !== 'undefined' && buffer !== null) {
			// console.log('conzBUFFER', JSON.stringify(buffer))
			buffer.messages.forEach((message) => {
				let styleArr = [styles.chatBubble];
				if (message.recipient == this.props.user) {
					styleArr = [styles.chatBubble, styles.receivedChat];
				}
				mArr.push(<Text style={styleArr}>{message.messageBody}</Text>)
			})
			this.setState({messageBufferParsed: mArr});
			if (!messageBuffer) return mArr;
			
		} else {
			return <Text style={styles.chatBubble}>No messages</Text>;
		}
	}

	selectRecipient(user) {
		let userArr = [this.props.user.id, user];
		userArr = userArr.sort();
		this.setState({selectedRecipient: user, users: userArr}, () => {
			this.requestLoadMessages(this.state.selectedRecipient);
		});
	}

	onLoadMessages(messageBuffer, users) {
		// this.requestLoadMessages(this.state.selectedRecipient);
		// console.log('conz loadMessages::', data.messageBuffer)
		this.setState({
			messageBuffer: messageBuffer, 
			// selectedRecipient: this.state.selectedRecipient, 
			users: users
		});
		console.log('conz::onLoadMessages', messageBuffer)
		this.parseMessageBuffer(messageBuffer);
	}

	onAddNode() {

	}
	
	onUserUpdate() {

	}

	makeTouchableOpacity(userList, callback) {
		if(userList !== null) {
			console.log('conz userList', userList)
			this.setState({userList: userList});
			var touchArray = []
			userList.forEach((user) => {
				touchArray.push(
					<TouchableOpacity 
						style={styles.user}
						onPress={() => { this.selectRecipient(user.id); } }
					>
						<Text style={styles.username}>{user.name}</Text>
						<Image style={styles.photo} source={{uri: user.photo}} />
						<View style={styles.overlay} />
					</TouchableOpacity>
					);
			})
			callback(null, touchArray);
			this.setState({touchableOpacityArray: touchArray});
		} else {
			callback('No array');
			console.log('conz no touchableOpacityArray')
		}
	}

	onMessageReceived() {
		this.onLoadMessages();
	}

	componentDidMount() {
		// console.log('conz', this.props.user)
		// this.props.socket.onmessage = () => {
		// 		// console.log('conz getUsers::', userList)
		// 	this.requestUserList((userList) => {
		// 		this.setState({userList: userList})
		// 		onGetUsers(this.state.userList);
		// 	});
		// }

		this.props.socket.onopen = () => {
		  console.log('conz::onopen/main.js')
		  this.props.socket.onmessage = (event) => {
		    let data = JSON.parse(event.data);
		    console.log('conz::onmessage/main.js', event)
		    console.log('conz userList 1 ::', JSON.stringify(data.userList))

		    switch (data.type) {
		      
		      case 'onLoadMessages':
		        console.log('conz::onLoadMessages')
		        this.onLoadMessages(data.messageBuffer, data.users);
		        break;
		      
		      case 'onAddNode':
		        // this.requestLoadMessages();
		        break;
		      
		      case 'onMessageReceived':
		        this.requestLoadMessages(this.state.selectedRecipient);
		        break;
		      
		      case 'onGetUsers':
		        console.log('conz userList 2 ::', data.userList)
		        this.setState({userList: data.userList});
		        // this.onGetUsers(data.userList);
		        this.makeTouchableOpacity(this.state.userList, (err, res) => {
		        	if (err) throw err;
		        	console.log('conz touchable', res);
		        	this.setState({touchableOpacityArray: res})
		        })
		        break;
		      
		      case 'onSendMessage':
		        this.requestLoadMessages(this.state.selectedRecipient);
		        break;

		    }
		  }
		}


/*		console.log('conz componentDidMount/message.js::', this.props.userList)
		this.props.socket.onmessage = (event) => {
			let data = JSON.parse(event.data);
			console.log('conz :: onmessage/message.js', data)
		}*/

		// this.makeTouchableOpacity(this.props.userList);
	}

	// getTouchableOpacity(callback) {
	// 	makeTouchableOpacity(this.state.userList, (err, res) => {
	// 		if (err) callback(err);
	// 		callback(null, res);
	// 	})
	// }

	render() {
		// console.log('conz3', this.state.userList, this.state.touchableOpacityArray)
		return (
			<View style={styles.sidebar}>
				<Text style={styles.label}>
					Messaging
				</Text>
				<ScrollView style={styles.recipients} contentContainerStyle={styles.contentContainer} horizontal={true}>
					{this.state.touchableOpacityArray}
				</ScrollView>
				<ScrollView 
					ref={ref => this.scrollView = ref}
					style={styles.chatView} 
					contentContainerStyle={styles.chatContainer} 
					horizontal={false}
					onContentSizeChange={(contentWidth, contentHeight) => {
						this.scrollView.scrollToEnd({animated: true});
					}}
				>
					{this.state.messageBufferParsed}
				</ScrollView>
				<TextInput
					style={styles.textInput}
					ref={(input) => { this.textInput = input }}
					placeholder="Type a message"
					onChangeText={(text) => {this.setState({text: text})} }
					onSubmitEditing={() => { this.sendMessage(); }}
				/>
			</View>
		)
	}
}

/*<Text style={[styles.chatBubble, styles.receivedChat]}>Receiving chat bubble</Text>
<Text style={styles.chatBubble}>This is an average length text message, with punctuations!</Text>
<Text style={styles.chatBubble}>This is an average length text message, with punctuations!</Text>*/

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