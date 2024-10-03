const eventMap = new Map();

let rootElement = null;

export function setupEventListeners(root) {
  rootElement = root;

  if (rootElement) {
    eventMap.forEach((_, eventType) => {
      rootElement.removeEventListener(eventType, handleEvent, true);
    });
  }

  eventMap.forEach((_, eventType) => {
    rootElement.addEventListener(eventType, handleEvent, true);
  });
}

function handleEvent(event) {
  let target = event.target;

  while (target && target !== rootElement) {
    const handlers = eventMap.get(event.type);
    if (handlers) {
      const handler = handlers.get(target);
      if (handler) {
        handler(event);
        if (event.cancelBubble) {
          break;
        }
      }
    }
    target = target.parentNode;
  }
}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(eventType)) {
    eventMap.set(eventType, new Map());
  }

  const handlers = eventMap.get(eventType);
  handlers.set(element, handler);

  if (rootElement && !rootElement.hasAttribute(`data-listener-${eventType}`)) {
    rootElement.addEventListener(eventType, handleEvent, true);
    rootElement.setAttribute(`data-listener-${eventType}`, true);
  }
}

export function removeEvent(element, eventType, handler) {
  const handlers = eventMap.get(eventType);
  if (handlers) {
    if (handlers.get(element) === handler) {
      handlers.delete(element);
    }

    if (handlers.size === 0) {
      eventMap.delete(eventType);
      if (rootElement && rootElement.hasAttribute(`data-listener-${eventType}`)) {
        rootElement.removeEventListener(eventType, handleEvent, true);
        rootElement.removeAttribute(`data-listener-${eventType}`);
      }
    }
  }
}
