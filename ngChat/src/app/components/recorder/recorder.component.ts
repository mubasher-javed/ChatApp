/// <reference types="@types/dom-mediacapture-record" />

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-recorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.css'],
})
export class RecorderComponent implements OnInit {
  private recorder!: MediaRecorder;
  private gumStream!: any;

  constructor() {}

  ngOnInit(): void {}

  toggleRecording() {
    if (this.recorder && this.recorder.state == 'recording') {
      this.recorder.stop();
      this.gumStream.getAudioTracks()[0].stop();
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        this.gumStream = stream;
        this.recorder = new MediaRecorder(stream);
        this.recorder.ondataavailable = (e) => {
          let url = URL.createObjectURL(e.data);
          console.log('received data is', e.data);
          let preview = document.createElement('audio');
          preview.controls = true;
          preview.src = url;
          document.body.appendChild(preview);
        };
        this.recorder.start();
      });
  }
}
