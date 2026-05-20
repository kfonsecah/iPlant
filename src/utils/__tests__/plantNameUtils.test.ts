import { getCommonNameForNameField } from "../plantNameUtils";

describe("getCommonNameForNameField", () => {
  it("should return the default name if commonNames is undefined or empty", () => {
    expect(getCommonNameForNameField(undefined, "Default")).toBe("Default");
    expect(getCommonNameForNameField("", "Default")).toBe("Default");
  });

  it("should prioritize Costa Rica if present in the commonNames string", () => {
    const commonNames = "- Costa Rica: Lengua de suegra\n- México: Sansevieria\n- Colombia: Espada de Bolívar";
    expect(getCommonNameForNameField(commonNames, "Default")).toBe("Lengua de suegra");
  });

  it("should ignore case when looking for Costa Rica", () => {
    const commonNames = "- costa rica: lengua de suegra\n- México: Sansevieria";
    expect(getCommonNameForNameField(commonNames, "Default")).toBe("Lengua de suegra");
  });

  it("should fall back to the first country if Costa Rica is not present", () => {
    const commonNames = "- México: Cuna de Moisés\n- Colombia: Espatifilo";
    expect(getCommonNameForNameField(commonNames, "Default")).toBe("Cuna de Moisés");
  });

  it("should clean leading bullets and whitespaces", () => {
    const commonNames = "  - Costa Rica:   Lirio de la paz  ";
    expect(getCommonNameForNameField(commonNames, "Default")).toBe("Lirio de la paz");
  });

  it("should fall back to first line if no colon is present", () => {
    const commonNames = "- Hiedra inglesa";
    expect(getCommonNameForNameField(commonNames, "Default")).toBe("Hiedra inglesa");
  });
});
