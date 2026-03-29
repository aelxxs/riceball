# Testing Guide for Riceball Commands

## Testing Strategy

### Recommended Setup: Vitest

**Why Vitest?**
- Native TypeScript support
- Fast execution with smart parallelization
- Compatible with Jest API (easy migration if needed)
- Built-in mocking utilities
- Great DX with watch mode

### Test Types

#### 1. **Unit Tests** (Recommended to start)
Test individual commands in isolation by mocking dependencies.

**Pros:**
- Fast execution
- Easy to write and maintain
- Isolates command logic
- No database setup required

**Cons:**
- Doesn't catch integration issues
- Mock complexity can grow

#### 2. **Integration Tests**
Test commands with real database interactions using a test database.

**Pros:**
- Tests real behavior
- Catches database-related issues
- More confidence in production behavior

**Cons:**
- Slower execution
- Requires database setup/teardown
- More complex test infrastructure

### Recommended Approach

Start with **unit tests** for most commands, and add **integration tests** for critical flows like:
- Shop item purchases (transactions)
- Currency transfers
- Complex data mutations

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd project/handler
pnpm add -D vitest @vitest/ui @types/node
```

### 2. Add Test Scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 3. Create Vitest Config

Create `project/handler/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.ts']
    }
  }
});
```

---

## Example Unit Tests

### Basic Command Test Pattern

Create `project/handler/tests/commands/economy/currency/name.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Database } from '@riceball/db';
import CurrencyNameCommand from '../../../../src/commands/economy/[currency]/[name]';
import type { Context } from '../../../../src/library/core';

describe('Economy Currency Name Command', () => {
  let command: CurrencyNameCommand;
  let mockDb: Database;
  let mockContext: Context;

  beforeEach(() => {
    // Create mock database
    mockDb = {
      setGuildSettings: vi.fn().mockResolvedValue(undefined),
      getGuildSettings: vi.fn(),
      rm: {} as any,
      em: {} as any,
    } as any;

    // Create command instance with mocked dependency
    command = new CurrencyNameCommand(mockDb);

    // Create mock context
    mockContext = {
      guild: { id: '123456789' },
      author: { id: '987654321' },
    } as Context;
  });

  it('should set currency name successfully', async () => {
    const result = await command.chatInputRun(mockContext, { name: 'Gold' });

    expect(mockDb.setGuildSettings).toHaveBeenCalledWith('123456789', {
      economy: { currencyName: 'Gold' }
    });
    expect(result).toContain('Gold');
  });

  it('should handle special characters in currency name', async () => {
    await command.chatInputRun(mockContext, { name: '💰 Coins' });

    expect(mockDb.setGuildSettings).toHaveBeenCalledWith('123456789', {
      economy: { currencyName: '💰 Coins' }
    });
  });
});
```

### Testing Commands with Validation

Create `project/handler/tests/commands/economy/wager/min.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Database } from '@riceball/db';
import WagerMinCommand from '../../../../src/commands/economy/[wager]/[min]';
import type { Context } from '../../../../src/library/core';

describe('Economy Wager Min Command', () => {
  let command: WagerMinCommand;
  let mockDb: Database;
  let mockContext: Context;

  beforeEach(() => {
    mockDb = {
      setGuildSettings: vi.fn().mockResolvedValue(undefined),
      getGuildSettings: vi.fn().mockResolvedValue({
        economy: {
          wagerMin: 1,
          wagerMax: 1000,
        }
      }),
      rm: {} as any,
      em: {} as any,
    } as any;

    command = new WagerMinCommand(mockDb);

    mockContext = {
      guild: { id: '123456789' },
    } as Context;
  });

  it('should set minimum wager when valid', async () => {
    const result = await command.chatInputRun(mockContext, { amount: 50 });

    expect(mockDb.setGuildSettings).toHaveBeenCalledWith('123456789', {
      economy: { wagerMin: 50 }
    });
    expect(result).toContain('50');
  });

  it('should reject when min > max', async () => {
    const result = await command.chatInputRun(mockContext, { amount: 2000 });

    expect(mockDb.setGuildSettings).not.toHaveBeenCalled();
    expect(result).toContain('cannot be greater than');
  });

  it('should allow min equal to max', async () => {
    await command.chatInputRun(mockContext, { amount: 1000 });

    expect(mockDb.setGuildSettings).toHaveBeenCalledWith('123456789', {
      economy: { wagerMin: 1000 }
    });
  });
});
```

### Testing Commands with Database Operations

Create `project/handler/tests/commands/economy/shop/archive.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Database } from '@riceball/db';
import ArchiveCommand from '../../../../src/commands/economy/[shop]/[archive]';
import type { Context } from '../../../../src/library/core';

