import { getConfidenceColor, getConfidenceLabel } from "../ConfidenceBadge.styles";

// Mock react-native
jest.mock('react-native', () => ({
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

describe('ConfidenceBadge logic', () => {
  describe('getConfidenceColor', () => {
    it('should return green for high confidence (>=70%)', () => {
      expect(getConfidenceColor(70)).toBe('#22C55E');
      expect(getConfidenceColor(95)).toBe('#22C55E');
    });

    it('should return yellow for medium confidence (40-69%)', () => {
      expect(getConfidenceColor(40)).toBe('#EAB308');
      expect(getConfidenceColor(69)).toBe('#EAB308');
      expect(getConfidenceColor(50)).toBe('#EAB308');
    });

    it('should return red for low confidence (<40%)', () => {
      expect(getConfidenceColor(0)).toBe('#EF4444');
      expect(getConfidenceColor(39)).toBe('#EF4444');
    });
  });

  describe('getConfidenceLabel', () => {
    it('should return "Alta" for high confidence', () => {
      expect(getConfidenceLabel(70)).toBe('Alta');
    });

    it('should return "Media" for medium confidence', () => {
      expect(getConfidenceLabel(40)).toBe('Media');
    });

    it('should return "Baja" for low confidence', () => {
      expect(getConfidenceLabel(39)).toBe('Baja');
    });
  });
});
