import { expect } from "chai";
import { findDuplicates, getSymetricalDifference } from "./helpers";

describe("helpers", () => {
  describe("findDuplicates", () => {
    it("should return expected duplicates from string array", () => {
      const result = findDuplicates(["one", "two", "one", "three", "two"]);
      expect(result).to.deep.equal(["one", "two"]);
    });

    it("should return expected duplicates from number array", () => {
      const result = findDuplicates([1, 2, 1, 3, 2]);
      expect(result).to.deep.equal([1, 2]);
    });
  });

  describe("getSymetricalDifference", () => {
    it("should return expected symetrical different from number array", () => {
      const result = getSymetricalDifference([1, 2, 1, 3, 2], [1]);
      expect(result).to.deep.equal([2, 3]);
    });

    it("should return expected symetrical different from inverted number array", () => {
      const result = getSymetricalDifference([1], [1, 2, 1, 3, 2]);
      expect(result).to.deep.equal([2, 3]);
    });
  });
});
