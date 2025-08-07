const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");

let senderStream;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const iceServers = [
  { urls: [ "stun:ss-turn1.xirsys.com" ] },
  {
    username: "i4ZrjB737SBvzAuBytor5ByRL1wlwInKspSxUsvccOtE3Xzb4cu_ELZK73SuOeV2AAAAAGiUD_9Lb0hhdA==",
    credential: "9ec69d0c-7336-11f0-99a0-0242ac140004",
    urls: [
      "turn:ss-turn1.xirsys.com:80?transport=udp",
      "turn:ss-turn1.xirsys.com:3478?transport=udp",
      "turn:ss-turn1.xirsys.com:80?transport=tcp",
      "turn:ss-turn1.xirsys.com:3478?transport=tcp",
      "turns:ss-turn1.xirsys.com:443?transport=tcp",
      "turns:ss-turn1.xirsys.com:5349?transport=tcp"
    ]
  }
];

app.post("/consumer", async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection({ iceServers });
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream && senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = { sdp: peer.localDescription }
    res.json(payload);
});

app.post('/broadcast', async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection({ iceServers });
    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = { sdp: peer.localDescription }
    res.json(payload);
});

function handleTrackEvent(e, peer) {
    senderStream = e.streams[0];
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('server started on port ' + PORT)
    console.log(`for broadcaster: http://localhost:${PORT}`);
    console.log(`for viewer: http://localhost:${PORT}/viewer.html`);
});
