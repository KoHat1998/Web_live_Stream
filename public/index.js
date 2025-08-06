let localStream = null;
let peer = null;

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
    peer = null; // Optional: More cleanup can be added if needed
    document.getElementById('go-live').disabled = false;
    document.getElementById('stop-live').disabled = true;
    document.getElementById('status').innerText = "🛑 Stream stopped.";
}

function createPeer() {
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stunprotocol.org" },
            {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject"
            }
        ]
    });
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
