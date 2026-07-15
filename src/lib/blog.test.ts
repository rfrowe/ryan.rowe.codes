import { describe, expect, it } from "vitest";
import { formatDisplayDate, parsePostDate } from "./blog";

describe("formatDisplayDate", () => {
  it("renders the author-local day as a long-form date", () => {
    expect(formatDisplayDate(parsePostDate("2022-03-12T02:51:10.000-08:00"))).toBe("March 12, 2022");
    expect(formatDisplayDate(parsePostDate("2017-01-01"))).toBe("January 1, 2017");
  });

  it("drops the leading zero on single-digit days", () => {
    expect(formatDisplayDate(parsePostDate("2026-07-05"))).toBe("July 5, 2026");
  });

  it("reads the day off the string, so an offset can't shift it a day", () => {
    // Late-evening author-local time with a negative offset: the UTC instant is the next
    // calendar day, but the displayed date must stay the author's day.
    expect(formatDisplayDate(parsePostDate("2022-03-12T23:30:00-08:00"))).toBe("March 12, 2022");
  });
});
