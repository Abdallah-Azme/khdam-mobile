type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export const sessionEvents = {
  emitExpired() {
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: SessionExpiredListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
