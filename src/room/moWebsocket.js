var g_mc_ws_component = {
    ws: null,
    // url: 'ws://127.0.0.1:3000/signal',
    url: 'wss://minjae0webrtc.herokuapp.com/signal',
    init: function () {

    },
    connect: function (url, onExternalMessage) {
        this.url = url || this.url;
        
        this.ws = new WebSocket(this.url);
        this.ws.onopen = this.onConnected;
        this.ws.onmessage = onExternalMessage || this.onMessage;
        this.ws.onclose = this.onClosed;
    },
    sendMessage: function (txt) {
        if (this.ws != null) {
            this.ws.send(txt);
        } else {
            alert('connection not established, please connect.');
        }
    },
    disconnect: function () {
        if (this.ws != null) {
            this.ws.close();
            this.ws = null;
        }
    },
    onConnected: function () {
        console.info('Info: connection opened.');
    },
    onMessage: function (event) {
        console.info('Received: ' + event.data);
    },
    onClosed: function (event) {
        console.info('Info: connection closed.');
        console.info(event);
    }
};