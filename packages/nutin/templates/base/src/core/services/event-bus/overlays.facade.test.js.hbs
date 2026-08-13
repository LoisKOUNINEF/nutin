import { Overlays, AppEventBus } from '#root/dist/src/core/index.js';

describe('OverlaysFacade (Overlays)', () => {
  afterEach(() => {
    AppEventBus.cleanupEventListeners();
  });

  it('modalOpened emits "modal-opened"', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Overlays.modalOpened();
    expect(emit).toHaveBeenCalledWith('modal-opened');
    emit.restore();
  });

  it('onModalOpened subscribes to "modal-opened", and the returned unsubscribe removes it', () => {
    let called = 0;
    const unsubscribe = Overlays.onModalOpened(() => called++);

    Overlays.modalOpened();
    expect(called).toBe(1);

    unsubscribe();
    Overlays.modalOpened();
    expect(called).toBe(1);
  });

  it('modalClosed emits "modal-closed"', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Overlays.modalClosed();
    expect(emit).toHaveBeenCalledWith('modal-closed');
    emit.restore();
  });

  it('onModalClosed subscribes to "modal-closed", and the returned unsubscribe removes it', () => {
    let called = 0;
    const unsubscribe = Overlays.onModalClosed(() => called++);

    Overlays.modalClosed();
    expect(called).toBe(1);

    unsubscribe();
    Overlays.modalClosed();
    expect(called).toBe(1);
  });

  it('overlayOpened emits "overlay-opened" with { type }', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Overlays.overlayOpened('tooltip');
    expect(emit).toHaveBeenCalledWith('overlay-opened', { type: 'tooltip' });
    emit.restore();
  });

  it('onOverlayOpened subscribes to "overlay-opened", and the returned unsubscribe removes it', () => {
    let received = null;
    const unsubscribe = Overlays.onOverlayOpened((data) => { received = data; });

    Overlays.overlayOpened('tooltip');
    expect(received).toEqual({ type: 'tooltip' });

    unsubscribe();
    received = null;
    Overlays.overlayOpened('modal');
    expect(received).toBe(null);
  });

  it('overlayClosed emits "overlay-closed" with { type }', () => {
    const emit = spyOn(AppEventBus, 'emit');
    Overlays.overlayClosed('tooltip');
    expect(emit).toHaveBeenCalledWith('overlay-closed', { type: 'tooltip' });
    emit.restore();
  });

  it('onOverlayClosed subscribes to "overlay-closed", and the returned unsubscribe removes it', () => {
    let received = null;
    const unsubscribe = Overlays.onOverlayClosed((data) => { received = data; });

    Overlays.overlayClosed('tooltip');
    expect(received).toEqual({ type: 'tooltip' });

    unsubscribe();
    received = null;
    Overlays.overlayClosed('modal');
    expect(received).toBe(null);
  });
});
