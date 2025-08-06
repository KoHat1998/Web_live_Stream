# LiveStreamTube

A live streaming web application built with Node.js, Express, and WebRTC.

## Features

- Live video + audio broadcast from browser (WebRTC)
- Multiple viewers can watch in real time
- Simple broadcaster and viewer pages

## Getting Started

### Prerequisites

- Node.js (v16 or above recommended)
- npm

### Installation

1. Install dependencies:

    ```
    npm install
    ```

2. Start the server:

    ```
    node server.js
    ```

3. Open your browser:
    - **Broadcaster:** [http://localhost:5000/](http://localhost:5000/)
    - **Viewer:** [http://localhost:5000/viewer.html](http://localhost:5000/viewer.html)

### Deployment

- Deploy easily on [Render](https://render.com/) or similar services.
- Make sure the server uses `process.env.PORT || 5000`.