let peer = null;

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
    const peerConnection = new RTCPeerConnection({
    iceServers: [
        { urls: "stun:stunprotocol.org" },
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
        },
        {
            urls: "turn:global.relay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
        }
    ]
});

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
