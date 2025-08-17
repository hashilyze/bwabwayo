import React, { Component } from 'react';
import OpenViduVideoComponent from './OvVideo';
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore';
import './UserVideo.css';

export default class UserVideoComponent extends Component<{ 
  streamManager: any ,
  user: String
}> {
    
  getNicknameTag() {
    const { currentSelectedRoom } = useChatRoomStore.getState();
    if (currentSelectedRoom) {
      return currentSelectedRoom.userNickname;
    }
    return JSON.parse(this.props.streamManager.stream.connection.data).clientData;
  }

  render() {
    return (
      <div className="w-full h-full">
        {this.props.streamManager ? (
          <div className="streamcomponent w-full h-full">
            <OpenViduVideoComponent streamManager={this.props.streamManager} />
            <div>
              <p>{this.props.user}</p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}