import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills pour les API Web (necessaires pour les API Routes)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill streams
const { ReadableStream, TransformStream, WritableStream } = require('stream/web');
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;
global.WritableStream = WritableStream;

// MessageChannel/MessagePort polyfill
const { MessageChannel, MessagePort } = require('worker_threads');
global.MessageChannel = MessageChannel;
global.MessagePort = MessagePort;

// BroadcastChannel mock
global.BroadcastChannel = class BroadcastChannel {
  constructor(name) { this.name = name; }
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
};

// Polyfill Request/Response/Headers depuis undici
const { Request, Response, Headers, fetch } = require('undici');
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
if (!global.fetch) {
  global.fetch = fetch;
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(({ children, href, ...props }, ref) => {
      return React.createElement('a', { href, ref, ...props }, children);
    }),
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ src, alt, ...props }) => {
      return React.createElement('img', { src, alt, ...props });
    },
  };
});

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

// Mock WishlistContext - evite les appels fetch non desires
jest.mock('@/lib/WishlistContext', () => ({
  useWishlist: () => ({
    items: [],
    count: 0,
    isLoading: false,
    addToWishlist: jest.fn().mockResolvedValue(true),
    removeFromWishlist: jest.fn().mockResolvedValue(true),
    isInWishlist: jest.fn().mockReturnValue(false),
    toggleWishlist: jest.fn().mockResolvedValue(true),
    syncWishlist: jest.fn().mockResolvedValue(undefined),
  }),
  WishlistProvider: ({ children }) => children,
}));

// Mock QuickViewContext
jest.mock('@/lib/QuickViewContext', () => ({
  useQuickView: () => ({
    isOpen: false,
    product: null,
    openQuickView: jest.fn(),
    closeQuickView: jest.fn(),
  }),
  QuickViewProvider: ({ children }) => children,
}));

// Mock CompareContext
jest.mock('@/lib/CompareContext', () => ({
  useCompare: () => ({
    items: [],
    count: 0,
    addToCompare: jest.fn(),
    removeFromCompare: jest.fn(),
    clearCompare: jest.fn(),
    isInCompare: jest.fn().mockReturnValue(false),
    canAddMore: true,
  }),
  CompareProvider: ({ children }) => children,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    article: ({ children, ...props }) => <article {...props}>{children}</article>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
