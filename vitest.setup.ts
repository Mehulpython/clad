import "@testing-library/jest-dom/vitest";

// Mock Next.js
const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: mockBack,
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({}),
}));

// Mock Clerk
vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: "test-user-123" }),
}));

// Mock environment
process.env.OPENAI_API_KEY = "test-key";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test";
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

beforeEach(() => {
  vi.clearAllMocks();
});
