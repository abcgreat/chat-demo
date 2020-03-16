import React, { Component } from 'react'
import Chatkit from '@pusher/chatkit-client'
import MessageList from './MessageList'
import SendMessageForm from './SendMessageForm'
import TypingIndicator from './TypingIndicator'
import WhosOnlineList from './WhosOnlineList'

class ChatScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
          currentUser: {},
          currentRoom: {},
          messages: [],
          usersWhoAreTyping: [],
        }

        this.sendMessage = this.sendMessage.bind(this)
        this.sendTypingEvent = this.sendTypingEvent.bind(this)
      }
      
      sendMessage(text) {
         this.state.currentUser.sendMessage({
           text,
           roomId: this.state.currentRoom.id,
         })
      }

      sendTypingEvent() {
        this.state.currentUser
          .isTypingIn({ roomId: this.state.currentRoom.id })
          .catch(error => console.error('error', error))
      }

      componentDidMount () {
        const chatManager = new Chatkit.ChatManager({
          instanceLocator: 'v1:us1:c44f94c0-2358-4c15-9b8d-aa680590b88b',
          userId: this.props.currentUsername,
          tokenProvider: new Chatkit.TokenProvider({
            url: 'http://localhost:3001/authenticate',
          }),
        })
      
        chatManager
          .connect()
          .then(currentUser => {
            this.setState({ currentUser })
                return currentUser.subscribeToRoom({
                    roomId: "d90e8f94-8cc1-48ce-8773-302315f35f81",
                    messageLimit: 100,
                    hooks: {
                        onMessage: message => {
                            this.setState({
                            messages: [...this.state.messages, message],
                            })
                        },
                        onUserStartedTyping: user => {
                            this.setState({
                              usersWhoAreTyping: [...this.state.usersWhoAreTyping, user.name],
                           })
                          },
                          onUserStoppedTyping: user => {
                            this.setState({
                              usersWhoAreTyping: this.state.usersWhoAreTyping.filter(
                                username => username !== user.name
                              ),
                            })
                          },
                          onPresenceChange: () => this.forceUpdate(),
                    },
                })
            })
            .then(currentRoom => {
              this.setState({ currentRoom })
            })
         .catch(error => console.error('error', error))
      }

  render() {
    const styles = {
        container: {
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        },
        chatContainer: {
          display: 'flex',
          flex: 1,
        },
        whosOnlineListContainer: {
          width: '300px',
          flex: 'none',
          padding: 20,
          backgroundColor: '#2c303b',
          color: 'white',
        },
        chatListContainer: {
          padding: 20,
          width: '85%',
          display: 'flex',
          flexDirection: 'column',
        },
      }
      
      return (
        <div style={styles.container}>
          <div style={styles.chatContainer}>
            <aside style={styles.whosOnlineListContainer}>
            <WhosOnlineList
              currentUser={this.state.currentUser}
              users={this.state.currentRoom.users}
            />
            </aside>
            <section style={styles.chatListContainer}>
                <MessageList
                messages={this.state.messages}
                style={styles.chatList}
                />
                <TypingIndicator usersWhoAreTyping={this.state.usersWhoAreTyping} />
                <SendMessageForm 
                    onSubmit={this.sendMessage} 
                    onChange={this.sendTypingEvent}
                />
            </section>
          </div>
        </div>
      )
  }
}

export default ChatScreen