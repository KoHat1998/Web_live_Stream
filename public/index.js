let localStream = null;
let peer = null;

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

window.onload = () => {
    document.getElementById('go-live').onclick = startLive;
    document.getElementById('stop-live').onclick = stopLive;
}

async function startLive() {
    document.getElementById('status').innerText = "Starting stream...";
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById("video").srcObject = localStream;
        peer = createPeer();
        localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
        document.getElementById('go-live').disabled = true;
        document.getElementById('stop-live').disabled = false;
        document.getElementById('status').innerText = "🔴 Live!";
    } catch (e) {
        document.getElementById('status').innerText = "Error: " + e.message;
    }
}

function stopLive() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        document.getElementById("video").srcObject = null;
        localStream = null;
    }
    peer = null;
    document.getElementById('go-live').disabled = false;
    document.getElementById('stop-live').disabled = true;
    document.getElementById('status').innerText = "🛑 Stream stopped.";
}

function createPeer() {
    const peerConnection = new RTCPeerConnection({ iceServers });
    peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(peerConnection);
    return peerConnection;
}

async function handleNegotiationNeededEvent(peerConnection) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const payload = {
        sdp: peerConnection.localDescription
    };
    const { data } = await axios.post('/broadcast', payload);
    const desc = new RTCSessionDescription(data.sdp);
    peerConnection.setRemoteDescription(desc).catch(e => console.log(e));
}
