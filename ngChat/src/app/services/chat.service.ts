import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { UserMessage } from '../user.interface';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatURL = 'http://localhost:3001';
  private socket!: Socket;

  constructor() {
    this.socket = io(this.chatURL, { transports: ['websocket'] });
  }

  sendMessage(data: any) {
    this.socket.emit('new-message', data);
  }

  joinRoom(roomId: string) {
    this.socket.emit('join', roomId);
  }

  getMessages() {
    return new Observable<UserMessage>((observer) => {
      this.socket.on('new-message', (data: UserMessage) => {
        console.log('received data from backed is', data);
        observer.next(data);
      });
    });
  }
}
