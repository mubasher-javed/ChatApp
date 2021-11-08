import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { ChatService } from 'src/app/services/chat.service';
import { UserService } from 'src/app/services/user.service';
import { CommonUser, UserMessage } from 'src/app/user.interface';

@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  styleUrls: ['./chat-screen.component.css'],
})
export class ChatScreenComponent implements OnInit {
  imageForm: FormGroup;
  videoForm: FormGroup;
  message = '';
  messages: UserMessage[] = [];
  receiverId!: string;
  receiver!: CommonUser;
  roomId!: any;
  uploader!: FileUploader;
  imgSrc = '';
  recordingDuration = 0;
  isRecording = false;
  recordingBtnTxt = 'Start recording';
  private recorder!: MediaRecorder;
  private gumStream!: any;
  private timer: any;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private route: ActivatedRoute,
    public fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.imageForm = this.fb.group({
      image: [null],
    });

    this.videoForm = this.fb.group({
      video: [null],
    });
  }

  ngOnInit(): void {
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
  }

  handleVideoUpload(event: any) {
    // @ts-ignore
    const file = (event?.target as HTMLInputElement)?.files[0];
    this.videoForm.patchValue({
      video: file,
    });
    this.videoForm.get('video')?.updateValueAndValidity();
  }

  uploadImage(event: any) {
    // @ts-ignore
    const file = (event?.target as HTMLInputElement)?.files[0];
    this.imageForm.patchValue({
      image: file,
    });
    this.imageForm.get('image')?.updateValueAndValidity();
  }

  submitVideoForm() {
    let currentUser = this.userService.getCurrentUser();
    let uploadedVideo = this.videoForm.get('video')?.value;
    let formData = new FormData();
    formData.set('video', uploadedVideo);
    formData.append('senderId', currentUser._id);
    formData.append('receiverId', this.receiverId);
    formData.append('roomId', this.roomId.roomId);
    this.userService.sendVideo(formData).subscribe(
      (res: any) => {
        // if video uploaded successfully then emit an event for server
        if (res.success) {
          console.log('response after video upload is', res);
          this.videoForm.reset({ video: null });
          let data = {
            videoPath: res.data.videoPath,
            receiver: this.receiver,
            sender: currentUser,
            roomId: this.roomId,
          };
          this.chatService.sendMessage(data);
        }
      },
      (error) => console.error(error)
    );
  }

  submitImageForm() {
    let uploadedImg = this.imageForm.get('image')?.value;
    let currentUser = this.userService.getCurrentUser();
    let formData = new FormData();
    formData.set('image', uploadedImg);
    formData.append('senderId', currentUser._id);
    formData.append('receiverId', this.receiverId);
    formData.append('roomId', this.roomId.roomId);

    this.userService.sendImage(formData).subscribe(
      (res: any) => {
        // if picture is saved successfully show the picture preview in messages
        if (res.success) {
          // emit a new event with new-image name
          let data = {
            imgPath: res.data.imgPath,
            receiver: this.receiver,
            sender: currentUser,
            roomId: this.roomId,
          };
          this.chatService.sendMessage(data);
        }
      },
      (error) => console.log(error)
    );
  }

  sendMessage() {
    let currentUser = this.userService.getCurrentUser();
    console.log('message is', this.message);
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
          console.log('sending this room id', this.roomId);
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
}
