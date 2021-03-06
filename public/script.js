const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443',
    config: {
        'iceServers': [
            {
                'urls': 'turn:numb.viagenie.ca?transport=udp',
                'username': 'gargapoorv12@gmail.com',
                'credential': 'MerRatio12'
            },
            { 'urls': 'stun:stun.l.google.com:19302' },
            { "url": 'stun:stun1.l.google.com:19302' }
        ]
    }
})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
    // input value
    let text = $("input");
    // when press enter send message
    $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val(), USERNAME);
            text.val('')
        }
    });
    socket.on("createMessage", (message, username) => {
        $("ul").append(`<li class="message"><b>${username}</b><br/>${message}</li>`);
        scrollToBottom()
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

// Get username prompt if not present
$(document).ready(function () {
    if (USERNAME) {
        console.log("Welcome !!", USERNAME)
    } else {
        setTimeout(function () {
            $('#getUserName').modal('show');
        }, 2000);
    }
})

// get User name from form
const getUserNameBtn = () => {
    var userForm = document.getElementById('nameForm');
    var formData = new FormData(userForm)

    USERNAME = formData.get('name')
    console.log('Welcome !,', USERNAME)
    $('#getUserName').modal('hide');
}

// Send Email Invite 
const sendEmailInvite = () => {
    var inviteForm = document.getElementById('inviteForm');
    var formData = new FormData(inviteForm)

    // Validation of 'to' input
    var toIDs = formData.get('to').split(',').map(toid => toid.trim());
    // simple regex check for email id
    var re = /\S+@\S+\.\S+/;
    for (const toid of toIDs) {
        console.log(re.test(toid))
        if (!re.test(toid)) {
            alert('One or more invitee email id is incorrect!!')
            return
        }
    }

    // subject for the email
    var sbj = `Join Kall room - from ${formData.get('sender')}`
    // body of the email
    var msg = `HI, <br> This is ${formData.get('sender')}, I am using Kall. Please join the Kall room by clicking <a href=${window.location.href}>here</a>`

    formData.append('msg', msg)
    formData.append('sbj', sbj)
    const data = new URLSearchParams(formData);

    fetch('/invite', {
        method: "POST",
        body: data
    }).then((res) => {
        alert(res.body)
        $('#emailInvite').modal('hide');
    }).catch((error) => {
        alert(error)
    })

}
