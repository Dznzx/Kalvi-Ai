
type EventCallback = (payload: any) => void;

class RealtimeService {
  private subscribers: Map<string, Set<EventCallback>> = new Map();

  // Simulate WebSocket subscription
  subscribe(channel: string, callback: EventCallback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)?.add(callback);
    console.log(`[Realtime] Subscribed to ${channel}`);
  }

  unsubscribe(channel: string, callback: EventCallback) {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel)?.delete(callback);
      if (this.subscribers.get(channel)?.size === 0) {
        this.subscribers.delete(channel);
      }
    }
  }

  // Simulate Server-Side Event Emit
  // In a real app, this would be triggered by a WebSocket message from the server
  emit(channel: string, event: { type: string; payload: any }) {
    console.log(`[Realtime] Event on ${channel}:`, event);
    const channelSubs = this.subscribers.get(channel);
    if (channelSubs) {
      channelSubs.forEach(cb => cb(event));
    }
  }
}

export const realtimeService = new RealtimeService();
