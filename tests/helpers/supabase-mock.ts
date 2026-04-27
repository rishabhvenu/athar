import { vi, type Mock } from "vitest";

export type TestUser = {
  id: string;
  email?: string;
};

export type QueryResult<TData = unknown> = {
  data: TData | null;
  error: Error | null;
};

export type SupabaseChain<TData = unknown> = {
  insert: Mock<(values: unknown) => SupabaseChain<TData>>;
  select: Mock<(columns?: string) => SupabaseChain<TData>>;
  eq: Mock<(column: string, value: unknown) => SupabaseChain<TData>>;
  order: Mock<
    (column: string, options?: { ascending?: boolean }) => Promise<QueryResult<TData[]>>
  >;
  single: Mock<() => Promise<QueryResult<TData>>>;
};

type RpcHandler = (args: Record<string, unknown>) => QueryResult<unknown> | Promise<QueryResult<unknown>>;

type SupabaseMockOptions = {
  user?: TestUser | null;
  queries?: Record<string, SupabaseChain<unknown>>;
  rpc?: Record<string, RpcHandler>;
};

export function createQueryChain<TData = unknown>(
  singleResult: QueryResult<TData> = { data: null, error: null },
  orderedResult: QueryResult<TData[]> = { data: [], error: null }
): SupabaseChain<TData> {
  const chain = {
    insert: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
  } as SupabaseChain<TData>;

  chain.insert.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockResolvedValue(orderedResult);
  chain.single.mockResolvedValue(singleResult);

  return chain;
}

export function buildSupabaseMock({ user = { id: "user-1" }, queries = {}, rpc = {} }: SupabaseMockOptions = {}) {
  const from = vi.fn((table: string) => queries[table] ?? createQueryChain());
  const rpcMock = vi.fn((name: string, args: Record<string, unknown>) => {
    const handler = rpc[name];
    return handler ? handler(args) : Promise.resolve({ data: [], error: null });
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from,
    rpc: rpcMock,
  };
}
