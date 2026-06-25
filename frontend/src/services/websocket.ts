export class SessionWebSocket {
  private ws: WebSocket;
  private onMessage: (msg: any) => void;

  constructor(code: string, onMessage: (msg: any) => void) {
    this.onMessage = onMessage;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.ws = new WebSocket(`${protocol}//${host}/ws/${code}`);
    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.onMessage(msg);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };
    this.ws.onclose = () => {
      console.log('WS closed');
    };
  }

  close() {
    this.ws.close();
  }
}
