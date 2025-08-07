let peer = null;

const iceServers = [
  { urls: [ "stun:ss-turn1.xirsys.com" ]
}, {
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
    document.getElementById('watch-live').onclick = startWatch;
    document.getElementById('stop-watch').onclick = stopWatch;
}

function startWatch() {
    document.getElementById('status').innerText = "Connecting...";
    peer = createPeer();
    document.getElementById('watch-live').disabled = true;
    document.getElementById('stop-watch').disabled = false;
}

function stopWatch() {
    if (peer) {
        peer.close();
        peer = null;
    }
    document.getElementById("video").srcObject = null;
    document.getElementById('watch-live').disabled = false;
    document.getElementById('stop-watch').disabled = true;
    document.getElementById('status').innerText = "🛑 Not watching.";
}

function createPeer() {
    const peerConnection = new RTCPeerConnection({ iceServers });
    peerConnection.addTransceiver("video", { direction: "recvonly" });
    peerConnection.addTransceiver("audio", { direction: "recvonly" });
    peerConnection.ontrack = handleTrackEvent;
    peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(peerConnection);
    return peerConnection;
}

async function handleNegotiationNeededEvent(peerConnection) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const payload = {
        sdp: peerConnection.localDescription
    };
    const { data } = await axios.post('/consumer', payload);
    const desc = new RTCSessionDescription(data.sdp);
    peerConnection.setRemoteDescription(desc).catch(e => console.log(e));
    document.getElementById('status').innerText = "📺 Watching live!";
}

function handleTrackEvent(e) {
    document.getElementById("video").srcObject = e.streams[0];
}
