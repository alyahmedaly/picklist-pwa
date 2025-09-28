import { describe, test, expect } from 'vitest';
import { parseNutrition } from '../../src/data/transform/parseNutrition.ts';
import type { Nutrition } from '../../src/data/transform/types.ts';

/** T008: Unit test for parsing Dutch CSV nutritional columns */

describe('Dutch Nutrition Parsing', () => {
  describe('Basic Column Parsing', () => {
    test('parses "Energie (kcal)" column with decimal comma', () => {
      const record = { 'Energie (kcal)': '78,5' };
      const result = parseNutrition(record);

      expect(result.kcal).toBe(78.5);
    });

    test('parses "Koolhydraten" column', () => {
      const record = { Koolhydraten: '12,2' };
      const result = parseNutrition(record);

      expect(result.carbs).toBe(12.2);
    });

    test('parses "Voedingsvezel" column', () => {
      const record = { Voedingsvezel: '2,1' };
      const result = parseNutrition(record);

      expect(result.fiber).toBe(2.1);
    });

    test('parses "Eiwitten" column', () => {
      const record = { Eiwitten: '3,1' };
      const result = parseNutrition(record);

      expect(result.protein).toBe(3.1);
    });

    test('parses "Vet" column', () => {
      const record = { Vet: '1,6' };
      const result = parseNutrition(record);

      expect(result.fat).toBe(1.6);
    });

    test('parses "Zout" column', () => {
      const record = { Zout: '0,11' };
      const result = parseNutrition(record);

      expect(result.salt).toBe(0.11);
    });
  });

  describe('Missing Values Handling', () => {
    test('handles empty string values', () => {
      const record = {
        'Energie (kcal)': '',
        Koolhydraten: '',
        Voedingsvezel: '',
      };
      const result = parseNutrition(record);

      expect(result.kcal).toBeUndefined();
      expect(result.carbs).toBeUndefined();
      expect(result.fiber).toBeUndefined();
    });

    test('handles "NA" values', () => {
      const record = {
        'Energie (kcal)': 'NA',
        Eiwitten: 'NA',
      };
      const result = parseNutrition(record);

      expect(result.kcal).toBeUndefined();
      expect(result.protein).toBeUndefined();
    });

    test('handles missing columns', () => {
      const record = { SomeOtherColumn: 'value' };
      const result = parseNutrition(record);

      expect(result.kcal).toBeUndefined();
      expect(result.carbs).toBeUndefined();
      expect(result.fiber).toBeUndefined();
      expect(result.protein).toBeUndefined();
      expect(result.fat).toBeUndefined();
      expect(result.salt).toBeUndefined();
    });
  });

  describe('Zero Values', () => {
    test('handles zero values correctly', () => {
      const record = {
        Voedingsvezel: '0',
        Zout: '0,00',
      };
      const result = parseNutrition(record);

      expect(result.fiber).toBe(0);
      expect(result.salt).toBe(0);
    });
  });

  describe('Inequality Values', () => {
    test('parses inequality "< 0,1" format', () => {
      const record = { Eiwitten: '< 0,1' };
      const result = parseNutrition(record);

      expect(result.protein).toBe(0.1);
    });

    test('parses inequality "≤ 1,5" format', () => {
      const record = { Zout: '≤ 1,5' };
      const result = parseNutrition(record);

      expect(result.salt).toBe(1.5);
    });

    test('parses various inequality formats', () => {
      const record = {
        Koolhydraten: '< 0,01',
        Voedingsvezel: '≤ 2,3',
        Eiwitten: '<0,5',
      };
      const result = parseNutrition(record);

      expect(result.carbs).toBe(0.01);
      expect(result.fiber).toBe(2.3);
      expect(result.protein).toBe(0.5);
    });
  });

  describe('Decimal Comma Normalization Integration', () => {
    test('normalizes decimal comma to dot notation', () => {
      const record = {
        'Energie (kcal)': '241,0',
        Koolhydraten: '50,5',
        Voedingsvezel: '1,7',
        Eiwitten: '7,2',
        Vet: '1,0',
        Zout: '0,9',
      };
      const result = parseNutrition(record);

      expect(result.kcal).toBe(241.0);
      expect(result.carbs).toBe(50.5);
      expect(result.fiber).toBe(1.7);
      expect(result.protein).toBe(7.2);
      expect(result.fat).toBe(1.0);
      expect(result.salt).toBe(0.9);
    });

    test('handles mixed decimal formats', () => {
      const record = {
        'Energie (kcal)': '96.5', // dot notation
        Koolhydraten: '21,0', // comma notation
        Eiwitten: '0.8', // dot notation
      };
      const result = parseNutrition(record);

      expect(result.kcal).toBe(96.5);
      expect(result.carbs).toBe(21.0);
      expect(result.protein).toBe(0.8);
    });
  });

  describe('All Dutch Nutritional Columns', () => {
    test('parses comprehensive Dutch nutrition data', () => {
      const record = {
        'Energie (kcal)': '288',
        'Energie (kJ)': '1190',
        Vet: '28,0',
        'waarvan verzadigd': '18,0',
        Koolhydraten: '4,4',
        'waarvan suikers': '4,2',
        Voedingsvezel: '0,1',
        Eiwitten: '4,6',
        Zout: '1,4',
      };
      const result = parseNutrition(record);

      expect(result.kcal).toBe(288);
      expect(result.kJ).toBe(1190);
      expect(result.fat).toBe(28.0);
      expect(result.satFat).toBe(18.0);
      expect(result.carbs).toBe(4.4);
      expect(result.sugars).toBe(4.2);
      expect(result.fiber).toBe(0.1);
      expect(result.protein).toBe(4.6);
      expect(result.salt).toBe(1.4);
    });
  });

  describe('Real Dutch Fixture Data', () => {
    test('parses yogurt nutrition from sample-nl.csv', () => {
      // Data from Campina Halfvolle yoghurt vanillesmaak (ID: 123)
      const record = {
        'Energie (kcal)': '78',
        'Energie (kJ)': '331',
        Vet: '1,6',
        'waarvan verzadigd': '1,1',
        Koolhydraten: '12,2',
        'waarvan suikers': '11',
        Eiwitten: '3,1',
        Zout: '0,11',
      };
      const result = parseNutrition(record);

      expect(result.kcal).toBe(78);
      expect(result.kJ).toBe(331);
      expect(result.fat).toBe(1.6);
      expect(result.satFat).toBe(1.1);
      expect(result.carbs).toBe(12.2);
      expect(result.sugars).toBe(11);
      expect(result.protein).toBe(3.1);
      expect(result.salt).toBe(0.11);
      expect(result.fiber).toBeUndefined(); // Not provided in this record
    });

    test('parses baguette nutrition from sample-nl.csv', () => {
      // Data from AH Franse baguettes (ID: 73)
      const record = {
        'Energie (kcal)': '241',
        'Energie (kJ)': '1023',
        Vet: '1',
        'waarvan verzadigd': '0,2',
        Koolhydraten: '50',
        'waarvan suikers': '3,3',
        Voedingsvezel: '1,7',
        Eiwitten: '7,2',
        Zout: '0,9',
      };
      const result = parseNutrition(record);

      expect(result.kcal).toBe(241);
      expect(result.kJ).toBe(1023);
      expect(result.fat).toBe(1);
      expect(result.satFat).toBe(0.2);
      expect(result.carbs).toBe(50);
      expect(result.sugars).toBe(3.3);
      expect(result.fiber).toBe(1.7);
      expect(result.protein).toBe(7.2);
      expect(result.salt).toBe(0.9);
    });
  });
});

