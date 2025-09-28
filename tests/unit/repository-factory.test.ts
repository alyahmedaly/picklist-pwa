/**
 * Repository Factory Unit Tests
 * Feature: 020-migration-kysely / T026
 *
 * Unit tests for repository factory with runtime detection, singleton pattern,
 * error handling, and TypeScript interfaces.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RepositoryFactory,
  getRepositoryFactory,
  createRepositoryFactory,
  checkRepositoryHealth,
  getDatabaseFeatures,
  type DatabaseFeatures,
  type RepositoryHealthStatus,
  RepositoryFactoryError,
  RepositoryCreationError,
  FeatureDetectionError
} from '../../src/db/kysely/repository-factory.ts';

// Type helpers for mocking
type MockRepository = {
  checkHealth: ReturnType<typeof vi.fn>;
};

type MockConnection = {
  execute: ReturnType<typeof vi.fn>;
};

// Mock the connection module to control test behavior
vi.mock('../../src/db/kysely/connection.js', () => ({
  getKyselyConnection: vi.fn(),
  KyselyConnectionError: class extends Error {}
}));

// Mock the repository modules
vi.mock('../../src/db/repositories/ProductRepository.js', () => ({
  createProductRepository: vi.fn()
}));

vi.mock('../../src/db/repositories/CategoryRepository.js', () => ({
  createCategoryRepository: vi.fn()
}));

describe('RepositoryFactory', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Reset singleton state
    const factory = getRepositoryFactory();
    factory.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const factory1 = RepositoryFactory.getInstance();
      const factory2 = RepositoryFactory.getInstance();
      
      expect(factory1).toBe(factory2);
    });

    it('should use configuration only on first call', () => {
      const factory1 = RepositoryFactory.getInstance({ enableCaching: false });
      const factory2 = RepositoryFactory.getInstance({ enableCaching: true });
      
      expect(factory1).toBe(factory2);
    });

    it('should provide convenience getter function', () => {
      const factory1 = getRepositoryFactory();
      const factory2 = getRepositoryFactory();
      
      expect(factory1).toBe(factory2);
      expect(factory1).toBeInstanceOf(RepositoryFactory);
    });
  });

  describe('Factory Configuration', () => {
    it('should use default configuration when none provided', () => {
      const factory = getRepositoryFactory();
      
      expect(factory).toBeDefined();
      expect(typeof factory.getProductRepository).toBe('function');
      expect(typeof factory.getCategoryRepository).toBe('function');
      expect(typeof factory.getSearchRepository).toBe('function');
    });

    it('should accept custom configuration', () => {
      const factory = createRepositoryFactory({
        enableCaching: false,
        enableHealthChecks: true,
        healthCheckInterval: 5000
      });
      
      expect(factory).toBeInstanceOf(RepositoryFactory);
    });
  });

  describe('Repository Creation', () => {
    it('should create ProductRepository instance', async () => {
      const mockRepository = {
        checkHealth: vi.fn().mockResolvedValue(true)
      };
      
      const { createProductRepository } = await import('../../src/db/repositories/ProductRepository.js');
      vi.mocked(createProductRepository).mockResolvedValue(mockRepository as unknown as Awaited<ReturnType<typeof createProductRepository>>);

      const factory = getRepositoryFactory();
      const repository = await factory.getProductRepository();
      
      expect(repository).toBe(mockRepository);
      expect(createProductRepository).toHaveBeenCalledOnce();
    });

    it('should create CategoryRepository instance', async () => {
      const mockRepository = {
        checkHealth: vi.fn().mockResolvedValue(true)
      };
      
      const { createCategoryRepository } = await import('../../src/db/repositories/CategoryRepository.js');
      vi.mocked(createCategoryRepository).mockResolvedValue(mockRepository as unknown as Awaited<ReturnType<typeof createCategoryRepository>>);

      const factory = getRepositoryFactory();
      const repository = await factory.getCategoryRepository();
      
      expect(repository).toBe(mockRepository);
      expect(createCategoryRepository).toHaveBeenCalledOnce();
    });

    it('should create SearchRepository stub when module not available', async () => {
      const factory = getRepositoryFactory();
      const repository = await factory.getSearchRepository();
      
      expect(repository).toBeDefined();
      expect(await repository.isAvailable()).toBe(false);
      expect(repository.checkHealth).toBeDefined();
      expect(typeof repository.checkHealth).toBe('function');
    });

    it('should cache repository instances when caching enabled', async () => {
      const mockProductRepository = { checkHealth: vi.fn().mockResolvedValue(true) };
      const mockCategoryRepository = { checkHealth: vi.fn().mockResolvedValue(true) };
      
      const { createProductRepository } = await import('../../src/db/repositories/ProductRepository.js');
      const { createCategoryRepository } = await import('../../src/db/repositories/CategoryRepository.js');
      
      vi.mocked(createProductRepository).mockResolvedValue(mockProductRepository as unknown as MockRepository);
      vi.mocked(createCategoryRepository).mockResolvedValue(mockCategoryRepository as unknown as MockRepository);

      const factory = createRepositoryFactory({ enableCaching: true });
      
      const product1 = await factory.getProductRepository();
      const product2 = await factory.getProductRepository();
      const category1 = await factory.getCategoryRepository();
      const category2 = await factory.getCategoryRepository();
      
      expect(product1).toBe(product2);
      expect(category1).toBe(category2);
      expect(createProductRepository).toHaveBeenCalledTimes(1);
      expect(createCategoryRepository).toHaveBeenCalledTimes(1);
    });

    it('should not cache when caching disabled', async () => {
      const mockRepository = { checkHealth: vi.fn().mockResolvedValue(true) };
      
      const { createProductRepository } = await import('../../src/db/repositories/ProductRepository.js');
      vi.mocked(createProductRepository).mockResolvedValue(mockRepository as unknown as MockRepository);

      const factory = createRepositoryFactory({ enableCaching: false });
      
      const repository1 = await factory.getProductRepository();
      const repository2 = await factory.getProductRepository();
      
      expect(repository1).toBe(mockRepository);
      expect(repository2).toBe(mockRepository);
      expect(createProductRepository).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw RepositoryCreationError when ProductRepository creation fails', async () => {
      const { createProductRepository } = await import('../../src/db/repositories/ProductRepository.js');
      vi.mocked(createProductRepository).mockRejectedValue(new Error('Database connection failed'));

      const factory = getRepositoryFactory();
      
      await expect(factory.getProductRepository()).rejects.toThrow(RepositoryCreationError);
      await expect(factory.getProductRepository()).rejects.toThrow('Failed to create ProductRepository repository');
    });

    it('should throw RepositoryCreationError when CategoryRepository creation fails', async () => {
      const { createCategoryRepository } = await import('../../src/db/repositories/CategoryRepository.js');
      vi.mocked(createCategoryRepository).mockRejectedValue(new Error('Schema validation failed'));

      const factory = getRepositoryFactory();
      
      await expect(factory.getCategoryRepository()).rejects.toThrow(RepositoryCreationError);
      await expect(factory.getCategoryRepository()).rejects.toThrow('Failed to create CategoryRepository repository');
    });

    it('should handle SearchRepository creation gracefully', async () => {
      // SearchRepository doesn't exist, but should not throw - returns stub instead
      const factory = getRepositoryFactory();
      const repository = await factory.getSearchRepository();
      
      expect(repository).toBeDefined();
      expect(await repository.isAvailable()).toBe(false);
    });

    it('should provide proper error hierarchy', () => {
      const baseError = new RepositoryFactoryError('Base error');
      const creationError = new RepositoryCreationError('TestRepository');
      const detectionError = new FeatureDetectionError('test-feature');
      
      expect(baseError).toBeInstanceOf(Error);
      expect(baseError).toBeInstanceOf(RepositoryFactoryError);
      
      expect(creationError).toBeInstanceOf(Error);
      expect(creationError).toBeInstanceOf(RepositoryFactoryError);
      expect(creationError).toBeInstanceOf(RepositoryCreationError);
      
      expect(detectionError).toBeInstanceOf(Error);
      expect(detectionError).toBeInstanceOf(RepositoryFactoryError);
      expect(detectionError).toBeInstanceOf(FeatureDetectionError);
    });
  });

  describe('Runtime Feature Detection', () => {
    it('should detect database features', async () => {
      const mockConnection = {
        execute: vi.fn()
      };
      
      // Mock different feature detection queries
      mockConnection.execute
        .mockResolvedValueOnce({ rows: [{ count: 3 }] }) // Core tables
        .mockResolvedValueOnce({ rows: [{ count: 1 }] }) // Search tables
        .mockResolvedValueOnce({ rows: [{ count: 0 }] }) // FTS
        .mockResolvedValueOnce({ rows: [{ count: 2 }] }); // Nested set model

      const { getKyselyConnection } = await import('../../src/db/kysely/connection.js');
      vi.mocked(getKyselyConnection).mockResolvedValue(mockConnection as unknown as MockConnection);

      const factory = getRepositoryFactory();
      const features = await factory.getFeatures();
      
      expect(features).toEqual({
        hasCoreTables: true,
        hasSearchTables: true,
        hasFTS: false,
        hasNestedSetModel: true,
        detectedAt: expect.any(Number)
      });
    });

    it('should cache feature detection results', async () => {
      const mockConnection = {
        execute: vi.fn().mockResolvedValue({ rows: [{ count: 3 }] })
      };
      
      const { getKyselyConnection } = await import('../../src/db/kysely/connection.js');
      vi.mocked(getKyselyConnection).mockResolvedValue(mockConnection as unknown as MockConnection);

      const factory = getRepositoryFactory();
      const features1 = await factory.getFeatures();
      const features2 = await factory.getFeatures();
      
      expect(features1).toBe(features2);
      expect(getKyselyConnection).toHaveBeenCalledTimes(1);
    });

    it('should handle feature detection errors gracefully', async () => {
      const { getKyselyConnection } = await import('../../src/db/kysely/connection.js');
      vi.mocked(getKyselyConnection).mockRejectedValue(new Error('Connection failed'));

      const factory = getRepositoryFactory();
      
      await expect(factory.getFeatures()).rejects.toThrow(FeatureDetectionError);
    });

    it('should provide convenience function for feature detection', async () => {
      const mockConnection = {
        execute: vi.fn().mockResolvedValue({ rows: [{ count: 0 }] })
      };
      
      const { getKyselyConnection } = await import('../../src/db/kysely/connection.js');
      vi.mocked(getKyselyConnection).mockResolvedValue(mockConnection as unknown as MockConnection);

      const features = await getDatabaseFeatures();
      
      expect(features).toBeDefined();
      expect(features.detectedAt).toBeTypeOf('number');
    });
  });

  describe('Health Checks', () => {
    it('should perform comprehensive health check', async () => {
      const mockProductRepository = { checkHealth: vi.fn().mockResolvedValue(true) };
      const mockCategoryRepository = { checkHealth: vi.fn().mockResolvedValue(true) };
      const mockConnection = {
        execute: vi.fn().mockResolvedValue({ rows: [{ count: 3 }] })
      };
      
      const { createProductRepository } = await import('../../src/db/repositories/ProductRepository.js');
      const { createCategoryRepository } = await import('../../src/db/repositories/CategoryRepository.js');
      const { getKyselyConnection } = await import('../../src/db/kysely/connection.js');
      
      vi.mocked(createProductRepository).mockResolvedValue(mockProductRepository as unknown as MockRepository);
      vi.mocked(createCategoryRepository).mockResolvedValue(mockCategoryRepository as unknown as MockRepository);
      vi.mocked(getKyselyConnection).mockResolvedValue(mockConnection as unknown as MockConnection);

      const factory = getRepositoryFactory();
      const healthStatus = await factory.checkHealth();
      
      expect(healthStatus.healthy).toBe(false); // Search repo returns false
      expect(healthStatus.repositories.product).toBe(true);
      expect(healthStatus.repositories.category).toBe(true);
      expect(healthStatus.repositories.search).toBe(false); // Stub implementation
      expect(healthStatus.features).toBeDefined();
      expect(healthStatus.checkedAt).toBeTypeOf('number');
    });

    it('should handle health check failures', async () => {
      const { createProductRepository } = await import('../../src/db/repositories/ProductRepository.js');
      vi.mocked(createProductRepository).mockRejectedValue(new Error('Connection failed'));

      const factory = getRepositoryFactory();
      const healthStatus = await factory.checkHealth();
      
      expect(healthStatus.healthy).toBe(false);
      expect(healthStatus.repositories.product).toBe(false);
      expect(healthStatus.errors).toBeDefined();
      expect(healthStatus.errors![0]).toContain('ProductRepository');
    });

    it('should provide convenience function for health check', async () => {
      const mockConnection = {
        execute: vi.fn().mockResolvedValue({ rows: [{ count: 0 }] })
      };
      
      const { getKyselyConnection } = await import('../../src/db/kysely/connection.js');
      vi.mocked(getKyselyConnection).mockResolvedValue(mockConnection as unknown as MockConnection);

      const healthStatus = await checkRepositoryHealth();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.checkedAt).toBeTypeOf('number');
    });
  });

  describe('Factory Reset', () => {
    it('should reset factory state', async () => {
      const mockRepository = { checkHealth: vi.fn().mockResolvedValue(true) };
      
      const { createProductRepository } = await import('../../src/db/repositories/ProductRepository.js');
      vi.mocked(createProductRepository).mockResolvedValue(mockRepository as unknown as MockRepository);

      const factory = createRepositoryFactory({ enableCaching: true });
      
      // Create repository instance
      const repository1 = await factory.getProductRepository();
      expect(repository1).toBe(mockRepository);
      
      // Reset factory
      factory.reset();
      
      // Create repository again - should call create function again
      const repository2 = await factory.getProductRepository();
      expect(repository2).toBe(mockRepository);
      expect(createProductRepository).toHaveBeenCalledTimes(2);
    });

    it('should reset cached feature detection', async () => {
      const mockConnection = {
        execute: vi.fn().mockResolvedValue({ rows: [{ count: 3 }] })
      };
      
      const { getKyselyConnection } = await import('../../src/db/kysely/connection.js');
      vi.mocked(getKyselyConnection).mockResolvedValue(mockConnection as unknown as MockConnection);

      const factory = getRepositoryFactory();
      
      // Get features
      await factory.getFeatures();
      expect(getKyselyConnection).toHaveBeenCalledTimes(1);
      
      // Reset and get features again
      factory.reset();
      await factory.getFeatures();
      expect(getKyselyConnection).toHaveBeenCalledTimes(2);
    });
  });

  describe('TypeScript Interfaces', () => {
    it('should implement IRepositoryFactory interface', () => {
      const factory = getRepositoryFactory();
      
      expect(typeof factory.getProductRepository).toBe('function');
      expect(typeof factory.getCategoryRepository).toBe('function');
      expect(typeof factory.getSearchRepository).toBe('function');
      expect(typeof factory.checkHealth).toBe('function');
      expect(typeof factory.getFeatures).toBe('function');
      expect(typeof factory.reset).toBe('function');
    });

    it('should provide proper TypeScript types for features', async () => {
      const mockConnection = {
        execute: vi.fn().mockResolvedValue({ rows: [{ count: 1 }] })
      };
      
      const { getKyselyConnection } = await import('../../src/db/kysely/connection.js');
      vi.mocked(getKyselyConnection).mockResolvedValue(mockConnection as unknown as MockConnection);

      const factory = getRepositoryFactory();
      const features: DatabaseFeatures = await factory.getFeatures();
      
      // TypeScript should enforce these properties
      expect(typeof features.hasCoreTables).toBe('boolean');
      expect(typeof features.hasSearchTables).toBe('boolean');
      expect(typeof features.hasFTS).toBe('boolean');
      expect(typeof features.hasNestedSetModel).toBe('boolean');
      expect(typeof features.detectedAt).toBe('number');
    });

    it('should provide proper TypeScript types for health status', async () => {
      const factory = getRepositoryFactory();
      const healthStatus: RepositoryHealthStatus = await factory.checkHealth();
      
      // TypeScript should enforce these properties
      expect(typeof healthStatus.healthy).toBe('boolean');
      expect(typeof healthStatus.repositories.product).toBe('boolean');
      expect(typeof healthStatus.repositories.category).toBe('boolean');
      expect(typeof healthStatus.repositories.search).toBe('boolean');
      expect(typeof healthStatus.checkedAt).toBe('number');
      expect(healthStatus.features).toBeDefined();
    });
  });
});