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

		// this.socket = this.props.socket;



      // this.socket = new WebSocket('ws://faharu.com:8000/?ch=' + this.state.channel);

  }


	getUsers(callback) {
		let request = {
			type: 'getUsers',
			fromClient: this.props.user.id,
			user: this.props.user.id,
		};
		// console.log('conz req::', request)
		this.socket.send(JSON.stringify(request));
		// console.log('conz firing getUsers')
		this.socket.onmessage = (event) => {
			// console.log('conz :: getUsers:', event.data)
			let data = JSON.parse(event.data);
			// console.log('conz event.data::', data.userList);
			callback(data.userList);
		}
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
		this.socket.send(JSON.stringify(request));
		this.socket.onmessage = (event) => {
			let data = JSON.parse(event.data);
			this.loadMessages(this.state.selectedRecipient)

		}

		this.textInput.clear();
	}

	clearBuffer() {
		this.setState({messageBuffer: [], messageBufferParsed: []});
	}

	loadMessages(selectedRecipient) {
		let userArr = [this.props.user.id, selectedRecipient];
		userArr = userArr.sort();
		if (selectedRecipient !== this.state.selectedRecipient) {
			this.clearBuffer();
		}
		let request = {
			type: 'loadMessages',
			fromClient: this.props.user.id,
			users: userArr ? userArr : this.state.users,
		};

		this.socket.send(JSON.stringify(request));
		this.socket.onmessage = (event) => {
			let data = JSON.parse(event.data);
			console.log('conz loadMessages::', data.messageBuffer)
			this.setState({messageBuffer: data.messageBuffer, selectedRecipient: selectedRecipient, users: userArr});
			// this.setState({selectedRecipient: user, users: userArr});

			this.parseMessageBuffer(data.messageBuffer);
		}

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
		this.setState({selectedRecipient: user, users: userArr});
		this.loadMessages(user, userArr);
	}

	connectSocket() {
		if (this.socket) {
			
		}
      this.socket = new WebSocket('ws://faharu.com:8000/?ch=' + this.state.channel);
	}

	componentWillMount() {
		// this.socket.onopen = () => {
		// 	console.log('conz onopen::')
		// }
		this.connectSocket();
	}

	componentDidMount() {
		// console.log('conz', this.props.user)
		this.socket.onopen = () => {
			this.getUsers((userList) => {
				// console.log('conz getUsers::', userList)
				if(userList !== null) {
					this.setState({userList: userList});
					var touchArray = []
					userList.forEach((user) => {
						touchArray.push(
							<TouchableOpacity 
								style={styles.user}
								onPress={() => { this.loadMessages(user.id); } }
							>
								<Text style={styles.username}>{user.name}</Text>
								<Image style={styles.photo} source={{uri: user.photo}} />
								<View style={styles.overlay} />
							</TouchableOpacity>
							);
					})
					this.setState({touchableOpacityArray: touchArray});
				}

			});
			
		}

	}

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