describe('Shop Archive Command', () => {
  let command: ArchiveCommand;
  let mockDb: Database;
  let mockContext: Context;
  let mockItem: any;

  beforeEach(() => {
    mockItem = {
      _id: 'item123',
      name: 'Test Item',
      active: true,
      guildId: '123456789',
    };

    mockDb = {
      rm: {
        items: {
          find: vi.fn().mockResolvedValue([mockItem]),
          findOne: vi.fn().mockResolvedValue(mockItem),
        },
        em: {
          flush: vi.fn().mockResolvedValue(undefined),
        },
      },
    } as any;

    command = new ArchiveCommand(mockDb);
    mockContext = { guild: { id: '123456789' } } as Context;
  });

  describe('autocompleteRun', () => {
    it('should return active items matching input', async () => {
      const results = await command.autocompleteRun(mockContext, 'test');

      expect(mockDb.rm.items.find).toHaveBeenCalledWith({
        guildId: '123456789',
        active: true,
      });
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        name: 'Test Item',
        value: 'item123',
      });
    });

    it('should filter items by name', async () => {
      mockDb.rm.items.find = vi.fn().mockResolvedValue([
        { _id: '1', name: 'Apple', active: true },
        { _id: '2', name: 'Banana', active: true },
        { _id: '3', name: 'Cherry', active: true },
      ]);

      const results = await command.autocompleteRun(mockContext, 'a');

      expect(results).toHaveLength(2);
      expect(results.map(r => r.name)).toEqual(['Apple', 'Banana']);
    });

    it('should limit results to 25', async () => {
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        _id: `item${i}`,
        name: `Item ${i}`,
        active: true,
      }));
      mockDb.rm.items.find = vi.fn().mockResolvedValue(manyItems);

      const results = await command.autocompleteRun(mockContext, '');

      expect(results).toHaveLength(25);
    });
  });

  describe('chatInputRun', () => {
    it('should archive an active item', async () => {
      const result = await command.chatInputRun(mockContext, { item: 'item123' });

      expect(mockItem.active).toBe(false);
      expect(mockDb.rm.em.flush).toHaveBeenCalled();
      expect(result).toContain('archived');
      expect(result).toContain('Test Item');
    });

    it('should return error when item not found', async () => {
      mockDb.rm.items.findOne = vi.fn().mockResolvedValue(null);

      const result = await command.chatInputRun(mockContext, { item: 'nonexistent' });

      expect(result).toContain('not found');
      expect(mockDb.rm.em.flush).not.toHaveBeenCalled();
    });

    it('should return error when item already archived', async () => {
      mockItem.active = false;

      const result = await command.chatInputRun(mockContext, { item: 'item123' });

      expect(result).toContain('already archived');
      expect(mockDb.rm.em.flush).not.toHaveBeenCalled();
    });
  });
});
```

---

## Integration Tests (Optional, Advanced)

For integration tests, you'll need to set up a test database. Here's an example approach:

### Setup Test Database Helper

Create `project/handler/tests/helpers/test-db.ts`:

```typescript
import { MikroORM } from '@mikro-orm/mongodb';
import { setupDatabase } from '@riceball/db';

let orm: MikroORM | null = null;

export async function setupTestDb() {
  orm = await setupDatabase({
    mongoUrl: process.env.TEST_MONGO_URL || 'mongodb://localhost:27017/riceball-test',
    redisUrl: process.env.TEST_REDIS_URL || 'redis://localhost:6379/1',
  });
  return orm;
}

export async function clearTestDb() {
  if (orm) {
    const collections = await orm.em.getDriver().getConnection().db?.collections();
    if (collections) {
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
  }
}

export async function closeTestDb() {
  if (orm) {
    await orm.close();
    orm = null;
  }
}
```

### Integration Test Example

Create `project/handler/tests/integration/shop-archive.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { Database } from '@riceball/db';
import { setupTestDb, clearTestDb, closeTestDb } from '../helpers/test-db';
import ArchiveCommand from '../../src/commands/economy/[shop]/[archive]';

describe('Shop Archive Integration', () => {
  let db: Database;
  let command: ArchiveCommand;

  beforeAll(async () => {
    await setupTestDb();
    db = container.resolve(Database);
    command = new ArchiveCommand(db);
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  it('should archive item and persist to database', async () => {
    // Create test item
    const item = db.rm.items.create({
      _id: 'test-item',
      guildId: '123',
      name: 'Test Item',
      price: 100,
      active: true,
    });
    await db.rm.em.persistAndFlush(item);

    // Archive item
    const result = await command.chatInputRun(
      { guild: { id: '123' } } as any,
      { item: 'test-item' }
    );

    // Verify result
    expect(result).toContain('archived');

    // Verify in database
    const archivedItem = await db.rm.items.findOne({ _id: 'test-item' });
    expect(archivedItem?.active).toBe(false);
  });
});
```

---

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run specific test file
pnpm test commands/economy/currency/name.test.ts

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

---

## Best Practices

1. **Test Organization**
   - Mirror source structure in tests
   - One test file per command file
   - Group related tests with `describe`

2. **Mocking Strategy**
   - Mock at the boundary (Database, external APIs)
   - Don't mock internal utilities
   - Use `vi.fn()` for tracking calls

3. **Test Coverage Goals**
   - Aim for 80%+ coverage on command logic
   - 100% on validation/error handling
   - Integration tests for critical paths

4. **What to Test**
   - ✅ Success cases
   - ✅ Validation errors
   - ✅ Edge cases (boundary values, empty inputs)
   - ✅ Error messages contain useful info
   - ✅ Database operations called correctly
   - ❌ Don't test framework code (tsyringe, mikro-orm)

5. **Test Data**
   - Use factories or fixtures for complex objects
   - Use realistic but fake IDs (Discord snowflakes are 17-19 digits)
   - Avoid magic numbers

---

## Continuous Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - uses: codecov/codecov-action@v3
        if: always()
```

---

## Next Steps

1. Install Vitest and setup config
2. Start with unit tests for simple commands (currency name, enable/disable)
3. Add tests for validation logic (min/max amounts)
4. Add tests for database operations (archive, delete)
5. Consider integration tests for complex flows
6. Set up CI/CD to run tests automatically

Testing will help catch bugs early and make refactoring safer!
