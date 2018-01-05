var constraints = {
    audio: false,
    video: true
};

var video = document.querySelector('video');

// adaptor.js 사용
function successCallback(stream) {
      var videoTracks = stream.getVideoTracks();
      var audioTracks = stream.getAudioTracks();
      window.stream = stream;
      video.srcObject = stream;
}
    
function errorCallback(error){
    console.log('navigator.getUserMedia error : ', error);
}

// 기존 콜백 대신 promise 사용
var promise = navigator.mediaDevices.getUserMedia(constraints);
promise.then(successCallback, errorCallback);
