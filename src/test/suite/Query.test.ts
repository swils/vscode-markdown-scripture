import * as _ from "lodash";
import { expect } from "chai";
import * as Query from "../../Query";

describe("Query", function() {
  function range({ fc, fv, tc, tv }: any = {}): Query.Range {
    return {
      from: { chapter: fc || 1, verse: fv || 1 },
      to: { chapter: tc || fc || 1, verse: tv || fv || 1 },
    };
  }

  function result({ b, ...rng }: any = {}): Query.Query {
    return {
      book: b || "jn",
      ranges: [ range(rng) ]
    };
  }

  describe(".parse", function() {
    interface QueryParseTestCase {
      title?: string;
      query: string;
      result: Query.Query | undefined;
    }

    const cases: QueryParseTestCase[] = [
      { query: "[jn#1:1]", result: result() },
      { query: "[jn#1:1-4]", result: result({ tv: 4 }) },
      {
        query: "[jn#1:1,4,10]",
        result: {
          book: "jn",
          ranges: [ range(), range({ fv: 4 }), range({ fv: 10 }) ]
        }
      },
      { title: "filters out space", query: "  [   jn  # 1 : 1  ]  ", result: result() },
      {
        query: "[can1939/jn#3:5,3-4,3-6,4:5-5:1]",
        result: {
          book: "can1939/jn",
          ranges: [
            range({ fc: 3, fv: 5 }),
            range({ fc: 3, fv: 3, tv: 4 }),
            range({ fc: 3, fv: 3, tv: 6 }),
            range({ fc: 4, fv: 5, tc: 5, tv: 1 })
          ]
        }
      },
      {
        // Not sure if this case *should* be working. But it does so let's
        // document it for now.
        title: "parses out-of-order ranges",
        query: "[jn#5:1-2:1]",
        result: result({ fc: 5, fv: 1, tc: 2, tv: 1}) },
      { query: "[jn#]", result: undefined },
      { query: "[jn#1]", result: undefined },  // This should be ok. See #1 in Github.
    ];
    cases.forEach(function({ title, query, result }) {
      it(title || `handles ${query}`, function() {
        expect(Query.parse(query)).to.deep.equal(result);
      });
    });
  });

  describe(".rangesToString", function() {
    interface QueryRangesToStringTestCase {
      title?: string;
      ranges: Query.Range[];
      result: string;
    }

    const cases: QueryRangesToStringTestCase[] = [
      { ranges: [ range() ], result: "1:1" },
      { ranges: [ range({ tv: 2 }) ], result: "1:1-2" },
      { ranges: [ range({ tv: 2 }), range({ fv: 5, tv: 6 }) ], result: "1:1-2,5-6" },
      { ranges: [ range({ fc: 1, fv: 1, tc: 3, tv: 3 }), range({ fc: 4, fv: 5 }) ], result: "1:1-3:3,4:5" },
    ];

    cases.forEach(function ({ title, ranges, result}) {
      it(title || `converts ${result} to a range string`, function() {
        expect(Query.rangesToString(ranges)).to.deep.equal(result);
      });
    });
  });

  describe(".toString", function() {
    interface QueryToStringTestCase {
      title?: string;
      query: Query.Query;
      result: string;
    }

    const cases: QueryToStringTestCase[] = [
      {
        query: {
          book: "can1939/jn",
          ranges: [
            range({ fc: 1, fv: 1, tc: 3, tv: 3 }),
            range({ fc: 4, fv: 5 })
          ],
        },
        result: "Jn 1:1-3:3,4:5"
      },
    ];

    cases.forEach(function ({ query, result}) {
      it(`converts ${result} to a range string`, function() {
        expect(Query.toString(query)).to.deep.equal(result);
      });
    });
  });
});