/** T007: Enhanced Nutrition tests - MUST FAIL before implementation */
describe('parseNutrition - enhanced Nutrition (T007)', () => {
  test('should return Nutrition with unit context field', () => {
    const record = {
      'Energie (kcal)': '241',
      Koolhydraten: '50,5',
      Eiwitten: '7,2',
    };
    const result = parseNutrition(record);

    // parseNutrition now returns Nutrition directly
    expect(result).toMatchObject({
      kcal: 241,
      carbs: 50.5,
      protein: 7.2,
      unit: 'per 100g',
    } as Nutrition);
  });

  test('should include unit field for clarity', () => {
    const record = {
      Vet: '28,0',
      Zout: '1,4',
    };
    const result = parseNutrition(record);

    expect(result.unit).toBe('per 100g');
    expect(result.fat).toBe(28.0);
    expect(result.salt).toBe(1.4);
  });

  test('should preserve all existing nutrition fields with unit context', () => {
    const record = {
      'Energie (kcal)': '288',
      'Energie (kJ)': '1190',
      Vet: '28,0',
      'waarvan verzadigd': '18,0',
      Koolhydraten: '4,4',
      'waarvan suikers': '4,2',
      Voedingsvezel: '0,1',
      Eiwitten: '4,6',
      Zout: '1,4',
    };
    const result = parseNutrition(record);

    expect(result.unit).toBe('per 100g');
    expect(result.kcal).toBe(288);
    expect(result.kJ).toBe(1190);
    expect(result.fat).toBe(28.0);
    expect(result.satFat).toBe(18.0);
    expect(result.carbs).toBe(4.4);
    expect(result.sugars).toBe(4.2);
    expect(result.fiber).toBe(0.1);
    expect(result.protein).toBe(4.6);
    expect(result.salt).toBe(1.4);
  });

  test('should handle empty nutrition data with unit context', () => {
    const record = {};
    const result = parseNutrition(record);

    expect(result).toMatchObject({
      unit: 'per 100g',
    } as Nutrition);
  });

  test('should maintain unit consistency across all records', () => {
    const records = [
      { 'Energie (kcal)': '100' },
      { Eiwitten: '5,0' },
      { Koolhydraten: '15,0', Vet: '2,0' },
    ];

    records.forEach((record) => {
      const result = parseNutrition(record);
      expect(result.unit).toBe('per 100g');
    });
  });
});
