import { routes } from "@/lib/routes";

describe("routes", () => {
  it("builds static hrefs", () => {
    expect(routes.home()).toBe("/");
    expect(routes.review()).toBe("/review");
  });

  it("builds parameterised hrefs", () => {
    expect(routes.book("b1")).toEqual({ pathname: "/book/[bookId]", params: { bookId: "b1" } });
    expect(routes.unit("u1")).toEqual({ pathname: "/unit/[unitId]", params: { unitId: "u1" } });
    expect(routes.lesson("l1")).toEqual({ pathname: "/lesson/[lessonId]", params: { lessonId: "l1" } });
  });
});
