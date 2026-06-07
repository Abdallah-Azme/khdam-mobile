import { sessionEvents } from './session-events';

describe('sessionEvents', () => {
  it('notifies active subscribers and supports unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = sessionEvents.subscribe(listener);

    sessionEvents.emitExpired();
    unsubscribe();
    sessionEvents.emitExpired();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
