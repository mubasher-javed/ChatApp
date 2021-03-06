import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import isMobile from 'src/app/screenSize.utils';
import { ChatService } from 'src/app/services/chat.service';
import { UserService } from 'src/app/services/user.service';
import { CommonUser, UserMessage } from 'src/app/user.interface';

@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  styleUrls: ['./chat-screen.component.css'],
})
export class ChatScreenComponent implements OnInit {
  message = '';
  messages: UserMessage[] = [];
  receiverId!: string;
  receiver!: CommonUser;
  roomId!: any;
  recordingDuration = 0;
  isRecording = false;
  recordingBtnTxt = 'Start recording';
  mobile = false;
  progress: number = 0;
  previewImgUrl = '';
  previewVidUrl = '';
  private recorder!: MediaRecorder;
  private gumStream!: any;
  private timer: any;
  private fileName!: string;
  private file!: File;
  private uploadPreset = 'wjsxo0gr';
  private fileExt!: string;
  private validImgFormats = ['png', 'jpeg', 'jpg', 'gif'];
  private validVidFormats = ['mp4'];

  @ViewChild('scrollBox', { static: true }) scrollContainer!: ElementRef;
  @ViewChild('fileUpload') selectedFiles!: ElementRef;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // getDivHeight().subscribe((result) => console.log('div height is', result));
    isMobile().subscribe((result) => (this.mobile = result));
    // get the user data from route
    this.route.params.subscribe((params: Params) => {
      this.receiverId = params.id;
      this.userService.getUser(this.receiverId).subscribe((user: any) => {
        this.receiver = user;
        let currentUser = this.userService.getCurrentUser();

        const usersData = {
          senderId: currentUser._id,
          receiverId: this.receiver._id,
        };
        // expecting room id from this
        this.userService.createRoom(usersData).subscribe((roomId) => {
          this.roomId = roomId;
          this.chatService.joinRoom(this.roomId);
        });

        // load sender and receiver chats from backend API

        this.userService.loadMessages(usersData).subscribe((data: any) => {
          let userMessages: UserMessage[] = [];
          data.forEach((m: any) => {
            userMessages.push(m);
          });
          this.messages = userMessages;
        });
      });
    });

    this.chatService.getMessages().subscribe((message) => {
      return this.messages.push(message);
    });

    this.scrollToBottom();
  }

  handleFileChange(fileUpload: HTMLInputElement) {
    this.file = fileUpload.files![0];
    this.fileName = fileUpload.files![0].name;
    this.fileExt = this.fileName.split('.')[1];
    const reader = new FileReader();

    // mean user selected the image
    if (this.validImgFormats.includes(this.fileExt)) {
      reader.onload = () => {
        this.previewImgUrl = reader.result as string;
      };
      reader.readAsDataURL(this.file);
      return;
    }

    // mean user selected the video
    else if (this.validVidFormats.includes(this.fileExt)) {
      reader.onload = () => {
        this.previewVidUrl = reader.result as string;
      };
      reader.readAsDataURL(this.file);
      return;
    }
  }

  handleFileSubmit() {
    // it mean user want to upload an image
    if (this.validImgFormats.includes(this.fileExt)) {
      this.matImgSubmit();
      return;
    }

    // mean user want to upload a video
    if (this.validVidFormats.includes(this.fileExt)) {
      this.matVideoSubmit();
      return;
    }
  }

  private matVideoSubmit() {
    let currentUser = this.userService.getCurrentUser();
    let uploadedVideo = this.file;
    let formData = new FormData();
    formData.set('file', uploadedVideo);
    formData.append('senderId', currentUser._id);
    formData.append('receiverId', this.receiverId);
    formData.append('roomId', this.roomId.roomId);
    formData.append('upload_preset', this.uploadPreset);

    this.userService.sendVidOnline(formData).subscribe(
      (event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Response:
            let res = event.body;
            console.log('response while saving video is', res);

            let data = {
              videoPath: res.secure_url,
              receiver: this.receiver,
              sender: currentUser,
              roomId: this.roomId,
            };
            // now send request to backend to save video address locally
            this.userService.sendVideoLocally(data).subscribe((res: any) => {
              console.log(res);
              if (res.success) {
                this.progress = 0;
                this.previewImgUrl = '';
                this.previewVidUrl = '';
                this.chatService.sendMessage(data);
              }
            });
            break;
          case HttpEventType.UploadProgress:
            if (event.total) {
              this.progress = Math.round((event.loaded / event.total) * 100);
            }
            break;

          default:
            break;
        }
      },
      (error) => console.error(error)
    );
  }

  private matImgSubmit() {
    let uploadedImg = this.file;
    let currentUser = this.userService.getCurrentUser();
    let formData = new FormData();
    formData.set('file', uploadedImg);
    formData.append('senderId', currentUser._id);
    formData.append('receiverId', this.receiverId);
    formData.append('roomId', this.roomId.roomId);
    formData.append('upload_preset', this.uploadPreset);

    this.userService.sendImage(formData).subscribe(
      (event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Response:
            let res = event.body;
            let data = {
              imgPath: res.secure_url,
              receiver: this.receiver,
              sender: currentUser,
              roomId: this.roomId,
            };
            // now send call to express backend to save the image path for next time
            this.userService.saveImageLocally(data).subscribe((res: any) => {
              if (res.success) {
                this.chatService.sendMessage(data);
                this.progress = 0;
                this.previewImgUrl = '';
                this.previewVidUrl = '';
                this.selectedFiles.nativeElement.files = [];
              }
            });
            break;
          case HttpEventType.UploadProgress:
            if (event.total) {
              this.progress = Math.round((event.loaded / event.total) * 100);
            }
            break;

          default:
            break;
        }
      },
      (error) => console.log(error)
    );
  }

  sendMessage() {
    let currentUser = this.userService.getCurrentUser();
    let data = {
      message: this.message,
      receiver: this.receiver,
      sender: currentUser,
      roomId: this.roomId,
    };
    this.chatService.sendMessage(data);
    this.message = '';
  }

  toggleRecording() {
    if (this.recorder && this.recorder.state == 'recording') {
      this.recorder.stop();
      this.isRecording = false;
      this.recordingBtnTxt = 'Start recording';
      clearInterval(this.timer);
      this.recordingDuration = 0;
      this.gumStream.getAudioTracks()[0].stop();
      return;
    }
    console.log('recording started');
    this.timer = setInterval(() => {
      this.recordingDuration++;
    }, 1000);

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        this.gumStream = stream;

        let currentUser = this.userService.getCurrentUser();
        let formData = new FormData();

        this.recorder = new MediaRecorder(stream);
        this.recorder.ondataavailable = (e) => {
          formData.set('audio', e.data);
          formData.append('senderId', currentUser._id);
          formData.append('receiverId', this.receiverId);
          formData.append('roomId', this.roomId);
          this.userService.sendAudio(formData).subscribe((res: any) => {
            if (res.success) {
              let data = {
                audioPath: res.data.audioPath,
                receiver: this.receiver,
                sender: currentUser,
                roomId: this.roomId,
              };

              this.chatService.sendMessage(data);
              console.log('audio save res', res);
            }
          });
        };
        this.recorder.start();
        this.recordingBtnTxt = 'Stop recording!';
        this.isRecording = true;
      });
  }

  scrollToBottom() {
    // commenting for now and moving forward
    let height = this.scrollContainer.nativeElement.scrollHeight;
    this.scrollContainer.nativeElement.scroll({
      top: height,
      left: 0,
      behavior: 'smooth',
    });
  }
}
